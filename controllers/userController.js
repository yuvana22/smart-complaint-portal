// =====================================================
// User Controller
// Handles user dashboard, complaint submission, viewing & tracking
// =====================================================

const ComplaintModel = require('../models/complaintModel');
const AreaSectorModel = require('../models/areaSectorModel');

const CATEGORIES = [
    'Roads', 'Drainage', 'Water Supply', 'Street Lights',
    'Garbage Collection', 'Electricity', 'Public Safety', 'Other'
];

const UserController = {

    // ---------- User Dashboard ----------
    async showDashboard(req, res) {
        try {
            const stats = await ComplaintModel.getUserStats(req.session.userId);
            res.render('user/dashboard', {
                userEmail: req.session.userEmail,
                stats: {
                    total: stats.total || 0,
                    pending: stats.pending || 0,
                    inProgress: stats.inProgress || 0,
                    resolved: stats.resolved || 0
                }
            });
        } catch (err) {
            console.error('Dashboard error:', err);
            res.status(500).send('Server error loading dashboard.');
        }
    },

    // ---------- Raise Complaint: show form ----------
    showRaiseComplaintForm(req, res) {
        res.render('user/raise-complaint', {
            categories: CATEGORIES,
            error: req.flash('error'),
            success: req.flash('success')
        });
    },

    // ---------- AJAX endpoint: auto-detect sector based on area/pincode ----------
    async detectSector(req, res) {
        try {
            const { area_name, pincode } = req.query;
            if (!area_name && !pincode) {
                return res.json({ found: false });
            }
            const match = await AreaSectorModel.findSector(area_name, pincode);
            if (match) {
                return res.json({
                    found: true,
                    sector_no: match.sector_no,
                    latitude: match.latitude,
                    longitude: match.longitude
                });
            }
            return res.json({ found: false });
        } catch (err) {
            console.error('Sector detect error:', err);
            return res.status(500).json({ found: false, error: 'Server error' });
        }
    },

    // ---------- Raise Complaint: handle submission ----------
    async submitComplaint(req, res) {
        try {
            const { category, description, area_name, pincode, priority } = req.body;

            // --- Validation ---
            if (!category || !description || !area_name || !pincode || !priority) {
                req.flash('error', 'All fields are required except image.');
                return res.redirect('/complaints/raise');
            }
            if (description.trim().length < 20) {
                req.flash('error', 'Description must be at least 20 characters long.');
                return res.redirect('/complaints/raise');
            }
            if (!/^\d{4,10}$/.test(pincode)) {
                req.flash('error', 'Please enter a valid pin code.');
                return res.redirect('/complaints/raise');
            }
            if (!CATEGORIES.includes(category)) {
                req.flash('error', 'Please select a valid category.');
                return res.redirect('/complaints/raise');
            }

            // --- Auto-detect sector using Area Name / Pin Code ---
            const sectorMatch = await AreaSectorModel.findSector(area_name, pincode);
            const sector_no = sectorMatch ? sectorMatch.sector_no : 'Unassigned';
            const latitude = sectorMatch ? sectorMatch.latitude : null;
            const longitude = sectorMatch ? sectorMatch.longitude : null;

            // --- Generate unique complaint ID ---
            const complaint_id = await ComplaintModel.generateComplaintId();

            // --- Handle optional image upload ---
            const image_path = req.file ? `/uploads/${req.file.filename}` : null;

            await ComplaintModel.create({
                complaint_id,
                user_id: req.session.userId,
                category,
                description: description.trim(),
                area_name,
                pincode,
                sector_no,
                priority,
                image_path,
                latitude,
                longitude
            });

            req.flash('success', `Complaint submitted successfully! Your Complaint ID is ${complaint_id}.`);
            return res.redirect('/complaints/my');
        } catch (err) {
            console.error('Submit complaint error:', err);
            req.flash('error', err.message || 'Something went wrong while submitting your complaint.');
            return res.redirect('/complaints/raise');
        }
    },

    // ---------- View My Complaints ----------
    async showMyComplaints(req, res) {
        try {
            const complaints = await ComplaintModel.findByUserId(req.session.userId);
            res.render('user/my-complaints', {
                complaints,
                success: req.flash('success'),
                error: req.flash('error')
            });
        } catch (err) {
            console.error('My complaints error:', err);
            res.status(500).send('Server error loading complaints.');
        }
    },

    // ---------- Track Complaint: show search form ----------
    showTrackForm(req, res) {
        res.render('user/track-complaint', { complaint: null, notFound: false });
    },

    // ---------- Track Complaint: handle search ----------
    async trackComplaint(req, res) {
        try {
            const { complaint_id } = req.query;
            if (!complaint_id) {
                return res.render('user/track-complaint', { complaint: null, notFound: false });
            }
            const complaint = await ComplaintModel.findByComplaintId(complaint_id.trim());
            res.render('user/track-complaint', {
                complaint: complaint || null,
                notFound: !complaint
            });
        } catch (err) {
            console.error('Track complaint error:', err);
            res.status(500).send('Server error while tracking complaint.');
        }
    }
};

module.exports = UserController;
