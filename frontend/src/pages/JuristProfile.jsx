import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, MessageSquare, MapPin, Globe, ChevronLeft } from 'lucide-react';
import Navbar from '../components/layout/Navbar.jsx';
import { VerifiedBadge } from '../components/ui/Badge.jsx';
import { StarRating, StarDisplay } from '../components/ui/StarRating.jsx';
import { ClientChatModal } from '../components/ui/ChatModal.jsx';
import api from '../lib/api.js';

function ReviewForm({ juristId, listingId, onSubmitted }) {
  const [form, setForm] = useState({ clientName: '', clientEmail: '', rating: 0, body: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rating) return setError('Selectați un rating');
    setLoading(true);
    try {
      await api.post(`/reviews/listing/${listingId}`, form);
      onSubmitted();
    } catch (err) {
      setError(err.error || 'Eroare la trimitere');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-5 mt-4 space-y-4 border border-white/08">
      <h3 className="font-semibold text-sm">Lasă o recenzie</h3>
      <div>
        <label className="block text-xs text-white/40 mb-2">Rating</label>
        <StarRating value={form.rating} onChange={(v) => setForm(p => ({ ...p, rating: v }))} size={24} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input value={form.clientName} onChange={e => setForm(p => ({ ...p, clientName: e.target.value }))} placeholder="Numele dvs." required
          className="bg-white/05 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-brand-500/50" />
        <input type="email" value={form.clientEmail} onChange={e => setForm(p => ({ ...p, clientEmail: e.target.value }))} placeholder="Email (opțional)"
          className="bg-white/05 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-brand-500/50" />
      </div>
      <textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} placeholder="Descrieți experiența dvs. cu acest jurist..." rows={3} required minLength={10}
        className="w-full bg-white/05 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-brand-500/50 resize-none" />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button type="submit" disabled={loading}
        className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
        {loading ? 'Se trimite...' : 'Publică recenzia'}
      </button>
    </form>
  );
}

export default function JuristProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jurist, setJurist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phoneRevealed, setPhoneRevealed] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [reviewListingId, setReviewListingId] = useState(null);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const fetchJurist = async () => {
    try {
      const data = await api.get(`/jurists/${id}`);
      setJurist(data.jurist);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJurist(); }, [id]);

  const revealPhone = async () => {
    const data = await api.post(`/jurists/${id}/phone-click`);
    setPhoneRevealed(data.phoneNumber);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
    </div>
  );

  if (!jurist) return (
    <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center text-white/40">Profil negăsit</div>
  );

  const avgRating = jurist.reviews?.length
    ? jurist.reviews.reduce((s, r) => s + r.rating, 0) / jurist.reviews.length
    : 0;

  const initials = `${jurist.firstName?.[0] ?? ''}${jurist.lastName?.[0] ?? ''}`;

  return (
    <div className="min-h-screen bg-[#0f0f13]">
      <Navbar />
      {showChat && <ClientChatModal jurist={jurist} onClose={() => setShowChat(false)} />}

      <main className="pt-24 pb-16 max-w-5xl mx-auto px-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 mb-6 transition-colors">
          <ChevronLeft size={16} /> Înapoi la anunțuri
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            <div className="glass rounded-3xl p-6 border border-white/08 text-center">
              <div className="w-20 h-20 rounded-3xl mx-auto mb-4 overflow-hidden bg-brand-600/20 flex items-center justify-center">
                {jurist.avatarUrl
                  ? <img src={jurist.avatarUrl} alt="" className="w-full h-full object-cover" />
                  : <span className="text-brand-300 font-bold text-2xl">{initials}</span>}
              </div>
              <h1 className="text-xl font-bold mb-1">{jurist.firstName} {jurist.lastName}</h1>
              {jurist.isVerified && <div className="flex justify-center mb-2"><VerifiedBadge size="md" /></div>}
              <div className="flex justify-center mb-4">
                <StarDisplay value={avgRating} total={jurist.reviews?.length} />
              </div>
              {jurist.city && (
                <div className="flex items-center justify-center gap-1.5 text-sm text-white/40">
                  <MapPin size={13} /> {jurist.city}
                </div>
              )}
            </div>

            <div className="glass rounded-2xl p-5 border border-white/08 space-y-3">
              <button onClick={revealPhone}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl text-sm font-semibold transition-colors">
                <Phone size={15} />
                {phoneRevealed || 'Afișează telefonul'}
              </button>
              <button onClick={() => setShowChat(true)}
                className="w-full flex items-center justify-center gap-2 bg-brand-600/20 hover:bg-brand-600/30 border border-brand-500/30 text-brand-400 px-4 py-3 rounded-xl text-sm font-semibold transition-colors">
                <MessageSquare size={15} /> Trimite mesaj
              </button>
            </div>

            {jurist.spokenLanguages?.length > 0 && (
              <div className="glass rounded-2xl p-5 border border-white/08">
                <div className="flex items-center gap-2 text-sm text-white/50 mb-3">
                  <Globe size={14} /> Limbi vorbite
                </div>
                <div className="flex flex-wrap gap-2">
                  {jurist.spokenLanguages.map((l) => (
                    <span key={l} className="text-xs px-2.5 py-1 rounded-full bg-purple-600/15 text-purple-300 border border-purple-500/20">{l}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {jurist.bio && (
              <div className="glass rounded-2xl p-6 border border-white/08">
                <h2 className="font-semibold mb-3 text-white/80">Despre</h2>
                <p className="text-sm text-white/60 leading-relaxed">{jurist.bio}</p>
              </div>
            )}

            {jurist.areasOfExpertise?.length > 0 && (
              <div className="glass rounded-2xl p-6 border border-white/08">
                <h2 className="font-semibold mb-3 text-white/80">Domenii de expertiză</h2>
                <div className="flex flex-wrap gap-2">
                  {jurist.areasOfExpertise.map((e) => (
                    <span key={e} className="text-sm px-3 py-1.5 rounded-full bg-brand-600/15 text-brand-300 border border-brand-500/20">{e}</span>
                  ))}
                </div>
              </div>
            )}

            {jurist.listings?.length > 0 && (
              <div>
                <h2 className="font-semibold mb-3 text-white/80">Anunțuri active</h2>
                <div className="space-y-3">
                  {jurist.listings.map((l) => (
                    <div key={l.id} className="glass rounded-2xl p-5 border border-white/08">
                      <h3 className="font-semibold mb-2">{l.title}</h3>
                      <p className="text-sm text-white/50 leading-relaxed mb-4">{l.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {l.expertise?.map((e) => (
                          <span key={e} className="text-xs px-2 py-0.5 rounded-full bg-white/05 border border-white/10 text-white/50">{e}</span>
                        ))}
                      </div>
                      {!reviewSubmitted && (
                        <button onClick={() => setReviewListingId(reviewListingId === l.id ? null : l.id)}
                          className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                          {reviewListingId === l.id ? '▲ Ascunde' : '★ Lasă o recenzie'}
                        </button>
                      )}
                      {reviewListingId === l.id && !reviewSubmitted && (
                        <ReviewForm juristId={id} listingId={l.id} onSubmitted={() => { setReviewSubmitted(true); fetchJurist(); }} />
                      )}
                      {reviewSubmitted && <p className="text-xs text-emerald-400 mt-2">Recenzie publicată. Mulțumim!</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {jurist.reviews?.length > 0 && (
              <div>
                <h2 className="font-semibold mb-3 text-white/80">Recenzii ({jurist.reviews.length})</h2>
                <div className="space-y-3">
                  {jurist.reviews.map((r) => (
                    <div key={r.id} className="glass rounded-2xl p-5 border border-white/08">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium">{r.clientName}</p>
                          <p className="text-xs text-white/30">{new Date(r.createdAt).toLocaleDateString('ro-MD')}</p>
                        </div>
                        <StarDisplay value={r.rating} />
                      </div>
                      <p className="text-sm text-white/60 leading-relaxed">{r.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
