const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const Block = require('../models/Block');

// ✅ حظر مستخدم
router.post('/block/:userId', protect, async (req, res) => {
  try {
    const block = await Block.create({
      blocker: req.user._id,
      blocked: req.params.userId
    });

    res.json({ message: 'User blocked', block });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'User already blocked' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// ❌ إلغاء الحظر
router.delete('/unblock/:userId', protect, async (req, res) => {
  try {
    await Block.findOneAndDelete({
      blocker: req.user._id,
      blocked: req.params.userId
    });

    res.json({ message: 'User unblocked' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
