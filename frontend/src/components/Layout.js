import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiUsers, FiFileText, FiZap, FiBarChart2, FiMessageSquare, FiLogOut, FiDollarSign, FiUser, FiGrid, FiUserX, FiClock } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import './Layout.css';

const Layout = ({ children }) => {
  const { nguoiDung, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/dang-nhap');
  };

  // Menu cho chủ trọ
  const menuChuTro = [
    { path: '/chu-tro/dashboard', icon: <FiHome />, label: 'Tổng quan' },
    { path: '/chu-tro/phong', icon: <FiGrid />, label: 'Quản lý phòng' },
    { path: '/chu-tro/khach-thue', icon: <FiUsers />, label: 'Khách thuê' },
    { path: '/chu-tro/duyet-tra-phong', icon: <FiUserX />, label: 'Yêu cầu trả phòng' },
    { path: '/chu-tro/lich-su-tra-phong', icon: <FiClock />, label: 'Lịch sử trả phòng' },
    { path: '/chu-tro/dien-nuoc', icon: <FiZap />, label: 'Điện nước' },
    { path: '/chu-tro/hoa-don', icon: <FiFileText />, label: 'Hóa đơn' },
    { path: '/chu-tro/thanh-toan', icon: <FiDollarSign />, label: 'Quản lý thanh toán' },
    { path: '/chu-tro/thong-ke', icon: <FiBarChart2 />, label: 'Thống kê' },
    { path: '/chu-tro/phan-hoi', icon: <FiMessageSquare />, label: 'Phản hồi' },
    { path: '/chu-tro/thong-tin-ca-nhan', icon: <FiUser />, label: 'Thông tin cá nhân' }
  ];

  // Menu cho khách thuê
  const menuKhachThue = [
    { path: '/khach-thue/dashboard', icon: <FiHome />, label: 'Trang chủ' },
    { path: '/khach-thue/hoa-don', icon: <FiFileText />, label: 'Hóa đơn' },
    { path: '/khach-thue/thanh-toan', icon: <FiDollarSign />, label: 'Thanh toán' },
    { path: '/khach-thue/phan-hoi', icon: <FiMessageSquare />, label: 'Gửi phản hồi' },
    { path: '/khach-thue/phan-hoi/lich-su', icon: <FiMessageSquare />, label: 'Lịch sử phản hồi' },
    { path: '/khach-thue/tra-phong', icon: <FiUserX />, label: 'Yêu cầu trả phòng' },
    { path: '/khach-thue/thong-tin-ca-nhan', icon: <FiUser />, label: 'Thông tin cá nhân' }
  ];

  const menu = nguoiDung?.loai_nguoi_dung === 'chu_tro' ? menuChuTro : menuKhachThue;

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-container" style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
            <div className="logo-wrapper">
              <div className="logo-icon">🏢</div>
              <div className="logo-glow"></div>
            </div>
            <h1 className="brand-title" style={{fontSize: '1.3em', fontWeight: 700, margin: 0, color: '#3a2d6d', textTransform: 'uppercase'}}>Quản lý Nhà trọ</h1>
          </div>
          
          <div className="user-profile">
            <div className="avatar-container">
              {nguoiDung?.anh_dai_dien ? (
                <img 
                  className="user-avatar user-avatar-img" 
                  src={`http://localhost:5001${nguoiDung.anh_dai_dien}`} 
                  alt="Avatar"
                />
              ) : (
                <div className="user-avatar">
                  {nguoiDung?.ho_ten?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="online-indicator"></div>
            </div>
            <div className="user-details">
              <div className="user-name">{nguoiDung?.ho_ten || 'Người dùng'}</div>
              <div className="user-role-badge">
                <span className="role-icon">
                  {nguoiDung?.loai_nguoi_dung === 'chu_tro' ? '👑' : '🧑‍💼'}
                </span>
                <span className="role-text">
                  {nguoiDung?.loai_nguoi_dung === 'chu_tro' ? 'Chủ trọ' : 'Khách thuê'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}

          <button className="nav-item logout-btn" onClick={handleLogout}>
            <span className="nav-icon"><FiLogOut /></span>
            <span className="nav-label">Đăng xuất</span>
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>

  {/* Chatbot removed per request */}
    </div>
  );
};

export default Layout;
