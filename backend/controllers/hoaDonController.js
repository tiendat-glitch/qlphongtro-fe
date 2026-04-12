const HoaDon = require("../models/HoaDon");
const HopDong = require("../models/HopDong");
const ChiSoDienNuoc = require("../models/ChiSoDienNuoc");
const { successResponse, errorResponse } = require("../common/response");

exports.getAllHoaDon = async (req, res) => {
  try {
    const filters = {
      trangThai: req.query.trangThai,
      hopDong_id: req.query.hopDong_id,
      thang: req.query.thang,
      nam: req.query.nam,
    };
    const hoaDons = await HoaDon.findAll(filters);
    return successResponse(res, "Lấy danh sách hóa đơn thành công", hoaDons);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lấy danh sách hóa đơn thất bại");
  }
};

exports.getLatestReading = async (req, res) => {
  try {
    const { hopDong, thang, nam } = req.query;
    if (!hopDong) {
      return errorResponse(res, 400, "Thiếu ID hợp đồng");
    }

    const hopDongData = await HopDong.findById(hopDong);
    if (!hopDongData) {
      return errorResponse(res, 404, "Hợp đồng không tồn tại");
    }

    const hoaDons = await HoaDon.findAll({ hopDong_id: hopDong });

    const targetThang = parseInt(thang) || 1;
    const targetNam = parseInt(nam) || new Date().getFullYear();

    // HoaDon.findAll includes "ORDER BY hd.nam DESC, hd.thang DESC".
    // Find the first one that is strictly earlier than targetNam/targetThang.
    const lastHoaDon = hoaDons.find(
      (hd) =>
        hd.nam < targetNam || (hd.nam === targetNam && hd.thang < targetThang),
    );

    return res.json({
      success: true,
      data: {
        chiSoDienBanDau: lastHoaDon
          ? lastHoaDon.chiSoDienCuoiKy || 0
          : hopDongData.chiSoDienBanDau || 0,
        chiSoNuocBanDau: lastHoaDon
          ? lastHoaDon.chiSoNuocCuoiKy || 0
          : hopDongData.chiSoNuocBanDau || 0,
        isFirstInvoice: !lastHoaDon,
        lastInvoiceMonth: lastHoaDon
          ? `${lastHoaDon.thang}/${lastHoaDon.nam}`
          : null,
      },
      message: lastHoaDon
        ? `Lấy chỉ số từ hóa đơn ${lastHoaDon.thang}/${lastHoaDon.nam}`
        : "Lấy chỉ số ban đầu từ hợp đồng",
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lỗi lấy chỉ số mới nhất");
  }
};

exports.getHoaDonById = async (req, res) => {
  try {
    const hoaDon = await HoaDon.findById(req.params.id);
    if (!hoaDon) {
      return errorResponse(res, 404, "Không tìm thấy hóa đơn");
    }
    return successResponse(res, "Lấy thông tin hóa đơn thành công", hoaDon);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lấy thông tin hóa đơn thất bại");
  }
};

exports.createHoaDon = async (req, res) => {
  try {
    const extractId = (val) => {
      if (!val) return null;
      if (typeof val === "object") {
        return val.id || val._id || val.value || null;
      }
      return isNaN(Number(val)) ? val : Number(val);
    };

    console.log(
      "--- createHoaDon incoming req.body:",
      JSON.stringify(req.body, null, 2),
    );

    let data = { ...req.body };

    // Mapping relay fields
    if (data.hopDong) {
      data.hopDong_id = extractId(data.hopDong);
      delete data.hopDong;
    }
    if (data.phong) {
      data.phong_id = extractId(data.phong);
      delete data.phong;
    }
    if (data.khachThue) {
      data.khachThue_id = extractId(data.khachThue);
      delete data.khachThue;
    }

    console.log(
      "--- createHoaDon processed data:",
      JSON.stringify(data, null, 2),
    );

    // Đảm bảo các trường số là Number để tránh lỗi NaN hoặc SQL Errors
    data.thang = Number(data.thang || 1);
    data.nam = Number(data.nam || new Date().getFullYear());
    data.tienPhong = Number(data.tienPhong || 0);
    data.tienDien = Number(data.tienDien || 0);
    data.soDien = Number(data.soDien || 0);
    data.chiSoDienBanDau = Number(data.chiSoDienBanDau || 0);
    data.chiSoDienCuoiKy = Number(data.chiSoDienCuoiKy || 0);
    data.tienNuoc = Number(data.tienNuoc || 0);
    data.soNuoc = Number(data.soNuoc || 0);
    data.chiSoNuocBanDau = Number(data.chiSoNuocBanDau || 0);
    data.chiSoNuocCuoiKy = Number(data.chiSoNuocCuoiKy || 0);
    data.tongTien = Number(data.tongTien || 0);
    data.daThanhToan = Number(data.daThanhToan || 0);

    // Tính toán lại các chỉ số tiêu thụ cho chắc chắn
    data.soDien = Math.max(0, data.chiSoDienCuoiKy - data.chiSoDienBanDau);
    data.soNuoc = Math.max(0, data.chiSoNuocCuoiKy - data.chiSoNuocBanDau);
    data.conLai = data.tongTien - data.daThanhToan;

    // Cập nhật trạng thái thanh toán dựa trên số tiền
    if (data.conLai <= 0) {
      data.trangThai = "daThanhToan";
    } else if (data.daThanhToan > 0) {
      data.trangThai = "daThanhToanMotPhan";
    } else {
      data.trangThai = "chuaThanhToan";
    }

    const newId = await HoaDon.create(data);
    const newHoaDon = await HoaDon.findById(newId);
    return successResponse(res, "Lập hóa đơn thành công", newHoaDon);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lỗi khi lập hóa đơn");
  }
};

exports.updateHoaDon = async (req, res) => {
  try {
    const hoaDon = await HoaDon.findById(req.params.id);
    if (!hoaDon) {
      return errorResponse(res, 404, "Không tìm thấy hóa đơn");
    }

    let data = { ...req.body };

    // Helper function to extract ID from potentially nested object
    const extractId = (val) => {
      if (!val) return null;
      if (typeof val === "object") {
        return val.id || val._id || null;
      }
      return val;
    };

    // Ánh xạ trường từ frontend (hopDong, phong, khachThue) sang backend (hopDong_id, phong_id, khachThue_id)
    if (data.hopDong) {
      data.hopDong_id = extractId(data.hopDong);
      delete data.hopDong;
    }
    if (data.phong) {
      data.phong_id = extractId(data.phong);
      delete data.phong;
    }
    if (data.khachThue) {
      data.khachThue_id = extractId(data.khachThue);
      delete data.khachThue;
    }
    // Cập nhật lại logic trang thai
    if (data.daThanhToan !== undefined && data.tongTien === undefined) {
      data.conLai = hoaDon.tongTien - data.daThanhToan;
    } else if (data.tongTien !== undefined) {
      data.conLai =
        data.tongTien -
        (data.daThanhToan !== undefined
          ? data.daThanhToan
          : hoaDon.daThanhToan);
    }

    if (data.conLai !== undefined) {
      if (data.conLai <= 0) {
        data.trangThai = "daThanhToan";
      } else if ((data.daThanhToan || hoaDon.daThanhToan) > 0) {
        data.trangThai = "daThanhToanMotPhan";
      } else {
        data.trangThai = "chuaThanhToan";
      }
    }

    await HoaDon.update(req.params.id, data);
    const updatedHoaDon = await HoaDon.findById(req.params.id);
    return successResponse(res, "Cập nhật hóa đơn thành công", updatedHoaDon);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lỗi khi cập nhật hóa đơn");
  }
};

exports.deleteHoaDon = async (req, res) => {
  try {
    const hoaDon = await HoaDon.findById(req.params.id);
    if (!hoaDon) {
      return errorResponse(res, 404, "Không tìm thấy hóa đơn");
    }

    await HoaDon.delete(req.params.id);
    return successResponse(res, "Xóa hóa đơn thành công");
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lỗi khi xóa hóa đơn");
  }
};

exports.checkAutoCreateStatus = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const activeContracts = await HopDong.findAll({ trangThai: "hoatDong" });
    const validContracts = activeContracts.filter((c) => {
      const batDau = new Date(c.ngayBatDau);
      const ketThuc = new Date(c.ngayKetThuc);
      return currentDate >= batDau && currentDate <= ketThuc;
    });

    const activeContractsCount = validContracts.length;

    const allInvoices = await HoaDon.findAll({
      thang: currentMonth,
      nam: currentYear,
    });

    let contractsWithoutReadingsCount = 0;

    for (const contract of validContracts) {
      const readings = await ChiSoDienNuoc.findAll({
        phong_id: contract.phong_id,
        thang: currentMonth,
        nam: currentYear,
      });
      if (!readings || readings.length === 0) {
        contractsWithoutReadingsCount++;
      }
    }

    return res.json({
      success: true,
      data: {
        currentMonth,
        currentYear,
        activeContractsCount,
        existingInvoicesCount: allInvoices.length,
        contractsWithoutReadingsCount,
        canRun: activeContractsCount > 0 && contractsWithoutReadingsCount === 0,
      },
    });
  } catch (error) {
    console.error("Error checking auto-invoice status:", error);
    return errorResponse(
      res,
      500,
      "Lỗi khi kiểm tra trạng thái tạo hóa đơn tự động",
    );
  }
};

exports.autoCreateHoaDon = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const activeContracts = await HopDong.findAll({ trangThai: "hoatDong" });
    const validContracts = activeContracts.filter((c) => {
      const batDau = new Date(c.ngayBatDau);
      const ketThuc = new Date(c.ngayKetThuc);
      return currentDate >= batDau && currentDate <= ketThuc;
    });

    let createdInvoices = 0;
    let errors = [];

    for (const contract of validContracts) {
      try {
        const existingInvoice = await HoaDon.findAll({
          hopDong_id: contract.id,
          thang: currentMonth,
          nam: currentYear,
        });

        if (existingInvoice && existingInvoice.length > 0) {
          continue;
        }

        const chiSoList = await ChiSoDienNuoc.findAll({
          phong_id: contract.phong_id,
          thang: currentMonth,
          nam: currentYear,
        });

        if (!chiSoList || chiSoList.length === 0) {
          errors.push(
            `Chưa có chỉ số điện nước cho phòng ID ${contract.phong_id} tháng ${currentMonth}/${currentYear}`,
          );
          continue;
        }

        const chiSo = chiSoList[0];

        // Lấy chỉ số tháng trước
        let prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        let prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

        const prevChiSoList = await ChiSoDienNuoc.findAll({
          phong_id: contract.phong_id,
          thang: prevMonth,
          nam: prevYear,
        });

        let soDienTieuThu = 0;
        let soNuocTieuThu = 0;

        const thangBatDau = new Date(contract.ngayBatDau).getMonth() + 1;
        const namBatDau = new Date(contract.ngayBatDau).getFullYear();

        if (currentMonth === thangBatDau && currentYear === namBatDau) {
          soDienTieuThu = Math.max(
            0,
            chiSo.chiSoDien - contract.chiSoDienBanDau,
          );
          soNuocTieuThu = Math.max(
            0,
            chiSo.chiSoNuoc - contract.chiSoNuocBanDau,
          );
        } else {
          const prevChiSoDien =
            prevChiSoList.length > 0
              ? prevChiSoList[0].chiSoDien
              : contract.chiSoDienBanDau;
          const prevChiSoNuoc =
            prevChiSoList.length > 0
              ? prevChiSoList[0].chiSoNuoc
              : contract.chiSoNuocBanDau;
          soDienTieuThu = Math.max(0, chiSo.chiSoDien - prevChiSoDien);
          soNuocTieuThu = Math.max(0, chiSo.chiSoNuoc - prevChiSoNuoc);
        }

        const tienDien = soDienTieuThu * contract.giaDien;
        const tienNuoc = soNuocTieuThu * contract.giaNuoc;
        const phiDichVu = contract.phiDichVu || "[]";
        const phiDichVuArr =
          typeof phiDichVu === "string" ? JSON.parse(phiDichVu) : phiDichVu;
        const tongTienDichVu = Array.isArray(phiDichVuArr)
          ? phiDichVuArr.reduce((sum, dv) => sum + (Number(dv.gia) || 0), 0)
          : 0;
        const tongTien =
          contract.tienThue + tienDien + tienNuoc + tongTienDichVu;

        const maPhongStr = contract.phong_id.toString().padStart(3, "0");
        const invoiceNumber = `HD${currentYear}${currentMonth.toString().padStart(2, "0")}P${maPhongStr}`;

        const dueDate = new Date(
          currentYear,
          currentMonth - 1,
          contract.ngayThanhToan || 5,
        );
        if (dueDate < currentDate) {
          dueDate.setMonth(dueDate.getMonth() + 1);
        }

        const newInvoice = {
          maHoaDon: invoiceNumber,
          hopDong_id: contract.id,
          phong_id: contract.phong_id,
          khachThue_id: contract.nguoiDaiDien_id,
          thang: currentMonth,
          nam: currentYear,
          tienPhong: contract.tienThue,
          tienDien,
          soDien: soDienTieuThu,
          tienNuoc,
          soNuoc: soNuocTieuThu,
          phiDichVu: JSON.stringify(phiDichVuArr),
          tongTien,
          daThanhToan: 0,
          conLai: tongTien,
          hanThanhToan: dueDate.toISOString().split("T")[0],
          trangThai: "chuaThanhToan",
        };

        await HoaDon.create(newInvoice);
        createdInvoices++;
      } catch (err) {
        console.error("Error creating invoice for contract", contract.id, err);
        errors.push(
          `Lỗi tạo hóa đơn cho hợp đồng ${contract.id}: ${err.message}`,
        );
      }
    }

    return res.json({
      success: true,
      data: {
        createdInvoices,
        totalContracts: validContracts.length,
        errors,
      },
      message: `Đã tạo ${createdInvoices} hóa đơn tự động`,
    });
  } catch (error) {
    console.error("Error in auto invoice generation", error);
    return errorResponse(res, 500, "Lỗi khi tạo hóa đơn tự động");
  }
};
