const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Đăng ký
router.post('/dang-ky', authController.dangKy);

// Đăng nhập
router.post('/dang-nhap', authController.dangNhap);

// Quên mật khẩu
router.post('/quen-mat-khau', authController.quenMatKhau);

// Đổi mật khẩu (cần auth)
router.post('/doi-mat-khau', protect, authController.doiMatKhau);

// Lấy thông tin cá nhân (cần auth)
router.get('/thong-tin-ca-nhan', protect, authController.layThongTinCaNhan);

// Cập nhật thông tin cá nhân (cần auth)
router.put('/cap-nhat-thong-tin', protect, authController.capNhatThongTin);

// Upload ảnh đại diện (cần auth)
router.post('/upload-avatar', protect, upload.single('avatar'), authController.uploadAvatar);

module.exports = router;
