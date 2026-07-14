const User = require('../models/User');
const Student = require('../models/Student');
const Certificate = require('../models/Certificate');
const asyncHandler = require('../middleware/asyncHandler');
const { uploadToCloudinary } = require('../config/cloudinary');

// @desc    Upload/replace avatar
// @route   POST /api/uploads/avatar
// @access  Private
const uploadAvatarHandler = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file provided' });

  const result = await uploadToCloudinary(req.file.buffer, 'careerverse/avatars');

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatarUrl: result.secure_url },
    { new: true }
  );

  res.json({ success: true, avatarUrl: user.avatarUrl });
});

// @desc    Upload/replace resume
// @route   POST /api/uploads/resume
// @access  Private (student)
const uploadResumeHandler = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file provided' });

  const result = await uploadToCloudinary(req.file.buffer, 'careerverse/resumes');

  const student = await Student.findOneAndUpdate(
    { user: req.user._id },
    { resumeUrl: result.secure_url },
    { new: true, upsert: true }
  );

  res.json({ success: true, resumeUrl: student.resumeUrl });
});

// @desc    Upload a certificate file and attach it to an existing certificate record
// @route   POST /api/uploads/certificate/:certificateId
// @access  Private (student)
const uploadCertificateFileHandler = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file provided' });

  const student = await Student.findOne({ user: req.user._id });
  if (!student || !student.certificates.includes(req.params.certificateId)) {
    return res.status(404).json({ success: false, message: 'Certificate not found' });
  }

  const result = await uploadToCloudinary(req.file.buffer, 'careerverse/certificates');

  const certificate = await Certificate.findByIdAndUpdate(
    req.params.certificateId,
    { fileUrl: result.secure_url },
    { new: true }
  );

  res.json({ success: true, certificate });
});

// @desc    Upload a project screenshot/thumbnail
// @route   POST /api/uploads/project-image/:projectId
// @access  Private (student)
const uploadProjectImageHandler = asyncHandler(async (req, res) => {
  const Project = require('../models/Project');
  if (!req.file) return res.status(400).json({ success: false, message: 'No file provided' });

  const student = await Student.findOne({ user: req.user._id });
  if (!student || !student.projects.includes(req.params.projectId)) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  const result = await uploadToCloudinary(req.file.buffer, 'careerverse/projects');
  const project = await Project.findByIdAndUpdate(
    req.params.projectId,
    { imageUrl: result.secure_url },
    { new: true }
  );

  res.json({ success: true, project });
});

// @desc    Upload/replace a short video introduction
// @route   POST /api/uploads/video-intro
// @access  Private (student)
const uploadVideoIntroHandler = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file provided' });

  const result = await uploadToCloudinary(req.file.buffer, 'careerverse/video-intros');

  const student = await Student.findOneAndUpdate(
    { user: req.user._id },
    { videoIntroUrl: result.secure_url },
    { new: true, upsert: true }
  );

  res.json({ success: true, videoIntroUrl: student.videoIntroUrl });
});

module.exports = {
  uploadAvatarHandler,
  uploadResumeHandler,
  uploadCertificateFileHandler,
  uploadProjectImageHandler,
  uploadVideoIntroHandler,
};
