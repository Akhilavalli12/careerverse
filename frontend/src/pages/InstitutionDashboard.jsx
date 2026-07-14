import { useEffect, useState } from 'react';
import api from '../api/client';

const InstitutionDashboard = () => {
  const [institution, setInstitution] = useState(null);
  const [form, setForm] = useState({ name: '', domain: '', address: '', website: '', branding: { primaryColor: '#3b6fe0', accentColor: '#2f5bc4', customFooterText: '' } });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get('/institutions/me');
      setInstitution(res.data.institution);
      setForm(res.data.institution);
    } catch {
      // not set up yet
    }
    try {
      const reqRes = await api.get('/institutions/verification-requests');
      setRequests(reqRes.data.requests);
    } catch {
      // institution profile might not exist yet, ignore
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    const res = await api.put('/institutions/me', form);
    setInstitution(res.data.institution);
    load();
  };

  const review = async (id, status) => {
    await api.patch(`/institutions/verification-requests/${id}`, { status });
    load();
  };

  if (loading) return <div className="max-w-3xl mx-auto px-6 py-20 text-center text-ink-faint">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
      <h1 className="text-2xl font-semibold">Institution Dashboard</h1>

      <section className="glass rounded-2xl p-6 space-y-3">
        <h2 className="font-semibold">{institution ? 'Institution Profile' : 'Set up your institution profile'}</h2>
        {!institution && (
          <p className="text-sm text-amber-600">
            Your institution needs admin approval before it appears publicly, but you can already review verification requests once set up.
          </p>
        )}
        <form onSubmit={saveProfile} className="space-y-3">
          <input
            required
            placeholder="Institution name"
            value={form.name || ''}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 bg-transparent"
          />
          <input
            placeholder="Official domain (e.g. gcet.edu.in)"
            value={form.domain || ''}
            onChange={(e) => setForm({ ...form, domain: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 bg-transparent"
          />
          <input
            placeholder="Website"
            value={form.website || ''}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 bg-transparent"
          />

          <div className="border-t border-ink/15 dark:border-paper-light/15 pt-3 space-y-2">
            <p className="text-xs text-ink-faint font-medium">White-label branding (shown on your public institution page)</p>
            <div className="flex gap-3 items-center">
              <label className="text-xs text-ink-faint w-28">Primary color</label>
              <input
                type="color"
                value={form.branding?.primaryColor || '#3b6fe0'}
                onChange={(e) => setForm({ ...form, branding: { ...form.branding, primaryColor: e.target.value } })}
                className="h-8 w-14 rounded border border-ink/20 dark:border-paper-light/20"
              />
            </div>
            <div className="flex gap-3 items-center">
              <label className="text-xs text-ink-faint w-28">Accent color</label>
              <input
                type="color"
                value={form.branding?.accentColor || '#2f5bc4'}
                onChange={(e) => setForm({ ...form, branding: { ...form.branding, accentColor: e.target.value } })}
                className="h-8 w-14 rounded border border-ink/20 dark:border-paper-light/20"
              />
            </div>
            <input
              placeholder="Custom footer text (e.g. 'Placements Office, GCET')"
              value={form.branding?.customFooterText || ''}
              onChange={(e) => setForm({ ...form, branding: { ...form.branding, customFooterText: e.target.value } })}
              className="w-full px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 bg-transparent text-sm"
            />
          </div>

          <button className="px-5 py-2 rounded-lg bg-primary-600 text-white">Save</button>
        </form>
      </section>

      {institution && (
        <section>
          <h2 className="font-semibold mb-3">Verification Requests</h2>
          {requests.length === 0 ? (
            <p className="text-sm text-ink-faint">No pending requests.</p>
          ) : (
            <div className="space-y-2">
              {requests.map((r) => (
                <div key={r._id} className="glass rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{r.student?.user?.name}</p>
                    <p className="text-xs text-ink-faint">{r.student?.user?.email} · Status: {r.status}</p>
                  </div>
                  {r.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => review(r._id, 'approved')} className="text-xs px-3 py-1.5 rounded-lg bg-primary-600 text-white">Approve</button>
                      <button onClick={() => review(r._id, 'rejected')} className="text-xs px-3 py-1.5 rounded-lg border border-red-400 text-red-500">Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default InstitutionDashboard;
