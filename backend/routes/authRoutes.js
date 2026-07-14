const express = require('express');
const router = express.Router();
const {
  register, login, verifyEmail, forgotPassword, resetPassword, getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const {
  registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation,
} = require('../validators/authValidators');

router.post('/register', registerValidation, handleValidation, register);
router.post('/login', loginValidation, handleValidation, login);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPasswordValidation, handleValidation, forgotPassword);
router.post('/reset-password/:token', resetPasswordValidation, handleValidation, resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
