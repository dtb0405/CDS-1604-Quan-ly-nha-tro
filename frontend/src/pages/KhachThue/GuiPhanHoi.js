import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FaComments, FaPaperPlane } from 'react-icons/fa';
import './GuiPhanHoi.css';

const GuiPhanHoi = () => {
  const [formData, setFormData] = useState({
    tieu_de: '',
    loai_phan_hoi: 'sua_chua',
    muc_do_uu_tien: 'trung_binh',
    noi_dung: ''
  });
  const [loading, setLoading] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);
  const [recentCount, setRecentCount] = useState(0);

  useEffect(() => {
    layThongTinPhong();
    demPhanHoiGanDay();
  }, []);

  const layThongTinPhong = async () => {
    try {
      const response = await api.get('/khach-thue/thong-tin-cua-toi');
      if (response.data.data) {
        setRoomInfo(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi lấy thông tin phòng:', error);
    }
  };

  const demPhanHoiGanDay = async () => {
    try {
      const res = await api.get('/phan-hoi');
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setRecentCount(list.length);
    } catch (e) {
      // ignore silently
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.tieu_de.trim()) {
      toast.warning('Vui lòng nhập tiêu đề');
      return;
    }
    
    if (!formData.noi_dung.trim()) {
      toast.warning('Vui lòng nhập nội dung phản hồi');
      return;
    }

    if (!roomInfo || !roomInfo.id_phong) {
      toast.error('Không tìm thấy thông tin phòng. Vui lòng liên hệ chủ trọ.');
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        id_phong: roomInfo.id_phong,
        tieu_de: formData.tieu_de,
        loai_phan_hoi: formData.loai_phan_hoi,
        muc_do_uu_tien: formData.muc_do_uu_tien,
        noi_dung: formData.noi_dung
      };
      
      console.log('Gửi phản hồi:', dataToSend);
      
      await api.post('/phan-hoi', dataToSend);
      toast.success('Đã gửi phản hồi thành công!');
      setFormData({
        tieu_de: '',
        loai_phan_hoi: 'sua_chua',
        muc_do_uu_tien: 'trung_binh',
        noi_dung: ''
      });
    } catch (error) {
      console.error('Lỗi khi gửi phản hồi:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gui-phan-hoi">
      <div className="page-header">
        <div>
          <h1><FaComments /> Gửi phản hồi</h1>
          <p>Gửi yêu cầu sửa chữa, khiếu nại hoặc góp ý</p>
          {roomInfo && (
            <p className="room-info" style={{ marginTop: '10px', color: 'var(--success)', fontWeight: 'bold' }}>
              📍 Phòng hiện tại: {roomInfo.ten_phong}
            </p>
          )}
          <p style={{ marginTop: 6, fontSize: 13, color: 'var(--text-muted)' }}>
            Bạn đã gửi {recentCount} phản hồi. <Link to="/khach-thue/phan-hoi/lich-su" style={{color:'var(--primary)'}}>Xem lịch sử »</Link>
          </p>
        </div>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>Thông tin phản hồi</h2>
            
            <div className="form-group full-width">
              <label>Tiêu đề <span className="required">*</span></label>
              <input
                type="text"
                name="tieu_de"
                value={formData.tieu_de}
                onChange={handleInputChange}
                placeholder="Ví dụ: Yêu cầu sửa chữa điều hòa"
                required
              />
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Loại phản hồi <span className="required">*</span></label>
                <select 
                  name="loai_phan_hoi" 
                  value={formData.loai_phan_hoi} 
                  onChange={handleInputChange}
                  required
                >
                  <option value="sua_chua">🔧 Yêu cầu sửa chữa</option>
                  <option value="khieu_nai">⚠️ Khiếu nại</option>
                  <option value="gop_y">💡 Góp ý</option>
                </select>
              </div>

              <div className="form-group">
                <label>Mức độ ưu tiên <span className="required">*</span></label>
                <select 
                  name="muc_do_uu_tien" 
                  value={formData.muc_do_uu_tien} 
                  onChange={handleInputChange}
                  required
                >
                  <option value="thap">Thấp</option>
                  <option value="trung_binh">Trung bình</option>
                  <option value="cao">Cao</option>
                </select>
              </div>
            </div>

            <div className="form-group full-width">
              <label>Nội dung chi tiết <span className="required">*</span></label>
              <textarea
                name="noi_dung"
                value={formData.noi_dung}
                onChange={handleInputChange}
                placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                rows="8"
                required
              />
              <span className="char-count">{formData.noi_dung.length} ký tự</span>
            </div>
          </div>

          <div className="form-info">
            <h3>📌 Lưu ý</h3>
            <ul>
              <li>Vui lòng mô tả rõ ràng vấn đề bạn gặp phải</li>
              <li>Với yêu cầu sửa chữa, hãy ghi rõ vị trí và tình trạng</li>
              <li>Chúng tôi sẽ phản hồi trong vòng 24-48 giờ</li>
              <li>Yêu cầu khẩn cấp sẽ được xử lý ưu tiên</li>
            </ul>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Đang gửi...' : (
              <>
                <FaPaperPlane /> Gửi phản hồi
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GuiPhanHoi;
