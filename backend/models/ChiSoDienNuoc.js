const { pool } = require("../config/db");

class ChiSoDienNuoc {
  static async findAll(filters) {
    let query =
      "SELECT c.*, p.maPhong, n.ten as tenNguoiChot FROM ChiSoDienNuoc c LEFT JOIN Phong p ON c.phong_id = p.id LEFT JOIN NguoiDung n ON c.nguoiChot_id = n.id WHERE 1=1";
    let params = [];

    if (filters && filters.phong_id) {
      query += " AND c.phong_id = ?";
      params.push(filters.phong_id);
    }
    if (filters && filters.thang && filters.nam) {
      query += " AND c.thang = ? AND c.nam = ?";
      params.push(filters.thang, filters.nam);
    }

    query += " ORDER BY c.nam DESC, c.thang DESC, c.ngayCapNhat DESC";
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      "SELECT c.*, p.maPhong, n.ten as tenNguoiChot FROM ChiSoDienNuoc c LEFT JOIN Phong p ON c.phong_id = p.id LEFT JOIN NguoiDung n ON c.nguoiChot_id = n.id WHERE c.id = ?",
      [id],
    );
    return rows[0];
  }

  static async create(data) {
    const {
      phong_id,
      thang,
      nam,
      chiSoDien,
      anhDongHoDien,
      chiSoNuoc,
      anhDongHoNuoc,
      ngayChot,
      nguoiChot_id,
      ghiChu,
      trangThai,
    } = data;

    const [result] = await pool.execute(
      `INSERT INTO ChiSoDienNuoc 
            (phong_id, thang, nam, chiSoDien, anhDongHoDien, chiSoNuoc, anhDongHoNuoc, ngayChot, nguoiChot_id, ghiChu, trangThai) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        phong_id,
        thang,
        nam,
        chiSoDien,
        anhDongHoDien || null,
        chiSoNuoc,
        anhDongHoNuoc || null,
        new Date(ngayChot).toISOString().split("T")[0],
        nguoiChot_id,
        ghiChu || null,
        trangThai || "daChot",
      ],
    );
    return result.insertId;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        if (key === "ngayChot") {
          values.push(new Date(value).toISOString().split("T")[0]);
        } else {
          values.push(value);
        }
      }
    }

    if (fields.length === 0) return 0;

    values.push(id);
    const query = `UPDATE ChiSoDienNuoc SET ${fields.join(", ")} WHERE id = ?`;

    const [result] = await pool.execute(query, values);
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.execute(
      "DELETE FROM ChiSoDienNuoc WHERE id = ?",
      [id],
    );
    return result.affectedRows;
  }
}

module.exports = ChiSoDienNuoc;
