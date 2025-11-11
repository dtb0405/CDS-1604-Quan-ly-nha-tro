
-- Tạo Database
CREATE DATABASE IF NOT EXISTS quan_ly_nha_tro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE quan_ly_nha_tro;

-- =====================================================
-- BẢNG NGƯỜI DÙNG (CẢ CHỦ TRỌ VÀ KHÁCH THUÊ)
-- =====================================================
CREATE TABLE IF NOT EXISTS nguoi_dung (
    id_nguoi_dung INT PRIMARY KEY AUTO_INCREMENT,
    ten_dang_nhap VARCHAR(50) UNIQUE NOT NULL,
    mat_khau VARCHAR(255) NOT NULL,
    ho_ten VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    so_dien_thoai VARCHAR(15),
    dia_chi TEXT,
    loai_nguoi_dung ENUM('chu_tro', 'khach_thue') NOT NULL,
    anh_dai_dien VARCHAR(255),
    trang_thai ENUM('hoat_dong', 'khoa') DEFAULT 'hoat_dong',
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_loai_nguoi_dung (loai_nguoi_dung),
    INDEX idx_trang_thai (trang_thai)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng người dùng hệ thống';

-- =====================================================
-- BẢNG PHÒNG TRỌ (ĐẦY ĐỦ THÔNG TIN DỊCH VỤ)
-- =====================================================
CREATE TABLE IF NOT EXISTS phong (
    id_phong INT PRIMARY KEY AUTO_INCREMENT,
    id_chu_tro INT NOT NULL,
    ten_phong VARCHAR(50) NOT NULL,
    dien_tich DECIMAL(5,2),
    gia_thue DECIMAL(10,2) NOT NULL,
    tien_coc DECIMAL(10,2),
    mo_ta TEXT,
    trang_thai ENUM('trong', 'dang_thue', 'can_don') DEFAULT 'trong',
    so_nguoi_toi_da INT DEFAULT 2,
    so_nguoi_o INT DEFAULT 0,
    anh_phong TEXT,
    tien_dich_vu DECIMAL(10,2) DEFAULT 0 COMMENT 'Tiền dịch vụ cơ bản (VNĐ/tháng)',
    tien_dich_vu_nguoi DECIMAL(10,2) DEFAULT 0 COMMENT 'Tiền dịch vụ tính theo số người ở (VNĐ/tháng)',
    dich_vu_bao_gom TEXT COMMENT 'Danh sách dịch vụ bao gồm (VD: Máy giặt, Thang máy, Bãi đỗ xe)',
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_chu_tro) REFERENCES nguoi_dung(id_nguoi_dung) ON DELETE CASCADE,
    INDEX idx_chu_tro (id_chu_tro),
    INDEX idx_trang_thai (trang_thai)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng phòng trọ với thông tin dịch vụ đầy đủ';

-- =====================================================
-- BẢNG THÔNG TIN KHÁCH THUÊ (ĐẦY ĐỦ THÔNG TIN)
-- =====================================================
CREATE TABLE IF NOT EXISTS khach_thue (
    id_khach_thue INT PRIMARY KEY AUTO_INCREMENT,
    id_nguoi_dung INT NOT NULL,
    id_phong INT,
    cmnd_cccd VARCHAR(20) UNIQUE NOT NULL,
    ngay_sinh DATE,
    gioi_tinh ENUM('nam', 'nu', 'khac'),
    nghe_nghiep VARCHAR(100),
    so_nguoi_o INT DEFAULT 1,
    ngay_vao DATE,
    ngay_ra DATE,
    ghi_chu TEXT,
    trang_thai ENUM('dang_thue', 'da_tra_phong') DEFAULT 'dang_thue',
    tien_coc DECIMAL(10,2) DEFAULT 0 COMMENT 'Tiền cọc khách thuê',
    gia_thue DECIMAL(10,2) DEFAULT 0 COMMENT 'Giá thuê theo hợp đồng',
    tien_dich_vu DECIMAL(10,2) DEFAULT 0 COMMENT 'Tiền dịch vụ cơ bản',
    tien_dich_vu_nguoi DECIMAL(10,2) DEFAULT 0 COMMENT 'Tiền dịch vụ/người',
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_nguoi_dung) REFERENCES nguoi_dung(id_nguoi_dung) ON DELETE CASCADE,
    FOREIGN KEY (id_phong) REFERENCES phong(id_phong) ON DELETE SET NULL,
    INDEX idx_phong (id_phong),
    INDEX idx_trang_thai (trang_thai),
    INDEX idx_nguoi_dung (id_nguoi_dung)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng thông tin khách thuê với thông tin tài chính';

-- =====================================================
-- BẢNG HỢP ĐỒNG THUÊ
-- =====================================================
CREATE TABLE IF NOT EXISTS hop_dong (
    id_hop_dong INT PRIMARY KEY AUTO_INCREMENT,
    id_phong INT NOT NULL,
    id_khach_thue INT NOT NULL,
    id_chu_tro INT NOT NULL,
    ngay_bat_dau DATE NOT NULL,
    ngay_ket_thuc DATE,
    gia_thue DECIMAL(10,2) NOT NULL,
    tien_coc DECIMAL(10,2) NOT NULL,
    noi_dung_hop_dong TEXT,
    trang_thai ENUM('hieu_luc', 'het_han', 'huy') DEFAULT 'hieu_luc',
    file_hop_dong VARCHAR(255),
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_phong) REFERENCES phong(id_phong) ON DELETE CASCADE,
    FOREIGN KEY (id_khach_thue) REFERENCES khach_thue(id_khach_thue) ON DELETE CASCADE,
    FOREIGN KEY (id_chu_tro) REFERENCES nguoi_dung(id_nguoi_dung) ON DELETE CASCADE,
    INDEX idx_trang_thai (trang_thai)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng hợp đồng thuê phòng';

-- =====================================================
-- BẢNG CHỈ SỐ ĐIỆN NƯỚC
-- =====================================================
CREATE TABLE IF NOT EXISTS dien_nuoc (
    id_dien_nuoc INT PRIMARY KEY AUTO_INCREMENT,
    id_phong INT NOT NULL,
    thang INT NOT NULL,
    nam INT NOT NULL,
    chi_so_dien_cu INT DEFAULT 0,
    chi_so_dien_moi INT NOT NULL,
    chi_so_nuoc_cu INT DEFAULT 0,
    chi_so_nuoc_moi INT NOT NULL,
    gia_dien DECIMAL(10,2) DEFAULT 3500,
    gia_nuoc DECIMAL(10,2) DEFAULT 20000,
    so_dien_tieu_thu INT GENERATED ALWAYS AS (chi_so_dien_moi - chi_so_dien_cu) STORED,
    so_nuoc_tieu_thu INT GENERATED ALWAYS AS (chi_so_nuoc_moi - chi_so_nuoc_cu) STORED,
    tien_dien DECIMAL(10,2) GENERATED ALWAYS AS (so_dien_tieu_thu * gia_dien) STORED,
    tien_nuoc DECIMAL(10,2) GENERATED ALWAYS AS (so_nuoc_tieu_thu * gia_nuoc) STORED,
    ngay_ghi_chi_so DATE DEFAULT (CURRENT_DATE),
    ghi_chu TEXT,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_phong) REFERENCES phong(id_phong) ON DELETE CASCADE,
    UNIQUE KEY unique_phong_thang_nam (id_phong, thang, nam),
    INDEX idx_phong (id_phong),
    INDEX idx_thang_nam (thang, nam)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng chỉ số điện nước theo tháng';

-- =====================================================
-- BẢNG HÓA ĐƠN (ĐẦY ĐỦ THÔNG TIN TÀI CHÍNH)
-- =====================================================
CREATE TABLE IF NOT EXISTS hoa_don (
    id_hoa_don INT PRIMARY KEY AUTO_INCREMENT,
    id_phong INT NOT NULL,
    id_khach_thue INT NOT NULL,
    id_dien_nuoc INT,
    thang INT NOT NULL,
    nam INT NOT NULL,
    tien_phong DECIMAL(10,2) NOT NULL COMMENT 'Tiền thuê phòng',
    tien_dien DECIMAL(10,2) DEFAULT 0 COMMENT 'Tiền điện',
    tien_nuoc DECIMAL(10,2) DEFAULT 0 COMMENT 'Tiền nước',
    tien_dich_vu DECIMAL(10,2) DEFAULT 0 COMMENT 'Tiền dịch vụ (cơ bản + theo người)',
    tong_tien DECIMAL(10,2) NOT NULL COMMENT 'Tổng tiền hóa đơn',
    trang_thai ENUM('chua_thanh_toan', 'da_thanh_toan', 'qua_han') DEFAULT 'chua_thanh_toan',
    ngay_tao_hoa_don DATE DEFAULT (CURRENT_DATE),
    han_thanh_toan DATE,
    ghi_chu TEXT,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_phong) REFERENCES phong(id_phong) ON DELETE CASCADE,
    FOREIGN KEY (id_khach_thue) REFERENCES khach_thue(id_khach_thue) ON DELETE CASCADE,
    FOREIGN KEY (id_dien_nuoc) REFERENCES dien_nuoc(id_dien_nuoc) ON DELETE SET NULL,
    INDEX idx_phong (id_phong),
    INDEX idx_khach_thue (id_khach_thue),
    INDEX idx_trang_thai (trang_thai),
    INDEX idx_thang_nam (thang, nam)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng hóa đơn với đầy đủ thông tin tài chính';

-- =====================================================
-- BẢNG THANH TOÁN
-- =====================================================
CREATE TABLE IF NOT EXISTS thanh_toan (
    id_thanh_toan INT PRIMARY KEY AUTO_INCREMENT,
    id_hoa_don INT NOT NULL,
    so_tien DECIMAL(10,2) NOT NULL,
    phuong_thuc ENUM('tien_mat', 'chuyen_khoan', 'vnpay', 'momo') NOT NULL,
    ma_giao_dich VARCHAR(100),
    ngay_thanh_toan TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nguoi_thu_tien VARCHAR(100),
    ghi_chu TEXT,
    trang_thai ENUM('thanh_cong', 'that_bai', 'dang_xu_ly', 'cho_duyet') DEFAULT 'thanh_cong',
    nguoi_duyet INT,
    ngay_duyet TIMESTAMP NULL,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_hoa_don) REFERENCES hoa_don(id_hoa_don) ON DELETE CASCADE,
    FOREIGN KEY (nguoi_duyet) REFERENCES nguoi_dung(id_nguoi_dung) ON DELETE SET NULL,
    INDEX idx_trang_thai (trang_thai)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng thanh toán hóa đơn';

-- =====================================================
-- BẢNG PHẢN HỒI / YÊU CẦU SỬA CHỮA
-- =====================================================
CREATE TABLE IF NOT EXISTS phan_hoi (
    id_phan_hoi INT PRIMARY KEY AUTO_INCREMENT,
    id_nguoi_gui INT NOT NULL,
    id_phong INT,
    tieu_de VARCHAR(200) NOT NULL,
    noi_dung TEXT NOT NULL,
    loai_phan_hoi ENUM('sua_chua', 'khieu_nai', 'gop_y', 'khac') NOT NULL,
    muc_do_uu_tien ENUM('thap', 'trung_binh', 'cao', 'khan_cap') DEFAULT 'trung_binh',
    trang_thai ENUM('moi', 'dang_xu_ly', 'hoan_thanh', 'tu_choi') DEFAULT 'moi',
    anh_dinh_kem TEXT,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ngay_hoan_thanh TIMESTAMP NULL,
    phan_hoi_cua_chu_tro TEXT,
    FOREIGN KEY (id_nguoi_gui) REFERENCES nguoi_dung(id_nguoi_dung) ON DELETE CASCADE,
    FOREIGN KEY (id_phong) REFERENCES phong(id_phong) ON DELETE SET NULL,
    INDEX idx_nguoi_gui (id_nguoi_gui),
    INDEX idx_trang_thai (trang_thai)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng phản hồi và yêu cầu sửa chữa';

-- =====================================================
-- BẢNG ĐÁNH GIÁ
-- =====================================================
CREATE TABLE IF NOT EXISTS danh_gia (
    id_danh_gia INT PRIMARY KEY AUTO_INCREMENT,
    id_nguoi_danh_gia INT NOT NULL,
    id_nguoi_duoc_danh_gia INT NOT NULL,
    id_phong INT,
    diem_so INT CHECK (diem_so >= 1 AND diem_so <= 5),
    noi_dung TEXT,
    loai_danh_gia ENUM('khach_danh_gia_chu_tro', 'chu_tro_danh_gia_khach') NOT NULL,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_nguoi_danh_gia) REFERENCES nguoi_dung(id_nguoi_dung) ON DELETE CASCADE,
    FOREIGN KEY (id_nguoi_duoc_danh_gia) REFERENCES nguoi_dung(id_nguoi_dung) ON DELETE CASCADE,
    FOREIGN KEY (id_phong) REFERENCES phong(id_phong) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng đánh giá giữa chủ trọ và khách thuê';

-- =====================================================
-- BẢNG THÔNG BÁO
-- =====================================================
CREATE TABLE IF NOT EXISTS thong_bao (
    id_thong_bao INT PRIMARY KEY AUTO_INCREMENT,
    id_nguoi_nhan INT NOT NULL,
    tieu_de VARCHAR(200) NOT NULL,
    noi_dung TEXT NOT NULL,
    loai_thong_bao ENUM('hoa_don', 'thanh_toan', 'hop_dong', 'he_thong', 'khac') NOT NULL,
    da_doc BOOLEAN DEFAULT FALSE,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_nguoi_nhan) REFERENCES nguoi_dung(id_nguoi_dung) ON DELETE CASCADE,
    INDEX idx_nguoi_nhan (id_nguoi_nhan),
    INDEX idx_da_doc (da_doc)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng thông báo hệ thống';

-- =====================================================
-- BẢNG YÊU CẦU TRẢ PHÒNG
-- =====================================================
CREATE TABLE IF NOT EXISTS yeu_cau_tra_phong (
    id_yeu_cau INT PRIMARY KEY AUTO_INCREMENT,
    id_khach_thue INT NOT NULL,
    id_phong INT,
    ngay_ra_de_xuat DATE NOT NULL,
    ly_do VARCHAR(100) NOT NULL,
    ghi_chu TEXT,
    trang_thai ENUM('cho_duyet','da_duyet','tu_choi') DEFAULT 'cho_duyet',
    ly_do_tu_choi TEXT,
    nguoi_duyet INT,
    ngay_duyet TIMESTAMP NULL,
    da_luu_lich_su BOOLEAN DEFAULT FALSE,
    ngay_luu_lich_su TIMESTAMP NULL,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_khach_thue) REFERENCES khach_thue(id_khach_thue) ON DELETE CASCADE,
    FOREIGN KEY (id_phong) REFERENCES phong(id_phong) ON DELETE SET NULL,
    FOREIGN KEY (nguoi_duyet) REFERENCES nguoi_dung(id_nguoi_dung) ON DELETE SET NULL,
    INDEX idx_trang_thai (trang_thai),
    INDEX idx_khach_thue (id_khach_thue)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Yêu cầu trả phòng chờ chủ trọ duyệt';

-- =====================================================
-- BẢNG LỊCH SỬ TRẢ PHÒNG
-- =====================================================
CREATE TABLE IF NOT EXISTS lich_su_tra_phong (
    id_lich_su INT PRIMARY KEY AUTO_INCREMENT,
    id_nguoi_dung INT,
    ho_ten VARCHAR(100),
    email VARCHAR(100),
    so_dien_thoai VARCHAR(15),
    cmnd_cccd VARCHAR(20),
    ngay_sinh DATE,
    gioi_tinh ENUM('nam', 'nu', 'khac'),
    dia_chi TEXT,
    nghe_nghiep VARCHAR(100),
    id_phong INT,
    ten_phong VARCHAR(50),
    id_chu_tro INT,
    ngay_vao DATE,
    ngay_ra DATE,
    so_nguoi_o INT,
    tien_coc DECIMAL(15,2),
    gia_thue DECIMAL(15,2),
    tien_dich_vu DECIMAL(15,2),
    tien_dich_vu_nguoi DECIMAL(15,2),
    ly_do_tra_phong TEXT,
    ngay_yeu_cau_tra DATETIME,
    ngay_duyet_tra DATETIME,
    ghi_chu_admin TEXT,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_xoa_tai_khoan TIMESTAMP NULL,
    INDEX idx_nguoi_dung (id_nguoi_dung),
    INDEX idx_chu_tro (id_chu_tro),
    INDEX idx_ngay_ra (ngay_ra)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lịch sử khách đã trả phòng và xóa tài khoản';

-- =====================================================
-- KẾT THÚC SCHEMA
-- =====================================================
