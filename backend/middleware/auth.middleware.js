const jwt = require('jsonwebtoken');

// Middleware xác thực token
const xacThucToken = (req, res, next) => {
    try {
        // Lấy token từ header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Không tìm thấy token xác thực' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.nguoiDung = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
};

// Middleware kiểm tra quyền chủ trọ
const kiemTraChuTro = (req, res, next) => {
    if (req.nguoiDung.loai_nguoi_dung !== 'chu_tro') {
        return res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này' });
    }
    next();
};

// Middleware kiểm tra quyền khách thuê
const kiemTraKhachThue = (req, res, next) => {
    if (req.nguoiDung.loai_nguoi_dung !== 'khach_thue') {
        return res.status(403).json({ message: 'Chỉ khách thuê mới có quyền truy cập' });
    }
    next();
};

module.exports = {
    xacThucToken,
    protect: xacThucToken, // Alias for compatibility
    kiemTraChuTro,
    kiemTraKhachThue
};
