import { useAuth } from '../context/AuthContext';
import StudentDashboard from './StudentDashboard';
import RecruiterDashboard from './RecruiterDashboard';
import AdminDashboard from './AdminDashboard';
import InstitutionDashboard from './InstitutionDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'recruiter') return <RecruiterDashboard />;
  if (user?.role === 'student') return <StudentDashboard />;
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'institution') return <InstitutionDashboard />;

  return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center text-ink-faint">
      Dashboard for role "{user?.role}" is not yet available.
    </div>
  );
};

export default Dashboard;
