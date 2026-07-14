const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  updateResumeBuilderData, downloadResumePDF, getPortfolioQRCode, importGithubRepos,
} = require('../controllers/resumeController');

router.use(protect, authorize('student'));

router.put('/builder', updateResumeBuilderData);
router.get('/download', downloadResumePDF);
router.get('/qr-code', getPortfolioQRCode);
router.post('/github-import', importGithubRepos);

module.exports = router;
