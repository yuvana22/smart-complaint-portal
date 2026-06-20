// =====================================================
// User Routes
// All routes requiring a logged-in user
// =====================================================

const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { requireUserLogin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// ---------- User Dashboard ----------
router.get('/dashboard', requireUserLogin, UserController.showDashboard);

// ---------- Raise Complaint ----------
router.get('/complaints/raise', requireUserLogin, UserController.showRaiseComplaintForm);
router.post('/complaints/raise', requireUserLogin, upload.single('image'), UserController.submitComplaint);

// ---------- AJAX: detect sector while filling the form ----------
router.get('/complaints/detect-sector', requireUserLogin, UserController.detectSector);

// ---------- View My Complaints ----------
router.get('/complaints/my', requireUserLogin, UserController.showMyComplaints);

// ---------- Track Complaint (any logged-in user can track by ID) ----------
router.get('/complaints/track', requireUserLogin, UserController.showTrackForm);
router.get('/complaints/track/search', requireUserLogin, UserController.trackComplaint);

module.exports = router;
