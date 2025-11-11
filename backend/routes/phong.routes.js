const express = require('express');
const router = express.Router();
const phongController = require('../controllers/phong.controller');
const { xacThucToken, kiemTraChuTro } = require('../middleware/auth.middleware');

// Lấy danh sách phòng (public - cho khách thuê xem)
router.get('/', xacThucToken, phongController.layDanhSachPhong);

// Lấy chi tiết phòng
router.get('/:id', xacThucToken, phongController.layChiTietPhong);

// Thêm phòng mới (chỉ chủ trọ)
router.post('/', xacThucToken, kiemTraChuTro, phongController.themPhong);

// Cập nhật phòng (chỉ chủ trọ)
router.put('/:id', xacThucToken, kiemTraChuTro, phongController.capNhatPhong);

// Xóa phòng (chỉ chủ trọ)
router.delete('/:id', xacThucToken, kiemTraChuTro, phongController.xoaPhong);

// Cập nhật trạng thái phòng
router.patch('/:id/trang-thai', xacThucToken, kiemTraChuTro, phongController.capNhatTrangThaiPhong);

// Lấy phòng theo trạng thái
router.get('/trang-thai/:trang_thai', xacThucToken, phongController.layPhongTheoTrangThai);

// Đồng bộ trạng thái phòng (kiểm tra và cập nhật dựa trên khách thuê thực tế)
router.post('/dong-bo-trang-thai', xacThucToken, kiemTraChuTro, phongController.dongBoTrangThaiPhong);

module.exports = router;
