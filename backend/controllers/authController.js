const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");
const NguoiDung = require("../models/NguoiDung");
const KhachThue = require("../models/KhachThue");
const HopDong = require("../models/HopDong");
const HoaDon = require("../models/HoaDon");
const { successResponse, errorResponse } = require("../common/response");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, "Vui lòng cung cấp email và mật khẩu");
    }

    const user = await NguoiDung.findByEmail(email);
    if (!user) {
      return errorResponse(res, 401, "Email không tồn tại");
    }

    if (user.trangThai === "khoa") {
      return errorResponse(res, 403, "Tài khoản đã bị khóa");
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.matKhau);
    if (!isMatch) {
      return errorResponse(res, 401, "Mật khẩu không chính xác");
    }

    // Cập nhật last login
    await NguoiDung.updateLastLogin(user.id);

    // Tạo JWT
    const payload = {
      id: user.id,
      email: user.email,
      vaiTro: user.vaiTro,
      ten: user.ten,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || "super_secret", {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    // Trả về frontend (để NextAuth có thể bắt và lưu session)
    return successResponse(res, "Đăng nhập thành công", {
      id: user.id,
      name: user.ten,
      email: user.email,
      role: user.vaiTro,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse(res, 500, "Lỗi đăng nhập");
  }
};

// Đăng ký (Tạo Admin đầu tiên hoặc user mới)
exports.register = async (req, res) => {
  try {
    const { ten, email, matKhau, soDienThoai, vaiTro } = req.body;

    const existingUser = await NguoiDung.findByEmailOrPhone(email, soDienThoai);
    if (existingUser) {
      return errorResponse(res, 400, "Email hoặc Số điện thoại đã tồn tại");
    }

    const salt = await bcrypt.genSalt(12);
    const hashedMatKhau = await bcrypt.hash(matKhau, salt);

    const newUserId = await NguoiDung.create({
      ten,
      email,
      matKhau: hashedMatKhau,
      soDienThoai,
      vaiTro: vaiTro || "nhanVien",
      trangThai: "hoatDong",
    });

    return successResponse(res, "Tạo tài khoản thành công", { id: newUserId });
  } catch (error) {
    console.error("Register error:", error);
    return errorResponse(res, 500, "Lỗi tạo tài khoản");
  }
};

// Đăng nhập dành cho Khách thuê
exports.loginKhachThue = async (req, res) => {
  try {
    const { soDienThoai, matKhau } = req.body;

    if (!soDienThoai || !matKhau) {
      return errorResponse(res, 400, "Số điện thoại và mật khẩu là bắt buộc");
    }

    const trimmedPhone = soDienThoai.trim();
    const khachThue = await KhachThue.findByPhone(trimmedPhone);

    if (!khachThue) {
      console.log(`[AUTH] Không tìm thấy khách thuê với SĐT: ${trimmedPhone}`);
      return errorResponse(res, 401, "Số điện thoại hoặc mật khẩu không đúng");
    }

    if (!khachThue.matKhau) {
      return errorResponse(
        res,
        401,
        "Tài khoản chưa được kích hoạt. Vui lòng liên hệ quản lý để tạo mật khẩu.",
      );
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(matKhau, khachThue.matKhau);
    if (!isMatch) {
      console.log(`[AUTH] Sai mật khẩu cho khách thuê: ${trimmedPhone}`);
      return errorResponse(res, 401, "Số điện thoại hoặc mật khẩu không đúng");
    }

    const payload = {
      id: khachThue.id,
      soDienThoai: khachThue.soDienThoai,
      hoTen: khachThue.hoTen,
      role: "khachThue",
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || "super_secret", {
      expiresIn: "7d",
    });

    delete khachThue.matKhau;

    return successResponse(res, "Đăng nhập thành công", {
      khachThue,
      token,
    });
  } catch (error) {
    console.error("Login khach_thue error:", error);
    return errorResponse(res, 500, "Lỗi đăng nhập");
  }
};

// Lấy thông tin cá nhân Khách thuê (Dashboard)
exports.meKhachThue = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, 401, "Unauthorized");
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "super_secret");
    } catch (error) {
      return errorResponse(res, 401, "Token không hợp lệ");
    }

    if (decoded.role !== "khachThue") {
      return errorResponse(res, 403, "Unauthorized");
    }

    const khachThue = await KhachThue.findById(decoded.id);
    if (!khachThue) {
      return errorResponse(res, 404, "Khách thuê không tồn tại");
    }

    // Tự join HopDong, Phong, ToaNha để phù hợp với frontend
    const [hopDongRows] = await pool.execute(
      `
            SELECT h.*, p.maPhong, p.giaThue, p.toaNha_id, t.tenToaNha, t.duong, t.phuong
            FROM HopDong h
            LEFT JOIN Phong p ON h.phong_id = p.id
            LEFT JOIN ToaNha t ON p.toaNha_id = t.id
            WHERE h.nguoiDaiDien_id = ? AND h.trangThai = 'hoatDong'
            AND h.ngayBatDau <= NOW() AND h.ngayKetThuc >= NOW()
            ORDER BY h.ngayBatDau DESC LIMIT 1
        `,
      [decoded.id],
    );

    let hopDongHienTai = null;
    if (hopDongRows.length > 0) {
      const h = hopDongRows[0];
      hopDongHienTai = {
        ...h,
        phong: {
          maPhong: h.maPhong,
          giaThue: h.giaThue,
          toaNha: {
            tenToaNha: h.tenToaNha,
            duong: h.duong,
            phuong: h.phuong,
          },
        },
      };
    }

    // Đếm hóa đơn
    const [hoaDonRows] = await pool.execute(
      "SELECT * FROM HoaDon WHERE khachThue_id = ? ORDER BY id DESC",
      [decoded.id],
    );

    const soHoaDonChuaThanhToan = hoaDonRows.filter((h) =>
      ["chuaThanhToan", "daThanhToanMotPhan", "quaHan"].includes(h.trangThai),
    ).length;

    // Xếp theo ID/ngày
    let hoaDonGanNhat = null;
    if (hoaDonRows.length > 0) {
      hoaDonGanNhat = hoaDonRows[0];
    }

    delete khachThue.matKhau;

    return successResponse(res, "Thành công", {
      khachThue,
      hopDongHienTai,
      soHoaDonChuaThanhToan,
      hoaDonGanNhat,
    });
  } catch (error) {
    console.error("Me khach_thue error:", error);
    return errorResponse(res, 500, "Lỗi lấy thông tin cá nhân");
  }
};
