import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import './QuanLyPhong.css';

const QuanLyPhong = () => {
  const [phongs, setPhongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    ten_phong: '',
    dien_tich: '',
    gia_thue: '',
    tien_coc: '',
    mo_ta: '',
    so_nguoi_toi_da: 2,
    trang_thai: 'trong',
    tien_dich_vu: '',
    tien_dich_vu_nguoi: '',
    dich_vu_bao_gom: ''
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    layDanhSachPhong();
    
    // Refresh data khi focus vào window
    const handleFocus = () => {
      layDanhSachPhong();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const layDanhSachPhong = async () => {
    try {
      const response = await api.get('/phong');
      const data = response.data?.data || response.data || [];
      setPhongs(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách phòng');
      setPhongs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editId) {
        await api.put(`/phong/${editId}`, formData);
        toast.success('Cập nhật phòng thành công');
      } else {
        await api.post('/phong', formData);
        toast.success('Thêm phòng thành công');
      }
      setShowModal(false);
      resetForm();
      layDanhSachPhong();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (phong) => {
    setEditId(phong.id_phong);
    setFormData({
      ten_phong: phong.ten_phong,
      dien_tich: phong.dien_tich,
      gia_thue: phong.gia_thue,
      tien_coc: phong.tien_coc || '',
      mo_ta: phong.mo_ta || '',
      so_nguoi_toi_da: phong.so_nguoi_toi_da,
      trang_thai: phong.trang_thai,
      tien_dich_vu: phong.tien_dich_vu || '',
      tien_dich_vu_nguoi: phong.tien_dich_vu_nguoi || '',
      dich_vu_bao_gom: phong.dich_vu_bao_gom || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
      try {
        await api.delete(`/phong/${id}`);
        toast.success('Xóa phòng thành công');
        layDanhSachPhong();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Lỗi khi xóa phòng');
      }
    }
  };

  const dongBoTrangThaiPhong = async () => {
    if (!window.confirm('Đồng bộ trạng thái tất cả phòng dựa trên tình trạng khách thuê?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.post('/phong/dong-bo-trang-thai');
      const { da_cap_nhat, khong_thay_doi, chi_tiet } = response.data;
      
      if (da_cap_nhat > 0) {
        toast.success(`Đã cập nhật ${da_cap_nhat} phòng, ${khong_thay_doi} phòng không thay đổi`);
        console.log('📊 Chi tiết đồng bộ:', chi_tiet);
      } else {
        toast.info('Tất cả phòng đã đúng trạng thái');
      }
      
      layDanhSachPhong();
    } catch (error) {
      console.error('Lỗi đồng bộ:', error);
      toast.error('Không thể đồng bộ trạng thái phòng');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      ten_phong: '',
      dien_tich: '',
      gia_thue: '',
      tien_coc: '',
      mo_ta: '',
      so_nguoi_toi_da: 2,
      trang_thai: 'trong',
      tien_dich_vu: '',
      tien_dich_vu_nguoi: '',
      dich_vu_bao_gom: ''
    });
    setEditId(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="quan-ly-phong">
      <div className="page-header">
        <h1>Quản lý phòng trọ</h1>
        <div className="header-actions">
          <button 
            className="btn-sync" 
            onClick={dongBoTrangThaiPhong}
            disabled={loading}
            title="Đồng bộ trạng thái phòng với khách thuê thực tế"
          >
            🔄 Đồng bộ trạng thái
          </button>
          <button 
            className="btn-primary btn-add-room" 
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            + Thêm phòng mới
          </button>
        </div>
      </div>

      <div className="phong-grid">
        {phongs.map(phong => (
          <div key={phong.id_phong} className="phong-card">
            <div className="phong-header">
              <h3>{phong.ten_phong}</h3>
              <span className={`trang-thai-badge ${phong.trang_thai}`}>
                {phong.trang_thai === 'trong' ? 'Còn trống' : 'Đã thuê'}
              </span>
            </div>
            
            <div className="phong-info">
              <div className="info-item">
                <span className="label">Diện tích:</span>
                <span className="value">{phong.dien_tich}m²</span>
              </div>
              <div className="info-item">
                <span className="label">Giá thuê:</span>
                <span className="value">{parseInt(phong.gia_thue).toLocaleString('vi-VN')}đ/tháng</span>
              </div>
              <div className="info-item">
                <span className="label">Tiền cọc:</span>
                <span className="value">{parseInt(phong.tien_coc || 0).toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="info-item">
                <span className="label">Số người tối đa:</span>
                <span className="value">{phong.so_nguoi_toi_da} người</span>
              </div>
              {phong.tien_dich_vu && (
                <div className="info-item">
                  <span className="label">Tiền dịch vụ cơ bản:</span>
                  <span className="value">{parseInt(phong.tien_dich_vu).toLocaleString('vi-VN')}đ/tháng</span>
                </div>
              )}
              {phong.tien_dich_vu_nguoi && (
                <div className="info-item">
                  <span className="label">Tiền dịch vụ/người:</span>
                  <span className="value">{parseInt(phong.tien_dich_vu_nguoi).toLocaleString('vi-VN')}đ/tháng</span>
                </div>
              )}
              {phong.dich_vu_bao_gom && (
                <div className="info-item full">
                  <span className="label">Dịch vụ:</span>
                  <p className="description">{phong.dich_vu_bao_gom}</p>
                </div>
              )}
              {phong.mo_ta && (
                <div className="info-item full">
                  <span className="label">Mô tả:</span>
                  <p className="description">{phong.mo_ta}</p>
                </div>
              )}
            </div>

            <div className="phong-actions">
              <button className="btn-edit" onClick={() => handleEdit(phong)}>
                Sửa
              </button>
              <button className="btn-delete" onClick={() => handleDelete(phong.id_phong)}>
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editId ? 'Cập nhật phòng' : 'Thêm phòng mới'}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="phong-form">
              <div className="form-group">
                <label>Tên phòng *</label>
                <input
                  type="text"
                  name="ten_phong"
                  value={formData.ten_phong}
                  onChange={handleChange}
                  placeholder="VD: Phòng 101"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Diện tích (m²) *</label>
                  <input
                    type="number"
                    name="dien_tich"
                    value={formData.dien_tich}
                    onChange={handleChange}
                    placeholder="VD: 20"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Số người tối đa *</label>
                  <input
                    type="number"
                    name="so_nguoi_toi_da"
                    value={formData.so_nguoi_toi_da}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Giá thuê (VNĐ/tháng) *</label>
                  <input
                    type="number"
                    name="gia_thue"
                    value={formData.gia_thue}
                    onChange={handleChange}
                    placeholder="VD: 2000000"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tiền cọc (VNĐ)</label>
                  <input
                    type="number"
                    name="tien_coc"
                    value={formData.tien_coc}
                    onChange={handleChange}
                    placeholder="VD: 2000000"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tiền dịch vụ cơ bản (VNĐ/tháng)</label>
                  <input
                    type="number"
                    name="tien_dich_vu"
                    value={formData.tien_dich_vu}
                    onChange={handleChange}
                    placeholder="VD: 200000"
                  />
                </div>

                <div className="form-group">
                  <label>Tiền dịch vụ/người (VNĐ/tháng)</label>
                  <input
                    type="number"
                    name="tien_dich_vu_nguoi"
                    value={formData.tien_dich_vu_nguoi}
                    onChange={handleChange}
                    placeholder="VD: 50000"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Trạng thái *</label>
                  <select
                    name="trang_thai"
                    value={formData.trang_thai}
                    onChange={handleChange}
                    required
                  >
                    <option value="trong">Còn trống</option>
                    <option value="dang_thue">Đang thuê</option>
                    <option value="can_don">Cần dọn</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Dịch vụ bao gồm</label>
                <input
                  type="text"
                  name="dich_vu_bao_gom"
                  value={formData.dich_vu_bao_gom}
                  onChange={handleChange}
                  placeholder="VD: Máy giặt, Thang máy, Bãi đỗ xe, Wifi"
                />
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="mo_ta"
                  value={formData.mo_ta}
                  onChange={handleChange}
                  placeholder="Mô tả chi tiết về phòng..."
                  rows="4"
                ></textarea>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-primary">
                  {editId ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuanLyPhong;
