// =====================================================
// User Model
// All database queries related to the "users" table
// =====================================================

const db = require('../config/db');

const UserModel = {
    // Find a user by email (used during login & registration uniqueness check)
    async findByEmail(email) {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },

    // Find a user by ID
    async findById(id) {
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    },

    // Create a new user (password should already be hashed before calling this)
    async create(email, hashedPassword) {
        const [result] = await db.query(
            'INSERT INTO users (email, password) VALUES (?, ?)',
            [email, hashedPassword]
        );
        return result.insertId;
    }
};

module.exports = UserModel;
