const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema(
  {
    institution: String,
    degree: String,
    fieldOfStudy: String,
    startYear: Number,
    endYear: Number,
    grade: String,
  },
  { _id: true }
);

const experienceSchema = new mongoose.Schema(
  {
    title: String,
    company: String,
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false },
    description: String,
  },
  { _id: true }
);

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    headline: { type: String, default: '' },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    skills: [{ type: String, trim: true }],
    education: [educationSchema],
    experience: [experienceSchema],
    resumeUrl: { type: String, default: '' },
    videoIntroUrl: { type: String, default: '' },
    resumeBuilderData: {
      summary: { type: String, default: '' },
      template: { type: String, enum: ['classic', 'modern', 'minimal'], default: 'modern' },
      customSections: [
        {
          heading: String,
          items: [String],
        },
      ],
    },
    portfolioSlug: { type: String, unique: true, sparse: true },
    portfolioTemplate: { type: String, enum: ['classic', 'modern', 'minimal'], default: 'modern' },
    analytics: {
      viewCount: { type: Number, default: 0 },
      viewHistory: [
        {
          date: { type: Date, default: Date.now },
          referrer: { type: String, default: '' },
        },
      ],
    },
    githubUsername: { type: String, default: '' },
    githubRepos: [
      {
        name: String,
        description: String,
        url: String,
        stars: Number,
        language: String,
        importedAt: { type: Date, default: Date.now },
      },
    ],
    codingProfiles: {
      leetcode: {
        username: { type: String, default: '' },
        totalSolved: { type: Number, default: null },
        easySolved: { type: Number, default: null },
        mediumSolved: { type: Number, default: null },
        hardSolved: { type: Number, default: null },
        ranking: { type: Number, default: null },
        importedAt: { type: Date, default: null },
      },
      hackerrank: {
        username: { type: String, default: '' },
        badges: [{ name: String, stars: Number }],
        importedAt: { type: Date, default: null },
      },
    },
    linkedinUrl: { type: String, default: '' },
    institutionVerified: { type: Boolean, default: false },
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    certificates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' }],
    aiAnalysis: {
      resumeScore: { type: Number, default: null },
      resumeFeedback: { type: String, default: '' },
      skillGaps: [{ type: String }],
      careerSuggestions: [{ type: String }],
      keywordSuggestions: [{ type: String }],
      lastAnalyzedAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
