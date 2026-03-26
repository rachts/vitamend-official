const express = require('express');
const router = express.Router();
const { initDatabase } = require('../controllers/initController');

router.post('/', initDatabase);

module.exports = router;
