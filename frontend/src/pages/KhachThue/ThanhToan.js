import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FaCreditCard, FaMoneyBillWave, FaUniversity, FaQrcode, FaArrowLeft } from 'react-icons/fa';
import './ThanhToan.css';

const ThanhToan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hoaDon = location.state?.hoaDon;
  
  const [phuongThuc, setPhuongThuc] = useState('tien_mat');
  const [ghiChu, setGhiChu] = useState('');
  const [loading, setLoading] = useState(false);

  if (!hoaDon) {
    return (
      <div className="thanh-toan">
        <div className="error-message">
          <p>Không tìm thấy thông tin hóa đơn</p>
          <button className="btn-back" onClick={() => navigate('/khach-thue/hoa-don')}>
            <FaArrowLeft /> Quay lại
          </button>
        </div>
      </div>
    );
  }

  const handleThanhToan = async () => {
    if (!phuongThuc) {
      toast.warning('Vui lòng chọn phương thức thanh toán');
      return;
    }

    setLoading(true);
    try {
      await api.post('/thanh-toan', {
        id_hoa_don: hoaDon.id_hoa_don,
        so_tien: hoaDon.tong_tien,
        phuong_thuc: phuongThuc,
        ghi_chu: ghiChu
      });

      toast.success('Đã gửi yêu cầu thanh toán! Vui lòng đợi admin xác nhận.', {
        autoClose: 3000
      });
      setTimeout(() => {
        navigate('/khach-thue/hoa-don');
      }, 2000);
    } catch (error) {
      console.error('Lỗi khi thanh toán:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
      setLoading(false);
    }
  };

  return (
    <div className="thanh-toan">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/khach-thue/hoa-don')}>
          <FaArrowLeft /> Quay lại
        </button>
        <div>
          <h1><FaCreditCard /> Thanh toán hóa đơn</h1>
          <p>Hoàn tất thanh toán hóa đơn tháng {hoaDon.thang}/{hoaDon.nam}</p>
        </div>
      </div>

      <div className="thanh-toan-container">
        <div className="hoa-don-summary">
          <h2>Thông tin hóa đơn</h2>
          <div className="summary-content">
            <div className="summary-item">
              <span>Kỳ hóa đơn:</span>
              <span className="value">Tháng {hoaDon.thang}/{hoaDon.nam}</span>
            </div>
            <div className="summary-item">
              <span>Phòng:</span>
              <span className="value">{hoaDon.ma_phong}</span>
            </div>
            <div className="summary-item">
              <span>Tiền phòng:</span>
              <span className="value">{Number(hoaDon.tien_phong).toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="summary-item">
              <span>Tiền điện:</span>
              <span className="value">{Number(hoaDon.tien_dien).toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="summary-item">
              <span>Tiền nước:</span>
              <span className="value">{Number(hoaDon.tien_nuoc).toLocaleString('vi-VN')} đ</span>
            </div>
            {hoaDon.tien_dich_vu > 0 && (
              <div className="summary-item">
                <span>Tiền dịch vụ:</span>
                <span className="value">{Number(hoaDon.tien_dich_vu).toLocaleString('vi-VN')} đ</span>
              </div>
            )}
            <div className="summary-total">
              <span>Tổng cộng:</span>
              <span className="total-value">{Number(hoaDon.tong_tien).toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
        </div>

        <div className="phuong-thuc-section">
          <h2>Chọn phương thức thanh toán</h2>
          <div className="payment-methods">
            <div 
              className={`payment-option ${phuongThuc === 'tien_mat' ? 'active' : ''}`}
              onClick={() => setPhuongThuc('tien_mat')}
            >
              <FaMoneyBillWave className="icon" />
              <div>
                <h3>💵 Tiền mặt</h3>
                <p>Thanh toán trực tiếp bằng tiền mặt tại chỗ</p>
              </div>
            </div>

            <div 
              className={`payment-option ${phuongThuc === 'chuyen_khoan' ? 'active' : ''}`}
              onClick={() => setPhuongThuc('chuyen_khoan')}
            >
              <FaUniversity className="icon" />
              <div>
                <h3>🏦 Chuyển khoản ngân hàng</h3>
                <p>Chuyển khoản qua TPBank</p>
              </div>
            </div>
          </div>

          {phuongThuc === 'chuyen_khoan' && (
            <div className="bank-info">
              <h3>📋 Thông tin chuyển khoản</h3>
              <div className="bank-details">
                <p><strong>🏦 Ngân hàng:</strong> <span className="highlight">TPBank (Ngân hàng Tiên Phong)</span></p>
                <p><strong>💳 Số tài khoản:</strong> <span className="highlight copy-text">55519932004</span></p>
                <p><strong>👤 Chủ tài khoản:</strong> <span className="highlight">DANG THANH BINH</span></p>
                <p className="content-transfer">
                  <strong>✍️ Nội dung chuyển khoản:</strong> 
                  <span className="highlight copy-text">
                    Phong {hoaDon.ma_phong} thanh toan tien phong thang {hoaDon.thang}
                  </span>
                </p>
                <div className="transfer-note">
                  <p>⚠️ <strong>Lưu ý:</strong></p>
                  <ul>
                    <li>Vui lòng chuyển khoản đúng nội dung để được xác nhận tự động</li>
                    <li>Ghi đúng tên phòng và tháng thanh toán</li>
                    <li>Sau khi chuyển khoản, vui lòng chụp màn hình biên lai gửi cho quản lý</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {phuongThuc === 'tien_mat' && (
            <div className="bank-info">
              <h3>💵 Thanh toán tiền mặt</h3>
              <div className="bank-details">
                <p>Vui lòng thanh toán trực tiếp tại văn phòng hoặc cho người quản lý.</p>
                <div className="transfer-note">
                  <p>⚠️ <strong>Lưu ý:</strong></p>
                  <ul>
                    <li>Nhớ lấy biên lai sau khi thanh toán</li>
                    <li>Giữ biên lai để đối chiếu nếu cần</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="ghi-chu-section">
            <label>Ghi chú (nếu có)</label>
            <textarea
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              placeholder="Nhập ghi chú..."
              rows="3"
            />
          </div>

          <button 
            className="btn-thanh-toan" 
            onClick={handleThanhToan}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : `Xác nhận thanh toán ${Number(hoaDon.tong_tien).toLocaleString('vi-VN')} đ`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThanhToan;
