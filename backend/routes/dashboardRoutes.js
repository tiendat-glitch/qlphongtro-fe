const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const dashboardController = require("../controllers/dashboardController");

const router = express.Router();

router.get(
  "/stats",
  protect,
  authorize("admin", "chuNha", "nhanVien"),
  dashboardController.getStats,
);

module.exports = router;
