const { pool } = require("../config/db");

class HopDong {
  static parseJsonField(value, fallback) {
    if (value == null) return fallback;
    if (typeof value !== "string") return value;

    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  static getCodeDatePart(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  }

  static async isMaHopDongExists(maHopDong) {
    const [rows] = await pool.execute(
      "SELECT id FROM HopDong WHERE maHopDong = ? LIMIT 1",
      [maHopDong],
    );
    return rows.length > 0;
  }

  static async generateMaHopDong() {
    const datePart = this.getCodeDatePart();
    const prefix = `HD-${datePart}-`;
    const [rows] = await pool.execute(
      "SELECT maHopDong FROM HopDong WHERE maHopDong LIKE ? ORDER BY maHopDong DESC LIMIT 1",
      [`${prefix}%`],
    );

    let sequence = 1;
    if (rows.length > 0) {
      const match = /^HD-\d{8}-(\d{4})$/.exec(rows[0].maHopDong || "");
      if (match) {
        sequence = Number(match[1]) + 1;
      }
    }

    for (let i = 0; i < 10000; i++) {
      const candidate = `${prefix}${String(sequence + i).padStart(4, "0")}`;
      const exists = await this.isMaHopDongExists(candidate);
      if (!exists) {
        return candidate;
      }
    }

    throw new Error("Khong the tu dong sinh ma hop dong duy nhat");
  }

  static async phongExists(phongId) {
    const [rows] = await pool.execute(
      "SELECT id FROM Phong WHERE id = ? LIMIT 1",
      [phongId],
    );
    return rows.length > 0;
  }

  static async khachThueExists(khachThueId) {
    const [rows] = await pool.execute(
      "SELECT id FROM KhachThue WHERE id = ? LIMIT 1",
      [khachThueId],
    );
    return rows.length > 0;
  }

  static async findExistingKhachThueIds(khachThueIds) {
    if (!Array.isArray(khachThueIds) || khachThueIds.length === 0) {
      return [];
    }

    const placeholders = khachThueIds.map(() => "?").join(", ");
    const [rows] = await pool.execute(
      `SELECT id FROM KhachThue WHERE id IN (${placeholders})`,
      khachThueIds,
    );
    return rows.map((row) => Number(row.id));
  }

  static async getTenantsByHopDongIds(hopDongIds) {
    if (!hopDongIds?.length) {
      return {};
    }

    const placeholders = hopDongIds.map(() => "?").join(", ");
    const [rows] = await pool.execute(
      `SELECT hkt.hopDong_id, kt.id, kt.hoTen, kt.soDienThoai, kt.email
             FROM HopDong_KhachThue hkt
             INNER JOIN KhachThue kt ON kt.id = hkt.khachThue_id
             WHERE hkt.hopDong_id IN (${placeholders})
             ORDER BY kt.hoTen ASC`,
      hopDongIds,
    );

    return rows.reduce((acc, row) => {
      const key = row.hopDong_id.toString();
      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push({
        _id: row.id.toString(),
        hoTen: row.hoTen || "N/A",
        soDienThoai: row.soDienThoai || "",
        email: row.email || undefined,
      });

      return acc;
    }, {});
  }

  static normalizeHopDong(row) {
    if (!row) return null;

    return {
      ...row,
      _id: row.id.toString(),
      phong: {
        _id: row.phong_id?.toString() || "",
        maPhong: row.maPhong || "N/A",
        toaNha: {
          _id: row.toaNha_id?.toString() || "",
          tenToaNha: row.tenToaNha || "N/A",
        },
      },
      nguoiDaiDien: {
        _id: row.nguoiDaiDien_id?.toString() || "",
        hoTen: row.tenNguoiDaiDien || "N/A",
        soDienThoai: row.sdtNguoiDaiDien || "",
      },
      khachThueId: row.khachThueId || [],
      phiDichVu: this.parseJsonField(row.phiDichVu, []),
    };
  }

  static async findAll(filters) {
    let query = `
            SELECT h.*, p.maPhong, p.toaNha_id, t.tenToaNha,
                   k.hoTen as tenNguoiDaiDien, k.soDienThoai as sdtNguoiDaiDien
            FROM HopDong h
            LEFT JOIN Phong p ON h.phong_id = p.id
            LEFT JOIN ToaNha t ON p.toaNha_id = t.id
            LEFT JOIN KhachThue k ON h.nguoiDaiDien_id = k.id
            WHERE 1=1`;
    const params = [];

    if (filters?.trangThai) {
      query += " AND h.trangThai = ?";
      params.push(filters.trangThai);
    }
    if (filters?.phong_id) {
      query += " AND h.phong_id = ?";
      params.push(filters.phong_id);
    }

    query += " ORDER BY h.ngayTao DESC";
    const [rows] = await pool.execute(query, params);

    const tenantMap = await this.getTenantsByHopDongIds(
      rows.map((row) => row.id),
    );
    for (const row of rows) {
      row.khachThueId = tenantMap[row.id.toString()] || [];
    }

    return rows.map((row) => this.normalizeHopDong(row));
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT h.*, p.maPhong, p.toaNha_id, t.tenToaNha,
                    k.hoTen as tenNguoiDaiDien, k.soDienThoai as sdtNguoiDaiDien
             FROM HopDong h
             LEFT JOIN Phong p ON h.phong_id = p.id
             LEFT JOIN ToaNha t ON p.toaNha_id = t.id
             LEFT JOIN KhachThue k ON h.nguoiDaiDien_id = k.id
             WHERE h.id = ?`,
      [id],
    );

    const hopDong = rows[0];
    if (!hopDong) {
      return null;
    }

    const tenantMap = await this.getTenantsByHopDongIds([hopDong.id]);
    hopDong.khachThueId = tenantMap[hopDong.id.toString()] || [];

    return this.normalizeHopDong(hopDong);
  }

  static async create(data) {
    const {
      maHopDong,
      phong_id,
      nguoiDaiDien_id,
      ngayBatDau,
      ngayKetThuc,
      giaThue,
      tienCoc,
      chuKyThanhToan,
      ngayThanhToan,
      dieuKhoan,
      giaDien,
      giaNuoc,
      chiSoDienBanDau,
      chiSoNuocBanDau,
      phiDichVu,
      trangThai,
      fileHopDong,
      khachThueIds,
    } = data;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.execute(
        `INSERT INTO HopDong
                (maHopDong, phong_id, nguoiDaiDien_id, ngayBatDau, ngayKetThuc,
                 giaThue, tienCoc, chuKyThanhToan, ngayThanhToan, dieuKhoan,
                 giaDien, giaNuoc, chiSoDienBanDau, chiSoNuocBanDau,
                 phiDichVu, trangThai, fileHopDong)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          maHopDong ?? null,
          phong_id ?? null,
          nguoiDaiDien_id ?? null,
          ngayBatDau ? new Date(ngayBatDau).toISOString().split("T")[0] : null,
          ngayKetThuc
            ? new Date(ngayKetThuc).toISOString().split("T")[0]
            : null,
          giaThue ?? null,
          tienCoc ?? null,
          chuKyThanhToan || "thang",
          ngayThanhToan ?? null,
          dieuKhoan ?? null,
          giaDien ?? null,
          giaNuoc ?? null,
          chiSoDienBanDau ?? null,
          chiSoNuocBanDau ?? null,
          phiDichVu ? JSON.stringify(phiDichVu) : "[]",
          trangThai || "hoatDong",
          fileHopDong || null,
        ],
      );
      const hopDongId = result.insertId;

      if (khachThueIds && Array.isArray(khachThueIds)) {
        for (const tenantId of khachThueIds) {
          await connection.execute(
            "INSERT INTO HopDong_KhachThue (hopDong_id, khachThue_id) VALUES (?, ?)",
            [hopDongId, tenantId],
          );
        }
      }

      if (trangThai !== "daHuy" && trangThai !== "hetHan") {
        await connection.execute(
          "UPDATE Phong SET trangThai = ? WHERE id = ?",
          ["dangThue", phong_id],
        );
      }

      await connection.commit();
      return hopDongId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    const validFields = [
      "maHopDong",
      "phong_id",
      "nguoiDaiDien_id",
      "ngayBatDau",
      "ngayKetThuc",
      "giaThue",
      "tienCoc",
      "chuKyThanhToan",
      "ngayThanhToan",
      "dieuKhoan",
      "giaDien",
      "giaNuoc",
      "chiSoDienBanDau",
      "chiSoNuocBanDau",
      "phiDichVu",
      "trangThai",
      "fileHopDong",
    ];
    const { khachThueIds } = data;

    if (data.phong) {
      data.phong_id =
        typeof data.phong === "object"
          ? data.phong.id || data.phong._id
          : data.phong;
      delete data.phong;
    }
    if (data.nguoiDaiDien) {
      data.nguoiDaiDien_id =
        typeof data.nguoiDaiDien === "object"
          ? data.nguoiDaiDien.id || data.nguoiDaiDien._id
          : data.nguoiDaiDien;
      delete data.nguoiDaiDien;
    }

    for (const [key, value] of Object.entries(data)) {
      if (key === "khachThueIds") continue;
      if (value !== undefined && validFields.includes(key)) {
        fields.push(`${key} = ?`);
        if (key === "phiDichVu") {
          values.push(
            typeof value === "string" ? value : JSON.stringify(value),
          );
        } else if ((key === "ngayBatDau" || key === "ngayKetThuc") && value) {
          if (!isNaN(new Date(value).getTime())) {
            values.push(new Date(value).toISOString().split("T")[0]);
          } else {
            fields.pop();
          }
        } else {
          values.push(value);
        }
      }
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      let affectedRows = 0;
      if (fields.length > 0) {
        const [result] = await connection.execute(
          `UPDATE HopDong SET ${fields.join(", ")} WHERE id = ?`,
          [...values, id],
        );
        affectedRows = result.affectedRows;
      }

      if (Array.isArray(khachThueIds)) {
        await connection.execute(
          "DELETE FROM HopDong_KhachThue WHERE hopDong_id = ?",
          [id],
        );
        for (const tenantId of khachThueIds) {
          await connection.execute(
            "INSERT INTO HopDong_KhachThue (hopDong_id, khachThue_id) VALUES (?, ?)",
            [id, tenantId],
          );
        }
        affectedRows = Math.max(affectedRows, 1);
      }

      await connection.commit();
      return affectedRows;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    const [result] = await pool.execute("DELETE FROM HopDong WHERE id = ?", [
      id,
    ]);
    return result.affectedRows;
  }
}

module.exports = HopDong;
