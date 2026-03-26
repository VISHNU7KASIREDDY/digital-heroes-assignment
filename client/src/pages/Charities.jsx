import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HeartHandshake, Loader2, Check } from 'lucide-react';

export default function Charities() {
  const { user, checkAuth } = useAuth();
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState(null);

  const { data: charities = [], isLoading } = useQuery({
    queryKey: ['charities'],
    queryFn: async () => {
      const { data } = await api.get('/charities');
      return data;
    }
  });

  const selectMutation = useMutation({
    mutationFn: (id) => api.put(`/auth/me/charity`, { charityId: id }), // Need to add this route to backend! (See plan change)
    onSuccess: async () => {
      await checkAuth(); // refresh user context
      queryClient.invalidateQueries(['charities']);
    },
    onSettled: () => setUpdatingId(null)
  });

  const handleSelect = (id) => {
    setUpdatingId(id);
    selectMutation.mutate(id);
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-300 w-8 h-8" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-accent shadow-sm border border-brand-100 mx-auto mb-4">
          <HeartHandshake size={32} />
        </div>
        <h1 className="text-3xl font-display font-bold text-brand-900 mb-3">Supported Causes</h1>
        <p className="text-brand-600 text-lg">
          At least 10% of your subscription goes to your selected charity. 
          Choose the cause that matters most to you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {charities.map((c) => {
          const isSelected = user?.charityId === c._id;
          return (
            <div 
              key={c._id} 
              className={`card flex flex-col h-full transition-all duration-300 ${isSelected ? 'ring-2 ring-accent border-transparent shadow-md' : 'hover:border-brand-200'}`}
            >
              <div className="h-48 w-full bg-brand-100 relative overflow-hidden">
                {c.image ? (
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-brand-300">
                    <HeartHandshake size={48} opacity={0.5} />
                  </div>
                )}
                {isSelected && (
                  <div className="absolute top-4 right-4 bg-accent text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 border border-white/20">
                    <Check size={14} /> Selected
                  </div>
                )}
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-display font-bold text-brand-900 mb-2">{c.name}</h3>
                <p className="text-brand-600 text-sm leading-relaxed mb-6 line-clamp-3">{c.description}</p>
                
                <div className="mt-auto pt-4 border-t border-brand-50 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-brand-500 font-medium">Total Raised</div>
                    <div className="font-bold text-brand-900">£{(c.totalDonations / 100).toFixed(2)}</div>
                  </div>
                  
                  <button 
                    onClick={() => handleSelect(c._id)}
                    disabled={isSelected || updatingId === c._id}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                      isSelected 
                        ? 'bg-brand-50 text-brand-400 cursor-not-allowed' 
                        : 'bg-white text-brand-800 border-2 border-brand-200 hover:border-accent hover:text-accent'
                    }`}
                  >
                    {updatingId === c._id ? <Loader2 size={18} className="animate-spin" /> : (isSelected ? 'Selected' : 'Select Cause')}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
