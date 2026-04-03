const express = require('express');
const router = express.Router();
const { registerVolunteer, getVolunteers, updateVolunteerStatus } = require('../controllers/volunteerController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(registerVolunteer).get(protect, admin, getVolunteers);
router.route('/:id/status').put(protect, admin, updateVolunteerStatus);

module.exports = router;
