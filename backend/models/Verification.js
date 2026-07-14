const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    studentIdNumber: { type: String, default: '' },
    proofDocumentUrl: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewNote: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Verification', verificationSchema);
