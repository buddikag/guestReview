import express from 'express';
import axios from 'axios';
import pool from '../config/database.js';
import { authenticateToken, requireSuperAdmin } from '../middleware/auth.js';
import { sendFeedbackEmail } from '../services/emailService.js';
import logger from '../config/logger.js';

const router = express.Router();

// Get SMTP settings for a hotel
router.get('/smtp/:hotelId', authenticateToken, async (req, res) => {
  try {
    const hotelId = req.params.hotelId;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check access
    if (userRole !== 'super_admin') {
      const [userHotels] = await pool.execute(
        'SELECT hotel_id FROM user_hotels WHERE user_id = ? AND hotel_id = ?',
        [userId, hotelId]
      );
      if (userHotels.length === 0) {
        return res.status(403).json({ Message: 'Access denied' });
      }
    }

    const [result] = await pool.execute(
      'SELECT id, hotel_id, smtp_host, smtp_port, smtp_secure, smtp_user, from_email, from_name, status FROM hotel_smtp_settings WHERE hotel_id = ?',
      [hotelId]
    );

    if (result.length === 0) {
      return res.json(null);
    }

    // Don't return password
    const settings = result[0];
    delete settings.smtp_password;

    res.json(settings);
  } catch (err) {
    logger.error('Error fetching SMTP settings', { error: err.message, stack: err.stack });
    res.status(500).json({ Message: 'Database error' });
  }
});

// Create or update SMTP settings for a hotel
router.post('/smtp/:hotelId', authenticateToken, async (req, res) => {
  try {
    const hotelId = req.params.hotelId;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { smtp_host, smtp_port, smtp_secure, smtp_user, smtp_password, from_email, from_name } = req.body;

    // Validate input
    if (!smtp_host || !smtp_port || !smtp_user || !smtp_password || !from_email || !from_name) {
      return res.status(400).json({ Message: 'All SMTP fields are required' });
    }

    // Check access
    if (userRole !== 'super_admin') {
      const [userHotels] = await pool.execute(
        'SELECT hotel_id FROM user_hotels WHERE user_id = ? AND hotel_id = ?',
        [userId, hotelId]
      );
      if (userHotels.length === 0) {
        return res.status(403).json({ Message: 'Access denied' });
      }
    }

    // Check if hotel exists
    const [hotelResult] = await pool.execute('SELECT id FROM hotels WHERE id = ?', [hotelId]);
    if (hotelResult.length === 0) {
      return res.status(404).json({ Message: 'Hotel not found' });
    }

    // Check if settings exist
    const [existing] = await pool.execute(
      'SELECT id FROM hotel_smtp_settings WHERE hotel_id = ?',
      [hotelId]
    );

    if (existing.length > 0) {
      // Update existing
      await pool.execute(
        `UPDATE hotel_smtp_settings 
         SET smtp_host = ?, smtp_port = ?, smtp_secure = ?, smtp_user = ?, 
             smtp_password = ?, from_email = ?, from_name = ?, updated_at = NOW()
         WHERE hotel_id = ?`,
        [smtp_host, smtp_port, smtp_secure ? 1 : 0, smtp_user, smtp_password, from_email, from_name, hotelId]
      );
      logger.info('SMTP settings updated', { hotelId, userId });
      res.json({ Message: 'SMTP settings updated successfully' });
    } else {
      // Create new
      await pool.execute(
        `INSERT INTO hotel_smtp_settings 
         (hotel_id, smtp_host, smtp_port, smtp_secure, smtp_user, smtp_password, from_email, from_name)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [hotelId, smtp_host, smtp_port, smtp_secure ? 1 : 0, smtp_user, smtp_password, from_email, from_name]
      );
      logger.info('SMTP settings created', { hotelId, userId });
      res.json({ Message: 'SMTP settings created successfully' });
    }
  } catch (err) {
    logger.error('Error saving SMTP settings', { error: err.message, stack: err.stack });
    res.status(500).json({ Message: 'Database error' });
  }
});

// Get email template for a hotel
router.get('/template/:hotelId', authenticateToken, async (req, res) => {
  try {
    const hotelId = req.params.hotelId;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check access
    if (userRole !== 'super_admin') {
      const [userHotels] = await pool.execute(
        'SELECT hotel_id FROM user_hotels WHERE user_id = ? AND hotel_id = ?',
        [userId, hotelId]
      );
      if (userHotels.length === 0) {
        return res.status(403).json({ Message: 'Access denied' });
      }
    }

    const [result] = await pool.execute(
      'SELECT * FROM hotel_email_templates WHERE hotel_id = ? AND status = 1 ORDER BY id DESC LIMIT 1',
      [hotelId]
    );

    if (result.length === 0) {
      return res.json(null);
    }

    res.json(result[0]);
  } catch (err) {
    logger.error('Error fetching email template', { error: err.message, stack: err.stack });
    res.status(500).json({ Message: 'Database error' });
  }
});

// Create or update email template for a hotel
router.post('/template/:hotelId', authenticateToken, async (req, res) => {
  try {
    const hotelId = req.params.hotelId;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { subject, body_html, body_text } = req.body;

    // Validate input
    if (!subject || !body_html) {
      return res.status(400).json({ Message: 'Subject and HTML body are required' });
    }

    // Check access
    if (userRole !== 'super_admin') {
      const [userHotels] = await pool.execute(
        'SELECT hotel_id FROM user_hotels WHERE user_id = ? AND hotel_id = ?',
        [userId, hotelId]
      );
      if (userHotels.length === 0) {
        return res.status(403).json({ Message: 'Access denied' });
      }
    }

    // Check if hotel exists
    const [hotelResult] = await pool.execute('SELECT id FROM hotels WHERE id = ?', [hotelId]);
    if (hotelResult.length === 0) {
      return res.status(404).json({ Message: 'Hotel not found' });
    }

    // Deactivate old templates
    await pool.execute(
      'UPDATE hotel_email_templates SET status = 0 WHERE hotel_id = ?',
      [hotelId]
    );

    // Create new template
    await pool.execute(
      `INSERT INTO hotel_email_templates (hotel_id, subject, body_html, body_text)
       VALUES (?, ?, ?, ?)`,
      [hotelId, subject, body_html, body_text || null]
    );

    logger.info('Email template saved', { hotelId, userId });
    res.json({ Message: 'Email template saved successfully' });
  } catch (err) {
    logger.error('Error saving email template', { error: err.message, stack: err.stack });
    res.status(500).json({ Message: 'Database error' });
  }
});

// Send feedback email to guest
router.post('/send/:guestId', authenticateToken, async (req, res) => {
  try {
    const guestId = req.params.guestId;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get guest information
    const [guestResult] = await pool.execute(
      'SELECT * FROM guest WHERE id = ?',
      [guestId]
    );

    if (guestResult.length === 0) {
      return res.status(404).json({ Message: 'Guest not found' });
    }

    const guest = guestResult[0];

    // Check access
    if (userRole !== 'super_admin') {
      const hotelIds = await getUserHotelIds(userId, userRole);
      if (!hotelIds || hotelIds.length === 0 || !hotelIds.includes(guest.hotel_id)) {
        return res.status(403).json({ Message: 'Access denied' });
      }
    }

    // Generate token for feedback link
    // Backend API URL for token generation
    const backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    // Frontend URL for feedback links in emails (should match VITE_BASE_URL)
    // const frontendUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
    const frontendUrl = process.env.FRONTEND_BASE_URL || 'https://guest.creative-2.com';
    
    // Call backend API to generate token
    const tokenResponse = await axios.post(
      `${backendUrl}/simplewtstar/generateReviewToken`,
      {
        userId: guestId,
        hotelId: guest.hotel_id
      }
    );

    const token = tokenResponse.data;
    // Use frontend URL for the feedback link that goes in the email
    const feedbackLink = `${frontendUrl}/simplewtstar/review?token=${token}`;

    // Send email (use frontend URL for base_url in email templates)
    const result = await sendFeedbackEmail(guest.hotel_id, guestId, feedbackLink, frontendUrl);

    res.json({
      Message: 'Email sent successfully',
      emailLogId: result.emailLogId
    });
  } catch (err) {
    logger.error('Error sending email', { error: err.message, stack: err.stack });
    res.status(500).json({ Message: err.message || 'Failed to send email' });
  }
});

// Helper function to get user's hotel IDs
const getUserHotelIds = async (userId, role) => {
  if (role === 'super_admin') {
    return null; // Super admin has access to all hotels
  }
  try {
    const [result] = await pool.execute(
      'SELECT hotel_id FROM user_hotels WHERE user_id = ?',
      [userId]
    );
    return result.map(row => row.hotel_id);
  } catch (err) {
    throw err;
  }
};

// Get email logs for a hotel
router.get('/logs/:hotelId', authenticateToken, async (req, res) => {
  try {
    const hotelId = req.params.hotelId;
    const userId = req.user.id;
    const userRole = req.user.role;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Check access
    if (userRole !== 'super_admin') {
      const [userHotels] = await pool.execute(
        'SELECT hotel_id FROM user_hotels WHERE user_id = ? AND hotel_id = ?',
        [userId, hotelId]
      );
      if (userHotels.length === 0) {
        return res.status(403).json({ Message: 'Access denied' });
      }
    }

    const [result] = await pool.execute(
      `SELECT el.*, g.name as guest_name, g.email as guest_email
       FROM email_logs el
       JOIN guest g ON el.guest_id = g.id
       WHERE el.hotel_id = ?
       ORDER BY el.created_at DESC
       LIMIT ? OFFSET ?`,
      [hotelId, limit, offset]
    );

    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM email_logs WHERE hotel_id = ?',
      [hotelId]
    );

    res.json({
      data: result,
      totalRecords: countResult[0].count,
      totalPages: Math.ceil(countResult[0].count / limit),
      currentPage: page
    });
  } catch (err) {
    logger.error('Error fetching email logs', { error: err.message, stack: err.stack });
    res.status(500).json({ Message: 'Database error' });
  }
});

// Get email status for specific guests
router.get('/status/guests', authenticateToken, async (req, res) => {
  try {
    const guestIds = req.query.guestIds; // Comma-separated list of guest IDs
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!guestIds) {
      return res.json({});
    }

    const guestIdArray = guestIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    
    if (guestIdArray.length === 0) {
      return res.json({});
    }

    // Get user's hotel IDs for access control
    let hotelIds = null;
    if (userRole !== 'super_admin') {
      hotelIds = await getUserHotelIds(userId, userRole);
      if (!hotelIds || hotelIds.length === 0) {
        return res.json({});
      }
    }

    // Build query - get latest email status for each guest
    let query;
    let queryParams;

    if (userRole === 'super_admin') {
      query = `
        SELECT el.guest_id, el.status, el.sent_at, el.error_message
        FROM email_logs el
        WHERE el.guest_id IN (${guestIdArray.map(() => '?').join(',')})
        AND el.id IN (
          SELECT MAX(id) 
          FROM email_logs 
          WHERE guest_id IN (${guestIdArray.map(() => '?').join(',')})
          GROUP BY guest_id
        )
      `;
      queryParams = [...guestIdArray, ...guestIdArray];
    } else {
      const placeholders = hotelIds.map(() => '?').join(',');
      query = `
        SELECT el.guest_id, el.status, el.sent_at, el.error_message
        FROM email_logs el
        JOIN guest g ON el.guest_id = g.id
        WHERE el.guest_id IN (${guestIdArray.map(() => '?').join(',')})
        AND g.hotel_id IN (${placeholders})
        AND el.id IN (
          SELECT MAX(id) 
          FROM email_logs 
          WHERE guest_id IN (${guestIdArray.map(() => '?').join(',')})
          GROUP BY guest_id
        )
      `;
      queryParams = [...guestIdArray, ...hotelIds, ...guestIdArray];
    }

    const [result] = await pool.execute(query, queryParams);
    
    // Convert to object with guest_id as key
    const statusMap = {};
    result.forEach(row => {
      statusMap[row.guest_id] = {
        status: row.status,
        sent_at: row.sent_at,
        error_message: row.error_message
      };
    });

    res.json(statusMap);
  } catch (err) {
    logger.error('Error fetching email status', { error: err.message, stack: err.stack });
    res.status(500).json({ Message: 'Database error' });
  }
});

export default router;
