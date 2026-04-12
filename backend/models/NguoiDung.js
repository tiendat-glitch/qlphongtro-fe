const { pool } = require("../config/db");
const bcrypt = require("bcryptjs");

class NguoiDung {
  static async findAll() {
    const [rows] = await pool.execute(
      "SELECT id, ten, email, soDienThoai, vaiTro, trangThai, diaChi, anhDaiDien, lastLogin, ngayTao FROM NguoiDung ORDER BY ngayTao DESC",
    );
    return rows;
  }
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      "SELECT * FROM NguoiDung WHERE email = ?",
      [email],
    );
    return rows[0];
  }

  static async findByEmailOrPhone(email, soDienThoai) {
    const [rows] = await pool.execute(
      "SELECT * FROM NguoiDung WHERE email = ? OR soDienThoai = ?",
      [email, soDienThoai],
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM NguoiDung WHERE id = ?", [
      id,
    ]);
    return rows[0];
  }

  static async create(userData) {
    const {
      ten,
      email,
      matKhau,
      soDienThoai,
      vaiTro,
      trangThai,
      diaChi,
      anhDaiDien,
    } = userData;
    const [result] = await pool.execute(
      `INSERT INTO NguoiDung 
            (ten, email, matKhau, soDienThoai, vaiTro, trangThai, diaChi, anhDaiDien) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ten,
        email,
        matKhau,
        soDienThoai,
        vaiTro || "nhanVien",
        trangThai || "hoatDong",
        diaChi || null,
        anhDaiDien || null,
      ],
    );
    return result.insertId;
  }

  static async updateLastLogin(id) {
    await pool.execute("UPDATE NguoiDung SET lastLogin = NOW() WHERE id = ?", [
      id,
    ]);
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        if (key === "matKhau") {
          const salt = await bcrypt.genSalt(10);
          values.push(await bcrypt.hash(value, salt));
        } else {
          values.push(value);
        }
      }
    }

    if (fields.length === 0) return 0;

    values.push(id);
    const query = `UPDATE NguoiDung SET ${fields.join(", ")} WHERE id = ?`;
    const [result] = await pool.execute(query, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.execute("DELETE FROM NguoiDung WHERE id = ?", [
      id,
    ]);
    return result.affectedRows > 0;
  }
}

module.exports = NguoiDung;
