const db = require('../config/database');

// Lấy danh sách phòng
exports.layDanhSachPhong = async (req, res) => {
    try {
        const { id_nguoi_dung, loai_nguoi_dung } = req.nguoiDung;
        
        let query = `
            SELECT p.*, nd.ho_ten as ten_chu_tro 
            FROM phong p 
            JOIN nguoi_dung nd ON p.id_chu_tro = nd.id_nguoi_dung
        `;
        
        let params = [];
        
        // Nếu là chủ trọ, chỉ hiển thị phòng của họ
        if (loai_nguoi_dung === 'chu_tro') {
            query += ' WHERE p.id_chu_tro = ?';
            params.push(id_nguoi_dung);
        }
        
        query += ' ORDER BY p.ngay_tao DESC';
        
        const [phongs] = await db.query(query, params);
        
        res.json({
            message: 'Lấy danh sách phòng thành công',
            data: phongs
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách phòng:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Lấy chi tiết phòng
exports.layChiTietPhong = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [phongs] = await db.query(`
            SELECT p.*, nd.ho_ten as ten_chu_tro, nd.so_dien_thoai as sdt_chu_tro
            FROM phong p
            JOIN nguoi_dung nd ON p.id_chu_tro = nd.id_nguoi_dung
            WHERE p.id_phong = ?
        `, [id]);
        
        if (phongs.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy phòng' });
        }
        
        // Lấy dịch vụ của phòng
        const [dichVu] = await db.query(`
            SELECT dv.*, dvp.so_luong
            FROM dich_vu_phong dvp
            JOIN dich_vu dv ON dvp.id_dich_vu = dv.id_dich_vu
            WHERE dvp.id_phong = ?
        `, [id]);
        
        const phong = phongs[0];
        phong.dich_vu = dichVu;
        
        res.json({
            message: 'Lấy chi tiết phòng thành công',
            data: phong
        });
    } catch (error) {
        console.error('Lỗi lấy chi tiết phòng:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Thêm phòng mới
exports.themPhong = async (req, res) => {
    try {
        const { id_nguoi_dung } = req.nguoiDung;
        const {
            ten_phong,
            dien_tich,
            gia_thue,
            tien_coc,
            mo_ta,
            so_nguoi_toi_da,
            tien_dich_vu,
            tien_dich_vu_nguoi,
            dich_vu_bao_gom
        } = req.body;
        
        const [result] = await db.query(`
            INSERT INTO phong (id_chu_tro, ten_phong, dien_tich, gia_thue, tien_coc, mo_ta, so_nguoi_toi_da, tien_dich_vu, tien_dich_vu_nguoi, dich_vu_bao_gom)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [id_nguoi_dung, ten_phong, dien_tich, gia_thue, tien_coc, mo_ta, so_nguoi_toi_da, tien_dich_vu, tien_dich_vu_nguoi, dich_vu_bao_gom]);
        
        res.status(201).json({
            message: 'Thêm phòng thành công',
            id_phong: result.insertId
        });
    } catch (error) {
        console.error('Lỗi thêm phòng:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Cập nhật phòng
exports.capNhatPhong = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_nguoi_dung } = req.nguoiDung;
        const {
            ten_phong,
            dien_tich,
            gia_thue,
            tien_coc,
            mo_ta,
            so_nguoi_toi_da,
            trang_thai,
            tien_dich_vu,
            tien_dich_vu_nguoi,
            dich_vu_bao_gom
        } = req.body;
        
        // Kiểm tra quyền sở hữu
        const [phongs] = await db.query('SELECT * FROM phong WHERE id_phong = ? AND id_chu_tro = ?', [id, id_nguoi_dung]);
        
        if (phongs.length === 0) {
            return res.status(403).json({ message: 'Bạn không có quyền cập nhật phòng này' });
        }
        
        await db.query(`
            UPDATE phong 
            SET ten_phong = ?, dien_tich = ?, gia_thue = ?, tien_coc = ?, mo_ta = ?, 
                so_nguoi_toi_da = ?, trang_thai = ?, tien_dich_vu = ?, tien_dich_vu_nguoi = ?, dich_vu_bao_gom = ?
            WHERE id_phong = ?
        `, [ten_phong, dien_tich, gia_thue, tien_coc, mo_ta, so_nguoi_toi_da, trang_thai, tien_dich_vu, tien_dich_vu_nguoi, dich_vu_bao_gom, id]);
        
        res.json({ message: 'Cập nhật phòng thành công' });
    } catch (error) {
        console.error('Lỗi cập nhật phòng:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Xóa phòng
exports.xoaPhong = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_nguoi_dung } = req.nguoiDung;
        
        // Kiểm tra quyền sở hữu
        const [phongs] = await db.query('SELECT * FROM phong WHERE id_phong = ? AND id_chu_tro = ?', [id, id_nguoi_dung]);
        
        if (phongs.length === 0) {
            return res.status(403).json({ message: 'Bạn không có quyền xóa phòng này' });
        }
        
        // Kiểm tra phòng có đang cho thuê không
        if (phongs[0].trang_thai === 'dang_thue') {
            return res.status(400).json({ message: 'Không thể xóa phòng đang được thuê' });
        }
        
        await db.query('DELETE FROM phong WHERE id_phong = ?', [id]);
        
        res.json({ message: 'Xóa phòng thành công' });
    } catch (error) {
        console.error('Lỗi xóa phòng:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Cập nhật trạng thái phòng
exports.capNhatTrangThaiPhong = async (req, res) => {
    try {
        const { id } = req.params;
        const { trang_thai } = req.body;
        const { id_nguoi_dung } = req.nguoiDung;
        
        // Kiểm tra quyền sở hữu
        const [phongs] = await db.query('SELECT * FROM phong WHERE id_phong = ? AND id_chu_tro = ?', [id, id_nguoi_dung]);
        
        if (phongs.length === 0) {
            return res.status(403).json({ message: 'Bạn không có quyền cập nhật phòng này' });
        }
        
        await db.query('UPDATE phong SET trang_thai = ? WHERE id_phong = ?', [trang_thai, id]);
        
        res.json({ message: 'Cập nhật trạng thái phòng thành công' });
    } catch (error) {
        console.error('Lỗi cập nhật trạng thái:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Lấy phòng theo trạng thái
exports.layPhongTheoTrangThai = async (req, res) => {
    try {
        const { trang_thai } = req.params;
        const { id_nguoi_dung, loai_nguoi_dung } = req.nguoiDung;
        
        let query = `
            SELECT p.*, nd.ho_ten as ten_chu_tro
            FROM phong p
            JOIN nguoi_dung nd ON p.id_chu_tro = nd.id_nguoi_dung
            WHERE p.trang_thai = ?
        `;
        
        let params = [trang_thai];
        
        if (loai_nguoi_dung === 'chu_tro') {
            query += ' AND p.id_chu_tro = ?';
            params.push(id_nguoi_dung);
        }
        
        const [phongs] = await db.query(query, params);
        
        res.json({
            message: 'Lấy danh sách phòng thành công',
            data: phongs
        });
    } catch (error) {
        console.error('Lỗi lấy phòng theo trạng thái:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Đồng bộ trạng thái phòng dựa trên khách thuê thực tế
exports.dongBoTrangThaiPhong = async (req, res) => {
    try {
        const { id_nguoi_dung } = req.nguoiDung;
        
        // Lấy tất cả phòng của chủ trọ
        const [phongs] = await db.query(
            'SELECT id_phong, ten_phong, trang_thai FROM phong WHERE id_chu_tro = ?',
            [id_nguoi_dung]
        );
        
        let updated = 0;
        let unchanged = 0;
        const details = [];
        
        for (const phong of phongs) {
            // Đếm số khách thuê đang ở trong phòng
            const [tenantCount] = await db.query(
                'SELECT COUNT(*) as count FROM khach_thue WHERE id_phong = ? AND (ngay_ra IS NULL OR ngay_ra > CURDATE())',
                [phong.id_phong]
            );
            
            const count = tenantCount[0].count;
            const currentStatus = phong.trang_thai;
            let newStatus = count > 0 ? 'dang_thue' : 'trong';
            
            if (currentStatus !== newStatus) {
                // Cập nhật trạng thái
                await db.query(
                    'UPDATE phong SET trang_thai = ? WHERE id_phong = ?',
                    [newStatus, phong.id_phong]
                );
                updated++;
                details.push({
                    id_phong: phong.id_phong,
                    ten_phong: phong.ten_phong,
                    trang_thai_cu: currentStatus,
                    trang_thai_moi: newStatus,
                    so_khach_thue: count
                });
            } else {
                unchanged++;
            }
        }
        
        res.json({
            message: 'Đồng bộ trạng thái phòng thành công',
            tong_phong: phongs.length,
            da_cap_nhat: updated,
            khong_thay_doi: unchanged,
            chi_tiet: details
        });
    } catch (error) {
        console.error('Lỗi đồng bộ trạng thái phòng:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
