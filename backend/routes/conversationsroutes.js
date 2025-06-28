const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const conversationController = require('../controllers/conversationController');

// ✅ إنشاء محادثة جماعية جديدة
router.post('/', protect, conversationController.createGroupConversation);

// ✅ جلب جميع المحادثات
router.get('/', protect, conversationController.getAllConversations);

// ✅ جلب أو إنشاء محادثة مع مستخدم معين (مثل المتبرع)
router.get('/:userId/:donationId', protect, conversationController.getOrCreateConversation);


module.exports = router;
