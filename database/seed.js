// =====================================================
// Database Seed Script
// Run this AFTER importing schema.sql and running `npm install`
// It safely (re)hashes and inserts the default admin + sample users
// with CORRECT bcrypt hashes generated on your machine.
//
// Usage:
//   node database/seed.js
// =====================================================

require('dotenv').config();
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

const SALT_ROUNDS = 10;

async function seed() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'complaint_portal',
        port: process.env.DB_PORT || 3306
    });

    console.log('🔐 Generating secure password hashes...');

    // ---------- Admin account ----------
    const adminPasswordHash = await bcrypt.hash('admin123', SALT_ROUNDS);
    await connection.query(
        `INSERT INTO admins (username, password) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE password = VALUES(password)`,
        ['admin', adminPasswordHash]
    );
    console.log('✅ Admin account ready -> username: admin | password: admin123');

    // ---------- Sample users (all share the same demo password) ----------
    const userPasswordHash = await bcrypt.hash('test1234', SALT_ROUNDS);
    const sampleUsers = [
        'ravi.kumar@example.com',
        'priya.sharma@example.com',
        'arjun.rao@example.com'
    ];

    const userIds = [];
    for (const email of sampleUsers) {
        await connection.query(
            `INSERT INTO users (email, password) VALUES (?, ?)
             ON DUPLICATE KEY UPDATE password = VALUES(password)`,
            [email, userPasswordHash]
        );
        const [rows] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
        userIds.push(rows[0].id);
    }
    console.log('✅ Sample users ready -> password for all: test1234');
    console.log('   ravi.kumar@example.com, priya.sharma@example.com, arjun.rao@example.com');

    // ---------- Sample complaints ----------
    // userIds[0] = ravi.kumar, userIds[1] = priya.sharma, userIds[2] = arjun.rao
    const [existingComplaints] = await connection.query('SELECT COUNT(*) AS count FROM complaints');
    if (existingComplaints[0].count === 0) {
        const sampleComplaints = [
            ['CMP-1001', userIds[0], 'Roads', 'Large pothole near the main bus stop causing traffic issues and risk to two-wheelers.', 'MVP Colony', '530017', 'Sector 1', 'High', 'Pending', 17.7345, 83.3320],
            ['CMP-1002', userIds[0], 'Drainage', 'Open drainage overflowing onto the street after rain, foul smell in the area.', 'Gajuwaka', '530026', 'Sector 2', 'High', 'In Progress', 17.6868, 83.2185],
            ['CMP-1003', userIds[1], 'Street Lights', 'Streetlights not working for the past one week on the main road.', 'Madhurawada', '530048', 'Sector 3', 'Medium', 'Pending', 17.8064, 83.3801],
            ['CMP-1004', userIds[1], 'Garbage Collection', 'Garbage not collected for 4 days, bins are overflowing near the market.', 'Dwaraka Nagar', '530016', 'Sector 4', 'Medium', 'Resolved', 17.7270, 83.3023],
            ['CMP-1005', userIds[2], 'Water Supply', 'Irregular water supply timing, water comes only for 30 minutes a day.', 'Seethammadhara', '530013', 'Sector 5', 'High', 'Pending', 17.7370, 83.3120],
            ['CMP-1006', userIds[2], 'Electricity', 'Frequent power cuts in the residential block during evenings.', 'MVP Colony', '530017', 'Sector 1', 'Medium', 'In Progress', 17.7345, 83.3320],
            ['CMP-1007', userIds[0], 'Public Safety', 'Broken footpath railing near the school, unsafe for children.', 'Gajuwaka', '530026', 'Sector 2', 'Low', 'Resolved', 17.6868, 83.2185]
        ];

        for (const c of sampleComplaints) {
            await connection.query(
                `INSERT INTO complaints
                (complaint_id, user_id, category, description, area_name, pincode, sector_no, priority, status, latitude, longitude)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                c
            );
        }
        console.log('✅ Sample complaints inserted (CMP-1001 to CMP-1007)');
    } else {
        console.log('ℹ️  Complaints table already has data, skipping sample complaint insert.');
    }

    await connection.end();
    console.log('🎉 Seeding complete!');
}

seed().catch(err => {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
});
