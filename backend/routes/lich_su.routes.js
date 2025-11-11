const express = require('express');
const router = express.Router();
const lichSuController = require('../controllers/lich_su.controller');
const { xacThucToken, kiemTraChuTro } = require('../middleware/auth.middleware');

// Routes cho admin/chủ trọ
router.get('/lich-su-tra-phong', xacThucToken, kiemTraChuTro, lichSuController.layLichSuTraPhong);
router.get('/lich-su-tra-phong/:id', xacThucToken, kiemTraChuTro, lichSuController.layChiTietLichSu);

module.exports = router;
