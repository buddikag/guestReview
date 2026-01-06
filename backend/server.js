import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import cors from "cors";
import pool from './config/database.js';
import { authenticateToken } from './middleware/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
app.use(cors()); // for allowing cross-origin requests from frontend to backend server.It is a middleware function.
app.use(express.json()); // for parsing application/json

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import the router from a separate file (e.g., './userRoutes.js')
import simpleWtStarRoutes from './simpleWtStar.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import hotelRoutes from './routes/hotels.js';

// Mount the routers
app.use('/simplewtstar', simpleWtStarRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hotels', hotelRoutes);

app.listen(port, () => {
  console.log(`Server listening on port : ${port}`);
});

// Helper function to get user's hotel IDs
const getUserHotelIds = async (userId, role) => {
  if (role === 'super_admin') {
    // Super admin can see all hotels
    return null;
  }
  
  try {
    const [results] = await pool.execute('SELECT hotel_id FROM user_hotels WHERE user_id = ?', [userId]);
    return results.map(r => r.hotel_id);
  } catch (err) {
    throw err;
  }
};

app.get("/", authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const userId = req.user.id;
    const userRole = req.user.role;

    const hotelIds = await getUserHotelIds(userId, userRole);

    let countQuery, query;
    let queryParams = [];
    
    if (userRole === 'super_admin') {
      // Super admin sees all guests
      countQuery = "SELECT COUNT(*) AS count FROM guest WHERE status = 1";
      query = `
        SELECT g.*, h.name as hotel_name 
        FROM guest g 
        LEFT JOIN hotels h ON g.hotel_id = h.id 
        WHERE g.status = 1 
        ORDER BY g.id DESC 
        LIMIT ? OFFSET ?
      `;
      queryParams = [limit, offset];
    } else {
      // Regular users see only guests from their hotels
      if (!hotelIds || hotelIds.length === 0) {
        return res.json({ data: [], totalRecords: 0, totalPages: 0 });
      }
      const placeholders = hotelIds.map(() => '?').join(',');
      countQuery = `SELECT COUNT(*) AS count FROM guest WHERE status = 1 AND hotel_id IN (${placeholders})`;
      query = `
        SELECT g.*, h.name as hotel_name 
        FROM guest g 
        LEFT JOIN hotels h ON g.hotel_id = h.id 
        WHERE g.status = 1 AND g.hotel_id IN (${placeholders})
        ORDER BY g.id DESC 
        LIMIT ? OFFSET ?
      `;
      queryParams = [...hotelIds, limit, offset];
    }

    const [countResult] = await pool.execute(countQuery, userRole === 'super_admin' ? [] : hotelIds);
    const totalRecords = countResult[0].count;
    const totalPages = Math.ceil(totalRecords / limit);
    
    const [result] = await pool.execute(query, queryParams);
    return res.json({ data: result, totalRecords, totalPages });
  } catch (err) {
    return res.status(500).json({ Message: 'Database error' });
  }
});

app.get("/getGuest/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    const hotelIds = await getUserHotelIds(userId, userRole);

    let query = `
      SELECT g.*, h.name as hotel_name 
      FROM guest g 
      LEFT JOIN hotels h ON g.hotel_id = h.id 
      WHERE g.id = ?
    `;
    let queryParams = [id];

    if (userRole !== 'super_admin') {
      if (!hotelIds || hotelIds.length === 0) {
        return res.status(403).json({ Message: 'Access denied' });
      }
      const placeholders = hotelIds.map(() => '?').join(',');
      query += ` AND g.hotel_id IN (${placeholders})`;
      queryParams = [id, ...hotelIds];
    }

    const [result] = await pool.execute(query, queryParams);
    if (result.length === 0) return res.status(404).json({ Message: "Guest not found" });
    return res.json(result[0]);
  } catch (err) {
    return res.status(500).json({ Message: 'Database error' });
  }
});

app.put("/update/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const { name, phone, email, startDate, endDate, roomNumber } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!name || !phone || !email || !startDate || !endDate || !roomNumber) {
      return res.status(400).json({ Message: "All fields are required" });
    }

    // First check if user has access to this guest
    const hotelIds = await getUserHotelIds(userId, userRole);

    const [guestResult] = await pool.execute("SELECT hotel_id FROM guest WHERE id = ? AND status = 1", [id]);
    if (guestResult.length === 0) return res.status(404).json({ Message: "Guest not found" });

    const guestHotelId = guestResult[0].hotel_id;

    // Check access
    if (userRole !== 'super_admin') {
      if (!hotelIds || !hotelIds.includes(guestHotelId)) {
        return res.status(403).json({ Message: "Access denied to this guest" });
      }
    }

    // Check for duplicate email
    const [emailResult] = await pool.execute("SELECT * FROM guest WHERE email = ? AND id != ? AND status = 1", [email, id]);
    if (emailResult.length > 0) return res.status(409).json({ Message: "Email already exists" });
    
    // Check for duplicate phone
    const [phoneResult] = await pool.execute("SELECT * FROM guest WHERE phone = ? AND id != ? AND status = 1", [phone, id]);
    if (phoneResult.length > 0) return res.status(409).json({ Message: "Phone already exists" });
    
    const query = "UPDATE guest SET name = ?, phone = ?, email = ?, startDate = ?, endDate = ?, roomNumber = ? WHERE id = ?";
    const [result] = await pool.execute(query, [name, phone, email, startDate, endDate, roomNumber, id]);
    if (result.affectedRows === 0) return res.status(404).json({ Message: "Guest not found" });
    return res.json({ Message: "Guest updated successfully" });
  } catch (err) {
    return res.status(500).json({ Message: 'Database error' });
  }
});

app.put("/delete/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if user has access to this guest
    const hotelIds = await getUserHotelIds(userId, userRole);

    const [guestResult] = await pool.execute("SELECT hotel_id FROM guest WHERE id = ? AND status = 1", [id]);
    if (guestResult.length === 0) return res.status(404).json({ Message: "Guest not found" });

    const guestHotelId = guestResult[0].hotel_id;

    // Check access
    if (userRole !== 'super_admin') {
      if (!hotelIds || !hotelIds.includes(guestHotelId)) {
        return res.status(403).json({ Message: "Access denied to this guest" });
      }
    }

    const [result] = await pool.execute("UPDATE guest SET status = 9 WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ Message: "Guest not found" });
    return res.json({ Message: "Guest deleted successfully" });
  } catch (err) {
    return res.status(500).json({ Message: 'Database error' });
  }
});
app.post("/add", authenticateToken, async (req, res) => {
  try {
    const { name, phone, email, startDate, endDate, roomNumber, hotelId } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!name || !phone || !email || !startDate || !endDate || !roomNumber || !hotelId) {
      return res.status(400).json({ Message: "All fields including hotel are required" });
    }

    // Verify user has access to the selected hotel
    const hotelIds = await getUserHotelIds(userId, userRole);

    if (userRole !== 'super_admin') {
      if (!hotelIds || !hotelIds.includes(parseInt(hotelId))) {
        return res.status(403).json({ Message: "Access denied to this hotel" });
      }
    }

    // Check for duplicate email
    const [emailResult] = await pool.execute("SELECT * FROM guest WHERE email = ? AND status = 1", [email]);
    if (emailResult.length > 0) return res.status(409).json({ Message: "Email already exists" });

    // Check for duplicate phone
    const [phoneResult] = await pool.execute("SELECT * FROM guest WHERE phone = ? AND status = 1", [phone]);
    if (phoneResult.length > 0) return res.status(409).json({ Message: "Phone already exists" });

    const query = "INSERT INTO guest (name, phone, email, startDate, endDate, roomNumber, hotel_id) VALUES (?,?,?,?,?,?,?)";
    await pool.execute(query, [name, phone, email, startDate, endDate, roomNumber, hotelId]);
    return res.json({ Message: "Guest added successfully" });
  } catch (err) {
    return res.status(500).json({ Message: 'Database error' });
  }
});