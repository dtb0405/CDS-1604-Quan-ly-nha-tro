const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Đăng ký tài khoản
exports.dangKy = async (req, res) => {
    try {
        const {
            ten_dang_nhap,
            mat_khau,
            ho_ten,
            email,
            so_dien_thoai,
            dia_chi,
            loai_nguoi_dung
        } = req.body;

        // Validate
        if (!ten_dang_nhap || !mat_khau || !ho_ten || !email || !loai_nguoi_dung) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
        }

        // Kiểm tra tên đăng nhập đã tồn tại
        const [existingUser] = await db.query(
            'SELECT id_nguoi_dung FROM nguoi_dung WHERE ten_dang_nhap = ? OR email = ?',
            [ten_dang_nhap, email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Tên đăng nhập hoặc email đã tồn tại' });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(mat_khau, 10);

        // Thêm người dùng mới
        const [result] = await db.query(
            `INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau, ho_ten, email, so_dien_thoai, dia_chi, loai_nguoi_dung)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [ten_dang_nhap, hashedPassword, ho_ten, email, so_dien_thoai, dia_chi, loai_nguoi_dung]
        );

        res.status(201).json({
            message: 'Đăng ký tài khoản thành công',
            id_nguoi_dung: result.insertId
        });
    } catch (error) {
        console.error('Lỗi đăng ký:', error);
        res.status(500).json({ message: 'Lỗi server khi đăng ký' });
    }
};

// Đăng nhập
exports.dangNhap = async (req, res) => {
    try {
        const { ten_dang_nhap, mat_khau } = req.body;

        if (!ten_dang_nhap || !mat_khau) {
            return res.status(400).json({ message: 'Vui lòng nhập tên đăng nhập và mật khẩu' });
        }

        // Tìm người dùng
        const [users] = await db.query(
            `SELECT * FROM nguoi_dung WHERE ten_dang_nhap = ? AND trang_thai = 'hoat_dong'`,
            [ten_dang_nhap]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }

        const user = users[0];

        // Kiểm tra mật khẩu
        const isPasswordValid = await bcrypt.compare(mat_khau, user.mat_khau);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }

        // Tạo token
        const token = jwt.sign(
            {
                id_nguoi_dung: user.id_nguoi_dung,
                ten_dang_nhap: user.ten_dang_nhap,
                loai_nguoi_dung: user.loai_nguoi_dung
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        // Xóa mật khẩu khỏi response
        delete user.mat_khau;

        res.json({
            message: 'Đăng nhập thành công',
            token,
            nguoi_dung: user
        });
    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        res.status(500).json({ message: 'Lỗi server khi đăng nhập' });
    }
};

// Quên mật khẩu
exports.quenMatKhau = async (req, res) => {
    try {
        const { email } = req.body;

        const [users] = await db.query(
            'SELECT id_nguoi_dung, email, ho_ten FROM nguoi_dung WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Email không tồn tại trong hệ thống' });
        }

        // TODO: Gửi email reset password
        // Tạm thời trả về thông báo
        res.json({
            message: 'Link reset mật khẩu đã được gửi đến email của bạn',
            email: email
        });
    } catch (error) {
        console.error('Lỗi quên mật khẩu:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Đổi mật khẩu
exports.doiMatKhau = async (req, res) => {
    try {
        const { id_nguoi_dung } = req.nguoiDung; // Từ middleware auth
        const { mat_khau_cu, mat_khau_moi } = req.body;

        // Tìm người dùng
        const [users] = await db.query(
            'SELECT * FROM nguoi_dung WHERE id_nguoi_dung = ?',
            [id_nguoi_dung]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        const user = users[0];

        // Kiểm tra mật khẩu cũ
        const isPasswordValid = await bcrypt.compare(mat_khau_cu, user.mat_khau);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Mật khẩu cũ không đúng' });
        }

        // Mã hóa mật khẩu mới
        const hashedPassword = await bcrypt.hash(mat_khau_moi, 10);

        // Cập nhật mật khẩu
        await db.query(
            'UPDATE nguoi_dung SET mat_khau = ? WHERE id_nguoi_dung = ?',
            [hashedPassword, user.id_nguoi_dung]
        );

        res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        console.error('Lỗi đổi mật khẩu:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Cập nhật thông tin cá nhân
exports.capNhatThongTin = async (req, res) => {
    try {
        const { id_nguoi_dung } = req.nguoiDung; // Từ middleware auth
        const { ho_ten, email, so_dien_thoai, dia_chi, anh_dai_dien } = req.body;

        // Kiểm tra email trùng (nếu thay đổi)
        if (email) {
            const [existingEmail] = await db.query(
                'SELECT id_nguoi_dung FROM nguoi_dung WHERE email = ? AND id_nguoi_dung != ?',
                [email, id_nguoi_dung]
            );

            if (existingEmail.length > 0) {
                return res.status(400).json({ message: 'Email đã được sử dụng' });
            }
        }

        // Tạo object update chỉ với các field có giá trị
        const updateFields = {};
        const updateValues = [];
        
        if (ho_ten !== undefined && ho_ten !== null && ho_ten.trim() !== '') {
            updateFields.ho_ten = '?';
            updateValues.push(ho_ten.trim());
        }
        if (email !== undefined && email !== null && email.trim() !== '') {
            updateFields.email = '?';
            updateValues.push(email.trim());
        }
        if (so_dien_thoai !== undefined && so_dien_thoai !== null) {
            updateFields.so_dien_thoai = '?';
            updateValues.push(so_dien_thoai);
        }
        if (dia_chi !== undefined && dia_chi !== null) {
            updateFields.dia_chi = '?';
            updateValues.push(dia_chi);
        }
        if (anh_dai_dien !== undefined && anh_dai_dien !== null) {
            updateFields.anh_dai_dien = '?';
            updateValues.push(anh_dai_dien);
        }
        
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: 'Không có thông tin nào để cập nhật' });
        }
        
        updateValues.push(id_nguoi_dung);
        
        const setClause = Object.keys(updateFields).map(field => `${field} = ?`).join(', ');
        const updateQuery = `UPDATE nguoi_dung SET ${setClause} WHERE id_nguoi_dung = ?`;
        
        await db.query(updateQuery, updateValues);

        // Lấy thông tin đã cập nhật
        const [updatedUser] = await db.query(
            'SELECT id_nguoi_dung, ten_dang_nhap, ho_ten, email, so_dien_thoai, dia_chi, loai_nguoi_dung, anh_dai_dien FROM nguoi_dung WHERE id_nguoi_dung = ?',
            [id_nguoi_dung]
        );

        res.json({
            message: 'Cập nhật thông tin thành công',
            nguoi_dung: updatedUser[0]
        });
    } catch (error) {
        console.error('Lỗi cập nhật thông tin:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Lấy thông tin người dùng hiện tại
exports.layThongTinCaNhan = async (req, res) => {
    try {
        const { id_nguoi_dung } = req.nguoiDung;

        const [users] = await db.query(
            'SELECT id_nguoi_dung, ten_dang_nhap, ho_ten, email, so_dien_thoai, dia_chi, loai_nguoi_dung, anh_dai_dien, ngay_tao FROM nguoi_dung WHERE id_nguoi_dung = ?',
            [id_nguoi_dung]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('❌ [Backend] Lỗi lấy thông tin:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Upload ảnh đại diện
exports.uploadAvatar = async (req, res) => {
    try {
        const { id_nguoi_dung } = req.nguoiDung;
        
        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng chọn file ảnh' });
        }

        const avatarPath = `/uploads/${req.file.filename}`;

        // Cập nhật ảnh đại diện trong database
        await db.query(
            'UPDATE nguoi_dung SET anh_dai_dien = ? WHERE id_nguoi_dung = ?',
            [avatarPath, id_nguoi_dung]
        );

        // Lấy thông tin user đã cập nhật
        const [updatedUser] = await db.query(
            'SELECT id_nguoi_dung, ten_dang_nhap, ho_ten, email, so_dien_thoai, dia_chi, loai_nguoi_dung, anh_dai_dien FROM nguoi_dung WHERE id_nguoi_dung = ?',
            [id_nguoi_dung]
        );

        res.json({
            message: 'Upload ảnh đại diện thành công',
            nguoi_dung: updatedUser[0]
        });
    } catch (error) {
        console.error('Lỗi upload avatar:', error);
        res.status(500).json({ message: 'Lỗi server khi upload ảnh' });
    }
};
