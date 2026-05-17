// Types cho hệ thống quản lý phòng trọ

export interface DiaChi {
  soNha: string;
  duong: string;
  phuong: string;
  quan: string;
  thanhPho: string;
}

export interface AnhCCCD {
  matTruoc: string;
  matSau: string;
}

export interface ThongTinChuyenKhoan {
  nganHang: string;
  soGiaoDich: string;
}

export interface PhiDichVu {
  ten: string;
  gia: number;
}

export interface NguoiDung {
  id?: number | string;
  ten: string;
  email: string;
  matKhau: string;
  soDienThoai: string;
  vaiTro: 'admin' | 'chuNha' | 'nhanVien';
  anhDaiDien?: string;
  trangThai: 'hoatDong' | 'khoa';
  ngayTao: Date | string;
  ngayCapNhat: Date | string;
}

export interface ToaNha {
  id?: number | string;
  tenToaNha: string;
  diaChi: DiaChi;
  moTa?: string;
  anhToaNha: string[];
  chuSoHuu_id: number | string;
  tongSoPhong: number;
  tienNghiChung: string[];
  ngayTao: Date | string;
  ngayCapNhat: Date | string;
}

export interface Phong {
  id?: number | string;
  maPhong: string;
  toaNha_id: number | string;
  tenToaNha?: string;
  tang: number;
  dienTich: number;
  giaThue: number;
  tienCoc: number;
  moTa?: string;
  anhPhong: string[];
  tienNghi: string[];
  trangThai: 'trong' | 'daDat' | 'dangThue' | 'baoTri';
  soNguoiToiDa: number;
  ngayTao: Date | string;
  ngayCapNhat: Date | string;
}

export interface KhachThue {
  id?: number | string;
  hoTen: string;
  soDienThoai: string;
  email?: string;
  cccd: string;
  ngaySinh: Date | string;
  gioiTinh: 'nam' | 'nu' | 'khac';
  queQuan: string;
  anhCCCD: AnhCCCD | null;
  ngheNghiep?: string;
  matKhau?: string;
  trangThai: 'dangThue' | 'daTraPhong' | 'chuaThue';
  ngayTao: Date | string;
  ngayCapNhat: Date | string;
  // Thông tin mở rộng qua JOIN nếu cần
  phong_id?: number | string;
  maPhong?: string;
}

export interface HopDong {
  id?: number | string;
  maHopDong: string;
  phong_id: number | string;
  maPhong?: string;
  khachThue_id?: number | string;
  nguoiDaiDien_id: number | string;
  tenNguoiDaiDien?: string;
  ngayBatDau: Date | string;
  ngayKetThuc: Date | string;
  giaThue: number;
  tienCoc: number;
  chuKyThanhToan: 'thang' | 'quy' | 'nam';
  ngayThanhToan: number;
  dieuKhoan: string;
  giaDien: number;
  giaNuoc: number;
  chiSoDienBanDau: number;
  chiSoNuocBanDau: number;
  phiDichVu: PhiDichVu[];
  trangThai: 'hoatDong' | 'hetHan' | 'daHuy';
  fileHopDong?: string;
  ngayTao: Date | string;
  ngayCapNhat: Date | string;
}

export interface ChiSoDienNuoc {
  id?: number | string;
  phong_id: number | string;
  maPhong?: string;
  thang: number;
  nam: number;
  chiSoDienCu: number;
  chiSoDienMoi: number;
  soDienTieuThu: number;
  chiSoNuocCu: number;
  chiSoNuocMoi: number;
  soNuocTieuThu: number;
  anhChiSoDien?: string;
  anhChiSoNuoc?: string;
  nguoiGhi_id: number | string;
  ngayGhi: Date | string;
  ngayTao: Date | string;
}

export interface HoaDon {
  id?: number | string;
  maHoaDon: string;
  hopDong_id: number | string;
  maHopDong?: string;
  phong_id: number | string;
  maPhong?: string;
  khachThue_id: number | string;
  tenKhachThue?: string;
  thang: number;
  nam: number;
  tienPhong: number;
  tienDien: number;
  soDien: number;
  chiSoDienBanDau: number;
  chiSoDienCuoiKy: number;
  tienNuoc: number;
  soNuoc: number;
  chiSoNuocBanDau: number;
  chiSoNuocCuoiKy: number;
  phiDichVu: PhiDichVu[];
  tongTien: number;
  daThanhToan: number;
  conLai: number;
  trangThai: 'chuaThanhToan' | 'daThanhToanMotPhan' | 'daThanhToan' | 'quaHan';
  hanThanhToan: Date | string;
  ghiChu?: string;
  ngayTao: Date | string;
  ngayCapNhat: Date | string;
}

export interface ThanhToan {
  id?: number | string;
  hoaDon_id: number | string;
  maHoaDon?: string;
  maPhong?: string;
  soTien: number;
  phuongThuc: 'tienMat' | 'chuyenKhoan' | 'viDienTu';
  thongTinChuyenKhoan?: ThongTinChuyenKhoan;
  thongTinChuyenKhoan_nganHang?: string | null;
  thongTinChuyenKhoan_soGiaoDich?: string | null;
  ngayThanhToan: Date | string;
  nguoiNhan_id: number | string;
  tenNguoiNhan?: string;
  tenNguoiDaiDien?: string;
  hoTen?: string;
  ghiChu?: string;
  anhBienLai?: string;
  ngayTao: Date | string;
}

export interface ThanhToanCreateRequest {
  hoaDon_id: number | string;
  soTien: number;
  phuongThuc: 'tienMat' | 'chuyenKhoan' | 'viDienTu';
  ngayThanhToan: Date | string;
  ghiChu?: string;
  anhBienLai?: string;
  thongTinChuyenKhoan_nganHang?: string | null;
  thongTinChuyenKhoan_soGiaoDich?: string | null;
}

export interface SuCo {
  id?: number | string;
  phong_id: number | string;
  maPhong?: string;
  khachThue_id: number | string;
  tenKhachThue?: string;
  hoTenKhachThue?: string;
  nguoiBao_id?: number | string;
  tenNguoiBao?: string;
  tieuDe: string;
  moTa: string;
  hinhAnh?: string[];
  anhSuCo?: string[];
  loaiSuCo: 'dienNuoc' | 'noiThat' | 'vesinh' | 'anNinh' | 'khac';
  loai?: string;
  mucDo: 'thap' | 'trungBinh' | 'cao' | 'khancap';
  mucDoUuTien?: string;
  trangThai: 'moi' | 'dangXuLy' | 'daXong' | 'daHuy';
  nguoiXuLy_id?: number | string;
  ghiChuXuLy?: string;
  ngayBaoCao: string | Date;
  ngayXuLy?: string | Date;
  ngayHoanThanh?: string | Date;
  ngayTao?: string | Date;
  ngayCapNhat?: string | Date;
}

export interface ThongBao {
  id?: number | string;
  tieuDe: string;
  noiDung: string;
  loaiThongBao: 'chung' | 'hoaDon' | 'suCo' | 'hopDong' | 'khac';
  loai?: string;
  nguoiGui_id: number | string;
  tenNguoiGui?: string;
  nguoiNhan_id?: number | string;
  tenNguoiNhan?: string;
  phong_id?: number | string;
  toaNha_id?: number | string;
  trangThai: 'chuaDoc' | 'daDoc';
  ngayGui: Date | string;
  ngayTao: Date | string;
}

// Types cho API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Types cho form validation
export interface LoginForm {
  email: string;
  matKhau: string;
}

export interface RegisterForm {
  ten: string;
  email: string;
  matKhau: string;
  soDienThoai: string;
  vaiTro: 'admin' | 'chuNha' | 'nhanVien';
}

// Dashboard stats
export interface DashboardStats {
  tongSoPhong: number;
  phongTrong: number;
  phongDangThue: number;
  phongBaoTri: number;
  doanhThuThang: number;
  doanhThuNam: number;
  hoaDonSapDenHan: number;
  suCoCanXuLy: number;
  hopDongSapHetHan: number;
}
