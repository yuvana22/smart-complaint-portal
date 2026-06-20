-- =====================================================
-- Smart Complaint Management Portal
-- MySQL Database Schema
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS complaint_portal;
USE complaint_portal;

-- Drop tables if they exist (clean re-run)
DROP TABLE IF EXISTS complaints;
DROP TABLE IF EXISTS area_sector;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS users;

-- =====================================================
-- Table: users
-- Stores citizen/user accounts
-- =====================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Table: admins
-- Stores admin login credentials
-- =====================================================
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- =====================================================
-- Table: area_sector
-- Maps Area Name + Pin Code to a responsible Sector
-- Includes fixed latitude/longitude for map display
-- =====================================================
CREATE TABLE area_sector (
    id INT AUTO_INCREMENT PRIMARY KEY,
    area_name VARCHAR(150) NOT NULL,
    sector_no VARCHAR(50) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL
);

-- =====================================================
-- Table: complaints
-- Stores all citizen complaints
-- =====================================================
CREATE TABLE complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id VARCHAR(30) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    area_name VARCHAR(150) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    sector_no VARCHAR(50) DEFAULT 'Unassigned',
    priority ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'Medium',
    image_path VARCHAR(255) DEFAULT NULL,
    latitude DECIMAL(10, 7) DEFAULT NULL,
    longitude DECIMAL(10, 7) DEFAULT NULL,
    status ENUM('Pending', 'In Progress', 'Resolved') NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for faster filtering/searching on the admin dashboard
CREATE INDEX idx_complaint_status ON complaints(status);
CREATE INDEX idx_complaint_sector ON complaints(sector_no);
CREATE INDEX idx_complaint_id ON complaints(complaint_id);

-- =====================================================
-- SAMPLE / SEED DATA
-- =====================================================
-- NOTE ON PASSWORDS:
-- The admin and user accounts (with correctly bcrypt-hashed passwords)
-- are NOT inserted here. After running this schema file, run:
--      node database/seed.js
-- This generates real bcrypt hashes on YOUR machine for:
--   Admin    -> username: admin                  | password: admin123
--   Users    -> ravi.kumar@example.com            | password: test1234
--               priya.sharma@example.com          | password: test1234
--               arjun.rao@example.com             | password: test1234
-- (Hardcoding a bcrypt hash in a SQL file is risky since hashes are
--  version/round specific; generating them via seed.js guarantees they work.)

-- ---------------- Area to Sector mapping ----------------
-- Fixed latitude/longitude included per area for the Leaflet map
INSERT INTO area_sector (area_name, sector_no, pincode, latitude, longitude) VALUES
('MVP Colony', 'Sector 1', '530017', 17.7345, 83.3320),
('Gajuwaka', 'Sector 2', '530026', 17.6868, 83.2185),
('Madhurawada', 'Sector 3', '530048', 17.8064, 83.3801),
('Dwaraka Nagar', 'Sector 4', '530016', 17.7270, 83.3023),
('Seethammadhara', 'Sector 5', '530013', 17.7370, 83.3120);

-- NOTE: Sample complaints are intentionally NOT inserted here.
-- They reference user_id values that only exist after seed.js creates
-- the sample users. Running database/seed.js will insert the admin
-- account, sample users, AND sample complaints in the correct order.
-- See README.md for the full setup sequence.
