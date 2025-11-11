const express = require('express');
const router = express.Router();
const phanHoiController = require('../controllers/phan_hoi.controller');
const { xacThucToken } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Lấy danh sách phản hồi
router.get('/', xacThucToken, phanHoiController.layDanhSachPhanHoi);

// Lấy chi tiết phản hồi
router.get('/:id', xacThucToken, phanHoiController.layChiTietPhanHoi);

// Gửi phản hồi
router.post('/', xacThucToken, upload.array('anh_dinh_kem', 3), phanHoiController.guiPhanHoi);

// Cập nhật trạng thái phản hồi
router.put('/:id', xacThucToken, phanHoiController.capNhatPhanHoi);

// Trả lời phản hồi
router.post('/:id/tra-loi', xacThucToken, phanHoiController.traLoiPhanHoi);

module.exports = router;
