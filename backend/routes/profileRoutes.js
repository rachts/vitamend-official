const express = require('express');
const router = express.Router();
const { getProfile, upsertProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.route('/:userId')
  .get(protect, getProfile)
  .put(protect, upsertProfile);

module.exports = router;
