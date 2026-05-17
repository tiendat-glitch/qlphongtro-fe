const { pool } = require("../config/db");

class SuCo {
  static parseImageField(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value !== "string") return [];

    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  static formatMySqlDateTime(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString().slice(0, 19).replace("T", " ");
  }

  static normalizeSuCo(row) {
    if (!row) return null;

    return {
      ...row,
      anhSuCo: this.parseImageField(row.hinhAnh)
    };
  }

  static async findAll(filters) {
    let query = `
            SELECT s.*, p.maPhong,
                   k.id as khachThue_id,
                   k.hoTen as tenNguoiBao,
                   k.hoTen as tenKhachThue,
                   k.hoTen as hoTenKhachThue,
                   k.soDienThoai as sdtNguoiBao,
                   k.soDienThoai as sdtKhachThue
            FROM SuCo s
            LEFT JOIN Phong p ON s.phong_id = p.id
            LEFT JOIN KhachThue k ON s.nguoiBao_id = k.id
            WHERE 1=1`;
    const params = [];

    if (filters && filters.trangThai) {
      query += " AND s.trangThai = ?";
      params.push(filters.trangThai);
    }
    if (filters && filters.phong_id) {
      query += " AND s.phong_id = ?";
      params.push(filters.phong_id);
    }

    query += " ORDER BY s.ngayTao DESC";
    const [rows] = await pool.execute(query, params);
    return rows.map((row) => this.normalizeSuCo(row));
  }

  static async findById(id) {
    const query = `
            SELECT s.*, p.maPhong,
                   k.id as khachThue_id,
                   k.hoTen as tenNguoiBao,
                   k.hoTen as tenKhachThue,
                   k.hoTen as hoTenKhachThue,
                   k.soDienThoai as sdtNguoiBao,
                   k.soDienThoai as sdtKhachThue
            FROM SuCo s
            LEFT JOIN Phong p ON s.phong_id = p.id
            LEFT JOIN KhachThue k ON s.nguoiBao_id = k.id
            WHERE s.id = ?`;
    const [rows] = await pool.execute(query, [id]);
    return this.normalizeSuCo(rows[0]);
  }

  static async create(data) {
    const {
      tieuDe,
      moTa,
      anhSuCo,
      hinhAnh,
      phong_id,
      phong,
      khachThue,
      nguoiBaoCao,
      nguoiBao_id,
      mucDo,
      mucDoUuTien,
      loaiSuCo,
      loai,
      trangThai,
      ngayBaoCao,
      ngayBao,
    } = data;

    const final_loaiSuCo = loaiSuCo || loai || "khac";

    const final_phong_id = phong_id || data.phong;
    const final_nguoiBao_id = nguoiBao_id || data.khachThue || data.nguoiBaoCao;

    const final_mucDo = mucDo || "trungBinh";
    const final_trangThai = trangThai || "moi";

    const final_hinhAnh = hinhAnh || anhSuCo || [];
    const inputDate = ngayBao || ngayBaoCao;
    const formattedNgayBao =
      this.formatMySqlDateTime(inputDate) ||
      this.formatMySqlDateTime(new Date());

    const [result] = await pool.execute(
      `INSERT INTO SuCo
            (tieuDe, moTa, hinhAnh, loaiSuCo, phong_id, nguoiBao_id, mucDo, trangThai, ngayBaoCao)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tieuDe || null,
        moTa || null,
        typeof final_hinhAnh === "string"
          ? final_hinhAnh
          : JSON.stringify(final_hinhAnh),
        final_loaiSuCo,
        final_phong_id || null,
        final_nguoiBao_id || null,
        final_mucDo,
        final_trangThai,
        formattedNgayBao,
      ],
    );

    return result.insertId;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    const validFields = [
      "tieuDe",
      "moTa",
      "hinhAnh",
      "loaiSuCo",
      "phong_id",
      "nguoiBao_id",
      "mucDo",
      "trangThai",
      "ghiChuXuLy",
      "chiPhi",
      "ngayBaoCao",
    ];

    if (data.phong) {
      data.phong_id =
        typeof data.phong === "object"
          ? data.phong.id || data.phong._id
          : data.phong;
      delete data.phong;
    }
    if (data.khachThue || data.nguoiBaoCao) {
      const val = data.khachThue || data.nguoiBaoCao;
      data.nguoiBao_id = typeof val === "object" ? val.id || val._id : val;
      delete data.khachThue;
      delete data.nguoiBaoCao;
    }
    if (data.anhSuCo) {
      data.hinhAnh = data.anhSuCo;
      delete data.anhSuCo;
    }
    if (data.mucDoUuTien) {
      data.mucDo = data.mucDoUuTien;
      delete data.mucDoUuTien;
    }
    if (data.loai) {
      data.loaiSuCo = data.loai;
      delete data.loai;
    }
    if (data.ngayBao) {
      data.ngayBaoCao = data.ngayBao;
      delete data.ngayBao;
    }

    // Removed mapping logic since frontend follows backend now

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && validFields.includes(key)) {
        fields.push(`${key} = ?`);
        if (key === "hinhAnh") {
          values.push(
            typeof value === "string" ? value : JSON.stringify(value),
          );
        } else if (key === "ngayBaoCao") {
          const formattedNgayBao = this.formatMySqlDateTime(value);
          if (!formattedNgayBao) {
            fields.pop();
            continue;
          }
          values.push(formattedNgayBao);
        } else {
          values.push(value);
        }
      }
    }

    if (fields.length === 0) return 0;

    values.push(id);
    const query = `UPDATE SuCo SET ${fields.join(", ")} WHERE id = ?`;

    const [result] = await pool.execute(query, values);
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.execute("DELETE FROM SuCo WHERE id = ?", [id]);
    return result.affectedRows;
  }
}

module.exports = SuCo;
