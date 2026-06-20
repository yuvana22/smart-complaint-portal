// =====================================================
// Upload Middleware
// Handles optional image upload for complaints using Multer
// =====================================================

const multer = require('multer');
const path = require('path');

// Where to store uploaded files and how to name them
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'public', 'uploads'));
    },
    filename: function (req, file, cb) {
        // Unique filename: timestamp-originalname
        const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
        cb(null, uniqueName);
    }
});

// Only allow image files
function fileFilter(req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeValid = allowedTypes.test(file.mimetype);

    if (extValid && mimeValid) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (jpg, jpeg, png, gif, webp) are allowed.'));
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB max
});

module.exports = upload;
