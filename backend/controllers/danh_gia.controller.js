const db = require('../config/database');

// Lấy danh sách đánh giá
exports.layDanhSachDanhGia = async (req, res) => {
    try {
        const { id_nguoi_dung } = req.nguoiDung;
        
        const [danhGias] = await db.query(`
            SELECT dg.*, 
                   nd1.ho_ten as ten_nguoi_danh_gia,
                   nd2.ho_ten as ten_nguoi_duoc_danh_gia,
                   p.ten_phong
            FROM danh_gia dg
            JOIN nguoi_dung nd1 ON dg.id_nguoi_danh_gia = nd1.id_nguoi_dung
            JOIN nguoi_dung nd2 ON dg.id_nguoi_duoc_danh_gia = nd2.id_nguoi_dung
            LEFT JOIN phong p ON dg.id_phong = p.id_phong
            WHERE dg.id_nguoi_danh_gia = ? OR dg.id_nguoi_duoc_danh_gia = ?
            ORDER BY dg.ngay_tao DESC
        `, [id_nguoi_dung, id_nguoi_dung]);
        
        res.json({
            message: 'Lấy danh sách đánh giá thành công',
            data: danhGias
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách đánh giá:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Tạo đánh giá
exports.taoDanhGia = async (req, res) => {
    try {
        const { id_nguoi_dung, loai_nguoi_dung } = req.nguoiDung;
        const {
            id_nguoi_duoc_danh_gia,
            id_phong,
            diem_so,
            noi_dung
        } = req.body;
        
        const loai_danh_gia = loai_nguoi_dung === 'khach_thue' 
            ? 'khach_danh_gia_chu_tro' 
            : 'chu_tro_danh_gia_khach';
        
        const [result] = await db.query(`
            INSERT INTO danh_gia (id_nguoi_danh_gia, id_nguoi_duoc_danh_gia, id_phong, diem_so, noi_dung, loai_danh_gia)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [id_nguoi_dung, id_nguoi_duoc_danh_gia, id_phong, diem_so, noi_dung, loai_danh_gia]);
        
        res.status(201).json({
            message: 'Tạo đánh giá thành công',
            id_danh_gia: result.insertId
        });
    } catch (error) {
        console.error('Lỗi tạo đánh giá:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
