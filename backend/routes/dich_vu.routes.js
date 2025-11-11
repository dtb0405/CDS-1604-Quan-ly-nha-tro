const express = require('express');
const router = express.Router();
const { xacThucToken } = require('../middleware/auth.middleware');
const db = require('../config/database');

// Lấy danh sách dịch vụ
router.get('/', xacThucToken, async (req, res) => {
    try {
        const [dichVu] = await db.query('SELECT * FROM dich_vu ORDER BY ten_dich_vu');
        res.json({ data: dichVu });
    } catch (error) {
        console.error('Lỗi lấy danh sách dịch vụ:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Lấy dịch vụ theo phòng
router.get('/phong/:id_phong', xacThucToken, async (req, res) => {
    try {
        const { id_phong } = req.params;
        const [dichVu] = await db.query(`
            SELECT dv.*, dvp.so_luong, dvp.id_dich_vu_phong
            FROM dich_vu_phong dvp
            JOIN dich_vu dv ON dvp.id_dich_vu = dv.id_dich_vu
            WHERE dvp.id_phong = ?
        `, [id_phong]);
        
        res.json({ data: dichVu });
    } catch (error) {
        console.error('Lỗi lấy dịch vụ phòng:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = router;
