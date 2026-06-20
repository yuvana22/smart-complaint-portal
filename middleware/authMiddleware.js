// =====================================================
// Authentication Middleware
// Protects routes based on session data
// =====================================================

// Allow access only if a regular user is logged in
function requireUserLogin(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }
    req.flash('error', 'Please login to continue.');
    return res.redirect('/login');
}

// Allow access only if an admin is logged in
function requireAdminLogin(req, res, next) {
    if (req.session && req.session.adminId) {
        return next();
    }
    req.flash('error', 'Please login as admin to continue.');
    return res.redirect('/admin/login');
}

// If a user is already logged in, skip login/register pages and go to dashboard
function redirectIfUserLoggedIn(req, res, next) {
    if (req.session && req.session.userId) {
        return res.redirect('/dashboard');
    }
    next();
}

// If an admin is already logged in, skip admin login page
function redirectIfAdminLoggedIn(req, res, next) {
    if (req.session && req.session.adminId) {
        return res.redirect('/admin/dashboard');
    }
    next();
}

module.exports = {
    requireUserLogin,
    requireAdminLogin,
    redirectIfUserLoggedIn,
    redirectIfAdminLoggedIn
};
