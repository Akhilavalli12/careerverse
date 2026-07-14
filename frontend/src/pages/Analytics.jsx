import { useEffect, useState } from 'react';
import { Eye, TrendingUp, Briefcase, Award } from 'lucide-react';
import api from '../api/client';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    api.get('/students/me/analytics').then((res) => setAnalytics(res.data.analytics));
  }, []);

  if (!analytics) return <div className="max-w-3xl mx-auto px-6 py-20 text-center text-ink-faint">Loading analytics...</div>;

  const days = Object.keys(analytics.dailyCounts).sort();
  const maxCount = Math.max(1, ...Object.values(analytics.dailyCounts));

  const cards = [
    { label: 'Total portfolio views', value: analytics.totalViews, icon: Eye },
    { label: 'Views (last 30 days)', value: analytics.viewsLast30Days, icon: TrendingUp },
    { label: 'Projects', value: analytics.projectCount, icon: Briefcase },
    { label: 'Certificates', value: analytics.certificateCount, icon: Award },
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
      <h1 className="text-2xl font-semibold">Profile Analytics</h1>

      <div className="grid grid-cols-2 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="glass rounded-2xl p-5">
            <c.icon className="text-primary-600 mb-2" size={20} />
            <p className="text-2xl font-semibold">{c.value}</p>
            <p className="text-xs text-ink-faint">{c.label}</p>
          </div>
        ))}
      </div>

      <section className="glass rounded-2xl p-6">
        <h2 className="font-semibold mb-4">Views — last 30 days</h2>
        {days.length === 0 ? (
          <p className="text-sm text-ink-faint">No portfolio views recorded yet. Share your QR code or portfolio link to start seeing traffic here.</p>
        ) : (
          <div className="flex items-end gap-1 h-32">
            {days.map((day) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  className="w-full bg-primary-500 rounded-t"
                  style={{ height: `${(analytics.dailyCounts[day] / maxCount) * 100}%`, minHeight: '2px' }}
                  title={`${day}: ${analytics.dailyCounts[day]} views`}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Analytics;
