const db = require('../config/database');

// Hàm tự động xử lý các khách thuê đã được duyệt trả phòng quá 24h
exports.xuLyTraPhongTuDong = async () => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        console.log('🔄 [Cron] Bắt đầu xử lý tự động trả phòng...');
        
        // Tìm các yêu cầu trả phòng đã được duyệt quá 24h và chưa xử lý
        const [yeuCauCanXuLy] = await connection.query(`
            SELECT 
                yc.*,
                kt.id_khach_thue,
                kt.id_nguoi_dung,
                kt.id_phong,
                kt.cmnd_cccd,
                kt.ngay_sinh,
                kt.gioi_tinh,
                kt.nghe_nghiep,
                kt.so_nguoi_o,
                kt.ngay_vao,
                kt.tien_coc,
                kt.gia_thue,
                kt.tien_dich_vu,
                kt.tien_dich_vu_nguoi,
                kt.ghi_chu,
                nd.ho_ten,
                nd.email,
                nd.so_dien_thoai,
                nd.dia_chi,
                p.ten_phong,
                p.id_chu_tro
            FROM yeu_cau_tra_phong yc
            JOIN khach_thue kt ON yc.id_khach_thue = kt.id_khach_thue
            JOIN nguoi_dung nd ON kt.id_nguoi_dung = nd.id_nguoi_dung
            LEFT JOIN phong p ON kt.id_phong = p.id_phong
            WHERE yc.trang_thai = 'da_duyet'
            AND yc.ngay_duyet IS NOT NULL
            AND TIMESTAMPDIFF(HOUR, yc.ngay_duyet, NOW()) >= 24
            AND (yc.da_luu_lich_su = FALSE OR yc.da_luu_lich_su IS NULL)
        `);
        
        console.log(`📊 [Cron] Tìm thấy ${yeuCauCanXuLy.length} yêu cầu cần xử lý`);
        
        for (const yeuCau of yeuCauCanXuLy) {
            try {
                // 1. Lưu vào lịch sử trả phòng
                await connection.query(`
                    INSERT INTO lich_su_tra_phong (
                        id_nguoi_dung, ho_ten, email, so_dien_thoai, cmnd_cccd,
                        ngay_sinh, gioi_tinh, dia_chi, nghe_nghiep,
                        id_phong, ten_phong, id_chu_tro,
                        ngay_vao, ngay_ra, so_nguoi_o,
                        tien_coc, gia_thue, tien_dich_vu, tien_dich_vu_nguoi,
                        ly_do_tra_phong, ngay_yeu_cau_tra, ngay_duyet_tra,
                        ghi_chu_admin, ngay_xoa_tai_khoan
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                `, [
                    yeuCau.id_nguoi_dung,
                    yeuCau.ho_ten,
                    yeuCau.email,
                    yeuCau.so_dien_thoai,
                    yeuCau.cmnd_cccd,
                    yeuCau.ngay_sinh,
                    yeuCau.gioi_tinh,
                    yeuCau.dia_chi,
                    yeuCau.nghe_nghiep,
                    yeuCau.id_phong,
                    yeuCau.ten_phong,
                    yeuCau.id_chu_tro,
                    yeuCau.ngay_vao,
                    yeuCau.ngay_ra_de_xuat,
                    yeuCau.so_nguoi_o,
                    yeuCau.tien_coc,
                    yeuCau.gia_thue,
                    yeuCau.tien_dich_vu,
                    yeuCau.tien_dich_vu_nguoi,
                    yeuCau.ly_do,
                    yeuCau.ngay_tao,
                    yeuCau.ngay_duyet,
                    null
                ]);
                
                console.log(`✅ [Cron] Đã lưu lịch sử cho khách thuê: ${yeuCau.ho_ten} (ID: ${yeuCau.id_nguoi_dung})`);
                
                // 2. Đánh dấu yêu cầu đã lưu lịch sử
                await connection.query(`
                    UPDATE yeu_cau_tra_phong 
                    SET da_luu_lich_su = TRUE, ngay_luu_lich_su = NOW()
                    WHERE id_yeu_cau = ?
                `, [yeuCau.id_yeu_cau]);
                
                // 3. Xóa khách thuê khỏi bảng khach_thue
                await connection.query(`
                    DELETE FROM khach_thue WHERE id_khach_thue = ?
                `, [yeuCau.id_khach_thue]);
                
                console.log(`🗑️ [Cron] Đã xóa khách thuê ID: ${yeuCau.id_khach_thue}`);
                
                // 4. Cập nhật trạng thái phòng về "trong"
                if (yeuCau.id_phong) {
                    await connection.query(`
                        UPDATE phong 
                        SET trang_thai = 'trong', so_nguoi_o = 0
                        WHERE id_phong = ?
                    `, [yeuCau.id_phong]);
                    
                    console.log(`🏠 [Cron] Đã cập nhật phòng ${yeuCau.ten_phong} về trạng thái "trống"`);
                }
                
                // 5. Xóa tài khoản người dùng (nếu chỉ là khách thuê)
                const [roleCheck] = await connection.query(`
                    SELECT loai_nguoi_dung FROM nguoi_dung WHERE id_nguoi_dung = ?
                `, [yeuCau.id_nguoi_dung]);
                
                if (roleCheck.length > 0 && roleCheck[0].loai_nguoi_dung === 'khach_thue') {
                    await connection.query(`
                        DELETE FROM nguoi_dung WHERE id_nguoi_dung = ?
                    `, [yeuCau.id_nguoi_dung]);
                    
                    console.log(`👤 [Cron] Đã xóa tài khoản người dùng: ${yeuCau.email}`);
                }
                
            } catch (error) {
                console.error(`❌ [Cron] Lỗi xử lý yêu cầu ID ${yeuCau.id_yeu_cau}:`, error);
                // Tiếp tục xử lý các yêu cầu khác
            }
        }
        
        await connection.commit();
        console.log('✅ [Cron] Hoàn thành xử lý tự động trả phòng');
        
        return {
            success: true,
            soLuongXuLy: yeuCauCanXuLy.length
        };
        
    } catch (error) {
        await connection.rollback();
        console.error('❌ [Cron] Lỗi xử lý tự động:', error);
        throw error;
    } finally {
        connection.release();
    }
};

// API để admin xem lịch sử trả phòng
exports.layLichSuTraPhong = async (req, res) => {
    try {
        const { id_nguoi_dung } = req.nguoiDung; // Admin/Chủ trọ
        
        const [lichSu] = await db.query(`
            SELECT * FROM lich_su_tra_phong
            WHERE id_chu_tro = ?
            ORDER BY ngay_xoa_tai_khoan DESC
        `, [id_nguoi_dung]);
        
        res.json({
            message: 'Lấy lịch sử trả phòng thành công',
            data: lichSu
        });
    } catch (error) {
        console.error('Lỗi lấy lịch sử:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// API để admin xem chi tiết lịch sử
exports.layChiTietLichSu = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_nguoi_dung } = req.nguoiDung;
        
        const [lichSu] = await db.query(`
            SELECT * FROM lich_su_tra_phong
            WHERE id_lich_su = ? AND id_chu_tro = ?
        `, [id, id_nguoi_dung]);
        
        if (lichSu.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy lịch sử' });
        }
        
        res.json({
            message: 'Lấy chi tiết lịch sử thành công',
            data: lichSu[0]
        });
    } catch (error) {
        console.error('Lỗi lấy chi tiết lịch sử:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

module.exports = exports;
