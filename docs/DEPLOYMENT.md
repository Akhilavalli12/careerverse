# CareerVerse — Deployment Guide

This walks through deploying the full stack: MongoDB Atlas → Cloudinary → Backend (Render) →
Frontend (Vercel).

## 1. MongoDB Atlas (database)

1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (the free M0 tier is enough for an MVP)
3. Under **Database Access**, create a user with a strong password
4. Under **Network Access**, add `0.0.0.0/0` (allow from anywhere) for simplicity, or
   restrict to your Render backend's outbound IPs for tighter security
5. Click **Connect → Drivers**, copy the connection string. It looks like:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/careerverse?retryWrites=true&w=majority
   ```
   This is your `MONGO_URI`.

## 2. Cloudinary (file storage)

1. Create a free account at https://cloudinary.com
2. From the dashboard, copy: **Cloud name**, **API Key**, **API Secret**
3. These map to `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

## 3. SMTP (transactional email)

Any SMTP provider works. Quick options:
- **Gmail**: enable 2FA on the account, then generate an "App Password" (not your regular
  password) at https://myaccount.google.com/apppasswords. Use `smtp.gmail.com`, port `587`.
- **SendGrid / Mailgun / Postmark**: sign up, use their SMTP credentials — better deliverability
  for production than a personal Gmail account.

## 4. Anthropic API (AI features)

1. Create an account at https://console.anthropic.com
2. Generate an API key
3. This is your `ANTHROPIC_API_KEY`. Without it, the AI analysis endpoint returns a clear
   503 error rather than crashing — the rest of the app works fine without it.

## 5. Backend → Render

1. Push the `backend/` folder to a GitHub repository (or the whole monorepo — Render lets
   you set a root directory)
2. Create a new **Web Service** on https://render.com, connect your repo
3. Settings:
   - **Root directory**: `backend` (if monorepo)
   - **Build command**: `npm install`
   - **Start command**: `npm start`
   - **Environment**: Node
4. Add all environment variables from `.env.example` under **Environment → Environment
   Variables** (Render's dashboard, not a committed `.env` file)
5. Set `CLIENT_URL` to your eventual Vercel frontend URL (you can update this after step 6)
6. Deploy. Confirm it's live: `curl https://your-backend.onrender.com/api/health`

## 6. Frontend → Vercel

1. Push the `frontend/` folder to GitHub (or use the monorepo with a root directory setting)
2. Import the repo at https://vercel.com/new
3. Settings:
   - **Root directory**: `frontend` (if monorepo)
   - **Framework preset**: Vite
   - **Build command**: `npm run build` (default)
   - **Output directory**: `dist` (default)
4. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
5. Deploy. Vercel gives you a URL like `https://careerverse.vercel.app`
6. Go back to Render and update `CLIENT_URL` to this Vercel URL, then redeploy the backend
   (this is used for CORS and for building email links)

## 7. Post-deploy checklist

- [ ] Register a test student account, confirm the verification email arrives
- [ ] Upload an avatar, confirm it appears via Cloudinary CDN
- [ ] Add a project, generate a resume PDF, confirm it downloads correctly
- [ ] Register a recruiter account, search for the test student, shortlist them
- [ ] Confirm the student receives a notification
- [ ] Register an institution account, submit a verification request as the student, approve
      it as the institution, confirm the student's profile shows "verified"
- [ ] Promote one user to `role: 'admin'` directly in MongoDB Atlas (there's no self-serve
      admin signup, by design) and confirm the admin dashboard loads stats correctly

## Custom domain (optional)

Both Render and Vercel support custom domains under their dashboard's **Domains** section —
point your DNS `CNAME`/`A` record as instructed by each platform, then update `CLIENT_URL`
and `VITE_API_URL` accordingly.
