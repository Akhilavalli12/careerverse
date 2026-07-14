import { useEffect, useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import api from '../api/client';

const AIInsights = () => {
  const [analysis, setAnalysis] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    api.get('/ai/analysis')
      .then((res) => setAnalysis(res.data.aiAnalysis?.lastAnalyzedAt ? res.data.aiAnalysis : null))
      .finally(() => setInitialLoad(false));
  }, []);

  const runAnalysis = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/analyze', { targetRole });
      setAnalysis(res.data.aiAnalysis);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoad) return null;

  return (
    <section className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2"><Sparkles size={18} className="text-primary-600" /> AI Career Insights</h2>
      </div>

      <div className="flex gap-2">
        <input
          placeholder="Target role (optional, e.g. Frontend Developer)"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 bg-transparent text-sm"
        />
        <button
          onClick={runAnalysis}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm disabled:opacity-60"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Analyzing...' : analysis ? 'Re-analyze' : 'Analyze my profile'}
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {analysis && (
        <div className="space-y-4 pt-2 border-t border-ink/15 dark:border-paper-light/15">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-primary-600">{analysis.resumeScore}</div>
            <div className="text-sm text-ink-faint">/ 100 profile strength</div>
          </div>
          <p className="text-sm">{analysis.resumeFeedback}</p>

          {analysis.skillGaps?.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-ink-faint uppercase mb-1">Skill Gaps</h3>
              <div className="flex flex-wrap gap-1.5">
                {analysis.skillGaps.map((s) => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-clay-400/20 text-clay-600 dark:text-clay-400">{s}</span>
                ))}
              </div>
            </div>
          )}

          {analysis.careerSuggestions?.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-ink-faint uppercase mb-1">Career Suggestions</h3>
              <ul className="text-sm list-disc list-inside space-y-0.5">
                {analysis.careerSuggestions.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
          )}

          {analysis.keywordSuggestions?.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-ink-faint uppercase mb-1">Keywords to Add</h3>
              <div className="flex flex-wrap gap-1.5">
                {analysis.keywordSuggestions.map((k) => (
                  <span key={k} className="text-xs px-2.5 py-1 rounded-full bg-primary-100 text-primary-700">{k}</span>
                ))}
              </div>
            </div>
          )}

          <p className="text-[10px] text-ink-faint">Last analyzed: {new Date(analysis.lastAnalyzedAt).toLocaleString()}</p>
        </div>
      )}
    </section>
  );
};

export default AIInsights;
