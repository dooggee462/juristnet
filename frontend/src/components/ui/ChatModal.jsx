import { useState, useEffect, useRef } from 'react';
import { X, Send, Loader } from 'lucide-react';
import { getSocket } from '../../lib/socket.js';
import api from '../../lib/api.js';

function Avatar({ name, avatarUrl, size = 8 }) {
  const initials = name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  if (avatarUrl) {
    return <img src={avatarUrl} alt="" className={`w-${size} h-${size} rounded-full object-cover flex-shrink-0`} />;
  }
  return (
    <div className={`w-${size} h-${size} rounded-full bg-brand-600/30 flex items-center justify-center text-brand-300 text-xs font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

// Client-facing chat modal — opened from ExpertProfile
export function ClientChatModal({ expert, onClose }) {
  const [step, setStep] = useState('identify'); // identify | chat
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [conv, setConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const socketRef = useRef(null);

  const scrollBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => { scrollBottom(); }, [messages]);

  const startChat = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.post('/chat/start', {
        expertId: expert.id,
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim().toLowerCase(),
      });
      setConv(data.conversation);
      setMessages(data.conversation.chatMessages || []);
      setStep('chat');

      const socket = getSocket({ clientEmail: clientEmail.trim().toLowerCase(), clientName: clientName.trim() });
      socketRef.current = socket;
      socket.emit('join_conversation', { conversationId: data.conversation.id });
      socket.on('new_message', (msg) => setMessages((prev) => [...prev, msg]));
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() || !conv) return;
    socketRef.current?.emit('send_message', { conversationId: conv.id, body: text.trim() });
    setText('');
  };

  useEffect(() => () => { socketRef.current?.off('new_message'); }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass border border-white/10 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md flex flex-col" style={{ height: '85vh', maxHeight: 600 }}>
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-white/08">
          <Avatar name={`${expert.firstName} ${expert.lastName}`} avatarUrl={expert.avatarUrl} size={10} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{expert.firstName} {expert.lastName}</p>
            <p className="text-xs text-white/40">Expert</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        {step === 'identify' ? (
          <form onSubmit={startChat} className="flex-1 flex flex-col justify-center p-6 gap-4">
            <p className="text-sm text-white/60 text-center mb-2">Introduceți datele dvs. pentru a începe conversația</p>
            <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Numele dvs." required
              className="w-full bg-white/05 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-brand-500/50" />
            <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="Email dvs." required
              className="w-full bg-white/05 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-brand-500/50" />
            <button type="submit" disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader size={15} className="animate-spin" /> : null}
              Începe conversația
            </button>
          </form>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <p className="text-center text-xs text-white/30 py-8">Niciun mesaj. Scrieți primul mesaj!</p>
              )}
              {messages.map((m) => {
                const isClient = m.senderType === 'CLIENT';
                return (
                  <div key={m.id} className={`flex gap-2 ${isClient ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Avatar name={m.senderName} avatarUrl={isClient ? null : expert.avatarUrl} size={7} />
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${isClient ? 'bg-brand-600/30 text-white rounded-tr-sm' : 'bg-white/08 text-white/90 rounded-tl-sm'}`}>
                      <p className="leading-relaxed">{m.body}</p>
                      <p className={`text-xs mt-1 ${isClient ? 'text-brand-300/60' : 'text-white/30'}`}>
                        {new Date(m.createdAt).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={sendMessage} className="p-3 border-t border-white/08 flex gap-2">
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Scrieți un mesaj..."
                className="flex-1 bg-white/05 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-brand-500/50" />
              <button type="submit" disabled={!text.trim()}
                className="w-10 h-10 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-30 flex items-center justify-center transition-colors flex-shrink-0">
                <Send size={15} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// Expert-facing chat panel — used in Inbox page
export function ExpertChatPanel({ conversation, token, onClose }) {
  const [messages, setMessages] = useState(conversation.chatMessages || []);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    const socket = getSocket({ token });
    socketRef.current = socket;
    socket.emit('join_conversation', { conversationId: conversation.id });
    socket.on('new_message', (msg) => setMessages((prev) => {
      if (prev.find((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    }));
    return () => socket.off('new_message');
  }, [conversation.id, token]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    socketRef.current?.emit('send_message', { conversationId: conversation.id, body: text.trim() });
    setText('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 pb-4 border-b border-white/08 mb-2">
        <Avatar name={conversation.clientName} size={9} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{conversation.clientName}</p>
          <p className="text-xs text-white/40">{conversation.clientEmail}</p>
        </div>
        {onClose && <button onClick={onClose} className="text-white/30 hover:text-white"><X size={16} /></button>}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 && (
          <p className="text-center text-xs text-white/30 py-6">Niciun mesaj</p>
        )}
        {messages.map((m) => {
          const isExpert = m.senderType === 'EXPERT';
          return (
            <div key={m.id} className={`flex gap-2 ${isExpert ? 'flex-row-reverse' : 'flex-row'}`}>
              <Avatar name={m.senderName} size={7} />
              <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${isExpert ? 'bg-brand-600/30 text-white rounded-tr-sm' : 'bg-white/08 text-white/90 rounded-tl-sm'}`}>
                <p className="leading-relaxed">{m.body}</p>
                <p className={`text-xs mt-1 ${isExpert ? 'text-brand-300/60' : 'text-white/30'}`}>
                  {new Date(m.createdAt).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="pt-3 border-t border-white/08 flex gap-2 mt-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Răspundeți..."
          className="flex-1 bg-white/05 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-brand-500/50" />
        <button type="submit" disabled={!text.trim()}
          className="w-10 h-10 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-30 flex items-center justify-center transition-colors flex-shrink-0">
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
