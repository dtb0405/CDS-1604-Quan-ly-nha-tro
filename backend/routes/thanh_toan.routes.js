const express = require('express');
const router = express.Router();
const thanhToanController = require('../controllers/thanh_toan.controller');
const { xacThucToken } = require('../middleware/auth.middleware');

// Lấy lịch sử thanh toán
router.get('/', xacThucToken, thanhToanController.layLichSuThanhToan);

// Thanh toán hóa đơn
router.post('/', xacThucToken, thanhToanController.thanhToanHoaDon);

// Duyệt thanh toán (Admin/Chủ trọ)
router.put('/duyet/:id_thanh_toan', xacThucToken, thanhToanController.duyetThanhToan);

// Tạo link thanh toán VNPay/MoMo
router.post('/tao-link', xacThucToken, thanhToanController.taoLinkThanhToan);

// Xử lý callback từ cổng thanh toán
router.get('/callback', thanhToanController.xuLyCallback);

module.exports = router;
