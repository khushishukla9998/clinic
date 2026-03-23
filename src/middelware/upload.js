const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure the storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create a unique filename based on the current timestamp + random number
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File validation filter
const fileFilter = (req, file, cb) => {
    // Valid mime types: Images and PDF
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error("Invalid file type. Only JPG, JPEG, PNG, and PDF files are allowed."), false); // Reject the file
    }
};

// Initialize Multer
// 5MB max file size limit per document
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 megabytes in bytes
    },
    fileFilter: fileFilter
});

module.exports = upload;
