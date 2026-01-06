import mysql from 'mysql2';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create and export database connection
export const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gss_new',
});

// export const connection = mysql.createConnection({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'u668410136_user',
//   password: process.env.DB_PASSWORD || 'spaceX25@',
//   database: process.env.DB_NAME || 'u668410136_gss',
// });
// Test connection
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

export default connection;

