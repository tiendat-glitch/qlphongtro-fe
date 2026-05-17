const { pool } = require("../config/db");
const bcrypt = require("bcryptjs");

class KhachThue {
  static normalizeKhachThue(row) {
    if (!row) return null;
    return {
      ...row,
      anhCCCD_matTruoc: row.anhCCCD_matTruoc || "",
      anhCCCD_matSau: row.anhCCCD_matSau || "",
    };
  }

  static async findAll(filters) {
    let query = `
      SELECT kt.*, 
             h.id as hopDong_id, h.maHopDong,
             p.id as phong_id, p.maPhong,
             t.id as toaNha_id, t.tenToaNha
      FROM KhachThue kt
      LEFT JOIN HopDong_KhachThue hkt ON kt.id = hkt.khachThue_id
      LEFT JOIN HopDong h ON h.id = hkt.hopDong_id AND h.trangThai = 'hoatDong'
      LEFT JOIN Phong p ON p.id = h.phong_id
      LEFT JOIN ToaNha t ON t.id = p.toaNha_id
      WHERE 1=1
    `;
    const params = [];

    if (filters?.trangThai) {
      query += " AND kt.trangThai = ?";
      params.push(filters.trangThai);
    }

    query += " ORDER BY kt.ngayCapNhat DESC";
    const [rows] = await pool.execute(query, params);
    
    // De-duplicate in JS to avoid SQL GROUP BY errors and prevent React unique key warnings
    const uniqueTenants = [];
    const seenIds = new Set();
    
    for (const row of rows) {
      if (!seenIds.has(row.id)) {
        seenIds.add(row.id);
        uniqueTenants.push(this.normalizeKhachThue(row));
      }
    }
    
    return uniqueTenants;
  }

  static async findById(id) {
    const query = `
      SELECT kt.*, 
             h.id as hopDong_id, h.maHopDong,
             p.id as phong_id, p.maPhong,
             t.id as toaNha_id, t.tenToaNha
      FROM KhachThue kt
      LEFT JOIN HopDong_KhachThue hkt ON kt.id = hkt.khachThue_id
      LEFT JOIN HopDong h ON h.id = hkt.hopDong_id AND h.trangThai = 'hoatDong'
      LEFT JOIN Phong p ON p.id = h.phong_id
      LEFT JOIN ToaNha t ON t.id = p.toaNha_id
      WHERE kt.id = ?
    `;
    const [rows] = await pool.execute(query, [id]);
    return this.normalizeKhachThue(rows[0]);
  }

  static async findByCCCD(cccd) {
    const [rows] = await pool.execute(
      "SELECT * FROM KhachThue WHERE cccd = ?",
      [cccd],
    );
    return rows[0];
  }

  static async findByPhone(soDienThoai) {
    const trimmed = soDienThoai?.trim() || "";
    const [rows] = await pool.execute(
      "SELECT * FROM KhachThue WHERE soDienThoai = ?",
      [trimmed],
    );
    return rows[0];
  }

  static async findByEmail(email) {
    if (!email) return null;
    const [rows] = await pool.execute(
      "SELECT * FROM KhachThue WHERE email = ?",
      [email],
    );
    return rows[0];
  }

  static async isRepresentative(id) {
    const [rows] = await pool.execute(
      "SELECT id, maHopDong FROM HopDong WHERE nguoiDaiDien_id = ? LIMIT 1",
      [id],
    );
    return rows.length > 0 ? rows[0] : null;
  }

  static async create(data) {
    const {
      hoTen,
      soDienThoai,
      email,
      cccd,
      ngaySinh,
      gioiTinh,
      queQuan,
      anhCCCD,
      ngheNghiep,
      trangThai,
    } = data;

    const matTruoc = data.anhCCCD_matTruoc || null;
    const matSau = data.anhCCCD_matSau || null;

    let formattedNgaySinh = null;
    if (ngaySinh) {
      formattedNgaySinh = new Date(ngaySinh).toISOString().split("T")[0];
    }

    let hashedMatKhau = null;
    if (data.matKhau) {
      const salt = await bcrypt.genSalt(10);
      hashedMatKhau = await bcrypt.hash(data.matKhau, salt);
    }

    const [result] = await pool.execute(
      `INSERT INTO KhachThue
            (hoTen, soDienThoai, email, cccd, ngaySinh, gioiTinh, queQuan, anhCCCD_matTruoc, anhCCCD_matSau, ngheNghiep, trangThai, matKhau)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        hoTen,
        soDienThoai,
        email || null,
        cccd,
        formattedNgaySinh,
        gioiTinh,
        queQuan,
        matTruoc,
        matSau,
        ngheNghiep || null,
        trangThai || "chuaThue",
        hashedMatKhau,
      ],
    );
    return result.insertId;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    const validFields = [
      "hoTen",
      "soDienThoai",
      "email",
      "cccd",
      "ngaySinh",
      "gioiTinh",
      "queQuan",
      "anhCCCD_matTruoc",
      "anhCCCD_matSau",
      "ngheNghiep",
      "trangThai",
      "matKhau",
    ];

    // Deleted anhCCCD handling

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && validFields.includes(key)) {
        fields.push(`${key} = ?`);
        if (key === "ngaySinh") {
          values.push(
            value ? new Date(value).toISOString().split("T")[0] : null,
          );
        } else if (key === "matKhau") {
          const salt = await bcrypt.genSalt(10);
          const hashed = await bcrypt.hash(value, salt);
          values.push(hashed);
        } else {
          values.push(value);
        }
      }
    }

    if (fields.length === 0) return 0;

    values.push(id);
    const query = `UPDATE KhachThue SET ${fields.join(", ")} WHERE id = ?`;
    const [result] = await pool.execute(query, values);
    return result.affectedRows;
  }

  static async delete(id) {
    // 1. Kiểm tra xem khách có đang là người đại diện của hợp đồng nào không
    const representativeOf = await this.isRepresentative(id);
    if (representativeOf) {
      throw new Error(
        `Khong the xoa khach thue nay vi ho dang la nguoi dai dien cua hop dong ${representativeOf.maHopDong}. Vui long thay doi nguoi dai dien cua hop dong truoc khi xoa.`,
      );
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 2. Xóa liên kết trong bảng HopDong_KhachThue
      await connection.execute(
        "DELETE FROM HopDong_KhachThue WHERE khachThue_id = ?",
        [id],
      );

      // 3. Xóa khách thuê
      const [result] = await connection.execute(
        "DELETE FROM KhachThue WHERE id = ?",
        [id],
      );

      await connection.commit();
      return result.affectedRows;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = KhachThue;
