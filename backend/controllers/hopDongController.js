const HopDong = require("../models/HopDong");
const { successResponse, errorResponse } = require("../common/response");

const REQUIRED_FIELDS = [
  "phong_id",
  "nguoiDaiDien_id",
  "ngayBatDau",
  "ngayKetThuc",
  "giaThue",
  "tienCoc",
  "ngayThanhToan",
  "dieuKhoan",
  "giaDien",
  "giaNuoc",
  "chiSoDienBanDau",
  "chiSoNuocBanDau",
];

const NUMERIC_FIELDS = [
  "giaThue",
  "tienCoc",
  "ngayThanhToan",
  "giaDien",
  "giaNuoc",
  "chiSoDienBanDau",
  "chiSoNuocBanDau",
];

const extractId = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const rawValue = typeof value === "object" ? (value.id ?? value._id) : value;
  const numericValue = Number(rawValue);
  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    return null;
  }
  return numericValue;
};

const isMissing = (value) =>
  value === undefined ||
  value === null ||
  (typeof value === "string" && value.trim() === "");

const normalizeDate = (value) => {
  if (typeof value !== "string" && !(value instanceof Date)) {
    return null;
  }
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }
  return parsedDate.toISOString().split("T")[0];
};

const normalizeMaHopDong = (value) => {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") return null;
  return value.trim();
};

const isDuplicateMaHopDongError = (error) =>
  error?.code === "ER_DUP_ENTRY" &&
  String(error?.sqlMessage || "").includes("maHopDong");

exports.getAllHopDong = async (req, res) => {
  try {
    const filters = {
      trangThai: req.query.trangThai,
      phong_id: req.query.phong_id,
    };
    const hopDongs = await HopDong.findAll(filters);
    return successResponse(res, "Lấy danh sách hợp đồng thành công", hopDongs);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lấy danh sách hợp đồng thất bại");
  }
};

exports.getHopDongById = async (req, res) => {
  try {
    const hopDong = await HopDong.findById(req.params.id);
    if (!hopDong) {
      return errorResponse(res, 404, "Không tìm thấy hợp đồng");
    }
    return successResponse(res, "Lấy thông tin hợp đồng thành công", hopDong);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lấy thông tin hợp đồng thất bại");
  }
};

exports.createHopDong = async (req, res) => {
  try {
    const data = { ...req.body };

    if (data.phong) {
      data.phong_id = extractId(data.phong);
      delete data.phong;
    }
    if (data.nguoiDaiDien) {
      data.nguoiDaiDien_id = extractId(data.nguoiDaiDien);
      delete data.nguoiDaiDien;
    }
    if (Array.isArray(data.khachThueId)) {
      data.khachThueIds = data.khachThueId.map(extractId).filter(Boolean);
      delete data.khachThueId;
    }

    const missingFields = REQUIRED_FIELDS.filter((field) =>
      isMissing(data[field]),
    );
    if (missingFields.length > 0) {
      return errorResponse(
        res,
        400,
        `Thieu truong bat buoc: ${missingFields.join(", ")}`,
      );
    }

    if (!Number.isInteger(data.phong_id) || data.phong_id <= 0) {
      return errorResponse(res, 400, "phong_id khong hop le");
    }
    if (!Number.isInteger(data.nguoiDaiDien_id) || data.nguoiDaiDien_id <= 0) {
      return errorResponse(res, 400, "nguoiDaiDien_id khong hop le");
    }

    const invalidNumberFields = [];
    for (const field of NUMERIC_FIELDS) {
      const numericValue = Number(data[field]);
      if (!Number.isInteger(numericValue)) {
        invalidNumberFields.push(field);
      } else {
        data[field] = numericValue;
      }
    }
    if (invalidNumberFields.length > 0) {
      return errorResponse(
        res,
        400,
        `Gia tri so khong hop le: ${invalidNumberFields.join(", ")}`,
      );
    }

    if (data.ngayThanhToan < 1 || data.ngayThanhToan > 31) {
      return errorResponse(
        res,
        400,
        "ngayThanhToan phai nam trong khoang 1 den 31",
      );
    }
    if (
      data.giaThue <= 0 ||
      data.tienCoc < 0 ||
      data.giaDien <= 0 ||
      data.giaNuoc <= 0
    ) {
      return errorResponse(res, 400, "Gia tri tien khong hop le");
    }
    if (data.chiSoDienBanDau < 0 || data.chiSoNuocBanDau < 0) {
      return errorResponse(res, 400, "Chi so dien nuoc ban dau khong duoc am");
    }

    const normalizedNgayBatDau = normalizeDate(data.ngayBatDau);
    const normalizedNgayKetThuc = normalizeDate(data.ngayKetThuc);
    if (!normalizedNgayBatDau || !normalizedNgayKetThuc) {
      return errorResponse(
        res,
        400,
        "ngayBatDau hoac ngayKetThuc khong hop le",
      );
    }
    if (
      new Date(normalizedNgayKetThuc).getTime() <
      new Date(normalizedNgayBatDau).getTime()
    ) {
      return errorResponse(
        res,
        400,
        "ngayKetThuc phai lon hon hoac bang ngayBatDau",
      );
    }
    data.ngayBatDau = normalizedNgayBatDau;
    data.ngayKetThuc = normalizedNgayKetThuc;

    data.dieuKhoan = String(data.dieuKhoan || "").trim();
    if (!data.dieuKhoan) {
      return errorResponse(res, 400, "dieuKhoan khong duoc de trong");
    }

    if (
      data.phiDichVu === undefined ||
      data.phiDichVu === null ||
      data.phiDichVu === ""
    ) {
      data.phiDichVu = [];
    } else if (typeof data.phiDichVu === "string") {
      try {
        data.phiDichVu = JSON.parse(data.phiDichVu);
      } catch (error) {
        return errorResponse(res, 400, "phiDichVu phai la JSON hop le");
      }
    } else if (typeof data.phiDichVu !== "object") {
      return errorResponse(res, 400, "phiDichVu khong hop le");
    }

    if (data.khachThueIds !== undefined) {
      if (!Array.isArray(data.khachThueIds)) {
        return errorResponse(res, 400, "khachThueIds phai la mang");
      }

      const normalizedTenantIds = data.khachThueIds.map(extractId);
      if (normalizedTenantIds.some((id) => id === null)) {
        return errorResponse(res, 400, "khachThueIds chua id khong hop le");
      }

      data.khachThueIds = [...new Set(normalizedTenantIds)];
      const existingTenantIds = await HopDong.findExistingKhachThueIds(
        data.khachThueIds,
      );
      const existingTenantSet = new Set(existingTenantIds);
      const missingTenantIds = data.khachThueIds.filter(
        (id) => !existingTenantSet.has(id),
      );
      if (missingTenantIds.length > 0) {
        return errorResponse(
          res,
          400,
          `khachThueIds khong ton tai: ${missingTenantIds.join(", ")}`,
        );
      }
    }

    const [isPhongExists, isNguoiDaiDienExists] = await Promise.all([
      HopDong.phongExists(data.phong_id),
      HopDong.khachThueExists(data.nguoiDaiDien_id),
    ]);

    if (!isPhongExists) {
      return errorResponse(
        res,
        400,
        `phong_id khong ton tai: ${data.phong_id}`,
      );
    }
    if (!isNguoiDaiDienExists) {
      return errorResponse(
        res,
        400,
        `nguoiDaiDien_id khong ton tai: ${data.nguoiDaiDien_id}`,
      );
    }

    const maHopDongFromRequest = normalizeMaHopDong(data.maHopDong);
    if (maHopDongFromRequest === null) {
      return errorResponse(res, 400, "maHopDong khong hop le");
    }

    let isAutoGeneratedCode = false;
    if (maHopDongFromRequest) {
      data.maHopDong = maHopDongFromRequest;
      const isDuplicated = await HopDong.isMaHopDongExists(data.maHopDong);
      if (isDuplicated) {
        return errorResponse(
          res,
          409,
          `maHopDong da ton tai: ${data.maHopDong}`,
        );
      }
    } else {
      data.maHopDong = await HopDong.generateMaHopDong();
      isAutoGeneratedCode = true;
    }

    let newId = null;
    for (let retry = 0; retry < 5; retry++) {
      try {
        newId = await HopDong.create(data);
        break;
      } catch (error) {
        if (isAutoGeneratedCode && isDuplicateMaHopDongError(error)) {
          data.maHopDong = await HopDong.generateMaHopDong();
          continue;
        }
        throw error;
      }
    }

    if (!newId) {
      return errorResponse(
        res,
        500,
        "Khong the tao ma hop dong duy nhat, vui long thu lai",
      );
    }

    const newHopDong = await HopDong.findById(newId);
    return successResponse(res, "Tao hop dong thanh cong", newHopDong);
  } catch (error) {
    console.error(error);
    if (isDuplicateMaHopDongError(error)) {
      return errorResponse(res, 409, "maHopDong da ton tai");
    }
    if (error?.code === "ER_NO_REFERENCED_ROW_2") {
      return errorResponse(
        res,
        400,
        "Du lieu khoa ngoai khong ton tai (phong_id, nguoiDaiDien_id hoac khachThueIds)",
      );
    }
    if (error?.code === "ER_BAD_NULL_ERROR") {
      return errorResponse(
        res,
        400,
        "Du lieu tao hop dong thieu truong bat buoc",
      );
    }
    if (
      error?.code === "ER_WRONG_VALUE_FOR_TYPE" ||
      error?.code === "ER_TRUNCATED_WRONG_VALUE"
    ) {
      return errorResponse(res, 422, "Du lieu tao hop dong khong hop le");
    }
    if (
      error instanceof TypeError &&
      error.message.includes("Bind parameters must not contain undefined")
    ) {
      return errorResponse(
        res,
        400,
        "Du lieu tao hop dong thieu truong bat buoc",
      );
    }
    return errorResponse(res, 500, "Lỗi khi lập hợp đồng");
  }
};

exports.updateHopDong = async (req, res) => {
  try {
    // Helper function to extract ID from potentially nested object
    const extractId = (val) => {
      if (!val) return null;
      if (typeof val === "object") {
        return val.id || val._id || null;
      }
      return Number(val) || val;
    };

    const data = { ...req.body };
    // Ánh xạ trường từ frontend sang backend
    if (data.phong) {
      data.phong_id = extractId(data.phong);
      delete data.phong;
    }
    if (data.nguoiDaiDien) {
      data.nguoiDaiDien_id = extractId(data.nguoiDaiDien);
      delete data.nguoiDaiDien;
    }
    if (Array.isArray(data.khachThueId)) {
      data.khachThueIds = data.khachThueId.map(extractId).filter(Boolean);
      delete data.khachThueId;
    }

    await HopDong.update(req.params.id, data);
    const updatedHopDong = await HopDong.findById(req.params.id);
    return successResponse(res, "Cập nhật hợp đồng thành công", updatedHopDong);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lỗi khi cập nhật hợp đồng");
  }
};

exports.deleteHopDong = async (req, res) => {
  try {
    const hopDong = await HopDong.findById(req.params.id);
    if (!hopDong) {
      return errorResponse(res, 404, "Không tìm thấy hợp đồng");
    }

    if (req.user && req.user.vaiTro === "nhanVien") {
      return errorResponse(res, 403, "Nhân viên không có quyền xóa hợp đồng");
    }

    await HopDong.delete(req.params.id);
    return successResponse(res, "Xóa hợp đồng thành công");
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Lỗi khi xóa hợp đồng");
  }
};
