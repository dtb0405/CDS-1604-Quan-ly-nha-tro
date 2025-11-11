const db = require('../config/database');
const crypto = require('crypto');
const moment = require('moment');

// Lấy lịch sử thanh toán
exports.layLichSuThanhToan = async (req, res) => {
    try {
        const { id_nguoi_dung, loai_nguoi_dung } = req.nguoiDung;
        const { id_hoa_don } = req.query;
        
        let query = `
            SELECT tt.*, hd.thang, hd.nam, hd.tong_tien as tong_tien_hoa_don,
                   p.ten_phong
            FROM thanh_toan tt
            JOIN hoa_don hd ON tt.id_hoa_don = hd.id_hoa_don
            JOIN phong p ON hd.id_phong = p.id_phong
        `;
        
        let conditions = [];
        let params = [];
        
        if (id_hoa_don) {
            conditions.push('tt.id_hoa_don = ?');
            params.push(id_hoa_don);
        }
        
        if (loai_nguoi_dung === 'chu_tro') {
            conditions.push('p.id_chu_tro = ?');
            params.push(id_nguoi_dung);
        } else if (loai_nguoi_dung === 'khach_thue') {
            const [khachThue] = await db.query(
                'SELECT id_khach_thue FROM khach_thue WHERE id_nguoi_dung = ?',
                [id_nguoi_dung]
            );
            if (khachThue.length > 0) {
                conditions.push('hd.id_khach_thue = ?');
                params.push(khachThue[0].id_khach_thue);
            }
        }
        
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY tt.ngay_thanh_toan DESC';
        
        const [thanhToans] = await db.query(query, params);
        
        res.json({
            message: 'Lấy lịch sử thanh toán thành công',
            data: thanhToans
        });
    } catch (error) {
        console.error('Lỗi lấy lịch sử thanh toán:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Thanh toán hóa đơn
exports.thanhToanHoaDon = async (req, res) => {
    try {
        const { id_nguoi_dung } = req.nguoiDung;
        const {
            id_hoa_don,
            so_tien,
            phuong_thuc,
            ma_giao_dich,
            nguoi_thu_tien,
            ghi_chu
        } = req.body;
        
        // Kiểm tra hóa đơn
        const [hoaDons] = await db.query(
            'SELECT * FROM hoa_don WHERE id_hoa_don = ?',
            [id_hoa_don]
        );
        
        if (hoaDons.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
        }
        
        const hoaDon = hoaDons[0];
        
        // Thêm thanh toán với trạng thái "cho_duyet"
        const [result] = await db.query(`
            INSERT INTO thanh_toan (
                id_hoa_don, 
                so_tien, 
                phuong_thuc, 
                ma_giao_dich, 
                nguoi_thu_tien, 
                ghi_chu,
                trang_thai,
                nguoi_tao
            )
            VALUES (?, ?, ?, ?, ?, ?, 'cho_duyet', ?)
        `, [id_hoa_don, so_tien, phuong_thuc, ma_giao_dich, nguoi_thu_tien, ghi_chu, id_nguoi_dung]);
        
        res.status(201).json({
            message: 'Đã gửi yêu cầu thanh toán. Vui lòng đợi admin xác nhận.',
            id_thanh_toan: result.insertId
        });
    } catch (error) {
        console.error('Lỗi thanh toán hóa đơn:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Duyệt thanh toán (Admin/Chủ trọ)
exports.duyetThanhToan = async (req, res) => {
    try {
        const { id_thanh_toan } = req.params;
        const { trang_thai, ghi_chu_duyet } = req.body; // trang_thai: 'thanh_cong' hoặc 'tu_choi'
        const { id_nguoi_dung } = req.nguoiDung;
        
        // Lấy thông tin thanh toán
        const [thanhToans] = await db.query(`
            SELECT tt.*, hd.id_hoa_don, hd.tong_tien, hd.id_khach_thue, hd.thang, hd.nam
            FROM thanh_toan tt
            JOIN hoa_don hd ON tt.id_hoa_don = hd.id_hoa_don
            WHERE tt.id_thanh_toan = ?
        `, [id_thanh_toan]);
        
        if (thanhToans.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy giao dịch thanh toán' });
        }
        
        const thanhToan = thanhToans[0];
        
        // Cập nhật trạng thái thanh toán
        await db.query(`
            UPDATE thanh_toan 
            SET trang_thai = ?,
                ghi_chu_duyet = ?,
                nguoi_duyet = ?,
                ngay_duyet = NOW()
            WHERE id_thanh_toan = ?
        `, [trang_thai, ghi_chu_duyet, id_nguoi_dung, id_thanh_toan]);
        
        // Nếu duyệt thành công, kiểm tra và cập nhật hóa đơn
        if (trang_thai === 'thanh_cong') {
            const [tongThanhToan] = await db.query(
                'SELECT SUM(so_tien) as tong FROM thanh_toan WHERE id_hoa_don = ? AND trang_thai = "thanh_cong"',
                [thanhToan.id_hoa_don]
            );
            
            const tong = tongThanhToan[0].tong || 0;
            
            if (tong >= thanhToan.tong_tien) {
                // Cập nhật trạng thái hóa đơn
                await db.query(
                    'UPDATE hoa_don SET trang_thai = "da_thanh_toan" WHERE id_hoa_don = ?',
                    [thanhToan.id_hoa_don]
                );
            }
            
            // Tạo thông báo cho khách thuê
            const [khachThue] = await db.query(
                'SELECT id_nguoi_dung FROM khach_thue WHERE id_khach_thue = ?',
                [thanhToan.id_khach_thue]
            );
            
            if (khachThue.length > 0) {
                await db.query(`
                    INSERT INTO thong_bao (id_nguoi_nhan, tieu_de, noi_dung, loai_thong_bao)
                    VALUES (?, ?, ?, 'thanh_toan')
                `, [
                    khachThue[0].id_nguoi_dung,
                    'Thanh toán đã được xác nhận',
                    `Thanh toán hóa đơn tháng ${thanhToan.thang}/${thanhToan.nam} đã được xác nhận thành công`
                ]);
            }
        } else if (trang_thai === 'tu_choi') {
            // Tạo thông báo từ chối
            const [khachThue] = await db.query(
                'SELECT id_nguoi_dung FROM khach_thue WHERE id_khach_thue = ?',
                [thanhToan.id_khach_thue]
            );
            
            if (khachThue.length > 0) {
                await db.query(`
                    INSERT INTO thong_bao (id_nguoi_nhan, tieu_de, noi_dung, loai_thong_bao)
                    VALUES (?, ?, ?, 'thanh_toan')
                `, [
                    khachThue[0].id_nguoi_dung,
                    'Thanh toán bị từ chối',
                    `Thanh toán hóa đơn tháng ${thanhToan.thang}/${thanhToan.nam} bị từ chối. Lý do: ${ghi_chu_duyet || 'Không rõ'}`
                ]);
            }
        }
        
        res.json({ 
            message: trang_thai === 'thanh_cong' ? 'Đã duyệt thanh toán' : 'Đã từ chối thanh toán'
        });
    } catch (error) {
        console.error('Lỗi duyệt thanh toán:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Tạo link thanh toán VNPay/MoMo (Demo)
exports.taoLinkThanhToan = async (req, res) => {
    try {
        const { id_hoa_don, phuong_thuc } = req.body;
        
        // Lấy thông tin hóa đơn
        const [hoaDons] = await db.query(
            'SELECT * FROM hoa_don WHERE id_hoa_don = ?',
            [id_hoa_don]
        );
        
        if (hoaDons.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
        }
        
        const hoaDon = hoaDons[0];
        
        // Tạo mã giao dịch
        const ma_giao_dich = `HD${id_hoa_don}_${Date.now()}`;
        
        // TODO: Tích hợp thực tế với VNPay hoặc MoMo
        // Đây chỉ là demo
        const paymentUrl = `${process.env.PAYMENT_URL}?amount=${hoaDon.tong_tien}&orderInfo=HoaDon${id_hoa_don}&returnUrl=${process.env.PAYMENT_RETURN_URL}`;
        
        res.json({
            message: 'Tạo link thanh toán thành công',
            payment_url: paymentUrl,
            ma_giao_dich
        });
    } catch (error) {
        console.error('Lỗi tạo link thanh toán:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Xử lý callback từ cổng thanh toán
exports.xuLyCallback = async (req, res) => {
    try {
        // TODO: Xử lý callback thực tế từ VNPay/MoMo
        const { vnp_ResponseCode, vnp_Amount, vnp_TxnRef } = req.query;
        
        if (vnp_ResponseCode === '00') {
            // Thanh toán thành công
            res.redirect(`${process.env.PAYMENT_RETURN_URL}?success=true&txnRef=${vnp_TxnRef}`);
        } else {
            // Thanh toán thất bại
            res.redirect(`${process.env.PAYMENT_RETURN_URL}?success=false`);
        }
    } catch (error) {
        console.error('Lỗi xử lý callback:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
