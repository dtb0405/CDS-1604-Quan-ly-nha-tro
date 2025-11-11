import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FaHistory, FaUser, FaHome, FaCalendar, FaMoneyBillWave, FaFileAlt } from 'react-icons/fa';
import './LichSuTraPhong.css';

const LichSuTraPhong = () => {
  const [lichSu, setLichSu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLichSu, setSelectedLichSu] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    layLichSu();
  }, []);

  const layLichSu = async () => {
    try {
      const response = await api.get('/lich-su-tra-phong');
      setLichSu(response.data.data || []);
    } catch (error) {
      console.error('Lỗi lấy lịch sử:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return parseInt(amount || 0).toLocaleString('vi-VN');
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('vi-VN');
  };

  const xemChiTiet = (item) => {
    setSelectedLichSu(item);
    setShowModal(true);
  };

  const getGioiTinhText = (gioiTinh) => {
    const mapping = {
      'nam': 'Nam',
      'nu': 'Nữ',
      'khac': 'Khác'
    };
    return mapping[gioiTinh] || gioiTinh;
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="lich-su-tra-phong">
      <div className="page-header">
        <div className="header-left">
          <FaHistory className="header-icon" />
          <div>
            <h1>Lịch sử trả phòng</h1>
            <p>Quản lý danh sách khách đã trả phòng</p>
          </div>
        </div>
        <div className="stats-summary">
          <div className="stat-item">
            <span className="stat-number">{lichSu.length}</span>
            <span className="stat-label">Tổng số</span>
          </div>
        </div>
      </div>

      {lichSu.length > 0 ? (
        <div className="lich-su-table">
          <table>
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Phòng</th>
                <th>Ngày vào</th>
                <th>Ngày trả</th>
                <th>Ngày xóa TK</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {lichSu.map((item) => (
                <tr key={item.id_lich_su}>
                  <td>
                    <div className="user-info">
                      <FaUser className="icon" />
                      <div>
                        <div className="name">{item.ho_ten}</div>
                        <div className="email">{item.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="room-info">
                      <FaHome className="icon" />
                      {item.ten_phong || 'N/A'}
                    </div>
                  </td>
                  <td>{formatDate(item.ngay_vao)}</td>
                  <td>{formatDate(item.ngay_ra)}</td>
                  <td>{formatDateTime(item.ngay_xoa_tai_khoan)}</td>
                  <td>
                    <button 
                      className="btn-detail"
                      onClick={() => xemChiTiet(item)}
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-data">
          <FaHistory size={64} />
          <h3>Chưa có lịch sử trả phòng</h3>
          <p>Danh sách sẽ hiển thị khi có khách trả phòng</p>
        </div>
      )}

      {showModal && selectedLichSu && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết lịch sử trả phòng</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3><FaUser /> Thông tin cá nhân</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Họ tên:</span>
                    <span className="value">{selectedLichSu.ho_ten}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Email:</span>
                    <span className="value">{selectedLichSu.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">SĐT:</span>
                    <span className="value">{selectedLichSu.so_dien_thoai}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">CMND/CCCD:</span>
                    <span className="value">{selectedLichSu.cmnd_cccd}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Ngày sinh:</span>
                    <span className="value">{formatDate(selectedLichSu.ngay_sinh)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Giới tính:</span>
                    <span className="value">{getGioiTinhText(selectedLichSu.gioi_tinh)}</span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="label">Địa chỉ:</span>
                    <span className="value">{selectedLichSu.dia_chi || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Nghề nghiệp:</span>
                    <span className="value">{selectedLichSu.nghe_nghiep || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3><FaHome /> Thông tin phòng</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Tên phòng:</span>
                    <span className="value">{selectedLichSu.ten_phong}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Số người ở:</span>
                    <span className="value">{selectedLichSu.so_nguoi_o}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3><FaMoneyBillWave /> Thông tin tài chính</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Giá thuê:</span>
                    <span className="value highlight">{formatCurrency(selectedLichSu.gia_thue)}đ</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Tiền cọc:</span>
                    <span className="value highlight">{formatCurrency(selectedLichSu.tien_coc)}đ</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Dịch vụ cơ bản:</span>
                    <span className="value">{formatCurrency(selectedLichSu.tien_dich_vu)}đ</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">DV theo người:</span>
                    <span className="value">{formatCurrency(selectedLichSu.tien_dich_vu_nguoi)}đ</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3><FaCalendar /> Thông tin thời gian</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Ngày vào:</span>
                    <span className="value">{formatDate(selectedLichSu.ngay_vao)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Ngày trả:</span>
                    <span className="value">{formatDate(selectedLichSu.ngay_ra)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Ngày yêu cầu:</span>
                    <span className="value">{formatDateTime(selectedLichSu.ngay_yeu_cau_tra)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Ngày duyệt:</span>
                    <span className="value">{formatDateTime(selectedLichSu.ngay_duyet_tra)}</span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="label">Ngày xóa tài khoản:</span>
                    <span className="value">{formatDateTime(selectedLichSu.ngay_xoa_tai_khoan)}</span>
                  </div>
                </div>
              </div>

              {selectedLichSu.ly_do_tra_phong && (
                <div className="detail-section">
                  <h3><FaFileAlt /> Lý do trả phòng</h3>
                  <p className="reason-text">{selectedLichSu.ly_do_tra_phong}</p>
                </div>
              )}

              {selectedLichSu.ghi_chu_admin && (
                <div className="detail-section">
                  <h3><FaFileAlt /> Ghi chú từ admin</h3>
                  <p className="note-text">{selectedLichSu.ghi_chu_admin}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LichSuTraPhong;
