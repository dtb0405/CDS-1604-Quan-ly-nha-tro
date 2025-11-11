import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { FaComments, FaClock, FaCheckCircle, FaExclamationCircle, FaEye, FaReply } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './LichSuPhanHoi.css';

const LichSuPhanHoi = () => {
  const [phanHoi, setPhanHoi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    layDanhSach();
  }, []);

  const layDanhSach = async () => {
    try {
      const res = await api.get('/phan-hoi'); // backend filters by id_nguoi_gui for khach_thue
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setPhanHoi(data);
    } catch (e) {
      console.error(e);
      toast.error('Không thể tải phản hồi');
    } finally {
      setLoading(false);
    }
  };

  const normalizeTrangThai = (raw) => raw === 'da_xu_ly' ? 'hoan_thanh' : raw;

  const getTrangThaiClass = (trangThaiRaw) => {
    const t = normalizeTrangThai(trangThaiRaw);
    switch (t) {
      case 'moi': return 'status-new';
      case 'dang_xu_ly': return 'status-processing';
      case 'hoan_thanh': return 'status-done';
      default: return '';
    }
  };

  const getTrangThaiText = (trangThaiRaw) => {
    const t = normalizeTrangThai(trangThaiRaw);
    switch (t) {
      case 'moi': return 'Mới';
      case 'dang_xu_ly': return 'Đang xử lý';
      case 'hoan_thanh': return 'Đã xử lý';
      default: return t;
    }
  };

  const getTrangThaiIcon = (trangThaiRaw) => {
    const t = normalizeTrangThai(trangThaiRaw);
    switch (t) {
      case 'moi': return <FaExclamationCircle />;
      case 'dang_xu_ly': return <FaClock />;
      case 'hoan_thanh': return <FaCheckCircle />;
      default: return <FaClock />;
    }
  };

  const openDetail = (item) => {
    setSelected(item);
    setShowModal(true);
  };

  const getDoUuTienText = (level) => {
    switch (level) {
      case 'cao': return 'Cao';
      case 'trung_binh': return 'Trung bình';
      case 'thap': return 'Thấp';
      default: return level;
    }
  };

  const getDoUuTienClass = (level) => {
    switch (level) {
      case 'cao': return 'priority-high';
      case 'trung_binh': return 'priority-medium';
      case 'thap': return 'priority-low';
      default: return '';
    }
  };

  const getLoaiPhanHoiText = (loai) => {
    switch (loai) {
      case 'sua_chua': return '🔧 Sửa chữa';
      case 'khieu_nai': return '⚠️ Khiếu nại';
      case 'gop_y': return '💡 Góp ý';
      default: return loai;
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelected(null);
    setReplyText('');
  };

  const handleReply = async () => {
    if (!replyText.trim()) {
      toast.warning('Vui lòng nhập nội dung trao đổi');
      return;
    }
    try {
      // Tenant can append more info; keep same endpoint /phan-hoi/:id (PUT) adding phan_hoi_cua_chu_tro? -> Not suitable.
      // For safe: create an update adding extra noi_dung (append) - but backend lacks separate endpoint.
      toast.info('Chức năng bổ sung thông tin sẽ được hỗ trợ sau');
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div className="lich-su-phan-hoi">
      <div className="page-header">
        <h1><FaComments /> Lịch sử phản hồi</h1>
        <p>Theo dõi tình trạng các phản hồi đã gửi</p>
      </div>

      {phanHoi.length === 0 && (
        <div className="no-data">
          <FaComments size={48} />
          <p>Chưa có phản hồi nào</p>
        </div>
      )}

      <div className="phan-hoi-list">
        {phanHoi.map(ph => (
          <div key={ph.id_phan_hoi} className="phan-hoi-row" onClick={() => openDetail(ph)}>
            <div className="status-cell">
              <span className={`status-badge ${getTrangThaiClass(ph.trang_thai)}`}>
                {getTrangThaiIcon(ph.trang_thai)} {getTrangThaiText(ph.trang_thai)}
              </span>
              <span className={`priority-badge ${getDoUuTienClass(ph.muc_do_uu_tien)}`}>
                {getDoUuTienText(ph.muc_do_uu_tien)}
              </span>
            </div>
            <div className="content-cell">
              <div className="loai-badge">{getLoaiPhanHoiText(ph.loai_phan_hoi)}</div>
              <h3 className="title">{ph.tieu_de || 'Phản hồi không có tiêu đề'}</h3>
              <p className="preview">{ph.noi_dung?.substring(0, 150)}{ph.noi_dung?.length > 150 && '...'}</p>
              <div className="meta">
                <span>Phòng {ph.ten_phong || 'N/A'}</span>
                <span>{new Date(ph.ngay_tao).toLocaleDateString('vi-VN')}</span>
                {ph.ngay_hoan_thanh && (
                  <span>{new Date(ph.ngay_hoan_thanh).toLocaleDateString('vi-VN')}</span>
                )}
              </div>
            </div>
            {/* Nút xem chi tiết được loại bỏ; toàn bộ thẻ đã có onClick mở modal */}
          </div>
        ))}
      </div>

      {showModal && selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết phản hồi</h2>
              <button className="btn-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-status">
                <span className={`status-badge ${getTrangThaiClass(selected.trang_thai)}`}>
                  {getTrangThaiIcon(selected.trang_thai)} {getTrangThaiText(selected.trang_thai)}
                </span>
                <span className={`priority-badge ${getDoUuTienClass(selected.muc_do_uu_tien)}`}>
                  Ưu tiên: {getDoUuTienText(selected.muc_do_uu_tien)}
                </span>
              </div>
              <h3 className="detail-title">{selected.tieu_de || 'Phản hồi không có tiêu đề'}</h3>
              
              <div className="detail-section">
                <label>Loại phản hồi:</label>
                <span>{getLoaiPhanHoiText(selected.loai_phan_hoi)}</span>
              </div>
              
              <div className="detail-section">
                <label>Phòng:</label>
                <span>{selected.ten_phong || 'N/A'}</span>
              </div>
              
              <div className="detail-section">
                <label>Ngày gửi:</label>
                <span>{new Date(selected.ngay_tao).toLocaleString('vi-VN')}</span>
              </div>
              
              <div className="detail-section">
                <label>Nội dung chi tiết:</label>
                <p className="noi-dung-full">{selected.noi_dung}</p>
              </div>
              
              {selected.phan_hoi_cua_chu_tro && (
                <div className="detail-section chu-tro-reply">
                  <label>💬 Phản hồi từ chủ trọ:</label>
                  <p>{selected.phan_hoi_cua_chu_tro}</p>
                </div>
              )}
              
              {selected.ngay_hoan_thanh && (
                <div className="detail-section">
                  <label>Thời gian hoàn thành:</label>
                  <span>{new Date(selected.ngay_hoan_thanh).toLocaleString('vi-VN')}</span>
                </div>
              )}
              {/* Future optional extra info from tenant */}
              {/* <div className="detail-section">
                <label>Bổ sung thêm:</label>
                <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows="3" placeholder="Thêm thông tin (chưa khả dụng)"></textarea>
                <button className="btn-send" onClick={handleReply}><FaReply /> Gửi bổ sung</button>
              </div> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LichSuPhanHoi;
