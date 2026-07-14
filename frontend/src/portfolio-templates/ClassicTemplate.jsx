import { Github, ExternalLink, ShieldCheck } from 'lucide-react';

const ClassicTemplate = ({ profile }) => (
  <div className="max-w-3xl mx-auto px-6 py-14 font-serif">
    <div className="text-center border-b-2 border-ink/20 dark:border-paper-light/20 pb-6 mb-8">
      <h1 className="font-display text-3xl tracking-wide flex items-center justify-center gap-2">
        {profile.user?.name}
        {profile.institutionVerified && <ShieldCheck size={20} className="text-moss-600 dark:text-moss-100" />}
      </h1>
      <p className="text-ink-soft dark:text-ink-faint mt-1">{profile.headline}</p>
      <p className="text-sm text-ink-faint mt-1">{profile.location}</p>
    </div>

    {profile.bio && (
      <section className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-widest border-b border-ink/20 dark:border-paper-light/20 pb-1 mb-3">Summary</h2>
        <p className="text-sm leading-relaxed">{profile.bio}</p>
      </section>
    )}

    {profile.skills?.length > 0 && (
      <section className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-widest border-b border-ink/20 dark:border-paper-light/20 pb-1 mb-3">Skills</h2>
        <p className="text-sm">{profile.skills.join('  ·  ')}</p>
      </section>
    )}

    {profile.education?.length > 0 && (
      <section className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-widest border-b border-ink/20 dark:border-paper-light/20 pb-1 mb-3">Education</h2>
        {profile.education.map((ed) => (
          <div key={ed._id} className="mb-2">
            <p className="text-sm font-semibold">{ed.degree} {ed.fieldOfStudy && `in ${ed.fieldOfStudy}`}</p>
            <p className="text-xs text-ink-faint">{ed.institution} · {ed.startYear}–{ed.endYear || 'Present'}</p>
          </div>
        ))}
      </section>
    )}

    {profile.experience?.length > 0 && (
      <section className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-widest border-b border-ink/20 dark:border-paper-light/20 pb-1 mb-3">Experience</h2>
        {profile.experience.map((ex) => (
          <div key={ex._id} className="mb-3">
            <p className="text-sm font-semibold">{ex.title} — {ex.company}</p>
            <p className="text-sm text-ink-soft dark:text-ink-faint">{ex.description}</p>
          </div>
        ))}
      </section>
    )}

    {profile.projects?.length > 0 && (
      <section className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-widest border-b border-ink/20 dark:border-paper-light/20 pb-1 mb-3">Projects</h2>
        {profile.projects.map((p) => (
          <div key={p._id} className="mb-3">
            <p className="text-sm font-semibold">{p.title}</p>
            <p className="text-sm text-ink-soft dark:text-ink-faint">{p.description}</p>
            <div className="flex gap-3 mt-1">
              {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-xs underline flex items-center gap-1"><Github size={11} /> Code</a>}
              {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noreferrer" className="text-xs underline flex items-center gap-1"><ExternalLink size={11} /> Live</a>}
            </div>
          </div>
        ))}
      </section>
    )}

    {profile.certificates?.length > 0 && (
      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest border-b border-ink/20 dark:border-paper-light/20 pb-1 mb-3">Certificates</h2>
        {profile.certificates.map((c) => (
          <p key={c._id} className="text-sm">{c.title} — <span className="text-ink-faint">{c.issuedBy}</span></p>
        ))}
      </section>
    )}
  </div>
);

export default ClassicTemplate;
