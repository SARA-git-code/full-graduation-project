const express = require('express');
const router = express.Router();
const { protect } = require("../middlewares/auth");
const messageController = require('../controllers/messageController');
const upload = require('../middlewares/upload');    // ✅ middleware لتحميل الملفات

// 📩 إرسال رسالة (قد تكون نص - صورة - موقع - مرفق - رد)
router.post(
  '/',
  protect,
  upload.single('file'),
  messageController.sendMessage
);


router.post(
  '/group',
  protect,
  upload.single('file'),
  messageController.sendGroupMessage
);

// 💬 جلب المحادثة مع مستخدم معيّن
router.get(
  '/chat/:otherUserId',
  protect,
  messageController.getChatWithUser
);



// ✅ تعليم الرسائل القادمة من مستخدم بأنها "مقروءة"
router.put(
  '/mark-read',
  protect,
  messageController.markMessagesAsRead
);

router.get('/:id', protect, messageController.getMessageById);

// 📥 جلب قائمة المحادثات للمستخدم الحالي
router.get(
  '/conversations',
  protect,
  messageController.getUserConversations
);

// 📩 جلب كل رسائل محادثة معينة
router.get(
  '/conversation/:conversationId',
  protect,
  messageController.getMessagesByConversation
);

router.delete('/:id', protect, messageController.deleteMessage);
router.put('/:id', protect, messageController.editMessage);

module.exports = router;
