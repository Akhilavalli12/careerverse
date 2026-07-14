const Application = require('../models/Application');
const Notification = require('../models/Notification');
const Student = require('../models/Student');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Shortlist / create an application record for a student
// @route   POST /api/applications
// @access  Private (recruiter)
const createApplication = asyncHandler(async (req, res) => {
  const { studentId, positionTitle, notes } = req.body;

  if (!studentId || !positionTitle) {
    return res.status(400).json({ success: false, message: 'studentId and positionTitle are required' });
  }

  const student = await Student.findById(studentId);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  const application = await Application.create({
    recruiter: req.user._id,
    student: studentId,
    positionTitle,
    notes,
  });

  await Notification.create({
    user: student.user,
    message: `You've been shortlisted for "${positionTitle}"`,
    type: 'application',
  });

  res.status(201).json({ success: true, application });
});

// @desc    Get all applications created by the logged-in recruiter
// @route   GET /api/applications
// @access  Private (recruiter)
const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ recruiter: req.user._id })
    .populate({ path: 'student', populate: { path: 'user', select: 'name email avatarUrl' } })
    .sort({ createdAt: -1 });

  res.json({ success: true, applications });
});

// @desc    Update application status
// @route   PATCH /api/applications/:id
// @access  Private (recruiter)
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;

  const application = await Application.findOne({ _id: req.params.id, recruiter: req.user._id });
  if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

  if (status) application.status = status;
  if (notes !== undefined) application.notes = notes;
  await application.save();

  res.json({ success: true, application });
});

module.exports = { createApplication, getMyApplications, updateApplicationStatus };
