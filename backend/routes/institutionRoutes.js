const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  updateMyInstitution, getMyInstitution, listInstitutions, getInstitutionPublic, getInstitutionStudents,
  requestVerification, getVerificationRequests, reviewVerificationRequest,
} = require('../controllers/institutionController');

router.get('/', listInstitutions);

router.put('/me', protect, authorize('institution'), updateMyInstitution);
router.get('/me', protect, authorize('institution'), getMyInstitution);

router.post('/verification-requests', protect, authorize('student'), requestVerification);
router.get('/verification-requests', protect, authorize('institution'), getVerificationRequests);
router.patch('/verification-requests/:id', protect, authorize('institution'), reviewVerificationRequest);

// Wildcard :id routes must come last so they don't shadow the specific routes above
router.get('/:id/students', getInstitutionStudents);
router.get('/:id', getInstitutionPublic);

module.exports = router;
