import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute = ({ children, loaiNguoiDung }) => {
  const { nguoiDung, token } = useAuthStore();

  if (!token || !nguoiDung) {
    return <Navigate to="/dang-nhap" />;
  }

  if (loaiNguoiDung && nguoiDung.loai_nguoi_dung !== loaiNguoiDung) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
