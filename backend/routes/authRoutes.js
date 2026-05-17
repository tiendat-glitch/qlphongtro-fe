const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/login", authController.login);
router.post("/register", authController.register);

// Khách thuê routes
router.post("/khach-thue/login", authController.loginKhachThue);
router.get("/khach-thue/me", authController.meKhachThue);
router.put("/khach-thue/me", authController.updateMeKhachThue);

module.exports = router;
