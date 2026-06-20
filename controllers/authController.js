// =====================================================
// Auth Controller
// Handles user registration/login and admin login
// =====================================================

const bcrypt = require('bcrypt');
const UserModel = require('../models/userModel');
const AdminModel = require('../models/adminModel');

const SALT_ROUNDS = 10;

const AuthController = {

    // ---------- GET pages ----------
    showRegisterPage(req, res) {
        res.render('register', { error: req.flash('error'), old: {} });
    },

    showLoginPage(req, res) {
        res.render('login', { error: req.flash('error'), old: {} });
    },

    showAdminLoginPage(req, res) {
        res.render('admin/admin-login', { error: req.flash('error') });
    },

    // ---------- User Registration ----------
    async registerUser(req, res) {
        try {
            const { email, password, confirmPassword } = req.body;

            // --- Validation ---
            if (!email || !password || !confirmPassword) {
                req.flash('error', 'All fields are required.');
                return res.redirect('/register');
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                req.flash('error', 'Please enter a valid email address.');
                return res.redirect('/register');
            }
            if (password.length < 6) {
                req.flash('error', 'Password must be at least 6 characters long.');
                return res.redirect('/register');
            }
            if (password !== confirmPassword) {
                req.flash('error', 'Passwords do not match.');
                return res.redirect('/register');
            }

            // --- Uniqueness check ---
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                req.flash('error', 'An account with this email already exists.');
                return res.redirect('/register');
            }

            // --- Hash password & create user ---
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
            await UserModel.create(email, hashedPassword);

            req.flash('success', 'Registration successful! Please login.');
            return res.redirect('/login');
        } catch (err) {
            console.error('Register error:', err);
            req.flash('error', 'Something went wrong. Please try again.');
            return res.redirect('/register');
        }
    },

    // ---------- User Login ----------
    async loginUser(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                req.flash('error', 'Email and password are required.');
                return res.redirect('/login');
            }

            const user = await UserModel.findByEmail(email);
            if (!user) {
                req.flash('error', 'Invalid email or password.');
                return res.redirect('/login');
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                req.flash('error', 'Invalid email or password.');
                return res.redirect('/login');
            }

            // Set session
            req.session.userId = user.id;
            req.session.userEmail = user.email;

            return res.redirect('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            req.flash('error', 'Something went wrong. Please try again.');
            return res.redirect('/login');
        }
    },

    // ---------- User Logout ----------
    logoutUser(req, res) {
        req.session.destroy(() => {
            res.redirect('/login');
        });
    },

    // ---------- Admin Login ----------
    async loginAdmin(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                req.flash('error', 'Username and password are required.');
                return res.redirect('/admin/login');
            }

            const admin = await AdminModel.findByUsername(username);
            if (!admin) {
                req.flash('error', 'Invalid admin credentials.');
                return res.redirect('/admin/login');
            }

            const passwordMatch = await bcrypt.compare(password, admin.password);
            if (!passwordMatch) {
                req.flash('error', 'Invalid admin credentials.');
                return res.redirect('/admin/login');
            }

            req.session.adminId = admin.id;
            req.session.adminUsername = admin.username;

            return res.redirect('/admin/dashboard');
        } catch (err) {
            console.error('Admin login error:', err);
            req.flash('error', 'Something went wrong. Please try again.');
            return res.redirect('/admin/login');
        }
    },

    // ---------- Admin Logout ----------
    logoutAdmin(req, res) {
        req.session.destroy(() => {
            res.redirect('/admin/login');
        });
    }
};

module.exports = AuthController;
