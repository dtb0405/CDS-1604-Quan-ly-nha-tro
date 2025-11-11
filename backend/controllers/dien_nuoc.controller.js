const db = require('../config/database');

// Lấy danh sách chỉ số điện nước
exports.layDanhSachDienNuoc = async (req, res) => {
    try {
        const { id_nguoi_dung, loai_nguoi_dung } = req.nguoiDung;
        const { thang, nam } = req.query;
        
        let query = `
            SELECT dn.*, p.ten_phong, p.id_chu_tro
            FROM dien_nuoc dn
            JOIN phong p ON dn.id_phong = p.id_phong
        `;
        
        let conditions = [];
        let params = [];
        
        if (loai_nguoi_dung === 'chu_tro') {
            conditions.push('p.id_chu_tro = ?');
            params.push(id_nguoi_dung);
        }
        
        if (thang) {
            conditions.push('dn.thang = ?');
            params.push(thang);
        }
        
        if (nam) {
            conditions.push('dn.nam = ?');
            params.push(nam);
        }
        
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY dn.nam DESC, dn.thang DESC';
        
        const [dienNuoc] = await db.query(query, params);
        
        res.json({
            message: 'Lấy danh sách điện nước thành công',
            data: dienNuoc
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách điện nước:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Lấy chỉ số điện nước theo phòng
exports.layDienNuocTheoPhong = async (req, res) => {
    try {
        const { id_phong } = req.params;
        
        const [dienNuoc] = await db.query(`
            SELECT * FROM dien_nuoc 
            WHERE id_phong = ? 
            ORDER BY nam DESC, thang DESC
        `, [id_phong]);
        
        res.json({
            message: 'Lấy lịch sử điện nước thành công',
            data: dienNuoc
        });
    } catch (error) {
        console.error('Lỗi lấy điện nước theo phòng:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Thêm chỉ số điện nước mới
exports.themDienNuoc = async (req, res) => {
    try {
        const {
            id_phong,
            thang,
            nam,
            chi_so_dien_moi,
            chi_so_nuoc_moi,
            gia_dien,
            gia_nuoc
        } = req.body;
        
        // Basic server-side validation & coercion
        const idPhongNum = Number(id_phong);
        const thangNum = Number(thang);
        const namNum = Number(nam);
        const chiSoDienMoiNum = Number(chi_so_dien_moi);
        const chiSoNuocMoiNum = Number(chi_so_nuoc_moi);
        const giaDienNum = Number(gia_dien || 0);
        const giaNuocNum = Number(gia_nuoc || 0);

        if (!id_phong || isNaN(idPhongNum) || isNaN(thangNum) || isNaN(namNum) ||
            isNaN(chiSoDienMoiNum) || isNaN(chiSoNuocMoiNum)) {
            return res.status(400).json({ message: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra các trường bắt buộc.' });
        }
        
        // Lấy chỉ số cũ (chỉ số mới của tháng trước)
        const [lastRecord] = await db.query(`
            SELECT chi_so_dien_moi, chi_so_nuoc_moi 
            FROM dien_nuoc 
            WHERE id_phong = ? 
            ORDER BY nam DESC, thang DESC 
            LIMIT 1
        `, [id_phong]);
        
    let chi_so_dien_cu = 0;
    let chi_so_nuoc_cu = 0;
        
        if (lastRecord.length > 0) {
            chi_so_dien_cu = lastRecord[0].chi_so_dien_moi;
            chi_so_nuoc_cu = lastRecord[0].chi_so_nuoc_moi;
        }
        
        // Validate chỉ số mới phải lớn hơn hoặc bằng chỉ số cũ
        if (chiSoDienMoiNum < chi_so_dien_cu || chiSoNuocMoiNum < chi_so_nuoc_cu) {
            return res.status(400).json({ 
                message: 'Chỉ số mới phải lớn hơn hoặc bằng chỉ số cũ' 
            });
        }
        
        const [result] = await db.query(`
            INSERT INTO dien_nuoc (id_phong, thang, nam, chi_so_dien_cu, chi_so_dien_moi, 
                                   chi_so_nuoc_cu, chi_so_nuoc_moi, gia_dien, gia_nuoc, ghi_chu)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [idPhongNum, thangNum, namNum, chi_so_dien_cu, chiSoDienMoiNum, 
            chi_so_nuoc_cu, chiSoNuocMoiNum, giaDienNum, giaNuocNum, req.body.ghi_chu || '']);
        
        res.status(201).json({
            message: 'Thêm chỉ số điện nước thành công',
            id_dien_nuoc: result.insertId
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ 
                message: 'Đã tồn tại chỉ số điện nước cho phòng này trong tháng này' 
            });
        }
        console.error('Lỗi thêm điện nước:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Cập nhật chỉ số điện nước
exports.capNhatDienNuoc = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            chi_so_dien_moi,
            chi_so_nuoc_moi,
            gia_dien,
            gia_nuoc
        } = req.body;
        
        // Lấy thông tin hiện tại
        const [current] = await db.query('SELECT * FROM dien_nuoc WHERE id_dien_nuoc = ?', [id]);
        
        if (current.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bản ghi điện nước' });
        }
        
        await db.query(`
            UPDATE dien_nuoc 
            SET chi_so_dien_moi = ?, chi_so_nuoc_moi = ?, gia_dien = ?, gia_nuoc = ?
            WHERE id_dien_nuoc = ?
        `, [chi_so_dien_moi, chi_so_nuoc_moi, gia_dien, gia_nuoc, id]);
        
        res.json({ message: 'Cập nhật chỉ số điện nước thành công' });
    } catch (error) {
        console.error('Lỗi cập nhật điện nước:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Lấy chỉ số cuối của phòng
exports.layChiSoCuoi = async (req, res) => {
    try {
        const { id_phong } = req.params;
        
        const [chiSoCuoi] = await db.query(`
            SELECT chi_so_dien_moi, chi_so_nuoc_moi 
            FROM dien_nuoc 
            WHERE id_phong = ? 
            ORDER BY nam DESC, thang DESC 
            LIMIT 1
        `, [id_phong]);
        
        if (chiSoCuoi.length === 0) {
            return res.json({
                message: 'Chưa có chỉ số điện nước',
                data: {
                    chi_so_dien_cu: 0,
                    chi_so_nuoc_cu: 0
                }
            });
        }
        
        res.json({
            message: 'Lấy chỉ số cuối thành công',
            data: {
                chi_so_dien_cu: chiSoCuoi[0].chi_so_dien_moi,
                chi_so_nuoc_cu: chiSoCuoi[0].chi_so_nuoc_moi
            }
        });
    } catch (error) {
        console.error('Lỗi lấy chỉ số cuối:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Xóa bản ghi điện nước
exports.xoaDienNuoc = async (req, res) => {
    try {
        const { id } = req.params;
        
        await db.query('DELETE FROM dien_nuoc WHERE id_dien_nuoc = ?', [id]);
        
        res.json({ message: 'Xóa bản ghi điện nước thành công' });
    } catch (error) {
        console.error('Lỗi xóa điện nước:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
