const db = require('../config/database');

// Thống kê tổng quan
exports.thongKeTongQuan = async (req, res) => {
    try {
        const { id_nguoi_dung } = req.nguoiDung;
        
        // Tổng số phòng
        const [tongPhong] = await db.query(
            'SELECT COUNT(*) as tong FROM phong WHERE id_chu_tro = ?',
            [id_nguoi_dung]
        );
        
        // Phòng đang thuê
        const [phongDangThue] = await db.query(
            'SELECT COUNT(*) as tong FROM phong WHERE id_chu_tro = ? AND trang_thai = "dang_thue"',
            [id_nguoi_dung]
        );
        
        // Phòng trống
        const [phongTrong] = await db.query(
            'SELECT COUNT(*) as tong FROM phong WHERE id_chu_tro = ? AND trang_thai = "trong"',
            [id_nguoi_dung]
        );
        
        // Tổng khách thuê
        const [tongKhachThue] = await db.query(`
            SELECT COUNT(DISTINCT kt.id_khach_thue) as tong
            FROM khach_thue kt
            JOIN phong p ON kt.id_phong = p.id_phong
            WHERE p.id_chu_tro = ? AND kt.trang_thai = 'dang_thue'
        `, [id_nguoi_dung]);
        
        // Doanh thu tháng này
        const thangHienTai = new Date().getMonth() + 1;
        const namHienTai = new Date().getFullYear();
        
        const [doanhThuThangNay] = await db.query(`
            SELECT COALESCE(SUM(tt.so_tien), 0) as tong
            FROM thanh_toan tt
            JOIN hoa_don hd ON tt.id_hoa_don = hd.id_hoa_don
            JOIN phong p ON hd.id_phong = p.id_phong
            WHERE p.id_chu_tro = ? AND hd.thang = ? AND hd.nam = ? AND tt.trang_thai = 'thanh_cong'
        `, [id_nguoi_dung, thangHienTai, namHienTai]);
        
        // Hóa đơn chưa thanh toán
        const [hoaDonChuaThanhToan] = await db.query(`
            SELECT COUNT(*) as tong
            FROM hoa_don hd
            JOIN phong p ON hd.id_phong = p.id_phong
            WHERE p.id_chu_tro = ? AND hd.trang_thai = 'chua_thanh_toan'
        `, [id_nguoi_dung]);
        
        res.json({
            message: 'Lấy thống kê tổng quan thành công',
            data: {
                tong_phong: tongPhong[0].tong,
                phong_dang_thue: phongDangThue[0].tong,
                phong_trong: phongTrong[0].tong,
                tong_khach_thue: tongKhachThue[0].tong,
                doanh_thu_thang_nay: doanhThuThangNay[0].tong,
                hoa_don_chua_thanh_toan: hoaDonChuaThanhToan[0].tong
            }
        });
    } catch (error) {
        console.error('Lỗi thống kê tổng quan:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Thống kê doanh thu theo tháng
exports.thongKeDoanhThu = async (req, res) => {
    try {
        const { id_nguoi_dung } = req.nguoiDung;
        const { nam } = req.query;
        const namHienTai = nam || new Date().getFullYear();
        
        const [doanhThu] = await db.query(`
            SELECT hd.thang, COALESCE(SUM(tt.so_tien), 0) as doanh_thu
            FROM hoa_don hd
            JOIN phong p ON hd.id_phong = p.id_phong
            LEFT JOIN thanh_toan tt ON hd.id_hoa_don = tt.id_hoa_don AND tt.trang_thai = 'thanh_cong'
            WHERE p.id_chu_tro = ? AND hd.nam = ?
            GROUP BY hd.thang
            ORDER BY hd.thang
        `, [id_nguoi_dung, namHienTai]);
        
        // Tạo mảng 12 tháng
        const doanhThuTheoThang = Array.from({ length: 12 }, (_, i) => {
            const thang = i + 1;
            const data = doanhThu.find(d => d.thang === thang);
            return {
                thang,
                doanh_thu: data ? parseFloat(data.doanh_thu) : 0
            };
        });
        
        res.json({
            message: 'Lấy thống kê doanh thu thành công',
            data: doanhThuTheoThang
        });
    } catch (error) {
        console.error('Lỗi thống kê doanh thu:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Thống kê phòng
exports.thongKePhong = async (req, res) => {
    try {
        const { id_nguoi_dung } = req.nguoiDung;
        
        const [phongs] = await db.query(`
            SELECT 
                trang_thai,
                COUNT(*) as so_luong
            FROM phong
            WHERE id_chu_tro = ?
            GROUP BY trang_thai
        `, [id_nguoi_dung]);
        
        res.json({
            message: 'Lấy thống kê phòng thành công',
            data: phongs
        });
    } catch (error) {
        console.error('Lỗi thống kê phòng:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
