const express = require('express');
const router = express.Router();
const { xacThucToken } = require('../middleware/auth.middleware');
const db = require('../config/database');

// Lấy danh sách thông báo của người dùng
router.get('/', xacThucToken, async (req, res) => {
    try {
        const { id_nguoi_dung } = req.nguoiDung;
        
        const [thongBao] = await db.query(`
            SELECT * FROM thong_bao
            WHERE id_nguoi_nhan = ?
            ORDER BY ngay_tao DESC
            LIMIT 50
        `, [id_nguoi_dung]);
        
        res.json({ data: thongBao });
    } catch (error) {
        console.error('Lỗi lấy thông báo:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Đánh dấu đã đọc
router.put('/:id/da-doc', xacThucToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { id_nguoi_dung } = req.nguoiDung;
        
        await db.query(`
            UPDATE thong_bao 
            SET da_doc = TRUE 
            WHERE id_thong_bao = ? AND id_nguoi_nhan = ?
        `, [id, id_nguoi_dung]);
        
        res.json({ message: 'Đã đánh dấu đọc' });
    } catch (error) {
        console.error('Lỗi đánh dấu đọc:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Đánh dấu tất cả đã đọc
router.put('/da-doc-tat-ca', xacThucToken, async (req, res) => {
    try {
        const { id_nguoi_dung } = req.nguoiDung;
        
        await db.query(`
            UPDATE thong_bao 
            SET da_doc = TRUE 
            WHERE id_nguoi_nhan = ? AND da_doc = FALSE
        `, [id_nguoi_dung]);
        
        res.json({ message: 'Đã đánh dấu tất cả' });
    } catch (error) {
        console.error('Lỗi đánh dấu tất cả:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = router;
