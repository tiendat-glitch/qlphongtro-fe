const NguoiDung = require("../models/NguoiDung");
const { successResponse, errorResponse } = require("../common/response");

// Lấy thông tin cá nhân của NguoiDung dang dang nhap (admin, chuNha, nhanVien)
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy từ authMiddleware (jwt)
    const user = await NguoiDung.findById(userId);

    if (!user) {
      return errorResponse(res, 404, "Người dùng không tồn tại");
    }

    // Xoá mật khẩu trước khi trả về
    delete user.matKhau;

    return successResponse(res, "Thành công", user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return errorResponse(res, 500, "Lỗi lấy thông tin cá nhân");
  }
};

// Cập nhật thông tin cá nhân
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ten, soDienThoai, diaChi, anhDaiDien } = req.body;

    const updated = await NguoiDung.update(userId, {
      ten,
      soDienThoai,
      diaChi,
      anhDaiDien,
    });

    if (!updated) {
      return errorResponse(
        res,
        404,
        "Không thể cập nhật thông tin người dùng.",
      );
    }

    const user = await NguoiDung.findById(userId);
    delete user.matKhau;

    return successResponse(res, "Cập nhật thành công", user);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return errorResponse(res, 500, "Lỗi cập nhật thông tin cá nhân");
  }
};
// Lấy tất cả người dùng (Admin, ChuNha only)
exports.getAllUsers = async (req, res) => {
  try {
    const { vaiTro } = req.user;
    if (vaiTro === 'nhanVien') {
      return errorResponse(res, 403, "Không có quyền truy cập");
    }

    let users = await NguoiDung.findAll();
    
    // Xoá password for security 
    users = users.map(u => {
      delete u.matKhau;
      return u;
    });

    if (vaiTro === 'chuNha') {
      users = users.filter(u => u.vaiTro === 'nhanVien');
    }

    return successResponse(res, "Lấy danh sách người dùng thành công", users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    return errorResponse(res, 500, "Lỗi lấy danh sách người dùng");
  }
};

// Lưu ý: adminCreateUser có thể dùng chung với authController.register hoặc viết riêng
exports.adminCreateUser = async (req, res) => {
  try {
    const { ten, email, matKhau, soDienThoai, vaiTro, trangThai, diaChi } =
      req.body;

    // Phân quyền tạo tài khoản
    let roleToCreate = vaiTro || "nhanVien";
    if (req.user.vaiTro === "chuNha") {
      roleToCreate = "nhanVien"; // Chủ nhà chỉ được tạo nhân viên
    }

    // Kiểm tra email tồn tại
    const existing = await NguoiDung.findByEmail(email);
    if (existing) {
      return errorResponse(res, 400, "Email đã được sử dụng");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedMatKhau = await bcrypt.hash(matKhau, salt);

    const userId = await NguoiDung.create({
      ten,
      email,
      matKhau: hashedMatKhau,
      soDienThoai,
      vaiTro: roleToCreate,
      trangThai,
      diaChi,
    });

    const newUser = await NguoiDung.findById(userId);
    delete newUser.matKhau;

    return successResponse(res, "Tạo người dùng thành công", newUser);
  } catch (error) {
    console.error("Error admin creating user:", error);
    return errorResponse(res, 500, "Lỗi tạo người dùng");
  }
};

// Admin cập nhật tài khoản bất kỳ
exports.adminUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const targetUser = await NguoiDung.findById(id);
    if (!targetUser) {
      return errorResponse(res, 404, "Người dùng không tồn tại");
    }

    // Phân quyền cập nhật
    if (req.user.vaiTro === "chuNha" && targetUser.vaiTro !== "nhanVien") {
      return errorResponse(res, 403, "Không có quyền cập nhật tài khoản này");
    }
    if (req.user.vaiTro === "chuNha" && updateData.vaiTro && updateData.vaiTro !== "nhanVien") {
      return errorResponse(res, 403, "Chủ nhà chỉ có thể cấp quyền nhân viên");
    }

    const updated = await NguoiDung.update(id, updateData);
    if (!updated) {
      return errorResponse(
        res,
        404,
        "Không có thay đổi",
      );
    }

    const user = await NguoiDung.findById(id);
    delete user.matKhau;

    return successResponse(res, "Cập nhật thành công", user);
  } catch (error) {
    console.error("Error admin updating user:", error);
    return errorResponse(res, 500, "Lỗi cập nhật người dùng");
  }
};

// Xóa tài khoản
exports.adminDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const targetUser = await NguoiDung.findById(id);
    if (!targetUser) {
      return errorResponse(res, 404, "Người dùng không tồn tại");
    }

    if (req.user.vaiTro === "chuNha" && targetUser.vaiTro !== "nhanVien") {
      return errorResponse(res, 403, "Không có quyền xóa tài khoản này");
    }

    const deleted = await NguoiDung.delete(id);
    if (!deleted) {
      return errorResponse(res, 400, "Xóa không thành công");
    }
    return successResponse(res, "Xóa người dùng thành công");
  } catch (error) {
    console.error("Error deleting user:", error);
    return errorResponse(res, 500, "Lỗi xóa người dùng");
  }
};
