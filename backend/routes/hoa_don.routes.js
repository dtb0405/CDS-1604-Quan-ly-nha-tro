const express = require('express');
const router = express.Router();
const hoaDonController = require('../controllers/hoa_don.controller');
const { xacThucToken, kiemTraChuTro } = require('../middleware/auth.middleware');

// Lấy danh sách hóa đơn
router.get('/', xacThucToken, hoaDonController.layDanhSachHoaDon);

// Lấy hóa đơn của khách thuê hiện tại
router.get('/cua-toi', xacThucToken, hoaDonController.layHoaDonCuaToi);

// Lấy chi tiết hóa đơn
router.get('/:id', xacThucToken, hoaDonController.layChiTietHoaDon);

// Tạo hóa đơn (chỉ chủ trọ)
router.post('/', xacThucToken, kiemTraChuTro, hoaDonController.taoHoaDon);

// Tạo hóa đơn tự động cho tháng
router.post('/tu-dong', xacThucToken, kiemTraChuTro, hoaDonController.taoHoaDonTuDong);

// Cập nhật hóa đơn
router.put('/:id', xacThucToken, kiemTraChuTro, hoaDonController.capNhatHoaDon);

// Xóa hóa đơn
router.delete('/:id', xacThucToken, kiemTraChuTro, hoaDonController.xoaHoaDon);

// Lấy hóa đơn theo trạng thái
router.get('/trang-thai/:trang_thai', xacThucToken, hoaDonController.layHoaDonTheoTrangThai);

module.exports = router;
