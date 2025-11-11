const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load biến môi trường
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files cho upload
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const authRoutes = require('./routes/auth.routes');
const nguoiDungRoutes = require('./routes/nguoi_dung.routes');
const phongRoutes = require('./routes/phong.routes');
const khachThueRoutes = require('./routes/khach_thue.routes');
const hopDongRoutes = require('./routes/hop_dong.routes');
const dienNuocRoutes = require('./routes/dien_nuoc.routes');
const hoaDonRoutes = require('./routes/hoa_don.routes');
const thanhToanRoutes = require('./routes/thanh_toan.routes');
const phanHoiRoutes = require('./routes/phan_hoi.routes');
const danhGiaRoutes = require('./routes/danh_gia.routes');
const thongKeRoutes = require('./routes/thong_ke.routes');
const dichVuRoutes = require('./routes/dich_vu.routes');
const thongBaoRoutes = require('./routes/thong_bao.routes');
const traPhongRoutes = require('./routes/tra_phong.routes');
const lichSuRoutes = require('./routes/lich_su.routes');

// Sử dụng routes
app.use('/api/auth', authRoutes);
app.use('/api/nguoi-dung', nguoiDungRoutes);
app.use('/api/phong', phongRoutes);
app.use('/api/khach-thue', khachThueRoutes);
app.use('/api/hop-dong', hopDongRoutes);
app.use('/api/dien-nuoc', dienNuocRoutes);
app.use('/api/hoa-don', hoaDonRoutes);
app.use('/api/thanh-toan', thanhToanRoutes);
app.use('/api/phan-hoi', phanHoiRoutes);
app.use('/api/danh-gia', danhGiaRoutes);
app.use('/api/thong-ke', thongKeRoutes);
app.use('/api/dich-vu', dichVuRoutes);
app.use('/api/thong_bao', thongBaoRoutes);
app.use('/api/tra-phong', traPhongRoutes);
app.use('/api', lichSuRoutes);

// Cron job - Chạy mỗi giờ để kiểm tra và xử lý tự động
const lichSuController = require('./controllers/lich_su.controller');
setInterval(async () => {
    try {
        console.log('⏰ [Cron] Chạy job tự động xử lý trả phòng...');
        await lichSuController.xuLyTraPhongTuDong();
    } catch (error) {
        console.error('❌ [Cron] Lỗi chạy job tự động:', error);
    }
}, 60 * 60 * 1000); // Chạy mỗi 1 giờ

// Chạy ngay lần đầu khi server khởi động
setTimeout(async () => {
    try {
        console.log('🔄 [Init] Chạy job tự động lần đầu...');
        await lichSuController.xuLyTraPhongTuDong();
    } catch (error) {
        console.error('❌ [Init] Lỗi chạy job lần đầu:', error);
    }
}, 5000); // Chạy sau 5 giây khi server khởi động

// Route mặc định
app.get('/', (req, res) => {
    res.json({
        message: '🏠 Hệ thống Quản lý Nhà trọ API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            nguoiDung: '/api/nguoi-dung',
            phong: '/api/phong',
            khachThue: '/api/khach-thue',
            hopDong: '/api/hop-dong',
            dienNuoc: '/api/dien-nuoc',
            hoaDon: '/api/hoa-don',
            thanhToan: '/api/thanh-toan',
            phanHoi: '/api/phan-hoi',
            danhGia: '/api/danh-gia',
            thongKe: '/api/thong-ke',
            dichVu: '/api/dich-vu',
            thongBao: '/api/thong-bao'
        }
    });
});

// Xử lý lỗi 404
app.use((req, res) => {
    res.status(404).json({ message: 'Không tìm thấy đường dẫn' });
});

// Xử lý lỗi chung
app.use((err, req, res, next) => {
    console.error('Lỗi:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Lỗi server',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});

module.exports = app;
