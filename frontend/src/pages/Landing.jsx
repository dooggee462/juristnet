import { useNavigate } from 'react-router-dom';
import { Sparkles, Users, ShieldCheck, Search, Star, MessageSquare, ArrowRight, Zap, Globe, Lock } from 'lucide-react';
import { CATEGORIES } from '../lib/constants.js';

const CATEGORY_ICONS = {
  'Juridic': '⚖️',
  'Medical': '🏥',
  'Construcții': '🏗️',
  'IT': '💻',
  'Contabilitate & Business': '📊',
  'Educație': '📚',
  'Auto': '🚗',
  'Frumusețe': '✨',
  'Evenimente': '📸',
  'Casnice': '🏠',
  'Agricultură & Animale': '🌱',
};

export default function Landing() {
  const navigate = useNavigate();

  const handleCategoryClick = (slug) => {
    navigate(`/experti?category=${slug}`);
  };

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white overflow-hidden">
      {/* Ambient gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-brand-700/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center glow-brand">
              <Sparkles size={18} className="text-white" />
            </span>
            <span className="text-xl font-bold text-gradient">expert.md</span>
          </div>
          <span className="text-sm text-white/40 glass px-3 py-1.5 rounded-full border border-white/08">
            Platforma nr. 1 de experți din Moldova
          </span>
        </header>

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-brand-300 mb-6 border border-brand-500/20">
            <Zap size={14} className="text-brand-400" />
            Experți verificați în Moldova
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
            Găsește expertul<br />
            <span className="text-gradient">potrivit în Moldova</span>
          </h1>
          <p className="text-lg text-white/50 max-w-xl mx-auto">
            Specialiști verificați în juridic, medical, construcții, IT și multe altele.
          </p>
        </div>

        {/* Primary CTA — Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10 max-w-4xl mx-auto">
          {/* Client path */}
          <button
            onClick={() => navigate('/experti')}
            className="bento-card group p-8 text-left cursor-pointer relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center mb-5 group-hover:bg-emerald-500/25 transition-colors">
                <Users size={22} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Intră ca Client</h2>
              <p className="text-white/50 text-sm mb-6 leading-relaxed">
                Caută experți, consultă profilurile și ia legătura instant. Fără cont necesar.
              </p>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 group-hover:gap-3 transition-all">
                Caută experți <ArrowRight size={16} />
              </span>
            </div>
          </button>

          {/* Expert path */}
          <button
            onClick={() => navigate('/expert/login')}
            className="bento-card group p-8 text-left cursor-pointer relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/15 flex items-center justify-center mb-5 group-hover:bg-brand-500/25 transition-colors">
                <Sparkles size={22} className="text-brand-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Intră ca Expert</h2>
              <p className="text-white/50 text-sm mb-6 leading-relaxed">
                Creați-vă profilul profesional, publicați anunțuri și atrageți clienți noi cu un abonament lunar.
              </p>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-400 group-hover:gap-3 transition-all">
                Înregistrare / Autentificare <ArrowRight size={16} />
              </span>
            </div>
          </button>
        </div>

        {/* Categories Grid */}
        <div className="mb-16">
          <h2 className="text-center text-lg font-semibold text-white/60 mb-6">Caută după domeniu</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-w-5xl mx-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => handleCategoryClick(cat.slug)}
                className="bento-card p-4 flex flex-col items-center gap-2 cursor-pointer group hover:border-brand-500/40 transition-all"
              >
                <span className="text-2xl">{CATEGORY_ICONS[cat.name] || '🔹'}</span>
                <span className="text-xs font-medium text-white/70 group-hover:text-white text-center leading-tight">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Feature Bento */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-16">
          {/* Wide card */}
          <div className="bento-card p-6 md:col-span-2">
            <Search size={20} className="text-brand-400 mb-3" />
            <h3 className="font-semibold mb-1.5">Filtrare avansată</h3>
            <p className="text-sm text-white/45 leading-relaxed">
              Căutați după domeniu, oraș sau limbi vorbite. Experți din toată Moldova.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {['Juridic', 'Medical', 'IT', 'Construcții'].map((d) => (
                <span key={d} className="text-xs px-2.5 py-1 rounded-full bg-white/05 border border-white/08 text-white/60">{d}</span>
              ))}
            </div>
          </div>

          {/* Verified */}
          <div className="bento-card p-6">
            <ShieldCheck size={20} className="text-emerald-400 mb-3" />
            <h3 className="font-semibold mb-1.5">Experți verificați</h3>
            <p className="text-sm text-white/45">
              Badge-ul de verificare confirmă acreditările fiecărui specialist.
            </p>
          </div>

          {/* Reviews */}
          <div className="bento-card p-6">
            <Star size={20} className="text-yellow-400 mb-3" />
            <h3 className="font-semibold mb-1.5">Recenzii reale</h3>
            <p className="text-sm text-white/45">
              Evaluări de la clienți reali pentru alegeri informate.
            </p>
          </div>

          {/* Messaging */}
          <div className="bento-card p-6">
            <MessageSquare size={20} className="text-blue-400 mb-3" />
            <h3 className="font-semibold mb-1.5">Mesaje directe</h3>
            <p className="text-sm text-white/45">
              Contactați expertul direct din platformă, în timp real.
            </p>
          </div>

          {/* Languages */}
          <div className="bento-card p-6">
            <Globe size={20} className="text-purple-400 mb-3" />
            <h3 className="font-semibold mb-1.5">Multilingv</h3>
            <p className="text-sm text-white/45">
              Găsiți experți care vorbesc română, rusă sau engleză.
            </p>
          </div>

          {/* Wide stats card */}
          <div className="bento-card p-6 md:col-span-2 flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-black text-gradient">500+</div>
              <div className="text-xs text-white/40 mt-1">Experți activi</div>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <div className="text-3xl font-black text-gradient">12k+</div>
              <div className="text-xs text-white/40 mt-1">Clienți serviți</div>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <div className="text-3xl font-black text-gradient">4.8★</div>
              <div className="text-xs text-white/40 mt-1">Rating mediu</div>
            </div>
          </div>
        </div>

        {/* Security note */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-xs text-white/30">
            <Lock size={12} />
            Date criptate · Plăți securizate prin Stripe · GDPR compliant
          </div>
        </div>
      </div>
    </div>
  );
}
