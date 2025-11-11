const express = require('express');
const router = express.Router();
const thongKeController = require('../controllers/thong_ke.controller');
const { xacThucToken, kiemTraChuTro } = require('../middleware/auth.middleware');

// Thống kê tổng quan
router.get('/tong-quan', xacThucToken, kiemTraChuTro, thongKeController.thongKeTongQuan);

// Thống kê doanh thu theo tháng
router.get('/doanh-thu', xacThucToken, kiemTraChuTro, thongKeController.thongKeDoanhThu);

// Thống kê phòng
router.get('/phong', xacThucToken, kiemTraChuTro, thongKeController.thongKePhong);

module.exports = router;
