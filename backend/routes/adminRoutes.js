const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getStats, listUsers, setUserActiveStatus, deleteUser, approveInstitution, listAllInstitutions,
} = require('../controllers/adminController');

router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', listUsers);
router.patch('/users/:id/status', setUserActiveStatus);
router.delete('/users/:id', deleteUser);
router.get('/institutions', listAllInstitutions);
router.patch('/institutions/:id/approve', approveInstitution);

module.exports = router;
