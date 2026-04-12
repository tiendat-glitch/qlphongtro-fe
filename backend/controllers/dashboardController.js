const { pool } = require("../config/db");
const { successResponse, errorResponse } = require("../common/response");

exports.getStats = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // 1. Chỉ số Phòng
    const [[{ totalPhong }]] = await pool.execute(
      "SELECT COUNT(*) as totalPhong FROM Phong",
    );
    const [[{ phongTrong }]] = await pool.execute(
      'SELECT COUNT(*) as phongTrong FROM Phong WHERE trangThai = "trong"',
    );
    const [[{ phongDangThue }]] = await pool.execute(
      'SELECT COUNT(*) as phongDangThue FROM Phong WHERE trangThai = "dangThue"',
    );
    const [[{ phongBaoTri }]] = await pool.execute(
      'SELECT COUNT(*) as phongBaoTri FROM Phong WHERE trangThai = "baoTri"',
    );

    // 2. Chỉ số Doanh thu
    const [[{ doanhThuThang }]] = await pool.execute(
      "SELECT COALESCE(SUM(soTien), 0) as doanhThuThang FROM ThanhToan WHERE MONTH(ngayThanhToan) = ? AND YEAR(ngayThanhToan) = ?",
      [currentMonth, currentYear],
    );

    const [[{ doanhThuNam }]] = await pool.execute(
      "SELECT COALESCE(SUM(soTien), 0) as doanhThuNam FROM ThanhToan WHERE YEAR(ngayThanhToan) = ?",
      [currentYear],
    );

    // 3. Hóa đơn sắp đến hạn (7 ngày tới)
    const [[{ hoaDonSapDenHan }]] = await pool.execute(
      `SELECT COUNT(*) as hoaDonSapDenHan FROM HoaDon 
             WHERE hanThanhToan <= DATE_ADD(NOW(), INTERVAL 7 DAY) 
             AND trangThai IN ('chuaThanhToan', 'daThanhToanMotPhan')`,
    );

    // 4. Sự cố cần xử lý
    const [[{ suCoCanXuLy }]] = await pool.execute(
      `SELECT COUNT(*) as suCoCanXuLy FROM SuCo WHERE trangThai IN ('moi', 'choXuLy', 'dangXuLy')`,
    );

    // 5. Hợp đồng sắp hết hạn (30 ngày tới)
    const [[{ hopDongSapHetHan }]] = await pool.execute(
      `SELECT COUNT(*) as hopDongSapHetHan FROM HopDong 
             WHERE ngayKetThuc <= DATE_ADD(NOW(), INTERVAL 30 DAY) 
             AND trangThai = 'hoatDong'`,
    );

    const stats = {
      tongSoPhong: parseInt(totalPhong) || 0,
      phongTrong: parseInt(phongTrong) || 0,
      phongDangThue: parseInt(phongDangThue) || 0,
      phongBaoTri: parseInt(phongBaoTri) || 0,
      doanhThuThang: parseInt(doanhThuThang) || 0,
      doanhThuNam: parseInt(doanhThuNam) || 0,
      hoaDonSapDenHan: parseInt(hoaDonSapDenHan) || 0,
      suCoCanXuLy: parseInt(suCoCanXuLy) || 0,
      hopDongSapHetHan: parseInt(hopDongSapHetHan) || 0,
    };

    return successResponse(res, "Lấy thống kê thành công", stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return errorResponse(res, 500, "Lỗi server khi lấy thống kê");
  }
};
