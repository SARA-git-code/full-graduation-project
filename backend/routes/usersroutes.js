const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const User = require('../models/User'); // ✅ هذا السطر مفقود
const {
  requestPasswordReset,
  resetPassword,
  getAllUsers,
  getProfile,
  updateProfile,
  changePassword, // ✅ تمت إضافته
  getUserById,
  updateSettings,
} = require('../controllers/userController');

const { protect, adminOnly } = require('../middlewares/auth');

// تغيير كلمة المرور داخل الحساب (مطلوب تسجيل الدخول)
router.post('/change-password', protect, changePassword);

// طلب تغيير كلمة المرور (بكود عبر الإيميل)
router.post('/request-reset', requestPasswordReset);

// تنفيذ تغيير كلمة المرور (بعد إدخال الكود)
router.post('/reset-password', resetPassword);

// بيانات المستخدم
router.get('/', protect, getAllUsers);

router.get('/profile', protect, getProfile);

router.put('/profile', protect, upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "backgroundImage", maxCount: 1 }
]), updateProfile);

router.get("/:id", getUserById);

router.put('/settings', protect, updateSettings);



// تأكيد كود الاسترجاع
router.post('/reset-password/verify-code', async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email, resetCode: code });

    if (!user || user.resetCodeExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    res.json({ message: "Code is valid" }); // ✅ التحقق ناجح
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

module.exports = router;
