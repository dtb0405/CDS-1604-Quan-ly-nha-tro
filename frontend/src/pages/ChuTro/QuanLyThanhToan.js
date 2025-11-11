import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FaMoneyBillWave, FaCheck, FaTimes, FaEye, FaClock } from 'react-icons/fa';
import './QuanLyThanhToan.css';

const QuanLyThanhToan = () => {
  const [thanhToans, setThanhToans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTT, setSelectedTT] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [ghiChuDuyet, setGhiChuDuyet] = useState('');

  useEffect(() => {
    layDanhSachThanhToan();
  }, []);

  const layDanhSachThanhToan = async () => {
    try {
      const response = await api.get('/thanh-toan');
      setThanhToans(response.data.data || []);
    } catch (error) {
      console.error('Lỗi lấy danh sách thanh toán:', error);
      toast.error('Không thể tải danh sách thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const duyetThanhToan = async (id, trangThai) => {
    try {
      await api.put(`/thanh-toan/duyet/${id}`, {
        trang_thai: trangThai,
        ghi_chu_duyet: ghiChuDuyet
      });

      toast.success(trangThai === 'thanh_cong' ? 'Đã duyệt thanh toán' : 'Đã từ chối thanh toán');
      setShowModal(false);
      setGhiChuDuyet('');
      setSelectedTT(null);
      layDanhSachThanhToan();
    } catch (error) {
      console.error('Lỗi duyệt thanh toán:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const normalizeTrangThai = (raw) => {
    // Map legacy 'dang_xu_ly' to new 'cho_duyet'
    if (raw === 'dang_xu_ly') return 'cho_duyet';
    return raw;
  };

  const getTrangThaiClass = (trangThaiRaw) => {
    const trangThai = normalizeTrangThai(trangThaiRaw);
    switch (trangThai) {
      case 'cho_duyet': return 'pending';
      case 'thanh_cong': return 'success';
      case 'tu_choi': return 'rejected';
      default: return '';
    }
  };

  const getTrangThaiText = (trangThaiRaw) => {
    const trangThai = normalizeTrangThai(trangThaiRaw);
    switch (trangThai) {
      case 'cho_duyet': return 'Chờ duyệt';
      case 'thanh_cong': return 'Đã duyệt';
      case 'tu_choi': return 'Từ chối';
      default: return trangThai;
    }
  };

  const formatCurrency = (amount) => {
    return parseInt(amount || 0).toLocaleString('vi-VN');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="quan-ly-thanh-toan">
      <div className="page-header">
        <h1><FaMoneyBillWave /> Quản lý thanh toán</h1>
        <p>Duyệt và quản lý các giao dịch thanh toán</p>
      </div>

      {/* Thống kê nhanh */}
      <div className="stats-grid">
        <div className="stat-card pending">
          <FaClock className="icon" />
          <div className="stat-content">
            <h3>{thanhToans.filter(tt => normalizeTrangThai(tt.trang_thai) === 'cho_duyet').length}</h3>
            <p>Chờ duyệt</p>
          </div>
        </div>
        <div className="stat-card success">
          <FaCheck className="icon" />
          <div className="stat-content">
            <h3>{thanhToans.filter(tt => normalizeTrangThai(tt.trang_thai) === 'thanh_cong').length}</h3>
            <p>Đã duyệt</p>
          </div>
        </div>
        <div className="stat-card rejected">
          <FaTimes className="icon" />
          <div className="stat-content">
            <h3>{thanhToans.filter(tt => normalizeTrangThai(tt.trang_thai) === 'tu_choi').length}</h3>
            <p>Từ chối</p>
          </div>
        </div>
      </div>

      {/* Danh sách thanh toán */}
      <div className="thanh-toan-table-container">
        <table className="thanh-toan-table">
          <thead>
            <tr>
              <th>Hóa đơn</th>
              <th>Phòng</th>
              <th>Số tiền</th>
              <th>Phương thức</th>
              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {thanhToans.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">Chưa có giao dịch nào</td>
              </tr>
            ) : (
              thanhToans.map(tt => (
                <tr key={tt.id_thanh_toan}>
                  <td>Tháng {tt.thang}/{tt.nam}</td>
                  <td>{tt.ten_phong}</td>
                  <td className="amount">{formatCurrency(tt.so_tien)} đ</td>
                  <td>
                    <span className="payment-method">
                      {tt.phuong_thuc === 'tien_mat' ? '💵 Tiền mặt' : '🏦 Chuyển khoản'}
                    </span>
                  </td>
                  <td>{formatDate(tt.ngay_thanh_toan)}</td>
                  <td>
                    <span className={`status-badge ${getTrangThaiClass(tt.trang_thai)}`}>
                      {getTrangThaiText(tt.trang_thai)}
                    </span>
                  </td>
                  <td className="actions">
                    <button 
                      className="btn-view"
                      onClick={() => {
                        setSelectedTT(tt);
                        setShowModal(true);
                      }}
                      title="Xem chi tiết"
                    >
                      <FaEye />
                    </button>
                    {normalizeTrangThai(tt.trang_thai) === 'cho_duyet' && (
                      <>
                        <button 
                          className="btn-approve"
                          onClick={() => {
                            setSelectedTT(tt);
                            setShowModal(true);
                          }}
                          title="Duyệt"
                        >
                          <FaCheck />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal chi tiết và duyệt */}
      {showModal && selectedTT && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết thanh toán</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Hóa đơn:</label>
                  <span>Tháng {selectedTT.thang}/{selectedTT.nam}</span>
                </div>
                <div className="detail-item">
                  <label>Phòng:</label>
                  <span>{selectedTT.ten_phong}</span>
                </div>
                <div className="detail-item">
                  <label>Số tiền:</label>
                  <span className="highlight">{formatCurrency(selectedTT.so_tien)} đ</span>
                </div>
                <div className="detail-item">
                  <label>Tổng tiền hóa đơn:</label>
                  <span>{formatCurrency(selectedTT.tong_tien_hoa_don)} đ</span>
                </div>
                <div className="detail-item">
                  <label>Phương thức:</label>
                  <span>
                    {selectedTT.phuong_thuc === 'tien_mat' ? '💵 Tiền mặt' : '🏦 Chuyển khoản'}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Ngày thanh toán:</label>
                  <span>{formatDate(selectedTT.ngay_thanh_toan)}</span>
                </div>
                {selectedTT.ghi_chu && (
                  <div className="detail-item full-width">
                    <label>Ghi chú:</label>
                    <p>{selectedTT.ghi_chu}</p>
                  </div>
                )}
                <div className="detail-item">
                  <label>Trạng thái:</label>
                  <span className={`status-badge ${getTrangThaiClass(selectedTT.trang_thai)}`}>
                    {getTrangThaiText(selectedTT.trang_thai)}
                  </span>
                </div>
              </div>

              {normalizeTrangThai(selectedTT.trang_thai) === 'cho_duyet' && (
                <div className="approval-section">
                  <h3>Duyệt thanh toán</h3>
                  <textarea
                    value={ghiChuDuyet}
                    onChange={(e) => setGhiChuDuyet(e.target.value)}
                    placeholder="Ghi chú (tùy chọn)"
                    rows="3"
                  />
                  <div className="approval-actions">
                    <button 
                      className="btn-approve-action"
                      onClick={() => duyetThanhToan(selectedTT.id_thanh_toan, 'thanh_cong')}
                    >
                      <FaCheck /> Duyệt thanh toán
                    </button>
                    <button 
                      className="btn-reject-action"
                      onClick={() => duyetThanhToan(selectedTT.id_thanh_toan, 'tu_choi')}
                    >
                      <FaTimes /> Từ chối
                    </button>
                  </div>
                </div>
              )}

              {selectedTT.trang_thai !== 'cho_duyet' && selectedTT.ghi_chu_duyet && (
                <div className="approval-result">
                  <h4>Ghi chú duyệt:</h4>
                  <p>{selectedTT.ghi_chu_duyet}</p>
                  <p className="approval-date">
                    Duyệt lúc: {formatDate(selectedTT.ngay_duyet)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuanLyThanhToan;
