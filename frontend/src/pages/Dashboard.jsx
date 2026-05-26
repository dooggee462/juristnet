import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, Phone, MessageSquare, TrendingUp, CreditCard, Plus, Trash2, ToggleLeft, ToggleRight, BadgeCheck, Camera, Loader } from 'lucide-react';
import Navbar from '../components/layout/Navbar.jsx';
import { SubBadge, VerifiedBadge } from '../components/ui/Badge.jsx';
import { useAuthStore } from '../store/authStore.js';
import { EXPERTISE_OPTIONS, MOLDOVA_REGIONS } from '../lib/constants.js';
import api from '../lib/api.js';

function StatCard({ icon: Icon, label, value, sub, color = 'brand' }) {
  const colors = {
    brand: 'bg-brand-500/10 text-brand-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    blue: 'bg-blue-500/10 text-blue-400',
    gold: 'bg-yellow-500/10 text-yellow-400',
  };
  return (
    <div className="glass rounded-2xl p-5 border border-white/08">
      <div className={`w-10 h-10 rounded-xl ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon size={18} />
      </div>
      <div className="text-2xl font-bold mb-0.5">{value}</div>
      <div className="text-sm text-white/50">{label}</div>
      {sub && <div className="text-xs text-white/30 mt-1">{sub}</div>}
    </div>
  );
}

function AvatarUpload({ currentUrl, juristName, onUploaded }) {
  const fileRef = useRef();
  const [preview, setPreview] = useState(currentUrl);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const data = await api.post('/upload/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onUploaded(data.avatarUrl);
    } catch (err) {
      console.error(err);
      setPreview(currentUrl);
    } finally {
      setUploading(false);
    }
  };

  const initials = juristName?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="relative w-20 h-20 group cursor-pointer" onClick={() => fileRef.current?.click()}>
      <div className="w-full h-full rounded-3xl overflow-hidden bg-brand-600/20 flex items-center justify-center">
        {preview
          ? <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
          : <span className="text-brand-300 font-bold text-2xl">{initials}</span>}
      </div>
      <div className="absolute inset-0 rounded-3xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        {uploading ? <Loader size={18} className="animate-spin text-white" /> : <Camera size={18} className="text-white" />}
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
    </div>
  );
}

function NewListingModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', expertise: [], languages: [], city: '', region: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggle = (k, v) => setForm(p => ({ ...p, [k]: p[k].includes(v) ? p[k].filter(x => x !== v) : [...p[k], v] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/listings', form);
      onCreated();
    } catch (err) {
      setError(err.error || 'Eroare la creare');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass rounded-3xl p-6 w-full max-w-lg border border-white/10 max-h-[90vh] overflow-y-auto">
        <h2 className="font-bold text-lg mb-5">Anunț nou</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Titlu anunț" required
            className="w-full bg-white/05 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-brand-500/50" />
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Descriere serviciu..." rows={4} required
            className="w-full bg-white/05 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-brand-500/50 resize-none" />
          <div>
            <label className="block text-xs text-white/40 mb-2">Localitate / Raion</label>
            <select value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
              className="w-full bg-white/05 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500/50">
              <option value="">Selectați</option>
              {MOLDOVA_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-2">Domenii</p>
            <div className="flex flex-wrap gap-2">
              {EXPERTISE_OPTIONS.map(e => (
                <button key={e} type="button" onClick={() => toggle('expertise', e)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${form.expertise.includes(e) ? 'bg-brand-600/30 border-brand-500/50 text-brand-300' : 'bg-white/05 border-white/10 text-white/50'}`}>{e}</button>
              ))}
            </div>
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/05 text-sm text-white/60">Anulează</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-colors disabled:opacity-50">
              {loading ? 'Se creează...' : 'Publică anunțul'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { jurist, fetchMe } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewListing, setShowNewListing] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);

  const subSuccess = params.get('sub') === 'success';

  const fetchDashboard = async () => {
    try {
      const d = await api.get('/analytics/dashboard');
      setData(d);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    if (subSuccess) fetchMe();
  }, []);

  useEffect(() => {
    if (jurist?.avatarUrl) setAvatarUrl(jurist.avatarUrl);
  }, [jurist]);

  const handleSubscribe = async () => {
    setSubLoading(true);
    try {
      const d = await api.post('/stripe/create-checkout');
      window.location.href = d.url;
    } finally {
      setSubLoading(false);
    }
  };

  const handlePortal = async () => {
    setSubLoading(true);
    try {
      const d = await api.post('/stripe/portal');
      window.location.href = d.url;
    } finally {
      setSubLoading(false);
    }
  };

  const toggleListing = async (id, current) => {
    await api.put(`/listings/${id}`, { isActive: !current });
    fetchDashboard();
  };

  const deleteListing = async (id) => {
    if (!confirm('Ștergeți anunțul?')) return;
    await api.delete(`/listings/${id}`);
    fetchDashboard();
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f0f13]">
      <Navbar />
      {showNewListing && (
        <NewListingModal onClose={() => setShowNewListing(false)} onCreated={() => { setShowNewListing(false); fetchDashboard(); }} />
      )}
      <main className="pt-24 pb-16 max-w-6xl mx-auto px-4">
        {/* Header with avatar */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <AvatarUpload
              currentUrl={avatarUrl}
              juristName={`${jurist?.firstName} ${jurist?.lastName}`}
              onUploaded={(url) => { setAvatarUrl(url); fetchMe(); }}
            />
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold">{jurist?.firstName} {jurist?.lastName}</h1>
                {data?.isVerified && <VerifiedBadge size="md" />}
              </div>
              <p className="text-white/40 text-sm">{jurist?.email}</p>
              <p className="text-xs text-white/25 mt-0.5">Click pe poză pentru a schimba avatarul</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SubBadge status={data?.subscription?.status} />
            {data?.subscription?.status === 'ACTIVE' ? (
              <button onClick={handlePortal} disabled={subLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/05 border border-white/10 text-sm text-white/70 hover:bg-white/10 transition-colors disabled:opacity-50">
                <CreditCard size={14} /> Gestionează abonament
              </button>
            ) : (
              <button onClick={handleSubscribe} disabled={subLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-sm text-white font-semibold transition-colors disabled:opacity-50">
                <CreditCard size={14} /> {subLoading ? 'Se redirecționează...' : 'Activează abonament'}
              </button>
            )}
          </div>
        </div>

        {subSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
            <BadgeCheck size={16} /> Abonament activat cu succes!
          </div>
        )}

        {data?.subscription?.currentEnd && (
          <div className="mb-6 p-4 rounded-2xl glass border border-white/08 text-sm text-white/50">
            Abonament activ până la: <span className="text-white/80 font-medium">
              {new Date(data.subscription.currentEnd).toLocaleDateString('ro-MD')}
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Eye} label="Vizualizări profil" value={data?.stats?.totalProfileViews ?? 0} sub={`+${data?.stats?.views30d ?? 0} luna aceasta`} color="brand" />
          <StatCard icon={Phone} label="Click-uri telefon" value={data?.stats?.totalPhoneClicks ?? 0} sub={`+${data?.stats?.phoneClicks30d ?? 0} luna aceasta`} color="emerald" />
          <StatCard icon={MessageSquare} label="Conversații" value={data?.unreadMessages ?? 0} sub="mesaje noi" color="blue" />
          <StatCard icon={TrendingUp} label="Rating mediu" value={data?.reviews?.average ? `${data.reviews.average.toFixed(1)}★` : 'N/A'} sub={`${data?.reviews?.total ?? 0} recenzii`} color="gold" />
        </div>

        {/* Listings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Anunțurile mele</h2>
            <button onClick={() => setShowNewListing(true)} disabled={data?.subscription?.status !== 'ACTIVE'}
              title={data?.subscription?.status !== 'ACTIVE' ? 'Necesită abonament activ' : ''}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600/20 border border-brand-500/30 text-brand-400 text-sm hover:bg-brand-600/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <Plus size={15} /> Anunț nou
            </button>
          </div>

          {data?.listings?.length === 0 ? (
            <div className="glass rounded-2xl p-8 border border-white/08 text-center text-white/30">
              <p className="mb-2">Nu aveți anunțuri publicate</p>
              <p className="text-xs">Activați un abonament pentru a putea publica anunțuri.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.listings.map((l) => (
                <div key={l.id} className="glass rounded-2xl p-5 border border-white/08 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-medium text-sm truncate">{l.title}</h3>
                    <p className="text-xs text-white/40 mt-0.5">
                      {l._count?.reviews ?? 0} recenzii · {new Date(l.createdAt).toLocaleDateString('ro-MD')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${l.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/10 text-white/40'}`}>
                      {l.isActive ? 'Activ' : 'Inactiv'}
                    </span>
                    <button onClick={() => toggleListing(l.id, l.isActive)} className="text-white/30 hover:text-white transition-colors">
                      {l.isActive ? <ToggleRight size={20} className="text-emerald-400" /> : <ToggleLeft size={20} />}
                    </button>
                    <button onClick={() => deleteListing(l.id)} className="text-white/20 hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
