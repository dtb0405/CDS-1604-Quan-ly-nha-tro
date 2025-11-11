import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import DangNhap from './pages/DangNhap';
import DangKy from './pages/DangKy';
import QuenMatKhau from './pages/QuenMatKhau';
import DashboardChuTro from './pages/ChuTro/Dashboard';
import QuanLyPhong from './pages/ChuTro/QuanLyPhong';
import QuanLyKhachThue from './pages/ChuTro/QuanLyKhachThue';
import DuyetTraPhong from './pages/ChuTro/DuyetTraPhong';
import LichSuTraPhong from './pages/ChuTro/LichSuTraPhong';
import QuanLyHoaDon from './pages/ChuTro/QuanLyHoaDon';
import QuanLyDienNuoc from './pages/ChuTro/QuanLyDienNuoc';
import QuanLyThanhToan from './pages/ChuTro/QuanLyThanhToan';
import ThongKe from './pages/ChuTro/ThongKe';
import PhanHoi from './pages/ChuTro/PhanHoi';
import ThongTinCaNhanChuTro from './pages/ChuTro/ThongTinCaNhan';

import DashboardKhachThue from './pages/KhachThue/Dashboard';
import HoaDonCuaToi from './pages/KhachThue/HoaDonCuaToi';
import ThanhToan from './pages/KhachThue/ThanhToan';
import GuiPhanHoi from './pages/KhachThue/GuiPhanHoi';
import LichSuPhanHoi from './pages/KhachThue/LichSuPhanHoi';
import ThongTinCaNhanKhachThue from './pages/KhachThue/ThongTinCaNhan';
import TraPhong from './pages/KhachThue/TraPhong';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Store
import { useAuthStore } from './store/authStore';

function App() {
  const { nguoiDung } = useAuthStore();

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Public routes */}
        <Route path="/dang-nhap" element={<DangNhap />} />
        <Route path="/dang-ky" element={<DangKy />} />
        <Route path="/quen-mat-khau" element={<QuenMatKhau />} />

        {/* Chủ trọ routes */}
        <Route
          path="/chu-tro/*"
          element={
            <ProtectedRoute loaiNguoiDung="chu_tro">
              <Layout>
                <Routes>
                  <Route path="dashboard" element={<DashboardChuTro />} />
                  <Route path="phong" element={<QuanLyPhong />} />
                  <Route path="khach-thue" element={<QuanLyKhachThue />} />
                  <Route path="duyet-tra-phong" element={<DuyetTraPhong />} />
                    <Route path="lich-su-tra-phong" element={<LichSuTraPhong />} />
                  <Route path="hoa-don" element={<QuanLyHoaDon />} />
                  <Route path="dien-nuoc" element={<QuanLyDienNuoc />} />
                  <Route path="thanh-toan" element={<QuanLyThanhToan />} />
                  <Route path="thong-ke" element={<ThongKe />} />
                  <Route path="phan-hoi" element={<PhanHoi />} />
                  <Route path="thong-tin-ca-nhan" element={<ThongTinCaNhanChuTro />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Khách thuê routes */}
        <Route
          path="/khach-thue/*"
          element={
            <ProtectedRoute loaiNguoiDung="khach_thue">
              <Layout>
                <Routes>
                  <Route path="dashboard" element={<DashboardKhachThue />} />
                  <Route path="hoa-don" element={<HoaDonCuaToi />} />
                  <Route path="thanh-toan" element={<ThanhToan />} />
                  <Route path="phan-hoi" element={<GuiPhanHoi />} />
                  <Route path="phan-hoi/lich-su" element={<LichSuPhanHoi />} />
                  <Route path="thong-tin-ca-nhan" element={<ThongTinCaNhanKhachThue />} />
                  <Route path="tra-phong" element={<TraPhong />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Redirect */}
        <Route
          path="/"
          element={
            nguoiDung ? (
              nguoiDung.loai_nguoi_dung === 'chu_tro' ? (
                <Navigate to="/chu-tro/dashboard" />
              ) : (
                <Navigate to="/khach-thue/dashboard" />
              )
            ) : (
              <Navigate to="/dang-nhap" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
