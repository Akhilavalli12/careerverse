const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    positionTitle: { type: String, required: true },
    status: {
      type: String,
      enum: ['shortlisted', 'contacted', 'interviewing', 'rejected', 'hired'],
      default: 'shortlisted',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Application', applicationSchema);
