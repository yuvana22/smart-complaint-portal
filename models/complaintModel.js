// =====================================================
// Complaint Model
// All database queries related to the "complaints" table
// =====================================================

const db = require('../config/db');

const ComplaintModel = {
    // Generate the next unique complaint ID, e.g. CMP-1008
    async generateComplaintId() {
        const [rows] = await db.query(
            "SELECT complaint_id FROM complaints ORDER BY id DESC LIMIT 1"
        );
        if (rows.length === 0) {
            return 'CMP-1001';
        }
        const lastId = rows[0].complaint_id; // e.g. "CMP-1007"
        const lastNumber = parseInt(lastId.split('-')[1], 10);
        const nextNumber = lastNumber + 1;
        return `CMP-${nextNumber}`;
    },

    // Create a new complaint
    async create(data) {
        const {
            complaint_id, user_id, category, description, area_name,
            pincode, sector_no, priority, image_path, latitude, longitude
        } = data;

        const [result] = await db.query(
            `INSERT INTO complaints
            (complaint_id, user_id, category, description, area_name, pincode, sector_no, priority, image_path, latitude, longitude, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
            [complaint_id, user_id, category, description, area_name, pincode, sector_no, priority, image_path, latitude, longitude]
        );
        return result.insertId;
    },

    // Find complaint by its public complaint_id (used for tracking page)
    async findByComplaintId(complaintId) {
        const [rows] = await db.query('SELECT * FROM complaints WHERE complaint_id = ?', [complaintId]);
        return rows[0];
    },

    // Find complaint by internal numeric id (used for admin details/edit)
    async findById(id) {
        const [rows] = await db.query('SELECT * FROM complaints WHERE id = ?', [id]);
        return rows[0];
    },

    // Get all complaints belonging to a specific user
    async findByUserId(userId) {
        const [rows] = await db.query(
            'SELECT * FROM complaints WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        return rows;
    },

    // Get dashboard stats (counts) for a specific user
    async getUserStats(userId) {
        const [rows] = await db.query(
            `SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS inProgress,
                SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolved
            FROM complaints WHERE user_id = ?`,
            [userId]
        );
        return rows[0];
    },

    // Get overall stats (for admin dashboard)
    async getOverallStats() {
        const [rows] = await db.query(
            `SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS inProgress,
                SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolved
            FROM complaints`
        );
        return rows[0];
    },

    // Sector-wise complaint counts (for the analytics chart on admin dashboard)
    async getSectorWiseCounts() {
        const [rows] = await db.query(
            `SELECT sector_no, COUNT(*) AS count
             FROM complaints
             GROUP BY sector_no
             ORDER BY sector_no ASC`
        );
        return rows;
    },

    // Get all complaints with optional filters (search, sector, status) + sort by date
    async getAllFiltered({ search, sector, status, sort }) {
        let query = 'SELECT * FROM complaints WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND (complaint_id LIKE ? OR area_name LIKE ? OR category LIKE ?)';
            const term = `%${search}%`;
            params.push(term, term, term);
        }
        if (sector) {
            query += ' AND sector_no = ?';
            params.push(sector);
        }
        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += sort === 'oldest' ? ' ORDER BY created_at ASC' : ' ORDER BY created_at DESC';

        const [rows] = await db.query(query, params);
        return rows;
    },

    // Update complaint status (admin action)
    async updateStatus(id, status) {
        await db.query('UPDATE complaints SET status = ? WHERE id = ?', [status, id]);
    },

    // Delete a complaint (admin action)
    async deleteById(id) {
        await db.query('DELETE FROM complaints WHERE id = ?', [id]);
    },

    // Get distinct list of sectors that currently have complaints (for filter dropdown)
    async getDistinctSectors() {
        const [rows] = await db.query('SELECT DISTINCT sector_no FROM complaints ORDER BY sector_no ASC');
        return rows.map(r => r.sector_no);
    }
};

module.exports = ComplaintModel;
