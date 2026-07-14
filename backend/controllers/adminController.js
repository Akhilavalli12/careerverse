const User = require('../models/User');
const Student = require('../models/Student');
const Institution = require('../models/Institution');
const Application = require('../models/Application');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Platform-wide stats
// @route   GET /api/admin/stats
// @access  Private (admin)
const getStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalStudents, totalRecruiters, totalInstitutions, totalApplications, verifiedStudents] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'recruiter' }),
      User.countDocuments({ role: 'institution' }),
      Application.countDocuments(),
      Student.countDocuments({ institutionVerified: true }),
    ]);

  res.json({
    success: true,
    stats: { totalUsers, totalStudents, totalRecruiters, totalInstitutions, totalApplications, verifiedStudents },
  });
});

// @desc    List all users with pagination/filtering
// @route   GET /api/admin/users?role=student&page=1&limit=20
// @access  Private (admin)
const listUsers = asyncHandler(async (req, res) => {
  const { role, q, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (q) filter.$or = [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }];

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  res.json({ success: true, users, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
});

// @desc    Activate / deactivate a user account
// @route   PATCH /api/admin/users/:id/status
// @access  Private (admin)
const setUserActiveStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: !!isActive }, { new: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user });
});

// @desc    Delete a user (and cascade student profile if applicable)
// @route   DELETE /api/admin/users/:id
// @access  Private (admin)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  if (user.role === 'student') await Student.findOneAndDelete({ user: user._id });
  if (user.role === 'institution') await Institution.findOneAndDelete({ user: user._id });

  res.json({ success: true, message: 'User deleted' });
});

// @desc    Approve an institution so it appears publicly and can verify students
// @route   PATCH /api/admin/institutions/:id/approve
// @access  Private (admin)
const approveInstitution = asyncHandler(async (req, res) => {
  const institution = await Institution.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
  if (!institution) return res.status(404).json({ success: false, message: 'Institution not found' });
  res.json({ success: true, institution });
});

// @desc    List all institutions (approved and pending) for admin review
// @route   GET /api/admin/institutions
// @access  Private (admin)
const listAllInstitutions = asyncHandler(async (req, res) => {
  const institutions = await Institution.find().populate('user', 'name email');
  res.json({ success: true, institutions });
});

module.exports = {
  getStats, listUsers, setUserActiveStatus, deleteUser, approveInstitution, listAllInstitutions,
};
