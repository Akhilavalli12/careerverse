import { useEffect, useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import api from '../api/client';

const RecruiterDashboard = () => {
  const [students, setStudents] = useState([]);
  const [q, setQ] = useState('');
  const [skills, setSkills] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  const search = async (targetPage = 1) => {
    setLoading(true);
    const params = { page: targetPage, limit: 10 };
    if (q) params.q = q;
    if (skills) params.skills = skills;
    const res = await api.get('/students', { params });
    setStudents(res.data.students);
    setPagination(res.data.pagination);
    setPage(targetPage);
    setLoading(false);
  };

  useEffect(() => { search(1); }, []);

  const shortlist = async (studentId) => {
    const positionTitle = window.prompt('Position title for shortlist:');
    if (!positionTitle) return;
    await api.post('/applications', { studentId, positionTitle });
    alert('Student shortlisted');
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Find Candidates</h1>
        <a href="/applications" className="text-sm px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 hover:bg-ink/5 dark:hover:bg-paper-light/10">
          View Application Tracker
        </a>
      </div>

      <div className="flex gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search headline or bio..."
          className="flex-1 px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 bg-transparent"
        />
        <input
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="Skills (comma separated)"
          className="flex-1 px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 bg-transparent"
        />
        <button onClick={() => search(1)} className="px-5 rounded-lg bg-primary-600 text-paper-light flex items-center gap-2">
          <Search size={16} /> Search
        </button>
      </div>

      {loading ? (
        <p className="text-ink-faint">Loading candidates...</p>
      ) : students.length === 0 ? (
        <p className="text-ink-faint">No candidates match your filters yet.</p>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            {students.map((s) => (
              <div key={s._id} className="glass rounded-lg p-5">
                <h3 className="font-display text-lg">{s.user?.name}</h3>
                <p className="text-sm text-primary-600 dark:text-primary-300">{s.headline}</p>
                {s.location && (
                  <p className="text-xs text-ink-faint flex items-center gap-1 mt-1">
                    <MapPin size={12} /> {s.location}
                  </p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {(s.skills || []).slice(0, 5).map((sk) => (
                    <span key={sk} className="text-xs px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-100">{sk}</span>
                  ))}
                </div>
                <button
                  onClick={() => shortlist(s._id)}
                  className="mt-3 text-sm px-4 py-1.5 rounded-lg bg-primary-600 text-paper-light"
                >
                  Shortlist
                </button>
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-4 font-mono text-sm">
              <button
                disabled={page <= 1}
                onClick={() => search(page - 1)}
                className="px-3 py-1.5 rounded-lg border border-ink/20 dark:border-paper-light/20 disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="text-ink-faint">Page {page} of {pagination.pages} ({pagination.total} total)</span>
              <button
                disabled={page >= pagination.pages}
                onClick={() => search(page + 1)}
                className="px-3 py-1.5 rounded-lg border border-ink/20 dark:border-paper-light/20 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RecruiterDashboard;
