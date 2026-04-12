const Phong = require("../models/Phong");
const { successResponse, errorResponse } = require("../common/response");

exports.getAllPhong = async (req, res) => {
  try {
    const filters = {
      toaNha_id: req.query.toaNha_id,
      trangThai: req.query.trangThai,
      tang: req.query.tang,
    };
    const phongs = await Phong.findAll(filters);
    return successResponse(res, "Lấy danh sách phòng thành công", phongs);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lấy danh sách phòng thất bại");
  }
};

exports.getPhongById = async (req, res) => {
  try {
    const phong = await Phong.findById(req.params.id);
    if (!phong) {
      return errorResponse(res, 404, "Không tìm thấy phòng");
    }
    return successResponse(res, "Lấy thông tin phòng thành công", phong);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lấy thông tin phòng thất bại");
  }
};

exports.createPhong = async (req, res) => {
  try {
    const newId = await Phong.create(req.body);
    const newPhong = await Phong.findById(newId);
    return successResponse(res, "Tạo phòng thành công", newPhong);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lỗi khi tạo phòng");
  }
};

exports.updatePhong = async (req, res) => {
  try {
    const phong = await Phong.findById(req.params.id);
    if (!phong) {
      return errorResponse(res, 404, "Không tìm thấy phòng");
    }

    await Phong.update(req.params.id, req.body);
    const updatedPhong = await Phong.findById(req.params.id);
    return successResponse(res, "Cập nhật phòng thành công", updatedPhong);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lỗi khi cập nhật phòng");
  }
};

exports.deletePhong = async (req, res) => {
  try {
    const phong = await Phong.findById(req.params.id);
    if (!phong) {
      return errorResponse(res, 404, "Không tìm thấy phòng");
    }

    await Phong.delete(req.params.id);
    return successResponse(res, "Xóa phòng thành công");
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lỗi khi xóa phòng");
  }
};

exports.getPublicPhong = async (req, res) => {
  try {
    const filters = {
      toaNha_id: req.query.toaNha_id,
      trangThai: req.query.trangThai,
    };
    const phongs = await Phong.findPublicRooms(filters);
    return successResponse(
      res,
      "Lay danh sach phong public thanh cong",
      phongs,
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lay danh sach phong public that bai");
  }
};

exports.getPublicPhongById = async (req, res) => {
  try {
    const phong = await Phong.findPublicById(req.params.id);
    if (!phong) {
      return errorResponse(res, 404, "Khong tim thay phong public");
    }
    return successResponse(res, "Lay thong tin phong public thanh cong", phong);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lay thong tin phong public that bai");
  }
};
