// =====================================================
// Database Configuration
// Creates a MySQL connection pool using mysql2
// =====================================================

const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool (better than single connection for web apps)
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'complaint_portal',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Use the promise wrapper so we can use async/await in controllers
const db = pool.promise();

// Quick test connection on startup
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        console.error('   Check your .env file and make sure MySQL is running.');
    } else {
        console.log('✅ Database connected successfully.');
        connection.release();
    }
});

module.exports = db;
