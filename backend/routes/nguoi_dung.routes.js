const express = require('express');
const router = express.Router();
const { xacThucToken, kiemTraChuTro } = require('../middleware/auth.middleware');
const db = require('../config/database');

// Tìm kiếm người dùng (chỉ Chủ trọ)
router.get('/tim-kiem', xacThucToken, kiemTraChuTro, async (req, res) => {
    try {
        const { search } = req.query;
        console.log('🔍 Backend nhận tìm kiếm:', search);
        
        if (!search || search.trim().length < 2) {
            console.log('❌ Search term quá ngắn');
            return res.json({ data: [] });
        }
        
        const searchTerm = `%${search}%`;
        console.log('🔍 Search term:', searchTerm);
        
        const [nguoiDungs] = await db.query(`
            SELECT id_nguoi_dung, ho_ten, email, so_dien_thoai, dia_chi
            FROM nguoi_dung
            WHERE (ho_ten LIKE ? OR email LIKE ? OR so_dien_thoai LIKE ?)
            AND loai_nguoi_dung = 'khach_thue'
            AND trang_thai = 'hoat_dong'
            LIMIT 20
        `, [searchTerm, searchTerm, searchTerm]);
        
        console.log('📊 Kết quả tìm kiếm:', nguoiDungs.length, 'người dùng');
        console.log('👥 Danh sách:', nguoiDungs);
        
        res.json({ data: nguoiDungs });
    } catch (error) {
        console.error('❌ Lỗi tìm kiếm người dùng:', error);
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
});

// Test: Lấy tất cả khách thuê (để debug)
router.get('/test/all-khach-thue', xacThucToken, async (req, res) => {
    try {
        const [nguoiDungs] = await db.query(`
            SELECT id_nguoi_dung, ho_ten, email, so_dien_thoai, loai_nguoi_dung, trang_thai
            FROM nguoi_dung
            WHERE loai_nguoi_dung = 'khach_thue'
        `);
        
        console.log('🧪 TEST: Tất cả khách thuê:', nguoiDungs);
        res.json({ 
            total: nguoiDungs.length,
            data: nguoiDungs 
        });
    } catch (error) {
        console.error('Lỗi test khách thuê:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Lấy thông tin người dùng theo ID
router.get('/:id', xacThucToken, async (req, res) => {
    try {
        const { id } = req.params;
        const [nguoiDungs] = await db.query(`
            SELECT id_nguoi_dung, ho_ten, email, so_dien_thoai, dia_chi, ngay_sinh, gioi_tinh
            FROM nguoi_dung
            WHERE id_nguoi_dung = ?
        `, [id]);
        
        if (nguoiDungs.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
        
        res.json({ data: nguoiDungs[0] });
    } catch (error) {
        console.error('Lỗi lấy thông tin người dùng:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = router;

