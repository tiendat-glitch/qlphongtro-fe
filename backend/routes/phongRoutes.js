const express = require("express");
const router = express.Router();
const phongController = require("../controllers/phongController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("admin", "chuNha", "nhanVien"));

router.get("/", phongController.getAllPhong);
router.get("/:id", phongController.getPhongById);
router.post("/", phongController.createPhong);
router.put("/:id", phongController.updatePhong);
router.delete("/:id", phongController.deletePhong);

module.exports = router;
