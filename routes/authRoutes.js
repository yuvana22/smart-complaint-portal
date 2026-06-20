// =====================================================
// Auth Routes
// /register, /login, /logout, /admin/login, /admin/logout
// =====================================================

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { redirectIfUserLoggedIn, redirectIfAdminLoggedIn } = require('../middleware/authMiddleware');

// ---------- User registration ----------
router.get('/register', redirectIfUserLoggedIn, AuthController.showRegisterPage);
router.post('/register', redirectIfUserLoggedIn, AuthController.registerUser);

// ---------- User login/logout ----------
router.get('/login', redirectIfUserLoggedIn, AuthController.showLoginPage);
router.post('/login', redirectIfUserLoggedIn, AuthController.loginUser);
router.get('/logout', AuthController.logoutUser);

// ---------- Admin login/logout ----------
router.get('/admin/login', redirectIfAdminLoggedIn, AuthController.showAdminLoginPage);
router.post('/admin/login', redirectIfAdminLoggedIn, AuthController.loginAdmin);
router.get('/admin/logout', AuthController.logoutAdmin);

module.exports = router;
