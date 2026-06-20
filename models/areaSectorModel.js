// =====================================================
// Area-Sector Model
// Handles the Area Name / Pin Code -> Sector auto-mapping logic
// =====================================================

const db = require('../config/db');

const AreaSectorModel = {
    // Get all area-sector mappings (used to populate dropdowns / admin views)
    async getAll() {
        const [rows] = await db.query('SELECT * FROM area_sector ORDER BY area_name ASC');
        return rows;
    },

    // Core auto-mapping logic:
    // Given an area name and/or pincode, find the matching sector record.
    // Priority: exact match on BOTH area_name and pincode.
    // Fallback: match on area_name only, then pincode only.
    async findSector(areaName, pincode) {
        // 1. Try exact match on both fields (case-insensitive)
        let [rows] = await db.query(
            'SELECT * FROM area_sector WHERE LOWER(area_name) = LOWER(?) AND pincode = ? LIMIT 1',
            [areaName, pincode]
        );
        if (rows.length > 0) return rows[0];

        // 2. Fallback: match on area name only
        [rows] = await db.query(
            'SELECT * FROM area_sector WHERE LOWER(area_name) = LOWER(?) LIMIT 1',
            [areaName]
        );
        if (rows.length > 0) return rows[0];

        // 3. Fallback: match on pincode only
        [rows] = await db.query(
            'SELECT * FROM area_sector WHERE pincode = ? LIMIT 1',
            [pincode]
        );
        if (rows.length > 0) return rows[0];

        // No match found - complaint will be saved as "Unassigned"
        return null;
    },

    // Count distinct sectors (for admin dashboard stat card)
    async countSectors() {
        const [rows] = await db.query('SELECT COUNT(DISTINCT sector_no) AS total FROM area_sector');
        return rows[0].total;
    }
};

module.exports = AreaSectorModel;
