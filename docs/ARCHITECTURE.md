# CareerVerse — System Architecture

```mermaid
flowchart TB
    subgraph Client["Client (Browser)"]
        UI["React + Vite + Tailwind SPA"]
    end

    subgraph CDN["Static Hosting"]
        Vercel["Vercel (Frontend)"]
    end

    subgraph API["Application Server"]
        Express["Express.js REST API"]
        Auth["Auth middleware (JWT + role guard)"]
        Ctrl["Controllers (auth, student, recruiter,\ninstitution, admin, resume, ai, upload)"]
    end

    subgraph Data["Data Layer"]
        Mongo[("MongoDB Atlas")]
    end

    subgraph External["External Services"]
        Cloudinary["Cloudinary (file storage)"]
        SMTP["SMTP (Nodemailer)"]
        GitHub["GitHub REST API"]
        Claude["Anthropic Claude API"]
    end

    UI -->|HTTPS / JSON| Vercel
    Vercel -->|deploys| UI
    UI -->|Axios, Bearer JWT| Express
    Express --> Auth
    Auth --> Ctrl
    Ctrl -->|Mongoose ODM| Mongo
    Ctrl -->|upload buffer| Cloudinary
    Ctrl -->|verification / reset emails| SMTP
    Ctrl -->|import public repos| GitHub
    Ctrl -->|resume analysis prompt| Claude

    subgraph Render["Backend Hosting"]
        Express
    end
```

## Request lifecycle (example: recruiter shortlists a student)

```mermaid
sequenceDiagram
    participant R as Recruiter (Browser)
    participant API as Express API
    participant MW as Auth Middleware
    participant DB as MongoDB
    participant N as Notification

    R->>API: POST /api/applications {studentId, positionTitle}
    API->>MW: verify JWT + role=recruiter
    MW-->>API: req.user attached
    API->>DB: Student.findById(studentId)
    DB-->>API: student document
    API->>DB: Application.create({...})
    API->>DB: Notification.create({user: student.user, ...})
    DB-->>N: notification persisted
    API-->>R: 201 {application}
    Note over R: Student sees the notification<br/>next time the bell polls
```

## Layer responsibilities

| Layer | Responsibility |
|---|---|
| **React SPA** | Routing, forms, client-side auth state (JWT in localStorage), calls REST API via Axios |
| **Express API** | Request validation, JWT verification, role-based authorization, business logic |
| **Mongoose Models** | Schema validation, relationships (ObjectId refs), password hashing hooks |
| **MongoDB Atlas** | Persistent storage |
| **Cloudinary** | Avatar/resume/certificate/project image storage, returns CDN URLs |
| **Nodemailer/SMTP** | Transactional email (verification, password reset) |
| **GitHub REST API** | Public repo import (read-only, no auth required for public repos) |
| **Anthropic Claude API** | Resume scoring, skill-gap detection, career/keyword suggestions |

## Deployment topology

- **Frontend** → static build (`vite build`) deployed to Vercel (or Netlify/any static host)
- **Backend** → Node process deployed to Render (or Railway/Fly.io/any Node host)
- **Database** → MongoDB Atlas (managed, free tier is sufficient for an MVP)
- **File storage** → Cloudinary (managed, free tier sufficient for MVP volume)

No server-side rendering, no separate microservices — this is a single Express monolith
talking to MongoDB, which is the right level of complexity for the current feature set.
Splitting the AI/resume features into a separate service becomes worth considering only if
they need independent scaling or a different runtime (e.g. Python for heavier ML work).
