import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import api from '../api/client';

const statusColors = {
  shortlisted: 'bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-100',
  contacted: 'bg-clay-400/20 text-clay-600 dark:text-clay-400',
  interviewing: 'bg-ink/10 text-ink-soft dark:bg-paper-light/10 dark:text-paper-light',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  hired: 'bg-moss-100 text-moss-700 dark:bg-moss-700 dark:text-moss-50',
};

// Escapes a value for safe inclusion in a CSV cell (wraps in quotes, doubles internal quotes)
const csvCell = (value) => {
  const str = String(value ?? '');
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
};

const exportToCSV = (applications) => {
  const headers = ['Candidate Name', 'Email', 'Position', 'Status', 'Notes', 'Shortlisted On'];
  const rows = applications.map((app) => [
    app.student?.user?.name || '',
    app.student?.user?.email || '',
    app.positionTitle,
    app.status,
    app.notes || '',
    new Date(app.createdAt).toLocaleDateString(),
  ]);

  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `careerverse-applications-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const ApplicationTracker = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await api.get('/applications');
    setApplications(res.data.applications);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/applications/${id}`, { status });
    load();
  };

  if (loading) return <div className="max-w-4xl mx-auto px-6 py-20 text-center text-ink-faint">Loading applications...</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Application Tracker</h1>
        {applications.length > 0 && (
          <button
            onClick={() => exportToCSV(applications)}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 hover:bg-ink/5 dark:hover:bg-paper-light/10"
          >
            <Download size={14} /> Export CSV
          </button>
        )}
      </div>

      {applications.length === 0 ? (
        <p className="text-ink-faint text-sm">No shortlisted candidates yet. Search candidates from your dashboard to get started.</p>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div key={app._id} className="glass rounded-2xl p-5 flex justify-between items-start">
              <div>
                <h3 className="font-medium">{app.student?.user?.name}</h3>
                <p className="text-sm text-ink-faint">{app.positionTitle}</p>
                <p className="text-xs text-ink-faint mt-1">{app.student?.user?.email}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-xs px-3 py-1 rounded-full ${statusColors[app.status] || 'bg-ink/5 text-ink-soft'}`}>
                  {app.status}
                </span>
                <select
                  value={app.status}
                  onChange={(e) => updateStatus(app._id, e.target.value)}
                  className="text-xs px-2 py-1 rounded-lg border border-ink/20 dark:border-paper-light/20 bg-transparent"
                >
                  {Object.keys(statusColors).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationTracker;
