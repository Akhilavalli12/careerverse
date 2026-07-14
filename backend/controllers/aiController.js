const Anthropic = require('@anthropic-ai/sdk');
const Student = require('../models/Student');
const asyncHandler = require('../middleware/asyncHandler');

const getClient = () => {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
};

// Builds a compact text representation of the student's profile for the model prompt
const buildProfileSummary = (student) => {
  const lines = [];
  if (student.headline) lines.push(`Headline: ${student.headline}`);
  if (student.bio) lines.push(`Bio: ${student.bio}`);
  if (student.skills?.length) lines.push(`Skills: ${student.skills.join(', ')}`);
  if (student.education?.length) {
    lines.push('Education:');
    student.education.forEach((ed) => lines.push(`- ${ed.degree || ''} in ${ed.fieldOfStudy || ''} at ${ed.institution || ''} (${ed.startYear || ''}-${ed.endYear || 'present'})`));
  }
  if (student.experience?.length) {
    lines.push('Experience:');
    student.experience.forEach((ex) => lines.push(`- ${ex.title || ''} at ${ex.company || ''}: ${ex.description || ''}`));
  }
  if (student.projects?.length) {
    lines.push('Projects:');
    student.projects.forEach((p) => lines.push(`- ${p.title}: ${p.description || ''} (Tech: ${(p.techStack || []).join(', ')})`));
  }
  if (student.certificates?.length) {
    lines.push('Certificates:');
    student.certificates.forEach((c) => lines.push(`- ${c.title} (${c.issuedBy || ''})`));
  }
  return lines.join('\n');
};

const parseJSONResponse = (text) => {
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
};

// @desc    Run AI resume analysis: score, feedback, skill gaps, keyword suggestions, career ideas
// @route   POST /api/ai/analyze
// @access  Private (student)
const analyzeResume = asyncHandler(async (req, res) => {
  const client = getClient();
  if (!client) {
    return res.status(503).json({
      success: false,
      message: 'AI features are not configured. Set ANTHROPIC_API_KEY in the backend .env to enable this.',
    });
  }

  const student = await Student.findOne({ user: req.user._id })
    .populate('projects')
    .populate('certificates');

  if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

  const profileText = buildProfileSummary(student);
  if (!profileText.trim()) {
    return res.status(400).json({ success: false, message: 'Add some profile details (skills, projects, education) before running analysis' });
  }

  const targetRole = req.body.targetRole || '';

  const prompt = `You are a career coach reviewing a student's portfolio profile for a job/internship search${targetRole ? ` targeting the role: "${targetRole}"` : ''}.

Profile:
${profileText}

Respond ONLY with valid JSON (no markdown fences, no preamble) in exactly this shape:
{
  "resumeScore": <integer 0-100>,
  "resumeFeedback": "<2-4 sentence overall feedback, direct and constructive>",
  "skillGaps": ["<skill or area missing for the target role or general employability>", ...up to 6],
  "careerSuggestions": ["<specific role or career path suited to this profile>", ...up to 5],
  "keywordSuggestions": ["<ATS/recruiter keyword this profile should include but currently lacks>", ...up to 8]
}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const textBlock = message.content.find((b) => b.type === 'text');
  let analysis;
  try {
    analysis = parseJSONResponse(textBlock.text);
  } catch (e) {
    return res.status(502).json({ success: false, message: 'AI response could not be parsed, please try again' });
  }

  student.aiAnalysis = {
    resumeScore: analysis.resumeScore,
    resumeFeedback: analysis.resumeFeedback,
    skillGaps: analysis.skillGaps || [],
    careerSuggestions: analysis.careerSuggestions || [],
    keywordSuggestions: analysis.keywordSuggestions || [],
    lastAnalyzedAt: new Date(),
  };
  await student.save();

  res.json({ success: true, aiAnalysis: student.aiAnalysis });
});

// @desc    Get the last cached AI analysis without re-running it
// @route   GET /api/ai/analysis
// @access  Private (student)
const getCachedAnalysis = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id }).select('aiAnalysis');
  if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });
  res.json({ success: true, aiAnalysis: student.aiAnalysis });
});

// @desc    Parse pasted LinkedIn profile text into structured data and merge into the student profile
// @route   POST /api/ai/linkedin-import
// @access  Private (student)
// Note: LinkedIn has no public API for profile export/import without an official OAuth
// partnership, and scraping LinkedIn profiles violates their Terms of Service. This endpoint
// instead accepts text the student copy-pastes themselves from their own LinkedIn profile
// page (something only they can do, on their own account) and uses Claude to structure it.
const importLinkedInText = asyncHandler(async (req, res) => {
  const client = getClient();
  if (!client) {
    return res.status(503).json({
      success: false,
      message: 'LinkedIn import requires AI parsing, which is not configured. Set ANTHROPIC_API_KEY to enable this.',
    });
  }

  const { pastedText } = req.body;
  if (!pastedText || pastedText.trim().length < 40) {
    return res.status(400).json({
      success: false,
      message: 'Paste more of your LinkedIn profile text (headline, experience, education sections work best).',
    });
  }

  const student = await Student.findOne({ user: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

  const prompt = `Extract structured profile data from this text a student copy-pasted from their own LinkedIn profile page.

Pasted text:
"""
${pastedText.slice(0, 8000)}
"""

Respond ONLY with valid JSON (no markdown fences, no preamble) in exactly this shape. Omit fields you can't find with reasonable confidence rather than guessing:
{
  "headline": "<one-line professional headline, or null>",
  "bio": "<about/summary section text, or null>",
  "skills": ["<skill>", ...],
  "education": [{ "institution": "", "degree": "", "fieldOfStudy": "", "startYear": <int or null>, "endYear": <int or null> }],
  "experience": [{ "title": "", "company": "", "description": "" }]
}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1536,
    messages: [{ role: 'user', content: prompt }],
  });

  const textBlock = message.content.find((b) => b.type === 'text');
  let parsed;
  try {
    parsed = parseJSONResponse(textBlock.text);
  } catch (e) {
    return res.status(502).json({ success: false, message: 'Could not parse the pasted text, please try again with more context' });
  }

  // Merge rather than overwrite: append new skills/education/experience, don't duplicate existing skills,
  // and only fill headline/bio if they're currently empty (so we don't clobber manual edits silently)
  const mergedSkills = Array.from(new Set([...(student.skills || []), ...(parsed.skills || [])]));

  if (parsed.headline && !student.headline) student.headline = parsed.headline;
  if (parsed.bio && !student.bio) student.bio = parsed.bio;
  student.skills = mergedSkills;

  if (Array.isArray(parsed.education)) {
    parsed.education.forEach((ed) => {
      const alreadyExists = student.education.some(
        (existing) => existing.institution === ed.institution && existing.degree === ed.degree
      );
      if (!alreadyExists && ed.institution) student.education.push(ed);
    });
  }

  if (Array.isArray(parsed.experience)) {
    parsed.experience.forEach((ex) => {
      const alreadyExists = student.experience.some(
        (existing) => existing.title === ex.title && existing.company === ex.company
      );
      if (!alreadyExists && ex.title) student.experience.push(ex);
    });
  }

  await student.save();

  res.json({
    success: true,
    message: 'LinkedIn data imported and merged into your profile',
    profile: student,
    imported: parsed,
  });
});

module.exports = { analyzeResume, getCachedAnalysis, importLinkedInText };
