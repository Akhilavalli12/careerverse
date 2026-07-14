const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    domain: { type: String, default: '' }, // e.g. official email domain, used for auto-matching students
    address: { type: String, default: '' },
    website: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    branding: {
      primaryColor: { type: String, default: '#3b6fe0' },
      accentColor: { type: String, default: '#2f5bc4' },
      customFooterText: { type: String, default: '' },
    },
    isApproved: { type: Boolean, default: false }, // approved by platform admin
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Institution', institutionSchema);
