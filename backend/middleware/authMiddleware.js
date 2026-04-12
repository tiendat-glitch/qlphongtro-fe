const jwt = require("jsonwebtoken");
const { errorResponse } = require("../common/response");

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return errorResponse(res, 401, "Không có quyền truy cập (Missing token)");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "super_secret");
    req.user = decoded; // { id, email, vaiTro, ten, iat, exp }
    next();
  } catch (err) {
    return errorResponse(res, 401, "Token không hợp lệ hoặc đã hết hạn");
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.vaiTro)) {
      return errorResponse(
        res,
        403,
        "Bạn không có quyền thực hiện hành động này",
      );
    }
    next();
  };
};
