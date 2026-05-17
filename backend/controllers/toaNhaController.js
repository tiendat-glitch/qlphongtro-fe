const ToaNha = require("../models/ToaNha");
const Phong = require("../models/Phong"); // Giả định sẽ có
const { successResponse, errorResponse } = require("../common/response");

exports.getAllToaNha = async (req, res) => {
  try {
    const { chuSoHuu } = req.query;
    // Nếu user đang login có role là chuNha, có thể chỉ trả về nhà của họ
    let chuSoHuuQuery = chuSoHuu;
    if (req.user && req.user.vaiTro === "chuNha") {
      chuSoHuuQuery = req.user.id;
    }

    const toanhas = await ToaNha.findAll(chuSoHuuQuery);
    return successResponse(res, "Lấy danh sách tòa nhà thành công", toanhas);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lấy danh sách tòa nhà thất bại");
  }
};

exports.getToaNhaById = async (req, res) => {
  try {
    const toanha = await ToaNha.findById(req.params.id);
    if (!toanha) {
      return errorResponse(res, 404, "Không tìm thấy tòa nhà");
    }
    return successResponse(res, "Lấy thông tin tòa nhà thành công", toanha);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lấy thông tin tòa nhà thất bại");
  }
};

exports.createToaNha = async (req, res) => {
  try {
    const data = req.body;
    // Lấy admin/chủ nhà từ user token
    if (!data.chuSoHuu_id && req.user) {
      data.chuSoHuu_id = req.user.id;
    }

    const newId = await ToaNha.create(data);
    const newToaNha = await ToaNha.findById(newId);
    return successResponse(res, "Tạo tòa nhà thành công", newToaNha);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lỗi khi tạo tòa nhà");
  }
};

exports.updateToaNha = async (req, res) => {
  try {
    const toanha = await ToaNha.findById(req.params.id);
    if (!toanha) {
      return errorResponse(res, 404, "Không tìm thấy tòa nhà");
    }

    // Kiểm tra quyền
    if (
      req.user &&
      req.user.vaiTro === "chuNha" &&
      toanha.chuSoHuu_id !== req.user.id
    ) {
      return errorResponse(res, 403, "Bạn không có quyền sửa tòa nhà này");
    }

    await ToaNha.update(req.params.id, req.body);
    const updatedToaNha = await ToaNha.findById(req.params.id);
    return successResponse(res, "Cập nhật tòa nhà thành công", updatedToaNha);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lỗi khi cập nhật tòa nhà");
  }
};

exports.deleteToaNha = async (req, res) => {
  try {
    const toanha = await ToaNha.findById(req.params.id);
    if (!toanha) {
      return errorResponse(res, 404, "Không tìm thấy tòa nhà");
    }

    // Kiểm tra quyền
    if (req.user && req.user.vaiTro === "nhanVien") {
      return errorResponse(res, 403, "Nhân viên không có quyền xóa tòa nhà này");
    }

    if (
      req.user &&
      req.user.vaiTro === "chuNha" &&
      toanha.chuSoHuu_id !== req.user.id
    ) {
      return errorResponse(res, 403, "Bạn không có quyền xóa tòa nhà này");
    }

    await ToaNha.delete(req.params.id);
    return successResponse(res, "Xóa tòa nhà thành công");
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lỗi khi xóa tòa nhà");
  }
};
