import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';

const InstitutionPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/institutions/${id}/students`)
      .then((res) => setData(res.data))
      .catch(() => setError('Institution not found or not yet approved.'));
  }, [id]);

  if (error) return <div className="max-w-3xl mx-auto px-6 py-24 text-center text-ink-faint">{error}</div>;
  if (!data) return <div className="max-w-3xl mx-auto px-6 py-24 text-center text-ink-faint">Loading...</div>;

  const primary = data.institution.branding?.primaryColor || '#3b6fe0';

  return (
    <div>
      <div className="py-10 px-6 text-center text-white" style={{ backgroundColor: primary }}>
        {data.institution.logoUrl && (
          <img src={data.institution.logoUrl} alt={data.institution.name} className="h-14 mx-auto mb-3" />
        )}
        <h1 className="text-2xl font-semibold">{data.institution.name}</h1>
        <p className="text-sm opacity-90">Verified Student Portfolios</p>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {data.students.length === 0 ? (
          <p className="text-center text-ink-faint">No verified students listed yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {data.students.map((s) => (
              <Link
                key={s._id}
                to={`/portfolio/${s.portfolioSlug || s._id}`}
                className="glass rounded-2xl p-5 hover:shadow-md transition block"
              >
                <h3 className="font-semibold">{s.user?.name}</h3>
                <p className="text-sm" style={{ color: primary }}>{s.headline}</p>
                {s.location && <p className="text-xs text-ink-faint mt-1">{s.location}</p>}
                <div className="flex flex-wrap gap-1 mt-2">
                  {(s.skills || []).slice(0, 5).map((sk) => (
                    <span key={sk} className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">{sk}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}

        {data.institution.branding?.customFooterText && (
          <p className="text-center text-xs text-ink-faint mt-10">{data.institution.branding.customFooterText}</p>
        )}
      </div>
    </div>
  );
};

export default InstitutionPage;
