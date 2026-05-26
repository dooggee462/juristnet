import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import Navbar from '../components/layout/Navbar.jsx';
import { ExpertChatPanel } from '../components/ui/ChatModal.jsx';
import { useAuthStore } from '../store/authStore.js';
import api from '../lib/api.js';

export default function Inbox() {
  const { token } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/chat/expert/inbox').then((d) => {
      setConversations(d.conversations);
      setLoading(false);
    });
  }, []);

  const openConversation = async (conv) => {
    const data = await api.get(`/chat/${conv.id}`);
    setSelected(data.conversation);
  };

  return (
    <div className="min-h-screen bg-[#0f0f13]">
      <Navbar />
      <main className="pt-24 pb-16 max-w-5xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Mesaje</h1>
          <p className="text-sm text-white/40">{conversations.length} conversații</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5" style={{ height: 'calc(100vh - 220px)' }}>
          {/* Conversation list */}
          <div className="lg:col-span-2 space-y-2 overflow-y-auto">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="bento-card h-20 animate-pulse" />)
            ) : conversations.length === 0 ? (
              <div className="glass rounded-2xl p-8 border border-white/08 text-center text-white/30">
                <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
                <p>Nicio conversație</p>
              </div>
            ) : (
              conversations.map((c) => {
                const lastMsg = c.chatMessages?.[0];
                const isSelected = selected?.id === c.id;
                return (
                  <button key={c.id} onClick={() => openConversation(c)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${isSelected ? 'bg-brand-600/15 border-brand-500/30' : 'glass border-white/08 hover:border-white/15'}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-600/20 flex items-center justify-center text-brand-300 text-xs font-bold flex-shrink-0">
                        {c.clientName?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{c.clientName}</p>
                        <p className="text-xs text-white/40 truncate">{c.clientEmail}</p>
                        {lastMsg && (
                          <p className="text-xs text-white/30 truncate mt-1">{lastMsg.body}</p>
                        )}
                      </div>
                      <span className="text-xs text-white/25 flex-shrink-0">
                        {c._count?.chatMessages ?? 0} msg
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Chat panel */}
          <div className="lg:col-span-3 glass rounded-2xl border border-white/08 p-5 flex flex-col overflow-hidden">
            {selected ? (
              <ExpertChatPanel conversation={selected} token={token} onClose={() => setSelected(null)} />
            ) : (
              <div className="flex-1 flex items-center justify-center text-white/25">
                <div className="text-center">
                  <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Selectați o conversație</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
