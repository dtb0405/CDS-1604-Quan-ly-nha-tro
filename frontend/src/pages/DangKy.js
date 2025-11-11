import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaLock, FaUser, FaEnvelope, FaPhone, FaHome } from 'react-icons/fa';
import api from '../utils/api';
import './Auth.css';

const DangKy = () => {
  const [formData, setFormData] = useState({
    ten_dang_nhap: '',
    mat_khau: '',
    xac_nhan_mat_khau: '',
    ho_ten: '',
    email: '',
    so_dien_thoai: '',
    dia_chi: '',
    loai_nguoi_dung: 'khach_thue'
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (formData.mat_khau !== formData.xac_nhan_mat_khau) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);

    try {
      const { xac_nhan_mat_khau, ...dataToSend } = formData;
      await api.post('/auth/dang-ky', dataToSend);
      
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/dang-nhap');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại!');
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
          <div className="auth-header">
            <h2>Đăng ký tài khoản</h2>
            <p>Tạo tài khoản mới để bắt đầu sử dụng</p>
          </div>

          <div className="auth-form">
              <div className="form-group">
                <label>Loại tài khoản</label>
                <select
                  name="loai_nguoi_dung"
                  value={formData.loai_nguoi_dung}
                  onChange={handleChange}
                  required
                >
                  <option value="khach_thue">👤 Khách thuê trọ</option>
                  <option value="chu_tro">🏢 Chủ nhà trọ</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><FaUser /> Tên đăng nhập *</label>
                  <input
                    type="text"
                    name="ten_dang_nhap"
                    value={formData.ten_dang_nhap}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Tên đăng nhập"
                    required
                    autoComplete="username"
                  />
                </div>

                <div className="form-group">
                  <label><FaUser /> Họ và tên *</label>
                  <input
                    type="text"
                    name="ho_ten"
                    value={formData.ho_ten}
                    onChange={handleChange}
                    placeholder="Họ và tên đầy đủ"
                    required
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label><FaEnvelope /> Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><FaPhone /> Số điện thoại</label>
                  <input
                    type="tel"
                    name="so_dien_thoai"
                    value={formData.so_dien_thoai}
                    onChange={handleChange}
                    placeholder="0123456789"
                    autoComplete="tel"
                  />
                </div>

                <div className="form-group">
                  <label><FaHome /> Địa chỉ</label>
                  <input
                    type="text"
                    name="dia_chi"
                    value={formData.dia_chi}
                    onChange={handleChange}
                    placeholder="Địa chỉ"
                    autoComplete="address"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><FaLock /> Mật khẩu *</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="mat_khau"
                      value={formData.mat_khau}
                      onChange={handleChange}
                      placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        width: 36,
                        height: 36,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        padding: 8,
                        margin: 0,
                        cursor: 'pointer'
                      }}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label><FaLock /> Xác nhận mật khẩu *</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="xac_nhan_mat_khau"
                      value={formData.xac_nhan_mat_khau}
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Nhập lại mật khẩu"
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex="-1"
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        width: 36,
                        height: 36,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        padding: 8,
                        margin: 0,
                        cursor: 'pointer'
                      }}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>

            <button type="button" onClick={handleSubmit} className="btn-primary" disabled={loading}>
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>

            <div className="auth-footer">
              <p>Đã có tài khoản? <Link to="/dang-nhap" className="auth-link">Đăng nhập ngay</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DangKy;
