import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import api from '../utils/api';
import './Auth.css';

const QuenMatKhau = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/auth/quen-mat-khau', { email });
      setEmailSent(true);
      toast.success('Đã gửi link đặt lại mật khẩu đến email của bạn!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-split">
        <div className="auth-left">
          <div className="auth-brand">
            <h1>Quản lý Nhà trọ</h1>
            <p>Hệ thống quản lý chuyên nghiệp</p>
          </div>
          <div className="auth-illustration">
            <div className="illustration-circle"></div>
            <div className="illustration-shape shape-1"></div>
            <div className="illustration-shape shape-2"></div>
            <div className="illustration-shape shape-3"></div>
          </div>
        </div>

        <div className="auth-right">
          <Link to="/dang-nhap" className="back-link">
            <FaArrowLeft /> Quay lại đăng nhập
          </Link>

          <div className="auth-header">
            <h2>Quên mật khẩu?</h2>
            <p>Nhập email của bạn để nhận link đặt lại mật khẩu</p>
          </div>

          {!emailSent ? (
            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label><FaEnvelope /> Địa chỉ Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                    autoComplete="email"
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Đang gửi...' : 'Gửi link đặt lại'}
                </button>

                <div className="auth-footer">
                  <p>Nhớ mật khẩu? <Link to="/dang-nhap" className="auth-link">Đăng nhập ngay</Link></p>
                </div>
              </form>
            ) : (
              <div className="success-message">
                <div className="success-icon">✅</div>
                <h3>Đã gửi email!</h3>
                <p>Vui lòng kiểm tra hộp thư email của bạn và làm theo hướng dẫn để đặt lại mật khẩu.</p>
                <p className="note">Lưu ý: Link sẽ hết hạn sau 1 giờ</p>
                <Link to="/dang-nhap" className="btn-primary">
                  Về trang đăng nhập
                </Link>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default QuenMatKhau;
