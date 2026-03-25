import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-brand-900 bg-[#FCFAF8]">
      <Navbar />
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>
      <footer className="bg-brand-950 py-12 text-center text-brand-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-4 group cursor-pointer w-fit mx-auto">
             <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white font-display font-bold text-sm shadow-lg shadow-accent/20">
                G
              </div>
              <span className="font-display font-semibold text-xl tracking-tight text-white">
                Fairway<span className="text-accent">Fund</span>
              </span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} FairwayFund. Supporting charities, one swing at a time.</p>
        </div>
      </footer>
    </div>
  );
}
