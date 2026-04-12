const express = require("express");
const router = express.Router();
const khachThueController = require("../controllers/khachThueController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("admin", "chuNha", "nhanVien"));

router.get("/", khachThueController.getAllKhachThue);
router.get("/:id", khachThueController.getKhachThueById);
router.post("/", khachThueController.createKhachThue);
router.put("/:id", khachThueController.updateKhachThue);
router.delete("/:id", khachThueController.deleteKhachThue);

module.exports = router;
