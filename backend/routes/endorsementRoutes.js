const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createEndorsement, getEndorsementsForStudent, deleteEndorsement } = require('../controllers/endorsementController');

router.get('/:studentId', getEndorsementsForStudent);
router.post('/:studentId', protect, createEndorsement);
router.delete('/:id', protect, deleteEndorsement);

module.exports = router;
