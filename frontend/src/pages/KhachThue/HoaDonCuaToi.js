import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FaFileInvoice, FaCalendar, FaFilter, FaEye, FaTimes, FaCheckCircle, FaClock, FaSync, FaExclamationCircle, FaHourglassHalf } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './HoaDonCuaToi.css';

const HoaDonCuaToi = () => {
  const [hoaDon, setHoaDon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedHoaDon, setSelectedHoaDon] = useState(null);
  const [lichSuThanhToan, setLichSuThanhToan] = useState([]);
  const [filterThang, setFilterThang] = useState('');
  const [filterNam, setFilterNam] = useState(new Date().getFullYear());
  const [filterTrangThai, setFilterTrangThai] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    layDanhSachHoaDon();
    
    // Auto refresh khi focus vào window
    const handleFocus = () => {
      layDanhSachHoaDon();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const layDanhSachHoaDon = async () => {
    try {
      const response = await api.get('/hoa-don/cua-toi');
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      console.log('📋 Danh sách hóa đơn:', data);
      if (data.length > 0) {
        console.log('📄 Mẫu hóa đơn đầu tiên:', data[0]);
      }
      setHoaDon(data);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách hóa đơn:', error);
      toast.error('Không thể tải danh sách hóa đơn');
      setHoaDon([]);
      setLoading(false);
    }
  };

  const xemChiTiet = async (id) => {
    try {
      const response = await api.get(`/hoa-don/${id}`);
        console.log('📦 Raw response:', response);
        console.log('📦 response.data:', response.data);
        const hoaDon = response.data?.data || response.data;
        console.log('🔍 Chi tiết hóa đơn sau unwrap:', hoaDon);
        console.log('🏠 Tên phòng:', hoaDon.ten_phong);
        console.log('🔢 ID phòng:', hoaDon.id_phong);
        console.log('📋 All keys:', Object.keys(hoaDon));
      setSelectedHoaDon(hoaDon);
      
      // Lấy lịch sử thanh toán của hóa đơn này
      try {
        const lichSuResponse = await api.get(`/thanh-toan?id_hoa_don=${id}`);
        setLichSuThanhToan(lichSuResponse.data.data || []);
      } catch (err) {
        console.error('Lỗi lấy lịch sử thanh toán:', err);
        setLichSuThanhToan([]);
      }
      
      setShowDetailModal(true);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết hóa đơn:', error);
      toast.error('Không thể tải chi tiết hóa đơn');
    }
  };

  const thanhToan = (hoaDon) => {
    navigate('/khach-thue/thanh-toan', { state: { hoaDon } });
  };

  const getTrangThaiClass = (trangThai) => {
    switch (trangThai) {
      case 'da_thanh_toan': return 'status-paid';
      case 'chua_thanh_toan': return 'status-unpaid';
      case 'qua_han': return 'status-overdue';
      default: return '';
    }
  };

  const getTrangThaiText = (trangThai) => {
    switch (trangThai) {
      case 'da_thanh_toan': return 'Đã thanh toán';
      case 'chua_thanh_toan': return 'Chưa thanh toán';
      case 'qua_han': return 'Quá hạn';
      default: return trangThai;
    }
  };

  const getTrangThaiIcon = (trangThai) => {
    return trangThai === 'da_thanh_toan' ? <FaCheckCircle /> : <FaClock />;
  };

  const filteredHoaDon = hoaDon.filter(hd => {
    const matchThang = !filterThang || hd.thang === parseInt(filterThang);
    const matchNam = !filterNam || hd.nam === parseInt(filterNam);
    const matchTrangThai = filterTrangThai === 'all' || hd.trang_thai === filterTrangThai;
    return matchThang && matchNam && matchTrangThai;
  });

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="hoa-don-cua-toi">
      <div className="page-header">
        <div>
          <h1><FaFileInvoice /> Hóa đơn của tôi</h1>
          <p>Xem và thanh toán hóa đơn tiền phòng</p>
        </div>
        <button className="btn-refresh" onClick={layDanhSachHoaDon} disabled={loading}>
          <FaSync className={loading ? 'spinning' : ''} /> {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      <div className="filters">
        <div className="filter-group">
          <FaFilter />
          <select value={filterThang} onChange={(e) => setFilterThang(e.target.value)}>
            <option value="">Tất cả tháng</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <FaCalendar />
          <select value={filterNam} onChange={(e) => setFilterNam(e.target.value)}>
            {[2024, 2025, 2026].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <select value={filterTrangThai} onChange={(e) => setFilterTrangThai(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="chua_thanh_toan">Chưa thanh toán</option>
            <option value="da_thanh_toan">Đã thanh toán</option>
            <option value="qua_han">Quá hạn</option>
          </select>
        </div>
      </div>

      <div className="hoa-don-grid">
        {filteredHoaDon.map((hd) => (
          <div key={hd.id_hoa_don || hd.id} className="hoa-don-card">
            <div className="card-header">
              <div className="card-title">
                <FaFileInvoice className="icon" />
                <span>Hóa đơn {hd.ten_phong || `Phòng ${hd.id_phong}`}</span>
              </div>
              <span className={`status-badge ${getTrangThaiClass(hd.trang_thai)}`}>
                {getTrangThaiIcon(hd.trang_thai)}
                {getTrangThaiText(hd.trang_thai)}
              </span>
            </div>
            
            <div className="card-body">
              <div className="info-row">
                <span className="label">Kỳ:</span>
                <span className="value">Tháng {hd.thang}/{hd.nam}</span>
              </div>
              <div className="info-row">
                <span className="label">Tiền phòng:</span>
                <span className="value">{Number(hd.tien_phong || 0).toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="info-row">
                <span className="label">Tiền điện:</span>
                <span className="value">{Number(hd.tien_dien || 0).toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="info-row">
                <span className="label">Tiền nước:</span>
                <span className="value">{Number(hd.tien_nuoc || 0).toLocaleString('vi-VN')} đ</span>
              </div>
              {hd.tien_dich_vu > 0 && (
                <div className="info-row">
                  <span className="label">Tiền dịch vụ:</span>
                  <span className="value">{Number(hd.tien_dich_vu || 0).toLocaleString('vi-VN')} đ</span>
                </div>
              )}
              <div className="total-row">
                <span className="label">Tổng cộng:</span>
                <span className="value total">{Number(hd.tong_tien || 0).toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
            
            <div className="card-footer">
              <button className="btn-view" onClick={() => xemChiTiet(hd.id_hoa_don || hd.id)}>
                <FaEye /> Xem chi tiết
              </button>
              {hd.trang_thai === 'chua_thanh_toan' && (
                <button className="btn-pay" onClick={() => thanhToan(hd)}>
                  Thanh toán
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredHoaDon.length === 0 && (
        <div className="no-data">
          <FaFileInvoice size={48} />
          <p>Không có hóa đơn nào</p>
        </div>
      )}

      {showDetailModal && selectedHoaDon && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết hóa đơn</h2>
              <button className="btn-close" onClick={() => setShowDetailModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="detail-content">
              <div className="detail-section">
                <h3>Thông tin chung</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Phòng:</span>
                    <span className="value">{selectedHoaDon.ten_phong || (selectedHoaDon.id_phong ? `Phòng ${selectedHoaDon.id_phong}` : 'Không xác định')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Kỳ hóa đơn:</span>
                    <span className="value">Tháng {selectedHoaDon.thang}/{selectedHoaDon.nam}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Trạng thái:</span>
                    <span className={`status-badge ${getTrangThaiClass(selectedHoaDon.trang_thai)}`}>
                      {getTrangThaiText(selectedHoaDon.trang_thai)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Ngày tạo:</span>
                    <span className="value">{new Date(selectedHoaDon.ngay_tao).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Chi tiết chi phí</h3>
                <div className="cost-breakdown">
                  <div className="cost-item">
                    <span>Tiền phòng</span>
                    <span>{Number(selectedHoaDon.tien_phong || 0).toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="cost-item">
                    <span>Tiền điện</span>
                    <span>{Number(selectedHoaDon.tien_dien || 0).toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="cost-item">
                    <span>Tiền nước</span>
                    <span>{Number(selectedHoaDon.tien_nuoc || 0).toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="cost-item">
                    <span>Tiền dịch vụ</span>
                    <span>{(() => {
                      // Tính tiền dịch vụ từ thông tin phòng
                      const dichVuCoBan = Number(selectedHoaDon.tien_dich_vu || 0);
                      const dichVuNguoi = Number(selectedHoaDon.tien_dich_vu_nguoi || 0);
                      const soNguoi = Number(selectedHoaDon.so_nguoi_o || 0);
                      const tongDichVu = dichVuCoBan + (dichVuNguoi * soNguoi);
                      return tongDichVu.toLocaleString('vi-VN');
                    })()} đ</span>
                  </div>
                  <div className="cost-item total">
                    <span>Tổng cộng</span>
                    <span>{Number(selectedHoaDon.tong_tien || 0).toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>
              </div>

              {selectedHoaDon.ghi_chu && (
                <div className="detail-section">
                  <h3>Ghi chú</h3>
                  <p className="note">{selectedHoaDon.ghi_chu}</p>
                </div>
              )}

              {/* Lịch sử thanh toán */}
              {lichSuThanhToan.length > 0 && (
                <div className="detail-section">
                  <h3>Lịch sử thanh toán</h3>
                  <div className="payment-history">
                    {lichSuThanhToan.map((tt) => (
                      <div key={tt.id_thanh_toan} className="payment-item">
                        <div className="payment-info">
                          <div className="payment-method">
                            {tt.phuong_thuc === 'tien_mat' ? '💵 Tiền mặt' : '🏦 Chuyển khoản'}
                          </div>
                          <div className="payment-date">
                            {new Date(tt.ngay_thanh_toan).toLocaleString('vi-VN')}
                          </div>
                          <div className="payment-amount">
                            {Number(tt.so_tien).toLocaleString('vi-VN')} đ
                          </div>
                        </div>
                        <div className="payment-status">
                          {tt.trang_thai === 'cho_duyet' && (
                            <span className="badge pending">
                              <FaHourglassHalf /> Chờ duyệt
                            </span>
                          )}
                          {tt.trang_thai === 'thanh_cong' && (
                            <span className="badge success">
                              <FaCheckCircle /> Đã duyệt
                            </span>
                          )}
                          {tt.trang_thai === 'tu_choi' && (
                            <span className="badge rejected">
                              <FaExclamationCircle /> Từ chối
                            </span>
                          )}
                        </div>
                        {tt.ghi_chu_duyet && (
                          <div className="payment-note">
                            <strong>Ghi chú:</strong> {tt.ghi_chu_duyet}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HoaDonCuaToi;
