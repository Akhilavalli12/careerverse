import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShieldCheck, MapPin } from 'lucide-react';
import api from '../api/client';

const Explore = () => {
  const [students, setStudents] = useState([]);
  const [q, setQ] = useState('');
  const [skills, setSkills] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  const load = async (targetPage = 1) => {
    setLoading(true);
    const params = { page: targetPage, limit: 12 };
    if (q) params.q = q;
    if (skills) params.skills = skills;
    const res = await api.get('/students/explore', { params });
    setStudents(res.data.students);
    setPagination(res.data.pagination);
    setPage(targetPage);
    setLoading(false);
  };

  useEffect(() => { load(1); }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      <div className="flex items-center justify-between font-mono text-[11px] text-ink-faint uppercase tracking-widest mb-6">
        <span>Public Directory</span>
        <span>{pagination.total} verified record{pagination.total !== 1 ? 's' : ''}</span>
      </div>

      <h1 className="font-display text-4xl mb-2">Explore verified portfolios</h1>
      <p className="text-ink-soft dark:text-paper-light/70 mb-8">
        Browse students whose credentials have been reviewed and signed off by their institution — no account needed.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
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
        <button onClick={() => load(1)} className="px-5 rounded-lg bg-primary-600 text-paper-light flex items-center justify-center gap-2">
          <Search size={16} /> Search
        </button>
      </div>

      {loading ? (
        <p className="text-ink-faint text-center py-12">Loading portfolios...</p>
      ) : students.length === 0 ? (
        <p className="text-ink-faint text-center py-12">No verified portfolios match your search yet.</p>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((s) => (
              <Link
                key={s._id}
                to={`/portfolio/${s.portfolioSlug || s._id}`}
                className="glass deckle-edge rounded-lg p-5 hover:shadow-md transition block"
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg">{s.user?.name}</h3>
                  <ShieldCheck size={14} className="text-moss-600 dark:text-moss-100 shrink-0" />
                </div>
                <p className="text-sm text-primary-600 dark:text-primary-300">{s.headline}</p>
                {s.location && (
                  <p className="text-xs text-ink-faint flex items-center gap-1 mt-1"><MapPin size={11} /> {s.location}</p>
                )}
                <div className="flex flex-wrap gap-1 mt-3">
                  {(s.skills || []).slice(0, 4).map((sk) => (
                    <span key={sk} className="text-xs px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-100">{sk}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-10 font-mono text-sm">
              <button
                disabled={page <= 1}
                onClick={() => load(page - 1)}
                className="px-3 py-1.5 rounded-lg border border-ink/20 dark:border-paper-light/20 disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="text-ink-faint">Page {page} of {pagination.pages}</span>
              <button
                disabled={page >= pagination.pages}
                onClick={() => load(page + 1)}
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

export default Explore;
