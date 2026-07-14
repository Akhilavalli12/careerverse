import { useEffect, useState } from 'react';
import { Download, QrCode, Github, Linkedin, Plus, Trash2 } from 'lucide-react';
import api from '../api/client';
import AIInsights from '../components/AIInsights';

const ResumeBuilder = () => {
  const [summary, setSummary] = useState('');
  const [template, setTemplate] = useState('modern');
  const [sections, setSections] = useState([]);
  const [githubUsername, setGithubUsername] = useState('');
  const [githubRepos, setGithubRepos] = useState([]);
  const [linkedinText, setLinkedinText] = useState('');
  const [linkedinStatus, setLinkedinStatus] = useState('');
  const [linkedinLoading, setLinkedinLoading] = useState(false);
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [leetcodeStats, setLeetcodeStats] = useState(null);
  const [hackerrankUsername, setHackerrankUsername] = useState('');
  const [hackerrankStats, setHackerrankStats] = useState(null);
  const [codingStatus, setCodingStatus] = useState('');
  const [qr, setQr] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/students/me').then((res) => {
      const p = res.data.profile;
      setSummary(p.resumeBuilderData?.summary || '');
      setTemplate(p.resumeBuilderData?.template || 'modern');
      setSections(p.resumeBuilderData?.customSections || []);
      setGithubUsername(p.githubUsername || '');
      setGithubRepos(p.githubRepos || []);
      setLeetcodeStats(p.codingProfiles?.leetcode?.importedAt ? p.codingProfiles.leetcode : null);
      setHackerrankStats(p.codingProfiles?.hackerrank?.importedAt ? p.codingProfiles.hackerrank : null);
      setLoading(false);
    });
  }, []);

  const saveBuilderData = async (overrides = {}) => {
    setSaving(true);
    await api.put('/resume/builder', {
      summary, template, customSections: sections, ...overrides,
    });
    setSaving(false);
  };

  const addSection = () => setSections([...sections, { heading: '', items: [''] }]);
  const removeSection = (i) => setSections(sections.filter((_, idx) => idx !== i));

  const updateSectionHeading = (i, value) => {
    const updated = [...sections];
    updated[i].heading = value;
    setSections(updated);
  };

  const updateSectionItem = (i, itemIdx, value) => {
    const updated = [...sections];
    updated[i].items[itemIdx] = value;
    setSections(updated);
  };

  const addSectionItem = (i) => {
    const updated = [...sections];
    updated[i].items.push('');
    setSections(updated);
  };

  const downloadPDF = () => {
    window.open(`${api.defaults.baseURL}/resume/download`, '_blank');
    // Note: relies on the same-origin cookie/JWT flow in a full deployment;
    // for a token-in-header setup, fetch the blob explicitly instead:
  };

  const downloadPDFWithAuth = async () => {
    const res = await api.get('/resume/download', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'resume.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const generateQR = async () => {
    const res = await api.get('/resume/qr-code');
    setQr(res.data);
  };

  const importGithub = async () => {
    const res = await api.post('/resume/github-import', { githubUsername });
    setGithubRepos(res.data.githubRepos);
  };

  const importLeetcode = async () => {
    setCodingStatus('');
    try {
      const res = await api.post('/coding-profiles/leetcode', { username: leetcodeUsername });
      setLeetcodeStats(res.data.leetcode);
    } catch (err) {
      setCodingStatus(err.response?.data?.message || 'Could not import LeetCode stats');
    }
  };

  const importHackerrank = async () => {
    setCodingStatus('');
    try {
      const res = await api.post('/coding-profiles/hackerrank', { username: hackerrankUsername });
      setHackerrankStats(res.data.hackerrank);
    } catch (err) {
      setCodingStatus(err.response?.data?.message || 'Could not import HackerRank stats');
    }
  };

  const importLinkedin = async () => {
    setLinkedinLoading(true);
    setLinkedinStatus('');
    try {
      const res = await api.post('/ai/linkedin-import', { pastedText: linkedinText });
      setLinkedinStatus(`Imported: ${res.data.imported.skills?.length || 0} skills, ${res.data.imported.education?.length || 0} education entries, ${res.data.imported.experience?.length || 0} experience entries added.`);
      setLinkedinText('');
    } catch (err) {
      setLinkedinStatus(err.response?.data?.message || 'Import failed. Please try again.');
    } finally {
      setLinkedinLoading(false);
    }
  };

  if (loading) return <div className="max-w-3xl mx-auto px-6 py-20 text-center text-ink-faint">Loading resume builder...</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Resume Builder</h1>
        <button onClick={downloadPDFWithAuth} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white">
          <Download size={16} /> Download PDF
        </button>
      </div>

      <AIInsights />

      <section className="glass rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-sm mb-1">Professional summary</label>
          <textarea
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            onBlur={() => saveBuilderData()}
            className="w-full px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 bg-transparent"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Template</label>
          <select
            value={template}
            onChange={(e) => { setTemplate(e.target.value); saveBuilderData({ template: e.target.value }); }}
            className="w-full px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 bg-transparent"
          >
            <option value="modern">Modern</option>
            <option value="classic">Classic</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
        {saving && <p className="text-xs text-ink-faint">Saving...</p>}
      </section>

      <section className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold">Custom sections</h2>
        {sections.map((s, i) => (
          <div key={i} className="border-t border-ink/15 dark:border-paper-light/15 pt-4 space-y-2">
            <div className="flex gap-2">
              <input
                placeholder="Section heading (e.g. Achievements)"
                value={s.heading}
                onChange={(e) => updateSectionHeading(i, e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 bg-transparent"
              />
              <button onClick={() => removeSection(i)} className="text-red-500"><Trash2 size={18} /></button>
            </div>
            {s.items.map((item, itemIdx) => (
              <input
                key={itemIdx}
                placeholder="Line item"
                value={item}
                onChange={(e) => updateSectionItem(i, itemIdx, e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 bg-transparent"
              />
            ))}
            <button onClick={() => addSectionItem(i)} className="text-xs text-primary-600">+ Add line item</button>
          </div>
        ))}
        <button onClick={addSection} className="flex items-center gap-2 text-sm text-primary-600">
          <Plus size={16} /> Add section
        </button>
        <button onClick={() => saveBuilderData()} className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm">Save sections</button>
      </section>

      <section className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold">Portfolio Template</h2>
        <p className="text-sm text-ink-faint">Choose how your public portfolio looks to recruiters.</p>
        <div className="grid grid-cols-3 gap-3">
          {['modern', 'classic', 'minimal'].map((t) => (
            <button
              key={t}
              onClick={async () => {
                await api.put('/students/me/template', { template: t });
              }}
              className="px-4 py-3 rounded-lg border border-ink/20 dark:border-paper-light/20 text-sm capitalize hover:border-primary-500 hover:text-primary-600 transition"
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <section className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2"><Github size={18} /> GitHub Import</h2>
        <div className="flex gap-2">
          <input
            placeholder="Your GitHub username"
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 bg-transparent"
          />
          <button onClick={importGithub} className="px-4 rounded-lg bg-primary-600 text-white">Import</button>
        </div>
        {githubRepos.length > 0 && (
          <ul className="text-sm space-y-1">
            {githubRepos.map((r) => (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">{r.name}</a>
                {r.language && <span className="text-ink-faint text-xs"> · {r.language}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="glass rounded-2xl p-6 space-y-3">
        <h2 className="font-semibold flex items-center gap-2"><Linkedin size={18} /> LinkedIn Import</h2>
        <p className="text-xs text-ink-faint">
          LinkedIn doesn't offer a public API for this, so paste text copied directly from your
          own profile page (About, Experience, Education sections work best) — we'll extract the
          structured details and merge them into your profile without overwriting what you've
          already filled in.
        </p>
        <textarea
          rows={5}
          placeholder="Paste your LinkedIn profile text here..."
          value={linkedinText}
          onChange={(e) => setLinkedinText(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 bg-transparent text-sm"
        />
        <button
          onClick={importLinkedin}
          disabled={linkedinLoading || !linkedinText.trim()}
          className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm disabled:opacity-60"
        >
          {linkedinLoading ? 'Parsing...' : 'Import from pasted text'}
        </button>
        {linkedinStatus && <p className="text-xs text-ink-faint">{linkedinStatus}</p>}
      </section>

      <section className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold">Coding Profiles</h2>
        {codingStatus && <p className="text-xs text-red-500">{codingStatus}</p>}

        <div className="space-y-2">
          <label className="text-xs text-ink-faint">LeetCode username</label>
          <div className="flex gap-2">
            <input
              value={leetcodeUsername}
              onChange={(e) => setLeetcodeUsername(e.target.value)}
              placeholder="your-leetcode-username"
              className="flex-1 px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 bg-transparent text-sm"
            />
            <button onClick={importLeetcode} className="px-4 rounded-lg bg-primary-600 text-white text-sm">Import</button>
          </div>
          {leetcodeStats && (
            <p className="text-xs text-ink-faint">
              {leetcodeStats.totalSolved} solved ({leetcodeStats.easySolved} easy, {leetcodeStats.mediumSolved} medium, {leetcodeStats.hardSolved} hard)
              {leetcodeStats.ranking && ` · Rank #${leetcodeStats.ranking}`}
            </p>
          )}
        </div>

        <div className="space-y-2 border-t border-ink/15 dark:border-paper-light/15 pt-4">
          <label className="text-xs text-ink-faint">HackerRank username</label>
          <div className="flex gap-2">
            <input
              value={hackerrankUsername}
              onChange={(e) => setHackerrankUsername(e.target.value)}
              placeholder="your-hackerrank-username"
              className="flex-1 px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 bg-transparent text-sm"
            />
            <button onClick={importHackerrank} className="px-4 rounded-lg bg-primary-600 text-white text-sm">Import</button>
          </div>
          {hackerrankStats && (
            <p className="text-xs text-ink-faint">
              {hackerrankStats.badges?.length > 0
                ? hackerrankStats.badges.map((b) => `${b.name} (${b.stars}★)`).join(', ')
                : 'Profile linked (no public badges found)'}
            </p>
          )}
        </div>
      </section>

      <section className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2"><QrCode size={18} /> Portfolio QR Code</h2>
        <button onClick={generateQR} className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm">Generate QR code</button>
        {qr && (
          <div className="mt-3">
            <img src={qr.qrCode} alt="Portfolio QR code" className="h-40 w-40" />
            <p className="text-xs text-ink-faint mt-2 break-all">{qr.portfolioUrl}</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ResumeBuilder;
