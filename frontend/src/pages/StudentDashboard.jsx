import { useEffect, useState } from 'react';
import { Plus, Trash2, Github, ExternalLink } from 'lucide-react';
import api from '../api/client';
import AnalyticsPanel from '../components/AnalyticsPanel';

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [newProject, setNewProject] = useState({ title: '', description: '', githubUrl: '' });

  const loadProfile = async () => {
    const res = await api.get('/students/me');
    setProfile(res.data.profile);
    setLoading(false);
  };

  useEffect(() => { loadProfile(); }, []);

  const saveProfile = async (updates) => {
    setSaving(true);
    const res = await api.put('/students/me', updates);
    setProfile(res.data.profile);
    setSaving(false);
  };

  const saveTemplate = async (template) => {
    const res = await api.put('/students/me/template', { template });
    setProfile((p) => ({ ...p, portfolioTemplate: res.data.portfolioTemplate }));
  };

  const addSkill = () => {
    if (!skillInput.trim()) return;
    const skills = [...(profile.skills || []), skillInput.trim()];
    setSkillInput('');
    saveProfile({ skills });
  };

  const removeSkill = (skill) => {
    saveProfile({ skills: profile.skills.filter((s) => s !== skill) });
  };

  const addProject = async () => {
    if (!newProject.title.trim()) return;
    const res = await api.post('/students/me/projects', newProject);
    setProfile((p) => ({ ...p, projects: [...p.projects, res.data.project] }));
    setNewProject({ title: '', description: '', githubUrl: '' });
  };

  const deleteProject = async (id) => {
    await api.delete(`/students/me/projects/${id}`);
    setProfile((p) => ({ ...p, projects: p.projects.filter((pr) => pr._id !== id) }));
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-6 py-20 text-center text-ink-faint">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">My Profile</h1>
          <p className="text-sm text-ink-faint">Manage the information recruiters see on your portfolio.</p>
        </div>
        <a href="/resume-builder" className="text-sm px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 hover:bg-ink/5 dark:hover:bg-paper-light/10">
          Open Resume Builder
        </a>
      </div>

      <AnalyticsPanel />

      <section className="glass rounded-2xl p-6 space-y-3">
        <h2 className="font-semibold">Portfolio Template</h2>
        <div className="flex gap-3">
          {['modern', 'classic', 'minimal'].map((t) => (
            <button
              key={t}
              onClick={() => saveTemplate(t)}
              className={`px-4 py-2 rounded-lg text-sm capitalize border ${
                profile.portfolioTemplate === t
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-ink/20 dark:border-paper-light/20'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <a
          href={`/portfolio/${profile.portfolioSlug || profile._id}`}
          target="_blank"
          rel="noreferrer"
          className="inline-block text-xs text-primary-600 hover:underline"
        >
          Preview your public portfolio →
        </a>
      </section>

      <section className="glass rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-sm mb-1">Headline</label>
          <input
            defaultValue={profile.headline}
            onBlur={(e) => saveProfile({ headline: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 bg-transparent"
            placeholder="e.g. Full-stack developer & AI enthusiast"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Bio</label>
          <textarea
            defaultValue={profile.bio}
            onBlur={(e) => saveProfile({ bio: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 bg-transparent"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Location</label>
          <input
            defaultValue={profile.location}
            onBlur={(e) => saveProfile({ location: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 bg-transparent"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Skills</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {(profile.skills || []).map((s) => (
              <span key={s} className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm">
                {s}
                <button onClick={() => removeSkill(s)} className="hover:text-red-500">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSkill()}
              placeholder="Add a skill and press Enter"
              className="flex-1 px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 bg-transparent"
            />
            <button onClick={addSkill} className="px-4 rounded-lg bg-primary-600 text-white">Add</button>
          </div>
        </div>
        {saving && <p className="text-xs text-ink-faint">Saving...</p>}
      </section>

      <section className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold">Projects</h2>

        {profile.projects?.map((p) => (
          <div key={p._id} className="flex justify-between items-start border-t border-ink/15 dark:border-paper-light/15 pt-4">
            <div>
              <h3 className="font-medium">{p.title}</h3>
              <p className="text-sm text-ink-faint">{p.description}</p>
              {p.githubUrl && (
                <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-xs text-primary-600 flex items-center gap-1 mt-1">
                  <Github size={12} /> View repo <ExternalLink size={10} />
                </a>
              )}
            </div>
            <button onClick={() => deleteProject(p._id)} className="text-red-500 hover:text-red-600">
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        <div className="border-t border-ink/15 dark:border-paper-light/15 pt-4 space-y-2">
          <input
            placeholder="Project title"
            value={newProject.title}
            onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 bg-transparent"
          />
          <input
            placeholder="Short description"
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 bg-transparent"
          />
          <input
            placeholder="GitHub URL (optional)"
            value={newProject.githubUrl}
            onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 bg-transparent"
          />
          <button onClick={addProject} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white">
            <Plus size={16} /> Add project
          </button>
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;
