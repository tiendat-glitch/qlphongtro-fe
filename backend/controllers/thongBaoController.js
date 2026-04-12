const ThongBao = require("../models/ThongBao");
const { successResponse, errorResponse } = require("../common/response");

exports.getAllThongBao = async (req, res) => {
  try {
    const filters = {
      nguoiChung: req.query.nguoiChung, // Filter if client passes it explicitly
      loaiThongBao: req.query.loaiThongBao,
    };

    // If it's a normal user, can auto force filter:
    if (req.user && req.user.vaiTro === "chuNha") {
      filters.nguoiChung = req.user.id;
    }

    const thongBaos = await ThongBao.findAll(filters);
    return successResponse(
      res,
      "Lấy danh sách thông báo thành công",
      thongBaos,
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lấy danh sách thông báo thất bại");
  }
};

exports.getThongBaoById = async (req, res) => {
  try {
    const thongBao = await ThongBao.findById(req.params.id);
    if (!thongBao) {
      return errorResponse(res, 404, "Không tìm thấy thông báo");
    }
    return successResponse(res, "Lấy thông báo thành công", thongBao);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lấy thông báo thất bại");
  }
};

exports.createThongBao = async (req, res) => {
  try {
    const newId = await ThongBao.create(req.body);
    const newThongBao = await ThongBao.findById(newId);
    return successResponse(res, "Tạo thông báo thành công", newThongBao);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lỗi khi tạo thông báo");
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const thongBao = await ThongBao.findById(req.params.id);
    if (!thongBao) {
      return errorResponse(res, 404, "Không tìm thấy thông báo");
    }

    await ThongBao.markAsRead(req.params.id);
    const updatedThongBao = await ThongBao.findById(req.params.id);
    return successResponse(res, "Đã đánh dấu đọc", updatedThongBao);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lỗi cập nhật thông báo");
  }
};

exports.deleteThongBao = async (req, res) => {
  try {
    const thongBao = await ThongBao.findById(req.params.id);
    if (!thongBao) {
      return errorResponse(res, 404, "Không tìm thấy thông báo");
    }

    await ThongBao.delete(req.params.id);
    return successResponse(res, "Xóa thông báo thành công");
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lỗi khi xóa thông báo");
  }
};
