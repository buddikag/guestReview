# Email Setup Guide

## Overview
The system now supports sending feedback links via email with customizable SMTP settings and email templates per hotel.

## Database Tables

### 1. hotel_smtp_settings
Stores SMTP configuration for each hotel:
- `hotel_id` (unique)
- `smtp_host` - SMTP server hostname
- `smtp_port` - SMTP port (usually 587 or 465)
- `smtp_secure` - Use SSL/TLS (boolean)
- `smtp_user` - SMTP username
- `smtp_password` - SMTP password (encrypted)
- `from_email` - Sender email address
- `from_name` - Sender display name

### 2. hotel_email_templates
Stores customizable email templates:
- `hotel_id`
- `subject` - Email subject line
- `body_html` - HTML email body
- `body_text` - Plain text email body (optional)

### 3. email_logs
Tracks all sent emails:
- `hotel_id`
- `guest_id`
- `recipient_email`
- `subject`
- `status` - sent, failed, pending
- `error_message`
- `sent_at`

## Template Variables

The following variables can be used in email templates:
- `{{guest_name}}` - Guest's full name
- `{{hotel_name}}` - Hotel name
- `{{feedback_link}}` - Feedback link with token
- `{{hotel_address}}` - Hotel address
- `{{hotel_phone}}` - Hotel phone
- `{{hotel_email}}` - Hotel email
- `{{room_number}}` - Guest's room number
- `{{check_in_date}}` - Check-in date
- `{{check_out_date}}` - Check-out date
- `{{base_url}}` - Base URL for images/logos

## API Endpoints

### SMTP Settings
- `GET /api/email/smtp/:hotelId` - Get SMTP settings
- `POST /api/email/smtp/:hotelId` - Save SMTP settings

### Email Templates
- `GET /api/email/template/:hotelId` - Get email template
- `POST /api/email/template/:hotelId` - Save email template

### Send Email
- `POST /api/email/send/:guestId` - Send feedback email to guest

### Email Logs
- `GET /api/email/logs/:hotelId` - Get email logs with pagination

## Setup Instructions

1. **Run Database Migration**
   ```sql
   -- Tables are already in database_setup.sql
   -- Just run the migration if updating existing database
   ```

2. **Configure SMTP for Hotel**
   - Go to Hotel Management
   - Click "SMTP Settings" for a hotel
   - Enter SMTP configuration
   - Test connection

3. **Customize Email Template**
   - Go to Hotel Management
   - Click "Email Template" for a hotel
   - Edit subject and HTML body
   - Use template variables as needed
   - Preview before saving

4. **Send Emails**
   - Go to Guest List
   - Click "Mail" button for a guest
   - Email will be sent automatically
   - Check email logs for status

## Example SMTP Settings

### Gmail
- Host: smtp.gmail.com
- Port: 587
- Secure: false (STARTTLS)
- User: your-email@gmail.com
- Password: App Password (not regular password)

### Outlook/Hotmail
- Host: smtp-mail.outlook.com
- Port: 587
- Secure: false
- User: your-email@outlook.com
- Password: Your password

### Custom SMTP
- Host: mail.yourdomain.com
- Port: 587 or 465
- Secure: true for 465, false for 587
- User: your-email@yourdomain.com
- Password: Your email password

## Default Email Template

If no custom template is set, the system uses a default template with:
- Hotel logo (if available)
- Personalized greeting
- Feedback link button
- Hotel contact information

## Email Tracking

All emails are logged in the `email_logs` table with:
- Success/failure status
- Error messages (if failed)
- Timestamp
- Recipient information

This allows you to:
- Track email delivery
- Debug sending issues
- Generate reports
- Resend failed emails
