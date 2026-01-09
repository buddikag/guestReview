import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "gss",
  // host: process.env.DB_HOST || "localhost",
  // user: process.env.DB_USER || "root",
  // password: process.env.DB_PASSWORD || "",
  // database: process.env.DB_NAME || "gss_new",

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test pool connection
pool.getConnection()
  .then((connection) => {
// Logger will be initialized after database connection
// Using console.log here to avoid circular dependency
console.log("MySQL pool connected");
    connection.release();
  })
  .catch((err) => {
// Logger will be initialized after database connection
// Using console.error here to avoid circular dependency
console.error("MySQL pool connection error:", err);
  });

export default pool;
