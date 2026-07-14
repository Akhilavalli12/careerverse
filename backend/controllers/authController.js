const crypto = require('crypto');
const User = require('../models/User');
const Student = require('../models/Student');
const asyncHandler = require('../middleware/asyncHandler');
const { generateToken, generateRandomToken } = require('../utils/generateToken');

// Email disabled for local development
// const sendEmail = require('../utils/sendEmail');
// const emailTemplate = require('../utils/emailTemplate');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email and password are required',
    });
  }

  const existing = await User.findOne({
    email: email.toLowerCase(),
  });

  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'Email is already registered',
    });
  }

  const verificationToken = generateRandomToken();

  const user = await User.create({
    name,
    email,
    password,
    role: ['student', 'recruiter', 'institution'].includes(role)
      ? role
      : 'student',
    verificationToken,
    isVerified: true,
  });

  // Auto-create an empty student profile for student-role users
  if (user.role === 'student') {
    await Student.create({
      user: user._id,
    });
  }

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Registration successful.',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }

  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Account has been deactivated',
    });
  }

  const token = generateToken(user._id);

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
  });
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    verificationToken: token,
  }).select('+verificationToken');

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired verification token',
    });
  }

  user.isVerified = true;
  user.verificationToken = undefined;

  await user.save();

  res.json({
    success: true,
    message: 'Email verified successfully',
  });
});

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({
    email: email?.toLowerCase(),
  });

  if (!user) {
    return res.json({
      success: true,
      message:
        'If that email is registered, a reset link has been sent.',
    });
  }

  const resetToken = generateRandomToken();

  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  user.resetPasswordExpires =
    Date.now() + 60 * 60 * 1000;

  await user.save();

  // Email sending disabled in local development

  res.json({
    success: true,
    message:
      'Password reset functionality disabled in local development.',
  });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters',
    });
  }

  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: {
      $gt: Date.now(),
    },
  }).select(
    '+resetPasswordToken +resetPasswordExpires'
  );

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token',
    });
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  res.json({
    success: true,
    message: 'Password has been reset successfully',
  });
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

module.exports = {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
};