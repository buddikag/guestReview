import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { authenticateToken, requireSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all users (super admin only)
router.get('/', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.username, u.email, u.full_name, u.role, u.status, u.created_at,
             GROUP_CONCAT(h.name SEPARATOR ', ') as hotels
      FROM users u
      LEFT JOIN user_hotels uh ON u.id = uh.user_id
      LEFT JOIN hotels h ON uh.hotel_id = h.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `;
    
    const [results] = await pool.execute(query);
    res.json(results);
  } catch (err) {
    return res.status(500).json({ Message: 'Database error' });
  }
});

// Get single user (super admin only)
router.get('/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    const userQuery = 'SELECT id, username, email, full_name, role, status, created_at FROM users WHERE id = ?';
    const [userResults] = await pool.execute(userQuery, [userId]);
    
    if (userResults.length === 0) {
      return res.status(404).json({ Message: 'User not found' });
    }

    const user = userResults[0];

    // Get user's hotels
    const hotelsQuery = `
      SELECT h.* FROM hotels h
      INNER JOIN user_hotels uh ON h.id = uh.hotel_id
      WHERE uh.user_id = ?
    `;
    
    const [hotels] = await pool.execute(hotelsQuery, [userId]);
    
    res.json({
      ...user,
      hotels: hotels
    });
  } catch (err) {
    return res.status(500).json({ Message: 'Database error' });
  }
});

// Create new user (super admin only)
router.post('/', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { username, email, password, full_name, role, hotelIds } = req.body;

    if (!username || !email || !password || !full_name || !role) {
      return res.status(400).json({ Message: 'All fields are required' });
    }

    // Validate role
    const validRoles = ['super_admin', 'admin', 'manager', 'staff'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ Message: 'Invalid role' });
    }

    // Check if username or email already exists
    const [results] = await pool.execute(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (results.length > 0) {
      return res.status(409).json({ Message: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const insertQuery = 'INSERT INTO users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)';
    const [result] = await pool.execute(
      insertQuery,
      [username, email, hashedPassword, full_name, role]
    );

    const userId = result.insertId;

    // Assign hotels if provided
    if (hotelIds && hotelIds.length > 0) {
      const hotelValues = hotelIds.map(hotelId => [userId, hotelId]);
      const hotelQuery = 'INSERT INTO user_hotels (user_id, hotel_id) VALUES ?';
      try {
        await pool.query(hotelQuery, [hotelValues]);
      } catch (err) {
        console.error('Error assigning hotels:', err);
      }
    }

    res.status(201).json({ Message: 'User created successfully', userId });
  } catch (err) {
    return res.status(500).json({ Message: 'Database error' });
  }
});

// Update user (super admin only)
router.put('/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, password, full_name, role, hotelIds, status } = req.body;

    // Check if user exists
    const [results] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (results.length === 0) {
      return res.status(404).json({ Message: 'User not found' });
    }

    // Check if username or email already exists (excluding current user)
    if (username || email) {
      const [checkResults] = await pool.execute(
        'SELECT * FROM users WHERE (username = ? OR email = ?) AND id != ?',
        [username || '', email || '', userId]
      );
      
      if (checkResults.length > 0) {
        return res.status(409).json({ Message: 'Username or email already exists' });
      }
    }

    let updateQuery = 'UPDATE users SET ';
    const updateValues = [];
    const updateFields = [];

    if (username) {
      updateFields.push('username = ?');
      updateValues.push(username);
    }
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (full_name) {
      updateFields.push('full_name = ?');
      updateValues.push(full_name);
    }
    if (role) {
      if (!['super_admin', 'admin', 'manager', 'staff'].includes(role)) {
        return res.status(400).json({ Message: 'Invalid role' });
      }
      updateFields.push('role = ?');
      updateValues.push(role);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ Message: 'No fields to update' });
    }

    updateQuery += updateFields.join(', ') + ' WHERE id = ?';
    updateValues.push(userId);

    await pool.execute(updateQuery, updateValues);

    // Update hotel assignments if provided
    if (hotelIds !== undefined) {
      // Delete existing hotel assignments
      try {
        await pool.execute('DELETE FROM user_hotels WHERE user_id = ?', [userId]);
      } catch (err) {
        console.error('Error deleting hotel assignments:', err);
      }

      // Insert new hotel assignments
      if (hotelIds.length > 0) {
        const hotelValues = hotelIds.map(hotelId => [userId, hotelId]);
        const hotelQuery = 'INSERT INTO user_hotels (user_id, hotel_id) VALUES ?';
        try {
          await pool.query(hotelQuery, [hotelValues]);
        } catch (err) {
          console.error('Error assigning hotels:', err);
        }
      }
    }

    res.json({ Message: 'User updated successfully' });
  } catch (err) {
    return res.status(500).json({ Message: 'Database error' });
  }
});

// Delete user (soft delete - super admin only)
router.delete('/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent deleting yourself
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ Message: 'Cannot delete your own account' });
    }

    const [result] = await pool.execute('UPDATE users SET status = 0 WHERE id = ?', [userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ Message: 'User not found' });
    }

    res.json({ Message: 'User deleted successfully' });
  } catch (err) {
    return res.status(500).json({ Message: 'Database error' });
  }
});

export default router;

