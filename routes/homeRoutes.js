// =====================================================
// Home / Static Page Routes
// =====================================================

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('home');
});

module.exports = router;
