import express from 'express';
import bcrypt from 'bcryptjs';
import { connection } from '../config/database.js';
import { authenticateToken, requireSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all users (super admin only)
router.get('/', authenticateToken, requireSuperAdmin, (req, res) => {
  const query = `
    SELECT u.id, u.username, u.email, u.full_name, u.role, u.status, u.created_at,
           GROUP_CONCAT(h.name SEPARATOR ', ') as hotels
    FROM users u
    LEFT JOIN user_hotels uh ON u.id = uh.user_id
    LEFT JOIN hotels h ON uh.hotel_id = h.id
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `;
  
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ Message: 'Database error' });
    }
    res.json(results);
  });
});

// Get single user (super admin only)
router.get('/:id', authenticateToken, requireSuperAdmin, (req, res) => {
  const userId = req.params.id;
  
  const userQuery = 'SELECT id, username, email, full_name, role, status, created_at FROM users WHERE id = ?';
  connection.query(userQuery, [userId], (err, userResults) => {
    if (err) {
      return res.status(500).json({ Message: 'Database error' });
    }
    
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
    
    connection.query(hotelsQuery, [userId], (err, hotels) => {
      if (err) {
        return res.status(500).json({ Message: 'Database error' });
      }
      
      res.json({
        ...user,
        hotels: hotels
      });
    });
  });
});

// Create new user (super admin only)
router.post('/', authenticateToken, requireSuperAdmin, async (req, res) => {
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
  connection.query(
    'SELECT * FROM users WHERE username = ? OR email = ?',
    [username, email],
    async (err, results) => {
      if (err) {
        return res.status(500).json({ Message: 'Database error' });
      }
      
      if (results.length > 0) {
        return res.status(409).json({ Message: 'Username or email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      const insertQuery = 'INSERT INTO users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)';
      connection.query(
        insertQuery,
        [username, email, hashedPassword, full_name, role],
        (err, result) => {
          if (err) {
            return res.status(500).json({ Message: 'Database error' });
          }

          const userId = result.insertId;

          // Assign hotels if provided
          if (hotelIds && hotelIds.length > 0) {
            const hotelValues = hotelIds.map(hotelId => [userId, hotelId]);
            const hotelQuery = 'INSERT INTO user_hotels (user_id, hotel_id) VALUES ?';
            connection.query(hotelQuery, [hotelValues], (err) => {
              if (err) {
                console.error('Error assigning hotels:', err);
              }
            });
          }

          res.status(201).json({ Message: 'User created successfully', userId });
        }
      );
    }
  );
});

// Update user (super admin only)
router.put('/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  const userId = req.params.id;
  const { username, email, password, full_name, role, hotelIds, status } = req.body;

  // Check if user exists
  connection.query('SELECT * FROM users WHERE id = ?', [userId], async (err, results) => {
    if (err) {
      return res.status(500).json({ Message: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ Message: 'User not found' });
    }

    // Check if username or email already exists (excluding current user)
    if (username || email) {
      connection.query(
        'SELECT * FROM users WHERE (username = ? OR email = ?) AND id != ?',
        [username || '', email || '', userId],
        async (err, checkResults) => {
          if (err) {
            return res.status(500).json({ Message: 'Database error' });
          }
          
          if (checkResults.length > 0) {
            return res.status(409).json({ Message: 'Username or email already exists' });
          }

          await updateUser();
        }
      );
    } else {
      await updateUser();
    }

    async function updateUser() {
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

      connection.query(updateQuery, updateValues, (err) => {
        if (err) {
          return res.status(500).json({ Message: 'Database error' });
        }

        // Update hotel assignments if provided
        if (hotelIds !== undefined) {
          // Delete existing hotel assignments
          connection.query('DELETE FROM user_hotels WHERE user_id = ?', [userId], (err) => {
            if (err) {
              console.error('Error deleting hotel assignments:', err);
            }

            // Insert new hotel assignments
            if (hotelIds.length > 0) {
              const hotelValues = hotelIds.map(hotelId => [userId, hotelId]);
              const hotelQuery = 'INSERT INTO user_hotels (user_id, hotel_id) VALUES ?';
              connection.query(hotelQuery, [hotelValues], (err) => {
                if (err) {
                  console.error('Error assigning hotels:', err);
                }
              });
            }
          });
        }

        res.json({ Message: 'User updated successfully' });
      });
    }
  });
});

// Delete user (soft delete - super admin only)
router.delete('/:id', authenticateToken, requireSuperAdmin, (req, res) => {
  const userId = req.params.id;

  // Prevent deleting yourself
  if (parseInt(userId) === req.user.id) {
    return res.status(400).json({ Message: 'Cannot delete your own account' });
  }

  connection.query('UPDATE users SET status = 0 WHERE id = ?', [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ Message: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ Message: 'User not found' });
    }

    res.json({ Message: 'User deleted successfully' });
  });
});

export default router;

