const { pool } = require("../config/db");

class ThongBao {
  static async findAll(filters) {
    let query = "SELECT * FROM ThongBao WHERE 1=1";
    let params = [];

    if (filters && filters.nguoiChung) {
      // Null means sent to all, or match specific user
      query += " AND (nguoiChung = ? OR nguoiChung IS NULL)";
      params.push(filters.nguoiChung);
    }
    const loaiFilter = filters?.loaiThongBao || filters?.loai;
    if (loaiFilter) {
      query += " AND loaiThongBao = ?";
      params.push(loaiFilter);
    }

    query += " ORDER BY ngayTao DESC";
    const [rows] = await pool.execute(query, params);

    // Map data để khớp với Frontend
    return rows.map((row) => ({
      ...row,
      _id: row.id.toString(),
      loai: row.loaiThongBao,
      nguoiNhan: row.nguoiChung ? [row.nguoiChung.toString()] : [], // MySQL lưu 1 id, giả lập mảng
      daDoc: row.daDoc ? [row.nguoiChung?.toString()] : [], // Giả lập mảng đã đọc
      phong: row.phong ? JSON.parse(row.phong) : [],
      ngayGui: row.ngayTao,
    }));
  }

  static async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM ThongBao WHERE id = ?", [
      id,
    ]);
    return rows[0];
  }

  static async create(data) {
    const tieuDe = data.tieuDe;
    const noiDung = data.noiDung;
    const loaiThongBao = data.loaiThongBao || data.loai;
    const nguoiChung = data.nguoiChung || data.nguoiNhan?.[0] || null;
    const link = data.link;

    // Map loaiThongBao sang ENUM hop le
    const validTypes = ["heThong", "hoaDon", "hopDong", "suCo", "chung"];
    const finalType = validTypes.includes(loaiThongBao)
      ? loaiThongBao
      : "chung";

    const [result] = await pool.execute(
      `INSERT INTO ThongBao 
            (tieuDe, noiDung, loaiThongBao, nguoiChung, link, daDoc) 
            VALUES (?, ?, ?, ?, ?, ?)`,
      [tieuDe, noiDung, finalType, nguoiChung || null, link || null, 0],
    );
    return result.insertId;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    const validFields = ["tieuDe", "noiDung", "loaiThongBao", "nguoiChung", "link", "daDoc"];

    if (data.loai !== undefined) {
      data.loaiThongBao = data.loai;
    }
    if (data.nguoiNhan && data.nguoiNhan.length > 0) {
      data.nguoiChung = data.nguoiNhan[0];
    }

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && validFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) return 0;

    values.push(id);
    const query = `UPDATE ThongBao SET ${fields.join(", ")} WHERE id = ?`;

    const [result] = await pool.execute(query, values);
    return result.affectedRows;
  }

  static async markAsRead(id) {
    const [result] = await pool.execute(
      "UPDATE ThongBao SET daDoc = 1 WHERE id = ?",
      [id],
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.execute("DELETE FROM ThongBao WHERE id = ?", [
      id,
    ]);
    return result.affectedRows;
  }
}

module.exports = ThongBao;
