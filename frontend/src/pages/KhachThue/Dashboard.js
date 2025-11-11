import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FaHome, FaBolt, FaWater, FaConciergeBell, FaMoneyBillWave } from 'react-icons/fa';
import { useAuthStore } from '../../store/authStore';
import './Dashboard.css';

const DashboardKhachThue = () => {
  const { nguoiDung } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [roomInfo, setRoomInfo] = useState(null);

  useEffect(() => {
    layThongTinPhong();
  }, []);

  const layThongTinPhong = async () => {
    try {
      console.log('📥 Đang lấy thông tin phòng thuê...');
      const response = await api.get('/khach-thue/thong-tin-cua-toi');
      console.log('📊 Response từ API:', response.data);
      
      if (response.data && response.data.data) {
        const thongTin = response.data.data;
        console.log('✅ Thông tin thuê:', thongTin);
        
        if (thongTin.id_phong) {
          setRoomInfo(thongTin);
          console.log('✅ Đã set roomInfo:', thongTin);
        } else {
          console.log('⚠️ Chưa được gán phòng');
          setRoomInfo(null);
        }
      } else {
        console.log('⚠️ Không có dữ liệu');
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

  const formatCurrency = (amount) => {
    return parseInt(amount).toLocaleString('vi-VN');
  };

  // Tính tổng tiền dịch vụ (cố định + theo người)
  const tinhTienDichVu = (roomInfo) => {
    if (!roomInfo) return 0;
    const dichVuCoBan = Number(roomInfo.tien_dich_vu || 0);
    const dichVuNguoi = Number(roomInfo.tien_dich_vu_nguoi || 0);
    const soNguoi = Number(roomInfo.so_nguoi_o || 0);
    return dichVuCoBan + (dichVuNguoi * soNguoi);
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="tenant-dashboard modern">
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>Xin chào, {nguoiDung?.ho_ten}! <span className="wave">👋</span></h1>
          <p>Chào mừng bạn trở lại. Dưới đây là tóm tắt nhanh về phòng và hóa đơn của bạn.</p>
        </div>
        {roomInfo && (
          <div className="quick-stats">
            <div className="quick-stat">
              <div className="icon-wrapper rent"><FaMoneyBillWave /></div>
              <div className="stat-info">
                <p className="stat-label">Giá thuê</p>
                <p className="stat-value">{formatCurrency(roomInfo.gia_thue_hd || roomInfo.gia_thue_phong || 0)}đ</p>
              </div>
            </div>
            <div className="quick-stat">
              <div className="icon-wrapper deposit"><FaHome /></div>
              <div className="stat-info">
                <p className="stat-label">Tiền cọc</p>
                <p className="stat-value">{formatCurrency(roomInfo.tien_coc || 0)}đ</p>
              </div>
            </div>
            <div className="quick-stat">
              <div className="icon-wrapper service"><FaConciergeBell /></div>
              <div className="stat-info">
                <p className="stat-label">Dịch vụ</p>
                <p className="stat-value">{formatCurrency(tinhTienDichVu(roomInfo))}đ</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {roomInfo ? (
        <>
          {roomInfo.trang_thai_tra_phong === 'da_duyet' && (
            <div className="checkout-notice">
              <div className="checkout-icon">✓</div>
              <div className="checkout-content">
                <h3>Đã trả phòng</h3>
                <p>Bạn đã trả phòng vào ngày {roomInfo.ngay_tra_phong ? new Date(roomInfo.ngay_tra_phong).toLocaleDateString('vi-VN') : 'N/A'}</p>
                {roomInfo.ly_do_tra_phong && <p className="checkout-reason">Lý do: {roomInfo.ly_do_tra_phong}</p>}
              </div>
            </div>
          )}
          
          <div className="user-info-panel">
            <h3>Thông tin người dùng</h3>
            <div className="user-info-box">
              <p><strong>Họ tên:</strong> {roomInfo.ho_ten_nguoi_dung || nguoiDung?.ho_ten || 'N/A'}</p>
              <p><strong>Email:</strong> {roomInfo.email_nguoi_dung || nguoiDung?.email || 'N/A'}</p>
              <p><strong>Số điện thoại:</strong> {roomInfo.so_dien_thoai_nguoi_dung || nguoiDung?.so_dien_thoai || 'N/A'}</p>
              <p><strong>Địa chỉ:</strong> {roomInfo.dia_chi_nguoi_dung || nguoiDung?.dia_chi || 'Chưa cập nhật'}</p>
            </div>
          </div>
          <div className="room-info-card elevated">
            <div className="card-header">
              <div className="card-title"><FaHome /> Thông tin phòng</div>
              {roomInfo.ngay_vao && (
                <div className="badge subtle">Thuê từ {new Date(roomInfo.ngay_vao).toLocaleDateString('vi-VN')}</div>
              )}
            </div>
            <div className="room-details grid-2">
              <div className="detail-item">
                <span className="label">Tên phòng:</span>
                <span className="value">{roomInfo.ten_phong || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Diện tích:</span>
                <span className="value">{roomInfo.dien_tich || 'N/A'} m²</span>
              </div>
              <div className="detail-item">
                <span className="label">Giá thuê:</span>
                <span className="value">{formatCurrency(roomInfo.gia_thue_hd || roomInfo.gia_thue_phong || 0)}đ/tháng</span>
              </div>
              <div className="detail-item">
                <span className="label">Tiền cọc:</span>
                <span className="value">{formatCurrency(roomInfo.tien_coc || 0)}đ</span>
              </div>
              <div className="detail-item">
                <span className="label">Ngày bắt đầu thuê:</span>
                <span className="value">{roomInfo.ngay_vao ? new Date(roomInfo.ngay_vao).toLocaleDateString('vi-VN') : 'N/A'}</span>
              </div>
              {roomInfo.ten_chu_tro && (
                <>
                  <div className="detail-item">
                    <span className="label">Chủ nhà:</span>
                    <span className="value">{roomInfo.ten_chu_tro}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">SĐT chủ nhà:</span>
                    <span className="value">{roomInfo.sdt_chu_tro || 'N/A'}</span>
                  </div>
                </>
              )}
              {roomInfo.mo_ta && (
                <div className="detail-item full-width">
                  <span className="label">Mô tả:</span>
                  <p className="description">{roomInfo.mo_ta}</p>
                </div>
              )}
            </div>
          </div>

          <div className="supplementary-cards">
            <div className="small-card">
              <div className="icon-circle electric"><FaBolt /></div>
              <div className="small-card-content">
                <p className="sc-label">Giá điện</p>
                <p className="sc-value">{formatCurrency(roomInfo.gia_dien || 3500)} đ/kWh</p>
              </div>
            </div>
            <div className="small-card">
              <div className="icon-circle water"><FaWater /></div>
              <div className="small-card-content">
                <p className="sc-label">Giá nước</p>
                <p className="sc-value">{formatCurrency(roomInfo.gia_nuoc || 20000)} đ/m³</p>
              </div>
            </div>
            <div className="small-card">
              <div className="icon-circle service"><FaConciergeBell /></div>
              <div className="small-card-content">
                <p className="sc-label">Dịch vụ</p>
                <p className="sc-value">{formatCurrency(tinhTienDichVu(roomInfo))} đ/tháng</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="no-room-info">
          <FaHome size={48} />
          <h3>Chưa có thông tin phòng</h3>
          <p>Vui lòng liên hệ chủ nhà trọ để được hỗ trợ</p>
        </div>
      )}
    </div>
  );
};

export default DashboardKhachThue;
