const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Các route yêu cầu đăng nhập
router.use(protect, authorize("admin", "chuNha", "nhanVien"));

router.get("/me", userController.getProfile);
router.put("/me", userController.updateProfile);

// Routes dành cho Admin và ChuNha
router.get("/", authorize("admin", "chuNha"), userController.getAllUsers);
router.post("/", authorize("admin", "chuNha"), userController.adminCreateUser);
router.put("/:id", authorize("admin", "chuNha"), userController.adminUpdateUser);
router.delete("/:id", authorize("admin", "chuNha"), userController.adminDeleteUser);

module.exports = router;
