const ThanhToan = require("../models/ThanhToan");
const HoaDon = require("../models/HoaDon");
const { successResponse, errorResponse } = require("../common/response");

exports.getAllThanhToan = async (req, res) => {
  try {
    const filters = {
      hoaDon_id: req.query.hoaDon_id,
    };
    const thanhToans = await ThanhToan.findAll(filters);
    return successResponse(
      res,
      "Lấy danh sách thanh toán thành công",
      thanhToans,
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lấy danh sách thanh toán thất bại");
  }
};

exports.getThanhToanById = async (req, res) => {
  try {
    const thanhToan = await ThanhToan.findById(req.params.id);
    if (!thanhToan) {
      return errorResponse(res, 404, "Không tìm thấy thông tin thanh toán");
    }
    return successResponse(
      res,
      "Lấy thông tin thanh toán thành công",
      thanhToan,
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lấy thông tin thanh toán thất bại");
  }
};

exports.createThanhToan = async (req, res) => {
  try {
    let data = { ...req.body };
    if (!data.nguoiNhan_id && req.user) {
      data.nguoiNhan_id = req.user.id;
    }

    const hoaDon = await HoaDon.findById(data.hoaDon_id);
    if (!hoaDon) {
      return errorResponse(res, 404, "Không tìm thấy hóa đơn cần thanh toán");
    }

    // Tạo thanh toán
    const newId = await ThanhToan.create(data);

    // Cập nhật hóa đơn
    const newDaThanhToan = Number(hoaDon.daThanhToan) + Number(data.soTien);
    const newConLai = Number(hoaDon.tongTien) - newDaThanhToan;

    let newTrangThai = "chuaThanhToan";
    if (newConLai <= 0) newTrangThai = "daThanhToan";
    else if (newDaThanhToan > 0) newTrangThai = "daThanhToanMotPhan";

    await HoaDon.update(hoaDon.id, {
      daThanhToan: newDaThanhToan,
      conLai: newConLai < 0 ? 0 : newConLai,
      trangThai: newTrangThai,
    });

    const newThanhToan = await ThanhToan.findById(newId);
    const updatedHoaDon = await HoaDon.findById(hoaDon.id);
    return successResponse(res, "Thêm thanh toán thành công", {
      thanhToan: newThanhToan,
      hoaDon: updatedHoaDon,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lỗi khi tạo thanh toán");
  }
};

exports.deleteThanhToan = async (req, res) => {
  try {
    const thanhToan = await ThanhToan.findById(req.params.id);
    if (!thanhToan) {
      return errorResponse(res, 404, "Không tìm thấy giao dịch thanh toán");
    }

    // Khôi phục lại hóa đơn trước khi xóa giao dịch
    const hoaDon = await HoaDon.findById(thanhToan.hoaDon_id);
    if (hoaDon) {
      const rollbackDaThanhToan =
        Number(hoaDon.daThanhToan) - Number(thanhToan.soTien);
      const rollbackConLai = Number(hoaDon.tongTien) - rollbackDaThanhToan;
      let rollbackTrangThai = "chuaThanhToan";
      if (rollbackConLai <= 0) rollbackTrangThai = "daThanhToan";
      else if (rollbackDaThanhToan > 0)
        rollbackTrangThai = "daThanhToanMotPhan";

      await HoaDon.update(hoaDon.id, {
        daThanhToan: rollbackDaThanhToan < 0 ? 0 : rollbackDaThanhToan,
        conLai: rollbackConLai,
        trangThai: rollbackTrangThai,
      });
    }

    await ThanhToan.delete(req.params.id);
    const updatedHoaDon = hoaDon ? await HoaDon.findById(hoaDon.id) : null;
    return successResponse(res, "Xóa giao dịch thanh toán thành công", {
      hoaDon: updatedHoaDon,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lỗi khi xóa giao dịch thanh toán");
  }
};
