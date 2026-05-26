import { Link, useNavigate } from 'react-router-dom';
import { Scale, LogOut, LayoutDashboard, Inbox } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';

export default function Navbar() {
  const { jurist, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/[0.06]">
      <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-lg">
          <span className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Scale size={16} className="text-white" />
          </span>
          <span className="text-gradient">JuristNet</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link to="/anunturi" className="text-sm text-white/70 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
            Anunțuri
          </Link>
          {jurist ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                <LayoutDashboard size={15} /> Panou
              </Link>
              <Link to="/inbox" className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                <Inbox size={15} /> Inbox
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                <LogOut size={15} /> Ieșire
              </button>
            </>
          ) : (
            <Link to="/jurist/login" className="text-sm bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl font-medium transition-colors">
              Intră ca Jurist
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
