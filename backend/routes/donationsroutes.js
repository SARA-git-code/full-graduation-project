const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');



const {
  createDonation,
  getAllDonations,
  getDonationsByUser, 
  updateDonation,
  deleteDonation,
  getDonationById,
  updateDonationStatus ,
  getSimilarDonations,
  getDonationsByUserId,
  addInteraction,
  getMostInterested,
} = require('../controllers/donationController');

console.log("📡 donationsroutes.js LOADED");


router.get('/similar', getSimilarDonations);

const upload = require('../middlewares/upload');
const { protect, adminOnly } = require('../middlewares/auth');

router.get("/most-interested", getMostInterested);

router.patch('/:id/status', protect, updateDonationStatus);

// Create donation with image upload (authenticated users only)
router.post('/', protect, upload.array('images', 6), createDonation);
// أو أكثر إذا أردت عددًا أكبر

// Get all donations
router.get('/', getAllDonations);



router.get('/user', protect, getDonationsByUser);

router.get('/user/:userId', protect, getDonationsByUser);


// Get single donation by ID
router.get('/:id', protect, getDonationById);


// Update a donation (authenticated)
router.put('/:id', protect, upload.array('images', 5), updateDonation);

// Delete a donation (authenticated)
router.delete('/:id', protect, deleteDonation);

// Admin-only delete route
router.delete('/admin/:id', protect, adminOnly, deleteDonation);


router.get("/byUser/:id", getDonationsByUserId); 

// GET /donations/most-interested

router.put("/:id/interact",protect, addInteraction);



module.exports = router;
