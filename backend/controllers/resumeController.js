const QRCode = require('qrcode');
const axios = require('axios');
const Student = require('../models/Student');
const asyncHandler = require('../middleware/asyncHandler');
const { generateResumePDF } = require('../utils/generateResumePDF');

// @desc    Update resume builder structured data (summary, template, custom sections)
// @route   PUT /api/resume/builder
// @access  Private (student)
const updateResumeBuilderData = asyncHandler(async (req, res) => {
  const { summary, template, customSections } = req.body;

  const update = {};
  if (summary !== undefined) update['resumeBuilderData.summary'] = summary;
  if (template !== undefined) update['resumeBuilderData.template'] = template;
  if (customSections !== undefined) update['resumeBuilderData.customSections'] = customSections;

  const student = await Student.findOneAndUpdate(
    { user: req.user._id },
    { $set: update },
    { new: true, upsert: true, runValidators: true }
  );

  res.json({ success: true, resumeBuilderData: student.resumeBuilderData });
});

// @desc    Generate and download a PDF resume built from profile + builder data
// @route   GET /api/resume/download
// @access  Private (student)
const downloadResumePDF = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id })
    .populate('projects')
    .populate('certificates')
    .populate('user', 'name email');

  if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

  generateResumePDF(student, res);
});

// @desc    Generate a QR code (as a data URL) pointing to the student's public portfolio
// @route   GET /api/resume/qr-code
// @access  Private (student)
const getPortfolioQRCode = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

  const identifier = student.portfolioSlug || student._id.toString();
  const portfolioUrl = `${process.env.CLIENT_URL}/portfolio/${identifier}`;

  const qrDataUrl = await QRCode.toDataURL(portfolioUrl, { width: 300, margin: 1 });

  res.json({ success: true, portfolioUrl, qrCode: qrDataUrl });
});

// @desc    Import public repos from GitHub into the student's project list (as read-only cache)
// @route   POST /api/resume/github-import
// @access  Private (student)
const importGithubRepos = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

  const username = req.body.githubUsername || student.githubUsername;
  if (!username) return res.status(400).json({ success: false, message: 'GitHub username is required' });

  let repos;
  try {
    const response = await axios.get(`https://api.github.com/users/${username}/repos`, {
      params: { sort: 'updated', per_page: 20 },
      headers: { 'User-Agent': 'CareerVerse-App' },
    });
    repos = response.data;
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ success: false, message: 'GitHub user not found' });
    }
    throw err;
  }

  const mapped = repos
    .filter((r) => !r.fork)
    .map((r) => ({
      name: r.name,
      description: r.description || '',
      url: r.html_url,
      stars: r.stargazers_count,
      language: r.language || '',
    }));

  student.githubUsername = username;
  student.githubRepos = mapped;
  await student.save();

  res.json({ success: true, githubRepos: student.githubRepos });
});

module.exports = { updateResumeBuilderData, downloadResumePDF, getPortfolioQRCode, importGithubRepos };
