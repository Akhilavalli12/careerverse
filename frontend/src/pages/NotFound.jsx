import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
    <h1 className="text-5xl font-bold text-primary-600">404</h1>
    <p className="mt-3 text-ink-faint">This page doesn't exist.</p>
    <Link to="/" className="mt-6 px-5 py-2 rounded-full bg-primary-600 text-white">Back home</Link>
  </div>
);

export default NotFound;
