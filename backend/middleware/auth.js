import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'gss_2026_secret_key_change_in_production';

// Authentication middleware
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ Message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ Message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Authorization middleware - check if user is super admin
export const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ Message: 'Super admin access required' });
  }
  next();
};

// Authorization middleware - check if user has required role
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ Message: 'Insufficient permissions' });
    }
    next();
  };
};

// Check if user has access to a specific hotel
export const checkHotelAccess = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const hotelId = req.body.hotelId || req.params.hotelId || req.query.hotelId;

    // Super admin has access to all hotels
    if (req.user.role === 'super_admin') {
      return next();
    }

    if (!hotelId) {
      return res.status(400).json({ Message: 'Hotel ID required' });
    }

    const query = `
      SELECT * FROM user_hotels 
      WHERE user_id = ? AND hotel_id = ?
    `;

    const [results] = await pool.execute(query, [userId, hotelId]);
    if (results.length === 0) {
      return res.status(403).json({ Message: 'Access denied to this hotel' });
    }
    next();
  } catch (err) {
    return res.status(500).json({ Message: 'Database error' });
  }
};

export { JWT_SECRET };

