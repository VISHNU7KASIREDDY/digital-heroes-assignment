import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../hooks/useApi';
import api from '../services/api';
import { CreditCard, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function SubscriptionCard() {
  const { user } = useAuth();
  const { data: sub, isLoading, refetch } = useSubscription();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isCancelLoading, setIsCancelLoading] = useState(false);

  const handleSubscribe = async (plan) => {
    setIsCheckoutLoading(plan);
    try {
      const { data } = await api.post('/subscriptions/create-checkout', { plan });
      window.location.href = data.url;
    } catch (err) {
      alert('Failed to start checkout. Check console for details.');
      console.error(err);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel? You will keep access until the end of your billing period.')) return;
    
    setIsCancelLoading(true);
    try {
      await api.post('/subscriptions/cancel');
      await refetch();
    } catch (err) {
      alert('Failed to cancel');
    } finally {
      setIsCancelLoading(false);
    }
  };

  if (isLoading) return <div className="card p-6 min-h-[200px] flex items-center justify-center"><Loader2 className="animate-spin text-brand-300" /></div>;

  const isActive = sub?.status === 'active';
  const isCanceledAtEnd = sub?.cancelAtPeriodEnd;

  return (
    <div className="card bg-white p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <CreditCard size={120} />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-display font-bold text-brand-900 mb-1">Subscription</h3>
            <div className="flex items-center gap-2">
              {isActive ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                  <CheckCircle2 size={14} /> Active {isCanceledAtEnd && '(Cancels at period end)'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-100 text-brand-700 border border-brand-200">
                  <AlertCircle size={14} /> Inactive
                </span>
              )}
            </div>
          </div>
        </div>

        {isActive ? (
          <div className="space-y-4">
            <div className="bg-brand-50 rounded-xl p-4 border border-brand-100">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-brand-600">Plan</span>
                <span className="font-semibold text-brand-900 capitalize">{sub.plan}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-brand-600">Current Period Ends</span>
                <span className="font-medium text-brand-900 text-right">
                  {sub.currentPeriodEnd ? format(new Date(sub.currentPeriodEnd), 'PPP') : 'N/A'}
                </span>
              </div>
            </div>

            {!isCanceledAtEnd && (
              <button
                onClick={handleCancel}
                disabled={isCancelLoading}
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors flex items-center gap-2 px-1"
              >
                {isCancelLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                Cancel Subscription
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-brand-600 text-sm mb-4">
              Subscribe to enter your scores and participate in monthly charity draws.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleSubscribe('monthly')}
                disabled={isCheckoutLoading}
                className="btn-primary w-full justify-center group"
              >
                {isCheckoutLoading === 'monthly' ? <Loader2 className="animate-spin mr-2" /> : null}
                <div className="flex flex-col items-center">
                  <span className="text-sm font-medium opacity-90">Monthly</span>
                  <span className="font-bold">£10 / mo</span>
                </div>
              </button>
              
              <button
                onClick={() => handleSubscribe('yearly')}
                disabled={isCheckoutLoading}
                className="btn-secondary w-full justify-center flex flex-col items-center"
              >
                {isCheckoutLoading === 'yearly' ? <Loader2 className="animate-spin mb-1" /> : null}
                <span className="text-sm font-medium opacity-80">Yearly</span>
                <span className="font-bold">£100 / yr</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
