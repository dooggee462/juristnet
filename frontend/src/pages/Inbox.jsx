import { useState, useEffect } from 'react';
import { Mail, MailOpen, Clock } from 'lucide-react';
import Navbar from '../components/layout/Navbar.jsx';
import api from '../lib/api.js';

export default function Inbox() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/messages/inbox').then((d) => {
      setMessages(d.messages);
      setLoading(false);
    });
  }, []);

  const markRead = async (msg) => {
    setSelected(msg);
    if (!msg.isRead) {
      await api.patch(`/messages/${msg.id}/read`);
      setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, isRead: true } : m));
    }
  };

  const unread = messages.filter((m) => !m.isRead).length;

  return (
    <div className="min-h-screen bg-[#0f0f13]">
      <Navbar />
      <main className="pt-24 pb-16 max-w-5xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Inbox</h1>
          <p className="text-sm text-white/40">{unread > 0 ? `${unread} mesaje necitite` : 'Toate mesajele citite'}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Message list */}
          <div className="space-y-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="bento-card h-20 animate-pulse" />)
            ) : messages.length === 0 ? (
              <div className="glass rounded-2xl p-8 border border-white/08 text-center text-white/30">
                <Mail size={32} className="mx-auto mb-3 opacity-30" />
                <p>Niciun mesaj primit</p>
              </div>
            ) : (
              messages.map((m) => (
                <button
                  key={m.id}
                  onClick={() => markRead(m)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    selected?.id === m.id
                      ? 'bg-brand-600/15 border-brand-500/30'
                      : 'glass border-white/08 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 flex-shrink-0 ${m.isRead ? 'text-white/20' : 'text-brand-400'}`}>
                      {m.isRead ? <MailOpen size={15} /> : <Mail size={15} />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-sm font-medium ${!m.isRead ? 'text-white' : 'text-white/60'}`}>{m.senderName}</span>
                        {!m.isRead && <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-white/50 truncate">{m.subject}</p>
                      <div className="flex items-center gap-1 text-xs text-white/25 mt-1">
                        <Clock size={10} />
                        {new Date(m.createdAt).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Message detail */}
          <div className="lg:sticky lg:top-24 h-fit">
            {selected ? (
              <div className="glass rounded-2xl p-6 border border-white/08">
                <div className="mb-4 pb-4 border-b border-white/08">
                  <h2 className="font-semibold mb-1">{selected.subject}</h2>
                  <div className="flex items-center gap-2 text-sm text-white/40">
                    <span>{selected.senderName}</span>
                    <span>·</span>
                    <span>{selected.senderEmail}</span>
                  </div>
                  <p className="text-xs text-white/25 mt-1">
                    {new Date(selected.createdAt).toLocaleDateString('ro-RO', { dateStyle: 'full', timeStyle: 'short' })}
                  </p>
                </div>
                <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{selected.body}</p>
                <a
                  href={`mailto:${selected.senderEmail}?subject=Re: ${selected.subject}`}
                  className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-xl bg-brand-600/20 border border-brand-500/30 text-brand-400 text-sm hover:bg-brand-600/30 transition-colors"
                >
                  <Mail size={14} /> Răspunde prin email
                </a>
              </div>
            ) : (
              <div className="glass rounded-2xl p-8 border border-white/08 text-center text-white/25">
                <MailOpen size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Selectați un mesaj pentru a-l citi</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
