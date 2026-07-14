const express = require('express');
const router = express.Router();
const {
  createApplication, getMyApplications, updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('recruiter', 'admin'));

router.post('/', createApplication);
router.get('/', getMyApplications);
router.patch('/:id', updateApplicationStatus);

module.exports = router;
