/**
 * Seeds the database with realistic demo data so the app can be explored immediately
 * after setup, without manually registering a dozen accounts by hand.
 *
 * Usage: node scripts/seed.js
 * Requires MONGO_URI to be set in .env. Safe to re-run — it clears seeded collections first.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const Project = require('../models/Project');
const Certificate = require('../models/Certificate');
const Institution = require('../models/Institution');
const Verification = require('../models/Verification');
const Application = require('../models/Application');
const Endorsement = require('../models/Endorsement');
const Notification = require('../models/Notification');

const DEMO_PASSWORD = 'password123';

const studentSeeds = [
  {
    name: 'Ananya Rao',
    email: 'ananya@demo.careerverse.app',
    headline: 'Full-stack developer & open-source contributor',
    bio: 'CSE undergrad who enjoys building things end-to-end — from schema design to shipping the UI. Currently deep in the MERN stack and picking up Go on the side.',
    location: 'Hyderabad, India',
    skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Docker'],
    education: [{ institution: 'Geethanjali College of Engineering', degree: 'B.Tech', fieldOfStudy: 'Computer Science', startYear: 2022, endYear: 2026, grade: '8.7 CGPA' }],
    projects: [
      { title: 'CareerVerse', description: 'Verified student portfolio + recruiter discovery platform.', techStack: ['React', 'Express', 'MongoDB'], githubUrl: 'https://github.com/example/careerverse' },
      { title: 'Trinethra', description: 'LLM-based supervisor feedback analyzer with an accept/reject review flow.', techStack: ['Ollama', 'Node.js'], githubUrl: 'https://github.com/example/trinethra' },
    ],
    certificates: [{ title: 'NPTEL Design Thinking', issuedBy: 'NPTEL', issueDate: new Date('2025-03-01') }],
  },
  {
    name: 'Rohan Mehta',
    email: 'rohan@demo.careerverse.app',
    headline: 'Backend engineer, systems-curious',
    bio: 'Interested in distributed systems and databases. Spent last summer optimizing query performance on a 40M-row Postgres table and got hooked.',
    location: 'Bengaluru, India',
    skills: ['Go', 'PostgreSQL', 'Kubernetes', 'gRPC'],
    education: [{ institution: 'IIT Madras', degree: 'B.S.', fieldOfStudy: 'Data Science', startYear: 2023, endYear: 2027 }],
    projects: [{ title: 'query-profiler', description: 'A CLI that annotates slow Postgres queries with EXPLAIN plan visualizations.', techStack: ['Go', 'PostgreSQL'], githubUrl: 'https://github.com/example/query-profiler' }],
    certificates: [],
  },
  {
    name: 'Priya Nair',
    email: 'priya@demo.careerverse.app',
    headline: 'Frontend developer with a design eye',
    bio: 'I care a lot about the details most people skip — focus states, motion timing, contrast ratios. Previously interned on a design systems team.',
    location: 'Kochi, India',
    skills: ['React', 'Tailwind CSS', 'Figma', 'Accessibility'],
    education: [{ institution: 'NIT Calicut', degree: 'B.Tech', fieldOfStudy: 'Information Technology', startYear: 2022, endYear: 2026 }],
    projects: [{ title: 'a11y-lint', description: 'An ESLint plugin that catches common accessibility mistakes in JSX.', techStack: ['TypeScript', 'ESLint'], githubUrl: 'https://github.com/example/a11y-lint' }],
    certificates: [{ title: 'Google UX Design Certificate', issuedBy: 'Coursera', issueDate: new Date('2024-11-01') }],
  },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding...');

  // Clear only demo-namespaced data so this is safe to re-run without nuking a real database
  const demoEmails = [...studentSeeds.map((s) => s.email), 'recruiter@demo.careerverse.app', 'institution@demo.careerverse.app', 'admin@demo.careerverse.app'];
  const existingDemoUsers = await User.find({ email: { $in: demoEmails } });
  const existingDemoUserIds = existingDemoUsers.map((u) => u._id);
  const existingDemoStudents = await Student.find({ user: { $in: existingDemoUserIds } });
  const existingDemoStudentIds = existingDemoStudents.map((s) => s._id);

  await Promise.all([
    Project.deleteMany({ student: { $in: existingDemoStudentIds } }),
    Certificate.deleteMany({ student: { $in: existingDemoStudentIds } }),
    Endorsement.deleteMany({ toStudent: { $in: existingDemoStudentIds } }),
    Application.deleteMany({ student: { $in: existingDemoStudentIds } }),
    Notification.deleteMany({ user: { $in: existingDemoUserIds } }),
    Verification.deleteMany({ student: { $in: existingDemoStudentIds } }),
    Institution.deleteMany({ user: { $in: existingDemoUserIds } }),
    Student.deleteMany({ user: { $in: existingDemoUserIds } }),
    User.deleteMany({ email: { $in: demoEmails } }),
  ]);

  // --- Institution ---
  const institutionUser = await User.create({
    name: 'Geethanjali College of Engineering',
    email: 'institution@demo.careerverse.app',
    password: DEMO_PASSWORD,
    role: 'institution',
    isVerified: true,
  });
  const institution = await Institution.create({
    user: institutionUser._id,
    name: 'Geethanjali College of Engineering and Technology',
    domain: 'gcet.edu.in',
    website: 'https://gcet.edu.in',
    isApproved: true,
    branding: { primaryColor: '#7A5738', accentColor: '#5F6B47', customFooterText: 'Placements Office, GCET' },
  });

  // --- Admin ---
  await User.create({
    name: 'Platform Admin',
    email: 'admin@demo.careerverse.app',
    password: DEMO_PASSWORD,
    role: 'admin',
    isVerified: true,
  });

  // --- Recruiter ---
  const recruiterUser = await User.create({
    name: 'Meera Iyer',
    email: 'recruiter@demo.careerverse.app',
    password: DEMO_PASSWORD,
    role: 'recruiter',
    isVerified: true,
  });

  // --- Students ---
  const createdStudents = [];
  for (const seedData of studentSeeds) {
    const user = await User.create({
      name: seedData.name,
      email: seedData.email,
      password: DEMO_PASSWORD,
      role: 'student',
      isVerified: true,
    });

    const student = await Student.create({
      user: user._id,
      headline: seedData.headline,
      bio: seedData.bio,
      location: seedData.location,
      skills: seedData.skills,
      education: seedData.education,
      institutionVerified: true,
      portfolioTemplate: 'modern',
    });

    for (const p of seedData.projects) {
      const project = await Project.create({ student: student._id, ...p });
      student.projects.push(project._id);
    }
    for (const c of seedData.certificates) {
      const cert = await Certificate.create({ student: student._id, ...c });
      student.certificates.push(cert._id);
    }
    await student.save();

    await Institution.findByIdAndUpdate(institution._id, { $addToSet: { students: student._id } });
    await Verification.create({
      student: student._id,
      institution: institution._id,
      status: 'approved',
      studentIdNumber: `GCET-${Math.floor(1000 + Math.random() * 9000)}`,
      reviewedBy: institutionUser._id,
    });

    createdStudents.push(student);
  }

  // --- A sample shortlist + endorsement so those features have visible data too ---
  await Application.create({
    recruiter: recruiterUser._id,
    student: createdStudents[0]._id,
    positionTitle: 'Full-Stack Engineering Intern',
    status: 'interviewing',
    notes: 'Strong portfolio, moving to technical round.',
  });
  await Notification.create({
    user: createdStudents[0].user,
    message: `You've been shortlisted for "Full-Stack Engineering Intern"`,
    type: 'application',
  });

  await Endorsement.create({
    fromUser: createdStudents[1].user,
    toStudent: createdStudents[0]._id,
    skill: 'React',
    message: 'Worked together on CareerVerse — great instincts for API design.',
  });

  console.log('\nSeed complete. Demo accounts (all use password: ' + DEMO_PASSWORD + '):');
  console.log('  Student:    ananya@demo.careerverse.app');
  console.log('  Student:    rohan@demo.careerverse.app');
  console.log('  Student:    priya@demo.careerverse.app');
  console.log('  Recruiter:  recruiter@demo.careerverse.app');
  console.log('  Institution: institution@demo.careerverse.app');
  console.log('  Admin:      admin@demo.careerverse.app\n');

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
