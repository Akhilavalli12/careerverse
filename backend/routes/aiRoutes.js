const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { analyzeResume, getCachedAnalysis, importLinkedInText } = require('../controllers/aiController');

router.use(protect, authorize('student'));

router.post('/analyze', analyzeResume);
router.get('/analysis', getCachedAnalysis);
router.post('/linkedin-import', importLinkedInText);

module.exports = router;
