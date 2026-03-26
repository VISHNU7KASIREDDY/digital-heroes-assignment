import { useAuth } from '../context/AuthContext';
import { useSubscription, useWinnings } from '../hooks/useApi';
import { motion } from 'framer-motion';
import SubscriptionCard from '../components/SubscriptionCard';
import ScoreCard from '../components/ScoreCard';
import { Trophy, Gift, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: sub } = useSubscription();
  const { data: winnings = [] } = useWinnings();
  
  const isActive = sub?.status === 'active';
  const totalWinnings = winnings.reduce((sum, w) => sum + w.amount, 0) / 100; // convert cents to currency

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-brand-900 mb-2">
          Welcome back, {user?.name.split(' ')[0]}
        </h1>
        <p className="text-brand-600 font-medium">Here's your FairwayFund outlook for {new Date().toLocaleString('default', { month: 'long' })}.</p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={item}>
            <ScoreCard isActive={isActive} />
          </motion.div>

          <motion.div variants={item} className="grid sm:grid-cols-2 gap-6">
            {/* Quick Stats: Winnings */}
            <div className="card bg-gradient-to-br from-brand-900 to-brand-800 text-white p-6 relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
                <Trophy size={80} />
              </div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="mb-4 text-brand-300 font-medium flex items-center gap-2">
                  <Trophy size={18} /> Total Winnings
                </div>
                <div className="text-4xl font-display font-bold mt-auto mb-4">
                  £{totalWinnings.toFixed(2)}
                </div>
                <Link to="/winnings" className="text-sm text-brand-200 hover:text-white flex items-center gap-1 w-fit transition-colors group-hover:gap-2">
                  View history <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Quick Stats: Charity */}
            <div className="card bg-white p-6 border-accent/20 border-2 relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-4 transform translate-x-4 -translate-y-4 opacity-5 group-hover:scale-110 transition-transform duration-500 text-accent">
                <Gift size={120} />
              </div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="mb-4 text-brand-600 font-medium flex items-center gap-2">
                  <HeartIcon className="text-accent" /> Active Contribution
                </div>
                <div className="text-3xl font-display font-bold mt-auto mb-1 text-brand-900">
                  {user?.charityPercentage}% / mo
                </div>
                <p className="text-sm text-brand-500 mb-4 line-clamp-1">Donating to your selected cause</p>
                <Link to="/charities" className="text-sm text-accent hover:text-accent-hover font-medium flex items-center gap-1 w-fit transition-colors">
                  Change charity <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <motion.div variants={item} className="space-y-6">
          <SubscriptionCard />
          
          {/* Next Draw info small card */}
          <div className="card bg-brand-50 border border-brand-100 p-5">
            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-brand-100/50">
                <Calendar className="text-brand-600" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-brand-900 mb-1">Next Draw</h4>
                <p className="text-sm text-brand-600 font-medium">1st of {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleString('default', { month: 'long' })}</p>
                <p className="text-xs text-brand-500 mt-2 leading-relaxed">Ensure your scores are up to date. The system will use your 5 most recent scores.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function HeartIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>
  );
}
