-- Drop database if exists and create new
CREATE DATABASE IF NOT EXISTS phong_tro_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE phong_tro_db;

-- 1. Bảng Người Dùng (Users)
CREATE TABLE IF NOT EXISTS NguoiDung (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    matKhau VARCHAR(255) NOT NULL,
    soDienThoai VARCHAR(20),
    vaiTro ENUM('admin', 'chuNha', 'nhanVien') DEFAULT 'nhanVien',
    anhDaiDien TEXT,
    trangThai ENUM('hoatDong', 'khoa') DEFAULT 'hoatDong',
    diaChi VARCHAR(500),
    lastLogin DATETIME,
    ngayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngayCapNhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Bảng Tòa Nhà (Buildings)
CREATE TABLE IF NOT EXISTS ToaNha (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenToaNha VARCHAR(200) NOT NULL,
    soNha VARCHAR(100) NOT NULL,
    duong VARCHAR(100) NOT NULL,
    phuong VARCHAR(100) NOT NULL,
    quan VARCHAR(100) NOT NULL,
    thanhPho VARCHAR(100) NOT NULL,
    moTa TEXT,
    anhToaNha JSON, -- Lưu trữ mảng links dưới dạng JSON
    chuSoHuu_id INT NOT NULL,
    tongSoPhong INT DEFAULT 0,
    tienNghiChung JSON, -- Mảng tiện nghi chung
    ngayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngayCapNhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (chuSoHuu_id) REFERENCES NguoiDung(id) ON DELETE CASCADE
);

-- 3. Bảng Phòng (Rooms)
CREATE TABLE IF NOT EXISTS Phong (
    id INT AUTO_INCREMENT PRIMARY KEY,
    maPhong VARCHAR(50) NOT NULL UNIQUE,
    toaNha_id INT NOT NULL,
    tang INT NOT NULL,
    dienTich INT NOT NULL,
    giaThue INT NOT NULL,
    tienCoc INT NOT NULL,
    moTa TEXT,
    anhPhong JSON,
    tienNghi JSON,
    trangThai ENUM('trong', 'daDat', 'dangThue', 'baoTri') DEFAULT 'trong',
    soNguoiToiDa INT NOT NULL,
    ngayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngayCapNhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (toaNha_id) REFERENCES ToaNha(id) ON DELETE CASCADE
);

-- 4. Bảng Khách Thuê (Tenants)
CREATE TABLE IF NOT EXISTS KhachThue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hoTen VARCHAR(100) NOT NULL,
    soDienThoai VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100),
    cccd VARCHAR(20) NOT NULL UNIQUE,
    ngaySinh DATE NOT NULL,
    gioiTinh ENUM('nam', 'nu', 'khac') NOT NULL,
    queQuan VARCHAR(200) NOT NULL,
    anhCCCD_matTruoc TEXT,
    anhCCCD_matSau TEXT,
    ngheNghiep VARCHAR(100),
    matKhau VARCHAR(255),
    trangThai ENUM('dangThue', 'daTraPhong', 'chuaThue') DEFAULT 'chuaThue',
    ngayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngayCapNhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Bảng Hợp Đồng (Contracts)
CREATE TABLE IF NOT EXISTS HopDong (
    id INT AUTO_INCREMENT PRIMARY KEY,
    maHopDong VARCHAR(50) NOT NULL UNIQUE,
    phong_id INT NOT NULL,
    nguoiDaiDien_id INT NOT NULL,
    ngayBatDau DATE NOT NULL,
    ngayKetThuc DATE NOT NULL,
    giaThue INT NOT NULL,
    tienCoc INT NOT NULL,
    chuKyThanhToan ENUM('thang', 'quy', 'nam') DEFAULT 'thang',
    ngayThanhToan INT NOT NULL,
    dieuKhoan TEXT NOT NULL,
    giaDien INT NOT NULL,
    giaNuoc INT NOT NULL,
    chiSoDienBanDau INT NOT NULL,
    chiSoNuocBanDau INT NOT NULL,
    phiDichVu JSON, -- Mảng JSON [{ten: 'Wifi', gia: 100000}]
    trangThai ENUM('hoatDong', 'hetHan', 'daHuy') DEFAULT 'hoatDong',
    fileHopDong TEXT,
    ngayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngayCapNhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (phong_id) REFERENCES Phong(id) ON DELETE CASCADE,
    FOREIGN KEY (nguoiDaiDien_id) REFERENCES KhachThue(id) ON DELETE RESTRICT
);

-- Bảng phụ Nhiều-Nhiều giữa Hợp Đồng và Khách Thuê (Vì một hợp đồng có thể có nhiều người ở)
CREATE TABLE IF NOT EXISTS HopDong_KhachThue (
    hopDong_id INT NOT NULL,
    khachThue_id INT NOT NULL,
    PRIMARY KEY (hopDong_id, khachThue_id),
    FOREIGN KEY (hopDong_id) REFERENCES HopDong(id) ON DELETE CASCADE,
    FOREIGN KEY (khachThue_id) REFERENCES KhachThue(id) ON DELETE CASCADE
);

-- 6. Bảng Hóa Đơn (Invoices)
CREATE TABLE IF NOT EXISTS HoaDon (
    id INT AUTO_INCREMENT PRIMARY KEY,
    maHoaDon VARCHAR(50) NOT NULL UNIQUE,
    hopDong_id INT NOT NULL,
    phong_id INT NOT NULL,
    khachThue_id INT NOT NULL,
    thang INT NOT NULL,
    nam INT NOT NULL,
    tienPhong INT NOT NULL,
    tienDien INT NOT NULL,
    soDien INT NOT NULL,
    chiSoDienBanDau INT NOT NULL,
    chiSoDienCuoiKy INT NOT NULL,
    tienNuoc INT NOT NULL,
    soNuoc INT NOT NULL,
    chiSoNuocBanDau INT NOT NULL,
    chiSoNuocCuoiKy INT NOT NULL,
    phiDichVu JSON,
    tongTien BIGINT NOT NULL,
    daThanhToan BIGINT DEFAULT 0,
    conLai BIGINT NOT NULL,
    trangThai ENUM('chuaThanhToan', 'daThanhToanMotPhan', 'daThanhToan', 'quaHan') DEFAULT 'chuaThanhToan',
    hanThanhToan DATE NOT NULL,
    ghiChu VARCHAR(500),
    ngayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngayCapNhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hopDong_id) REFERENCES HopDong(id) ON DELETE RESTRICT,
    FOREIGN KEY (phong_id) REFERENCES Phong(id) ON DELETE RESTRICT,
    FOREIGN KEY (khachThue_id) REFERENCES KhachThue(id) ON DELETE RESTRICT
);

-- 7. Bảng Chỉ Số Điện Nước
CREATE TABLE IF NOT EXISTS ChiSoDienNuoc (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phong_id INT NOT NULL,
    thang INT NOT NULL,
    nam INT NOT NULL,
    chiSoDien INT NOT NULL,
    anhDongHoDien TEXT,
    chiSoNuoc INT NOT NULL,
    anhDongHoNuoc TEXT,
    ngayChot DATE NOT NULL,
    nguoiChot_id INT NOT NULL,
    ghiChu VARCHAR(500),
    trangThai ENUM('daChot', 'daTaoHoaDon') DEFAULT 'daChot',
    ngayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngayCapNhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (phong_id) REFERENCES Phong(id) ON DELETE CASCADE,
    FOREIGN KEY (nguoiChot_id) REFERENCES NguoiDung(id) ON DELETE RESTRICT
);

-- 8. Bảng Thanh Toán 
CREATE TABLE IF NOT EXISTS ThanhToan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hoaDon_id INT NOT NULL,
    soTien BIGINT NOT NULL,
    phuongThuc ENUM('tienMat', 'chuyenKhoan', 'viDienTu') NOT NULL,
    thongTinChuyenKhoan_nganHang VARCHAR(100),
    thongTinChuyenKhoan_soGiaoDich VARCHAR(100),
    ngayThanhToan DATETIME DEFAULT CURRENT_TIMESTAMP,
    nguoiNhan_id INT NOT NULL,
    ghiChu VARCHAR(500),
    anhBienLai TEXT,
    ngayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hoaDon_id) REFERENCES HoaDon(id) ON DELETE CASCADE,
    FOREIGN KEY (nguoiNhan_id) REFERENCES NguoiDung(id) ON DELETE RESTRICT
);

-- 9. Bảng Sự Cố (Incidents/Issues)
CREATE TABLE IF NOT EXISTS SuCo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tieuDe VARCHAR(200) NOT NULL,
    moTa TEXT NOT NULL,
    hinhAnh JSON,
    phong_id INT NOT NULL,
    nguoiBao_id INT NOT NULL,
    mucDo ENUM('nhe', 'vua', 'nghiemTrong') DEFAULT 'vua',
    trangThai ENUM('choXuLy', 'dangXuLy', 'daXuLy') DEFAULT 'choXuLy',
    ngayBao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ghiChuXuLy TEXT,
    chiPhi INT DEFAULT 0,
    ngayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngayCapNhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (phong_id) REFERENCES Phong(id) ON DELETE CASCADE,
    FOREIGN KEY (nguoiBao_id) REFERENCES KhachThue(id) ON DELETE RESTRICT
);

-- 10. Bảng Thông Báo (Notifications)
CREATE TABLE IF NOT EXISTS ThongBao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tieuDe VARCHAR(200) NOT NULL,
    noiDung TEXT NOT NULL,
    loaiThongBao ENUM('heThong', 'hoaDon', 'hopDong', 'suCo', 'chung') DEFAULT 'chung',
    nguoiChung INT, -- Null means sent to all
    daDoc BOOLEAN DEFAULT FALSE,
    link VARCHAR(200),
    ngayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nguoiChung) REFERENCES NguoiDung(id) ON DELETE CASCADE
);

-- Seed Admin User: password là 123456 (hash sẵn hoặc xử lý sau)
-- INSERT INTO NguoiDung (ten, email, matKhau, vaiTro) VALUES ('Admin', 'admin@phongtro.com', '$2y$10$X...', 'admin');
