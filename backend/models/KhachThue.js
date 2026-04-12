const { pool } = require("../config/db");
const bcrypt = require("bcryptjs");

class KhachThue {
  static normalizeKhachThue(row) {
    if (!row) return null;
    return {
      ...row,
      _id: row.id.toString(),
      anhCCCD: {
        matTruoc: row.anhCCCD_matTruoc || "",
        matSau: row.anhCCCD_matSau || "",
      },
      hopDongHienTai: row.hopDongHienTai || null,
      hopDongHienTaiList: row.hopDongHienTaiList || [],
    };
  }

  static async hydrateCurrentContracts(rows) {
    if (!rows?.length) {
      return rows;
    }

    const tenantIds = rows.map((row) => row.id);
    const placeholders = tenantIds.map(() => "?").join(", ");
    const [contractRows] = await pool.execute(
      `SELECT hkt.khachThue_id, h.id as hopDong_id, h.maHopDong,
                    p.id as phong_id, p.maPhong,
                    t.id as toaNha_id, t.tenToaNha
             FROM HopDong_KhachThue hkt
             INNER JOIN HopDong h ON h.id = hkt.hopDong_id
             INNER JOIN Phong p ON p.id = h.phong_id
             LEFT JOIN ToaNha t ON t.id = p.toaNha_id
             WHERE hkt.khachThue_id IN (${placeholders})
               AND h.trangThai = 'hoatDong'
             ORDER BY h.ngayBatDau DESC, h.id DESC`,
      tenantIds,
    );

    const contractMap = contractRows.reduce((acc, row) => {
      const key = row.khachThue_id.toString();
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push({
        _id: row.hopDong_id.toString(),
        maHopDong: row.maHopDong,
        phong: {
          _id: row.phong_id.toString(),
          maPhong: row.maPhong || "N/A",
          toaNha: {
            _id: row.toaNha_id?.toString() || "",
            tenToaNha: row.tenToaNha || "N/A",
          },
        },
      });
      return acc;
    }, {});

    for (const row of rows) {
      const contracts = contractMap[row.id.toString()] || [];
      row.hopDongHienTaiList = contracts;
      row.hopDongHienTai = contracts[0] || null;
    }

    return rows;
  }

  static async findAll(filters) {
    let query = "SELECT * FROM KhachThue WHERE 1=1";
    const params = [];

    if (filters?.trangThai) {
      query += " AND trangThai = ?";
      params.push(filters.trangThai);
    }

    query += " ORDER BY ngayCapNhat DESC";
    const [rows] = await pool.execute(query, params);
    await this.hydrateCurrentContracts(rows);
    return rows.map((row) => this.normalizeKhachThue(row));
  }

  static async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM KhachThue WHERE id = ?", [
      id,
    ]);
    await this.hydrateCurrentContracts(rows);
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

    const matTruoc = data.anhCCCD_matTruoc || anhCCCD?.matTruoc || null;
    const matSau = data.anhCCCD_matSau || anhCCCD?.matSau || null;

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

    if (data.anhCCCD) {
      if (data.anhCCCD.matTruoc !== undefined)
        data.anhCCCD_matTruoc = data.anhCCCD.matTruoc;
      if (data.anhCCCD.matSau !== undefined)
        data.anhCCCD_matSau = data.anhCCCD.matSau;
      delete data.anhCCCD;
    }

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
    const [result] = await pool.execute("DELETE FROM KhachThue WHERE id = ?", [
      id,
    ]);
    return result.affectedRows;
  }
}

module.exports = KhachThue;
