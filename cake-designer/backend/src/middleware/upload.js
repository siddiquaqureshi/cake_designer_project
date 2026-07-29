const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads", "reference-images");
fs.mkdirSync(uploadDir, { recursive: true });

const ACCEPTED_MIME = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `ref-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (req, file, cb) => {
    if (!ACCEPTED_MIME.includes(file.mimetype)) {
      return cb(new Error("Only PNG, JPG, JPEG, and WebP images are accepted"));
    }
    cb(null, true);
  },
});

module.exports = upload;
