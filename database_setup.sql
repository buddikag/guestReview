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
    status INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_email_status (email, status),
    UNIQUE KEY unique_phone_status (phone, status)
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

-- Insert sample data (optional)
-- INSERT INTO guest (name, phone, email, startDate, endDate, roomNumber, status) VALUES
-- ('John Doe', '1234567890', 'john@example.com', '2024-01-01', '2024-01-05', '101', 1),
-- ('Jane Smith', '0987654321', 'jane@example.com', '2024-01-02', '2024-01-06', '102', 1);

