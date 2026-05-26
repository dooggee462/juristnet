import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar.jsx';
import { VerifiedBadge } from '../components/ui/Badge.jsx';
import { StarDisplay } from '../components/ui/StarRating.jsx';
import api from '../lib/api.js';

const EXPERTISE = [
  'Drept penal', 'Dreptul familiei', 'Drept civil', 'Drept comercial',
  'Drept administrativ', 'Drept fiscal', 'Dreptul muncii', 'Drept imobiliar',
];
const LANGUAGES = ['Română', 'Engleză', 'Franceză', 'Germană', 'Maghiară'];

function avgRating(reviews) {
  if (!reviews?.length) return 0;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

function JuristCard({ jurist }) {
  const navigate = useNavigate();
  const avg = avgRating(jurist.reviews);
  const initials = `${jurist.firstName?.[0] ?? ''}${jurist.lastName?.[0] ?? ''}`;

  return (
    <button
      onClick={() => navigate(`/jurist/${jurist.id}`)}
      className="bento-card p-6 text-left w-full group"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-600/20 flex items-center justify-center text-brand-300 font-bold text-lg flex-shrink-0">
          {jurist.avatarUrl ? (
            <img src={jurist.avatarUrl} alt="" className="w-full h-full rounded-2xl object-cover" />
          ) : initials}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm">{jurist.firstName} {jurist.lastName}</h3>
            {jurist.isVerified && <VerifiedBadge />}
          </div>
          <p className="text-xs text-white/40 mt-0.5">{jurist.city ?? 'România'}</p>
        </div>
      </div>

      {jurist.bio && (
        <p className="text-xs text-white/50 leading-relaxed mb-4 line-clamp-2">{jurist.bio}</p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-4">
        {(jurist.areasOfExpertise ?? []).slice(0, 3).map((e) => (
          <span key={e} className="text-xs px-2 py-0.5 rounded-full bg-brand-600/15 text-brand-300 border border-brand-500/20">{e}</span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <StarDisplay value={avg} total={jurist.reviews?.length} />
        <span className="text-xs text-white/30 group-hover:text-brand-400 transition-colors">
          Vezi profil →
        </span>
      </div>
    </button>
  );
}

export default function Listings() {
  const [jurists, setJurists] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expertise, setExpertise] = useState('');
  const [city, setCity] = useState('');
  const [language, setLanguage] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchJurists = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search) params.set('search', search);
      if (expertise) params.set('expertise', expertise);
      if (city) params.set('city', city);
      if (language) params.set('language', language);
      const data = await api.get(`/jurists?${params}`);
      setJurists(data.jurists);
      setTotal(data.total);
      setPages(data.pages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search, expertise, city, language]);

  useEffect(() => { fetchJurists(); }, [fetchJurists]);

  const clearFilters = () => { setExpertise(''); setCity(''); setLanguage(''); setSearch(''); setPage(1); };
  const hasFilters = expertise || city || language || search;

  return (
    <div className="min-h-screen bg-[#0f0f13]">
      <Navbar />
      <main className="pt-24 pb-16 max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Juriști disponibili</h1>
          <p className="text-white/40 text-sm">{total} specialiști înregistrați</p>
        </div>

        {/* Search & Filter bar */}
        <div className="glass rounded-2xl p-4 mb-8 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Căutați după nume sau specializare..."
              className="w-full bg-white/05 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-brand-500/50"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters ? 'bg-brand-600/20 border-brand-500/40 text-brand-300' : 'bg-white/05 border-white/10 text-white/60 hover:border-white/20'}`}
          >
            <Filter size={15} /> Filtre {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />}
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/70 transition-colors">
              <X size={14} /> Resetează
            </button>
          )}
        </div>

        {showFilters && (
          <div className="glass rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-2">Domeniu de drept</label>
              <select
                value={expertise}
                onChange={(e) => { setExpertise(e.target.value); setPage(1); }}
                className="w-full bg-white/05 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500/50"
              >
                <option value="">Toate domeniile</option>
                {EXPERTISE.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-2">Oraș / Regiune</label>
              <input
                value={city}
                onChange={(e) => { setCity(e.target.value); setPage(1); }}
                placeholder="ex: București"
                className="w-full bg-white/05 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-brand-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-2">Limbă vorbită</label>
              <select
                value={language}
                onChange={(e) => { setLanguage(e.target.value); setPage(1); }}
                className="w-full bg-white/05 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500/50"
              >
                <option value="">Toate limbile</option>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bento-card h-48 animate-pulse" />
            ))}
          </div>
        ) : jurists.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <p className="text-xl font-semibold mb-2">Niciun jurist găsit</p>
            <p className="text-sm">Încercați să modificați filtrele de căutare</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {jurists.map((j) => <JuristCard key={j.id} jurist={j} />)}
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="p-2 rounded-xl bg-white/05 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm text-white/50">Pagina {page} din {pages}</span>
            <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="p-2 rounded-xl bg-white/05 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
