const { pool } = require("../config/db");

class ToaNha {
  static normalizeToaNha(row) {
    if (!row) return null;
    return {
      ...row,
      tongSoPhong: Number(row.tongSoPhong || 0),
      phongTrong: Number(row.phongTrong || 0),
      phongDangThue: Number(row.phongDangThue || 0),
      anhToaNha: row.anhToaNha
        ? typeof row.anhToaNha === "string"
          ? JSON.parse(row.anhToaNha)
          : row.anhToaNha
        : [],
      tienNghiChung: row.tienNghiChung
        ? typeof row.tienNghiChung === "string"
          ? JSON.parse(row.tienNghiChung)
          : row.tienNghiChung
        : [],
    };
  }

  static async findAll(chuSoHuu_id) {
    let query = `
            SELECT t.*, 
                (SELECT COUNT(*) FROM Phong p WHERE p.toaNha_id = t.id) as tongSoPhong,
                (SELECT COUNT(*) FROM Phong p WHERE p.toaNha_id = t.id AND p.trangThai = 'trong') as phongTrong,
                (SELECT COUNT(*) FROM Phong p WHERE p.toaNha_id = t.id AND p.trangThai = 'dangThue') as phongDangThue
            FROM ToaNha t`;
    let params = [];
    if (chuSoHuu_id) {
      query += " WHERE t.chuSoHuu_id = ?";
      params.push(chuSoHuu_id);
    }
    query += " ORDER BY t.ngayCapNhat DESC";
    const [rows] = await pool.execute(query, params);
    return rows.map((row) => this.normalizeToaNha(row));
  }

  static async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM ToaNha WHERE id = ?", [
      id,
    ]);
    return this.normalizeToaNha(rows[0]);
  }

  static async create(data) {
    let {
      tenToaNha,
      soNha,
      duong,
      phuong,
      quan,
      thanhPho,
      moTa,
      anhToaNha,
      chuSoHuu_id,
      tongSoPhong,
      tienNghiChung,
    } = data;

    // Removed diaChi object flattening since frontend sends flat properties now
    const [result] = await pool.execute(
      `INSERT INTO ToaNha 
            (tenToaNha, soNha, duong, phuong, quan, thanhPho, moTa, anhToaNha, chuSoHuu_id, tongSoPhong, tienNghiChung) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tenToaNha,
        soNha,
        duong,
        phuong,
        quan,
        thanhPho,
        moTa || null,
        anhToaNha
          ? typeof anhToaNha === "string"
            ? anhToaNha
            : JSON.stringify(anhToaNha)
          : "[]",
        chuSoHuu_id,
        tongSoPhong || 0,
        tienNghiChung
          ? typeof tienNghiChung === "string"
            ? tienNghiChung
            : JSON.stringify(tienNghiChung)
          : "[]",
      ],
    );
    return result.insertId;
  }

  static async update(id, data) {
    // Danh sách các cột hợp lệ trong bảng ToaNha
    const validFields = [
      "tenToaNha",
      "soNha",
      "duong",
      "phuong",
      "quan",
      "thanhPho",
      "moTa",
      "anhToaNha",
      "chuSoHuu_id",
      "tongSoPhong",
      "tienNghiChung",
    ];

    // Removed diaChi object handling

    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && validFields.includes(key)) {
        fields.push(`${key} = ?`);
        if (["anhToaNha", "tienNghiChung"].includes(key)) {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }
      }
    }

    if (fields.length === 0) return 0;

    values.push(id);
    const query = `UPDATE ToaNha SET ${fields.join(", ")} WHERE id = ?`;

    const [result] = await pool.execute(query, values);
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.execute("DELETE FROM ToaNha WHERE id = ?", [
      id,
    ]);
    return result.affectedRows;
  }
}

module.exports = ToaNha;
