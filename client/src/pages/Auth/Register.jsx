import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    charityId: '',
    charityPercentage: 10,
  });
  const [charities, setCharities] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch active charities for dropdown
    const fetchCharities = async () => {
      try {
        const { data } = await api.get('/charities');
        setCharities(data);
        if (data.length > 0) {
          setFormData(f => ({ ...f, charityId: data[0]._id }));
        }
      } catch (err) {
        console.error('Failed to load charities');
      }
    };
    fetchCharities();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Validate bounds
    if (formData.charityPercentage < 10 || formData.charityPercentage > 100) {
        setError("Charity percentage must be between 10% and 100%");
        setIsLoading(false);
        return;
    }

    try {
      await register(formData);
      setTimeout(() => navigate('/dashboard'), 100);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-12 relative overflow-hidden bg-brand-50/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(230,115,76,0.05),transparent_40%)]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white rounded-3xl shadow-xl shadow-brand-200/20 border border-brand-100 p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-display font-bold text-brand-900">Create Account</h2>
          <p className="text-brand-500 mt-2 font-medium">Join the club, log scores, win prizes.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-brand-700 mb-1.5 ml-1">Full Name</label>
              <input type="text" name="name" required className="input-field" placeholder="John Doe" value={formData.name} onChange={handleChange} />
            </div>

            <div>
               <label className="block text-sm font-medium text-brand-700 mb-1.5 ml-1">Email address</label>
               <input type="email" name="email" required className="input-field" placeholder="you@example.com" value={formData.email} onChange={handleChange} />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-brand-700 mb-1.5 ml-1">Password</label>
             <input type="password" name="password" required minLength={6} className="input-field" placeholder="••••••••" value={formData.password} onChange={handleChange} />
          </div>

          <div className="pt-4 border-t border-brand-100 mt-6 !mb-2">
            <h3 className="text-brand-900 font-semibold mb-1">Charity Selection</h3>
            <p className="text-xs text-brand-500 mb-4">Choose where your minimum 10% monthly contribution goes.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-brand-700 mb-1.5 ml-1">Select Charity</label>
              <select name="charityId" required className="input-field bg-white" value={formData.charityId} onChange={handleChange}>
                <option value="" disabled>Choose a cause...</option>
                {charities.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
               <label className="block text-sm font-medium text-brand-700 mb-1.5 ml-1">Contribution (%)</label>
               <div className="relative">
                 <input type="number" name="charityPercentage" min="10" max="100" required className="input-field pl-4 pr-8" value={formData.charityPercentage} onChange={handleChange} />
                 <span className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-400 font-medium">%</span>
               </div>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full mt-6 py-4 text-lg">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-medium text-brand-600">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:text-accent-hover font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
