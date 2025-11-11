import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FaBolt, FaTint, FaPlus, FaHistory, FaCalculator, FaHome, FaEdit, FaTrash } from 'react-icons/fa';
import './QuanLyDienNuoc.css';

const QuanLyDienNuoc = () => {
  const [dienNuoc, setDienNuoc] = useState([]);
  const [phongList, setPhongList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedPhong, setSelectedPhong] = useState('');
  const [chiSoCu, setChiSoCu] = useState(null);
  
  const [formData, setFormData] = useState({
    ma_phong: '',
    thang: new Date().getMonth() + 1,
    nam: new Date().getFullYear(),
    chi_so_dien_moi: '',
    chi_so_nuoc_moi: '',
    don_gia_dien: 3500,
    don_gia_nuoc: 20000,
    ghi_chu: ''
  });

  useEffect(() => {
    layDanhSachDienNuoc();
    layDanhSachPhong();
  }, []);

  useEffect(() => {
    if (selectedPhong) {
      layChiSoCu(selectedPhong);
    }
  }, [selectedPhong]);

  const layDanhSachDienNuoc = async () => {
    try {
      const response = await api.get('/dien-nuoc');
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setDienNuoc(data);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách điện nước:', error);
      toast.error('Không thể tải danh sách điện nước');
      setDienNuoc([]);
      setLoading(false);
    }
  };

  const layDanhSachPhong = async () => {
    try {
      const response = await api.get('/phong');
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setPhongList(data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phòng:', error);
      setPhongList([]);
    }
  };

  const layChiSoCu = async (maPhong) => {
    try {
      const response = await api.get(`/dien-nuoc/phong/${maPhong}/chi-so-cuoi`);
      // The API returns { message, data: { chi_so_dien_cu, chi_so_nuoc_cu } }
      // Normalize to the inner data object so consumers can use chiSoCu.chi_so_dien_cu
      setChiSoCu(response.data?.data || response.data || null);
    } catch (error) {
      console.error('Lỗi khi lấy chỉ số cũ:', error);
      setChiSoCu(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Coerce number inputs to numbers to avoid string arithmetic causing NaN
    const parsedValue = e.target.type === 'number' && value !== '' ? Number(value) : value;
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
    
    if (name === 'ma_phong') {
      setSelectedPhong(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Backend expects field names: id_phong, gia_dien, gia_nuoc
      const payload = {
        id_phong: formData.ma_phong,
        thang: formData.thang,
        nam: formData.nam,
        chi_so_dien_moi: formData.chi_so_dien_moi,
        chi_so_nuoc_moi: formData.chi_so_nuoc_moi,
        gia_dien: formData.don_gia_dien,
        gia_nuoc: formData.don_gia_nuoc,
        ghi_chu: formData.ghi_chu
      };

      if (editingId) {
        // Update existing record
        await api.put(`/dien-nuoc/${editingId}`, payload);
        toast.success('Cập nhật chỉ số điện nước thành công!');
      } else {
        // Create new record
        await api.post('/dien-nuoc', payload);
        toast.success('Thêm chỉ số điện nước thành công!');
      }
      
      setShowModal(false);
      resetForm();
      layDanhSachDienNuoc();
    } catch (error) {
      console.error('Lỗi khi thêm chỉ số:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const resetForm = () => {
    setFormData({
      ma_phong: '',
      thang: new Date().getMonth() + 1,
      nam: new Date().getFullYear(),
      chi_so_dien_moi: '',
      chi_so_nuoc_moi: '',
      don_gia_dien: 3500,
      don_gia_nuoc: 20000,
      ghi_chu: ''
    });
    setSelectedPhong('');
    setChiSoCu(null);
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setEditingId(item.id_dien_nuoc);
    setFormData({
      ma_phong: item.id_phong,
      thang: item.thang,
      nam: item.nam,
      chi_so_dien_moi: item.chi_so_dien_moi,
      chi_so_nuoc_moi: item.chi_so_nuoc_moi,
      don_gia_dien: item.gia_dien,
      don_gia_nuoc: item.gia_nuoc,
      ghi_chu: item.ghi_chu || ''
    });
    setSelectedPhong(item.id_phong);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) {
      try {
        await api.delete(`/dien-nuoc/${id}`);
        toast.success('Xóa bản ghi thành công!');
        layDanhSachDienNuoc();
      } catch (error) {
        console.error('Lỗi khi xóa:', error);
        toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
      }
    }
  };

  const tinhTienDien = () => {
    if (!formData.chi_so_dien_moi || !chiSoCu) return 0;
    const tieuThu = formData.chi_so_dien_moi - chiSoCu.chi_so_dien_cu;
    return tieuThu * formData.don_gia_dien;
  };

  const tinhTienNuoc = () => {
    if (!formData.chi_so_nuoc_moi || !chiSoCu) return 0;
    const tieuThu = formData.chi_so_nuoc_moi - chiSoCu.chi_so_nuoc_cu;
    return tieuThu * formData.don_gia_nuoc;
  };

  const groupedDienNuoc = dienNuoc.reduce((acc, item) => {
    const key = item.id_phong;
    if (!acc[key]) {
      acc[key] = {
        phong: item,
        records: []
      };
    }
    acc[key].records.push(item);
    return acc;
  }, {});

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="quan-ly-dien-nuoc">
      <div className="page-header">
        <div>
          <h1><FaBolt /> Quản lý điện nước</h1>
          <p>Nhập và theo dõi chỉ số điện nước</p>
        </div>
        <button className="btn-add" onClick={() => setShowModal(true)}>
          <FaPlus /> Nhập chỉ số mới
        </button>
      </div>

      <div className="dien-nuoc-sections">
        {Object.keys(groupedDienNuoc).map((idPhong) => {
          const { phong, records } = groupedDienNuoc[idPhong];
          const lichSu = records.sort((a, b) => {
            if (b.nam !== a.nam) return b.nam - a.nam;
            return b.thang - a.thang;
          });
          
          const moiNhat = lichSu[0];
          
          return (
            <div key={idPhong} className="phong-section">
              <div className="phong-header">
                <h2><FaHome /> {phong.ten_phong || `Phòng ${idPhong}`}</h2>
                <span className="record-count">
                  <FaHistory /> {lichSu.length} bản ghi
                </span>
              </div>

              <div className="current-reading">
                <div className="reading-card electric">
                  <div className="icon-wrapper">
                    <FaBolt />
                  </div>
                  <div className="reading-info">
                    <span className="label">Điện (tháng {moiNhat.thang}/{moiNhat.nam})</span>
                    <span className="value">{moiNhat.chi_so_dien_cu} → {moiNhat.chi_so_dien_moi} kWh</span>
                    <span className="consumption">Tiêu thụ: {moiNhat.so_dien_tieu_thu} kWh</span>
                    <span className="cost">{Number(moiNhat.tien_dien).toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>

                <div className="reading-card water">
                  <div className="icon-wrapper">
                    <FaTint />
                  </div>
                  <div className="reading-info">
                    <span className="label">Nước (tháng {moiNhat.thang}/{moiNhat.nam})</span>
                    <span className="value">{moiNhat.chi_so_nuoc_cu} → {moiNhat.chi_so_nuoc_moi} m³</span>
                    <span className="consumption">Tiêu thụ: {moiNhat.so_nuoc_tieu_thu} m³</span>
                    <span className="cost">{Number(moiNhat.tien_nuoc).toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>
              </div>

              <div className="history-table">
                <h3><FaHistory /> Lịch sử</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Kỳ</th>
                      <th>Điện cũ</th>
                      <th>Điện mới</th>
                      <th>Tiêu thụ</th>
                      <th>Tiền điện</th>
                      <th>Nước cũ</th>
                      <th>Nước mới</th>
                      <th>Tiêu thụ</th>
                      <th>Tiền nước</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lichSu.map((item) => (
                      <tr key={item.id_dien_nuoc}>
                        <td className="ky">{item.thang}/{item.nam}</td>
                        <td>{item.chi_so_dien_cu}</td>
                        <td>{item.chi_so_dien_moi}</td>
                        <td className="consumption">{item.so_dien_tieu_thu} kWh</td>
                        <td className="money">{Number(item.tien_dien).toLocaleString('vi-VN')} đ</td>
                        <td>{item.chi_so_nuoc_cu}</td>
                        <td>{item.chi_so_nuoc_moi}</td>
                        <td className="consumption">{item.so_nuoc_tieu_thu} m³</td>
                        <td className="money">{Number(item.tien_nuoc).toLocaleString('vi-VN')} đ</td>
                        <td className="actions">
                          <button 
                            className="btn-edit" 
                            onClick={() => handleEdit(item)}
                            title="Chỉnh sửa"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="btn-delete" 
                            onClick={() => handleDelete(item.id_dien_nuoc)}
                            title="Xóa"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {Object.keys(groupedDienNuoc).length === 0 && (
          <div className="no-data">
            <FaBolt size={48} />
            <p>Chưa có dữ liệu điện nước</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Chỉnh sửa chỉ số điện nước' : 'Nhập chỉ số điện nước'}</h2>
              <button className="btn-close" onClick={() => { setShowModal(false); resetForm(); }}>
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-content">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Phòng <span className="required">*</span></label>
                    <select 
                      name="ma_phong" 
                      value={formData.ma_phong} 
                      onChange={handleInputChange} 
                      required
                      disabled={editingId !== null}
                    >
                      <option value="">Chọn phòng</option>
                      {phongList.map(phong => (
                        <option key={phong.id_phong} value={phong.id_phong}>
                          {phong.ten_phong}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Tháng <span className="required">*</span></label>
                    <select name="thang" value={formData.thang} onChange={handleInputChange} required>
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Năm <span className="required">*</span></label>
                    <select name="nam" value={formData.nam} onChange={handleInputChange} required>
                      {[2024, 2025, 2026].map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {chiSoCu && (
                  <div className="chi-so-cu-section">
                    <h3><FaHistory /> Chỉ số kỳ trước (Tháng {chiSoCu.thang}/{chiSoCu.nam})</h3>
                    <div className="chi-so-cu-grid">
                      <div className="chi-so-item electric">
                        <FaBolt />
                        <span className="label">Điện:</span>
                        <span className="value">{chiSoCu.chi_so_dien_cu} kWh</span>
                      </div>
                      <div className="chi-so-item water">
                        <FaTint />
                        <span className="label">Nước:</span>
                        <span className="value">{chiSoCu.chi_so_nuoc_cu} m³</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-grid">
                  <div className="form-group">
                    <label><FaBolt /> Chỉ số điện mới <span className="required">*</span></label>
                    <input
                      type="number"
                      name="chi_so_dien_moi"
                      value={formData.chi_so_dien_moi}
                      onChange={handleInputChange}
                      required
                      min={chiSoCu ? chiSoCu.chi_so_dien_cu : 0}
                    />
                  </div>

                  <div className="form-group">
                    <label><FaTint /> Chỉ số nước mới <span className="required">*</span></label>
                    <input
                      type="number"
                      name="chi_so_nuoc_moi"
                      value={formData.chi_so_nuoc_moi}
                      onChange={handleInputChange}
                      required
                      min={chiSoCu ? chiSoCu.chi_so_nuoc_cu : 0}
                    />
                  </div>

                  <div className="form-group">
                    <label>Đơn giá điện (đ/kWh)</label>
                    <input
                      type="number"
                      name="don_gia_dien"
                      value={formData.don_gia_dien}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Đơn giá nước (đ/m³)</label>
                    <input
                      type="number"
                      name="don_gia_nuoc"
                      value={formData.don_gia_nuoc}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {formData.chi_so_dien_moi && formData.chi_so_nuoc_moi && chiSoCu && (
                  <div className="preview-section">
                    <h3><FaCalculator /> Tính toán tự động</h3>
                    <div className="preview-grid">
                      <div className="preview-item electric">
                        <FaBolt />
                        <div>
                          <span className="label">Tiêu thụ điện:</span>
                          <span className="value">{formData.chi_so_dien_moi - chiSoCu.chi_so_dien_cu} kWh</span>
                          <span className="cost">{tinhTienDien().toLocaleString('vi-VN')} đ</span>
                        </div>
                      </div>
                      <div className="preview-item water">
                        <FaTint />
                        <div>
                          <span className="label">Tiêu thụ nước:</span>
                          <span className="value">{formData.chi_so_nuoc_moi - chiSoCu.chi_so_nuoc_cu} m³</span>
                          <span className="cost">{tinhTienNuoc().toLocaleString('vi-VN')} đ</span>
                        </div>
                      </div>
                    </div>
                    <div className="total-preview">
                      Tổng tiền: <strong>{(tinhTienDien() + tinhTienNuoc()).toLocaleString('vi-VN')} đ</strong>
                    </div>
                  </div>
                )}

                <div className="form-group full-width">
                  <label>Ghi chú</label>
                  <textarea
                    name="ghi_chu"
                    value={formData.ghi_chu}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => { setShowModal(false); resetForm(); }}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  Lưu chỉ số
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuanLyDienNuoc;
