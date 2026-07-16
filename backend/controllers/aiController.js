const { GoogleGenerativeAI } = require('@google/generative-ai');
const Student = require('../models/Student');
const asyncHandler = require('../middleware/asyncHandler');

const getClient = () => {
  if (!process.env.GEMINI_API_KEY) return null;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  return genAI.getGenerativeModel({
    model: 'gemini-1.5-flash'
  });
};

const buildProfileSummary = (student) => {
  const lines = [];

  if (student.headline) lines.push(`Headline: ${student.headline}`);
  if (student.bio) lines.push(`Bio: ${student.bio}`);
  if (student.skills?.length) lines.push(`Skills: ${student.skills.join(', ')}`);

  if (student.education?.length) {
    lines.push('Education:');
    student.education.forEach((ed) =>
      lines.push(
        `- ${ed.degree || ''} in ${ed.fieldOfStudy || ''} at ${ed.institution || ''} (${ed.startYear || ''}-${ed.endYear || 'present'})`
      )
    );
  }

  if (student.experience?.length) {
    lines.push('Experience:');
    student.experience.forEach((ex) =>
      lines.push(
        `- ${ex.title || ''} at ${ex.company || ''}: ${ex.description || ''}`
      )
    );
  }

  if (student.projects?.length) {
    lines.push('Projects:');
    student.projects.forEach((p) =>
      lines.push(
        `- ${p.title}: ${p.description || ''} (Tech: ${(p.techStack || []).join(', ')})`
      )
    );
  }

  if (student.certificates?.length) {
    lines.push('Certificates:');
    student.certificates.forEach((c) =>
      lines.push(`- ${c.title} (${c.issuedBy || ''})`)
    );
  }

  return lines.join('\n');
};

const parseJSONResponse = (text) => {
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
};

const analyzeResume = asyncHandler(async (req, res) => {
  const client = getClient();

  if (!client) {
    return res.status(503).json({
      success: false,
      message:
        'AI features are not configured. Set GEMINI_API_KEY in backend .env'
    });
  }

  const student = await Student.findOne({ user: req.user._id })
    .populate('projects')
    .populate('certificates');

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student profile not found'
    });
  }

  const profileText = buildProfileSummary(student);

  if (!profileText.trim()) {
    return res.status(400).json({
      success: false,
      message:
        'Add some profile details before running analysis'
    });
  }

  const targetRole = req.body.targetRole || '';

  const prompt = `
You are an expert career coach.

Analyze this student profile ${targetRole ? `for a ${targetRole} role` : ''}.

Profile:
${profileText}

Return ONLY valid JSON:

{
  "resumeScore": 0,
  "resumeFeedback": "",
  "skillGaps": [],
  "careerSuggestions": [],
  "keywordSuggestions": []
}
`;

  const result = await client.generateContent(prompt);

  const text = result.response.text();

  let analysis;

  try {
    analysis = parseJSONResponse(text);
  } catch (err) {
    console.log(text);

    return res.status(500).json({
      success: false,
      message: 'Gemini returned invalid JSON'
    });
  }

  student.aiAnalysis = {
    resumeScore: analysis.resumeScore || 0,
    resumeFeedback: analysis.resumeFeedback || '',
    skillGaps: analysis.skillGaps || [],
    careerSuggestions: analysis.careerSuggestions || [],
    keywordSuggestions: analysis.keywordSuggestions || [],
    lastAnalyzedAt: new Date()
  };

  await student.save();

  res.json({
    success: true,
    aiAnalysis: student.aiAnalysis
  });
});

const getCachedAnalysis = asyncHandler(async (req, res) => {
  const student = await Student.findOne({
    user: req.user._id
  }).select('aiAnalysis');

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student profile not found'
    });
  }

  res.json({
    success: true,
    aiAnalysis: student.aiAnalysis
  });
});

const importLinkedInText = asyncHandler(async (req, res) => {
  const client = getClient();

  if (!client) {
    return res.status(503).json({
      success: false,
      message:
        'LinkedIn import requires GEMINI_API_KEY.'
    });
  }

  const { pastedText } = req.body;

  if (!pastedText || pastedText.length < 40) {
    return res.status(400).json({
      success: false,
      message:
        'Paste more LinkedIn profile content.'
    });
  }

  const student = await Student.findOne({
    user: req.user._id
  });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student profile not found'
    });
  }

  const prompt = `
Extract structured information from this LinkedIn profile text.

${pastedText}

Return ONLY JSON:

{
  "headline": "",
  "bio": "",
  "skills": [],
  "education": [],
  "experience": []
}
`;

  const result = await client.generateContent(prompt);

  const text = result.response.text();

  let parsed;

  try {
    parsed = parseJSONResponse(text);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gemini returned invalid JSON'
    });
  }

  student.skills = Array.from(
    new Set([
      ...(student.skills || []),
      ...(parsed.skills || [])
    ])
  );

  if (parsed.headline && !student.headline)
    student.headline = parsed.headline;

  if (parsed.bio && !student.bio)
    student.bio = parsed.bio;

  await student.save();

  res.json({
    success: true,
    profile: student,
    imported: parsed
  });
});

module.exports = {
  analyzeResume,
  getCachedAnalysis,
  importLinkedInText
};