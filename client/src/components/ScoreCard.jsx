import { useState } from 'react';
import { useScores } from '../hooks/useApi';
import api from '../services/api';
import { useQueryClient } from '@tanstack/react-query';
import { Target, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScoreCard({ isActive }) {
  const { data: scores = [], isLoading } = useScores();
  const queryClient = useQueryClient();
  const [newScore, setNewScore] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAddScore = async (e) => {
    e.preventDefault();
    if (!isActive) return setError('Active subscription required');
    
    const val = parseInt(newScore);
    if (isNaN(val) || val < 1 || val > 45) {
      return setError('Score must be between 1 and 45');
    }

    setIsSubmitting(true);
    setError('');
    try {
      await api.post('/scores', { value: val });
      setNewScore('');
      queryClient.invalidateQueries({ queryKey: ['scores'] });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save score');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="card p-6 min-h-[200px] flex items-center justify-center"><Loader2 className="animate-spin text-brand-300" /></div>;

  return (
    <div className="card bg-white p-6 flex flex-col h-full">
      <div className="flex justify-between items-start mb-6 align-top">
        <div>
          <h3 className="text-xl font-display font-bold text-brand-900 mb-1">Recent Scores</h3>
          <p className="text-sm text-brand-500">Only your last 5 numbers influence the draw.</p>
        </div>
        <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-accent">
          <Target size={20} />
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-end">
        {/* Score blocks */}
        <div className="flex gap-2 mb-6 items-end justify-between px-2">
          {Array.from({ length: 5 }).map((_, i) => {
            const score = scores[i];
            return (
              <div key={score?._id || i} className="flex flex-col items-center gap-2">
                <AnimatePresence mode="popLayout">
                  {score ? (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="w-12 h-16 sm:w-14 sm:h-18 rounded-lg bg-gradient-to-br from-brand-900 to-brand-800 text-white flex items-center justify-center font-display font-bold text-xl sm:text-2xl shadow-md border border-brand-700"
                    >
                      {score.value}
                    </motion.div>
                  ) : (
                    <div className="w-12 h-16 sm:w-14 sm:h-18 rounded-lg bg-brand-50 border-2 border-dashed border-brand-200 flex items-center justify-center text-brand-300 font-display font-medium">
                      ?
                    </div>
                  )}
                </AnimatePresence>
                <span className="text-[10px] text-brand-400 font-medium">
                  {score ? format(new Date(score.date), 'dd MMM') : '-'}
                </span>
              </div>
            );
          })}
        </div>
        
        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <form onSubmit={handleAddScore} className="flex gap-3">
          <div className="relative flex-grow">
            <input
              type="number"
              min="1"
              max="45"
              placeholder="Enter score (1-45)"
              value={newScore}
              onChange={(e) => setNewScore(e.target.value)}
              disabled={!isActive || isSubmitting}
              className="input-field disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={!isActive || isSubmitting || !newScore}
            className="btn-primary px-4 py-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
}
