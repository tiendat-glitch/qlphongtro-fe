const express = require('express');
const router = express.Router();
const thongBaoController = require('../controllers/thongBaoController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin', 'chuNha', 'nhanVien'));

router.get('/', thongBaoController.getAllThongBao);
router.get('/:id', thongBaoController.getThongBaoById);
router.post('/', thongBaoController.createThongBao);
router.put('/:id/read', thongBaoController.markAsRead);
router.delete('/:id', thongBaoController.deleteThongBao);

module.exports = router;
