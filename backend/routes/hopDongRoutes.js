const express = require("express");
const router = express.Router();
const hopDongController = require("../controllers/hopDongController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("admin", "chuNha", "nhanVien"));

router.get("/", hopDongController.getAllHopDong);
router.get("/:id", hopDongController.getHopDongById);
router.post("/", hopDongController.createHopDong);
router.put("/:id", hopDongController.updateHopDong);
router.delete("/:id", hopDongController.deleteHopDong);

module.exports = router;
