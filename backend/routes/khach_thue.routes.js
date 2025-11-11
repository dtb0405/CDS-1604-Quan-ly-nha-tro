const express = require('express');
const router = express.Router();
const khachThueController = require('../controllers/khach_thue.controller');
const { xacThucToken, kiemTraChuTro } = require('../middleware/auth.middleware');

// Lấy thông tin phòng thuê của user hiện tại (cho khách thuê)
router.get('/thong-tin-cua-toi', xacThucToken, khachThueController.layThongTinCuaToi);

// Lấy danh sách khách thuê
router.get('/', xacThucToken, kiemTraChuTro, khachThueController.layDanhSachKhachThue);

// Lấy chi tiết khách thuê
router.get('/:id', xacThucToken, khachThueController.layChiTietKhachThue);

// Thêm khách thuê
router.post('/', xacThucToken, kiemTraChuTro, khachThueController.themKhachThue);

// Cập nhật khách thuê
router.put('/:id', xacThucToken, kiemTraChuTro, khachThueController.capNhatKhachThue);

// Xóa khách thuê
router.delete('/:id', xacThucToken, kiemTraChuTro, khachThueController.xoaKhachThue);

module.exports = router;
