import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FaHome, FaCalendar, FaMoneyBillWave, FaCheckCircle, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './TraPhong.css';

const TraPhong = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);
  const [existingRequest, setExistingRequest] = useState(null);
  const [formData, setFormData] = useState({
    ngay_ra: '',
    ly_do: '',
    ghi_chu: ''
  });

  useEffect(() => {
    layThongTinPhong();
    layYeuCauHienTai();
  }, []);

  const layYeuCauHienTai = async () => {
    try {
      const res = await api.get('/tra-phong/me');
      if (res.data && res.data.data) {
        setExistingRequest(res.data.data);
      }
    } catch (e) { console.error(e); }
  };

  const layThongTinPhong = async () => {
    try {
      const response = await api.get('/khach-thue/thong-tin-cua-toi');
      
      if (response.data && response.data.data) {
        const thongTin = response.data.data;
        
        if (thongTin.id_phong) {
          setRoomInfo(thongTin);
          // Set ngày ra mặc định là hôm nay
          setFormData(prev => ({
            ...prev,
            ngay_ra: new Date().toISOString().split('T')[0]
          }));
        } else {
          setRoomInfo(null);
        }
      } else {
        setRoomInfo(null);
      }
    } catch (error) {
      console.error('❌ Lỗi lấy thông tin phòng:', error);
      console.error('❌ Error response:', error.response);
      setRoomInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTraPhong = async () => {
    if (!formData.ngay_ra) {
      toast.error('Vui lòng chọn ngày trả phòng');
      return;
    }
    if (!formData.ly_do) {
      toast.error('Vui lòng chọn lý do trả phòng');
      return;
    }
    if (window.confirm('Gửi yêu cầu trả phòng tới chủ trọ?')) {
      setSubmitting(true);
      try {
        await api.post('/tra-phong', {
          ngay_ra_de_xuat: formData.ngay_ra,
          ly_do: formData.ly_do,
          ghi_chu: formData.ghi_chu
        });
        toast.success('Đã gửi yêu cầu trả phòng. Vui lòng chờ chủ trọ duyệt.');
        layYeuCauHienTai();
        setSubmitting(false);
      } catch (error) {
        console.error('Lỗi gửi yêu cầu trả phòng:', error);
        toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        setSubmitting(false);
      }
    }
  };

  const handleThuHoi = async () => {
    if (window.confirm('Thu hồi yêu cầu trả phòng?')) {
      setSubmitting(true);
      try {
        await api.delete('/tra-phong/me');
        toast.success('Đã thu hồi yêu cầu');
        setExistingRequest(null);
        setSubmitting(false);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Lỗi thu hồi');
        setSubmitting(false);
      }
    }
  };

  const formatCurrency = (amount) => {
    return parseInt(amount || 0).toLocaleString('vi-VN');
  };

  const calculateDays = () => {
    if (!roomInfo?.ngay_vao || !formData.ngay_ra) return 0;
    const startDate = new Date(roomInfo.ngay_vao);
    const endDate = new Date(formData.ngay_ra);
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return <div className="loading">Đang tải thông tin...</div>;
  }

  if (!roomInfo) {
    return (
      <div className="tra-phong">
        <div className="error-message">
          <FaTimes className="error-icon" />
          <h2>Không có phòng để trả</h2>
          <p>Bạn chưa được gán phòng hoặc đã trả phòng trước đó.</p>
          <button className="btn-back" onClick={() => navigate('/khach-thue/dashboard')}>
            <FaArrowLeft /> Quay lại Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tra-phong modern-layout">
      <div className="page-header modern-header">
        <button className="btn-back modern-back" onClick={() => navigate('/khach-thue/dashboard')}>
          <FaArrowLeft /> Quay lại
        </button>
        <div className="header-content">
          <h1><FaHome className="header-icon" /> Yêu cầu trả phòng</h1>
          <p className="subtitle">Gửi yêu cầu trả phòng đến chủ trọ để xác nhận</p>
        </div>
      </div>

      <div className="content-grid modern-grid">
        {/* Thông tin phòng hiện tại */}
        <div className="room-info-card modern-card">
          <div className="card-header-modern">
            <h2><FaHome className="section-icon" /> Thông tin phòng hiện tại</h2>
          </div>
          <div className="room-details">
            <div className="detail-item">
              <span className="label">Tên phòng:</span>
              <span className="value">{roomInfo.ten_phong}</span>
            </div>
            <div className="detail-item">
              <span className="label">Tầng:</span>
              <span className="value">Tầng {roomInfo.tang}</span>
            </div>
            <div className="detail-item">
              <span className="label">Diện tích:</span>
              <span className="value">{roomInfo.dien_tich} m²</span>
            </div>
            <div className="detail-item">
              <span className="label">Giá thuê:</span>
              <span className="value">{formatCurrency(roomInfo.gia_thue_hd || roomInfo.gia_thue_phong)}đ/tháng</span>
            </div>
            <div className="detail-item">
              <span className="label">Tiền cọc:</span>
              <span className="value">{formatCurrency(roomInfo.tien_coc)}đ</span>
            </div>
            <div className="detail-item">
              <span className="label">Ngày vào:</span>
              <span className="value">{new Date(roomInfo.ngay_vao).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="detail-item">
              <span className="label">Số ngày ở:</span>
              <span className="value">{calculateDays()} ngày</span>
            </div>
          </div>
        </div>

        {/* Form trả phòng */}
        <div className="checkout-form-card modern-card">
          <div className="card-header-modern">
            <h2><FaCheckCircle className="section-icon" /> Thông tin trả phòng</h2>
          </div>
          
          {existingRequest && (
            <div className={`request-status modern-status status-${existingRequest.trang_thai}`}>
              {existingRequest.trang_thai === 'cho_duyet' && (
                <div className="status-content">
                  <span className="status-icon">⏳</span>
                  <div className="status-text">
                    <strong>Yêu cầu đang chờ duyệt</strong>
                    <p className="status-detail">Vui lòng chờ chủ trọ xem xét yêu cầu của bạn</p>
                  </div>
                  <button 
                    className="btn-revoke" 
                    onClick={handleThuHoi}
                    disabled={submitting}
                  >
                    <FaTimes /> Thu hồi
                  </button>
                </div>
              )}
              {existingRequest.trang_thai === 'da_duyet' && (
                <div className="status-content">
                  <span className="status-icon">✅</span>
                  <div className="status-text">
                    <strong>Yêu cầu đã được duyệt</strong>
                    <p className="status-detail">Chúc bạn mọi điều tốt đẹp!</p>
                  </div>
                </div>
              )}
              {existingRequest.trang_thai === 'tu_choi' && (
                <div className="status-content">
                  <span className="status-icon">❌</span>
                  <div className="status-text">
                    <strong>Yêu cầu bị từ chối</strong>
                    <p className="status-detail">{existingRequest.ly_do_tu_choi || 'Không rõ lý do'}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label>Ngày trả phòng <span className="required">*</span></label>
              <input
                type="date"
                name="ngay_ra"
                value={formData.ngay_ra}
                onChange={handleInputChange}
                min={roomInfo.ngay_vao?.split('T')[0]}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label>Lý do trả phòng <span className="required">*</span></label>
              <select
                name="ly_do"
                value={formData.ly_do}
                onChange={handleInputChange}
                required
              >
                <option value="">Chọn lý do</option>
                <option value="het_hop_dong">Hết hạn hợp đồng</option>
                <option value="chuyen_nha">Chuyển nhà</option>
                <option value="cong_viec">Thay đổi công việc</option>
                <option value="gia_dinh">Lý do gia đình</option>
                <option value="khac">Lý do khác</option>
              </select>
            </div>

            <div className="form-group">
              <label>Ghi chú thêm</label>
              <textarea
                name="ghi_chu"
                value={formData.ghi_chu}
                onChange={handleInputChange}
                rows="4"
                placeholder="Nhập ghi chú thêm (nếu có)..."
              />
            </div>

            {/* Thông tin hoàn tiền */}
            <div className="refund-info">
              <h3><FaMoneyBillWave /> Thông tin hoàn tiền</h3>
              <div className="refund-details">
                <div className="refund-item">
                  <span className="label">Tiền cọc:</span>
                  <span className="value">{formatCurrency(roomInfo.tien_coc)}đ</span>
                </div>
                <div className="refund-item">
                  <span className="label">Số ngày ở:</span>
                  <span className="value">{calculateDays()} ngày</span>
                </div>
                <div className="refund-item total">
                  <span className="label">Dự kiến hoàn tiền:</span>
                  <span className="value">{formatCurrency(roomInfo.tien_coc)}đ</span>
                </div>
              </div>
              <p className="refund-note">
                * Số tiền hoàn thực tế sẽ được tính toán dựa trên thời gian ở và điều kiện phòng.
              </p>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate('/khach-thue/dashboard')}
                disabled={submitting}
              >
                <FaTimes /> Hủy
              </button>
              <button
                type="submit"
                className="btn-submit"
                onClick={handleTraPhong}
                disabled={submitting || (existingRequest && existingRequest.trang_thai === 'cho_duyet')}
              >
                {submitting ? (
                  <>
                    <div className="spinner"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <FaCheckCircle /> Gửi yêu cầu trả phòng
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TraPhong;

