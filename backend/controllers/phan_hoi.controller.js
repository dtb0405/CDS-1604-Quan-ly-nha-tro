const db = require('../config/database');

// Lấy danh sách phản hồi
exports.layDanhSachPhanHoi = async (req, res) => {
    try {
        const { id_nguoi_dung, loai_nguoi_dung } = req.nguoiDung;
        
        let query = `
            SELECT ph.*, nd.ho_ten as ten_nguoi_gui, p.ten_phong
            FROM phan_hoi ph
            JOIN nguoi_dung nd ON ph.id_nguoi_gui = nd.id_nguoi_dung
            LEFT JOIN phong p ON ph.id_phong = p.id_phong
        `;
        
        let conditions = [];
        let params = [];
        
        if (loai_nguoi_dung === 'khach_thue') {
            conditions.push('ph.id_nguoi_gui = ?');
            params.push(id_nguoi_dung);
        } else if (loai_nguoi_dung === 'chu_tro') {
            conditions.push('p.id_chu_tro = ?');
            params.push(id_nguoi_dung);
        }
        
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY ph.ngay_tao DESC';
        
        const [phanHois] = await db.query(query, params);
        
        res.json({
            message: 'Lấy danh sách phản hồi thành công',
            data: phanHois
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách phản hồi:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Lấy chi tiết phản hồi
exports.layChiTietPhanHoi = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query(`
            SELECT ph.*, nd.ho_ten as ten_nguoi_gui, nd.so_dien_thoai, nd.email,
                   p.ten_phong
            FROM phan_hoi ph
            JOIN nguoi_dung nd ON ph.id_nguoi_gui = nd.id_nguoi_dung
            LEFT JOIN phong p ON ph.id_phong = p.id_phong
            WHERE ph.id_phan_hoi = ?
        `, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy phản hồi' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Lỗi lấy chi tiết phản hồi:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Gửi phản hồi
exports.guiPhanHoi = async (req, res) => {
    try {
        const { id_nguoi_dung } = req.nguoiDung;
        const {
            id_phong,
            tieu_de,
            noi_dung,
            loai_phan_hoi,
            muc_do_uu_tien
        } = req.body;
        
        // Xử lý ảnh đính kèm
        let anh_dinh_kem = null;
        if (req.files && req.files.length > 0) {
            anh_dinh_kem = JSON.stringify(req.files.map(file => file.filename));
        }
        
        const [result] = await db.query(`
            INSERT INTO phan_hoi (id_nguoi_gui, id_phong, tieu_de, noi_dung, loai_phan_hoi, muc_do_uu_tien, anh_dinh_kem)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [id_nguoi_dung, id_phong, tieu_de, noi_dung, loai_phan_hoi, muc_do_uu_tien, anh_dinh_kem]);
        
        res.status(201).json({
            message: 'Gửi phản hồi thành công',
            id_phan_hoi: result.insertId
        });
    } catch (error) {
        console.error('Lỗi gửi phản hồi:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Cập nhật phản hồi
exports.capNhatPhanHoi = async (req, res) => {
    try {
        const { id } = req.params;
        let { trang_thai, phan_hoi_cua_chu_tro } = req.body;
        // Chuẩn hóa trạng thái từ frontend cũ
        if (trang_thai === 'da_xu_ly') trang_thai = 'hoan_thanh';
        
        let updateFields = ['trang_thai = ?'];
        let params = [trang_thai];
        
        if (phan_hoi_cua_chu_tro) {
            updateFields.push('phan_hoi_cua_chu_tro = ?');
            params.push(phan_hoi_cua_chu_tro);
        }
        
        if (trang_thai === 'hoan_thanh') {
            updateFields.push('ngay_hoan_thanh = NOW()');
        }
        
        params.push(id);
        
        await db.query(`
            UPDATE phan_hoi
            SET ${updateFields.join(', ')}
            WHERE id_phan_hoi = ?
        `, params);
        
        res.json({ message: 'Cập nhật phản hồi thành công' });
    } catch (error) {
        console.error('Lỗi cập nhật phản hồi:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Trả lời phản hồi (lưu ghi chú của chủ trọ và optionally cập nhật trạng thái)
exports.traLoiPhanHoi = async (req, res) => {
    try {
        const { id } = req.params;
        const { noi_dung, cap_nhat_trang_thai } = req.body;
        if (!noi_dung || !noi_dung.trim()) {
            return res.status(400).json({ message: 'Nội dung trả lời không được để trống' });
        }
        const update = ['phan_hoi_cua_chu_tro = ?'];
        const params = [noi_dung.trim()];
        if (cap_nhat_trang_thai) {
            update.push('trang_thai = ?');
            params.push(cap_nhat_trang_thai === 'da_xu_ly' ? 'hoan_thanh' : cap_nhat_trang_thai);
            if (cap_nhat_trang_thai === 'da_xu_ly' || cap_nhat_trang_thai === 'hoan_thanh') {
                update.push('ngay_hoan_thanh = NOW()');
            }
        }
        params.push(id);
        await db.query(`
            UPDATE phan_hoi SET ${update.join(', ')} WHERE id_phan_hoi = ?
        `, params);
        res.json({ message: 'Đã lưu trả lời' });
    } catch (error) {
        console.error('Lỗi trả lời phản hồi:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
