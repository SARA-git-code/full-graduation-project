


const multer = require('multer');
const path = require('path');

// 🎯 إعدادات التخزين
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext;
    cb(null, filename);
  }
});

// ✅ أنواع الملفات المسموحة (صور - صوت - فيديو - مستندات)
const allowedExtensions = [
  '.jpg', '.jpeg', '.png',
  '.pdf', '.docx', '.xlsx',
  '.mp3', '.wav',
  '.mp4', '.webm'
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
   console.log("🧪 FILE TYPE:", ext); // ✅ أ
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'));
  }
};

// 📦 إعدادات Multer النهائية
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB كحد أقصى
});

module.exports = upload;
