import { Router } from 'express';
import jwt from "jsonwebtoken";
import pool from './config/database.js';
import { authenticateToken } from './middleware/auth.js';

const router = Router();
const SECRET = process.env.JWT_SECRET || "gss_2026_@";

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

// Generate review token for widget usage (7 days expiration)
// POST /simplewtstar/generateReviewToken
// Body: { userId: number, hotelId: number }
router.post('/generateReviewToken', async (req, res) => {
  try {
    const { userId, hotelId } = req.body;

    // Validate input
    if (!userId || !hotelId) {
      return res.status(400).json({ Message: 'userId and hotelId are required' });
    }

    if (isNaN(userId) || isNaN(hotelId)) {
      return res.status(400).json({ Message: 'userId and hotelId must be numbers' });
    }

    // Verify hotel exists (optional - for better error handling)
    try {
      const [hotelResult] = await pool.execute('SELECT id FROM hotels WHERE id = ? AND status = 1', [hotelId]);
      if (hotelResult.length === 0) {
        return res.status(404).json({ Message: 'Hotel not found or inactive' });
      }
    } catch (err) {
      console.error('Error checking hotel:', err);
      // Continue anyway - hotel check is optional
    }

    // Generate token with 7 days expiration
    const token = jwt.sign(
      { 
        user_id: parseInt(userId), 
        hotel_id: parseInt(hotelId) 
      }, 
      SECRET, 
      { expiresIn: "7d" }
    );

    return res.json(token);
  } catch (err) {
    console.error('Error generating token:', err);
    return res.status(500).json({ Message: 'Failed to generate token' });
  }
});

// Generate widget token with 1 year expiration (for hotel management)
// POST /simplewtstar/generateWidgetToken
// Body: { userId: number, hotelId: number }
// Requires authentication - should be called from hotel management panel
router.post('/generateWidgetToken', authenticateToken, async (req, res) => {
  try {
    const { userId, hotelId } = req.body;
    const currentUser = req.user;

    // Validate input
    if (!hotelId) {
      return res.status(400).json({ Message: 'hotelId is required' });
    }

    if (isNaN(hotelId)) {
      return res.status(400).json({ Message: 'hotelId must be a number' });
    }

    // Use current user's ID if userId not provided, otherwise verify it matches or user is super_admin
    const tokenUserId = userId || currentUser.id;
    if (currentUser.role !== 'super_admin' && parseInt(tokenUserId) !== currentUser.id) {
      return res.status(403).json({ Message: 'Unauthorized: Cannot generate token for another user' });
    }

    // Verify hotel exists
    let [hotelResult] = await pool.execute('SELECT id, name FROM hotels WHERE id = ? AND status = 1', [hotelId]);
    if (hotelResult.length === 0) {
      return res.status(404).json({ Message: 'Hotel not found or inactive' });
    }

    // Check access for non-super-admin users
    if (currentUser.role !== 'super_admin') {
      const [userHotels] = await pool.execute(
        'SELECT hotel_id FROM user_hotels WHERE user_id = ? AND hotel_id = ?',
        [currentUser.id, hotelId]
      );
      if (userHotels.length === 0) {
        return res.status(403).json({ Message: 'Access denied: You do not have access to this hotel' });
      }
    }

    // Generate token with 1 year expiration
    const token = jwt.sign(
      { 
        user_id: parseInt(tokenUserId), 
        hotel_id: parseInt(hotelId) 
      }, 
      SECRET, 
      { expiresIn: "365d" } // 1 year
    );

    // Calculate expiration date
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);

    return res.json({
      token: token,
      hotelId: parseInt(hotelId),
      hotelName: hotelResult[0].name,
      expiresIn: "365d",
      expiresAt: expirationDate.toISOString(),
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error generating widget token:', err);
    return res.status(500).json({ Message: 'Failed to generate widget token' });
  }
});

// decode token and get user data
 router.get('/getUserData/:token', (req, res) => {
     const token = req.params.token;
     console.log(token);
  try {
    const decoded = jwt.verify(token, SECRET);
    res.json(decoded);
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
 })

// Define a GET route relative to the mount path (e.g., the final path is /users/)
// router.get('/', (req, res) => {
//   console.log("Handler for /simplewtstar route from separate file.");
//   res.send('Handler for /simplewtstar route from separate file.');
// });

// Define another route (e.g., final path is /users/:id)
// router.get('/:id', (req, res) => {
//   const userId = req.params.id; // Access request parameters
//   res.send(`User ID: ${userId} from separate file.`);
// });


router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const userId = req.user.id;
    const userRole = req.user.role;

    const hotelIds = await getUserHotelIds(userId, userRole);

    let countQuery, query;
    let countParams = [];
    let queryParams = [];

    if (userRole === 'super_admin') {
      // Super admin sees all feedbacks
      countQuery = `
        SELECT COUNT(*) AS count 
        FROM simplewtstar sws 
        JOIN guest g ON sws.guest_id = g.id 
        WHERE sws.status = 1
      `;
      query = `
        SELECT sws.*, g.name AS name, g.email AS guest_email, g.phone AS guest_phone, g.hotel_id, h.name AS hotel_name
        FROM simplewtstar sws 
        JOIN guest g ON sws.guest_id = g.id 
        LEFT JOIN hotels h ON g.hotel_id = h.id
        WHERE sws.status = 1 
        ORDER BY sws.id DESC 
        LIMIT ? OFFSET ?
      `;
      queryParams = [limit, offset];
    } else {
      // Regular users see only feedbacks from their hotels
      if (!hotelIds || hotelIds.length === 0) {
        return res.json({ data: [], totalRecords: 0, totalPages: 0 });
      }
      const placeholders = hotelIds.map(() => '?').join(',');
      countQuery = `
        SELECT COUNT(*) AS count 
        FROM simplewtstar sws 
        JOIN guest g ON sws.guest_id = g.id 
        WHERE sws.status = 1 AND g.hotel_id IN (${placeholders})
      `;
      query = `
        SELECT sws.*, g.name AS name, g.email AS guest_email, g.phone AS guest_phone, g.hotel_id, h.name AS hotel_name
        FROM simplewtstar sws 
        JOIN guest g ON sws.guest_id = g.id 
        LEFT JOIN hotels h ON g.hotel_id = h.id
        WHERE sws.status = 1 AND g.hotel_id IN (${placeholders})
        ORDER BY sws.id DESC 
        LIMIT ? OFFSET ?
      `;
      countParams = hotelIds;
      queryParams = [...hotelIds, limit, offset];
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const totalRecords = countResult[0].count;
    const totalPages = Math.ceil(totalRecords / limit);
    
    const [result] = await pool.execute(query, queryParams);
    return res.json({ data: result, totalRecords, totalPages });
  } catch (err) {
    return res.status(500).json({ Message: 'Database error' });
  }
});

router.get('/getPreReviews', async (req, res) => {
    try {
        const query = "SELECT * FROM pre_defined_review WHERE status = 1";
        const [result] = await pool.execute(query);
        return res.json(result);
    } catch (err) {
        return res.status(500).json({ Message: 'Database error' });
    }
});

// Get all reviews for a specific hotel (public endpoint for widgets)
// Can be accessed via: GET /simplewtstar/hotel/:hotelId?page=1&limit=10
router.get('/hotel/:hotelId', async (req, res) => {
    try {
        const hotelId = req.params.hotelId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        if (!hotelId || isNaN(hotelId)) {
            return res.status(400).json({ Message: 'Invalid hotel ID' });
        }

        // Get total count
        const countQuery = `
            SELECT COUNT(*) AS count 
            FROM simplewtstar sws 
            JOIN guest g ON sws.guest_id = g.id 
            WHERE sws.status = 1 AND g.hotel_id = ? AND g.status = 1
        `;
        
        const [countResult] = await pool.execute(countQuery, [hotelId]);
        const totalRecords = countResult[0].count;
        const totalPages = Math.ceil(totalRecords / limit);

        // Get reviews with guest and hotel information
        const query = `
            SELECT 
                sws.id,
                sws.rating,
                sws.comment,
                sws.nickname,
                sws.reply,
                sws.state,
                sws.created_at,
                g.name AS guest_name,
                g.email AS guest_email,
                g.hotel_id,
                h.name AS hotel_name
            FROM simplewtstar sws 
            JOIN guest g ON sws.guest_id = g.id 
            LEFT JOIN hotels h ON g.hotel_id = h.id
            WHERE sws.status = 1 AND g.hotel_id = ? AND g.status = 1
            ORDER BY sws.created_at DESC 
            LIMIT ? OFFSET ?
        `;

        const [result] = await pool.execute(query, [hotelId, limit, offset]);
        
        return res.json({ 
            data: result, 
            totalRecords, 
            totalPages,
            currentPage: page,
            limit
        });
    } catch (err) {
        console.error('Error fetching hotel reviews:', err);
        return res.status(500).json({ Message: 'Database error' });
    }
});

// Get all reviews for a specific hotel using token (alternative secure method)
// Can be accessed via: GET /simplewtstar/hotel-token/:token?page=1&limit=10
router.get('/hotel-token/:token', async (req, res) => {
    try {
        const token = req.params.token;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Verify token and extract hotel_id
        let decoded;
        try {
            decoded = jwt.verify(token, SECRET);
        } catch (err) {
            return res.status(401).json({ Message: 'Invalid or expired token' });
        }

        const hotelId = decoded.hotel_id;
        if (!hotelId) {
            return res.status(400).json({ Message: 'Invalid token: hotel_id not found' });
        }

        // Get total count
        const countQuery = `
            SELECT COUNT(*) AS count 
            FROM simplewtstar sws 
            JOIN guest g ON sws.guest_id = g.id 
            WHERE sws.status = 1 AND g.hotel_id = ? AND g.status = 1
        `;
        
        const [countResult] = await pool.execute(countQuery, [hotelId]);
        const totalRecords = countResult[0].count;
        const totalPages = Math.ceil(totalRecords / limit);

        // Get reviews with guest and hotel information
        const query = `
            SELECT 
                sws.id,
                sws.rating,
                sws.comment,
                sws.nickname,
                sws.reply,
                sws.state,
                sws.created_at,
                g.name AS guest_name,
                g.phone AS guest_phone,
                g.email AS guest_email,
                g.hotel_id,
                h.name AS hotel_name
            FROM simplewtstar sws 
            JOIN guest g ON sws.guest_id = g.id 
            LEFT JOIN hotels h ON g.hotel_id = h.id
            WHERE sws.status = 1 AND g.hotel_id = ? AND g.status = 1
            ORDER BY sws.created_at DESC 
            LIMIT ? OFFSET ?
        `;

        const [result] = await pool.execute(query, [hotelId, limit, offset]);
        
        return res.json({ 
            data: result, 
            totalRecords, 
            totalPages,
            currentPage: page,
            limit
        });
    } catch (err) {
        console.error('Error fetching hotel reviews:', err);
        return res.status(500).json({ Message: 'Database error' });
    }
});

router.get('/getReview/:id', authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        const hotelIds = await getUserHotelIds(userId, userRole);

        let query = `
          SELECT sws.*, g.hotel_id 
          FROM simplewtstar sws 
          JOIN guest g ON sws.guest_id = g.id 
          WHERE sws.guest_id = ?
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
        if (result.length === 0) return res.status(404).json({ Message: "Feedback not found" });
        return res.json(result);
    } catch (err) {
        return res.status(500).json({ Message: 'Database error' });
    }
});

router.post('/add', async (req, res) => {
    try {
        const { rating, comment, guestid, nickname } = req.body;
        // Check if rating and comment are provided
        if (!rating || !comment || !guestid) {
            return res.status(400).json({ Message: "Rating, comment, are required" });
        }
        const query = "INSERT INTO simplewtstar (rating, comment, nickname, guest_id,created_at) VALUES (?, ?, ?, ?, ?)";
        await pool.execute(query, [rating, comment, nickname, guestid, new Date()]);
        return res.json({ Message: "Your Review has been submitted." });
    } catch (err) {
        return res.status(500).json({ Message: 'Database error' });
    }
});
router.put('/reply/:id', authenticateToken, async (req, res) => {
    try {
        const feedbackId = req.params.id;
        const { replytext } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Check if user has access to this feedback
        const hotelIds = await getUserHotelIds(userId, userRole);

        // First check access
        let accessQuery = `
          SELECT g.hotel_id 
          FROM simplewtstar sws 
          JOIN guest g ON sws.guest_id = g.id 
          WHERE sws.id = ?
        `;
        const [feedbackResult] = await pool.execute(accessQuery, [feedbackId]);
        if (feedbackResult.length === 0) return res.status(404).json({ Message: "Feedback not found" });

        const feedbackHotelId = feedbackResult[0].hotel_id;

        // Check access
        if (userRole !== 'super_admin') {
          if (!hotelIds || !hotelIds.includes(feedbackHotelId)) {
            return res.status(403).json({ Message: "Access denied to this feedback" });
          }
        }

        const query = "UPDATE simplewtstar SET reply = ? WHERE id = ?";
        const [result] = await pool.execute(query, [replytext, feedbackId]);
        if (result.affectedRows === 0) return res.status(404).json({ Message: "Feedback not found" });
        return res.json({ Message: "Review updated successfully" });
    } catch (err) {
        return res.status(500).json({ Message: 'Database error' });
    }
});
router.put('/state/:id', authenticateToken, async (req, res) => {
    try {
        const feedbackId = req.params.id;
        const { state } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Check if user has access to this feedback
        const hotelIds = await getUserHotelIds(userId, userRole);

        // First check access
        let accessQuery = `
          SELECT g.hotel_id 
          FROM simplewtstar sws 
          JOIN guest g ON sws.guest_id = g.id 
          WHERE sws.id = ?
        `;
        const [feedbackResult] = await pool.execute(accessQuery, [feedbackId]);
        if (feedbackResult.length === 0) return res.status(404).json({ Message: "Feedback not found" });

        const feedbackHotelId = feedbackResult[0].hotel_id;

        // Check access
        if (userRole !== 'super_admin') {
          if (!hotelIds || !hotelIds.includes(feedbackHotelId)) {
            return res.status(403).json({ Message: "Access denied to this feedback" });
          }
        }

        const query = "UPDATE simplewtstar SET state = ? WHERE id = ?";
        const [result] = await pool.execute(query, [state, feedbackId]);
        if (result.affectedRows === 0) return res.status(404).json({ Message: "Feedback not found" });
        return res.json({ Message: "Review updated successfully" });
    } catch (err) {
        return res.status(500).json({ Message: 'Database error' });
    }
});

router.delete('/delete/:id', authenticateToken, async (req, res) => {
    try {
        const feedbackId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Check if user has access to this feedback
        const hotelIds = await getUserHotelIds(userId, userRole);

        // First check access
        let accessQuery = `
          SELECT g.hotel_id 
          FROM simplewtstar sws 
          JOIN guest g ON sws.guest_id = g.id 
          WHERE sws.id = ?
        `;
        const [feedbackResult] = await pool.execute(accessQuery, [feedbackId]);
        if (feedbackResult.length === 0) return res.status(404).json({ Message: "Feedback not found" });

        const feedbackHotelId = feedbackResult[0].hotel_id;

        // Check access
        if (userRole !== 'super_admin') {
          if (!hotelIds || !hotelIds.includes(feedbackHotelId)) {
            return res.status(403).json({ Message: "Access denied to this feedback" });
          }
        }

        const query = "UPDATE simplewtstar SET status = 9 WHERE id = ?";
        const [result] = await pool.execute(query, [feedbackId]);
        if (result.affectedRows === 0) return res.status(404).json({ Message: "Feedback not found" });
        return res.json({ Message: "Review deleted successfully" });
    } catch (err) {
        return res.status(500).json({ Message: 'Database error' });
    }
});

// update review
router.put('/update/:id', authenticateToken, async (req, res) => {
    try {
        const feedbackId = req.params.id;
        const { rating, comment, nickname } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Check if user has access to this feedback
        const hotelIds = await getUserHotelIds(userId, userRole);

        // First check access
        let accessQuery = `
          SELECT g.hotel_id 
          FROM simplewtstar sws 
          JOIN guest g ON sws.guest_id = g.id 
          WHERE sws.id = ?
        `;
        const [feedbackResult] = await pool.execute(accessQuery, [feedbackId]);
        if (feedbackResult.length === 0) return res.status(404).json({ Message: "Feedback not found" });

        const feedbackHotelId = feedbackResult[0].hotel_id;

        // Check access
        if (userRole !== 'super_admin') {
          if (!hotelIds || !hotelIds.includes(feedbackHotelId)) {
            return res.status(403).json({ Message: "Access denied to this feedback" });
          }
        }

        const query = "UPDATE simplewtstar SET rating = ?, comment = ?, nickname = ?, created_at = ? WHERE id = ?";
        const [result] = await pool.execute(query, [rating, comment, nickname, new Date(), feedbackId]);
        if (result.affectedRows === 0) return res.status(404).json({ Message: "Feedback not found" });
        return res.json({ Message: "Review updated successfully" });
    } catch (err) {
        return res.status(500).json({ Message: 'Database error' });
    }
});
// Export the router for use in the main app file
export default router;