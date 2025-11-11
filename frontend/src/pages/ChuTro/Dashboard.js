import React, { useEffect, useState } from 'react';
import { FiHome, FiUsers, FiFileText, FiDollarSign } from 'react-icons/fi';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import './Dashboard.css';

const DashboardChuTro = () => {
  const [thongKe, setThongKe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    layThongKe();
  }, []);

  const layThongKe = async () => {
    try {
      const response = await api.get('/thong-ke/tong-quan');
      setThongKe(response.data.data);
    } catch (error) {
      toast.error('Lỗi khi tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0';
    const num = parseInt(amount);
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>📊 Tổng quan hệ thống</h1>
          <p>Quản lý và theo dõi hoạt động nhà trọ</p>
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon-wrapper">
            <div className="stat-icon">
              <FiHome />
            </div>
          </div>
          <div className="stat-content">
            <p className="stat-label">Tổng số phòng</p>
            <h3 className="stat-value">{thongKe?.tong_phong || 0}</h3>
            <div className="stat-footer">
              <span className="stat-badge">Tất cả</span>
            </div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon-wrapper">
            <div className="stat-icon">
              <FiHome />
            </div>
          </div>
          <div className="stat-content">
            <p className="stat-label">Phòng đang thuê</p>
            <h3 className="stat-value">{thongKe?.phong_dang_thue || 0}</h3>
            <div className="stat-footer">
              <span className="stat-badge success">Đang hoạt động</span>
            </div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon-wrapper">
            <div className="stat-icon">
              <FiHome />
            </div>
          </div>
          <div className="stat-content">
            <p className="stat-label">Phòng trống</p>
            <h3 className="stat-value">{thongKe?.phong_trong || 0}</h3>
            <div className="stat-footer">
              <span className="stat-badge warning">Chờ khách</span>
            </div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon-wrapper">
            <div className="stat-icon">
              <FiUsers />
            </div>
          </div>
          <div className="stat-content">
            <p className="stat-label">Khách thuê</p>
            <h3 className="stat-value">{thongKe?.tong_khach_thue || 0}</h3>
            <div className="stat-footer">
              <span className="stat-badge info">Người</span>
            </div>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon-wrapper">
            <div className="stat-icon">
              <FiFileText />
            </div>
          </div>
          <div className="stat-content">
            <p className="stat-label">Hóa đơn chưa thanh toán</p>
            <h3 className="stat-value">{thongKe?.hoa_don_chua_thanh_toan || 0}</h3>
            <div className="stat-footer">
              <span className="stat-badge danger">Cần xử lý</span>
            </div>
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-icon-wrapper">
            <div className="stat-icon">
              <FiDollarSign />
            </div>
          </div>
          <div className="stat-content">
            <p className="stat-label">Doanh thu tháng này</p>
            <h3 className="stat-value">{formatCurrency(thongKe?.doanh_thu_thang_nay)} đ</h3>
            <div className="stat-footer">
              <span className="stat-badge revenue">💰 Thu nhập</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardChuTro;
