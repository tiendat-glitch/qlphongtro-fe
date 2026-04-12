const KhachThue = require("../models/KhachThue");
const { successResponse, errorResponse } = require("../common/response");

exports.getAllKhachThue = async (req, res) => {
  try {
    const filters = {
      trangThai: req.query.trangThai,
    };
    const khachThues = await KhachThue.findAll(filters);
    return successResponse(
      res,
      "Lấy danh sách khách thuê thành công",
      khachThues,
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lấy danh sách khách thuê thất bại");
  }
};

exports.getKhachThueById = async (req, res) => {
  try {
    const khach = await KhachThue.findById(req.params.id);
    if (!khach) {
      return errorResponse(res, 404, "Không tìm thấy khách thuê");
    }
    return successResponse(res, "Lấy thông tin khách thuê thành công", khach);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lấy thông tin khách thuê thất bại");
  }
};

exports.createKhachThue = async (req, res) => {
  try {
    const { cccd, soDienThoai } = req.body;

    // Kiểm tra CCCD và SĐT tồn tại
    const existingCCCD = await KhachThue.findByCCCD(cccd);
    if (existingCCCD) {
      return errorResponse(
        res,
        400,
        "Căn cước công dân đã tồn tại trong hệ thống",
      );
    }

    const existingPhone = await KhachThue.findByPhone(soDienThoai);
    if (existingPhone) {
      return errorResponse(res, 400, "Số điện thoại đã tồn tại trong hệ thống");
    }

    const newId = await KhachThue.create(req.body);
    const newKhach = await KhachThue.findById(newId);
    return successResponse(res, "Tạo khách thuê thành công", newKhach);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lỗi khi tạo khách thuê");
  }
};

exports.updateKhachThue = async (req, res) => {
  try {
    const khach = await KhachThue.findById(req.params.id);
    if (!khach) {
      return errorResponse(res, 404, "Không tìm thấy khách thuê");
    }

    const { cccd, soDienThoai } = req.body;
    if (cccd && cccd !== khach.cccd) {
      const existingCCCD = await KhachThue.findByCCCD(cccd);
      if (existingCCCD)
        return errorResponse(res, 400, "Căn cước công dân mới đã tồn tại");
    }
    if (soDienThoai && soDienThoai !== khach.soDienThoai) {
      const existingPhone = await KhachThue.findByPhone(soDienThoai);
      if (existingPhone)
        return errorResponse(res, 400, "Số điện thoại mới đã tồn tại");
    }

    await KhachThue.update(req.params.id, req.body);
    const updatedKhach = await KhachThue.findById(req.params.id);
    return successResponse(res, "Cập nhật khách thuê thành công", updatedKhach);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lỗi khi cập nhật khách thuê");
  }
};

exports.deleteKhachThue = async (req, res) => {
  try {
    const khach = await KhachThue.findById(req.params.id);
    if (!khach) {
      return errorResponse(res, 404, "Không tìm thấy khách thuê");
    }

    await KhachThue.delete(req.params.id);
    return successResponse(res, "Xóa khách thuê thành công");
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lỗi khi xóa khách thuê");
  }
};
