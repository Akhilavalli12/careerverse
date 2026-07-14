import { Github, ExternalLink, MapPin, ShieldCheck, Award, GraduationCap } from 'lucide-react';

const ModernTemplate = ({ profile }) => (
  <div className="max-w-3xl mx-auto px-6 py-14 space-y-10">
    {/* Ledger header — reads like the top of a registrar's transcript */}
    <div className="flex items-center justify-between font-mono text-[11px] text-ink-faint uppercase tracking-widest">
      <span>CareerVerse Record</span>
      <span>No. {(profile._id || '').toString().slice(-6).toUpperCase()}</span>
    </div>

    <section className="glass deckle-edge rounded-lg p-8">
      <div className="flex items-start gap-5">
        <div className="h-20 w-20 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center text-2xl font-display text-primary-700 dark:text-primary-100 overflow-hidden shrink-0 border-2 border-primary-200 dark:border-primary-700">
          {profile.user?.avatarUrl ? (
            <img src={profile.user.avatarUrl} alt={profile.user.name} className="h-full w-full object-cover" />
          ) : (
            profile.user?.name?.[0] || '?'
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-3xl">{profile.user?.name}</h1>
            {profile.institutionVerified && (
              <span className="stamp text-moss-600 dark:text-moss-100" title="Institution Verified">
                <ShieldCheck size={13} /> Verified
              </span>
            )}
          </div>
          <p className="text-primary-600 dark:text-primary-300 font-medium mt-0.5">{profile.headline}</p>
          {profile.location && (
            <p className="text-sm text-ink-faint flex items-center gap-1 mt-1"><MapPin size={13} /> {profile.location}</p>
          )}
        </div>
      </div>

      {profile.bio && <p className="mt-6 text-sm text-ink-soft dark:text-paper-light/80 leading-relaxed">{profile.bio}</p>}

      {profile.videoIntroUrl && (
        <video src={profile.videoIntroUrl} controls className="w-full rounded-lg mt-6 max-h-80 border border-ink/10" />
      )}

      {profile.skills?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-dashed border-ink/15 dark:border-paper-light/15">
          {profile.skills.map((s) => (
            <span key={s} className="text-xs px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-100 font-medium">{s}</span>
          ))}
        </div>
      )}
    </section>

    {profile.projects?.length > 0 && (
      <section>
        <h2 className="font-display text-xl mb-4 flex items-center gap-2">
          <span className="font-mono text-xs text-ink-faint">§1</span> Projects
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {profile.projects.map((p) => (
            <div key={p._id} className="glass rounded-lg p-5">
              <h3 className="font-display text-lg">{p.title}</h3>
              <p className="text-sm text-ink-soft dark:text-paper-light/70 mt-1 leading-relaxed">{p.description}</p>
              <div className="flex gap-4 mt-3">
                {p.githubUrl && (
                  <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-xs text-primary-600 dark:text-primary-300 flex items-center gap-1 hover:underline">
                    <Github size={12} /> Code
                  </a>
                )}
                {p.liveUrl && (
                  <a href={p.liveUrl} target="_blank" rel="noreferrer" className="text-xs text-primary-600 dark:text-primary-300 flex items-center gap-1 hover:underline">
                    <ExternalLink size={12} /> Live
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    )}

    {profile.certificates?.length > 0 && (
      <section>
        <h2 className="font-display text-xl mb-4 flex items-center gap-2">
          <span className="font-mono text-xs text-ink-faint">§2</span> Certificates
        </h2>
        <div className="space-y-2">
          {profile.certificates.map((c) => (
            <div key={c._id} className="glass rounded-lg p-4 flex items-center gap-3">
              <Award size={17} className="text-primary-600 dark:text-primary-300 shrink-0" />
              <div>
                <p className="font-medium text-sm">{c.title}</p>
                <p className="text-xs text-ink-faint">{c.issuedBy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    )}

    {profile.education?.length > 0 && (
      <section>
        <h2 className="font-display text-xl mb-4 flex items-center gap-2">
          <span className="font-mono text-xs text-ink-faint">§3</span> Education
        </h2>
        <div className="space-y-2">
          {profile.education.map((ed) => (
            <div key={ed._id} className="glass rounded-lg p-4 flex items-start gap-3">
              <GraduationCap size={17} className="text-primary-600 dark:text-primary-300 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">{ed.degree} {ed.fieldOfStudy && `in ${ed.fieldOfStudy}`}</p>
                <p className="text-xs text-ink-faint">{ed.institution} · {ed.startYear}–{ed.endYear || 'Present'}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    )}

    <div className="text-center font-mono text-[10px] text-ink-faint uppercase tracking-widest pt-4 border-t border-dashed border-ink/15 dark:border-paper-light/15">
      Issued via CareerVerse · Record current as of today
    </div>
  </div>
);

export default ModernTemplate;
