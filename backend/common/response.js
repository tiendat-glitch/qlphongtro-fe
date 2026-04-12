/**
 * Chuẩn hóa response trả về
 */
const sendResponse = (res, statusCode, success, message, data = null) => {
  const response = {
    success,
    message,
  };
  if (data !== null) {
    response.data = data;
  }
  return res.status(statusCode).json(response);
};

/**
 * Trả về khi thành công
 */
const successResponse = (res, message, data = null) => {
  return sendResponse(res, 200, true, message, data);
};

/**
 * Trả về khi có lỗi (Bad Request, Unauthorized, etc)
 */
const errorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message,
  };
  if (errors !== null) {
    response.errors = errors; // Gửi kèm validation errors nếu có
  }
  return res.status(statusCode).json(response);
};

module.exports = {
  sendResponse,
  successResponse,
  errorResponse,
};
