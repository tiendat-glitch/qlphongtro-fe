const { pool } = require('../config/db');

class ThanhToan {
    static normalizeThanhToan(row) {
        if (!row) return null;
        return {
            ...row,
            _id: row.id?.toString(),
            hoaDon: row.hoaDon_id ? {
                _id: row.hoaDon_id.toString(),
                maHoaDon: row.maHoaDon || '',
                phong: { maPhong: row.maPhong || '' },
                khachThue: { hoTen: row.hoTen || row.tenNguoiDaiDien || '' }
            } : null
        };
    }

    static async findAll(filters) {
        let query = `
            SELECT t.*, 
                   hd.maHoaDon, 
                   p.maPhong, 
                   kh.hoTen as tenNguoiDaiDien,
                   kh.hoTen,
                   n.ten as tenNguoiNhan 
            FROM ThanhToan t 
            LEFT JOIN HoaDon hd ON t.hoaDon_id = hd.id 
            LEFT JOIN Phong p ON hd.phong_id = p.id
            LEFT JOIN KhachThue kh ON hd.khachThue_id = kh.id
            LEFT JOIN NguoiDung n ON t.nguoiNhan_id = n.id 
            WHERE 1=1
        `;
        let params = [];
        
        if (filters && filters.hoaDon_id) {
            query += ' AND t.hoaDon_id = ?';
            params.push(filters.hoaDon_id);
        }
        
        query += ' ORDER BY t.ngayThanhToan DESC';
        const [rows] = await pool.execute(query, params);
        return rows.map(row => this.normalizeThanhToan(row));
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            `SELECT t.*, 
                    hd.maHoaDon, 
                    p.maPhong, 
                    kh.hoTen as tenNguoiDaiDien,
                    kh.hoTen,
                    n.ten as tenNguoiNhan 
             FROM ThanhToan t 
             LEFT JOIN HoaDon hd ON t.hoaDon_id = hd.id 
             LEFT JOIN Phong p ON hd.phong_id = p.id
             LEFT JOIN KhachThue kh ON hd.khachThue_id = kh.id
             LEFT JOIN NguoiDung n ON t.nguoiNhan_id = n.id 
             WHERE t.id = ?`, 
            [id]
        );
        return this.normalizeThanhToan(rows[0]);
    }

    static async create(data) {
        const { hoaDon_id, soTien, phuongThuc, thongTinChuyenKhoan_nganHang, thongTinChuyenKhoan_soGiaoDich, ngayThanhToan, nguoiNhan_id, ghiChu, anhBienLai } = data;
        
        const [result] = await pool.execute(
            `INSERT INTO ThanhToan 
            (hoaDon_id, soTien, phuongThuc, thongTinChuyenKhoan_nganHang, thongTinChuyenKhoan_soGiaoDich, 
             ngayThanhToan, nguoiNhan_id, ghiChu, anhBienLai) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                hoaDon_id, soTien, phuongThuc, 
                thongTinChuyenKhoan_nganHang || null, thongTinChuyenKhoan_soGiaoDich || null, 
                (ngayThanhToan && !isNaN(new Date(ngayThanhToan).getTime())) 
                    ? new Date(ngayThanhToan).toISOString().replace('T', ' ').substring(0, 19) 
                    : new Date().toISOString().replace('T', ' ').substring(0, 19), 
                nguoiNhan_id, 
                ghiChu || null, anhBienLai || null
            ]
        );
        return result.insertId;
    }

    static async delete(id) {
        const [result] = await pool.execute('DELETE FROM ThanhToan WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = ThanhToan;
