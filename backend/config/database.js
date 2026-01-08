import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  // host: process.env.DB_HOST || "localhost",
  // user: process.env.DB_USER || "u668410136_user",
  // password: process.env.DB_PASSWORD || "spaceX25@",
  // database: process.env.DB_NAME || "u668410136_gss",
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "gss_new",

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test pool connection
pool.getConnection()
  .then((connection) => {
    console.log("MySQL pool connected");
    connection.release();
  })
  .catch((err) => {
    console.error("MySQL pool connection error:", err);
  });

export default pool;
