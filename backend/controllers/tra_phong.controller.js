const db = require('../config/database');

// Tenant submits checkout request
exports.taoYeuCauTraPhong = async (req, res) => {
  try {
    const { id_nguoi_dung } = req.nguoiDung;
    const { ngay_ra_de_xuat, ly_do, ghi_chu } = req.body;
    if (!ngay_ra_de_xuat || !ly_do) {
      return res.status(400).json({ message: 'Thiếu ngày trả phòng hoặc lý do' });
    }
    // Find active tenant record
    const [rows] = await db.query(`
      SELECT kt.* FROM khach_thue kt
      JOIN nguoi_dung nd ON kt.id_nguoi_dung = nd.id_nguoi_dung
      WHERE kt.id_nguoi_dung = ? AND kt.trang_thai = 'dang_thue'
      LIMIT 1
    `, [id_nguoi_dung]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin thuê phòng đang hoạt động' });
    }
    const tenant = rows[0];
    // Check existing pending request
    const [existing] = await db.query(`
      SELECT id_yeu_cau FROM yeu_cau_tra_phong 
      WHERE id_khach_thue = ? AND trang_thai = 'cho_duyet' LIMIT 1
    `, [tenant.id_khach_thue]);
    if (existing.length) {
      return res.status(409).json({ message: 'Đã có yêu cầu trả phòng đang chờ duyệt' });
    }
    const [result] = await db.query(`
      INSERT INTO yeu_cau_tra_phong (id_khach_thue, id_phong, ngay_ra_de_xuat, ly_do, ghi_chu, trang_thai)
      VALUES (?, ?, ?, ?, ?, 'cho_duyet')
    `, [tenant.id_khach_thue, tenant.id_phong, ngay_ra_de_xuat, ly_do, ghi_chu || '' ]);
    res.status(201).json({ message: 'Đã gửi yêu cầu trả phòng', id_yeu_cau: result.insertId });
  } catch (error) {
    console.error('Lỗi tạo yêu cầu trả phòng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Tenant view own request
exports.xemYeuCauCuaToi = async (req, res) => {
  try {
    const { id_nguoi_dung } = req.nguoiDung;
    const [rows] = await db.query(`
      SELECT yc.*, kt.id_khach_thue, kt.id_phong, kt.ngay_vao, p.ten_phong
      FROM yeu_cau_tra_phong yc
      JOIN khach_thue kt ON yc.id_khach_thue = kt.id_khach_thue
      LEFT JOIN phong p ON kt.id_phong = p.id_phong
      WHERE kt.id_nguoi_dung = ?
      ORDER BY yc.ngay_tao DESC
      LIMIT 1
    `, [id_nguoi_dung]);
    if (!rows.length) {
      return res.json({ message: 'Chưa có yêu cầu', data: null });
    }
    res.json({ message: 'OK', data: rows[0] });
  } catch (error) {
    console.error('Lỗi xem yêu cầu trả phòng của tôi:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Admin list requests
exports.layDanhSachYeuCau = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT yc.*, nd.ho_ten, nd.email, p.ten_phong
      FROM yeu_cau_tra_phong yc
      JOIN khach_thue kt ON yc.id_khach_thue = kt.id_khach_thue
      JOIN nguoi_dung nd ON kt.id_nguoi_dung = nd.id_nguoi_dung
      LEFT JOIN phong p ON yc.id_phong = p.id_phong
      ORDER BY yc.trang_thai = 'cho_duyet' DESC, yc.ngay_tao DESC
    `);
    res.json({ message: 'OK', data: rows });
  } catch (error) {
    console.error('Lỗi lấy danh sách yêu cầu trả phòng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Approve request
exports.duyetYeuCau = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;
    await connection.beginTransaction();
    const [rows] = await connection.query(`SELECT * FROM yeu_cau_tra_phong WHERE id_yeu_cau = ? FOR UPDATE`, [id]);
    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu' });
    }
    const yc = rows[0];
    if (yc.trang_thai !== 'cho_duyet') {
      await connection.rollback();
      return res.status(409).json({ message: 'Yêu cầu đã được xử lý trước đó' });
    }
    // Update request
    await connection.query(`UPDATE yeu_cau_tra_phong SET trang_thai = 'da_duyet', nguoi_duyet = ?, ngay_duyet = NOW() WHERE id_yeu_cau = ?`, [req.nguoiDung.id_nguoi_dung, id]);
    // Update tenant record
    await connection.query(`UPDATE khach_thue SET ngay_ra = ?, trang_thai = 'da_tra_phong' WHERE id_khach_thue = ?`, [yc.ngay_ra_de_xuat, yc.id_khach_thue]);
    // Update room status -> can_don
    if (yc.id_phong) {
      await connection.query(`UPDATE phong SET trang_thai = 'can_don' WHERE id_phong = ?`, [yc.id_phong]);
    }
    await connection.commit();
    res.json({ message: 'Đã duyệt yêu cầu trả phòng' });
  } catch (error) {
    await connection.rollback();
    console.error('Lỗi duyệt yêu cầu trả phòng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  } finally {
    connection.release();
  }
};

// Reject request
exports.tuChoiYeuCau = async (req, res) => {
  try {
    const { id } = req.params;
    const { ly_do_tu_choi } = req.body;
    await db.query(`UPDATE yeu_cau_tra_phong SET trang_thai = 'tu_choi', ly_do_tu_choi = ?, nguoi_duyet = ?, ngay_duyet = NOW() WHERE id_yeu_cau = ? AND trang_thai = 'cho_duyet'`, [ly_do_tu_choi || '', req.nguoiDung.id_nguoi_dung, id]);
    res.json({ message: 'Đã từ chối yêu cầu trả phòng' });
  } catch (error) {
    console.error('Lỗi từ chối yêu cầu trả phòng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Tenant cancel/revoke request
exports.thuHoiYeuCau = async (req, res) => {
  try {
    const { id_nguoi_dung } = req.nguoiDung;
    // Find pending request
    const [rows] = await db.query(`
      SELECT yc.id_yeu_cau FROM yeu_cau_tra_phong yc
      JOIN khach_thue kt ON yc.id_khach_thue = kt.id_khach_thue
      WHERE kt.id_nguoi_dung = ? AND yc.trang_thai = 'cho_duyet'
      LIMIT 1
    `, [id_nguoi_dung]);
    if (!rows.length) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu chờ duyệt' });
    }
    await db.query(`DELETE FROM yeu_cau_tra_phong WHERE id_yeu_cau = ?`, [rows[0].id_yeu_cau]);
    res.json({ message: 'Đã thu hồi yêu cầu trả phòng' });
  } catch (error) {
    console.error('Lỗi thu hồi yêu cầu:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
