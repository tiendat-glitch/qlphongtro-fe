const express = require("express");
const router = express.Router();
const thanhToanController = require("../controllers/thanhToanController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("admin", "chuNha", "nhanVien"));

router.get("/", thanhToanController.getAllThanhToan);
router.get("/:id", thanhToanController.getThanhToanById);
router.post("/", thanhToanController.createThanhToan);
// Thường thì thanh toán ít khi được phép sửa (liên quan đến transaction), chỉ cho phép rollback(delete) rồi nhập lại
router.delete("/:id", thanhToanController.deleteThanhToan);

module.exports = router;
