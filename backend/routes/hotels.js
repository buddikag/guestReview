import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import pool from '../config/database.js';
import { authenticateToken, requireSuperAdmin } from '../middleware/auth.js';
import logger from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/hotels');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'hotel-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only PNG and JPG files
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
    cb(null, true);
  } else {
    cb(new Error('Only PNG and JPG images are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Get all hotels (super admin only, or users can see their assigned hotels)
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'super_admin') {
      // Super admin sees all hotels
      const query = 'SELECT * FROM hotels ORDER BY name';
      const [results] = await pool.execute(query);
      res.json(results);
    } else {
      // Regular users see only their assigned hotels
      const query = `
        SELECT h.* FROM hotels h
        INNER JOIN user_hotels uh ON h.id = uh.hotel_id
        WHERE uh.user_id = ? AND h.status = 1
        ORDER BY h.name
      `;
      const [results] = await pool.execute(query, [req.user.id]);
      res.json(results);
    }
  } catch (err) {
    return res.status(500).json({ Message: 'Database error' });
  }
});

// Create hotel (super admin only)
router.post('/', authenticateToken, requireSuperAdmin, upload.single('logo'), async (req, res) => {
  try {
    const { name, address, phone, email } = req.body;
    let logoPath = null;

    if (!name) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ Message: 'Hotel name is required' });
    }

    // If file was uploaded, save the path
    if (req.file) {
      logoPath = `/uploads/hotels/${req.file.filename}`;
    }

    const query = 'INSERT INTO hotels (name, address, phone, email, logo_path) VALUES (?, ?, ?, ?, ?)';
    const [result] = await pool.execute(query, [name, address || null, phone || null, email || null, logoPath]);
    res.status(201).json({ Message: 'Hotel created successfully', hotelId: result.insertId });
  } catch (err) {
    // Delete uploaded file if database insert fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ Message: 'Database error' });
  }
});

// Update hotel (super admin only)
router.put('/:id', authenticateToken, requireSuperAdmin, upload.single('logo'), async (req, res) => {
  try {
    const hotelId = req.params.id;
    const { name, address, phone, email, status } = req.body;

    // First get the current hotel to check for existing logo
    const [hotelResult] = await pool.execute('SELECT logo_path FROM hotels WHERE id = ?', [hotelId]);

    if (hotelResult.length === 0) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ Message: 'Hotel not found' });
    }

    const oldLogoPath = hotelResult[0].logo_path;
    let logoPath = oldLogoPath; // Keep existing logo if no new one uploaded

    // If new file was uploaded, update logo path and delete old file
    if (req.file) {
      logoPath = `/uploads/hotels/${req.file.filename}`;
      
      // Delete old logo file if it exists
      if (oldLogoPath) {
        const oldFilePath = path.join(__dirname, '..', oldLogoPath);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
    }

    let updateQuery = 'UPDATE hotels SET ';
    const updateValues = [];
    const updateFields = [];

    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (address !== undefined) {
      updateFields.push('address = ?');
      updateValues.push(address);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }
    if (req.file) {
      updateFields.push('logo_path = ?');
      updateValues.push(logoPath);
    }

    if (updateFields.length === 0) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ Message: 'No fields to update' });
    }

    updateQuery += updateFields.join(', ') + ' WHERE id = ?';
    updateValues.push(hotelId);

    const [result] = await pool.execute(updateQuery, updateValues);
    
    if (result.affectedRows === 0) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ Message: 'Hotel not found' });
    }

    res.json({ Message: 'Hotel updated successfully' });
  } catch (err) {
    // Delete uploaded file if database update fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ Message: 'Database error' });
  }
});

// Delete hotel (super admin only)
router.delete('/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const hotelId = req.params.id;

    const [result] = await pool.execute('UPDATE hotels SET status = 0 WHERE id = ?', [hotelId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ Message: 'Hotel not found' });
    }

    res.json({ Message: 'Hotel deleted successfully' });
  } catch (err) {
    return res.status(500).json({ Message: 'Database error' });
  }
});

export default router;

