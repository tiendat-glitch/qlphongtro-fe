const express = require("express");
const router = express.Router();
const toaNhaController = require("../controllers/toaNhaController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Chỉ cho phép user đã đăng nhập
router.use(protect, authorize("admin", "chuNha", "nhanVien"));

router.get("/", toaNhaController.getAllToaNha);
router.get("/:id", toaNhaController.getToaNhaById);
router.post("/", toaNhaController.createToaNha);
router.put("/:id", toaNhaController.updateToaNha);
router.delete("/:id", toaNhaController.deleteToaNha);

module.exports = router;
