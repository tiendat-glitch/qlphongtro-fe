
## 🚀 Tính năng chính

### 📊 Dashboard
- Thống kê tổng quan về phòng, doanh thu, hóa đơn
- Biểu đồ doanh thu theo tháng
- Danh sách hóa đơn sắp đến hạn
- Danh sách sự cố cần xử lý
- Hợp đồng sắp hết hạn

### 🏢 Quản lý tòa nhà
- CRUD thông tin tòa nhà
- Upload ảnh tòa nhà
- Quản lý tiện ích chung
- Xem danh sách phòng theo tòa nhà

### 🏠 Quản lý phòng
- CRUD thông tin phòng
- Upload ảnh phòng
- Lọc phòng theo trạng thái
- Xem lịch sử thuê phòng
- Quản lý tiện nghi phòng

### 👥 Quản lý khách thuê
- CRUD thông tin khách thuê
- Upload ảnh CCCD
- Lịch sử thuê phòng
- Lịch sử thanh toán

### 📄 Quản lý hợp đồng
- Tạo hợp đồng mới
- Upload file hợp đồng PDF
- Gia hạn hợp đồng
- Chấm dứt hợp đồng
- In hợp đồng

### ⚡ Quản lý chỉ số điện nước
- Ghi chỉ số hàng tháng
- Upload ảnh chỉ số
- Tự động tính tiêu thụ
- Lịch sử chỉ số

### 🧾 Quản lý hóa đơn
- Tạo hóa đơn tự động theo chu kỳ
- Tính toán tự động: tiền điện, nước, dịch vụ
- Gửi thông báo hóa đơn
- In hóa đơn
- Xuất báo cáo Excel

### 💰 Quản lý thanh toán
- Ghi nhận thanh toán
- Upload biên lai
- Lịch sử thanh toán
- Xuất phiếu thu

### 🚨 Quản lý sự cố
- Khách thuê báo cáo sự cố
- Phân loại và ưu tiên sự cố
- Theo dõi tiến độ xử lý
- Upload ảnh sự cố

### 🔔 Thông báo
- Gửi thông báo đến khách thuê
- Thông báo theo phòng/tòa nhà
- Lịch sử thông báo

### ⚙️ Cài đặt hệ thống
- Quản lý người dùng
- Cấu hình hệ thống
- Sao lưu và khôi phục dữ liệu
- Cài đặt thông báo

 Cấu hình Cloudinary (để upload ảnh)

1. Đăng ký tài khoản miễn phí tại: https://cloudinary.com/
2. Vào Dashboard, lấy:
   - **Cloud Name**: Điền vào `NEXT_PUBLIC_CLOUD_NAME`
   - **Upload Preset**: 
     - Vào Settings → Upload
     - Tạo Upload Preset mới (unsigned)
     - Copy tên preset vào `NEXT_PUBLIC_UPLOAD_PRESET`

### Bước 5: Chạy ứng dụng

#### 5.1. Khởi động Development Server

```bash
npm run dev
```

Đợi vài giây cho đến khi thấy thông báo:
```
✓ Ready in 3.2s
○ Local:   http://localhost:3000
```

#### 5.2. Truy cập ứng dụng

Mở trình duyệt và truy cập: **http://localhost:3000**

## 📊 Database Schema

Hệ thống sử dụng MongoDB với các collection chính:

- **NguoiDung**: Quản lý người dùng (admin, chủ nhà, nhân viên)
- **ToaNha**: Thông tin tòa nhà
- **Phong**: Thông tin phòng trọ
- **KhachThue**: Thông tin khách thuê
- **HopDong**: Hợp đồng thuê phòng
- **ChiSoDienNuoc**: Chỉ số điện nước hàng tháng
- **HoaDon**: Hóa đơn thanh toán
- **ThanhToan**: Giao dịch thanh toán
- **SuCo**: Báo cáo sự cố
- **ThongBao**: Thông báo hệ thống

## 🔐 Authentication

Hệ thống sử dụng NextAuth.js với:
- JWT tokens
- Session management
- Role-based access control (admin, chủ nhà, nhân viên)
- Protected routes

## 📱 Responsive Design

- Mobile-first approach
- Sidebar collapse trên mobile
- Bảng responsive với horizontal scroll
- Form stack trên mobile

## 📝 API Documentation

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/[...nextauth]` - Đăng nhập

### Tòa nhà
- `GET /api/toa-nha` - Lấy danh sách tòa nhà
- `POST /api/toa-nha` - Tạo tòa nhà mới
- `GET /api/toa-nha/[id]` - Lấy thông tin tòa nhà
- `PUT /api/toa-nha/[id]` - Cập nhật tòa nhà
- `DELETE /api/toa-nha/[id]` - Xóa tòa nhà

### Phòng
- `GET /api/phong` - Lấy danh sách phòng
- `POST /api/phong` - Tạo phòng mới
- `GET /api/phong/[id]` - Lấy thông tin phòng
- `PUT /api/phong/[id]` - Cập nhật phòng
- `DELETE /api/phong/[id]` - Xóa phòng

### Khách thuê
- `GET /api/khach-thue` - Lấy danh sách khách thuê
- `POST /api/khach-thue` - Tạo khách thuê mới
- `GET /api/khach-thue/[id]` - Lấy thông tin khách thuê
- `PUT /api/khach-thue/[id]` - Cập nhật khách thuê
- `DELETE /api/khach-thue/[id]` - Xóa khách thuê

### Hợp đồng
- `GET /api/hop-dong` - Lấy danh sách hợp đồng
- `POST /api/hop-dong` - Tạo hợp đồng mới
- `GET /api/hop-dong/[id]` - Lấy thông tin hợp đồng
- `PUT /api/hop-dong/[id]` - Cập nhật hợp đồng
- `DELETE /api/hop-dong/[id]` - Xóa hợp đồng

### Chỉ số điện nước
- `GET /api/chi-so-dien-nuoc` - Lấy danh sách chỉ số
- `POST /api/chi-so-dien-nuoc` - Ghi chỉ số mới

### Hóa đơn
- `GET /api/hoa-don` - Lấy danh sách hóa đơn
- `POST /api/hoa-don` - Tạo hóa đơn mới

### Thanh toán
- `GET /api/thanh-toan` - Lấy danh sách thanh toán
- `POST /api/thanh-toan` - Ghi nhận thanh toán

### Sự cố
- `GET /api/su-co` - Lấy danh sách sự cố
- `POST /api/su-co` - Báo cáo sự cố
- `GET /api/su-co/[id]` - Lấy thông tin sự cố
- `PUT /api/su-co/[id]` - Cập nhật sự cố
- `DELETE /api/su-co/[id]` - Xóa sự cố

### Thông báo
- `GET /api/thong-bao` - Lấy danh sách thông báo
- `POST /api/thong-bao` - Gửi thông báo

### Dashboard
- `GET /api/dashboard/stats` - Lấy thống kê dashboard

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [NextAuth.js](https://next-auth.js.org/)