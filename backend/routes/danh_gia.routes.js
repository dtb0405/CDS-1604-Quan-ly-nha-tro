const express = require('express');
const router = express.Router();
const danhGiaController = require('../controllers/danh_gia.controller');
const { xacThucToken } = require('../middleware/auth.middleware');

// Lấy danh sách đánh giá
router.get('/', xacThucToken, danhGiaController.layDanhSachDanhGia);

// Tạo đánh giá
router.post('/', xacThucToken, danhGiaController.taoDanhGia);

module.exports = router;
