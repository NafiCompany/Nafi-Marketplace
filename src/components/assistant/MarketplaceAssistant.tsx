import { Bot, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { AssistantMessage } from '../../types';
import './assistant.css';

const welcome: AssistantMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Halo! Saya NAFI Assistant 👋\n\nSaya bisa membantu menemukan produk digital, menjelaskan cara pembelian, pembayaran QR, dan status pesanan. Ada yang ingin ditanyakan?',
  createdAt: new Date().toISOString(),
};

const chips = [
  'Rekomendasi produk AI',
  'Cara pembayaran QR',
  'Bagaimana mengunduh produk?',
  'Tampilkan produk terlaris',
];

export function MarketplaceAssistant() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([welcome]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text = input) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const userMessage: AssistantMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((current) => [...current, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const response = await api.post<{ message: string }>(
        '/api/assistant/chat',
        {
          message: trimmed,
          history: messages.slice(-8).map(({ role, content }) => ({ role, content })),
        },
        Boolean(user),
      );
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response.message,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content:
            error instanceof Error
              ? error.message
              : 'NAFI Assistant sedang mengalami kendala. Silakan coba lagi.',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      <button className="nafi-chat-trigger" onClick={() => setOpen(true)} aria-label="Buka NAFI Assistant">
        <Bot size={22} /><span>NAFI Assistant</span>
      </button>
      {open && (
        <section className="nafi-chat-panel" role="dialog" aria-label="NAFI Assistant">
          <header className="nafi-chat-head">
            <div className="nafi-chat-avatar"><img src="/assets/logo-only.png" alt="" /></div>
            <div className="nafi-chat-title"><strong>NAFI Assistant</strong><small>● Siap membantu</small></div>
            <button className="nafi-chat-close" onClick={() => setOpen(false)} aria-label="Tutup"><X size={20}/></button>
          </header>
          <div className="nafi-chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`nafi-chat-row ${message.role}`}>
                <div className="nafi-chat-bubble">
                  {message.content}
                  <span className="nafi-chat-time">
                    {new Date(message.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="nafi-chat-row assistant"><div className="nafi-chat-bubble"><span className="nafi-chat-dots"><span/><span/><span/></span></div></div>
            )}
            <div ref={endRef} />
          </div>
          <div className="nafi-chat-actions">
            {chips.map((chip) => <button key={chip} className="nafi-chat-chip" onClick={() => void send(chip)}>{chip}</button>)}
          </div>
          <div className="nafi-chat-composer">
            <textarea
              className="nafi-chat-input"
              value={input}
              maxLength={2000}
              placeholder="Tanyakan produk atau pesanan..."
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void send();
                }
              }}
            />
            <button className="nafi-chat-send" disabled={!input.trim() || loading} onClick={() => void send()} aria-label="Kirim"><Send size={19}/></button>
          </div>
        </section>
      )}
    </>,
    document.body,
  );
}
