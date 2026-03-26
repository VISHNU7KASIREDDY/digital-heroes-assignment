import { useState } from 'react';
import { useWinnings } from '../hooks/useApi';
import api from '../services/api';
import { useQueryClient } from '@tanstack/react-query';
import { Trophy, Upload, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Winnings() {
  const { data: winnings = [], isLoading } = useWinnings();
  const queryClient = useQueryClient();
  const [uploadingId, setUploadingId] = useState(null);

  const handleUploadProof = async (e, winningId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadingId(winningId);
    const formData = new FormData();
    formData.append('proof', file);

    try {
      await api.post(`/winnings/${winningId}/proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      queryClient.invalidateQueries({ queryKey: ['winnings'] });
    } catch (err) {
      alert('Failed to upload proof: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingId(null);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-300 w-8 h-8" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-accent shadow-sm border border-brand-100">
          <Trophy size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-900 mb-1">Your Winnings</h1>
          <p className="text-brand-600 font-medium">Upload proof to claim your prizes.</p>
        </div>
      </div>

      {winnings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-brand-100 p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-300">
            <Trophy size={40} />
          </div>
          <h3 className="text-xl font-bold text-brand-900 mb-2">No Winnings Yet</h3>
          <p className="text-brand-500 max-w-sm mx-auto">
            Keep playing! Ensure you have an active subscription and 5 scores entered to participate in the next draw.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {winnings.map((w) => (
            <div key={w._id} className="card p-6 border-l-4" style={{ borderLeftColor: w.matchCount === 5 ? '#e6734c' : '#a3a492' }}>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex px-2.5 py-1 rounded bg-brand-100 text-brand-800 text-xs font-bold uppercase tracking-wider">
                      {format(new Date(w.createdAt), 'MMM yyyy')} Draw
                    </span>
                    <span className="font-bold text-brand-900 flex items-center gap-1.5">
                      <TargetBadge count={w.matchCount} /> {w.matchCount} Matches
                    </span>
                  </div>
                  <div className="text-3xl font-display font-bold text-brand-900">
                    £{(w.amount / 100).toFixed(2)}
                  </div>
                </div>

                <div className="bg-brand-50 rounded-xl p-5 border border-brand-100 flex-grow max-w-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-brand-700">Status</span>
                    <StatusBadge status={w.status} />
                  </div>
                  
                  {w.status === 'pending' && !w.proofUrl && (
                     <div>
                       <p className="text-xs text-brand-500 mb-3">Upload your scorecard proof to claim!</p>
                       <label className="btn-secondary w-full justify-center text-sm py-2 cursor-pointer">
                         {uploadingId === w._id ? (
                           <Loader2 size={16} className="animate-spin mr-2" />
                         ) : (
                           <Upload size={16} className="mr-2" />
                         )}
                         {uploadingId === w._id ? 'Uploading...' : 'Upload Image'}
                         <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUploadProof(e, w._id)} disabled={uploadingId === w._id} />
                       </label>
                     </div>
                  )}

                  {w.proofUrl && (
                    <div className="mt-3">
                      <a href={w.proofUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-accent hover:underline flex items-center gap-1">
                        View submitted proof <ArrowRight size={14} />
                      </a>
                    </div>
                  )}

                  {w.adminNote && (
                    <div className="mt-3 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                      <strong>Admin note:</strong> {w.adminNote}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TargetBadge({ count }) {
  if (count === 5) return <span className="bg-accent text-white px-2 py-0.5 rounded text-xs">Jackpot</span>;
  return null;
}

function StatusBadge({ status }) {
  switch (status) {
    case 'approved': return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200"><CheckCircle size={14} /> Approved</span>;
    case 'paid': return <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full text-xs font-bold border border-blue-200"><CheckCircle size={14} /> Paid Out</span>;
    case 'rejected': return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2.5 py-1 rounded-full text-xs font-bold border border-red-200"><XCircle size={14} /> Rejected</span>;
    default: return <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-200"><Clock size={14} /> Pending Review</span>;
  }
}

// ArrowRight mock (since lucide doesn't export it in this context without import block above)
function ArrowRight({ size=16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
}
