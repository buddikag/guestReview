-- Database setup script for Guest Review System
-- Database: gss

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS gss;
USE gss;

-- Create guest table
CREATE TABLE IF NOT EXISTS guest (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    roomNumber VARCHAR(50) NOT NULL,
    hotel_id INT NOT NULL,
    status INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_email_status (email, status),
    UNIQUE KEY unique_phone_status (phone, status),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create simplewtstar table (for ratings and feedback)
CREATE TABLE IF NOT EXISTS simplewtstar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rating INT NOT NULL,
    comment TEXT,
    guest_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES guest(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create hotels table
CREATE TABLE IF NOT EXISTS hotels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    logo_path VARCHAR(500),
    status INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'manager', 'staff') DEFAULT 'staff',
    status INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create user_hotels table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS user_hotels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    hotel_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_hotel (user_id, hotel_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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

-- Note: Run 'node setup-admin.js' in the backend directory to create the super admin user
-- Default credentials will be: superadmin / admin123

-- Insert sample hotel
INSERT INTO hotels (name, address, phone, email, status) VALUES
('Sample Hotel', '123 Main Street', '1234567890', 'info@samplehotel.com', 1)
ON DUPLICATE KEY UPDATE name=name;

-- Insert sample data (optional)
-- INSERT INTO guest (name, phone, email, startDate, endDate, roomNumber, status) VALUES
-- ('John Doe', '1234567890', 'john@example.com', '2024-01-01', '2024-01-05', '101', 1),
-- ('Jane Smith', '0987654321', 'jane@example.com', '2024-01-02', '2024-01-06', '102', 1);
