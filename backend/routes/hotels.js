import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import { connection } from '../config/database.js';
import { authenticateToken, requireSuperAdmin } from '../middleware/auth.js';

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
router.get('/', authenticateToken, (req, res) => {
  if (req.user.role === 'super_admin') {
    // Super admin sees all hotels
    const query = 'SELECT * FROM hotels ORDER BY name';
    connection.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ Message: 'Database error' });
      }
      res.json(results);
    });
  } else {
    // Regular users see only their assigned hotels
    const query = `
      SELECT h.* FROM hotels h
      INNER JOIN user_hotels uh ON h.id = uh.hotel_id
      WHERE uh.user_id = ? AND h.status = 1
      ORDER BY h.name
    `;
    connection.query(query, [req.user.id], (err, results) => {
      if (err) {
        return res.status(500).json({ Message: 'Database error' });
      }
      res.json(results);
    });
  }
});

// Create hotel (super admin only)
router.post('/', authenticateToken, requireSuperAdmin, upload.single('logo'), (req, res) => {
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
  connection.query(query, [name, address || null, phone || null, email || null, logoPath], (err, result) => {
    if (err) {
      // Delete uploaded file if database insert fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(500).json({ Message: 'Database error' });
    }
    res.status(201).json({ Message: 'Hotel created successfully', hotelId: result.insertId });
  });
});

// Update hotel (super admin only)
router.put('/:id', authenticateToken, requireSuperAdmin, upload.single('logo'), (req, res) => {
  const hotelId = req.params.id;
  const { name, address, phone, email, status } = req.body;

  // First get the current hotel to check for existing logo
  connection.query('SELECT logo_path FROM hotels WHERE id = ?', [hotelId], (err, hotelResult) => {
    if (err) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(500).json({ Message: 'Database error' });
    }

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

    connection.query(updateQuery, updateValues, (err, result) => {
      if (err) {
        // Delete uploaded file if database update fails
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({ Message: 'Database error' });
      }
      
      if (result.affectedRows === 0) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ Message: 'Hotel not found' });
      }

      res.json({ Message: 'Hotel updated successfully' });
    });
  });
});

// Delete hotel (super admin only)
router.delete('/:id', authenticateToken, requireSuperAdmin, (req, res) => {
  const hotelId = req.params.id;

  connection.query('UPDATE hotels SET status = 0 WHERE id = ?', [hotelId], (err, result) => {
    if (err) {
      return res.status(500).json({ Message: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ Message: 'Hotel not found' });
    }

    res.json({ Message: 'Hotel deleted successfully' });
  });
});

export default router;

