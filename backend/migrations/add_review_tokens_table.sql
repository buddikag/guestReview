-- Migration: Add review_tokens table for short tokens (10-20 characters)
-- Run this script to add support for short tokens

USE gss;

-- Create review_tokens table for short tokens (10-20 characters)
CREATE TABLE IF NOT EXISTS review_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(20) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    hotel_id INT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP NULL,
    status INT DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Optional: Clean up expired tokens (run periodically)
-- DELETE FROM review_tokens WHERE expires_at < NOW() AND status = 1;
