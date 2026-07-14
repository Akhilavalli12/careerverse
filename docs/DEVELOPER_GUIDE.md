# CareerVerse — Developer Guide

## Local setup

```bash
git clone <your-repo>
cd careerverse

cd backend
cp .env.example .env    # fill in MONGO_URI at minimum to boot
npm install
npm run dev              # nodemon, http://localhost:5000

# in a second terminal
cd frontend
npm install
npm run dev               # http://localhost:5173
```

Minimum to get a working local dev loop: a `MONGO_URI` (a free MongoDB Atlas cluster takes
5 minutes to set up, see `DEPLOYMENT.md`). Everything else (Cloudinary, SMTP, Anthropic) is
optional — those features degrade gracefully (uploads will error clearly, emails log to
console instead of sending, AI analysis returns a 503 with an explanation) rather than
crashing the app.

## Code conventions

**Backend**
- Controllers are wrapped in `asyncHandler` (`middleware/asyncHandler.js`) so thrown errors
  automatically reach the centralized `errorHandler` — never write your own try/catch in a
  controller just to call `next(err)`.
- Route files only wire `protect`/`authorize` + controller functions — no business logic
  in route files.
- Models validate as much as reasonably possible at the schema level (enums, required
  fields, unique indexes) rather than pushing that into controllers.
- Anything touching an external service (Cloudinary, SMTP, GitHub, Anthropic) lives in
  `config/` or is called directly from a dedicated controller (`uploadController`,
  `resumeController`, `aiController`) — don't sprinkle `axios.get('https://api.github.com...')`
  calls into unrelated controllers.

**Frontend**
- `api/client.js` is the only place that should construct an Axios instance — always import
  and use that, so the auth interceptor and 401-redirect logic stays centralized.
- Auth state lives in `context/AuthContext.jsx`. Don't read `localStorage` directly for user
  state elsewhere — call `useAuth()`.
- Pages fetch their own data with `useEffect` + `api.get(...)`; there's no global state
  management library (Redux/Zustand) because the data-sharing needs are currently simple.
  If cross-page caching becomes a real need, React Query is the natural next addition.
- Tailwind utility classes only — no CSS modules or styled-components. The one shared custom
  class is `.glass` (defined in `index.css`) for the glassmorphism card look.

## Adding a new feature — checklist

Say you're adding "peer endorsements" (a Could-Have feature):

1. **Model**: add an `Endorsement` model (`backend/models/Endorsement.js`) — probably
   `{ fromUser, toStudent, skill, message }`
2. **Controller**: `backend/controllers/endorsementController.js` with `asyncHandler`-wrapped
   functions (`createEndorsement`, `getEndorsementsForStudent`, etc.)
3. **Routes**: `backend/routes/endorsementRoutes.js`, wire `protect`/`authorize` as needed
4. **Wire into `server.js`**: `app.use('/api/endorsements', endorsementRoutes)`
5. **Frontend**: add an `api` call, a small component (e.g. `EndorsementList.jsx`), and
   surface it wherever makes sense (student dashboard, public portfolio)
6. **Test the boot**: `node -e "require('./server.js')"` in `backend/` and `npm run build`
   in `frontend/` before considering it done — both should complete without errors

## Testing philosophy (current state — no test suite yet)

This MVP doesn't ship with Jest/Vitest test suites. Given the scope, the verification
strategy used throughout development was: (1) boot the backend and hit real routes with
`curl`, (2) run `vite build` on the frontend after every meaningful change, (3) unit-test
tricky pure functions (like the PDF generator and the AI JSON-parser) in isolation with
`node -e`. If you're extending this into a long-lived project, adding a proper test suite
(Jest + Supertest for the API, Vitest + React Testing Library for components) should be
one of the first investments — the codebase is structured (controllers as pure-ish
functions, no framework magic) to make that straightforward to retrofit.

## Testing

An automated test suite now exists: **Jest + Supertest + mongodb-memory-server**, covering:

- `tests/auth.test.js` — registration (including duplicate-email, malformed email, weak/short
  password, and validation rejection), login (correct/incorrect credentials), `/auth/me` token
  verification, forgot-password's no-user-enumeration behavior
- `tests/student.test.js` — profile auto-creation, profile updates (including that
  non-allowed fields like `institutionVerified` can't be self-assigned), project CRUD,
  public portfolio access + view counting, recruiter search, and role-based rejection
  (student can't hit recruiter-only routes and vice versa)
- `tests/application.test.js` — the full shortlist flow (recruiter shortlists student →
  student gets a notification), status updates, that one recruiter can't touch another
  recruiter's applications, admin-only route gating including that a deactivated user
  is immediately locked out, and AI/LinkedIn route gating (role checks + the 503-when-unconfigured guard)
- `tests/endorsement.test.js` — endorsing a listed skill, rejecting endorsement of an
  unlisted skill, rejecting self-endorsement, rejecting duplicate endorsements, and grouped
  listing by skill

Run them with:
```bash
cd backend
npm test
```

**Honesty note on verification**: `mongodb-memory-server` downloads a real `mongod` binary
on first run. In the sandboxed environment used to build this project, that download domain
wasn't reachable (network egress is allow-listed to package registries only, not
`fastdl.mongodb.org`), and Ubuntu's default repos no longer ship a `mongodb-server` package
— so I could not execute this suite live here. What I *did* verify in-sandbox:
- `node --check` on every test file and `app.js` — no syntax errors
- `npx jest --listTests` — Jest correctly discovers and would run all three suites
- The refactor that made this possible (splitting `server.js` into a testable `app.js` +
  a thin entry-point `server.js`) was verified by booting the real server and confirming
  `/api/health` still responds correctly

On any machine with normal internet access (or a real local MongoDB), `npm test` will
download the `mongod` binary once (cached afterward) and run for real. If you want to skip
the download entirely, install MongoDB locally and set `MONGOMS_SYSTEM_BINARY` to your
`mongod` path.

### Frontend

No frontend test suite yet. If you want to add one, Vitest + React Testing Library is the
natural fit given the Vite setup already in place — install `vitest`, `@testing-library/react`,
`jsdom`, add a `test` script, and start with `AuthContext` and `ProtectedRoute` since they
carry the most logic.

## Common pitfalls

- **CORS errors in local dev**: make sure `CLIENT_URL` in `backend/.env` matches your
  frontend's actual origin (`http://localhost:5173` by default).
- **"Student profile not found" for a brand-new user**: student profiles are created lazily
  on first `GET /api/students/me` call if one doesn't exist yet — this is intentional
  (`upsert: true` in several places) so registration stays fast.
- **File uploads fail silently**: check that all three `CLOUDINARY_*` env vars are set;
  Multer's `fileFilter` will reject files with an unclear-looking multer error if the
  mimetype doesn't match — check `middleware/upload.js`'s `allowedMimeTypes` map.
