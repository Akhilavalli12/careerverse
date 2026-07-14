const Endorsement = require('../models/Endorsement');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Endorse a skill on another student's profile
// @route   POST /api/endorsements/:studentId
// @access  Private (any authenticated user, but not yourself)
const createEndorsement = asyncHandler(async (req, res) => {
  const { skill, message } = req.body;
  const { studentId } = req.params;

  if (!skill) return res.status(400).json({ success: false, message: 'skill is required' });

  const student = await Student.findById(studentId);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  if (student.user.toString() === req.user._id.toString()) {
    return res.status(400).json({ success: false, message: 'You cannot endorse your own profile' });
  }

  if (!student.skills.includes(skill)) {
    return res.status(400).json({ success: false, message: 'You can only endorse a skill the student has listed' });
  }

  let endorsement;
  try {
    endorsement = await Endorsement.create({
      fromUser: req.user._id,
      toStudent: studentId,
      skill,
      message,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'You have already endorsed this skill for this student' });
    }
    throw err;
  }

  await Notification.create({
    user: student.user,
    message: `${req.user.name} endorsed you for "${skill}"`,
    type: 'success',
  });

  res.status(201).json({ success: true, endorsement });
});

// @desc    Get all endorsements for a student (public — shown on portfolio)
// @route   GET /api/endorsements/:studentId
// @access  Public
const getEndorsementsForStudent = asyncHandler(async (req, res) => {
  const endorsements = await Endorsement.find({ toStudent: req.params.studentId })
    .populate('fromUser', 'name avatarUrl role')
    .sort({ createdAt: -1 });

  // Group by skill for easy rendering: { "React": [{...}, {...}], "Node.js": [...] }
  const grouped = endorsements.reduce((acc, e) => {
    acc[e.skill] = acc[e.skill] || [];
    acc[e.skill].push(e);
    return acc;
  }, {});

  res.json({ success: true, endorsements, grouped });
});

// @desc    Delete an endorsement you made
// @route   DELETE /api/endorsements/:id
// @access  Private
const deleteEndorsement = asyncHandler(async (req, res) => {
  const endorsement = await Endorsement.findOneAndDelete({ _id: req.params.id, fromUser: req.user._id });
  if (!endorsement) return res.status(404).json({ success: false, message: 'Endorsement not found' });
  res.json({ success: true, message: 'Endorsement removed' });
});

module.exports = { createEndorsement, getEndorsementsForStudent, deleteEndorsement };
