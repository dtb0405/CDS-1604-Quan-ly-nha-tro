const db = require('../config/database');

// Lấy danh sách khách thuê
exports.layDanhSachKhachThue = async (req, res) => {
    try {
        const { id_nguoi_dung } = req.nguoiDung;
        
        const [khachThues] = await db.query(`
            SELECT kt.*, nd.ho_ten, nd.email, nd.so_dien_thoai, p.ten_phong,
                   CAST(COALESCE(hd.tien_coc, kt.tien_coc, p.tien_coc, 0) AS DECIMAL(15,2)) as tien_coc, 
                   CAST(COALESCE(hd.gia_thue, kt.gia_thue, p.gia_thue, 0) AS DECIMAL(15,2)) as gia_thue_hd,
                   CAST(COALESCE(kt.gia_thue, p.gia_thue, 0) AS DECIMAL(15,2)) as gia_thue,
                   CAST(COALESCE(kt.tien_dich_vu, p.tien_dich_vu, 0) AS DECIMAL(15,2)) as tien_dich_vu,
                   CAST(COALESCE(kt.tien_dich_vu_nguoi, p.tien_dich_vu_nguoi, 0) AS DECIMAL(15,2)) as tien_dich_vu_nguoi
            FROM khach_thue kt
            JOIN nguoi_dung nd ON kt.id_nguoi_dung = nd.id_nguoi_dung
            LEFT JOIN phong p ON kt.id_phong = p.id_phong
            LEFT JOIN hop_dong hd ON kt.id_khach_thue = hd.id_khach_thue AND hd.trang_thai = 'hieu_luc'
            WHERE p.id_chu_tro = ? OR kt.id_phong IS NULL
            ORDER BY kt.ngay_tao DESC
        `, [id_nguoi_dung]);
        
        res.json({
            message: 'Lấy danh sách khách thuê thành công',
            data: khachThues
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách khách thuê:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Lấy chi tiết khách thuê
exports.layChiTietKhachThue = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [khachThues] = await db.query(`
            SELECT kt.*, nd.ho_ten, nd.email, nd.so_dien_thoai, nd.dia_chi, p.ten_phong,
                   CAST(COALESCE(hd.tien_coc, kt.tien_coc, p.tien_coc, 0) AS DECIMAL(15,2)) as tien_coc, 
                   CAST(COALESCE(hd.gia_thue, kt.gia_thue, p.gia_thue, 0) AS DECIMAL(15,2)) as gia_thue_hd,
                   CAST(COALESCE(kt.gia_thue, p.gia_thue, 0) AS DECIMAL(15,2)) as gia_thue,
                   CAST(COALESCE(kt.tien_dich_vu, p.tien_dich_vu, 0) AS DECIMAL(15,2)) as tien_dich_vu,
                   CAST(COALESCE(kt.tien_dich_vu_nguoi, p.tien_dich_vu_nguoi, 0) AS DECIMAL(15,2)) as tien_dich_vu_nguoi
            FROM khach_thue kt
            JOIN nguoi_dung nd ON kt.id_nguoi_dung = nd.id_nguoi_dung
            LEFT JOIN phong p ON kt.id_phong = p.id_phong
            LEFT JOIN hop_dong hd ON kt.id_khach_thue = hd.id_khach_thue AND hd.trang_thai = 'hieu_luc'
            WHERE kt.id_khach_thue = ?
        `, [id]);
        
        if (khachThues.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy khách thuê' });
        }
        
        res.json({
            message: 'Lấy chi tiết khách thuê thành công',
            data: khachThues[0]
        });
    } catch (error) {
        console.error('Lỗi lấy chi tiết khách thuê:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Thêm khách thuê
exports.themKhachThue = async (req, res) => {
    try {
        const {
            id_nguoi_dung,
            id_phong,
            cmnd_cccd,
            ngay_sinh,
            gioi_tinh,
            nghe_nghiep,
            so_nguoi_o,
            ngay_vao,
            ghi_chu,
            tien_coc,
            gia_thue,
            tien_dich_vu,
            tien_dich_vu_nguoi
        } = req.body;
        
        // Validate required fields
        if (!id_nguoi_dung || !cmnd_cccd) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        }
        
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // Thêm khách thuê với đầy đủ thông tin tài chính
            const [result] = await connection.query(`
                INSERT INTO khach_thue (id_nguoi_dung, id_phong, cmnd_cccd, ngay_sinh, gioi_tinh, 
                                       nghe_nghiep, so_nguoi_o, ngay_vao, ghi_chu, trang_thai,
                                       tien_coc, gia_thue, tien_dich_vu, tien_dich_vu_nguoi)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'dang_thue', ?, ?, ?, ?)
            `, [id_nguoi_dung, id_phong, cmnd_cccd, ngay_sinh, gioi_tinh, 
                nghe_nghiep, so_nguoi_o, ngay_vao, ghi_chu || '',
                tien_coc || 0, gia_thue || 0, tien_dich_vu || 0, tien_dich_vu_nguoi || 0]);
            
            const id_khach_thue = result.insertId;
            
            // Tạo hợp đồng nếu có tiền cọc
            if (tien_coc && id_phong) {
                await connection.query(`
                    INSERT INTO hop_dong (id_phong, id_khach_thue, id_chu_tro, ngay_bat_dau, 
                                        gia_thue, tien_coc, trang_thai)
                    VALUES (?, ?, ?, ?, ?, ?, 'hieu_luc')
                `, [id_phong, id_khach_thue, req.nguoiDung.id_nguoi_dung, ngay_vao, 
                    gia_thue || 0, tien_coc || 0]);
            }
            
            // Cập nhật trạng thái phòng
            if (id_phong) {
                await connection.query(
                    'UPDATE phong SET trang_thai = ? WHERE id_phong = ?', 
                    ['dang_thue', id_phong]
                );
            }
            
            await connection.commit();
            
            res.status(201).json({
                message: 'Thêm khách thuê thành công',
                id_khach_thue: id_khach_thue
            });
        } catch (error) {
            await connection.rollback();
            console.error('❌ Lỗi transaction:', error);
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('❌ Lỗi thêm khách thuê:', error);
        res.status(500).json({ 
            message: 'Lỗi server', 
            error: error.message,
            code: error.code 
        });
    }
};

// Cập nhật khách thuê
exports.capNhatKhachThue = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            id_phong,
            ngay_sinh,
            gioi_tinh,
            nghe_nghiep,
            so_nguoi_o,
            ngay_ra,
            trang_thai,
            ghi_chu
        } = req.body;
        
        await db.query(`
            UPDATE khach_thue
            SET id_phong = ?, ngay_sinh = ?, gioi_tinh = ?, nghe_nghiep = ?,
                so_nguoi_o = ?, ngay_ra = ?, trang_thai = ?, ghi_chu = ?
            WHERE id_khach_thue = ?
        `, [id_phong, ngay_sinh, gioi_tinh, nghe_nghiep, so_nguoi_o, ngay_ra, trang_thai, ghi_chu, id]);
        
        // Nếu khách trả phòng, cập nhật trạng thái phòng
        if (trang_thai === 'da_tra_phong' && id_phong) {
            await db.query('UPDATE phong SET trang_thai = "can_don" WHERE id_phong = ?', [id_phong]);
        }
        
        res.json({ message: 'Cập nhật khách thuê thành công' });
    } catch (error) {
        console.error('Lỗi cập nhật khách thuê:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Xóa khách thuê
exports.xoaKhachThue = async (req, res) => {
    try {
        const { id } = req.params;
        
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // Lấy thông tin phòng trước khi xóa
            const [khachThue] = await connection.query(
                'SELECT id_phong FROM khach_thue WHERE id_khach_thue = ?', 
                [id]
            );
            
            if (khachThue.length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy khách thuê' });
            }
            
            const id_phong = khachThue[0].id_phong;
            
            // Xóa hợp đồng liên quan
            await connection.query('DELETE FROM hop_dong WHERE id_khach_thue = ?', [id]);
            
            // Xóa khách thuê
            await connection.query('DELETE FROM khach_thue WHERE id_khach_thue = ?', [id]);
            
            // Kiểm tra xem còn khách thuê nào khác trong phòng không
            if (id_phong) {
                const [remainingTenants] = await connection.query(
                    'SELECT COUNT(*) as count FROM khach_thue WHERE id_phong = ? AND (ngay_ra IS NULL OR ngay_ra > CURDATE())', 
                    [id_phong]
                );
                
                // Nếu không còn khách thuê nào, cập nhật trạng thái phòng về trống
                if (remainingTenants[0].count === 0) {
                    await connection.query(
                        'UPDATE phong SET trang_thai = ? WHERE id_phong = ?', 
                        ['trong', id_phong]
                    );
                }
            }
            
            await connection.commit();
            
            res.json({ message: 'Xóa khách thuê thành công' });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Lỗi xóa khách thuê:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Lấy thông tin phòng thuê của khách thuê hiện tại (cho user)
exports.layThongTinCuaToi = async (req, res) => {
    try {
        const { id_nguoi_dung } = req.nguoiDung;
        
        // Lấy thông tin khách thuê và phòng (bao gồm giá điện nước)
        const [khachThues] = await db.query(`
            SELECT 
                kt.*,
                p.id_phong,
                p.ten_phong,
                p.dien_tich,
                CAST(p.gia_thue AS DECIMAL(15,2)) as gia_thue_phong,
                CAST(p.tien_dich_vu AS DECIMAL(15,2)) as tien_dich_vu,
                CAST(p.tien_dich_vu_nguoi AS DECIMAL(15,2)) as tien_dich_vu_nguoi,
                p.dich_vu_bao_gom,
                p.trang_thai as trang_thai_phong,
                p.mo_ta,
                nd_khach.ho_ten as ho_ten_nguoi_dung,
                nd_khach.email as email_nguoi_dung,
                nd_khach.so_dien_thoai as so_dien_thoai_nguoi_dung,
                nd_khach.dia_chi as dia_chi_nguoi_dung,
                nd_chu_tro.ho_ten as ten_chu_tro,
                nd_chu_tro.so_dien_thoai as sdt_chu_tro,
                nd_chu_tro.email as email_chu_tro,
                CAST(hd.tien_coc AS DECIMAL(15,2)) as tien_coc,
                CAST(hd.gia_thue AS DECIMAL(15,2)) as gia_thue_hd,
                hd.ngay_bat_dau,
                hd.ngay_ket_thuc,
                hd.trang_thai as trang_thai_hop_dong,
                CAST(COALESCE(dn.gia_dien, 3500) AS DECIMAL(10,2)) as gia_dien,
                CAST(COALESCE(dn.gia_nuoc, 20000) AS DECIMAL(10,2)) as gia_nuoc,
                yc.trang_thai as trang_thai_tra_phong,
                yc.ngay_duyet as ngay_tra_phong,
                yc.ly_do as ly_do_tra_phong
            FROM khach_thue kt
            LEFT JOIN nguoi_dung nd_khach ON kt.id_nguoi_dung = nd_khach.id_nguoi_dung
            LEFT JOIN phong p ON kt.id_phong = p.id_phong
            LEFT JOIN nguoi_dung nd_chu_tro ON p.id_chu_tro = nd_chu_tro.id_nguoi_dung
            LEFT JOIN hop_dong hd ON kt.id_khach_thue = hd.id_khach_thue 
                AND hd.trang_thai = 'hieu_luc'
            LEFT JOIN (
                SELECT id_phong, gia_dien, gia_nuoc
                FROM dien_nuoc
                WHERE (id_phong, ngay_tao) IN (
                    SELECT id_phong, MAX(ngay_tao)
                    FROM dien_nuoc
                    GROUP BY id_phong
                )
            ) dn ON p.id_phong = dn.id_phong
            LEFT JOIN yeu_cau_tra_phong yc ON kt.id_khach_thue = yc.id_khach_thue
                AND yc.trang_thai IN ('cho_duyet', 'da_duyet')
            WHERE kt.id_nguoi_dung = ?
            ORDER BY kt.ngay_tao DESC
            LIMIT 1
        `, [id_nguoi_dung]);
        
        if (khachThues.length === 0) {
            return res.json({
                message: 'Chưa có thông tin thuê phòng',
                data: null
            });
        }
        
        res.json({
            message: 'Lấy thông tin thành công',
            data: khachThues[0]
        });
    } catch (error) {
        console.error('❌ [Backend] Lỗi lấy thông tin thuê:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
