const Groq = require("groq-sdk");
const Student = require("../models/Student");
const asyncHandler = require("../middleware/asyncHandler");

const getClient = () => {
  if (!process.env.GROQ_API_KEY) return null;

  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
};

const buildProfileSummary = (student) => {
  const lines = [];

  if (student.headline)
    lines.push(`Headline: ${student.headline}`);

  if (student.bio)
    lines.push(`Bio: ${student.bio}`);

  if (student.skills?.length)
    lines.push(`Skills: ${student.skills.join(", ")}`);

  if (student.education?.length) {
    lines.push("Education:");
    student.education.forEach((ed) => {
      lines.push(
        `- ${ed.degree || ""} in ${ed.fieldOfStudy || ""} at ${
          ed.institution || ""
        } (${ed.startYear || ""}-${ed.endYear || "Present"})`
      );
    });
  }

  if (student.experience?.length) {
    lines.push("Experience:");
    student.experience.forEach((ex) => {
      lines.push(
        `- ${ex.title || ""} at ${ex.company || ""}: ${
          ex.description || ""
        }`
      );
    });
  }

  if (student.projects?.length) {
    lines.push("Projects:");
    student.projects.forEach((p) => {
      lines.push(
        `- ${p.title || ""}: ${p.description || ""} (Tech: ${
          (p.techStack || []).join(", ")
        })`
      );
    });
  }

  if (student.certificates?.length) {
    lines.push("Certificates:");
    student.certificates.forEach((c) => {
      lines.push(`- ${c.title || ""} (${c.issuedBy || ""})`);
    });
  }

  return lines.join("\n");
};

const parseJSONResponse = (text) => {
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
};

// =======================
// ANALYZE RESUME
// =======================

const analyzeResume = asyncHandler(async (req, res) => {
  const client = getClient();

  if (!client) {
    return res.status(503).json({
      success: false,
      message: "GROQ_API_KEY missing in backend .env",
    });
  }

  const student = await Student.findOne({
    user: req.user._id,
  })
    .populate("projects")
    .populate("certificates");

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student profile not found",
    });
  }

  const profileText = buildProfileSummary(student);

  if (!profileText.trim()) {
    return res.status(400).json({
      success: false,
      message:
        "Please add some skills, projects, education or experience first.",
    });
  }

  const targetRole = req.body.targetRole || "";

  const prompt = `
You are an expert resume reviewer and career coach.

Analyze this student profile ${
    targetRole ? `for the role "${targetRole}"` : ""
  }.

PROFILE:
${profileText}

Return ONLY valid JSON.

{
  "resumeScore": 85,
  "resumeFeedback": "Short feedback here",
  "skillGaps": [],
  "careerSuggestions": [],
  "keywordSuggestions": []
}
`;

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const text = response.choices[0].message.content;

    if (!text) {
      return res.status(500).json({
        success: false,
        message: "Groq returned an empty response.",
      });
    }

    let analysis;

    try {
      analysis = parseJSONResponse(text);
    } catch (err) {
      console.log("Groq Raw Response:");
      console.log(text);

      return res.status(500).json({
        success: false,
        message: "Groq returned invalid JSON.",
      });
    }

    student.aiAnalysis = {
      resumeScore: analysis.resumeScore || 0,
      resumeFeedback: analysis.resumeFeedback || "",
      skillGaps: analysis.skillGaps || [],
      careerSuggestions: analysis.careerSuggestions || [],
      keywordSuggestions: analysis.keywordSuggestions || [],
      lastAnalyzedAt: new Date(),
    };

    await student.save();

    res.json({
      success: true,
      aiAnalysis: student.aiAnalysis,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});
// =======================
// GET CACHED ANALYSIS
// =======================

const getCachedAnalysis = asyncHandler(async (req, res) => {
  const student = await Student.findOne({
    user: req.user._id,
  }).select("aiAnalysis");

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student profile not found",
    });
  }

  res.json({
    success: true,
    aiAnalysis: student.aiAnalysis,
  });
});

// =======================
// LINKEDIN IMPORT
// =======================

const importLinkedInText = asyncHandler(async (req, res) => {
  const client = getClient();

  if (!client) {
    return res.status(503).json({
      success: false,
      message: "GROQ_API_KEY missing.",
    });
  }

  const { pastedText } = req.body;

  if (!pastedText || pastedText.length < 40) {
    return res.status(400).json({
      success: false,
      message: "Please paste more LinkedIn content.",
    });
  }

  const student = await Student.findOne({
    user: req.user._id,
  });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student profile not found",
    });
  }

  const prompt = `
Extract structured information from this LinkedIn profile text.

${pastedText}

Return ONLY JSON.

{
  "headline": "",
  "bio": "",
  "skills": [],
  "education": [],
  "experience": []
}
`;

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
    });

    const text = response.choices[0].message.content;

    let parsed;

    try {
      parsed = parseJSONResponse(text);
    } catch (err) {
      console.log("Groq Raw Response:");
      console.log(text);

      return res.status(500).json({
        success: false,
        message: "Groq returned invalid JSON.",
      });
    }

    student.skills = Array.from(
      new Set([
        ...(student.skills || []),
        ...(parsed.skills || []),
      ])
    );

    if (parsed.headline && !student.headline)
      student.headline = parsed.headline;

    if (parsed.bio && !student.bio)
      student.bio = parsed.bio;

    if (parsed.education?.length) {
      student.education = parsed.education;
    }

    if (parsed.experience?.length) {
      student.experience = parsed.experience;
    }

    await student.save();

    res.json({
      success: true,
      imported: parsed,
      profile: student,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = {
  analyzeResume,
  getCachedAnalysis,
  importLinkedInText,
};