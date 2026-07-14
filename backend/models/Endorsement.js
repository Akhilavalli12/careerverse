const mongoose = require('mongoose');

const endorsementSchema = new mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    toStudent: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    skill: { type: String, required: true, trim: true },
    message: { type: String, default: '', maxlength: 300 },
  },
  { timestamps: true }
);

// One endorsement per (fromUser, toStudent, skill) combination — prevents spamming the same skill repeatedly
endorsementSchema.index({ fromUser: 1, toStudent: 1, skill: 1 }, { unique: true });

module.exports = mongoose.model('Endorsement', endorsementSchema);
