import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Star, 
  RotateCcw, 
  Package, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle,
  CornerDownRight,
  Mic,
  Paperclip,
  Clock,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ChatMessage, CustomerPersona, KnowledgeBaseConfig, OrderRecord } from '../types';
import { RichMarkdown } from '../lib/markdown';
import { speakText, stopSpeaking } from '../lib/audio';

interface CustomerChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  kbConfig: KnowledgeBaseConfig;
  selectedPersona: CustomerPersona | null;
  onSelectPersona: (persona: CustomerPersona) => void;
  personas: CustomerPersona[];
  onOrderClick: (orderId: string) => void;
  onResetChat: () => void;
  orders: OrderRecord[];
}

export const CustomerChat: React.FC<CustomerChatProps> = ({
  messages,
  onSendMessage,
  isLoading,
  kbConfig,
  selectedPersona,
  onSelectPersona,
  personas,
  onOrderClick,
  onResetChat,
  orders
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [csatSubmitted, setCsatSubmitted] = useState<number | null>(null);
  const [csatHover, setCsatHover] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    const text = inputText.trim();
    setInputText('');
    stopSpeaking();
    setSpeakingId(null);
    await onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleSpeak = (text: string, id: string) => {
    if (speakingId === id) {
      stopSpeaking();
      setSpeakingId(null);
    } else {
      stopSpeaking();
      setSpeakingId(id);
      speakText(text);
    }
  };

  const handleRateCsat = (rating: number) => {
    setCsatSubmitted(rating);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#6366f1', '#a855f7', '#10b981', '#f59e0b']
    });
  };

  // Quick suggestion chips
  const quickSuggestions = [
    { label: '📦 Track Order #AUR-8921', query: 'Can you check the current status and delivery estimate for order #AUR-8921?' },
    { label: '🔄 14-Day Return Steps', query: 'What is your return policy and how do I get a refund for an unopened item?' },
    { label: '🚚 Free Shipping Minimum', query: 'What is your shipping policy and the free shipping threshold?' },
    { label: '🇫🇷 Demande en Français', query: 'Bonjour Aura, quel est le délai pour retourner un article sous garantie ?' },
    { label: '🇹🇳 Suivi en Derja', query: 'Salam Aura, 3aychek commande mte3i #AUR-9904 waktéh tousel?' },
  ];

  // Helper to find if an order is mentioned in a message
  const findReferencedOrder = (text: string) => {
    const match = text.match(/AUR-\d{4}/i);
    if (!match) return null;
    return orders.find(o => o.orderId.toUpperCase() === match[0].toUpperCase());
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto px-4 py-4 sm:py-6">
      {/* Top Banner: Persona Switcher & Knowledge Context */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 mb-4 shadow-lg shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-base shadow-md shadow-indigo-950/50">
                A
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Aura <span className="text-indigo-400 font-medium">· Senior Customer Support Agent</span>
                </h2>
                <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50 text-[10px] font-semibold uppercase tracking-wider">
                  Official AI Agent
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Representing <span className="text-slate-200 font-medium">{kbConfig.companyName}</span> · Active hours: {kbConfig.businessHours}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer border border-slate-700/60"
              title="Reset conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Chat</span>
            </button>
          </div>
        </div>

        {/* Persona quick selector chips */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
            Personas:
          </span>
          {personas.map((persona) => {
            const isSelected = selectedPersona?.id === persona.id;
            return (
              <button
                key={persona.id}
                onClick={() => onSelectPersona(persona)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                }`}
              >
                <img
                  src={persona.avatar}
                  alt={persona.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span>{persona.name}</span>
                <span className="text-[10px] opacity-75 font-mono">({persona.tag})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Scroll Area */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 p-4 sm:p-6 shadow-inner">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-14 h-14 rounded-2xl bg-indigo-950/60 border border-indigo-700/40 flex items-center justify-center mb-4 text-indigo-400 shadow-lg">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-100 mb-1">
              Welcome to {kbConfig.companyName} Support
            </h3>
            <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
              I am Aura, your dedicated Senior Customer Support Agent. How can I assist you today? Feel free to ask about orders, returns, shipping, or technical inquiries.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full text-left">
              {quickSuggestions.slice(0, 4).map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(s.query)}
                  className="p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700/70 text-xs text-slate-200 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span className="font-medium text-slate-200">{s.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isAura = msg.sender === 'aura';
            const isHuman = msg.sender === 'human_agent';
            const isCustomer = msg.sender === 'customer';
            const referencedOrder = isAura ? findReferencedOrder(msg.text) : null;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isCustomer ? 'justify-end' : 'justify-start'}`}
              >
                {/* Agent Avatar */}
                {!isCustomer && (
                  <div className="shrink-0 mt-1">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-md ${
                      isHuman ? 'bg-amber-600 border border-amber-400/40' : 'bg-gradient-to-tr from-indigo-600 to-purple-600 border border-indigo-400/40'
                    }`}>
                      {isHuman ? 'H' : 'A'}
                    </div>
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`max-w-[85%] sm:max-w-[78%] flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}>
                  {/* Sender Info & Timestamp */}
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[11px] font-semibold text-slate-400">
                      {isCustomer 
                        ? (selectedPersona?.name || 'You') 
                        : isHuman 
                        ? 'Senior Specialist (Human Override)' 
                        : 'Aura (Senior AI Support)'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {msg.timestamp}
                    </span>
                  </div>

                  <div
                    className={`rounded-2xl p-4 sm:p-4.5 shadow-sm text-sm ${
                      isCustomer
                        ? 'bg-indigo-600 text-white rounded-tr-sm'
                        : isHuman
                        ? 'bg-amber-950/40 border border-amber-700/50 text-slate-100 rounded-tl-sm'
                        : 'bg-slate-800/90 border border-slate-700/80 text-slate-100 rounded-tl-sm'
                    }`}
                  >
                    {isCustomer ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    ) : (
                      <RichMarkdown content={msg.text} onOrderClick={onOrderClick} />
                    )}

                    {/* Inline Order Highlight Card */}
                    {referencedOrder && (
                      <div className="mt-3.5 p-3 rounded-xl bg-slate-900/90 border border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-indigo-300">
                                #{referencedOrder.orderId}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                                {referencedOrder.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              {referencedOrder.carrier} · {referencedOrder.estimatedDelivery}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => onOrderClick(referencedOrder.orderId)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-xs font-semibold border border-indigo-500/40 transition-colors cursor-pointer self-start sm:self-auto"
                        >
                          View Order
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions for Agent Responses */}
                  {!isCustomer && (
                    <div className="flex items-center gap-2 mt-1.5 px-1 text-slate-400">
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="flex items-center gap-1 text-[11px] hover:text-slate-200 transition-colors cursor-pointer py-0.5 px-1.5 rounded hover:bg-slate-800/50"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleToggleSpeak(msg.text, msg.id)}
                        className={`flex items-center gap-1 text-[11px] transition-colors cursor-pointer py-0.5 px-1.5 rounded hover:bg-slate-800/50 ${
                          speakingId === msg.id ? 'text-indigo-400 font-semibold' : 'hover:text-slate-200'
                        }`}
                        title="Read aloud"
                      >
                        {speakingId === msg.id ? (
                          <>
                            <VolumeX className="w-3 h-3 text-indigo-400 animate-pulse" />
                            <span>Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span>Listen</span>
                          </>
                        )}
                      </button>

                      {msg.metadata && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 ml-1">
                          {msg.metadata.category} · {msg.metadata.sentiment}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Customer Avatar */}
                {isCustomer && (
                  <div className="shrink-0 mt-1">
                    <img
                      src={selectedPersona?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt="Customer"
                      className="w-8 h-8 rounded-xl object-cover border border-slate-700"
                    />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
              A
            </div>
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl rounded-tl-sm p-4 text-slate-300 text-xs flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-slate-400 font-medium">Aura is consulting knowledge policies & evaluating triage...</span>
            </div>
          </div>
        )}

        {/* CSAT Customer Rating Card */}
        {messages.length >= 2 && !isLoading && (
          <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800/80 text-center">
            <h4 className="text-xs font-semibold text-slate-200 mb-1">
              How satisfied are you with Aura's assistance today?
            </h4>
            <div className="flex items-center justify-center gap-1.5 my-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRateCsat(star)}
                  onMouseEnter={() => setCsatHover(star)}
                  onMouseLeave={() => setCsatHover(null)}
                  className="p-1.5 transition-transform hover:scale-110 cursor-pointer"
                >
                  <Star
                    className={`w-5 h-5 ${
                      (csatHover !== null ? star <= csatHover : (csatSubmitted !== null && star <= csatSubmitted))
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-600 hover:text-slate-400'
                    }`}
                  />
                </button>
              ))}
            </div>
            {csatSubmitted && (
              <p className="text-xs text-emerald-400 font-medium mt-1">
                Thank you! Your feedback of {csatSubmitted}/5 has been recorded.
              </p>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="py-2.5 flex items-center gap-2 overflow-x-auto shrink-0">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
          Quick queries:
        </span>
        {quickSuggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(s.query)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Input Composer */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-lg shrink-0">
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message Aura in English, French, Arabic/Derja... (Press Enter to send)`}
              rows={2}
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 resize-none outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0 mb-1">
            <button
              type="button"
              onClick={() => {
                setInputText("Can you please verify if Order #AUR-8921 is eligible for an express replacement or refund?");
                inputRef.current?.focus();
              }}
              title="Insert sample Order #AUR-8921 inquiry"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-colors cursor-pointer"
            >
              <Package className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold shadow-md shadow-indigo-950 transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Strict Enterprise Boundaries & PII Protection Active
            </span>
          </div>
          <span className="hidden sm:inline">
            Aura adapts to English, French, and Arabic/Derja
          </span>
        </div>
      </div>
    </div>
  );
};
