import { ShieldCheck } from 'lucide-react';

const MinimalTemplate = ({ profile }) => (
  <div className="max-w-2xl mx-auto px-6 py-20">
    <h1 className="font-display text-4xl font-medium flex items-center gap-2">
      {profile.user?.name}
      {profile.institutionVerified && <ShieldCheck size={22} className="text-moss-600 dark:text-moss-100" />}
    </h1>
    <p className="text-ink-faint mt-1 mb-10">{profile.headline}{profile.location ? ` · ${profile.location}` : ''}</p>

    {profile.bio && <p className="text-ink-soft dark:text-paper-light/80 leading-relaxed mb-10">{profile.bio}</p>}

    {profile.skills?.length > 0 && (
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest text-ink-faint mb-2">Skills</p>
        <p className="text-sm">{profile.skills.join(', ')}</p>
      </div>
    )}

    {profile.projects?.length > 0 && (
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest text-ink-faint mb-3">Projects</p>
        <div className="space-y-4">
          {profile.projects.map((p) => (
            <div key={p._id}>
              <a href={p.githubUrl || p.liveUrl || '#'} target="_blank" rel="noreferrer" className="font-medium hover:text-primary-600">
                {p.title}
              </a>
              <p className="text-sm text-ink-faint">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {profile.education?.length > 0 && (
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest text-ink-faint mb-3">Education</p>
        {profile.education.map((ed) => (
          <p key={ed._id} className="text-sm">
            {ed.degree} {ed.fieldOfStudy && `in ${ed.fieldOfStudy}`} — {ed.institution}
          </p>
        ))}
      </div>
    )}

    {profile.certificates?.length > 0 && (
      <div>
        <p className="text-xs uppercase tracking-widest text-ink-faint mb-3">Certificates</p>
        {profile.certificates.map((c) => (
          <p key={c._id} className="text-sm">{c.title}</p>
        ))}
      </div>
    )}
  </div>
);

export default MinimalTemplate;
