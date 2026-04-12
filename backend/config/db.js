const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

const dbPort = Number(process.env.DB_PORT || 3306);
if (!Number.isInteger(dbPort) || dbPort <= 0) {
  throw new Error("DB_PORT khong hop le. Vui long kiem tra bien moi truong.");
}

const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_NAME"];
const missingEnvVars = requiredEnvVars.filter((key) => {
  const value = process.env[key];
  return typeof value !== "string" || value.trim() === "";
});

if (missingEnvVars.length > 0) {
  throw new Error(
    `Thieu bien moi truong bat buoc cho ket noi DB: ${missingEnvVars.join(", ")}`,
  );
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME,
  port: dbPort,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const checkConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(
      `Ket noi MySQL thanh cong: ${process.env.DB_HOST}:${dbPort}/${process.env.DB_NAME}`,
    );
    connection.release();
  } catch (error) {
    console.error("Loi ket noi MySQL:");
    console.error(`Status: ${error.code} (${error.errno})`);
    console.error(`Message: ${error.sqlMessage || error.message}`);
    console.log("\nVui long kiem tra lai DB_USER, DB_PASSWORD va DB_NAME trong file .env");
    process.exit(1);
  }
};

module.exports = {
  pool,
  checkConnection,
};
