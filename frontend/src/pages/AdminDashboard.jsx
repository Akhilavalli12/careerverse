import { useEffect, useState } from 'react';
import { Users, Building2, Briefcase, ShieldCheck } from 'lucide-react';
import api from '../api/client';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [institutions, setInstitutions] = useState([]);

  const load = async () => {
    const [statsRes, usersRes, instRes] = await Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/users', { params: { limit: 20 } }),
      api.get('/admin/institutions'),
    ]);
    setStats(statsRes.data.stats);
    setUsers(usersRes.data.users);
    setInstitutions(instRes.data.institutions);
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (user) => {
    await api.patch(`/admin/users/${user._id}/status`, { isActive: !user.isActive });
    load();
  };

  const approveInstitution = async (id) => {
    await api.patch(`/admin/institutions/${id}/approve`);
    load();
  };

  if (!stats) return <div className="max-w-5xl mx-auto px-6 py-20 text-center text-ink-faint">Loading admin data...</div>;

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users },
    { label: 'Students', value: stats.totalStudents, icon: Users },
    { label: 'Recruiters', value: stats.totalRecruiters, icon: Briefcase },
    { label: 'Institutions', value: stats.totalInstitutions, icon: Building2 },
    { label: 'Verified Students', value: stats.verifiedStudents, icon: ShieldCheck },
    { label: 'Applications', value: stats.totalApplications, icon: Briefcase },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5">
            <s.icon className="text-primary-600 mb-2" size={20} />
            <p className="text-2xl font-semibold">{s.value}</p>
            <p className="text-xs text-ink-faint">{s.label}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="font-semibold mb-3">Pending Institution Approvals</h2>
        <div className="space-y-2">
          {institutions.filter((i) => !i.isApproved).length === 0 && (
            <p className="text-sm text-ink-faint">No pending institutions.</p>
          )}
          {institutions.filter((i) => !i.isApproved).map((inst) => (
            <div key={inst._id} className="glass rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">{inst.name}</p>
                <p className="text-xs text-ink-faint">{inst.user?.email}</p>
              </div>
              <button onClick={() => approveInstitution(inst._id)} className="text-sm px-4 py-1.5 rounded-lg bg-primary-600 text-white">
                Approve
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-3">Users</h2>
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink/5 dark:bg-paper-light/10 text-left">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t border-ink/15 dark:border-paper-light/15">
                  <td className="px-4 py-2">{u.name}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2 capitalize">{u.role}</td>
                  <td className="px-4 py-2">{u.isActive ? 'Active' : 'Deactivated'}</td>
                  <td className="px-4 py-2">
                    <button onClick={() => toggleActive(u)} className="text-primary-600 hover:underline text-xs">
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
