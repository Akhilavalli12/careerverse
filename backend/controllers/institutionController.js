const Institution = require('../models/Institution');
const Verification = require('../models/Verification');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Create/update own institution profile
// @route   PUT /api/institutions/me
// @access  Private (institution)
const updateMyInstitution = asyncHandler(async (req, res) => {
  const { name, domain, address, website, logoUrl, branding } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Institution name is required' });

  const update = { name, domain, address, website, logoUrl };
  if (branding) {
    update.branding = {
      primaryColor: branding.primaryColor || '#3b6fe0',
      accentColor: branding.accentColor || '#2f5bc4',
      customFooterText: branding.customFooterText || '',
    };
  }

  const institution = await Institution.findOneAndUpdate(
    { user: req.user._id },
    { $set: update },
    { new: true, upsert: true, runValidators: true }
  );

  res.json({ success: true, institution });
});

// @desc    Get own institution profile
// @route   GET /api/institutions/me
// @access  Private (institution)
const getMyInstitution = asyncHandler(async (req, res) => {
  const institution = await Institution.findOne({ user: req.user._id });
  if (!institution) return res.status(404).json({ success: false, message: 'Institution profile not set up yet' });
  res.json({ success: true, institution });
});

// @desc    List public institutions (for student to select when requesting verification)
// @route   GET /api/institutions
// @access  Public
const listInstitutions = asyncHandler(async (req, res) => {
  const institutions = await Institution.find({ isApproved: true }).select('name domain website logoUrl');
  res.json({ success: true, institutions });
});

// @desc    Student requests verification from an institution
// @route   POST /api/institutions/verification-requests
// @access  Private (student)
const requestVerification = asyncHandler(async (req, res) => {
  const { institutionId, studentIdNumber, proofDocumentUrl } = req.body;
  if (!institutionId) return res.status(400).json({ success: false, message: 'institutionId is required' });

  const student = await Student.findOne({ user: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

  const institution = await Institution.findById(institutionId);
  if (!institution) return res.status(404).json({ success: false, message: 'Institution not found' });

  const request = await Verification.create({
    student: student._id,
    institution: institution._id,
    studentIdNumber,
    proofDocumentUrl,
  });

  res.status(201).json({ success: true, request });
});

// @desc    Institution views pending verification requests
// @route   GET /api/institutions/verification-requests
// @access  Private (institution)
const getVerificationRequests = asyncHandler(async (req, res) => {
  const institution = await Institution.findOne({ user: req.user._id });
  if (!institution) return res.status(404).json({ success: false, message: 'Institution profile not found' });

  const requests = await Verification.find({ institution: institution._id })
    .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
    .sort({ createdAt: -1 });

  res.json({ success: true, requests });
});

// @desc    Institution approves/rejects a verification request
// @route   PATCH /api/institutions/verification-requests/:id
// @access  Private (institution)
const reviewVerificationRequest = asyncHandler(async (req, res) => {
  const { status, reviewNote } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'status must be approved or rejected' });
  }

  const institution = await Institution.findOne({ user: req.user._id });
  if (!institution) return res.status(404).json({ success: false, message: 'Institution profile not found' });

  const request = await Verification.findOne({ _id: req.params.id, institution: institution._id });
  if (!request) return res.status(404).json({ success: false, message: 'Verification request not found' });

  request.status = status;
  request.reviewNote = reviewNote || '';
  request.reviewedBy = req.user._id;
  await request.save();

  if (status === 'approved') {
    const student = await Student.findByIdAndUpdate(request.student, { institutionVerified: true }, { new: true });
    await Institution.findByIdAndUpdate(institution._id, { $addToSet: { students: request.student } });
    await Notification.create({
      user: student.user,
      message: `Your credentials have been verified by ${institution.name}`,
      type: 'success',
    });
  } else {
    const student = await Student.findById(request.student);
    await Notification.create({
      user: student.user,
      message: `Your verification request to ${institution.name} was rejected`,
      type: 'warning',
    });
  }

  res.json({ success: true, request });
});

// @desc    Get a single approved institution's public profile + branding (for a white-labeled recruiter-facing page)
// @route   GET /api/institutions/:id
// @access  Public
const getInstitutionPublic = asyncHandler(async (req, res) => {
  const institution = await Institution.findOne({ _id: req.params.id, isApproved: true })
    .select('name domain website logoUrl branding');
  if (!institution) return res.status(404).json({ success: false, message: 'Institution not found' });
  res.json({ success: true, institution });
});

// @desc    List an institution's verified students (a simple white-labeled placement roster)
// @route   GET /api/institutions/:id/students
// @access  Public
const getInstitutionStudents = asyncHandler(async (req, res) => {
  const institution = await Institution.findOne({ _id: req.params.id, isApproved: true });
  if (!institution) return res.status(404).json({ success: false, message: 'Institution not found' });

  const students = await Student.find({ institutionVerified: true, _id: { $in: institution.students } })
    .populate('user', 'name avatarUrl')
    .select('headline skills location portfolioSlug user');

  res.json({ success: true, institution: { name: institution.name, branding: institution.branding, logoUrl: institution.logoUrl }, students });
});

module.exports = {
  updateMyInstitution,
  getMyInstitution,
  listInstitutions,
  getInstitutionPublic,
  getInstitutionStudents,
  requestVerification,
  getVerificationRequests,
  reviewVerificationRequest,
};
