const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { importLeetCodeStats, importHackerRankStats } = require('../controllers/codingProfileController');

router.use(protect, authorize('student'));

router.post('/leetcode', importLeetCodeStats);
router.post('/hackerrank', importHackerRankStats);

module.exports = router;
