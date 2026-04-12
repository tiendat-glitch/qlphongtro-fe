const express = require("express");
const router = express.Router();
const suCoController = require("../controllers/suCoController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("admin", "chuNha", "nhanVien"));

router.get("/", suCoController.getAllSuCo);
router.get("/:id", suCoController.getSuCoById);
router.post("/", suCoController.createSuCo);
router.put("/:id", suCoController.updateSuCo);
router.delete("/:id", suCoController.deleteSuCo);

module.exports = router;
