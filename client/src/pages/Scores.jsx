import { useScores, useSubscription } from '../hooks/useApi';
import ScoreCard from '../components/ScoreCard';
import { Target } from 'lucide-react';

export default function Scores() {
  const { data: sub } = useSubscription();
  const isActive = sub?.status === 'active';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-accent shadow-sm border border-brand-100">
          <Target size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-900 mb-1">My Scores</h1>
          <p className="text-brand-600 font-medium">Log your latest rounds here.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <ScoreCard isActive={isActive} />
        
        <div className="bg-brand-50 rounded-2xl p-6 border border-brand-100 h-fit">
          <h3 className="font-display font-bold text-lg mb-4">How it works</h3>
          <ul className="space-y-4 text-brand-700 text-sm leading-relaxed">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-accent font-bold shrink-0 shadow-sm">1</span>
              <span>Enter a score between 1 and 45 after your round.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-accent font-bold shrink-0 shadow-sm">2</span>
              <span>We only store your <strong>5 most recent scores</strong>. Oldest scores are automatically replaced.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-accent font-bold shrink-0 shadow-sm">3</span>
              <span>On the 1st of every month, a draw takes place. Your active 5 scores are your entry tickets!</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
