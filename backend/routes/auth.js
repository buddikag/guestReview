import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { authenticateToken, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ Message: 'Username and password are required' });
    }

    const query = 'SELECT * FROM users WHERE (username = ? OR email = ?) AND status = 1';
    const [results] = await pool.execute(query, [username, username]);

    if (results.length === 0) {
      return res.status(401).json({ Message: 'Invalid credentials' });
    }

    const user = results[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      // If password doesn't match bcrypt, check if it's the default plain text (for initial setup)
      if (password === 'admin123' && user.password.includes('$2b$10$rOzJqJqJqJqJqJqJqJqJqOeJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq')) {
        // Hash the password and update it
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
      } else {
        return res.status(401).json({ Message: 'Invalid credentials' });
      }
    }

    // Get user's hotels
    const hotelsQuery = `
      SELECT h.* FROM hotels h
      INNER JOIN user_hotels uh ON h.id = uh.hotel_id
      WHERE uh.user_id = ? AND h.status = 1
    `;
    
    const [hotels] = await pool.execute(hotelsQuery, [user.id]);

    const token = generateToken(user);
    
    res.json({
      Message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        hotels: hotels
      }
    });
  } catch (err) {
    return res.status(500).json({ Message: err.message });
  }
});

// Get current user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = 'SELECT id, username, email, full_name, role, status FROM users WHERE id = ?';
    const [results] = await pool.execute(query, [userId]);

    if (results.length === 0) {
      return res.status(404).json({ Message: 'User not found' });
    }

    // Get user's hotels
    const hotelsQuery = `
      SELECT h.* FROM hotels h
      INNER JOIN user_hotels uh ON h.id = uh.hotel_id
      WHERE uh.user_id = ? AND h.status = 1
    `;
    
    const [hotels] = await pool.execute(hotelsQuery, [userId]);

    res.json({
      ...results[0],
      hotels: hotels
    });
  } catch (err) {
    return res.status(500).json({ Message: err.message });
  }
});

// Logout route (client-side token removal, but we can track it here if needed)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({ Message: 'Logout successful' });
});

export default router;

