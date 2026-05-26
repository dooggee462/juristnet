import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import { EXPERTISE_OPTIONS, LANGUAGE_OPTIONS, MOLDOVA_REGIONS, PHONE_PREFIX, DEFAULT_COUNTRY } from '../lib/constants.js';

export default function JuristAuth({ mode }) {
  const navigate = useNavigate();
  const { login, register, loading } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '', password: '', firstName: '', lastName: '',
    country: DEFAULT_COUNTRY, postalCode: '', streetAddress: '',
    phoneNumber: PHONE_PREFIX,
    areasOfExpertise: [], spokenLanguages: ['Română'],
    city: '', region: '', bio: '',
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const toggleArr = (k, v) => setForm((p) => ({
    ...p,
    [k]: p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v],
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.error || 'A apărut o eroare. Încercați din nou.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-brand-700/15 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-lg">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 mb-8 transition-colors">
          <ArrowLeft size={15} /> Înapoi la pagina principală
        </Link>

        <div className="glass rounded-3xl p-8 border border-white/08">
          <div className="flex items-center gap-2.5 mb-8">
            <span className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
              <Scale size={18} />
            </span>
            <span className="text-xl font-bold text-gradient">JuristNet</span>
          </div>

          <h1 className="text-2xl font-bold mb-1">
            {mode === 'login' ? 'Bun venit înapoi' : 'Creați cont de jurist'}
          </h1>
          <p className="text-white/40 text-sm mb-8">
            {mode === 'login' ? 'Introduceți datele de autentificare' : 'Completați formularul pentru a vă înregistra'}
          </p>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Prenume" value={form.firstName} onChange={(v) => set('firstName', v)} placeholder="Ion" required />
                <Field label="Nume" value={form.lastName} onChange={(v) => set('lastName', v)} placeholder="Popescu" required />
              </div>
            )}

            <Field label="Email" type="email" value={form.email} onChange={(v) => set('email', v)} placeholder="email@exemplu.md" required />

            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Parolă</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder={mode === 'register' ? 'Minim 8 caractere' : '••••••••'}
                  required
                  minLength={mode === 'register' ? 8 : undefined}
                  className="w-full bg-white/05 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-brand-500/60 pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <>
                <div className="pt-2 pb-1">
                  <div className="h-px bg-white/06" />
                  <p className="text-xs text-white/30 mt-3 mb-1">Informații de contact</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Țara</label>
                  <input value={form.country} readOnly className="w-full bg-white/03 border border-white/08 rounded-xl px-4 py-2.5 text-sm text-white/50 cursor-not-allowed" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">Localitate / Raion</label>
                    <select
                      value={form.city}
                      onChange={(e) => set('city', e.target.value)}
                      className="w-full bg-white/05 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500/60"
                    >
                      <option value="">Selectați</option>
                      {MOLDOVA_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <Field label="Cod Poștal" value={form.postalCode} onChange={(v) => set('postalCode', v)} placeholder="MD-2001" required />
                </div>

                <Field label="Adresă (Stradă)" value={form.streetAddress} onChange={(v) => set('streetAddress', v)} placeholder="Str. Ștefan cel Mare nr. 1" required />

                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Număr de telefon</label>
                  <div className="flex gap-2">
                    <span className="flex items-center px-3 rounded-xl bg-white/05 border border-white/10 text-white/50 text-sm whitespace-nowrap">
                      🇲🇩 +373
                    </span>
                    <input
                      type="tel"
                      value={form.phoneNumber.replace('+373', '').trim()}
                      onChange={(e) => set('phoneNumber', `+373 ${e.target.value.replace(/\D/g, '').slice(0, 8)}`)}
                      placeholder="69 123 456"
                      required
                      className="flex-1 bg-white/05 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-brand-500/60"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="h-px bg-white/06" />
                  <p className="text-xs text-white/30 mt-3 mb-2">Domenii de expertiză</p>
                  <div className="flex flex-wrap gap-2">
                    {EXPERTISE_OPTIONS.map((e) => (
                      <button key={e} type="button" onClick={() => toggleArr('areasOfExpertise', e)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${form.areasOfExpertise.includes(e) ? 'bg-brand-600/30 border-brand-500/50 text-brand-300' : 'bg-white/05 border-white/10 text-white/50 hover:border-white/20'}`}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-white/30 mb-2">Limbi vorbite</p>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGE_OPTIONS.map((l) => (
                      <button key={l} type="button" onClick={() => toggleArr('spokenLanguages', l)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${form.spokenLanguages.includes(l) ? 'bg-purple-600/30 border-purple-500/50 text-purple-300' : 'bg-white/05 border-white/10 text-white/50 hover:border-white/20'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Descriere profesională (opțional)</label>
                  <textarea value={form.bio} onChange={(e) => set('bio', e.target.value)} rows={3}
                    placeholder="Descrieți pe scurt experiența și specializările dvs..."
                    className="w-full bg-white/05 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-brand-500/60 resize-none" />
                </div>
              </>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors mt-2">
              {loading ? 'Se procesează...' : mode === 'login' ? 'Autentificare' : 'Înregistrare'}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            {mode === 'login'
              ? (<>Nu aveți cont? <Link to="/jurist/inregistrare" className="text-brand-400 hover:text-brand-300">Înregistrați-vă</Link></>)
              : (<>Aveți deja cont? <Link to="/jurist/login" className="text-brand-400 hover:text-brand-300">Autentificați-vă</Link></>)}
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder, required }) {
  return (
    <div>
      <label className="block text-xs font-medium text-white/50 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required}
        className="w-full bg-white/05 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-brand-500/60" />
    </div>
  );
}
