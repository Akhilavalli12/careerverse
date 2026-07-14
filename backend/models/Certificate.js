const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    title: { type: String, required: true },
    issuedBy: { type: String, default: '' },
    issueDate: { type: Date },
    credentialUrl: { type: String, default: '' },
    fileUrl: { type: String, default: '' },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Certificate', certificateSchema);
