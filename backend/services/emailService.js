import nodemailer from 'nodemailer';
import pool from '../config/database.js';
import logger from '../config/logger.js';

/**
 * Get SMTP settings for a hotel
 */
export const getSMTPSettings = async (hotelId) => {
  try {
    const [result] = await pool.execute(
      'SELECT * FROM hotel_smtp_settings WHERE hotel_id = ? AND status = 1',
      [hotelId]
    );
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    logger.error('Error fetching SMTP settings', { error: error.message, hotelId });
    throw error;
  }
};

/**
 * Get email template for a hotel
 */
export const getEmailTemplate = async (hotelId) => {
  try {
    const [result] = await pool.execute(
      'SELECT * FROM hotel_email_templates WHERE hotel_id = ? AND status = 1 ORDER BY id DESC LIMIT 1',
      [hotelId]
    );
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    logger.error('Error fetching email template', { error: error.message, hotelId });
    throw error;
  }
};

/**
 * Replace template variables with actual values
 */
export const replaceTemplateVariables = (template, variables) => {
  let processed = template;
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    processed = processed.replace(regex, variables[key] || '');
  });
  return processed;
};

/**
 * Send email to guest with feedback link
 */
export const sendFeedbackEmail = async (hotelId, guestId, feedbackLink, baseUrl = '') => {
  let emailLogId = null;
  
  try {
    // Get guest information
    const [guestResult] = await pool.execute(
      'SELECT * FROM guest WHERE id = ?',
      [guestId]
    );
    
    if (guestResult.length === 0) {
      throw new Error('Guest not found');
    }
    
    const guest = guestResult[0];
    
    // Get hotel information
    const [hotelResult] = await pool.execute(
      'SELECT * FROM hotels WHERE id = ?',
      [hotelId]
    );
    
    if (hotelResult.length === 0) {
      throw new Error('Hotel not found');
    }
    
    const hotel = hotelResult[0];
    
    // Get SMTP settings
    const smtpSettings = await getSMTPSettings(hotelId);
    if (!smtpSettings) {
      throw new Error('SMTP settings not configured for this hotel');
    }
    
    // Get email template
    let emailTemplate = await getEmailTemplate(hotelId);
    
    // Default template if none exists
    if (!emailTemplate) {
      emailTemplate = {
        subject: 'Thank you for your stay - Please share your feedback',
        body_html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 30px;">
              ${hotel.logo_path ? `<img src="${process.env.BASE_URL || 'http://localhost:5173'}/uploads/${hotel.logo_path}" alt="${hotel.name}" style="max-width: 200px; height: auto;">` : ''}
            </div>
            <h2 style="color: #333;">Dear {{guest_name}},</h2>
            <p>Thank you for staying at <strong>{{hotel_name}}</strong>!</p>
            <p>We hope you enjoyed your stay. Your feedback is very important to us and helps us improve our services.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="{{feedback_link}}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Share Your Feedback</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #007bff;">{{feedback_link}}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              <strong>{{hotel_name}}</strong><br>
              ${hotel.address || ''}<br>
              ${hotel.phone ? `Phone: ${hotel.phone}` : ''}<br>
              ${hotel.email ? `Email: ${hotel.email}` : ''}
            </p>
          </div>
        `,
        body_text: `Dear {{guest_name}},\n\nThank you for staying at {{hotel_name}}!\n\nWe hope you enjoyed your stay. Your feedback is very important to us.\n\nPlease share your feedback by clicking this link:\n{{feedback_link}}\n\nBest regards,\n{{hotel_name}}`
      };
    }
    
    // Prepare template variables
    const templateVars = {
      guest_name: guest.name,
      hotel_name: hotel.name,
      feedback_link: feedbackLink,
      hotel_address: hotel.address || '',
      hotel_phone: hotel.phone || '',
      hotel_email: hotel.email || '',
      room_number: guest.roomNumber || '',
      check_in_date: new Date(guest.startDate).toLocaleDateString(),
      check_out_date: new Date(guest.endDate).toLocaleDateString(),
      base_url: baseUrl || (process.env.BASE_URL || 'http://localhost:5173')
    };
    
    // Replace template variables
    const subject = replaceTemplateVariables(emailTemplate.subject, templateVars);
    const bodyHtml = replaceTemplateVariables(emailTemplate.body_html, templateVars);
    const bodyText = emailTemplate.body_text ? replaceTemplateVariables(emailTemplate.body_text, templateVars) : '';
    
    // Create email log entry
    const [logResult] = await pool.execute(
      'INSERT INTO email_logs (hotel_id, guest_id, recipient_email, subject, status) VALUES (?, ?, ?, ?, ?)',
      [hotelId, guestId, guest.email, subject, 'pending']
    );
    emailLogId = logResult.insertId;
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpSettings.smtp_host,
      port: smtpSettings.smtp_port,
      secure: smtpSettings.smtp_secure, // true for 465, false for other ports
      auth: {
        user: smtpSettings.smtp_user,
        pass: smtpSettings.smtp_password
      }
    });
    
    // Verify connection
    await transporter.verify();
    
    // Send email
    const info = await transporter.sendMail({
      from: `"${smtpSettings.from_name}" <${smtpSettings.from_email}>`,
      to: guest.email,
      subject: subject,
      text: bodyText,
      html: bodyHtml
    });
    
    // Update email log as sent
    await pool.execute(
      'UPDATE email_logs SET status = ?, sent_at = NOW() WHERE id = ?',
      ['sent', emailLogId]
    );
    
    logger.info('Email sent successfully', {
      hotelId,
      guestId,
      recipient: guest.email,
      messageId: info.messageId
    });
    
    return {
      success: true,
      messageId: info.messageId,
      emailLogId
    };
    
  } catch (error) {
    logger.error('Error sending email', {
      error: error.message,
      stack: error.stack,
      hotelId,
      guestId,
      emailLogId
    });
    
    // Update email log as failed
    if (emailLogId) {
      try {
        await pool.execute(
          'UPDATE email_logs SET status = ?, error_message = ? WHERE id = ?',
          ['failed', error.message.substring(0, 500), emailLogId]
        );
      } catch (logError) {
        logger.error('Error updating email log', { error: logError.message });
      }
    }
    
    throw error;
  }
};
