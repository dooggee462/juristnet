import { useNavigate } from 'react-router-dom';
import { Scale, Users, ShieldCheck, Search, Star, MessageSquare, ArrowRight, Zap, Globe, Lock } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

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
              <Scale size={18} className="text-white" />
            </span>
            <span className="text-xl font-bold text-gradient">JuristNet</span>
          </div>
          <span className="text-sm text-white/40 glass px-3 py-1.5 rounded-full border border-white/08">
            Platforma nr. 1 de servicii juridice din România
          </span>
        </header>

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-brand-300 mb-6 border border-brand-500/20">
            <Zap size={14} className="text-brand-400" />
            Acces rapid la expertiză juridică
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
            Găsiți juristul<br />
            <span className="text-gradient">potrivit pentru dvs.</span>
          </h1>
          <p className="text-lg text-white/50 max-w-xl mx-auto">
            Conectăm clienții cu juriști verificați din toată România. Rapid, sigur și transparent.
          </p>
        </div>

        {/* Primary CTA — Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8 max-w-4xl mx-auto">
          {/* Client path */}
          <button
            onClick={() => navigate('/anunturi')}
            className="bento-card group p-8 text-left cursor-pointer relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center mb-5 group-hover:bg-emerald-500/25 transition-colors">
                <Users size={22} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Intră ca Client</h2>
              <p className="text-white/50 text-sm mb-6 leading-relaxed">
                Browsați anunțuri, găsiți juristul ideal și luați legătura instant. Fără cont necesar.
              </p>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 group-hover:gap-3 transition-all">
                Caută juriști <ArrowRight size={16} />
              </span>
            </div>
          </button>

          {/* Jurist path */}
          <button
            onClick={() => navigate('/jurist/login')}
            className="bento-card group p-8 text-left cursor-pointer relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/15 flex items-center justify-center mb-5 group-hover:bg-brand-500/25 transition-colors">
                <Scale size={22} className="text-brand-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Intră ca Jurist</h2>
              <p className="text-white/50 text-sm mb-6 leading-relaxed">
                Creați-vă profilul profesional, publicați anunțuri și atrageți clienți noi cu un abonament lunar.
              </p>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-400 group-hover:gap-3 transition-all">
                Înregistrare / Autentificare <ArrowRight size={16} />
              </span>
            </div>
          </button>
        </div>

        {/* Feature Bento */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-16">
          {/* Wide card */}
          <div className="bento-card p-6 md:col-span-2">
            <Search size={20} className="text-brand-400 mb-3" />
            <h3 className="font-semibold mb-1.5">Filtrare avansată</h3>
            <p className="text-sm text-white/45 leading-relaxed">
              Căutați după domeniu de drept, oraș, regiune sau limbi vorbite. Rezultate relevante instant.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {['Drept penal', 'Dreptul familiei', 'Drept comercial', 'Drept civil'].map((d) => (
                <span key={d} className="text-xs px-2.5 py-1 rounded-full bg-white/05 border border-white/08 text-white/60">{d}</span>
              ))}
            </div>
          </div>

          {/* Verified */}
          <div className="bento-card p-6">
            <ShieldCheck size={20} className="text-emerald-400 mb-3" />
            <h3 className="font-semibold mb-1.5">Juriști verificați</h3>
            <p className="text-sm text-white/45">
              Badge-ul de verificare confirmă licența și acreditările fiecărui specialist.
            </p>
          </div>

          {/* Reviews */}
          <div className="bento-card p-6">
            <Star size={20} className="text-gold-400 mb-3" />
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
              Contactați juristul direct din platformă, fără a expune date personale.
            </p>
          </div>

          {/* Languages */}
          <div className="bento-card p-6">
            <Globe size={20} className="text-purple-400 mb-3" />
            <h3 className="font-semibold mb-1.5">Multilingv</h3>
            <p className="text-sm text-white/45">
              Găsiți juriști care vorbesc limba dvs. maternă.
            </p>
          </div>

          {/* Wide stats card */}
          <div className="bento-card p-6 md:col-span-2 flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-black text-gradient">500+</div>
              <div className="text-xs text-white/40 mt-1">Juriști activi</div>
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
