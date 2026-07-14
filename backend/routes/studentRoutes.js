const express = require('express');
const router = express.Router();
const {
  getMyProfile, updateMyProfile, getPublicPortfolio, searchStudents, exploreStudents,
  addProject, updateProject, deleteProject, addCertificate, deleteCertificate,
  getMyAnalytics, updatePortfolioTemplate,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

// Public
router.get('/portfolio/:idOrSlug', getPublicPortfolio);
router.get('/explore', exploreStudents);

// Recruiter/admin search
router.get('/', protect, authorize('recruiter', 'admin'), searchStudents);

// Student self-service
router.get('/me', protect, authorize('student'), getMyProfile);
router.put('/me', protect, authorize('student'), updateMyProfile);
router.get('/me/analytics', protect, authorize('student'), getMyAnalytics);
router.put('/me/template', protect, authorize('student'), updatePortfolioTemplate);

router.post('/me/projects', protect, authorize('student'), addProject);
router.put('/me/projects/:id', protect, authorize('student'), updateProject);
router.delete('/me/projects/:id', protect, authorize('student'), deleteProject);

router.post('/me/certificates', protect, authorize('student'), addCertificate);
router.delete('/me/certificates/:id', protect, authorize('student'), deleteCertificate);

module.exports = router;
