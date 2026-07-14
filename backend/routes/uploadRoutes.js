const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadAvatar, uploadResume, uploadCertificateFile, uploadVideo } = require('../middleware/upload');
const {
  uploadAvatarHandler, uploadResumeHandler, uploadCertificateFileHandler, uploadProjectImageHandler, uploadVideoIntroHandler,
} = require('../controllers/uploadController');

router.use(protect);

router.post('/avatar', uploadAvatar.single('avatar'), uploadAvatarHandler);
router.post('/resume', authorize('student'), uploadResume.single('resume'), uploadResumeHandler);
router.post('/certificate/:certificateId', authorize('student'), uploadCertificateFile.single('file'), uploadCertificateFileHandler);
router.post('/project-image/:projectId', authorize('student'), uploadAvatar.single('image'), uploadProjectImageHandler);
router.post('/video-intro', authorize('student'), uploadVideo.single('video'), uploadVideoIntroHandler);

module.exports = router;
