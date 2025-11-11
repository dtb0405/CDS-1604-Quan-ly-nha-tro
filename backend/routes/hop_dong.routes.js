const express = require('express');
const router = express.Router();
const { xacThucToken, kiemTraChuTro } = require('../middleware/auth.middleware');
const db = require('../config/database');

// Lấy danh sách hợp đồng
router.get('/', xacThucToken, async (req, res) => {
    try {
        const { id_nguoi_dung, loai_nguoi_dung } = req.nguoiDung;
        
        let query = `
            SELECT hd.*, p.ten_phong, kt.cmnd_cccd, nd.ho_ten as ten_khach_thue
            FROM hop_dong hd
            JOIN phong p ON hd.id_phong = p.id_phong
            JOIN khach_thue kt ON hd.id_khach_thue = kt.id_khach_thue
            JOIN nguoi_dung nd ON kt.id_nguoi_dung = nd.id_nguoi_dung
        `;
        
        let params = [];
        
        if (loai_nguoi_dung === 'chu_tro') {
            query += ' WHERE hd.id_chu_tro = ?';
            params.push(id_nguoi_dung);
        } else if (loai_nguoi_dung === 'khach_thue') {
            query += ' WHERE kt.id_nguoi_dung = ?';
            params.push(id_nguoi_dung);
        }
        
        query += ' ORDER BY hd.ngay_tao DESC';
        
        const [hopDong] = await db.query(query, params);
        
        res.json({ data: hopDong });
    } catch (error) {
        console.error('Lỗi lấy danh sách hợp đồng:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Lấy chi tiết hợp đồng
router.get('/:id', xacThucToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const [hopDong] = await db.query(`
            SELECT hd.*, p.ten_phong, p.dien_tich, kt.cmnd_cccd, 
                   nd_kt.ho_ten as ten_khach_thue, nd_kt.so_dien_thoai as sdt_khach_thue,
                   nd_ct.ho_ten as ten_chu_tro, nd_ct.so_dien_thoai as sdt_chu_tro
            FROM hop_dong hd
            JOIN phong p ON hd.id_phong = p.id_phong
            JOIN khach_thue kt ON hd.id_khach_thue = kt.id_khach_thue
            JOIN nguoi_dung nd_kt ON kt.id_nguoi_dung = nd_kt.id_nguoi_dung
            JOIN nguoi_dung nd_ct ON hd.id_chu_tro = nd_ct.id_nguoi_dung
            WHERE hd.id_hop_dong = ?
        `, [id]);
        
        if (hopDong.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy hợp đồng' });
        }
        
        res.json({ data: hopDong[0] });
    } catch (error) {
        console.error('Lỗi lấy chi tiết hợp đồng:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Tạo hợp đồng mới
router.post('/', xacThucToken, kiemTraChuTro, async (req, res) => {
    try {
        const { id_nguoi_dung } = req.nguoiDung;
        const {
            id_phong,
            id_khach_thue,
            ngay_bat_dau,
            ngay_ket_thuc,
            gia_thue,
            tien_coc,
            noi_dung_hop_dong
        } = req.body;
        
        const [result] = await db.query(`
            INSERT INTO hop_dong (id_phong, id_khach_thue, id_chu_tro, ngay_bat_dau, 
                                 ngay_ket_thuc, gia_thue, tien_coc, noi_dung_hop_dong)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [id_phong, id_khach_thue, id_nguoi_dung, ngay_bat_dau, ngay_ket_thuc, 
            gia_thue, tien_coc, noi_dung_hop_dong]);
        
        res.status(201).json({
            message: 'Tạo hợp đồng thành công',
            id_hop_dong: result.insertId
        });
    } catch (error) {
        console.error('Lỗi tạo hợp đồng:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Cập nhật hợp đồng
router.put('/:id', xacThucToken, kiemTraChuTro, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            ngay_ket_thuc,
            gia_thue,
            tien_coc,
            noi_dung_hop_dong,
            trang_thai
        } = req.body;
        
        await db.query(`
            UPDATE hop_dong
            SET ngay_ket_thuc = ?, gia_thue = ?, tien_coc = ?, 
                noi_dung_hop_dong = ?, trang_thai = ?
            WHERE id_hop_dong = ?
        `, [ngay_ket_thuc, gia_thue, tien_coc, noi_dung_hop_dong, trang_thai, id]);
        
        res.json({ message: 'Cập nhật hợp đồng thành công' });
    } catch (error) {
        console.error('Lỗi cập nhật hợp đồng:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Xóa hợp đồng
router.delete('/:id', xacThucToken, kiemTraChuTro, async (req, res) => {
    try {
        const { id } = req.params;
        
        await db.query('DELETE FROM hop_dong WHERE id_hop_dong = ?', [id]);
        
        res.json({ message: 'Xóa hợp đồng thành công' });
    } catch (error) {
        console.error('Lỗi xóa hợp đồng:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = router;
