import { useEffect, useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const Endorsements = ({ studentId, skills = [] }) => {
  const { user } = useAuth();
  const [grouped, setGrouped] = useState({});
  const [message, setMessage] = useState('');

  const load = () => {
    api.get(`/endorsements/${studentId}`).then((res) => setGrouped(res.data.grouped));
  };

  useEffect(() => { load(); }, [studentId]);

  const endorse = async (skill) => {
    setMessage('');
    try {
      await api.post(`/endorsements/${studentId}`, { skill });
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not endorse this skill');
    }
  };

  if (skills.length === 0) return null;

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">Skill Endorsements</h2>
      {message && <p className="text-xs text-red-500 mb-2">{message}</p>}
      <div className="space-y-2">
        {skills.map((skill) => {
          const count = grouped[skill]?.length || 0;
          return (
            <div key={skill} className="glass rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">{skill}</p>
                <p className="text-xs text-ink-faint">{count} endorsement{count !== 1 ? 's' : ''}</p>
              </div>
              {user && (
                <button
                  onClick={() => endorse(skill)}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-ink/20 dark:border-paper-light/20 hover:bg-ink/5 dark:hover:bg-paper-light/10"
                >
                  <ThumbsUp size={12} /> Endorse
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Endorsements;
