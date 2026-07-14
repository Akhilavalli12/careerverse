const multer = require('multer');

// Store in memory then stream to Cloudinary — avoids leaving temp files on disk
const storage = multer.memoryStorage();

const allowedMimeTypes = {
  avatar: ['image/jpeg', 'image/png', 'image/webp'],
  resume: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  certificate: ['image/jpeg', 'image/png', 'application/pdf'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
};

const fileFilterFor = (kind) => (req, file, cb) => {
  const allowed = allowedMimeTypes[kind] || [];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${kind}. Allowed: ${allowed.join(', ')}`));
  }
};

const maxSize = 5 * 1024 * 1024; // 5MB
const maxVideoSize = 50 * 1024 * 1024; // 50MB — short intro clips only

const uploadAvatar = multer({ storage, limits: { fileSize: maxSize }, fileFilter: fileFilterFor('avatar') });
const uploadResume = multer({ storage, limits: { fileSize: maxSize }, fileFilter: fileFilterFor('resume') });
const uploadCertificateFile = multer({ storage, limits: { fileSize: maxSize }, fileFilter: fileFilterFor('certificate') });
const uploadVideo = multer({ storage, limits: { fileSize: maxVideoSize }, fileFilter: fileFilterFor('video') });

module.exports = { uploadAvatar, uploadResume, uploadCertificateFile, uploadVideo };
