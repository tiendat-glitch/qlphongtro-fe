const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { checkConnection } = require("./config/db");

// Tải biến môi trường
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Phong Tro API (Node.js + MySQL)" });
});

// Import Routes
const authRoutes = require("./routes/authRoutes");
const toaNhaRoutes = require("./routes/toaNhaRoutes");
const phongRoutes = require("./routes/phongRoutes");
const publicPhongRoutes = require("./routes/publicPhongRoutes");
const khachThueRoutes = require("./routes/khachThueRoutes");
const hopDongRoutes = require("./routes/hopDongRoutes");
const hoaDonRoutes = require("./routes/hoaDonRoutes");
const chiSoDienNuocRoutes = require("./routes/chiSoDienNuocRoutes");
const thanhToanRoutes = require("./routes/thanhToanRoutes");
const suCoRoutes = require("./routes/suCoRoutes");
const thongBaoRoutes = require("./routes/thongBaoRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/toa-nha", toaNhaRoutes);
app.use("/api/public/phong", publicPhongRoutes);
app.use("/api/phong", phongRoutes);
app.use("/api/khach-thue", khachThueRoutes);
app.use("/api/hop-dong", hopDongRoutes);
app.use("/api/hoa-don", hoaDonRoutes);
app.use("/api/chi-so-dien-nuoc", chiSoDienNuocRoutes);
app.use("/api/thanh-toan", thanhToanRoutes);
app.use("/api/su-co", suCoRoutes);
app.use("/api/thong-bao", thongBaoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Xử lý lỗi chung
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Lỗi server nội bộ !",
  });
});

// Khởi động server
app.listen(PORT, async () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
  // Kiểm tra kết nối DB khi server start
  await checkConnection();
});
