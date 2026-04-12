const ChiSoDienNuoc = require("../models/ChiSoDienNuoc");
const { successResponse, errorResponse } = require("../common/response");

exports.getAllChiSo = async (req, res) => {
  try {
    const filters = {
      phong_id: req.query.phong_id,
      thang: req.query.thang,
      nam: req.query.nam,
    };
    const dsChiSo = await ChiSoDienNuoc.findAll(filters);
    return successResponse(res, "Lấy danh sách chỉ số thành công", dsChiSo);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lấy danh sách chỉ số thất bại");
  }
};

exports.getChiSoById = async (req, res) => {
  try {
    const chiSo = await ChiSoDienNuoc.findById(req.params.id);
    if (!chiSo) {
      return errorResponse(res, 404, "Không tìm thấy chỉ số");
    }
    return successResponse(res, "Lấy thông tin chỉ số thành công", chiSo);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lấy thông tin chỉ số thất bại");
  }
};

exports.createChiSo = async (req, res) => {
  try {
    let data = { ...req.body };
    if (!data.nguoiChot_id && req.user) {
      data.nguoiChot_id = req.user.id;
    }

    const newId = await ChiSoDienNuoc.create(data);
    const newChiSo = await ChiSoDienNuoc.findById(newId);
    return successResponse(res, "Chốt chỉ số thành công", newChiSo);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lỗi khi chốt chỉ số");
  }
};

exports.updateChiSo = async (req, res) => {
  try {
    const chiSo = await ChiSoDienNuoc.findById(req.params.id);
    if (!chiSo) {
      return errorResponse(res, 404, "Không tìm thấy chỉ số");
    }

    await ChiSoDienNuoc.update(req.params.id, req.body);
    const updatedChiSo = await ChiSoDienNuoc.findById(req.params.id);
    return successResponse(res, "Cập nhật chỉ số thành công", updatedChiSo);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lỗi khi cập nhật chỉ số");
  }
};

exports.deleteChiSo = async (req, res) => {
  try {
    const chiSo = await ChiSoDienNuoc.findById(req.params.id);
    if (!chiSo) {
      return errorResponse(res, 404, "Không tìm thấy chỉ số");
    }

    await ChiSoDienNuoc.delete(req.params.id);
    return successResponse(res, "Xóa chỉ số thành công");
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lỗi khi xóa chỉ số");
  }
};
