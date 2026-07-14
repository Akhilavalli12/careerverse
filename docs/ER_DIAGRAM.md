# CareerVerse — Entity Relationship Diagram

This is written in [Mermaid](https://mermaid.js.org) syntax. GitHub, GitLab, and most modern
Markdown viewers render it automatically. You can also paste it into https://mermaid.live to
view/export as an image.

```mermaid
erDiagram
    USER ||--o| STUDENT : "has profile (if role=student)"
    USER ||--o| INSTITUTION : "has profile (if role=institution)"
    USER ||--o{ APPLICATION : "creates (if role=recruiter)"
    USER ||--o{ NOTIFICATION : receives

    STUDENT ||--o{ PROJECT : owns
    STUDENT ||--o{ CERTIFICATE : owns
    STUDENT ||--o{ APPLICATION : "is shortlisted in"
    STUDENT ||--o{ VERIFICATION : requests

    INSTITUTION ||--o{ VERIFICATION : reviews

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string role "student|recruiter|institution|admin"
        boolean isVerified
        boolean isActive
        string avatarUrl
        date createdAt
    }

    STUDENT {
        ObjectId _id PK
        ObjectId user FK
        string headline
        string bio
        string location
        string[] skills
        Education[] education
        Experience[] experience
        string resumeUrl
        object resumeBuilderData
        string portfolioSlug UK
        string portfolioTemplate
        object analytics
        string githubUsername
        GithubRepo[] githubRepos
        string linkedinUrl
        boolean institutionVerified
        ObjectId[] projects FK
        ObjectId[] certificates FK
        object aiAnalysis
    }

    PROJECT {
        ObjectId _id PK
        ObjectId student FK
        string title
        string description
        string[] techStack
        string githubUrl
        string liveUrl
        string imageUrl
        boolean featured
    }

    CERTIFICATE {
        ObjectId _id PK
        ObjectId student FK
        string title
        string issuedBy
        date issueDate
        string credentialUrl
        string fileUrl
        boolean verified
    }

    INSTITUTION {
        ObjectId _id PK
        ObjectId user FK
        string name
        string domain
        string address
        string website
        string logoUrl
        boolean isApproved
        ObjectId[] students FK
    }

    VERIFICATION {
        ObjectId _id PK
        ObjectId student FK
        ObjectId institution FK
        string status "pending|approved|rejected"
        string studentIdNumber
        string proofDocumentUrl
        ObjectId reviewedBy FK
        string reviewNote
    }

    APPLICATION {
        ObjectId _id PK
        ObjectId recruiter FK
        ObjectId student FK
        string positionTitle
        string status "shortlisted|contacted|interviewing|rejected|hired"
        string notes
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId user FK
        string message
        string type "info|success|warning|application"
        boolean read
        string link
    }
```

## Notes on relationships

- **User → Student/Institution** is a 1:1 "role profile" pattern: a `User` document holds
  auth/identity, and a separate `Student` or `Institution` document holds role-specific data.
  This keeps the auth model lean and avoids a giant polymorphic schema.
- **Student → Project / Certificate** is 1:many, modeled as an array of ObjectId references
  on `Student` (rather than embedding), since projects/certificates are independently
  queried, updated, and deleted via their own endpoints.
- **Verification** is a join-like model between `Student` and `Institution` that tracks a
  request's lifecycle (pending → approved/rejected) rather than a simple boolean, so the
  audit trail (who reviewed it, when, with what note) is preserved.
- **Application** links a `Recruiter` (a `User` with role=recruiter) to a `Student`, tracking
  shortlist status through a small state machine.
