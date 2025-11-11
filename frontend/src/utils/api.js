import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor để thêm token
api.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage trực tiếp để đảm bảo đồng bộ
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  (error) => {
  // Optional: handle logging via a centralized logger if needed
    
    if (error.response?.status === 401) {
      // Kiểm tra xem có phải request cập nhật thông tin cá nhân không
      const isProfileUpdate = error.config?.url?.includes('/auth/cap-nhat-thong-tin') || 
                             error.config?.url?.includes('/auth/upload-avatar');
      
      if (isProfileUpdate) {
        // Không auto logout cho profile update, để component xử lý
      } else {
        // Auto logout on 401 for non-profile requests
        useAuthStore.getState().logout();
        window.location.href = '/dang-nhap';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
