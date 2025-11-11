const express = require('express');
const router = express.Router();
const dienNuocController = require('../controllers/dien_nuoc.controller');
const { xacThucToken, kiemTraChuTro } = require('../middleware/auth.middleware');

// Lấy danh sách chỉ số điện nước
router.get('/', xacThucToken, dienNuocController.layDanhSachDienNuoc);

// Lấy chỉ số điện nước theo phòng
router.get('/phong/:id_phong', xacThucToken, dienNuocController.layDienNuocTheoPhong);

// Lấy chỉ số cuối của phòng
router.get('/phong/:id_phong/chi-so-cuoi', xacThucToken, dienNuocController.layChiSoCuoi);

// Thêm chỉ số điện nước mới (chỉ chủ trọ)
router.post('/', xacThucToken, kiemTraChuTro, dienNuocController.themDienNuoc);

// Cập nhật chỉ số điện nước
router.put('/:id', xacThucToken, kiemTraChuTro, dienNuocController.capNhatDienNuoc);

// Xóa bản ghi điện nước
router.delete('/:id', xacThucToken, kiemTraChuTro, dienNuocController.xoaDienNuoc);

module.exports = router;
