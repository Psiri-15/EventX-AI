import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  Loader2,
  Bot,
  User as UserIcon,
  Ticket,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "👋 Hi! I'm **EventX AI Assistant**. Ask me anything about upcoming events, ticket availability, venues, pricing, or how QR check-in works!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    { label: '🔥 Top Tech Events', query: 'Show me upcoming technology events' },
    { label: '🎫 How QR entry works', query: 'How does digital QR ticket check-in work?' },
    { label: '💰 Budget / Free Events', query: 'What are the lowest price or free events?' },
    { label: '↩️ Refund Policy', query: 'What is the ticket cancellation and refund policy?' },
  ];

  const handleSend = async (messageToSend) => {
    const query = (messageToSend || input).trim();
    if (!query || loading) return;

    const userMessage = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: query,
        history: messages.slice(-4).map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.text,
        })),
      });

      if (res.data.success && res.data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: res.data.reply,
            provider: res.data.provider,
            matchedEvents: res.data.matchedEvents || [],
          },
        ]);
      } else {
        throw new Error('No reply from AI service');
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: "I'm temporarily experiencing connectivity issues with the recommendation server. Please check the Discover Events catalog directly!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedText = (text) => {
    // Basic Markdown formatting helper for bold and bullets
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let formattedLine = line;

      // Replace **text** with bold
      const parts = line.split(/(\*\*.*?\*\*)/g);

      return (
        <p key={idx} className={line.startsWith('•') || line.startsWith('-') ? 'ml-2 my-1' : 'my-1'}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="text-white font-semibold">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-brand-600 via-brand-500 to-accent-cyan text-white rounded-full shadow-2xl shadow-brand-500/30 hover:scale-105 active:scale-95 transition-all duration-300 font-semibold text-xs border border-white/20"
        >
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform duration-300" />
          </div>
          <span>Ask EventX AI</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </button>
      )}

      {/* Chat Drawer Window */}
      {isOpen && (
        <div className="w-[90vw] sm:w-[400px] h-[550px] bg-slate-900 border border-slate-700/90 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="px-4 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan p-0.5">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-brand-400" />
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  EventX AI Assistant
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                </h4>
                <p className="text-[10px] text-slate-400">Live Context & Recommendations</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompts Chips */}
          <div className="px-3 py-2 bg-slate-950/30 border-b border-slate-800/60 overflow-x-auto flex gap-1.5 no-scrollbar">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.query)}
                className="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-brand-600/30 text-slate-300 hover:text-white border border-slate-700/60 transition whitespace-nowrap"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl p-3 leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-brand-600 text-white rounded-tr-xs'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-xs'
                  }`}
                >
                  {renderFormattedText(m.text)}
                  {m.provider && (
                    <div className="text-[9px] text-slate-400 mt-2 font-mono flex items-center gap-1">
                      <span>Powered by {m.provider}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center text-slate-400 text-xs">
                <div className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/60 rounded-2xl px-3 py-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
                  <span>Analyzing event database...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about events, prices, venues..."
              className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white transition shadow-md shadow-brand-500/20"
              aria-label="Send query"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChatWidget;
