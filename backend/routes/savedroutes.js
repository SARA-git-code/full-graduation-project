const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  saveDonation,
  unsaveDonation,
  getSavedDonations
} = require('../controllers/userController');

// ✅ Save donation
router.post('/:donationId', protect, saveDonation);

// ✅ Unsave donation
router.delete('/:donationId', protect, unsaveDonation);

// ✅ Get saved donations for logged-in user
router.get('/', protect, getSavedDonations);

module.exports = router;
