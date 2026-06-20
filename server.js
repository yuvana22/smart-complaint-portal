// =====================================================
// Smart Complaint Management Portal
// Main Server File
// =====================================================

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- View Engine ----------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---------- Middleware ----------
app.use(express.urlencoded({ extended: true })); // parse form data
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // serve CSS/JS/images

// ---------- Session Setup ----------
app.use(session({
    secret: process.env.SESSION_SECRET || 'csp_default_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 2 // 2 hours
    }
}));

// ---------- Flash Messages (for success/error alerts) ----------
app.use(flash());

// Make session & flash data available in all EJS views automatically
app.use((req, res, next) => {
    res.locals.isUserLoggedIn = !!req.session.userId;
    res.locals.isAdminLoggedIn = !!req.session.adminId;
    res.locals.userEmail = req.session.userEmail || null;
    next();
});

// ---------- Routes ----------
app.use('/', require('./routes/homeRoutes'));
app.use('/', require('./routes/authRoutes'));
app.use('/', require('./routes/userRoutes'));
app.use('/', require('./routes/adminRoutes'));

// ---------- 404 Handler ----------
app.use((req, res) => {
    res.status(404).render('404');
});

// ---------- Error Handler (e.g. Multer file errors) ----------
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    if (req.flash) {
        req.flash('error', err.message || 'Something went wrong.');
        return res.redirect('back');
    }
    res.status(500).send('Server error: ' + err.message);
});

// ---------- Start Server ----------
app.listen(PORT, () => {
    console.log(`🚀 Smart Complaint Management Portal running at http://localhost:${PORT}`);
});
