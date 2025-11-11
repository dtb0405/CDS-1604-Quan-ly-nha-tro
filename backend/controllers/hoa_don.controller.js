const db = require('../config/database');
const moment = require('moment');

// Lấy danh sách hóa đơn
exports.layDanhSachHoaDon = async (req, res) => {
    try {
        const { id_nguoi_dung, loai_nguoi_dung } = req.nguoiDung;
        const { thang, nam, trang_thai } = req.query;
        
        let query = `
            SELECT hd.*, p.ten_phong, kt.id_nguoi_dung, nd.ho_ten as ten_khach_thue
            FROM hoa_don hd
            JOIN phong p ON hd.id_phong = p.id_phong
            JOIN khach_thue kt ON hd.id_khach_thue = kt.id_khach_thue
            JOIN nguoi_dung nd ON kt.id_nguoi_dung = nd.id_nguoi_dung
        `;
        
        let conditions = [];
        let params = [];
        
        if (loai_nguoi_dung === 'chu_tro') {
            conditions.push('p.id_chu_tro = ?');
            params.push(id_nguoi_dung);
        } else if (loai_nguoi_dung === 'khach_thue') {
            conditions.push('kt.id_nguoi_dung = ?');
            params.push(id_nguoi_dung);
        }
        
        if (thang) {
            conditions.push('hd.thang = ?');
            params.push(thang);
        }
        
        if (nam) {
            conditions.push('hd.nam = ?');
            params.push(nam);
        }
        
        if (trang_thai) {
            conditions.push('hd.trang_thai = ?');
            params.push(trang_thai);
        }
        
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY hd.nam DESC, hd.thang DESC';
        
        const [hoaDons] = await db.query(query, params);
        
        res.json({
            message: 'Lấy danh sách hóa đơn thành công',
            data: hoaDons
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách hóa đơn:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Lấy hóa đơn của khách thuê hiện tại
exports.layHoaDonCuaToi = async (req, res) => {
    try {
        const { id_nguoi_dung } = req.nguoiDung;
        
        const [hoaDons] = await db.query(`
            SELECT hd.*, p.ten_phong, nd.ho_ten as ten_chu_tro,
                   DATE_FORMAT(hd.ngay_tao, '%d/%m/%Y') as ngay_tao_format,
                   DATE_FORMAT(hd.han_thanh_toan, '%d/%m/%Y') as han_thanh_toan_format
            FROM hoa_don hd
            JOIN phong p ON hd.id_phong = p.id_phong
            JOIN khach_thue kt ON hd.id_khach_thue = kt.id_khach_thue
            JOIN nguoi_dung nd ON p.id_chu_tro = nd.id_nguoi_dung
            WHERE kt.id_nguoi_dung = ?
            ORDER BY hd.nam DESC, hd.thang DESC, hd.ngay_tao DESC
        `, [id_nguoi_dung]);
        
        res.json(hoaDons);
    } catch (error) {
        console.error('Lỗi lấy hóa đơn của tôi:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Lấy chi tiết hóa đơn
exports.layChiTietHoaDon = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [hoaDons] = await db.query(`
            SELECT hd.*, p.ten_phong, p.gia_thue, p.tien_dich_vu, p.tien_dich_vu_nguoi, p.dich_vu_bao_gom,
                   kt.id_nguoi_dung, kt.so_nguoi_o, nd.ho_ten as ten_khach_thue, nd.so_dien_thoai,
                   dn.chi_so_dien_cu, dn.chi_so_dien_moi, dn.chi_so_nuoc_cu, dn.chi_so_nuoc_moi,
                   dn.gia_dien, dn.gia_nuoc
            FROM hoa_don hd
            JOIN phong p ON hd.id_phong = p.id_phong
            JOIN khach_thue kt ON hd.id_khach_thue = kt.id_khach_thue
            JOIN nguoi_dung nd ON kt.id_nguoi_dung = nd.id_nguoi_dung
            LEFT JOIN dien_nuoc dn ON hd.id_dien_nuoc = dn.id_dien_nuoc
            WHERE hd.id_hoa_don = ?
        `, [id]);
        
        if (hoaDons.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
        }
        
        const hoaDon = hoaDons[0];
        
        // Thêm thông tin dịch vụ từ phòng
        hoaDon.dich_vu_info = {
            tien_dich_vu_co_ban: hoaDon.tien_dich_vu,
            tien_dich_vu_nguoi: hoaDon.tien_dich_vu_nguoi,
            so_nguoi_o: hoaDon.so_nguoi_o,
            dich_vu_bao_gom: hoaDon.dich_vu_bao_gom
        };
        
        res.json({
            message: 'Lấy chi tiết hóa đơn thành công',
            data: hoaDon
        });
    } catch (error) {
        console.error('Lỗi lấy chi tiết hóa đơn:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Tạo hóa đơn
exports.taoHoaDon = async (req, res) => {
    try {
        const {
            id_phong,
            id_khach_thue,
            thang,
            nam,
            han_thanh_toan,
            ghi_chu
        } = req.body;
        
        // Lấy thông tin phòng
        const [phongs] = await db.query('SELECT gia_thue, tien_dich_vu, tien_dich_vu_nguoi FROM phong WHERE id_phong = ?', [id_phong]);
        if (phongs.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy phòng' });
        }
        
        const tien_phong = phongs[0].gia_thue;
        
        // Lấy thông tin điện nước
        const [dienNuoc] = await db.query(`
            SELECT * FROM dien_nuoc 
            WHERE id_phong = ? AND thang = ? AND nam = ?
        `, [id_phong, thang, nam]);
        
        let tien_dien = 0;
        let tien_nuoc = 0;
        let id_dien_nuoc = null;
        
        if (dienNuoc.length > 0) {
            tien_dien = dienNuoc[0].tien_dien;
            tien_nuoc = dienNuoc[0].tien_nuoc;
            id_dien_nuoc = dienNuoc[0].id_dien_nuoc;
        }
        
        // Tính tiền dịch vụ từ thông tin phòng và số người ở
        const [khachThueInfo] = await db.query(`
            SELECT so_nguoi_o FROM khach_thue 
            WHERE id_khach_thue = ?
        `, [id_khach_thue]);
        
        const so_nguoi_o = khachThueInfo.length > 0 ? khachThueInfo[0].so_nguoi_o : 1;
        const tien_dich_vu = parseFloat(phongs[0].tien_dich_vu || 0) + 
                            (parseFloat(phongs[0].tien_dich_vu_nguoi || 0) * so_nguoi_o);
        
        // Tính tổng tiền
        const tong_tien = parseFloat(tien_phong) + parseFloat(tien_dien) + 
                         parseFloat(tien_nuoc) + parseFloat(tien_dich_vu);
        
        const [result] = await db.query(`
            INSERT INTO hoa_don (id_phong, id_khach_thue, id_dien_nuoc, thang, nam, 
                                tien_phong, tien_dien, tien_nuoc, tien_dich_vu, tong_tien,
                                han_thanh_toan, ghi_chu)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [id_phong, id_khach_thue, id_dien_nuoc, thang, nam, 
            tien_phong, tien_dien, tien_nuoc, tien_dich_vu, tong_tien,
            han_thanh_toan, ghi_chu]);
        
        // Tạo thông báo cho khách thuê
        const [khachThue] = await db.query(
            'SELECT id_nguoi_dung FROM khach_thue WHERE id_khach_thue = ?',
            [id_khach_thue]
        );
        
        if (khachThue.length > 0) {
            await db.query(`
                INSERT INTO thong_bao (id_nguoi_nhan, tieu_de, noi_dung, loai_thong_bao)
                VALUES (?, ?, ?, 'hoa_don')
            `, [
                khachThue[0].id_nguoi_dung,
                `Hóa đơn tháng ${thang}/${nam}`,
                `Hóa đơn tháng ${thang}/${nam} đã được tạo. Tổng tiền: ${tong_tien.toLocaleString('vi-VN')} VNĐ. Hạn thanh toán: ${moment(han_thanh_toan).format('DD/MM/YYYY')}`
            ]);
        }
        
        res.status(201).json({
            message: 'Tạo hóa đơn thành công',
            id_hoa_don: result.insertId,
            tong_tien
        });
    } catch (error) {
        console.error('Lỗi tạo hóa đơn:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Tạo hóa đơn tự động cho tất cả phòng đang thuê
exports.taoHoaDonTuDong = async (req, res) => {
    try {
        const { id_nguoi_dung } = req.nguoiDung;
        const { thang, nam } = req.body;
        
        // Lấy danh sách phòng đang thuê của chủ trọ
        const [phongs] = await db.query(`
            SELECT p.id_phong, p.gia_thue, p.tien_dich_vu, p.tien_dich_vu_nguoi,
                   kt.id_khach_thue, kt.so_nguoi_o
            FROM phong p
            JOIN khach_thue kt ON p.id_phong = kt.id_phong
            WHERE p.id_chu_tro = ? AND p.trang_thai = 'dang_thue' AND kt.trang_thai = 'dang_thue'
        `, [id_nguoi_dung]);
        
        let created = 0;
        let errors = [];
        
        for (const phong of phongs) {
            try {
                // Kiểm tra đã có hóa đơn chưa
                const [existing] = await db.query(`
                    SELECT id_hoa_don FROM hoa_don 
                    WHERE id_phong = ? AND thang = ? AND nam = ?
                `, [phong.id_phong, thang, nam]);
                
                if (existing.length > 0) {
                    continue; // Đã có hóa đơn, bỏ qua
                }
                
                // Tạo hóa đơn tương tự hàm taoHoaDon
                const han_thanh_toan = moment(`${nam}-${thang}-05`).format('YYYY-MM-DD');
                
                const tien_phong = phong.gia_thue;
                
                // Lấy điện nước
                const [dienNuoc] = await db.query(`
                    SELECT * FROM dien_nuoc 
                    WHERE id_phong = ? AND thang = ? AND nam = ?
                `, [phong.id_phong, thang, nam]);
                
                let tien_dien = 0;
                let tien_nuoc = 0;
                let id_dien_nuoc = null;
                
                if (dienNuoc.length > 0) {
                    tien_dien = dienNuoc[0].tien_dien;
                    tien_nuoc = dienNuoc[0].tien_nuoc;
                    id_dien_nuoc = dienNuoc[0].id_dien_nuoc;
                }
                
                // Tính tiền dịch vụ từ thông tin phòng và số người ở
                const so_nguoi_o = phong.so_nguoi_o || 1;
                const tien_dich_vu = parseFloat(phong.tien_dich_vu || 0) + 
                                    (parseFloat(phong.tien_dich_vu_nguoi || 0) * so_nguoi_o);
                const tong_tien = parseFloat(tien_phong) + parseFloat(tien_dien) + 
                                 parseFloat(tien_nuoc) + parseFloat(tien_dich_vu);
                
                await db.query(`
                    INSERT INTO hoa_don (id_phong, id_khach_thue, id_dien_nuoc, thang, nam,
                                        tien_phong, tien_dien, tien_nuoc, tien_dich_vu, tong_tien,
                                        han_thanh_toan)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [phong.id_phong, phong.id_khach_thue, id_dien_nuoc, thang, nam,
                    tien_phong, tien_dien, tien_nuoc, tien_dich_vu, tong_tien,
                    han_thanh_toan]);
                
                created++;
            } catch (err) {
                errors.push({ id_phong: phong.id_phong, error: err.message });
            }
        }
        
        res.json({
            message: `Đã tạo ${created} hóa đơn tự động`,
            created,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('Lỗi tạo hóa đơn tự động:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Cập nhật hóa đơn (có thể cập nhật toàn bộ trường và tự động tính lại chi phí)
exports.capNhatHoaDon = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            id_phong,
            id_khach_thue,
            thang,
            nam,
            han_thanh_toan,
            trang_thai,
            ghi_chu
        } = req.body;

        // Lấy hóa đơn hiện tại
        const [currentRows] = await db.query('SELECT * FROM hoa_don WHERE id_hoa_don = ?', [id]);
        if (currentRows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
        }
        const current = currentRows[0];

        // Giá trị cuối cùng sau khi merge body với bản ghi hiện tại
        const id_phong_final = id_phong ?? current.id_phong;
        const id_khach_thue_final = id_khach_thue ?? current.id_khach_thue;
        const thang_final = thang ?? current.thang;
        const nam_final = nam ?? current.nam;
        const han_thanh_toan_final = (han_thanh_toan === undefined) ? current.han_thanh_toan : han_thanh_toan;
        const trang_thai_final = trang_thai ?? current.trang_thai;
        const ghi_chu_final = (ghi_chu === undefined) ? current.ghi_chu : ghi_chu;

        // Lấy thông tin phòng để tính tiền phòng và dịch vụ
        const [phongs] = await db.query('SELECT gia_thue, tien_dich_vu, tien_dich_vu_nguoi FROM phong WHERE id_phong = ?', [id_phong_final]);
        if (phongs.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy phòng' });
        }
        const tien_phong = parseFloat(phongs[0].gia_thue || 0);

        // Lấy điện nước tháng đó (nếu có)
        const [dienNuoc] = await db.query(
            'SELECT * FROM dien_nuoc WHERE id_phong = ? AND thang = ? AND nam = ?',
            [id_phong_final, thang_final, nam_final]
        );

        let tien_dien = 0;
        let tien_nuoc = 0;
        let id_dien_nuoc = null;
        if (dienNuoc.length > 0) {
            tien_dien = parseFloat(dienNuoc[0].tien_dien || 0);
            tien_nuoc = parseFloat(dienNuoc[0].tien_nuoc || 0);
            id_dien_nuoc = dienNuoc[0].id_dien_nuoc;
        }

        // Tính tiền dịch vụ dựa trên phòng và số người ở của khách thuê
        const [ktRows] = await db.query('SELECT so_nguoi_o FROM khach_thue WHERE id_khach_thue = ?', [id_khach_thue_final]);
        const so_nguoi_o = ktRows.length > 0 ? (ktRows[0].so_nguoi_o || 1) : 1;
        const tien_dich_vu = parseFloat(phongs[0].tien_dich_vu || 0) + parseFloat(phongs[0].tien_dich_vu_nguoi || 0) * so_nguoi_o;

        const tong_tien = tien_phong + tien_dien + tien_nuoc + tien_dich_vu;

        await db.query(
            `UPDATE hoa_don SET 
                id_phong = ?,
                id_khach_thue = ?,
                id_dien_nuoc = ?,
                thang = ?,
                nam = ?,
                tien_phong = ?,
                tien_dien = ?,
                tien_nuoc = ?,
                tien_dich_vu = ?,
                tong_tien = ?,
                han_thanh_toan = ?,
                trang_thai = ?,
                ghi_chu = ?
            WHERE id_hoa_don = ?`,
            [
                id_phong_final,
                id_khach_thue_final,
                id_dien_nuoc,
                thang_final,
                nam_final,
                tien_phong,
                tien_dien,
                tien_nuoc,
                tien_dich_vu,
                tong_tien,
                han_thanh_toan_final,
                trang_thai_final,
                ghi_chu_final,
                id
            ]
        );

        res.json({
            message: 'Cập nhật hóa đơn thành công',
            data: {
                id_hoa_don: Number(id),
                id_phong: id_phong_final,
                id_khach_thue: id_khach_thue_final,
                id_dien_nuoc,
                thang: thang_final,
                nam: nam_final,
                tien_phong,
                tien_dien,
                tien_nuoc,
                tien_dich_vu,
                tong_tien,
                han_thanh_toan: han_thanh_toan_final,
                trang_thai: trang_thai_final,
                ghi_chu: ghi_chu_final
            }
        });
    } catch (error) {
        console.error('Lỗi cập nhật hóa đơn:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Xóa hóa đơn
exports.xoaHoaDon = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Kiểm tra hóa đơn đã thanh toán chưa
        const [hoaDons] = await db.query(
            'SELECT trang_thai FROM hoa_don WHERE id_hoa_don = ?',
            [id]
        );
        
        if (hoaDons.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
        }
        
        if (hoaDons[0].trang_thai === 'da_thanh_toan') {
            return res.status(400).json({ 
                message: 'Không thể xóa hóa đơn đã thanh toán' 
            });
        }
        
        await db.query('DELETE FROM hoa_don WHERE id_hoa_don = ?', [id]);
        
        res.json({ message: 'Xóa hóa đơn thành công' });
    } catch (error) {
        console.error('Lỗi xóa hóa đơn:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Lấy hóa đơn theo trạng thái
exports.layHoaDonTheoTrangThai = async (req, res) => {
    try {
        const { trang_thai } = req.params;
        const { id_nguoi_dung, loai_nguoi_dung } = req.nguoiDung;
        
        let query = `
            SELECT hd.*, p.ten_phong, nd.ho_ten as ten_khach_thue
            FROM hoa_don hd
            JOIN phong p ON hd.id_phong = p.id_phong
            JOIN khach_thue kt ON hd.id_khach_thue = kt.id_khach_thue
            JOIN nguoi_dung nd ON kt.id_nguoi_dung = nd.id_nguoi_dung
            WHERE hd.trang_thai = ?
        `;
        
        let params = [trang_thai];
        
        if (loai_nguoi_dung === 'chu_tro') {
            query += ' AND p.id_chu_tro = ?';
            params.push(id_nguoi_dung);
        } else if (loai_nguoi_dung === 'khach_thue') {
            query += ' AND kt.id_nguoi_dung = ?';
            params.push(id_nguoi_dung);
        }
        
        const [hoaDons] = await db.query(query, params);
        
        res.json({
            message: 'Lấy danh sách hóa đơn thành công',
            data: hoaDons
        });
    } catch (error) {
        console.error('Lỗi lấy hóa đơn theo trạng thái:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
