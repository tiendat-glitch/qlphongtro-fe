const SuCo = require("../models/SuCo");
const { successResponse, errorResponse } = require("../common/response");

exports.getAllSuCo = async (req, res) => {
  try {
    const filters = {
      trangThai: req.query.trangThai,
      phong_id: req.query.phong_id,
    };
    const suCos = await SuCo.findAll(filters);
    return successResponse(res, "Lấy danh sách sự cố thành công", suCos);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lấy danh sách sự cố thất bại");
  }
};

exports.getSuCoById = async (req, res) => {
  try {
    const suCo = await SuCo.findById(req.params.id);
    if (!suCo) {
      return errorResponse(res, 404, "Không tìm thấy sự cố");
    }
    return successResponse(res, "Lấy thông tin sự cố thành công", suCo);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lấy thông tin sự cố thất bại");
  }
};

exports.createSuCo = async (req, res) => {
  try {
    // Validation check for nguoiBao_id vs Token would go here if KhachThue can login. Since backend might only support admin/chuNha logins mostly, they can create SuCo on behalf of KhachThue.

    const newId = await SuCo.create(req.body);
    const newSuCo = await SuCo.findById(newId);
    return successResponse(res, "Báo cáo sự cố thành công", newSuCo);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lỗi khi báo cáo sự cố");
  }
};

exports.updateSuCo = async (req, res) => {
  try {
    const suCo = await SuCo.findById(req.params.id);
    if (!suCo) {
      return errorResponse(res, 404, "Không tìm thấy sự cố");
    }

    await SuCo.update(req.params.id, req.body);
    const updatedSuCo = await SuCo.findById(req.params.id);
    return successResponse(res, "Cập nhật sự cố thành công", updatedSuCo);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lỗi khi cập nhật sự cố");
  }
};

exports.deleteSuCo = async (req, res) => {
  try {
    const suCo = await SuCo.findById(req.params.id);
    if (!suCo) {
      return errorResponse(res, 404, "Không tìm thấy sự cố");
    }

    await SuCo.delete(req.params.id);
    return successResponse(res, "Xóa sự cố thành công");
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lỗi khi xóa sự cố");
  }
};
