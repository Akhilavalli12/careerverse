const Student = require('../models/Student');
const Project = require('../models/Project');
const Certificate = require('../models/Certificate');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get own student profile
// @route   GET /api/students/me
// @access  Private (student)
const getMyProfile = asyncHandler(async (req, res) => {
  let profile = await Student.findOne({ user: req.user._id })
    .populate('projects')
    .populate('certificates')
    .populate('user', 'name email avatarUrl role isVerified');

  if (!profile) {
    profile = await Student.create({ user: req.user._id });
  }

  res.json({ success: true, profile });
});

// @desc    Update own student profile
// @route   PUT /api/students/me
// @access  Private (student)
const updateMyProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'headline', 'bio', 'location', 'skills', 'education',
    'experience', 'githubUsername', 'linkedinUrl', 'portfolioSlug',
  ];

  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const profile = await Student.findOneAndUpdate(
    { user: req.user._id },
    { $set: updates },
    { new: true, upsert: true, runValidators: true }
  );

  res.json({ success: true, profile });
});

// @desc    Get public portfolio by student id or slug
// @route   GET /api/students/portfolio/:idOrSlug
// @access  Public
const getPublicPortfolio = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;

  const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: idOrSlug }
    : { portfolioSlug: idOrSlug };

  const profile = await Student.findOne(query)
    .populate('projects')
    .populate('certificates')
    .populate('user', 'name avatarUrl');

  if (!profile) {
    return res.status(404).json({ success: false, message: 'Portfolio not found' });
  }

  // Fire-and-forget view tracking — don't block the response on it
  Student.findByIdAndUpdate(profile._id, {
    $inc: { 'analytics.viewCount': 1 },
    $push: {
      'analytics.viewHistory': {
        $each: [{ date: new Date(), referrer: req.get('referer') || '' }],
        $slice: -200,
      },
    },
  }).exec();

  res.json({ success: true, profile });
});

// @desc    Search / filter students (recruiter use)
// @route   GET /api/students?skills=react,node&location=Hyderabad&page=1&limit=10
// @access  Private (recruiter, admin)
const searchStudents = asyncHandler(async (req, res) => {
  const { skills, location, verifiedOnly, q, page = 1, limit = 10 } = req.query;

  const filter = {};
  if (skills) {
    const skillList = skills.split(',').map((s) => s.trim());
    filter.skills = { $in: skillList };
  }
  if (location) filter.location = { $regex: location, $options: 'i' };
  if (verifiedOnly === 'true') filter.institutionVerified = true;
  if (q) filter.$or = [
    { headline: { $regex: q, $options: 'i' } },
    { bio: { $regex: q, $options: 'i' } },
  ];

  const skip = (Number(page) - 1) * Number(limit);

  const [students, total] = await Promise.all([
    Student.find(filter)
      .populate('user', 'name email avatarUrl')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    Student.countDocuments(filter),
  ]);

  res.json({
    success: true,
    students,
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
});

// @desc    Public directory of verified students — browsable without an account, unlike
//          the recruiter search endpoint above which requires auth. Deliberately limited to
//          verified profiles and a smaller field set to keep this genuinely public-safe.
// @route   GET /api/students/explore?skills=react&q=&page=1&limit=12
// @access  Public
const exploreStudents = asyncHandler(async (req, res) => {
  const { skills, q, page = 1, limit = 12 } = req.query;

  const filter = { institutionVerified: true };
  if (skills) filter.skills = { $in: skills.split(',').map((s) => s.trim()) };
  if (q) filter.$or = [
    { headline: { $regex: q, $options: 'i' } },
    { bio: { $regex: q, $options: 'i' } },
  ];

  const skip = (Number(page) - 1) * Number(limit);
  const [students, total] = await Promise.all([
    Student.find(filter)
      .populate('user', 'name avatarUrl')
      .select('headline skills location portfolioSlug user institutionVerified')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    Student.countDocuments(filter),
  ]);

  res.json({
    success: true,
    students,
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
});

// ---------- Projects ----------

// @desc    Add a project
// @route   POST /api/students/me/projects
const addProject = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

  const { title, description, techStack, githubUrl, liveUrl, imageUrl, featured } = req.body;
  if (!title) return res.status(400).json({ success: false, message: 'Project title is required' });

  const project = await Project.create({
    student: student._id, title, description, techStack, githubUrl, liveUrl, imageUrl, featured,
  });

  student.projects.push(project._id);
  await student.save();

  res.status(201).json({ success: true, project });
});

// @desc    Update a project
// @route   PUT /api/students/me/projects/:id
const updateProject = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student || !student.projects.includes(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, project });
});

// @desc    Delete a project
// @route   DELETE /api/students/me/projects/:id
const deleteProject = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student || !student.projects.includes(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  await Project.findByIdAndDelete(req.params.id);
  student.projects = student.projects.filter((p) => p.toString() !== req.params.id);
  await student.save();

  res.json({ success: true, message: 'Project deleted' });
});

// ---------- Certificates ----------

// @desc    Add a certificate
// @route   POST /api/students/me/certificates
const addCertificate = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

  const { title, issuedBy, issueDate, credentialUrl, fileUrl } = req.body;
  if (!title) return res.status(400).json({ success: false, message: 'Certificate title is required' });

  const certificate = await Certificate.create({
    student: student._id, title, issuedBy, issueDate, credentialUrl, fileUrl,
  });

  student.certificates.push(certificate._id);
  await student.save();

  res.status(201).json({ success: true, certificate });
});

// @desc    Delete a certificate
// @route   DELETE /api/students/me/certificates/:id
const deleteCertificate = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student || !student.certificates.includes(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Certificate not found' });
  }

  await Certificate.findByIdAndDelete(req.params.id);
  student.certificates = student.certificates.filter((c) => c.toString() !== req.params.id);
  await student.save();

  res.json({ success: true, message: 'Certificate deleted' });
});

// @desc    Get own portfolio analytics (view count + recent view history)
// @route   GET /api/students/me/analytics
// @access  Private (student)
const getMyAnalytics = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id }).select('analytics projects certificates');
  if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

  // Bucket views by day for the last 30 days, for a simple trend chart
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentViews = (student.analytics?.viewHistory || []).filter((v) => new Date(v.date) >= thirtyDaysAgo);

  const dailyCounts = {};
  recentViews.forEach((v) => {
    const day = new Date(v.date).toISOString().slice(0, 10);
    dailyCounts[day] = (dailyCounts[day] || 0) + 1;
  });

  res.json({
    success: true,
    analytics: {
      totalViews: student.analytics?.viewCount || 0,
      viewsLast30Days: recentViews.length,
      dailyCounts,
      projectCount: student.projects?.length || 0,
      certificateCount: student.certificates?.length || 0,
    },
  });
});

// @desc    Update the visual template used for the public portfolio
// @route   PUT /api/students/me/template
// @access  Private (student)
const updatePortfolioTemplate = asyncHandler(async (req, res) => {
  const { template } = req.body;
  if (!['classic', 'modern', 'minimal'].includes(template)) {
    return res.status(400).json({ success: false, message: 'Invalid template. Choose classic, modern, or minimal.' });
  }

  const student = await Student.findOneAndUpdate(
    { user: req.user._id },
    { portfolioTemplate: template },
    { new: true, upsert: true }
  );

  res.json({ success: true, portfolioTemplate: student.portfolioTemplate });
});

module.exports = {
  getMyProfile,
  updateMyProfile,
  getPublicPortfolio,
  searchStudents,
  exploreStudents,
  addProject,
  updateProject,
  deleteProject,
  addCertificate,
  deleteCertificate,
  getMyAnalytics,
  updatePortfolioTemplate,
};
