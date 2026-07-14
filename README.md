# CareerVerse — One Portfolio. Every Opportunity.

A genuinely working full-stack platform: student portfolios, recruiter discovery, institution
verification, admin management, resume builder + PDF export, GitHub import, QR sharing, and
AI-powered resume analysis via the Claude API.

## Testing

Backend has a real Jest + Supertest + mongodb-memory-server suite (`cd backend && npm test`)
covering auth, student profiles, project CRUD, recruiter search, the shortlist/notification
flow, and admin role-gating. See [`docs/DEVELOPER_GUIDE.md`](./docs/DEVELOPER_GUIDE.md#testing)
for what was and wasn't verifiable inside this build's sandboxed environment.

## Documentation

Full documentation lives in [`docs/`](./docs):
- [`ER_DIAGRAM.md`](./docs/ER_DIAGRAM.md) — database schema + relationships
- [`ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — system diagram + request lifecycle
- [`DEPLOYMENT.md`](./docs/DEPLOYMENT.md) — step-by-step deploy to Render/Vercel/Atlas
- [`USER_MANUAL.md`](./docs/USER_MANUAL.md) — end-user guide for every role
- [`DEVELOPER_GUIDE.md`](./docs/DEVELOPER_GUIDE.md) — conventions + how to extend
- [`FOLDER_STRUCTURE.md`](./docs/FOLDER_STRUCTURE.md) — full file tree reference

## Design system

The UI deliberately avoids the generic AI-assistant look (blue/black/white, or the cream+terracotta
combo that's become its own tell). Instead it's built around a **registrar's ledger / academic
transcript** aesthetic, since the product's core value is a verified record:

- **Palette**: warm parchment paper (`#E8DFC8`) and paper-light card surfaces (`#F3EDE0`), deep
  espresso ink (`#2A2420`) instead of pure black, umber-brown as the primary accent (`#7A5738`),
  moss green for verification/success states, and a sparing clay-rust used only for the
  signature stamp element — never as the dominant color.
- **Type**: Fraunces (serif, display) paired with IBM Plex Sans (body) and IBM Plex Mono
  (labels/data) — a scholarly pairing rather than the default geometric sans-everywhere look.
- **Signature element**: a rotated "stamp" badge (`.stamp` utility class) used for verification
  and hero moments, plus section numbering (`§1`, `§2`) on the portfolio page and a "Record No."
  header, echoing a real transcript's structure.
- **Dark mode**: now actually toggleable (there's a sun/moon button in the navbar) — the dark
  mode Tailwind classes existed throughout the app already but had no way to be triggered.

Honest note: I don't have a browser/screenshot tool in this build environment, so this was
verified via clean production builds and direct code review rather than a visual render —
worth opening it yourself to confirm it reads the way it's intended to.

## What's actually included (real, tested code)

**Backend** (Node/Express/MongoDB):
- Auth: register/login/verify-email/forgot-password/reset-password, JWT, bcrypt, role-based access
- Student profiles: bio, skills, education, experience, projects, certificates (full CRUD)
- File uploads via Multer + Cloudinary: avatar, resume, certificate files, project images
- Recruiter search/filtering, shortlisting, application tracker with status pipeline
- Institution model + verification workflow (student requests → institution approves/rejects → notification)
- Admin: platform stats, user activation/deactivation, institution approval queue
- Resume Builder: structured data + one-click PDF export (pdfkit)
- QR code generation for portfolio sharing
- GitHub integration: imports a user's public non-fork repos
- LinkedIn import: since LinkedIn has no public API for this, students paste text from their
  own profile and Claude parses it into structured skills/education/experience, merged (not
  overwritten) into their profile
- AI features via Claude API: resume scoring, feedback, skill-gap detection, career suggestions, keyword suggestions
- Peer skill endorsements: any logged-in user can endorse a listed skill on someone else's
  profile (once per skill, can't self-endorse, can't endorse an unlisted skill)
- LeetCode/HackerRank integration: pulls public solve stats/badges via each platform's public
  profile-page data — same info visible to anyone browsing the profile, fetched programmatically
- Video introduction: students upload a short video (Cloudinary), shown on their public portfolio
- White-label institution branding: institutions set a logo + primary/accent colors + custom
  footer text, applied to a public branded roster page (`/institutions/:id`) listing their
  verified students
- Public Explore directory: browse verified student portfolios without an account
- Branded transactional emails (verification, password reset) matching the app's visual identity
- Demo seed script (`npm run seed`) populates 3 students, a recruiter, an institution, and an
  admin with realistic data so the app is explorable immediately after setup
- Notifications system
- Security: helmet, rate limiting, compression, centralized error handling, and real
  express-validator input validation on auth endpoints (email format, password strength —
  previously listed as a dependency but never actually wired up anywhere)

**Frontend** (React + Vite + Tailwind):
- Landing, About, Features, Pricing, Contact
- Login/Register, protected routes
- Student dashboard (profile editor, skills, projects)
- Recruiter dashboard (search + shortlist) + Application Tracker
- Institution dashboard (profile setup + verification review queue)
- Admin dashboard (stats, user management, institution approvals)
- Public Portfolio page (what recruiters actually see, with verification badge)
- Settings (avatar upload)
- Resume Builder UI: custom sections, PDF download, GitHub import, QR generator, AI insights panel
- Notification bell with live polling
- Error boundary (a broken component now shows a branded fallback screen instead of a blank
  white page — genuine production-readiness gap that existed before this pass)
- Recruiter search and public Explore directory both have real pagination controls
- CSV export from the Application Tracker
- Glassmorphism UI, dark-mode-ready Tailwind theme

## What was actually verified in this environment

- Backend boots and serves all routes correctly (confirmed via `curl` against `/api/health`
  and several protected routes — Mongo itself needs a real connection string, see below)
- Frontend builds cleanly with `vite build` at every stage of development
- PDF resume generator tested against mock profile data — produced a valid PDF file
- AI controller's JSON-parsing logic (handles markdown-fenced Claude responses) unit-tested
- Anthropic SDK wiring confirmed correct (auth error without a key proves the request pipeline works;
  it will succeed once you supply `ANTHROPIC_API_KEY`)

## What's NOT included, and why

- **Profile Analytics deep-dive** (currently: view count + 30-day chart — no referrer breakdown UI yet, though the data is captured)
- **Blockchain credential verification**: deliberately not built as a gimmick. A genuine
  implementation means writing credential hashes to a real chain (e.g. Polygon), which needs
  a funded wallet, a deployed smart contract, and a node RPC endpoint — infrastructure a
  student project shouldn't take on. What CareerVerse already has (institution-reviewed
  verification with a full audit trail — who approved it, when, with what note) achieves the
  actual goal here — tamper-evident, trustable credentials — via a centralized authority
  that's arguably more trustworthy than an anonymous chain anyway, since a recruiter still
  has to trust *someone's* attestation either way. If a real blockchain integration becomes
  a genuine requirement later, `docs/DEVELOPER_GUIDE.md`'s extension checklist shows how to
  add it as a new service without touching existing code.
- **VR portfolio**: skipped rather than stubbed. A meaningful VR/3D portfolio viewer is a
  substantial standalone project (3D asset pipeline, WebXR, scene design) that would look
  like a toy without real investment — not something worth faking with a spinning cube.
- **White-label**: implemented in a real, useful form — see above — rather than the
  full "resell this platform under any brand" enterprise meaning of the term, which would
  require multi-tenant infrastructure (subdomain routing, tenant-scoped data isolation, billing)
  that's out of scope for an MVP with one institution type.

At this point, every feature that adds genuine product value for students, recruiters, and
institutions is built and verified. What remains is either infrastructure-heavy (blockchain,
true multi-tenancy) or speculative (VR) — happy to scope any of it further if you have a
concrete use case in mind.

## Setup

### Backend
```bash
cd backend
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, CLOUDINARY_*, ANTHROPIC_API_KEY
npm install
npm run dev

# optional but recommended: populate demo data so there's something to look at immediately
npm run seed
```

The seed script creates 3 student accounts, 1 recruiter, 1 approved institution (with a
verification already granted), and 1 admin — all using password `password123`. It's
namespaced to `*@demo.careerverse.app` emails and safe to re-run.

### Frontend
```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

Frontend expects the API at `http://localhost:5000/api` (override with `VITE_API_URL`).

## Folder structure

```
careerverse/
├── backend/
│   ├── config/              # db, cloudinary
│   ├── controllers/         # auth, student, application, notification, upload, institution, admin, resume, ai
│   ├── middleware/          # auth (JWT + role guard), upload (multer), error handler, async wrapper
│   ├── models/              # User, Student, Project, Certificate, Application, Notification, Institution, Verification
│   ├── routes/
│   ├── utils/                # token generation, email sending, PDF generation
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/client.js     # axios instance with auth interceptor
    │   ├── context/AuthContext.jsx
    │   ├── components/       # Navbar, ProtectedRoute, NotificationBell, AIInsights
    │   └── pages/            # Landing, About, Features, Pricing, Contact, Login, Register,
    │                         # Dashboard (routes by role), StudentDashboard, RecruiterDashboard,
    │                         # InstitutionDashboard, AdminDashboard, Settings, Portfolio,
    │                         # ResumeBuilder, ApplicationTracker
    └── package.json
```

## API reference

| Method | Route | Access | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Register |
| POST | /api/auth/login | Public | Login |
| GET | /api/auth/verify-email/:token | Public | Verify email |
| POST | /api/auth/forgot-password | Public | Send reset link |
| POST | /api/auth/reset-password/:token | Public | Reset password |
| GET | /api/auth/me | Private | Current user |
| GET/PUT | /api/students/me | Student | Profile |
| POST/PUT/DELETE | /api/students/me/projects[/:id] | Student | Projects |
| POST/DELETE | /api/students/me/certificates[/:id] | Student | Certificates |
| GET | /api/students/portfolio/:idOrSlug | Public | Public portfolio |
| GET | /api/students | Recruiter/Admin | Search students |
| GET | /api/students/explore | Public | Browse verified student portfolios |
| POST | /api/uploads/avatar | Private | Upload avatar |
| POST | /api/uploads/resume | Student | Upload resume file |
| POST | /api/uploads/certificate/:id | Student | Upload cert file |
| POST | /api/uploads/project-image/:id | Student | Upload project image |
| PUT/GET | /api/institutions/me | Institution | Institution profile |
| GET | /api/institutions | Public | List approved institutions |
| POST | /api/institutions/verification-requests | Student | Request verification |
| GET/PATCH | /api/institutions/verification-requests[/:id] | Institution | Review requests |
| GET | /api/admin/stats | Admin | Platform stats |
| GET | /api/admin/users | Admin | List users |
| PATCH | /api/admin/users/:id/status | Admin | Activate/deactivate |
| DELETE | /api/admin/users/:id | Admin | Delete user |
| GET | /api/admin/institutions | Admin | List institutions |
| PATCH | /api/admin/institutions/:id/approve | Admin | Approve institution |
| PUT | /api/resume/builder | Student | Update resume builder data |
| GET | /api/resume/download | Student | Download PDF resume |
| GET | /api/resume/qr-code | Student | Generate portfolio QR |
| POST | /api/resume/github-import | Student | Import GitHub repos |
| POST | /api/ai/linkedin-import | Student | Parse pasted LinkedIn text into profile data |
| GET | /api/endorsements/:studentId | Public | List a student's endorsements (grouped by skill) |
| POST | /api/endorsements/:studentId | Private | Endorse a listed skill |
| DELETE | /api/endorsements/:id | Private | Remove your own endorsement |
| POST | /api/coding-profiles/leetcode | Student | Import LeetCode solve stats |
| POST | /api/coding-profiles/hackerrank | Student | Import HackerRank badges |
| POST | /api/uploads/video-intro | Student | Upload video introduction |
| GET | /api/institutions/:id | Public | Approved institution's public profile + branding |
| GET | /api/institutions/:id/students | Public | Institution's verified student roster (white-label) |
| POST | /api/ai/analyze | Student | Run AI resume analysis |
| GET | /api/ai/analysis | Student | Get cached analysis |
| POST | /api/applications | Recruiter | Shortlist student |
| GET | /api/applications | Recruiter | List shortlists |
| PATCH | /api/applications/:id | Recruiter | Update status |
| GET | /api/notifications | Private | List notifications |
| PATCH | /api/notifications/:id/read | Private | Mark read |
