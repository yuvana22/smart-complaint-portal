// =====================================================
// Admin Model
// All database queries related to the "admins" table
// =====================================================

const db = require('../config/db');

const AdminModel = {
    // Find an admin by username
    async findByUsername(username) {
        const [rows] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);
        return rows[0];
    }
};

module.exports = AdminModel;
