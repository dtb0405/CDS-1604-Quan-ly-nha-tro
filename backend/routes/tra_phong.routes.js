const express = require('express');
const router = express.Router();
const traPhongController = require('../controllers/tra_phong.controller');
const { xacThucToken, kiemTraChuTro } = require('../middleware/auth.middleware');

// Tenant create request & view own
router.post('/', xacThucToken, traPhongController.taoYeuCauTraPhong);
router.get('/me', xacThucToken, traPhongController.xemYeuCauCuaToi);
router.delete('/me', xacThucToken, traPhongController.thuHoiYeuCau);

// Admin list & approve/reject
router.get('/', xacThucToken, kiemTraChuTro, traPhongController.layDanhSachYeuCau);
router.patch('/:id/approve', xacThucToken, kiemTraChuTro, traPhongController.duyetYeuCau);
router.patch('/:id/reject', xacThucToken, kiemTraChuTro, traPhongController.tuChoiYeuCau);

module.exports = router;
