import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      // Wait a tiny bit for state to propagate
      setTimeout(() => navigate('/dashboard'), 100);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-12 relative overflow-hidden bg-brand-50/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(230,115,76,0.05),transparent_40%)]" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-brand-200/20 border border-brand-100 p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-white font-display font-bold text-2xl mx-auto mb-4 shadow-lg shadow-accent/20">
            G
          </div>
          <h2 className="text-3xl font-display font-bold text-brand-900">Welcome Back</h2>
          <p className="text-brand-500 mt-2 font-medium">Log in to view your scores and draws</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1.5 ml-1">Email address</label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1.5 ml-1">Password</label>
            <input
              type="password"
              required
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full mt-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-medium text-brand-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent hover:text-accent-hover font-semibold transition-colors">
            Sign up now
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
