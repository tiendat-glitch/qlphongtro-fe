const { pool } = require("../config/db");

class HoaDon {
  static normalizeHoaDon(row) {
    if (!row) return null;
    console.log("--- normalizeHoaDon raw row:", JSON.stringify(row, null, 2));
    return {
      ...row,
      phiDichVu: row.phiDichVu
        ? typeof row.phiDichVu === "string"
          ? JSON.parse(row.phiDichVu)
          : row.phiDichVu
        : [],
    };
  }

  static async findAll(filters) {
    let query =
      "SELECT hd.*, p.maPhong, k.hoTen as tenKhachThue, h.maHopDong FROM HoaDon hd LEFT JOIN Phong p ON hd.phong_id = p.id LEFT JOIN KhachThue k ON hd.khachThue_id = k.id LEFT JOIN HopDong h ON hd.hopDong_id = h.id WHERE 1=1";
    let params = [];

    if (filters && filters.trangThai) {
      query += " AND hd.trangThai = ?";
      params.push(filters.trangThai);
    }
    if (filters && filters.hopDong_id) {
      query += " AND hd.hopDong_id = ?";
      params.push(filters.hopDong_id);
    }
    if (filters && filters.thang && filters.nam) {
      query += " AND hd.thang = ? AND hd.nam = ?";
      params.push(filters.thang, filters.nam);
    }

    query += " ORDER BY hd.nam DESC, hd.thang DESC, hd.ngayTao DESC";
    const [rows] = await pool.execute(query, params);
    return rows.map((row) => this.normalizeHoaDon(row));
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      "SELECT hd.*, p.maPhong, k.hoTen as tenKhachThue, h.maHopDong FROM HoaDon hd LEFT JOIN Phong p ON hd.phong_id = p.id LEFT JOIN KhachThue k ON hd.khachThue_id = k.id LEFT JOIN HopDong h ON hd.hopDong_id = h.id WHERE hd.id = ?",
      [id],
    );
    return this.normalizeHoaDon(rows[0]);
  }

  static async create(data) {
    const {
      maHoaDon,
      hopDong_id,
      phong_id,
      khachThue_id,
      thang,
      nam,
      tienPhong,
      tienDien,
      soDien,
      chiSoDienBanDau,
      chiSoDienCuoiKy,
      tienNuoc,
      soNuoc,
      chiSoNuocBanDau,
      chiSoNuocCuoiKy,
      phiDichVu,
      tongTien,
      daThanhToan,
      conLai,
      trangThai,
      hanThanhToan,
      ghiChu,
    } = data;

    let formattedHanThanhToan = null;
    try {
      if (hanThanhToan) {
        formattedHanThanhToan = new Date(hanThanhToan)
          .toISOString()
          .split("T")[0];
      } else {
        // Mặc định là 7 ngày sau nếu thiếu
        const d = new Date();
        d.setDate(d.getDate() + 7);
        formattedHanThanhToan = d.toISOString().split("T")[0];
      }
    } catch (e) {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      formattedHanThanhToan = d.toISOString().split("T")[0];
    }

    const [result] = await pool.execute(
      `INSERT INTO HoaDon 
            (maHoaDon, hopDong_id, phong_id, khachThue_id, thang, nam,
             tienPhong, tienDien, soDien, chiSoDienBanDau, chiSoDienCuoiKy,
             tienNuoc, soNuoc, chiSoNuocBanDau, chiSoNuocCuoiKy,
             phiDichVu, tongTien, daThanhToan, conLai, trangThai,
             hanThanhToan, ghiChu) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        maHoaDon || null,
        hopDong_id || null,
        phong_id || null,
        khachThue_id || null,
        thang || null,
        nam || null,
        tienPhong || 0,
        tienDien || 0,
        soDien || 0,
        chiSoDienBanDau || 0,
        chiSoDienCuoiKy || 0,
        tienNuoc || 0,
        soNuoc || 0,
        chiSoNuocBanDau || 0,
        chiSoNuocCuoiKy || 0,
        phiDichVu
          ? typeof phiDichVu === "string"
            ? phiDichVu
            : JSON.stringify(phiDichVu)
          : "[]",
        tongTien || 0,
        daThanhToan || 0,
        conLai || 0,
        trangThai || "chuaThanhToan",
        formattedHanThanhToan,
        ghiChu || null,
      ],
    );
    return result.insertId;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];

    // Logical processing for conLai and trangThai
    let daThanhToan = data.daThanhToan;
    let tongTien = data.tongTien;
    let conLai = data.conLai;

    const validFields = [
      "maHoaDon",
      "hopDong_id",
      "phong_id",
      "khachThue_id",
      "thang",
      "nam",
      "tienPhong",
      "tienDien",
      "soDien",
      "chiSoDienBanDau",
      "chiSoDienCuoiKy",
      "tienNuoc",
      "soNuoc",
      "chiSoNuocBanDau",
      "chiSoNuocCuoiKy",
      "phiDichVu",
      "tongTien",
      "daThanhToan",
      "conLai",
      "trangThai",
      "hanThanhToan",
      "ghiChu",
    ];

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && validFields.includes(key)) {
        fields.push(`${key} = ?`);
        if (key === "phiDichVu") {
          values.push(
            typeof value === "string" ? value : JSON.stringify(value),
          );
        } else if (key === "hanThanhToan") {
          if (value && !isNaN(new Date(value).getTime())) {
            values.push(new Date(value).toISOString().split("T")[0]);
          } else {
            // Skip if date is invalid or empty to avoid crash
            fields.pop(); // Remove the field from the query if we can't provide a value
          }
        } else {
          values.push(value);
        }
      }
    }

    if (fields.length === 0) return 0;

    values.push(id);
    const query = `UPDATE HoaDon SET ${fields.join(", ")} WHERE id = ?`;

    console.log("--- HoaDon.update query:", query);
    console.log("--- HoaDon.update values:", JSON.stringify(values, null, 2));

    const [result] = await pool.execute(query, values);
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.execute("DELETE FROM HoaDon WHERE id = ?", [
      id,
    ]);
    return result.affectedRows;
  }
}

module.exports = HoaDon;
