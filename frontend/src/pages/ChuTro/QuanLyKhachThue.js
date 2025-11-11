import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FaUser, FaIdCard, FaPhone, FaHome, FaCalendar, FaEdit, FaTrash, FaPlus, FaTimes, FaSearch } from 'react-icons/fa';
import './QuanLyKhachThue.css';

const QuanLyKhachThue = () => {
  const [khachThue, setKhachThue] = useState([]);
  const [phongList, setPhongList] = useState([]);
  const [nguoiDungList, setNguoiDungList] = useState([]);
  const [searchNguoiDung, setSearchNguoiDung] = useState('');
  const [showNguoiDungDropdown, setShowNguoiDungDropdown] = useState(false);
  const [selectedNguoiDung, setSelectedNguoiDung] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingKhach, setEditingKhach] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTrangThai, setFilterTrangThai] = useState('all');
  
  const [formData, setFormData] = useState({
    id_nguoi_dung: '',
    id_phong: '',
    cmnd_cccd: '',
    ngay_sinh: '',
    gioi_tinh: '',
    nghe_nghiep: '',
    so_nguoi_o: 1,
    ngay_vao: '',
    ghi_chu: '',
    tien_coc: '',
    gia_thue: '',
    tien_dich_vu: '',
    tien_dich_vu_nguoi: ''
  });
  
  const [selectedPhongInfo, setSelectedPhongInfo] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailKhach, setDetailKhach] = useState(null);

  useEffect(() => {
    layDanhSachKhachThue();
    layDanhSachPhong();
  }, []);

  const layDanhSachKhachThue = async () => {
    try {
      const response = await api.get('/khach-thue');
      // Đảm bảo luôn set array, ngay cả khi response trả về object
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setKhachThue(data);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách khách thuê:', error);
      toast.error('Không thể tải danh sách khách thuê');
      setKhachThue([]); // Set empty array on error
      setLoading(false);
    }
  };

  const layDanhSachPhong = async () => {
    try {
      const response = await api.get('/phong');
      // Đảm bảo luôn set array
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setPhongList(data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phòng:', error);
      setPhongList([]); // Set empty array on error
    }
  };

  const timKiemNguoiDung = async (search) => {
    if (!search || search.trim().length < 2) {
      setNguoiDungList([]);
      return;
    }
    
    try {
      console.log('🔍 Tìm kiếm người dùng:', search);
      const response = await api.get(`/nguoi-dung/tim-kiem?search=${encodeURIComponent(search)}`);
      console.log('📡 Response:', response.data);
      
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      console.log('✅ Processed data:', data);
      
      setNguoiDungList(data);
      setShowNguoiDungDropdown(true);
      
      if (data.length === 0) {
        toast.info('Không tìm thấy người dùng phù hợp');
      }
    } catch (error) {
      console.error('❌ Lỗi tìm kiếm người dùng:', error);
      toast.error('Lỗi khi tìm kiếm người dùng: ' + (error.response?.data?.message || error.message));
      setNguoiDungList([]);
    }
  };

  const chonNguoiDung = (nguoiDung) => {
    setSelectedNguoiDung(nguoiDung);
    setSearchNguoiDung(`${nguoiDung.ho_ten} - ${nguoiDung.email}`);
    setFormData(prev => ({
      ...prev,
      id_nguoi_dung: nguoiDung.id_nguoi_dung
    }));
    setShowNguoiDungDropdown(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Xử lý số tiền để tránh lỗi làm tròn
    if (name.includes('tien') || name.includes('gia')) {
      // Chỉ chấp nhận số nguyên, không có dấu thập phân
      processedValue = value.replace(/[^\d]/g, '');
      // Đảm bảo không có leading zeros trừ khi value là "0"
      if (processedValue.length > 1 && processedValue.startsWith('0')) {
        processedValue = processedValue.replace(/^0+/, '');
      }
      if (processedValue === '') processedValue = '';
    }
    
    // Nếu thay đổi phòng, load thông tin phòng và tự động điền thông tin
    if (name === 'id_phong' && value) {
      const phong = phongList.find(p => p.id_phong === parseInt(value));
      if (phong) {
        setSelectedPhongInfo(phong);
        setFormData(prev => ({
          ...prev,
          [name]: processedValue,
          // Tự động điền thông tin phòng
          gia_thue: phong.gia_thue || '',
          tien_coc: phong.tien_coc || '',
          tien_dich_vu: phong.tien_dich_vu || '',
          tien_dich_vu_nguoi: phong.tien_dich_vu_nguoi || ''
        }));
        return;
      } else {
        setSelectedPhongInfo(null);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Cập nhật lại thông tin phòng nếu thay đổi số người ở
    if (name === 'so_nguoi_o' && selectedPhongInfo) {
      setSelectedPhongInfo(prev => ({ ...prev }));
    }
  };

  const huyChonNguoiDung = () => {
    setSelectedNguoiDung(null);
    setSearchNguoiDung('');
    setFormData(prev => ({ ...prev, id_nguoi_dung: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate: Phải chọn người dùng khi thêm mới
    if (!editingKhach && !formData.id_nguoi_dung) {
      toast.error('Vui lòng tìm và chọn tài khoản người dùng!');
      return;
    }
    
    // Validate CMND/CCCD
    if (!formData.cmnd_cccd || formData.cmnd_cccd.trim() === '') {
      toast.error('Vui lòng nhập CMND/CCCD!');
      return;
    }
    
    console.log('📤 Dữ liệu gửi đi:', formData);
    
    try {
      if (editingKhach) {
        await api.put(`/khach-thue/${editingKhach.id_khach_thue}`, formData);
        toast.success('Cập nhật khách thuê thành công!');
      } else {
        const response = await api.post('/khach-thue', formData);
        console.log('✅ Response:', response.data);
        toast.success('Thêm khách thuê thành công!');
      }
      
      setShowModal(false);
      resetForm();
      layDanhSachKhachThue();
    } catch (error) {
      console.error('❌ Lỗi khi lưu khách thuê:', error);
      console.error('❌ Error response:', error.response?.data);
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (khach) => {
    setEditingKhach(khach);
    
    // Điền thông tin cũ vào form
    setFormData({
      id_nguoi_dung: khach.id_nguoi_dung || '',
      id_phong: khach.id_phong || '',
      cmnd_cccd: khach.cmnd_cccd || '',
      ngay_sinh: khach.ngay_sinh?.split('T')[0] || '',
      gioi_tinh: khach.gioi_tinh || '',
      nghe_nghiep: khach.nghe_nghiep || '',
      so_nguoi_o: khach.so_nguoi_o || 1,
      ngay_vao: khach.ngay_vao?.split('T')[0] || '',
      ghi_chu: khach.ghi_chu || '',
      tien_coc: khach.tien_coc || '',
      gia_thue: khach.gia_thue || '',
      tien_dich_vu: khach.tien_dich_vu || '',
      tien_dich_vu_nguoi: khach.tien_dich_vu_nguoi || ''
    });
    
    // Load thông tin phòng nếu có
    if (khach.id_phong) {
      const phong = phongList.find(p => p.id_phong === khach.id_phong);
      if (phong) {
        setSelectedPhongInfo(phong);
      }
    }
    
    // Load thông tin người dùng nếu có
    if (khach.id_nguoi_dung) {
      // Tìm thông tin người dùng từ danh sách
      let nguoiDung = nguoiDungList.find(nd => nd.id_nguoi_dung === khach.id_nguoi_dung);
      
      // Nếu không tìm thấy trong danh sách, tạo object từ thông tin khách thuê
      if (!nguoiDung && khach.ho_ten) {
        nguoiDung = {
          id_nguoi_dung: khach.id_nguoi_dung,
          ho_ten: khach.ho_ten,
          email: khach.email || '',
          so_dien_thoai: khach.so_dien_thoai || '',
          dia_chi: khach.dia_chi || ''
        };
      }
      
      if (nguoiDung) {
        setSelectedNguoiDung(nguoiDung);
        setSearchNguoiDung(`${nguoiDung.ho_ten} - ${nguoiDung.email}`);
      }
    }
    
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khách thuê này?')) {
      try {
        await api.delete(`/khach-thue/${id}`);
        toast.success('Xóa khách thuê thành công!');
        layDanhSachKhachThue();
      } catch (error) {
        console.error('Lỗi khi xóa khách thuê:', error);
        toast.error('Không thể xóa khách thuê');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      id_nguoi_dung: '',
      id_phong: '',
      cmnd_cccd: '',
      ngay_sinh: '',
      gioi_tinh: '',
      nghe_nghiep: '',
      so_nguoi_o: 1,
      ngay_vao: '',
      ghi_chu: '',
      tien_coc: '',
      gia_thue: '',
      tien_dich_vu: '',
      tien_dich_vu_nguoi: ''
    });
    setEditingKhach(null);
    setSelectedNguoiDung(null);
    setSearchNguoiDung('');
    setSelectedPhongInfo(null);
    setSelectedNguoiDung(null);
    setSearchNguoiDung('');
    setNguoiDungList([]);
    setShowNguoiDungDropdown(false);
  };

  const getTrangThaiText = (khach) => {
    if (!khach.ngay_ra) return 'Đang thuê';
    const ngayRa = new Date(khach.ngay_ra);
    const now = new Date();
    return ngayRa > now ? 'Đang thuê' : 'Đã trả phòng';
  };

  const getTrangThaiClass = (khach) => {
    const trangThai = getTrangThaiText(khach);
    return trangThai === 'Đang thuê' ? 'status-active' : 'status-inactive';
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount || 0);
    return num.toLocaleString('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const handleViewDetail = async (khach) => {
    try {
      // Load thông tin đầy đủ từ API
      const response = await api.get(`/khach-thue/${khach.id_khach_thue || khach.id}`);
      const fullData = response.data.data || response.data;
      
      // Merge với thông tin phòng nếu có
      if (fullData.id_phong) {
        const phong = phongList.find(p => p.id_phong === fullData.id_phong);
        if (phong) {
          fullData.ten_phong = phong.ten_phong;
          fullData.dien_tich_phong = phong.dien_tich;
          fullData.gia_thue_phong = phong.gia_thue;
          fullData.tien_coc_phong = phong.tien_coc;
          fullData.tien_dich_vu_phong = phong.tien_dich_vu;
          fullData.tien_dich_vu_nguoi_phong = phong.tien_dich_vu_nguoi;
          fullData.dich_vu_bao_gom = phong.dich_vu_bao_gom;
        }
      }
      
      console.log('📋 Dữ liệu chi tiết khách thuê từ API:', fullData);
      console.log('💰 Thông tin tài chính:', {
        gia_thue_hd: fullData.gia_thue_hd,
        gia_thue: fullData.gia_thue,
        gia_thue_phong: fullData.gia_thue_phong,
        tien_coc: fullData.tien_coc,
        tien_coc_phong: fullData.tien_coc_phong,
        tien_dich_vu: fullData.tien_dich_vu,
        tien_dich_vu_phong: fullData.tien_dich_vu_phong,
        tien_dich_vu_nguoi: fullData.tien_dich_vu_nguoi,
        tien_dich_vu_nguoi_phong: fullData.tien_dich_vu_nguoi_phong,
        so_nguoi_o: fullData.so_nguoi_o
      });
      setDetailKhach(fullData);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Lỗi khi load chi tiết khách thuê:', error);
      // Fallback: sử dụng dữ liệu hiện có và merge với thông tin phòng
      const fullData = { ...khach };
      
      if (khach.id_phong) {
        const phong = phongList.find(p => p.id_phong === khach.id_phong);
        if (phong) {
          fullData.ten_phong = phong.ten_phong;
          fullData.dien_tich_phong = phong.dien_tich;
          fullData.gia_thue_phong = phong.gia_thue;
          fullData.tien_coc_phong = phong.tien_coc;
          fullData.tien_dich_vu_phong = phong.tien_dich_vu;
          fullData.tien_dich_vu_nguoi_phong = phong.tien_dich_vu_nguoi;
          fullData.dich_vu_bao_gom = phong.dich_vu_bao_gom;
        }
      }
      
      console.log('📋 Dữ liệu chi tiết khách thuê (fallback):', fullData);
      setDetailKhach(fullData);
      setShowDetailModal(true);
    }
  };

  const xuatExcel = () => {
    try {
      const dataToExport = filteredKhachThue();
      
      // Tạo CSV content
      const headers = ['Tên', 'Số phòng', 'Số điện thoại', 'Số người ở', 'Trạng thái', 'Ngày vào', 'Ngày ra'];
      const rows = dataToExport.map(k => [
        k.ho_ten || 'N/A',
        k.ten_phong || 'N/A',
        k.so_dien_thoai || 'N/A',
        k.so_nguoi_o || 'N/A',
        getTrangThaiText(k),
        k.ngay_vao ? new Date(k.ngay_vao).toLocaleDateString('vi-VN') : 'N/A',
        k.ngay_ra ? new Date(k.ngay_ra).toLocaleDateString('vi-VN') : 'N/A'
      ]);
      
      const csvContent = [headers, ...rows]
        .map(row => row.join(','))
        .join('\n');
      
      // Download file
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `danh-sach-khach-thue-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      toast.success('Xuất file Excel thành công!');
    } catch (error) {
      console.error('Lỗi xuất Excel:', error);
      toast.error('Không thể xuất file Excel');
    }
  };

  const filteredKhachThue = () => {
    return khachThue.filter(k => {
      const matchSearch = !searchTerm || 
        k.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.ten_phong?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.so_dien_thoai?.includes(searchTerm);
      
      const matchStatus = filterTrangThai === 'all' ||
        (filterTrangThai === 'dang_thue' && getTrangThaiText(k) === 'Đang thuê') ||
        (filterTrangThai === 'da_tra' && getTrangThaiText(k) === 'Đã trả phòng');
      
      return matchSearch && matchStatus;
    });
  };

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="quan-ly-khach-thue">
      <div className="page-header">
        <div>
          <h1><FaUser /> Quản lý khách thuê</h1>
          <p>Quản lý thông tin khách thuê và hợp đồng</p>
        </div>
        <div className="header-actions">
          <button className="btn-export" onClick={xuatExcel} title="Xuất file Excel">
            📊 Xuất Excel
          </button>
          <button className="btn-add" onClick={() => setShowModal(true)}>
            <FaPlus /> Thêm khách thuê
          </button>
        </div>
      </div>

      <div className="filters">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Tìm theo tên, SĐT, phòng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          value={filterTrangThai} 
          onChange={(e) => setFilterTrangThai(e.target.value)}
          className="filter-select"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="dang_thue">Đang thuê</option>
          <option value="da_tra">Đã trả phòng</option>
        </select>
      </div>

      <div className="khach-thue-table">
        <table>
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Số phòng</th>
              <th>Số điện thoại</th>
              <th>Số người ở</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredKhachThue().map((khach) => (
              <tr key={khach.id_khach_thue || khach.id}>
                <td>
                  <div className="tenant-info">
                    <FaUser className="icon" />
                    <span>{khach.ho_ten}</span>
                  </div>
                </td>
                <td><FaHome className="icon" /> {khach.ten_phong || 'N/A'}</td>
                <td><FaPhone className="icon" /> {khach.so_dien_thoai || 'N/A'}</td>
                <td className="text-center">{khach.so_nguoi_o || 1} người</td>
                <td>
                  <span className={`status-badge ${getTrangThaiClass(khach)}`}>
                    {getTrangThaiText(khach)}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-view" onClick={() => handleViewDetail(khach)} title="Xem chi tiết">
                      👁️
                    </button>
                    <button className="btn-edit" onClick={() => handleEdit(khach)} title="Sửa">
                      <FaEdit />
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(khach.id_khach_thue || khach.id)} title="Xóa">
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredKhachThue().length === 0 && (
          <div className="no-data">
            <FaUser size={48} />
            <p>Không có khách thuê nào</p>
          </div>
        )}
      </div>

      {/* Modal xem chi tiết */}
      {showDetailModal && detailKhach && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Chi tiết khách thuê</h2>
              <button className="btn-close" onClick={() => setShowDetailModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="detail-content">
              {/* Thông tin cơ bản - COMPACT */}
              <div className="detail-section compact">
                <div className="detail-grid-compact">
                  <div className="detail-item-compact">
                    <span className="label">� Họ tên:</span>
                    <span className="value">{detailKhach.ho_ten}</span>
                  </div>
                  <div className="detail-item-compact">
                    <span className="label">📱 SĐT:</span>
                    <span className="value">{detailKhach.so_dien_thoai || 'N/A'}</span>
                  </div>
                  <div className="detail-item-compact">
                    <span className="label">🆔 CMND:</span>
                    <span className="value">{detailKhach.cmnd_cccd || 'N/A'}</span>
                  </div>
                  <div className="detail-item-compact">
                    <span className="label">🏠 Phòng:</span>
                    <span className="value">{detailKhach.ten_phong || 'Chưa có'}</span>
                  </div>
                  <div className="detail-item-compact">
                    <span className="label">👥 Số người:</span>
                    <span className="value">{detailKhach.so_nguoi_o || 1}</span>
                  </div>
                  <div className="detail-item-compact">
                    <span className="label">📅 Ngày vào:</span>
                    <span className="value">
                      {detailKhach.ngay_vao ? new Date(detailKhach.ngay_vao).toLocaleDateString('vi-VN') : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item-compact">
                    <span className="label">💰 Giá thuê:</span>
                    <span className="value">{formatCurrency(detailKhach.gia_thue_hd || detailKhach.gia_thue || 0)}đ</span>
                  </div>
                  <div className="detail-item-compact">
                    <span className="label">💳 Tiền cọc:</span>
                    <span className="value">{formatCurrency(detailKhach.tien_coc || 0)}đ</span>
                  </div>
                  <div className="detail-item-compact status-item">
                    <span className="label">� Trạng thái:</span>
                    <span className={`status-badge ${getTrangThaiClass(detailKhach)}`}>
                      {getTrangThaiText(detailKhach)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ghi chú */}
              {detailKhach.ghi_chu && (
                <div className="detail-section">
                  <h3>📝 Ghi chú</h3>
                  <div className="note-content">
                    <p>{detailKhach.ghi_chu}</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingKhach ? 'Cập nhật khách thuê' : 'Thêm khách thuê mới'}</h2>
              <button className="btn-close" onClick={() => { setShowModal(false); resetForm(); }}>
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                {/* TÌM KIẾM NGƯỜI DÙNG - Chỉ hiện khi thêm mới */}
                {!editingKhach && (
                  <div className="form-group full-width">
                    <label>Tìm kiếm tài khoản người dùng <span className="required">*</span></label>
                    <div className="user-search-wrapper">
                      <input
                        type="text"
                        placeholder="Nhập tên, email hoặc SĐT để tìm..."
                        value={searchNguoiDung}
                        onChange={(e) => {
                          setSearchNguoiDung(e.target.value);
                          timKiemNguoiDung(e.target.value);
                        }}
                        disabled={!!selectedNguoiDung}
                      />
                      {selectedNguoiDung && (
                        <button 
                          type="button" 
                          className="btn-clear"
                          onClick={huyChonNguoiDung}
                        >
                          <FaTimes /> Hủy chọn
                        </button>
                      )}
                      
                      {/* Dropdown kết quả tìm kiếm */}
                      {showNguoiDungDropdown && nguoiDungList.length > 0 && (
                        <div className="user-dropdown">
                          {nguoiDungList.map(user => (
                            <div 
                              key={user.id_nguoi_dung}
                              className="user-item"
                              onClick={() => chonNguoiDung(user)}
                            >
                              <div className="user-info">
                                <strong>{user.ho_ten}</strong>
                                <span>{user.email}</span>
                                <span>{user.so_dien_thoai}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {selectedNguoiDung && (
                      <div className="selected-user-info">
                        ✅ Đã chọn: <strong>{selectedNguoiDung.ho_ten}</strong> - {selectedNguoiDung.email}
                      </div>
                    )}
                  </div>
                )}

                {/* HIỂN THỊ THÔNG TIN NGƯỜI DÙNG KHI CHỈNH SỬA */}
                {editingKhach && selectedNguoiDung && (
                  <div className="form-group full-width">
                    <label>Thông tin người dùng</label>
                    <div className="selected-user-info">
                      <div className="user-info-display">
                        <p><strong>Họ tên:</strong> {selectedNguoiDung.ho_ten}</p>
                        <p><strong>Email:</strong> {selectedNguoiDung.email}</p>
                        <p><strong>Số điện thoại:</strong> {selectedNguoiDung.so_dien_thoai}</p>
                        <p><strong>Địa chỉ:</strong> {selectedNguoiDung.dia_chi}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chọn phòng */}
                <div className="form-group full-width">
                  <label>Phòng <span className="required">*</span></label>
                  <select
                    name="id_phong"
                    value={formData.id_phong}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Chọn phòng</option>
                    {phongList.map(phong => (
                      <option key={phong.id_phong} value={phong.id_phong}>
                        {phong.ten_phong} - {formatCurrency(phong.gia_thue)}đ/tháng
                      </option>
                    ))}
                  </select>
                  {/* Hiển thị thông tin phòng đã chọn */}
                  {selectedPhongInfo && (
                    <div className="selected-room-info">
                      <h4>Thông tin phòng:</h4>
                      <div className="room-details">
                        <p><strong>Tên phòng:</strong> {selectedPhongInfo.ten_phong}</p>
                        <p><strong>Diện tích:</strong> {selectedPhongInfo.dien_tich} m²</p>
                        <p><strong>Giá thuê:</strong> {formatCurrency(selectedPhongInfo.gia_thue)} đ/tháng</p>
                        <p><strong>Tiền cọc:</strong> {formatCurrency(selectedPhongInfo.tien_coc)} đ</p>
                        {selectedPhongInfo.tien_dich_vu && (
                          <p><strong>Tiền dịch vụ cơ bản:</strong> {formatCurrency(selectedPhongInfo.tien_dich_vu)} đ/tháng</p>
                        )}
                        {selectedPhongInfo.tien_dich_vu_nguoi && (
                          <p><strong>Tiền dịch vụ/người:</strong> {formatCurrency(selectedPhongInfo.tien_dich_vu_nguoi)} đ/tháng</p>
                        )}
                        {selectedPhongInfo.dich_vu_bao_gom && (
                          <p><strong>Dịch vụ bao gồm:</strong> {selectedPhongInfo.dich_vu_bao_gom}</p>
                        )}
                        <p><strong>Số người tối đa:</strong> {selectedPhongInfo.so_nguoi_toi_da} người</p>
                        {(selectedPhongInfo.tien_dich_vu || selectedPhongInfo.tien_dich_vu_nguoi) && (
                          <div className="service-summary">
                            <p><strong>Tổng tiền dịch vụ:</strong> 
                              {formatCurrency(
                                (parseInt(selectedPhongInfo.tien_dich_vu) || 0) + 
                                (formData.so_nguoi_o * (parseInt(selectedPhongInfo.tien_dich_vu_nguoi) || 0))
                              )} đ/tháng
                            </p>
                            <small className="calculation-breakdown">
                              = {formatCurrency(selectedPhongInfo.tien_dich_vu || 0)} (cơ bản) + 
                              {formData.so_nguoi_o} × {formatCurrency(selectedPhongInfo.tien_dich_vu_nguoi || 0)} (theo người)
                            </small>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>CMND/CCCD <span className="required">*</span></label>
                  <input
                    type="text"
                    name="cmnd_cccd"
                    value={formData.cmnd_cccd}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Ngày sinh</label>
                  <input
                    type="date"
                    name="ngay_sinh"
                    value={formData.ngay_sinh}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Giới tính</label>
                  <select
                    name="gioi_tinh"
                    value={formData.gioi_tinh}
                    onChange={handleInputChange}
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="nam">Nam</option>
                    <option value="nu">Nữ</option>
                    <option value="khac">Khác</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Nghề nghiệp</label>
                  <input
                    type="text"
                    name="nghe_nghiep"
                    value={formData.nghe_nghiep}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Số người ở</label>
                  <input
                    type="number"
                    name="so_nguoi_o"
                    value={formData.so_nguoi_o}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label>Ngày vào <span className="required">*</span></label>
                  <input
                    type="date"
                    name="ngay_vao"
                    value={formData.ngay_vao}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Giá thuê (VNĐ)</label>
                  <input
                    type="number"
                    name="gia_thue"
                    value={formData.gia_thue}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="1000"
                  />
                </div>

                <div className="form-group">
                  <label>Tiền cọc (VNĐ)</label>
                  <input
                    type="number"
                    name="tien_coc"
                    value={formData.tien_coc}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="1000"
                  />
                </div>

                <div className="form-group">
                  <label>Tiền dịch vụ cơ bản (VNĐ/tháng)</label>
                  <input
                    type="number"
                    name="tien_dich_vu"
                    value={formData.tien_dich_vu}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="1000"
                  />
                </div>

                <div className="form-group">
                  <label>Tiền dịch vụ/người (VNĐ/tháng)</label>
                  <input
                    type="number"
                    name="tien_dich_vu_nguoi"
                    value={formData.tien_dich_vu_nguoi}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="1000"
                  />
                  <small className="form-help">
                    Tiền dịch vụ tính theo số người ở: {formData.so_nguoi_o} người × {formData.tien_dich_vu_nguoi || 0} = {formData.so_nguoi_o * (parseInt(formData.tien_dich_vu_nguoi) || 0)} VNĐ/tháng
                  </small>
                </div>

                <div className="form-group">
                  <label>Tổng tiền dịch vụ (VNĐ/tháng)</label>
                  <input
                    type="number"
                    value={(parseInt(formData.tien_dich_vu) || 0) + (formData.so_nguoi_o * (parseInt(formData.tien_dich_vu_nguoi) || 0))}
                    readOnly
                    className="readonly-input"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontWeight: '600'
                    }}
                  />
                  <small className="form-help">
                    Tổng = Tiền dịch vụ cơ bản + (Số người ở × Tiền dịch vụ/người)
                  </small>
                </div>

                <div className="form-group full-width">
                  <label>Ghi chú</label>
                  <textarea
                    name="ghi_chu"
                    value={formData.ghi_chu}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Ghi chú thêm về khách thuê..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => { setShowModal(false); resetForm(); }}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  {editingKhach ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuanLyKhachThue;
