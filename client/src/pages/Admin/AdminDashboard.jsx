import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Users, CreditCard, HeartHandshake, FileText, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('analytics');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/admin/analytics');
      return data;
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-brand-900">Admin Control Panel</h1>
        <p className="text-brand-600 font-medium">Manage draws, charities, and user verification.</p>
      </div>

      <div className="border-b border-brand-200 mb-8">
        <nav className="flex space-x-8">
          {['analytics', 'draws', 'winnings', 'charities'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize whitespace-nowrap ${
                activeTab === tab 
                  ? 'border-accent text-accent' 
                  : 'border-transparent text-brand-500 hover:text-brand-700 hover:border-brand-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-300 w-8 h-8" /></div>
      ) : (
        <div className="min-h-[500px]">
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Users" value={analytics?.usersCount} icon={<Users />} />
              <StatCard title="Active Subs" value={analytics?.activeSubscriptions} icon={<CreditCard />} />
              <StatCard title="Total Donated" value={`£${(analytics?.totalDonated / 100).toFixed(2)}`} icon={<HeartHandshake />} />
              <StatCard title="Est. Prize Pool" value={`£${(analytics?.totalPrizePoolEstimate / 100).toFixed(2)}`} icon={<FileText />} />
            </div>
          )}

          {activeTab === 'draws' && <AdminDraws />}
          {activeTab === 'winnings' && <AdminWinnings />}
          {activeTab === 'charities' && <AdminCharities />}
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="card bg-white p-6 border border-brand-100 flex items-center gap-4">
      <div className="w-12 h-12 bg-brand-50 text-accent rounded-xl flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-brand-500">{title}</p>
        <p className="text-2xl font-display font-bold text-brand-900">{value}</p>
      </div>
    </div>
  );
}

// Minimal inline components to save tool calls
function AdminDraws() {
  const [month, setMonth] = useState('2026-03');
  const [type, setType] = useState('weighted');
  const [totalPoolStr, setTotalPoolStr] = useState('100000'); // 1000 GBP in cents
  const [simData, setSimData] = useState(null);
  
  const handleSimulate = async () => {
    const { data } = await api.post('/draws/simulate', { month, type, expectedTotalPool: parseInt(totalPoolStr) });
    setSimData(data);
  };

  const handlePublish = async () => {
    if(!simData) return alert('Simulate first');
    if(!window.confirm('Publish this draw? Users will see results and payouts assigned immediately.')) return;
    
    try {
      await api.post('/draws/publish', { 
        month, type, numbers: simData.numbers, totalPool: parseInt(totalPoolStr) 
      });
      alert('Draw published successfully!');
      setSimData(null);
    } catch(err) {
      alert(err.response?.data?.message || 'Failed to publish');
    }
  };

  return (
    <div className="card p-6 bg-white max-w-2xl">
      <h3 className="font-display font-bold text-lg mb-4">Run Monthly Draw</h3>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
           <label className="block text-xs font-bold text-brand-500 mb-1 uppercase">Month Label</label>
           <input type="text" className="input-field" value={month} onChange={e=>setMonth(e.target.value)} />
        </div>
        <div>
           <label className="block text-xs font-bold text-brand-500 mb-1 uppercase">Draw Type</label>
           <select className="input-field bg-white" value={type} onChange={e=>setType(e.target.value)}>
             <option value="random">Pure Random</option>
             <option value="weighted">Weighted (Community Choice)</option>
           </select>
        </div>
        <div>
           <label className="block text-xs font-bold text-brand-500 mb-1 uppercase">Total Pool (Cents)</label>
           <input type="number" className="input-field" value={totalPoolStr} onChange={e=>setTotalPoolStr(e.target.value)} />
        </div>
      </div>

      <button onClick={handleSimulate} className="btn-secondary w-full mb-6 py-2.5">Simulate Draw</button>

      {simData && (
        <div className="bg-brand-50 rounded-xl p-5 border border-brand-200">
          <div className="flex gap-2 justify-center mb-6">
            {simData.numbers.map((n, i) => (
              <div key={i} className="w-12 h-16 bg-brand-900 text-white rounded-lg flex items-center justify-center font-bold text-xl">{n}</div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 text-center mb-6">
            <div className="bg-white p-3 rounded-lg shadow-sm border border-brand-100">
              <div className="text-xs text-brand-500 font-bold mb-1">5 MATCH (Jackpot)</div>
              <div className="font-bold text-brand-900">{simData.winnersSummary.match5} Winners</div>
              <div className="text-sm text-accent">£{(simData.prizes.perWinner.match5 / 100).toFixed(2)} each</div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm border border-brand-100">
              <div className="text-xs text-brand-500 font-bold mb-1">4 MATCH</div>
              <div className="font-bold text-brand-900">{simData.winnersSummary.match4} Winners</div>
              <div className="text-sm text-accent">£{(simData.prizes.perWinner.match4 / 100).toFixed(2)} each</div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm border border-brand-100">
              <div className="text-xs text-brand-500 font-bold mb-1">3 MATCH</div>
              <div className="font-bold text-brand-900">{simData.winnersSummary.match3} Winners</div>
              <div className="text-sm text-accent">£{(simData.prizes.perWinner.match3 / 100).toFixed(2)} each</div>
            </div>
          </div>
          
          <button onClick={handlePublish} className="btn-primary w-full py-3 bg-red-600 hover:bg-red-700 focus:ring-red-600 focus:ring-offset-2">
            Confirm & Publish Draw to Users
          </button>
        </div>
      )}
    </div>
  );
}

function AdminWinnings() {
  const { data: winnings=[], refetch } = useQuery({ queryKey:['admin-wins'], queryFn: async() => (await api.get('/winnings/admin')).data });

  const handleUpdate = async (id, status) => {
    await api.put(`/winnings/${id}/status`, { status, adminNote: status === 'paid' ? 'Processed' : '' });
    refetch();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-brand-100 overflow-hidden">
      <table className="min-w-full divide-y divide-brand-200">
        <thead className="bg-brand-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">User</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">Draw</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">Proof</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-bold text-brand-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-brand-100">
          {winnings.map((w) => (
            <tr key={w._id} className="hover:bg-brand-50/50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-900">{w.userId?.name} <span className="block text-xs font-normal text-brand-500">{w.userId?.email}</span></td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-500">{w.drawId?.month} ({w.matchCount}M)</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-accent">£{(w.amount/100).toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-500">
                {w.proofUrl ? <a href={w.proofUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-semibold">View Proof</a> : 'None'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-500">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${w.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {w.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {w.status === 'pending' && <button onClick={()=>handleUpdate(w._id, 'approved')} className="text-indigo-600 hover:text-indigo-900 mr-4">Approve</button>}
                {w.status === 'approved' && <button onClick={()=>handleUpdate(w._id, 'paid')} className="text-green-600 hover:text-green-900">Mark Paid</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminCharities() {
  const { data: charities=[], refetch } = useQuery({ queryKey:['admin-charities'], queryFn: async() => (await api.get('/charities')).data });
  const [form, setForm] = useState({ name: '', description: '', image: '' });

  const handleAdd = async (e) => {
    e.preventDefault();
    await api.post('/charities', form);
    setForm({ name:'', description:'', image:'' });
    refetch();
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="card bg-white p-6">
        <h3 className="font-display font-bold text-lg mb-4">Add Charity</h3>
        <form onSubmit={handleAdd} className="space-y-4">
          <input type="text" placeholder="Name" className="input-field" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
          <textarea placeholder="Description" className="input-field min-h-[100px]" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} required />
          <input type="text" placeholder="Image URL (optional)" className="input-field" value={form.image} onChange={e=>setForm({...form, image:e.target.value})} />
          <button type="submit" className="btn-secondary w-full py-2">Create Charity</button>
        </form>
      </div>

      <div className="space-y-4">
        {charities.map(c => (
          <div key={c._id} className="card p-4 border-l-4 border-accent flex justify-between items-center bg-white">
            <div>
              <h4 className="font-bold text-brand-900">{c.name}</h4>
              <p className="text-brand-500 text-sm">Raised: £{(c.totalDonations/100).toFixed(2)}</p>
            </div>
            <button onClick={async () => { await api.delete(`/charities/${c._id}`); refetch(); }} className="text-red-500 text-sm hover:underline font-medium">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
