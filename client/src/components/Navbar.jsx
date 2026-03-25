import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Menu, X, CircleUser } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-brand-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white font-display font-bold text-xl shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform">
                G
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-brand-900 hidden sm:block">
                Fairway<span className="text-accent">Fund</span>
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link to="/dashboard" className="text-brand-600 hover:text-brand-900 font-medium transition-colors">Dashboard</Link>
                <Link to="/scores" className="text-brand-600 hover:text-brand-900 font-medium transition-colors">My Scores</Link>
                <Link to="/winnings" className="text-brand-600 hover:text-brand-900 font-medium transition-colors">Winnings</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-brand-600 hover:text-brand-900 font-medium transition-colors">Admin Panel</Link>
                )}
                
                <div className="h-8 w-px bg-brand-200"></div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-brand-700 bg-brand-50 px-3 py-1.5 rounded-full border border-brand-100">
                    <CircleUser size={16} className="text-brand-500" />
                    <span className="font-medium truncate max-w-[120px]">{user.name}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-brand-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-brand-600 hover:text-brand-900 font-medium transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary py-2.5 px-5">
                  Start Donating
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-brand-600 hover:text-brand-900 p-2"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-brand-100 px-4 pt-2 pb-6 space-y-2 shadow-lg">
          {user ? (
            <>
              <div className="py-3 mb-2 flex items-center gap-3 border-b border-brand-50">
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-brand-900">{user.name}</div>
                  <div className="text-xs text-brand-500">{user.email}</div>
                </div>
              </div>
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-brand-700 hover:bg-brand-50 rounded-lg">Dashboard</Link>
              <Link to="/scores" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-brand-700 hover:bg-brand-50 rounded-lg">My Scores</Link>
              <Link to="/winnings" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-brand-700 hover:bg-brand-50 rounded-lg">Winnings</Link>
              {user.role === 'admin' && (
                <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-accent hover:bg-accent/5 rounded-lg">Admin Panel</Link>
              )}
              <button 
                onClick={() => { handleLogout(); setIsOpen(false); }}
                className="w-full text-left px-3 py-2 mt-4 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
              >
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3 pt-3">
              <Link to="/login" onClick={() => setIsOpen(false)} className="btn-secondary w-full justify-center">Log in</Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="btn-primary w-full justify-center">Start Donating</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
