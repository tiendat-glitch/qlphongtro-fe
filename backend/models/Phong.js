const { pool } = require("../config/db");

class Phong {
  static parseJsonField(value, fallback) {
    if (value == null) return fallback;
    if (typeof value !== "string") return value;

    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  static async hydrateCurrentContracts(rows) {
    if (!rows?.length) {
      return rows;
    }

    const hopDongIds = rows.map((row) => row.hopDong_id).filter(Boolean);
    if (!hopDongIds.length) {
      return rows;
    }

    const placeholders = hopDongIds.map(() => "?").join(", ");
    const [tenantRows] = await pool.execute(
      `SELECT hkt.hopDong_id, kt.id, kt.hoTen, kt.soDienThoai
             FROM HopDong_KhachThue hkt
             INNER JOIN KhachThue kt ON kt.id = hkt.khachThue_id
             WHERE hkt.hopDong_id IN (${placeholders})
             ORDER BY kt.hoTen ASC`,
      hopDongIds,
    );

    const tenantMap = tenantRows.reduce((acc, row) => {
      const key = row.hopDong_id.toString();
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push({
        _id: row.id.toString(),
        hoTen: row.hoTen || "N/A",
        soDienThoai: row.soDienThoai || "",
      });
      return acc;
    }, {});

    for (const row of rows) {
      if (row.hopDong_id) {
        row.khachThueList = tenantMap[row.hopDong_id.toString()] || [];
      }
    }

    return rows;
  }

  static normalizePhong(row) {
    if (!row) return null;

    let hopDongHienTai = null;
    if (row.hopDong_id) {
      hopDongHienTai = {
        _id: row.hopDong_id.toString(),
        nguoiDaiDien: {
          _id: row.nguoiDaiDien_id?.toString() || "",
          hoTen: row.tenNguoiDaiDien || "N/A",
          soDienThoai: row.sdtNguoiDaiDien || "N/A",
        },
        khachThueId: row.khachThueList || [],
      };
    }

    return {
      ...row,
      _id: row.id.toString(),
      toaNha: {
        _id: row.toaNha_id?.toString() || "",
        tenToaNha: row.tenToaNha || "N/A",
      },
      giaThue: Number(row.giaThue || 0),
      tienCoc: Number(row.tienCoc || 0),
      anhPhong: this.parseJsonField(row.anhPhong, []),
      tienNghi: this.parseJsonField(row.tienNghi, []),
      hopDongHienTai,
    };
  }

  static normalizePublicPhong(row) {
    if (!row) return null;

    return {
      id: row.id,
      _id: row.id.toString(),
      maPhong: row.maPhong,
      toaNha_id: row.toaNha_id,
      tenToaNha: row.tenToaNha || null,
      toaNha: {
        _id: row.toaNha_id?.toString() || "",
        tenToaNha: row.tenToaNha || "N/A",
      },
      dienTich: row.dienTich,
      giaThue: Number(row.giaThue || 0),
      tienCoc: Number(row.tienCoc || 0),
      moTa: row.moTa || null,
      anhPhong: this.parseJsonField(row.anhPhong, []),
      tienNghi: this.parseJsonField(row.tienNghi, []),
      soNguoiToiDa: row.soNguoiToiDa,
      trangThai: row.trangThai,
    };
  }

  static async findAll(filters) {
    let query = `
            SELECT p.*, t.tenToaNha,
                h.id as hopDong_id, h.nguoiDaiDien_id,
                k.hoTen as tenNguoiDaiDien, k.soDienThoai as sdtNguoiDaiDien
            FROM Phong p
            LEFT JOIN ToaNha t ON p.toaNha_id = t.id
            LEFT JOIN HopDong h ON p.id = h.phong_id AND h.trangThai = 'hoatDong'
            LEFT JOIN KhachThue k ON h.nguoiDaiDien_id = k.id
            WHERE 1=1`;
    const params = [];

    if (filters?.toaNha_id) {
      query += " AND p.toaNha_id = ?";
      params.push(filters.toaNha_id);
    }
    if (filters?.trangThai) {
      query += " AND p.trangThai = ?";
      params.push(filters.trangThai);
    }

    query += " ORDER BY p.maPhong ASC";
    const [rows] = await pool.execute(query, params);
    await this.hydrateCurrentContracts(rows);
    return rows.map((row) => this.normalizePhong(row));
  }

  static async findById(id) {
    const query = `
            SELECT p.*, t.tenToaNha,
                h.id as hopDong_id, h.nguoiDaiDien_id,
                k.hoTen as tenNguoiDaiDien, k.soDienThoai as sdtNguoiDaiDien
            FROM Phong p
            LEFT JOIN ToaNha t ON p.toaNha_id = t.id
            LEFT JOIN HopDong h ON p.id = h.phong_id AND h.trangThai = 'hoatDong'
            LEFT JOIN KhachThue k ON h.nguoiDaiDien_id = k.id
            WHERE p.id = ?`;
    const [rows] = await pool.execute(query, [id]);
    await this.hydrateCurrentContracts(rows);
    return this.normalizePhong(rows[0]);
  }

  static async findPublicRooms(filters) {
    const defaultPublicStatuses = ["trong", "dangThue"];
    const allowedPublicStatuses = ["trong", "dangThue", "daDat", "baoTri"];
    const requestedTrangThai =
      typeof filters?.trangThai === "string" ? filters.trangThai.trim() : "";

    let statuses = defaultPublicStatuses;
    if (requestedTrangThai) {
      statuses = allowedPublicStatuses.includes(requestedTrangThai)
        ? [requestedTrangThai]
        : [];
    }

    let query = `
            SELECT p.id, p.maPhong, p.toaNha_id, t.tenToaNha, p.dienTich,
                   p.giaThue, p.tienCoc, p.moTa, p.anhPhong, p.tienNghi,
                   p.soNguoiToiDa, p.trangThai
            FROM Phong p
            LEFT JOIN ToaNha t ON p.toaNha_id = t.id
            WHERE 1=1`;
    const params = [];

    if (statuses.length > 0) {
      query += ` AND p.trangThai IN (${statuses.map(() => "?").join(", ")})`;
      params.push(...statuses);
    } else {
      // Query trangThai không hợp lệ => không trả dữ liệu.
      query += " AND 1=0";
    }

    if (filters?.toaNha_id) {
      query += " AND p.toaNha_id = ?";
      params.push(filters.toaNha_id);
    }

    query += " ORDER BY p.giaThue ASC, p.maPhong ASC";
    const [rows] = await pool.execute(query, params);
    return rows.map((row) => this.normalizePublicPhong(row));
  }

  static async findPublicById(id) {
    const [rows] = await pool.execute(
      `SELECT p.id, p.maPhong, p.toaNha_id, t.tenToaNha, p.dienTich,
                    p.giaThue, p.tienCoc, p.moTa, p.anhPhong, p.tienNghi,
                    p.soNguoiToiDa, p.trangThai
             FROM Phong p
             LEFT JOIN ToaNha t ON p.toaNha_id = t.id
             WHERE p.id = ? AND p.trangThai IN (?, ?)`,
      [id, "trong", "dangThue"],
    );

    return this.normalizePublicPhong(rows[0]);
  }

  static async create(data) {
    const {
      maPhong,
      toaNha_id,
      toaNha,
      tang,
      dienTich,
      giaThue,
      tienCoc,
      moTa,
      anhPhong,
      tienNghi,
      trangThai,
      soNguoiToiDa,
    } = data;
    const final_toaNha_id =
      toaNha_id ||
      (typeof toaNha === "object" ? toaNha.id || toaNha._id : toaNha) ||
      null;

    const [result] = await pool.execute(
      `INSERT INTO Phong
            (maPhong, toaNha_id, tang, dienTich, giaThue, tienCoc, moTa, anhPhong, tienNghi, trangThai, soNguoiToiDa)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        maPhong,
        final_toaNha_id,
        tang,
        dienTich,
        giaThue,
        tienCoc,
        moTa || null,
        anhPhong
          ? typeof anhPhong === "string"
            ? anhPhong
            : JSON.stringify(anhPhong)
          : "[]",
        tienNghi
          ? typeof tienNghi === "string"
            ? tienNghi
            : JSON.stringify(tienNghi)
          : "[]",
        trangThai || "trong",
        soNguoiToiDa || 0,
      ],
    );
    return result.insertId;
  }

  static async update(id, data) {
    const validFields = [
      "maPhong",
      "toaNha_id",
      "tang",
      "dienTich",
      "giaThue",
      "tienCoc",
      "moTa",
      "anhPhong",
      "tienNghi",
      "trangThai",
      "soNguoiToiDa",
    ];
    const fields = [];
    const values = [];

    for (let [key, value] of Object.entries(data)) {
      if (key === "toaNha") {
        key = "toaNha_id";
        value = typeof value === "object" ? value.id || value._id : value;
      }

      if (value !== undefined && validFields.includes(key)) {
        if (key === "toaNha_id" && (value === "" || value === null)) {
          fields.push(`${key} = NULL`);
          continue;
        }

        fields.push(`${key} = ?`);
        if (["anhPhong", "tienNghi"].includes(key)) {
          values.push(
            typeof value === "string" ? value : JSON.stringify(value),
          );
        } else {
          values.push(value);
        }
      }
    }

    if (fields.length === 0) return 0;

    values.push(id);
    const query = `UPDATE Phong SET ${fields.join(", ")} WHERE id = ?`;
    const [result] = await pool.execute(query, values);
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.execute("DELETE FROM Phong WHERE id = ?", [id]);
    return result.affectedRows;
  }
}

module.exports = Phong;
