const axios = require('axios');
const Student = require('../models/Student');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Import LeetCode solve stats for a username
// @route   POST /api/coding-profiles/leetcode
// @access  Private (student)
// Note: LeetCode has no official public API. This uses their public (unauthenticated) GraphQL
// endpoint that powers leetcode.com/<username> profile pages — the same data anyone can see by
// visiting that public profile page in a browser, just fetched programmatically. If LeetCode
// changes or restricts this endpoint, this feature will need to be updated or removed.
const importLeetCodeStats = asyncHandler(async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ success: false, message: 'username is required' });

  const student = await Student.findOne({ user: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

  const query = `
    query userStats($username: String!) {
      matchedUser(username: $username) {
        username
        submitStatsGlobal {
          acSubmissionNum { difficulty count }
        }
        profile { ranking }
      }
    }
  `;

  let data;
  try {
    const response = await axios.post(
      'https://leetcode.com/graphql',
      { query, variables: { username } },
      { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
    );
    data = response.data.data.matchedUser;
  } catch (err) {
    return res.status(502).json({ success: false, message: 'Could not reach LeetCode, please try again later' });
  }

  if (!data) {
    return res.status(404).json({ success: false, message: 'LeetCode user not found' });
  }

  const counts = data.submitStatsGlobal.acSubmissionNum.reduce((acc, item) => {
    acc[item.difficulty.toLowerCase()] = item.count;
    return acc;
  }, {});

  student.codingProfiles.leetcode = {
    username: data.username,
    totalSolved: counts.all || 0,
    easySolved: counts.easy || 0,
    mediumSolved: counts.medium || 0,
    hardSolved: counts.hard || 0,
    ranking: data.profile?.ranking || null,
    importedAt: new Date(),
  };
  await student.save();

  res.json({ success: true, leetcode: student.codingProfiles.leetcode });
});

// @desc    Import HackerRank badges for a username
// @route   POST /api/coding-profiles/hackerrank
// @access  Private (student)
// Note: like LeetCode, HackerRank has no official public API for this. Public profile badge
// data is fetched from their public (unauthenticated) badges endpoint used by profile pages.
// This is best-effort: if HackerRank changes their response shape, this degrades to storing
// just the username without badge details rather than failing the whole request.
const importHackerRankStats = asyncHandler(async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ success: false, message: 'username is required' });

  const student = await Student.findOne({ user: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

  let badges = [];
  try {
    const response = await axios.get(
      `https://www.hackerrank.com/rest/hackers/${username}/badges`,
      { timeout: 10000, headers: { 'User-Agent': 'CareerVerse-App' } }
    );
    badges = (response.data?.models || []).map((b) => ({
      name: b.badge_name,
      stars: b.stars_count,
    }));
  } catch (err) {
    // Best-effort: still save the username so the profile link works, just without badge data
    badges = [];
  }

  student.codingProfiles.hackerrank = {
    username,
    badges,
    importedAt: new Date(),
  };
  await student.save();

  res.json({ success: true, hackerrank: student.codingProfiles.hackerrank });
});

module.exports = { importLeetCodeStats, importHackerRankStats };
