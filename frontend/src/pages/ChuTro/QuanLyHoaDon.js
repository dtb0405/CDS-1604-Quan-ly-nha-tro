import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FaFileInvoice, FaPlus, FaEye, FaFilter, FaMagic, FaCalendar, FaMoneyBillWave, FaCheckCircle, FaClock, FaEdit, FaTrash } from 'react-icons/fa';
import './QuanLyHoaDon.css';

const QuanLyHoaDon = () => {
  const [hoaDon, setHoaDon] = useState([]);
  const [phongList, setPhongList] = useState([]);
  const [allTenants, setAllTenants] = useState([]);
  const [tenantsForRoom, setTenantsForRoom] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedHoaDon, setSelectedHoaDon] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ id: null, trang_thai: 'chua_thanh_toan', ghi_chu: '' });
  
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterTrangThai, setFilterTrangThai] = useState('all');
  
  const [formData, setFormData] = useState({
    id_phong: '',
    id_khach_thue: '',
    thang: new Date().getMonth() + 1,
    nam: new Date().getFullYear(),
    han_thanh_toan: '',
    ghi_chu: ''
  });

  useEffect(() => {
    const init = async () => {
      await Promise.all([
        layDanhSachHoaDon(),
        layDanhSachPhong(),
        layDanhSachKhachThue()
      ]);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const layDanhSachHoaDon = async () => {
    try {
      const response = await api.get('/hoa-don');
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setHoaDon(data);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách hóa đơn:', error);
      toast.error('Không thể tải danh sách hóa đơn');
      setHoaDon([]);
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
    }
  };

  const layDanhSachKhachThue = async () => {
    try {
      const response = await api.get('/khach-thue');
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setAllTenants(data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách khách thuê:', error);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
    if (name === 'id_phong') {
      const tenants = allTenants.filter(t => t.id_phong === Number(value) && t.trang_thai === 'dang_thue');
      setTenantsForRoom(tenants);
      if (tenants.length === 1) {
        setEditForm(prev => ({ ...prev, id_khach_thue: String(tenants[0].id_khach_thue) }));
      } else {
        setEditForm(prev => ({ ...prev, id_khach_thue: '' }));
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'id_phong') {
      const tenants = allTenants.filter(t => t.id_phong === Number(value) && t.trang_thai === 'dang_thue');
      setTenantsForRoom(tenants);
      // Auto-select tenant if only one exists for this room
      if (tenants.length === 1) {
        setFormData(prev => ({ ...prev, id_khach_thue: String(tenants[0].id_khach_thue) }));
      } else {
        setFormData(prev => ({ ...prev, id_khach_thue: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!formData.id_phong) {
        toast.error('Vui lòng chọn phòng');
        return;
      }
      if (!formData.id_khach_thue) {
        toast.error('Vui lòng chọn khách thuê');
        return;
      }

      const payload = {
        id_phong: Number(formData.id_phong),
        id_khach_thue: Number(formData.id_khach_thue),
        thang: Number(formData.thang),
        nam: Number(formData.nam),
        han_thanh_toan: formData.han_thanh_toan || null,
        ghi_chu: formData.ghi_chu || ''
      };

      await api.post('/hoa-don', payload);
      toast.success('Tạo hóa đơn thành công!');
      setShowModal(false);
      resetForm();
      layDanhSachHoaDon();
    } catch (error) {
      console.error('Lỗi khi tạo hóa đơn:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const taoHoaDonTuDong = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn tạo hóa đơn tự động cho tất cả các phòng đang thuê?')) {
      return;
    }

    try {
      const response = await api.post('/hoa-don/tu-dong', {
        thang: new Date().getMonth() + 1,
        nam: new Date().getFullYear()
      });
      const soLuong = response.data?.created ?? response.data?.soLuong ?? 0;
      toast.success(`Đã tạo ${soLuong} hóa đơn tự động!`);
      layDanhSachHoaDon();
    } catch (error) {
      console.error('Lỗi khi tạo hóa đơn tự động:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const xemChiTiet = async (id) => {
    try {
      const response = await api.get(`/hoa-don/${id}`);
      const hoaDon = response.data?.data || response.data;
      setSelectedHoaDon(hoaDon);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết hóa đơn:', error);
      toast.error('Không thể tải chi tiết hóa đơn');
    }
  };

  const moSuaHoaDon = (hd) => {
    const roomId = hd.id_phong;
    const tenants = allTenants.filter(t => t.id_phong === Number(roomId) && t.trang_thai === 'dang_thue');
    setTenantsForRoom(tenants);
    setEditForm({
      id: hd.id_hoa_don || hd.id,
      id_phong: String(hd.id_phong || ''),
      id_khach_thue: String(hd.id_khach_thue || ''),
      thang: hd.thang,
      nam: hd.nam,
      han_thanh_toan: hd.han_thanh_toan ? hd.han_thanh_toan.substring(0, 10) : '',
      trang_thai: hd.trang_thai || 'chua_thanh_toan',
      ghi_chu: hd.ghi_chu || ''
    });
    setShowEditModal(true);
  };

  const luuSuaHoaDon = async (e) => {
    e?.preventDefault?.();
    if (!editForm.id) return;
    try {
      const payload = {
        id_phong: Number(editForm.id_phong),
        id_khach_thue: Number(editForm.id_khach_thue),
        thang: Number(editForm.thang),
        nam: Number(editForm.nam),
        han_thanh_toan: editForm.han_thanh_toan || null,
        trang_thai: editForm.trang_thai,
        ghi_chu: editForm.ghi_chu
      };
      await api.put(`/hoa-don/${editForm.id}`, payload);
      toast.success('Cập nhật hóa đơn thành công');
      setShowEditModal(false);
      layDanhSachHoaDon();
    } catch (error) {
      console.error('Lỗi cập nhật hóa đơn:', error);
      toast.error(error.response?.data?.message || 'Không thể cập nhật hóa đơn');
    }
  };

  const xoaHoaDon = async (id) => {
    if (!id) return;
    if (!window.confirm('Bạn có chắc muốn xóa hóa đơn này?')) return;
    try {
      await api.delete(`/hoa-don/${id}`);
      toast.success('Xóa hóa đơn thành công');
      layDanhSachHoaDon();
    } catch (error) {
      console.error('Lỗi xóa hóa đơn:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa hóa đơn');
    }
  };

  const resetForm = () => {
    setFormData({
      id_phong: '',
      id_khach_thue: '',
      thang: new Date().getMonth() + 1,
      nam: new Date().getFullYear(),
      han_thanh_toan: '',
      ghi_chu: ''
    });
    setTenantsForRoom([]);
  };

  const getTrangThaiClass = (trangThai) => {
    switch (trangThai) {
      case 'da_thanh_toan':
        return 'status-paid';
      case 'chua_thanh_toan':
        return 'status-unpaid';
      case 'qua_han':
        return 'status-overdue';
      default:
        return '';
    }
  };

  const getTrangThaiText = (trangThai) => {
    switch (trangThai) {
      case 'da_thanh_toan':
        return 'Đã thanh toán';
      case 'chua_thanh_toan':
        return 'Chưa thanh toán';
      case 'qua_han':
        return 'Quá hạn';
      default:
        return trangThai;
    }
  };

  const getTrangThaiIcon = (trangThai) => {
    switch (trangThai) {
      case 'da_thanh_toan':
        return <FaCheckCircle />;
      case 'chua_thanh_toan':
        return <FaClock />;
      case 'qua_han':
        return <FaClock />;
      default:
        return <FaClock />;
    }
  };

  const filteredHoaDon = hoaDon.filter(hd => {
    const matchMonth = !filterMonth || hd.thang === parseInt(filterMonth);
    const matchYear = !filterYear || hd.nam === parseInt(filterYear);
    const matchTrangThai = filterTrangThai === 'all' || hd.trang_thai === filterTrangThai;
    return matchMonth && matchYear && matchTrangThai;
  });

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="quan-ly-hoa-don">
      <div className="page-header">
        <div>
          <h1><FaFileInvoice /> Quản lý hóa đơn</h1>
          <p>Tạo và quản lý hóa đơn điện nước</p>
        </div>
        <div className="header-actions">
          <button className="btn-auto" onClick={taoHoaDonTuDong}>
            <FaMagic /> Tạo hóa đơn tự động
          </button>
          <button className="btn-add" onClick={() => setShowModal(true)}>
            <FaPlus /> Tạo hóa đơn
          </button>
        </div>
      </div>

      <div className="filters">
        <div className="filter-group">
          <FaFilter />
          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
            <option value="">Tất cả tháng</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <FaCalendar />
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
            {[2024, 2025, 2026].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <select value={filterTrangThai} onChange={(e) => setFilterTrangThai(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="chua_thanh_toan">Chưa thanh toán</option>
            <option value="da_thanh_toan">Đã thanh toán</option>
            <option value="qua_han">Quá hạn</option>
          </select>
        </div>
      </div>

      <div className="hoa-don-grid">
        {filteredHoaDon.map((hd) => (
          <div className="hoa-don-card">
            <div className="card-header">
              <div className="card-title">
                <FaFileInvoice className="icon" />
                <span>Hóa đơn {hd.ten_phong || `#${hd.id_phong}`}</span>
              </div>
              <span className={`status-badge ${getTrangThaiClass(hd.trang_thai)}`}>
                {getTrangThaiIcon(hd.trang_thai)}
                {getTrangThaiText(hd.trang_thai)}
              </span>
            </div>
            
            <div className="card-body">
              <div className="info-row">
                <span className="label"><FaCalendar /> Kỳ:</span>
                <span className="value">Tháng {hd.thang}/{hd.nam}</span>
              </div>
              <div className="info-row">
                <span className="label"><FaMoneyBillWave /> Tiền phòng:</span>
                <span className="value">{Number(hd.tien_phong || 0).toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="info-row">
                <span className="label">⚡ Tiền điện:</span>
                <span className="value">{Number(hd.tien_dien || 0).toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="info-row">
                <span className="label">💧 Tiền nước:</span>
                <span className="value">{Number(hd.tien_nuoc || 0).toLocaleString('vi-VN')} đ</span>
              </div>
              {hd.tien_dich_vu > 0 && (
                <div className="info-row">
                  <span className="label">🔧 Tiền dịch vụ:</span>
                  <span className="value">{Number(hd.tien_dich_vu || 0).toLocaleString('vi-VN')} đ</span>
                </div>
              )}
              <div className="total-row">
                <span className="label">Tổng cộng:</span>
                <span className="value total">{Number(hd.tong_tien || 0).toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
            
            <div className="card-footer">
              <button className="btn-view" onClick={() => xemChiTiet(hd.id_hoa_don || hd.id)}>
                <FaEye /> Xem chi tiết
              </button>
              <button className="btn-edit" onClick={() => moSuaHoaDon(hd)}>
                <FaEdit /> Sửa
              </button>
              <button className="btn-delete" onClick={() => xoaHoaDon(hd.id_hoa_don || hd.id)}>
                <FaTrash /> Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredHoaDon.length === 0 && (
        <div className="no-data">
          <FaFileInvoice size={48} />
          <p>Không có hóa đơn nào</p>
        </div>
      )}

      {/* Modal tạo hóa đơn */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Tạo hóa đơn mới</h2>
              <button className="btn-close" onClick={() => { setShowModal(false); resetForm(); }}>
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Phòng <span className="required">*</span></label>
                  <select name="id_phong" value={formData.id_phong} onChange={handleInputChange} required>
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

                <div className="form-group">
                  <label>Khách thuê <span className="required">*</span></label>
                  <select name="id_khach_thue" value={formData.id_khach_thue} onChange={handleInputChange} required disabled={!formData.id_phong}>
                    <option value="">{formData.id_phong ? 'Chọn khách thuê' : 'Chọn phòng trước'}</option>
                    {tenantsForRoom.map(kt => (
                      <option key={kt.id_khach_thue} value={kt.id_khach_thue}>
                        {kt.ho_ten} ({kt.email || kt.so_dien_thoai || 'N/A'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Hạn thanh toán</label>
                  <input type="date" name="han_thanh_toan" value={formData.han_thanh_toan} onChange={handleInputChange} />
                </div>

                <div className="form-group full-width">
                  <label>Ghi chú</label>
                  <textarea name="ghi_chu" value={formData.ghi_chu} onChange={handleInputChange} rows="3" />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => { setShowModal(false); resetForm(); }}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  Tạo hóa đơn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal sửa hóa đơn */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Sửa hóa đơn</h2>
              <button className="btn-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={luuSuaHoaDon}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Phòng</label>
                  <select name="id_phong" value={editForm.id_phong || ''} onChange={handleEditChange} required>
                    <option value="">Chọn phòng</option>
                    {phongList.map(phong => (
                      <option key={phong.id_phong} value={phong.id_phong}>{phong.ten_phong}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Khách thuê</label>
                  <select name="id_khach_thue" value={editForm.id_khach_thue || ''} onChange={handleEditChange} required>
                    <option value="">Chọn khách thuê</option>
                    {tenantsForRoom.map(kt => (
                      <option key={kt.id_khach_thue} value={kt.id_khach_thue}>{kt.ho_ten}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tháng</label>
                  <select name="thang" value={editForm.thang} onChange={handleEditChange} required>
                    {[...Array(12)].map((_, i) => (
                      <option key={i+1} value={i+1}>Tháng {i+1}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Năm</label>
                  <select name="nam" value={editForm.nam} onChange={handleEditChange} required>
                    {[2024, 2025, 2026].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Hạn thanh toán</label>
                  <input type="date" name="han_thanh_toan" value={editForm.han_thanh_toan || ''} onChange={handleEditChange} />
                </div>
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select name="trang_thai" value={editForm.trang_thai} onChange={handleEditChange}>
                    <option value="chua_thanh_toan">Chưa thanh toán</option>
                    <option value="da_thanh_toan">Đã thanh toán</option>
                    <option value="qua_han">Quá hạn</option>
                  </select>
                </div>
                <div className="form-group" style={{gridColumn: '1 / -1'}}>
                  <label>Ghi chú</label>
                  <textarea name="ghi_chu" rows={3} value={editForm.ghi_chu} onChange={handleEditChange} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary">Lưu</button>
              </div>
              <p style={{marginTop:8, color:'#6b7280'}}>Lưu ý: Tiền phòng, điện, nước, dịch vụ và tổng tiền sẽ được tính lại tự động theo phòng, khách thuê và kỳ đã chọn.</p>
            </form>
          </div>
        </div>
      )}

      {/* Modal chi tiết hóa đơn */}
      {showDetailModal && selectedHoaDon && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết hóa đơn</h2>
              <button className="btn-close" onClick={() => setShowDetailModal(false)}>×</button>
            </div>
            
            <div className="detail-content">
              <div className="detail-section">
                <h3>Thông tin chung</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Phòng:</span>
                    <span className="value">{selectedHoaDon.ten_phong || (selectedHoaDon.id_phong ? `Phòng ${selectedHoaDon.id_phong}` : 'Không xác định')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Kỳ hóa đơn:</span>
                    <span className="value">Tháng {selectedHoaDon.thang}/{selectedHoaDon.nam}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Trạng thái:</span>
                    <span className={`status-badge ${getTrangThaiClass(selectedHoaDon.trang_thai)}`}>
                      {getTrangThaiText(selectedHoaDon.trang_thai)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Ngày tạo:</span>
                    <span className="value">{new Date(selectedHoaDon.ngay_tao).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Chi tiết chi phí</h3>
                <div className="cost-breakdown">
                  <div className="cost-item">
                    <span>Tiền phòng</span>
                    <span>{Number(selectedHoaDon.tien_phong || 0).toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="cost-item">
                    <span>Tiền điện</span>
                    <span>{Number(selectedHoaDon.tien_dien || 0).toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="cost-item">
                    <span>Tiền nước</span>
                    <span>{Number(selectedHoaDon.tien_nuoc || 0).toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="cost-item">
                    <span>Tiền dịch vụ</span>
                    <span>{Number(selectedHoaDon.tien_dich_vu || 0).toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="cost-item total">
                    <span>Tổng cộng</span>
                    <span>{Number(selectedHoaDon.tong_tien || 0).toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>
              </div>

              {selectedHoaDon.ghi_chu && (
                <div className="detail-section">
                  <h3>Ghi chú</h3>
                  <p className="note">{selectedHoaDon.ghi_chu}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuanLyHoaDon;
