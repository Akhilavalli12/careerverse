import { Link, useNavigate } from 'react-router-dom';
import { BookMarked, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 glass border-x-0 border-t-0">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-semibold text-lg">
          <BookMarked className="text-primary-600 dark:text-primary-300" size={20} strokeWidth={1.75} />
          CareerVerse
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <ThemeToggle />
          <Link to="/explore" className="hover:text-primary-600 dark:hover:text-primary-300 hidden sm:inline">Explore</Link>
          <Link to="/features" className="hover:text-primary-600 dark:hover:text-primary-300 hidden sm:inline">Features</Link>
          <Link to="/pricing" className="hover:text-primary-600 dark:hover:text-primary-300 hidden sm:inline">Pricing</Link>
          <Link to="/about" className="hover:text-primary-600 dark:hover:text-primary-300 hidden sm:inline">About</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-primary-600 dark:hover:text-primary-300">Dashboard</Link>
              <Link to="/settings" className="hover:text-primary-600 dark:hover:text-primary-300">Settings</Link>
              <NotificationBell />
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="flex items-center gap-1 text-clay-500 hover:text-clay-600"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-primary-600 dark:hover:text-primary-300">Login</Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-full bg-primary-600 text-paper-light hover:bg-primary-700 transition"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
