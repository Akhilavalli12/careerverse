# CareerVerse — Folder Structure

```
careerverse/
├── README.md                    # quick start + full API reference table
├── docs/
│   ├── ER_DIAGRAM.md             # database schema + relationships (Mermaid)
│   ├── ARCHITECTURE.md           # system diagram + request lifecycle (Mermaid)
│   ├── DEPLOYMENT.md             # step-by-step deploy to Render/Vercel/Atlas
│   ├── USER_MANUAL.md            # end-user guide (student/recruiter/institution/admin)
│   ├── DEVELOPER_GUIDE.md        # conventions, local setup, extension checklist
│   └── FOLDER_STRUCTURE.md       # this file
│
├── backend/
│   ├── server.js                 # Express app entry point, mounts all routes
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   └── cloudinary.js         # Cloudinary config + upload helper
│   ├── models/
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Project.js
│   │   ├── Certificate.js
│   │   ├── Institution.js
│   │   ├── Verification.js
│   │   ├── Application.js
│   │   └── Notification.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── applicationController.js
│   │   ├── notificationController.js
│   │   ├── uploadController.js
│   │   ├── institutionController.js
│   │   ├── adminController.js
│   │   ├── resumeController.js   # resume builder, PDF, QR, GitHub import
│   │   └── aiController.js       # Claude-powered resume analysis
│   ├── routes/
│   │   └── (one file per controller, same naming)
│   ├── middleware/
│   │   ├── auth.js                # JWT verification + role-based authorize()
│   │   ├── upload.js               # Multer config per upload kind
│   │   ├── asyncHandler.js
│   │   └── errorHandler.js
│   └── utils/
│       ├── generateToken.js
│       ├── sendEmail.js
│       └── generateResumePDF.js
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx                # all route definitions
        ├── index.css              # Tailwind entry + .glass utility
        ├── api/
        │   └── client.js           # Axios instance, auth interceptor
        ├── context/
        │   └── AuthContext.jsx     # login/register/logout, current user state
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── NotificationBell.jsx
        │   ├── AIInsights.jsx
        │   └── AnalyticsPanel.jsx
        ├── portfolio-templates/
        │   ├── ModernTemplate.jsx
        │   ├── ClassicTemplate.jsx
        │   └── MinimalTemplate.jsx
        └── pages/
            ├── Landing.jsx, About.jsx, Features.jsx, Pricing.jsx, Contact.jsx
            ├── Login.jsx, Register.jsx
            ├── Dashboard.jsx            # routes to the right dashboard by role
            ├── StudentDashboard.jsx
            ├── RecruiterDashboard.jsx
            ├── InstitutionDashboard.jsx
            ├── AdminDashboard.jsx
            ├── Settings.jsx
            ├── Portfolio.jsx             # public, template-aware
            ├── ResumeBuilder.jsx
            ├── ApplicationTracker.jsx
            └── NotFound.jsx
```
