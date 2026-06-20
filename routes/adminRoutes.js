// =====================================================
// Admin Routes
// All routes requiring a logged-in admin
// =====================================================

const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { requireAdminLogin } = require('../middleware/authMiddleware');

// ---------- Admin Dashboard ----------
router.get('/admin/dashboard', requireAdminLogin, AdminController.showDashboard);

// ---------- Complaint Management ----------
router.get('/admin/complaints', requireAdminLogin, AdminController.showComplaints);
router.get('/admin/complaints/:id', requireAdminLogin, AdminController.showComplaintDetails);
router.post('/admin/complaints/:id/status', requireAdminLogin, AdminController.updateStatus);
router.post('/admin/complaints/:id/delete', requireAdminLogin, AdminController.deleteComplaint);

module.exports = router;
