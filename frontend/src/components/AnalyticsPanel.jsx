import { useEffect, useState } from 'react';
import { Eye, TrendingUp } from 'lucide-react';
import api from '../api/client';

const AnalyticsPanel = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    api.get('/students/me/analytics').then((res) => setAnalytics(res.data.analytics));
  }, []);

  if (!analytics) return null;

  const days = Object.keys(analytics.dailyCounts).sort();
  const maxCount = Math.max(1, ...Object.values(analytics.dailyCounts));

  return (
    <section className="glass rounded-2xl p-6 space-y-4">
      <h2 className="font-semibold flex items-center gap-2"><TrendingUp size={18} className="text-primary-600" /> Portfolio Analytics</h2>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-2xl font-bold">{analytics.totalViews}</p>
          <p className="text-xs text-ink-faint">Total views</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{analytics.viewsLast30Days}</p>
          <p className="text-xs text-ink-faint">Last 30 days</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{analytics.projectCount}</p>
          <p className="text-xs text-ink-faint">Projects listed</p>
        </div>
      </div>

      {days.length > 0 && (
        <div>
          <p className="text-xs text-ink-faint mb-2 flex items-center gap-1"><Eye size={12} /> Daily views (last 30 days)</p>
          <div className="flex items-end gap-1 h-16">
            {days.map((day) => (
              <div
                key={day}
                title={`${day}: ${analytics.dailyCounts[day]} views`}
                className="flex-1 bg-primary-500 rounded-t"
                style={{ height: `${(analytics.dailyCounts[day] / maxCount) * 100}%`, minHeight: '2px' }}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default AnalyticsPanel;
