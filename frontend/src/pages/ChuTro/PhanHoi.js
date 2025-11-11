import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FaComments, FaExclamationCircle, FaCheckCircle, FaClock, FaEye, FaTimes, FaReply } from 'react-icons/fa';
import './PhanHoi.css';

const PhanHoi = () => {
  const [phanHoi, setPhanHoi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPhanHoi, setSelectedPhanHoi] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [filterTrangThai, setFilterTrangThai] = useState('all');
  const [filterDoUuTien, setFilterDoUuTien] = useState('all');

  useEffect(() => {
    layDanhSachPhanHoi();
  }, []);

  const layDanhSachPhanHoi = async () => {
    try {
  const response = await api.get('/phan-hoi');
      // Đảm bảo phanHoi luôn là mảng
      const data = Array.isArray(response.data)
        ? response.data
        : (Array.isArray(response.data?.data) ? response.data.data : []);
      setPhanHoi(data);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phản hồi:', error);
      toast.error('Không thể tải danh sách phản hồi');
      setPhanHoi([]);
      setLoading(false);
    }
  };

  const xemChiTiet = async (id) => {
    try {
      const response = await api.get(`/phan-hoi/${id}`);
      setSelectedPhanHoi(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết phản hồi:', error);
      toast.error('Không thể tải chi tiết phản hồi');
    }
  };

  const capNhatTrangThai = async (id, trangThai) => {
    try {
  await api.put(`/phan-hoi/${id}`, { trang_thai: trangThai });
      toast.success('Cập nhật trạng thái thành công!');
      layDanhSachPhanHoi();
      if (selectedPhanHoi && selectedPhanHoi.id_phan_hoi === id) {
        setSelectedPhanHoi({ ...selectedPhanHoi, trang_thai: trangThai });
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const guiTraLoi = async () => {
    if (!replyText.trim()) {
      toast.warning('Vui lòng nhập nội dung trả lời');
      return;
    }

    try {
  await api.post(`/phan-hoi/${selectedPhanHoi.id_phan_hoi}/tra-loi`, { noi_dung: replyText, cap_nhat_trang_thai: 'hoan_thanh' });
      toast.success('Đã gửi trả lời!');
      setReplyText('');
  capNhatTrangThai(selectedPhanHoi.id_phan_hoi, 'hoan_thanh');
    } catch (error) {
      console.error('Lỗi khi gửi trả lời:', error);
      toast.error('Không thể gửi trả lời');
    }
  };

  const getTrangThaiClass = (trangThai) => {
    const t = trangThai === 'da_xu_ly' ? 'hoan_thanh' : trangThai;
    switch (t) {
      case 'moi': return 'status-new';
      case 'dang_xu_ly': return 'status-processing';
      case 'hoan_thanh': return 'status-done';
      default: return '';
    }
  };

  const getTrangThaiText = (trangThai) => {
    const t = trangThai === 'da_xu_ly' ? 'hoan_thanh' : trangThai;
    switch (t) {
      case 'moi': return 'Mới';
      case 'dang_xu_ly': return 'Đang xử lý';
      case 'hoan_thanh': return 'Đã xử lý';
      default: return trangThai;
    }
  };

  const getTrangThaiIcon = (trangThai) => {
    const t = trangThai === 'da_xu_ly' ? 'hoan_thanh' : trangThai;
    switch (t) {
      case 'moi': return <FaExclamationCircle />;
      case 'dang_xu_ly': return <FaClock />;
      case 'hoan_thanh': return <FaCheckCircle />;
      default: return <FaClock />;
    }
  };

  const getDoUuTienClass = (doUuTien) => {
    switch (doUuTien) {
      case 'cao': return 'priority-high';
      case 'trung_binh': return 'priority-medium';
      case 'thap': return 'priority-low';
      default: return '';
    }
  };

  const getDoUuTienText = (doUuTien) => {
    switch (doUuTien) {
      case 'cao': return 'Cao';
      case 'trung_binh': return 'Trung bình';
      case 'thap': return 'Thấp';
      default: return doUuTien;
    }
  };

  const filteredPhanHoi = phanHoi.filter(ph => {
    const matchTrangThai = filterTrangThai === 'all' || ph.trang_thai === filterTrangThai;
    const matchDoUuTien = filterDoUuTien === 'all' || ph.do_uu_tien === filterDoUuTien;
    return matchTrangThai && matchDoUuTien;
  });

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="phan-hoi">
      <div className="page-header">
        <div>
          <h1><FaComments /> Quản lý phản hồi</h1>
          <p>Xử lý các phản hồi và yêu cầu từ khách thuê</p>
        </div>
      </div>

      <div className="filters">
        <select value={filterTrangThai} onChange={(e) => setFilterTrangThai(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="moi">Mới</option>
          <option value="dang_xu_ly">Đang xử lý</option>
          <option value="da_xu_ly">Đã xử lý</option>
        </select>
        <select value={filterDoUuTien} onChange={(e) => setFilterDoUuTien(e.target.value)}>
          <option value="all">Tất cả độ ưu tiên</option>
          <option value="cao">Cao</option>
          <option value="trung_binh">Trung bình</option>
          <option value="thap">Thấp</option>
        </select>
      </div>

      <div className="phan-hoi-grid">
        {filteredPhanHoi.map((ph) => (
          <div key={ph.id_phan_hoi} className="phan-hoi-card">
            <div className="card-header">
              <div className="header-top">
                <span className={`priority-badge ${getDoUuTienClass(ph.do_uu_tien)}`}>
                  {getDoUuTienText(ph.do_uu_tien)}
                </span>
                <span className={`status-badge ${getTrangThaiClass(ph.trang_thai)}`}>
                  {getTrangThaiIcon(ph.trang_thai)}
                  {getTrangThaiText(ph.trang_thai)}
                </span>
              </div>
              <h3>{ph.loai_phan_hoi === 'sua_chua' ? '🔧 Sửa chữa' : ph.loai_phan_hoi === 'khieu_nai' ? '⚠️ Khiếu nại' : '💡 Góp ý'}</h3>
            </div>
            
            <div className="card-body">
              <div className="info-row">
                <span className="label">Phòng:</span>
                <span className="value">{ph.ten_phong}</span>
              </div>
              <div className="content-preview">
                {ph.noi_dung?.substring(0, 100)}
                {ph.noi_dung?.length > 100 && '...'}
              </div>
              <div className="info-row">
                <span className="label">Ngày gửi:</span>
                <span className="value">{new Date(ph.ngay_tao).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
            
            <div className="card-footer">
              <button className="btn-view" onClick={() => xemChiTiet(ph.id_phan_hoi)}>
                <FaEye /> Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPhanHoi.length === 0 && (
        <div className="no-data">
          <FaComments size={48} />
          <p>Không có phản hồi nào</p>
        </div>
      )}

      {showDetailModal && selectedPhanHoi && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết phản hồi</h2>
              <button className="btn-close" onClick={() => setShowDetailModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="detail-content">
              <div className="detail-header">
                <div className="badges">
                  <span className={`priority-badge ${getDoUuTienClass(selectedPhanHoi.do_uu_tien)}`}>
                    Độ ưu tiên: {getDoUuTienText(selectedPhanHoi.do_uu_tien)}
                  </span>
                  <span className={`status-badge ${getTrangThaiClass(selectedPhanHoi.trang_thai)}`}>
                    {getTrangThaiIcon(selectedPhanHoi.trang_thai)}
                    {getTrangThaiText(selectedPhanHoi.trang_thai)}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông tin</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Phòng:</span>
                    <span className="value">{selectedPhanHoi.ten_phong}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Loại:</span>
                    <span className="value">
                      {selectedPhanHoi.loai_phan_hoi === 'sua_chua' ? 'Sửa chữa' : 
                       selectedPhanHoi.loai_phan_hoi === 'khieu_nai' ? 'Khiếu nại' : 'Góp ý'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Ngày gửi:</span>
                    <span className="value">{new Date(selectedPhanHoi.ngay_tao).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Nội dung</h3>
                <p className="content-text">{selectedPhanHoi.noi_dung}</p>
              </div>

              <div className="detail-section">
                <h3>Thay đổi trạng thái</h3>
                <div className="status-buttons">
                  <button 
                    className="btn-status new" 
                    onClick={() => capNhatTrangThai(selectedPhanHoi.id_phan_hoi, 'moi')}
                    disabled={selectedPhanHoi.trang_thai === 'moi'}
                  >
                    <FaExclamationCircle /> Mới
                  </button>
                  <button 
                    className="btn-status processing" 
                    onClick={() => capNhatTrangThai(selectedPhanHoi.id_phan_hoi, 'dang_xu_ly')}
                    disabled={selectedPhanHoi.trang_thai === 'dang_xu_ly'}
                  >
                    <FaClock /> Đang xử lý
                  </button>
                  <button 
                    className="btn-status done" 
                    onClick={() => capNhatTrangThai(selectedPhanHoi.id_phan_hoi, 'da_xu_ly')}
                    disabled={selectedPhanHoi.trang_thai === 'da_xu_ly'}
                  >
                    <FaCheckCircle /> Đã xử lý
                  </button>
                </div>
              </div>

              <div className="detail-section">
                <h3><FaReply /> Trả lời</h3>
                <textarea
                  className="reply-textarea"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Nhập nội dung trả lời..."
                  rows="4"
                />
                <button className="btn-send-reply" onClick={guiTraLoi}>
                  <FaReply /> Gửi trả lời
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhanHoi;
