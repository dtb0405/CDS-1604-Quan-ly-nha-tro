import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaPhone, FaHome, FaLock, FaCamera, FaSave, FaIdCard, FaBirthdayCake } from 'react-icons/fa';
import { useAuthStore } from '../../store/authStore';
import './ThongTinCaNhan.css';

const ThongTinCaNhan = () => {
  const { nguoiDung, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  const [formData, setFormData] = useState({
    ho_ten: '',
    email: '',
    so_dien_thoai: '',
    dia_chi: '',
    anh_dai_dien: ''
  });

  const [passwordData, setPasswordData] = useState({
    mat_khau_cu: '',
    mat_khau_moi: '',
    xac_nhan_mat_khau: ''
  });

  useEffect(() => {
    layThongTin();
  }, []);

  const layThongTin = async () => {
    try {
      const response = await api.get('/auth/thong-tin-ca-nhan');
      const userData = response.data || {};
      
      // Chỉ lấy từ database, không fallback cache
      const newFormData = {
        ho_ten: userData.ho_ten || '',
        email: userData.email || '',
        so_dien_thoai: userData.so_dien_thoai || '',
        dia_chi: userData.dia_chi || '',
        anh_dai_dien: userData.anh_dai_dien || ''
      };
      
      setFormData(newFormData);
      setAvatarPreview(userData.anh_dai_dien ? `http://localhost:5001${userData.anh_dai_dien}` : null);
      // Form updated with server data
    } catch (error) {
      console.error('❌ Lỗi lấy thông tin từ database:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error message:', error.message);
      toast.error('Không thể tải thông tin từ server');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitInfo = async () => {
    setLoading(true);

    // Validate basic fields
    if (!formData.ho_ten?.trim()) {
      toast.error('Vui lòng nhập họ tên');
      setLoading(false);
      return;
    }
    
    if (!formData.email?.trim()) {
      toast.error('Vui lòng nhập email');
      setLoading(false);
      return;
    }

  // Sending updated data to server

    try {
      const response = await api.put('/auth/cap-nhat-thong-tin', formData);
  // Response received from server
      toast.success('Cập nhật thông tin thành công!');
      
      // Cập nhật store
      if (response.data.nguoi_dung) {
        const token = localStorage.getItem('token');
        setAuth(response.data.nguoi_dung, token);
      }
      
      // Refresh lại thông tin từ server
      await layThongTin();
      
      setIsEditing(false); // Thoát chế độ chỉnh sửa
    } catch (error) {
      console.error('❌ Lỗi cập nhật:', error);
      console.error('❌ Response lỗi:', error.response?.data);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPassword = async () => {
    if (passwordData.mat_khau_moi !== passwordData.xac_nhan_mat_khau) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (passwordData.mat_khau_moi.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/doi-mat-khau', {
        mat_khau_cu: passwordData.mat_khau_cu,
        mat_khau_moi: passwordData.mat_khau_moi
      });
      
      toast.success('Đổi mật khẩu thành công!');
      setPasswordData({
        mat_khau_cu: '',
        mat_khau_moi: '',
        xac_nhan_mat_khau: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB');
        return;
      }

      setAvatarFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) {
      toast.error('Vui lòng chọn ảnh');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', avatarFile);

    setLoading(true);
    try {
      const response = await api.post('/auth/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Upload ảnh đại diện thành công!');

      if (response.data.nguoi_dung) {
        const token = localStorage.getItem('token');
        setAuth(response.data.nguoi_dung, token);
      }

      await layThongTin();
      setAvatarFile(null);
    } catch (error) {
      console.error('Lỗi upload avatar:', error);
      toast.error(error.response?.data?.message || 'Lỗi upload ảnh');
    } finally {
      setLoading(false);
    }
  };

  // Debug logs removed

  return (
    <div className="thong-tin-ca-nhan">
      <div className="page-header">
        <h1><FaUser /> Thông tin cá nhân</h1>
        <p>Quản lý thông tin tài khoản của bạn</p>
      </div>

      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="avatar-section">
            <div className="avatar-wrapper">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder">
                  <FaUser />
                </div>
              )}
              <label htmlFor="avatar-input" className="avatar-upload-btn">
                <FaCamera />
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            <h3>{formData.ho_ten || 'Người dùng'}</h3>
            <p className="user-role">Khách thuê trọ</p>
            {avatarFile && (
              <button
                className="btn btn-primary btn-sm mt-2"
                onClick={handleUploadAvatar}
                disabled={loading}
              >
                <FaSave /> {loading ? 'Đang lưu...' : 'Lưu ảnh'}
              </button>
            )}
          </div>

          <div className="profile-nav">
            <button
              className={`nav-btn ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              <FaUser /> Thông tin chung
            </button>
            <button
              className={`nav-btn ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              <FaLock /> Đổi mật khẩu
            </button>
          </div>
        </div>

        <div className="profile-content">
          {activeTab === 'info' && (
            <div className="content-section">
              <h2>Thông tin cá nhân</h2>
              <div>
                <div className="form-row">
                  <div className="form-group">
                    <label><FaUser /> Họ và tên *</label>
                    <input
                      type="text"
                      name="ho_ten"
                      value={formData.ho_ten}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label><FaEnvelope /> Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label><FaPhone /> Số điện thoại</label>
                    <input
                      type="tel"
                      name="so_dien_thoai"
                      value={formData.so_dien_thoai}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label><FaHome /> Địa chỉ</label>
                    <input
                      type="text"
                      name="dia_chi"
                      value={formData.dia_chi}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="info-box">
                  <p><strong>Tên đăng nhập:</strong> {nguoiDung?.ten_dang_nhap}</p>
                  <p><strong>Loại tài khoản:</strong> Khách thuê trọ</p>
                </div>

                <div className="tenant-info-note">
                  <h4>💡 Lưu ý</h4>
                  <p>Để cập nhật thông tin phòng trọ (CMND, ngày sinh, quê quán...), vui lòng liên hệ chủ nhà trọ.</p>
                </div>

                <button type="button" className="btn-save" disabled={loading} onClick={handleSubmitInfo}>
                  <FaSave /> {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="content-section">
              <h2>Đổi mật khẩu</h2>
              <div>
                <div className="form-group">
                  <label><FaLock /> Mật khẩu hiện tại *</label>
                  <input
                    type="password"
                    name="mat_khau_cu"
                    value={passwordData.mat_khau_cu}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label><FaLock /> Mật khẩu mới *</label>
                  <input
                    type="password"
                    name="mat_khau_moi"
                    value={passwordData.mat_khau_moi}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                  />
                </div>

                <div className="form-group">
                  <label><FaLock /> Xác nhận mật khẩu mới *</label>
                  <input
                    type="password"
                    name="xac_nhan_mat_khau"
                    value={passwordData.xac_nhan_mat_khau}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="password-requirements">
                  <h4>Yêu cầu mật khẩu:</h4>
                  <ul>
                    <li>Tối thiểu 6 ký tự</li>
                    <li>Nên kết hợp chữ và số</li>
                    <li>Không trùng với mật khẩu cũ</li>
                  </ul>
                </div>

                <button type="button" className="btn-save" disabled={loading} onClick={handleSubmitPassword}>
                  <FaSave /> {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThongTinCaNhan;
