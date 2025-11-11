import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaUserSlash, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './DuyetTraPhong.css';

const DuyetTraPhong = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const loadRequests = async () => {
    try {
      const res = await api.get('/tra-phong');
      setRequests(Array.isArray(res.data.data) ? res.data.data : (res.data.data || []));
    } catch (e) {
      console.error(e);
      toast.error('Không tải được yêu cầu trả phòng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRequests(); }, []);

  const approve = async (id) => {
    if (!window.confirm('Duyệt yêu cầu này?')) return;
    setProcessingId(id);
    try {
      await api.patch(`/tra-phong/${id}/approve`);
      toast.success('Đã duyệt');
      loadRequests();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi duyệt');
    } finally { setProcessingId(null); }
  };

  const reject = async (id) => {
    const lyDo = prompt('Nhập lý do từ chối (tuỳ chọn)');
    if (lyDo === null) return; // cancelled
    setProcessingId(id);
    try {
      await api.patch(`/tra-phong/${id}/reject`, { ly_do_tu_choi: lyDo });
      toast.info('Đã từ chối');
      loadRequests();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi từ chối');
    } finally { setProcessingId(null); }
  };

  const getLyDoText = (ly_do) => {
    const mapping = {
      'het_hop_dong': 'Hết hạn hợp đồng',
      'chuyen_nha': 'Chuyển nhà',
      'cong_viec': 'Thay đổi công việc',
      'gia_dinh': 'Lý do gia đình',
      'khac': 'Lý do khác'
    };
    return mapping[ly_do] || ly_do;
  };

  const getTrangThaiText = (trang_thai) => {
    const mapping = {
      'cho_duyet': 'Chờ duyệt',
      'da_duyet': 'Đã duyệt',
      'tu_choi': 'Từ chối'
    };
    return mapping[trang_thai] || trang_thai;
  };

  if (loading) return <div className="duyet-tra-phong loading">Đang tải...</div>;

  return (
    <div className="duyet-tra-phong modern-admin">
      <div className="page-header-admin">
        <div className="header-icon-wrapper">
          <FaUserSlash />
        </div>
        <div>
          <h1>Yêu cầu trả phòng</h1>
          <p>Quản lý và duyệt các yêu cầu trả phòng từ khách thuê</p>
        </div>
      </div>

      <div className="stats-bar">
        <div className="stat-item">
          <FaClock className="stat-icon pending" />
          <div>
            <span className="stat-label">Chờ duyệt</span>
            <span className="stat-value">{requests.filter(r => r.trang_thai === 'cho_duyet').length}</span>
          </div>
        </div>
        <div className="stat-item">
          <FaCheckCircle className="stat-icon approved" />
          <div>
            <span className="stat-label">Đã duyệt</span>
            <span className="stat-value">{requests.filter(r => r.trang_thai === 'da_duyet').length}</span>
          </div>
        </div>
        <div className="stat-item">
          <FaTimesCircle className="stat-icon rejected" />
          <div>
            <span className="stat-label">Từ chối</span>
            <span className="stat-value">{requests.filter(r => r.trang_thai === 'tu_choi').length}</span>
          </div>
        </div>
      </div>

      <div className="request-cards">
        {requests.map(r => (
          <div key={r.id_yeu_cau} className={`request-card status-${r.trang_thai}`}>
            <div className="card-header-req">
              <div className="tenant-info">
                <h3>{r.ho_ten || 'N/A'}</h3>
                <span className="room-badge">{r.ten_phong || '—'}</span>
              </div>
              <span className={`status-badge-req ${r.trang_thai}`}>
                {getTrangThaiText(r.trang_thai)}
              </span>
            </div>
            <div className="card-body-req">
              <div className="info-row">
                <span className="label">Ngày đề xuất:</span>
                <span className="value">{new Date(r.ngay_ra_de_xuat).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="info-row">
                <span className="label">Lý do:</span>
                <span className="value reason">{getLyDoText(r.ly_do)}</span>
              </div>
              {r.ghi_chu && (
                <div className="info-row note">
                  <span className="label">Ghi chú:</span>
                  <p className="note-text">{r.ghi_chu}</p>
                </div>
              )}
              {r.ly_do_tu_choi && (
                <div className="info-row reject-reason">
                  <span className="label">Lý do từ chối:</span>
                  <p className="reject-text">{r.ly_do_tu_choi}</p>
                </div>
              )}
            </div>
            {r.trang_thai === 'cho_duyet' && (
              <div className="card-actions">
                <button 
                  disabled={processingId === r.id_yeu_cau} 
                  onClick={() => approve(r.id_yeu_cau)} 
                  className="btn-approve-card"
                >
                  <FaCheck /> Duyệt
                </button>
                <button 
                  disabled={processingId === r.id_yeu_cau} 
                  onClick={() => reject(r.id_yeu_cau)} 
                  className="btn-reject-card"
                >
                  <FaTimes /> Từ chối
                </button>
              </div>
            )}
          </div>
        ))}
        {requests.length === 0 && (
          <div className="empty-state">
            <FaUserSlash size={64} />
            <h3>Chưa có yêu cầu nào</h3>
            <p>Khi khách thuê gửi yêu cầu trả phòng, chúng sẽ hiển thị tại đây</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DuyetTraPhong;
