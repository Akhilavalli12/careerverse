# CareerVerse — User Manual

## For Students

### Getting started
1. Register at `/register`, choosing "Student" as your role
2. Check your email for a verification link (if SMTP isn't configured in this deployment,
   ask your admin — you can still use the app, just without the verified checkmark)
3. You'll land on your dashboard with an empty profile

### Building your profile
- **Headline & bio**: click into the fields on your dashboard, they save automatically when
  you click away
- **Skills**: type a skill and press Enter to add it; click the × on a skill chip to remove it
- **Projects**: fill in the title, description, and optional GitHub link at the bottom of the
  Projects section, then click "Add project"
- **GitHub import**: go to Resume Builder → GitHub Import, enter your username, click Import —
  your public repositories (excluding forks) will be listed there

### Resume Builder
- Go to `/resume-builder` from your dashboard
- Write a professional summary and pick a template style
- Add custom sections for anything not covered elsewhere (e.g. "Achievements", "Languages")
- Click **Download PDF** to generate a resume from your full profile (summary, skills,
  experience, education, projects, certificates) — no manual formatting needed

### AI Insights
- On the Resume Builder page, optionally enter a target role (e.g. "Backend Developer")
- Click **Analyze my profile** — this sends your profile to Claude and returns a strength
  score, feedback, skill gaps, career suggestions, and keywords to add
- This requires the site owner to have configured an Anthropic API key; if you see a
  "not configured" message, that feature isn't enabled on this deployment

### Getting verified
- Go to your institution's verification page (ask your admin/institution for the link, or
  find your institution listed publicly) and submit a verification request with your student
  ID number
- Once your institution approves it, a green shield badge appears on your public portfolio

### Sharing your portfolio
- Your public portfolio lives at `/portfolio/<your-id-or-slug>`
- Go to Resume Builder → Portfolio QR Code → Generate, to get a scannable QR code linking to it
- Check Analytics on your dashboard to see how many people have viewed it

## For Recruiters

### Getting started
Register with role "Recruiter". Your dashboard is a candidate search tool.

### Finding candidates
- Search by keyword (matches headline/bio) and/or by skills (comma-separated)
- Each result card shows name, headline, location, and top skills
- Click **Shortlist** to add a candidate to your Application Tracker with a position title

### Tracking applications
- Go to `/applications` (or "View Application Tracker" from your dashboard)
- Update each candidate's status as they move through your pipeline: shortlisted → contacted
  → interviewing → hired/rejected
- Add notes as needed

## For Institutions

### Getting started
Register with role "Institution". Set up your institution profile (name, official domain,
website) — an admin needs to approve it before it's publicly listed, but you can review
verification requests as soon as your profile exists.

### Reviewing verification requests
- Students who select your institution and submit a request appear in your dashboard's
  verification queue
- Approve or reject each request; approving flips the student's `institutionVerified` flag
  and notifies them automatically

## For Admins

Admin accounts aren't self-registrable — an existing admin (or direct database access)
must set a user's `role` field to `admin`. From the admin dashboard you can:
- View platform-wide stats (users by role, verified students, total applications)
- Activate/deactivate any user account
- Approve pending institutions so they appear publicly
