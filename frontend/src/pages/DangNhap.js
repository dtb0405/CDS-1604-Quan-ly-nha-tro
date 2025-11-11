import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaLock, FaUser } from 'react-icons/fa';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';
import './Auth.css';

const DangNhap = () => {
  const [formData, setFormData] = useState({
    ten_dang_nhap: '',
    mat_khau: '',
    role: 'user' // default role
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/dang-nhap', { 
        ten_dang_nhap: formData.ten_dang_nhap, 
        mat_khau: formData.mat_khau, 
        role: formData.role 
      });
      
      if (response.data.token) {
        setAuth(response.data.nguoi_dung, response.data.token);
        toast.success('Đăng nhập thành công!');
        
        // Redirect dựa vào loại người dùng
        if (response.data.nguoi_dung.loai_nguoi_dung === 'chu_tro') {
          navigate('/chu-tro/dashboard');
        } else {
          navigate('/khach-thue/dashboard');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại!');
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
            <h2>Đăng nhập</h2>
            <p>Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục</p>
          </div>

          <div className="auth-form">
              <div className="form-group">
                <label><FaUser /> Tên đăng nhập</label>
                <input
                  type="text"
                  name="ten_dang_nhap"
                  value={formData.ten_dang_nhap}
                  onChange={handleChange}
                  placeholder="Nhập tên đăng nhập"
                  required
                  autoComplete="username"
                />
              </div>

              <div className="form-group">
                <label><FaLock /> Mật khẩu</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="mat_khau"
                    value={formData.mat_khau}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu"
                    required
                    autoComplete="current-password"
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

              <div className="form-options">
                <Link to="/quen-mat-khau" className="forgot-password">
                  Quên mật khẩu?
                </Link>
            </div>

            <button type="button" onClick={handleSubmit} className="btn-primary" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>

            <div className="auth-footer">
              <p>Chưa có tài khoản? <Link to="/dang-ky" className="auth-link">Đăng ký ngay</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};export default DangNhap;
