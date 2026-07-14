import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { register: signUp } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setServerError('');
    setSubmitting(true);
    try {
      await signUp(data);
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <h1 className="text-2xl font-semibold mb-6">Create your account</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Full name</label>
          <input
            className="w-full px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 bg-transparent"
            {...register('name', { required: 'Name is required' })}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            className="w-full px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 bg-transparent"
            {...register('email', { required: 'Email is required' })}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 bg-transparent"
            {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">I am a</label>
          <select
            className="w-full px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 bg-transparent"
            {...register('role')}
          >
            <option value="student">Student</option>
            <option value="recruiter">Recruiter</option>
            <option value="institution">Institution</option>
          </select>
        </div>

        {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60 transition"
        >
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-center mt-6 text-ink-faint">
        Already have an account? <Link to="/login" className="text-primary-600 hover:underline">Sign in</Link>
      </p>
    </div>
  );
};

export default Register;
