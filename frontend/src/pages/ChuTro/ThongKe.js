import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaChartBar, FaHome, FaMoneyBillWave, FaFileInvoice, FaCalendar } from 'react-icons/fa';
import './ThongKe.css';

const ThongKe = () => {
  const [thongKe, setThongKe] = useState(null);
  const [doanhThu, setDoanhThu] = useState([]);
  const [hoaDonChuaTT, setHoaDonChuaTT] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const COLORS = ['#7EC8E3', '#98D8C8', '#F7D794', '#F5B7B1', '#B8A6F0', '#D4E8F0'];

  useEffect(() => {
    layThongKe();
    layDoanhThu();
    layHoaDonChuaThanhToan();
  }, [selectedYear]);

  const layThongKe = async () => {
    try {
      const response = await api.get('/thong-ke/tong-quan');
      const data = response.data?.data || response.data;
      // Map snake_case từ backend sang camelCase cho frontend
      const mappedData = {
        tongPhong: data.tong_phong || 0,
        tongPhongDangThue: data.phong_dang_thue || 0,
        tongPhongTrong: data.phong_trong || 0,
        tongKhachThue: data.tong_khach_thue || 0,
        doanhThuThang: data.doanh_thu_thang_nay || 0,
        hoaDonChuaThanhToan: data.hoa_don_chua_thanh_toan || 0
      };
      setThongKe(mappedData);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi lấy thống kê:', error);
      toast.error('Không thể tải thống kê');
      setLoading(false);
    }
  };

  const layDoanhThu = async () => {
    try {
      const response = await api.get(`/thong-ke/doanh-thu?nam=${selectedYear}`);
      // Đảm bảo doanhThu luôn là mảng và map snake_case sang camelCase
      const rawData = Array.isArray(response.data)
        ? response.data
        : (Array.isArray(response.data?.data) ? response.data.data : []);
      
      // Map doanh_thu (snake_case) sang doanhThu (camelCase)
      const mappedData = rawData.map(item => ({
        thang: item.thang,
        doanhThu: item.doanh_thu || item.doanhThu || 0
      }));
      
      setDoanhThu(mappedData);
    } catch (error) {
      console.error('Lỗi khi lấy doanh thu:', error);
      setDoanhThu([]);
    }
  };

  const layHoaDonChuaThanhToan = async () => {
    try {
      const response = await api.get('/hoa-don?trang_thai=chua_thanh_toan');
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setHoaDonChuaTT(data);
    } catch (error) {
      console.error('Lỗi khi lấy hóa đơn chưa thanh toán:', error);
    }
  };

  const duLieuPhongTheoTrangThai = thongKe ? [
    { name: 'Đang thuê', value: thongKe.tongPhongDangThue, color: '#98D8C8' },
    { name: 'Trống', value: thongKe.tongPhongTrong, color: '#7EC8E3' },
  ] : [];

  const duLieuDoanhThu = doanhThu.map(item => ({
    thang: `T${item.thang}`,
    'Doanh thu': parseInt(item.doanhThu) || 0
  }));

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="thong-ke">
      <div className="page-header">
        <div>
          <h1><FaChartBar /> Thống kê & Báo cáo</h1>
          <p>Theo dõi doanh thu và tình hình kinh doanh</p>
        </div>
        <select 
          className="year-select" 
          value={selectedYear} 
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        >
          {[2024, 2025, 2026].map(year => (
            <option key={year} value={year}>Năm {year}</option>
          ))}
        </select>
      </div>

      <div className="stats-overview">
        <div className="stat-card blue">
          <div className="stat-icon">
            <FaHome />
          </div>
          <div className="stat-info">
            <span className="stat-label">Tổng phòng</span>
            <span className="stat-value">{thongKe?.tongPhong || 0}</span>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">
            <FaHome />
          </div>
          <div className="stat-info">
            <span className="stat-label">Đang thuê</span>
            <span className="stat-value">{thongKe?.tongPhongDangThue || 0}</span>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">
            <FaMoneyBillWave />
          </div>
          <div className="stat-info">
            <span className="stat-label">Doanh thu tháng</span>
            <span className="stat-value">{Number(thongKe?.doanhThuThang || 0).toLocaleString('vi-VN')} đ</span>
          </div>
        </div>

        <div className="stat-card red">
          <div className="stat-icon">
            <FaFileInvoice />
          </div>
          <div className="stat-info">
            <span className="stat-label">Hóa đơn chưa TT</span>
            <span className="stat-value">{thongKe?.hoaDonChuaThanhToan || 0}</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h2><FaChartBar /> Doanh thu năm {selectedYear}</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={duLieuDoanhThu}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EFF6FB" />
              <XAxis dataKey="thang" stroke="#6B7280" />
              <YAxis stroke="#6B7280" tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
              <Tooltip 
                formatter={(value) => [`${Number(value).toLocaleString('vi-VN')} đ`, 'Doanh thu']}
                contentStyle={{ 
                  background: 'white', 
                  border: '2px solid #7EC8E3', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="Doanh thu" fill="url(#colorRevenue)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7EC8E3" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#5BA4C4" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2><FaHome /> Tình trạng phòng</h2>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={duLieuPhongTheoTrangThai}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {duLieuPhongTheoTrangThai.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'Số phòng']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-legend">
            {duLieuPhongTheoTrangThai.map((item, index) => (
              <div key={index} className="legend-item">
                <span className="legend-dot" style={{ background: item.color }}></span>
                <span>{item.name}: {item.value} phòng</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="unpaid-invoices">
        <h2><FaFileInvoice /> Hóa đơn chưa thanh toán</h2>
        {hoaDonChuaTT.length > 0 ? (
          <div className="invoice-table">
            <table>
              <thead>
                <tr>
                  <th>Phòng</th>
                  <th>Kỳ</th>
                  <th>Tiền phòng</th>
                  <th>Tiền điện</th>
                  <th>Tiền nước</th>
                  <th>Tổng tiền</th>
                  <th>Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {hoaDonChuaTT.map((hd) => (
                  <tr key={hd.id}>
                    <td className="room">{hd.ma_phong}</td>
                    <td><FaCalendar /> {hd.thang}/{hd.nam}</td>
                    <td>{Number(hd.tien_phong || 0).toLocaleString('vi-VN')} đ</td>
                    <td>{Number(hd.tien_dien || 0).toLocaleString('vi-VN')} đ</td>
                    <td>{Number(hd.tien_nuoc || 0).toLocaleString('vi-VN')} đ</td>
                    <td className="total">{Number(hd.tong_tien || 0).toLocaleString('vi-VN')} đ</td>
                    <td>{new Date(hd.ngay_tao).toLocaleDateString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-data">
            <FaFileInvoice size={48} />
            <p>Tất cả hóa đơn đã được thanh toán</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThongKe;
