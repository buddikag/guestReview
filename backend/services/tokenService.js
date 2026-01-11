import pool from '../config/database.js';
import logger from '../config/logger.js';

// Helper function to generate short token (10-20 characters)
const generateShortToken = (length = 15) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

// Helper function to ensure unique token
const generateUniqueToken = async (length = 15) => {
  let token = generateShortToken(length);
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const [existing] = await pool.execute('SELECT id FROM review_tokens WHERE token = ?', [token]);
    if (existing.length === 0) {
      return token;
    }
    token = generateShortToken(length);
    attempts++;
  }
  
  // If still not unique, try with longer token
  return generateShortToken(length + 5);
};

/**
 * Generate a review token for a guest (7 days expiration)
 * @param {number} userId - Guest ID
 * @param {number} hotelId - Hotel ID
 * @returns {Promise<string>} - Generated token
 */
export const generateReviewToken = async (userId, hotelId) => {
  try {
    // Validate input
    if (!userId || !hotelId) {
      throw new Error('userId and hotelId are required');
    }

    if (isNaN(userId) || isNaN(hotelId)) {
      throw new Error('userId and hotelId must be numbers');
    }

    // Verify hotel exists
    const [hotelResult] = await pool.execute('SELECT id FROM hotels WHERE id = ? AND status = 1', [hotelId]);
    if (hotelResult.length === 0) {
      throw new Error('Hotel not found or inactive');
    }

    // Generate unique short token (15 characters)
    const token = await generateUniqueToken(15);
    
    // Calculate expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Store token in database
    await pool.execute(
      'INSERT INTO review_tokens (token, user_id, hotel_id, expires_at) VALUES (?, ?, ?, ?)',
      [token, parseInt(userId), parseInt(hotelId), expiresAt]
    );

    logger.info('Short token generated', { token, userId, hotelId, expiresAt });
    return token;
  } catch (err) {
    logger.error('Error generating review token', { error: err.message, stack: err.stack, userId, hotelId });
    throw err;
  }
};

/**
 * Generate a widget token for a hotel (1 year expiration)
 * @param {number} hotelId - Hotel ID
 * @param {number} tokenUserId - User ID for token generation
 * @returns {Promise<{token: string, expirationDate: Date}>} - Generated token and expiration date
 */
export const generateWidgetToken = async (hotelId, tokenUserId) => {
  try {
    // Validate input
    if (!hotelId || !tokenUserId) {
      throw new Error('hotelId and tokenUserId are required');
    }

    if (isNaN(hotelId) || isNaN(tokenUserId)) {
      throw new Error('hotelId and tokenUserId must be numbers');
    }

    // Verify hotel exists
    const [hotelResult] = await pool.execute('SELECT id, name FROM hotels WHERE id = ? AND status = 1', [hotelId]);
    if (hotelResult.length === 0) {
      throw new Error('Hotel not found or inactive');
    }

    // Generate unique short token (15 characters)
    const token = await generateUniqueToken(15);

    // Calculate expiration date (1 year from now)
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);

    // Store token in database
    await pool.execute(
      'INSERT INTO review_tokens (token, user_id, hotel_id, expires_at) VALUES (?, ?, ?, ?)',
      [token, parseInt(tokenUserId), parseInt(hotelId), expirationDate]
    );

    logger.info('Widget token generated', { 
      token, 
      hotelId: parseInt(hotelId), 
      hotelName: hotelResult[0].name,
      userId: parseInt(tokenUserId),
      expiresAt: expirationDate
    });

    return { token, expirationDate, hotelName: hotelResult[0].name };
  } catch (err) {
    logger.error('Error generating widget token', { error: err.message, stack: err.stack, hotelId, tokenUserId });
    throw err;
  }
};
