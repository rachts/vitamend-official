const express = require('express');
const router = express.Router();
const { createDonation, getMyDonations, getAllDonations, updateDonationStatus } = require('../controllers/donationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, createDonation).get(protect, admin, getAllDonations);
router.route('/my-donations').get(protect, getMyDonations);
router.route('/:id/status').put(protect, admin, updateDonationStatus);

module.exports = router;
