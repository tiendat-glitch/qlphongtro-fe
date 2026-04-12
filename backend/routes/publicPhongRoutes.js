const express = require("express");
const router = express.Router();
const phongController = require("../controllers/phongController");

router.get("/", phongController.getPublicPhong);
router.get("/:id", phongController.getPublicPhongById);

module.exports = router;
