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
import { ChatMessage, CustomerPersona, KnowledgeBaseConfig, OrderRecord, LanguageCode } from '../types';
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
  activeLanguage: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
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
  activeLanguage,
  onLanguageChange,
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

  // Handle quick action API calls
  const handleQuickAction = async (actionId: string, actionLabel: string) => {
    try {
      const orderId = selectedPersona?.orderId;
      const customerEmail = selectedPersona?.email;

      let endpoint = '';
      let payload: any = {};

      switch (actionId) {
        case 'approve_refund':
          if (!orderId) {
            alert('No order found for this customer');
            return;
          }
          endpoint = '/api/actions/approve-refund';
          payload = { orderId, amount: null, reason: 'Customer request via chat' };
          break;

        case 'send_tracking':
          if (!orderId) {
            alert('No order found for this customer');
            return;
          }
          endpoint = '/api/actions/send-tracking';
          payload = { orderId, channel: 'email' };
          break;

        case 'download_invoice':
          if (!orderId) {
            alert('No order found for this customer');
            return;
          }
          endpoint = '/api/actions/download-invoice';
          payload = { orderId };
          break;

        case 'transfer_call':
          endpoint = '/api/actions/transfer-call';
          payload = { customerId: selectedPersona?.id, department: 'support', priority: 'high' };
          break;

        case 'escalate':
          endpoint = '/api/actions/escalate';
          payload = { 
            customerId: selectedPersona?.id, 
            reason: 'Customer requested escalation',
            sentiment: 'neutral',
            priority: 'high'
          };
          break;

        case 'view_account':
          endpoint = '/api/actions/view-account';
          payload = { customerId: selectedPersona?.id, email: customerEmail };
          break;

        case 'process_return':
          if (!orderId) {
            alert('No order found for this customer');
            return;
          }
          endpoint = '/api/actions/process-return';
          payload = { orderId, reason: 'Customer initiated return' };
          break;

        default:
          console.warn(`Unknown action: ${actionId}`);
          return;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Action failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Add a system message confirming the action
      if (result.success) {
        await onSendMessage(`Action completed: ${result.message}`);
      }
    } catch (error) {
      console.error(`Quick action error (${actionId}):`, error);
      alert(`Failed to complete action: ${String(error)}`);
    }
  };

  // Helper to find if an order is mentioned in a message
  const findReferencedOrder = (text: string) => {
    const match = text.match(/AUR-\d{4}/i);
    if (!match) return null;
    return orders.find(o => o.orderId.toUpperCase() === match[0].toUpperCase());
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-5xl mx-auto px-0 py-4 sm:py-6">
      {/* Main Chat Scroll Area */}
      <div className="flex-1 min-h-0 overflow-y-auto rounded-2xl border border-[#e3d7c4] bg-[#faf7f2] p-3 sm:p-4 scroll-smooth">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#6d5b4b]">
              <div className="w-14 h-14 rounded-2xl bg-[#edf3e4] border border-[#9ab285] flex items-center justify-center mb-4 text-[#51683d] shadow-lg">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-[#2b241f] mb-1">
                Welcome to {kbConfig.companyName} Support
              </h3>
              <p className="text-xs text-[#6d5b4b] max-w-md leading-relaxed">
                I am Aura, your dedicated Senior Customer Support Agent. How can I assist you today? Feel free to ask about orders, returns, shipping, or technical inquiries.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isAura = msg.sender === 'aura';
              const isHuman = msg.sender === 'human_agent';
              const isCustomer = msg.sender === 'customer';
              const referencedOrder = isAura ? findReferencedOrder(msg.text) : null;

              const receiptLabel = isCustomer ? `Sent ${msg.timestamp}` : `AURA, ${msg.timestamp}`;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isCustomer ? 'justify-end' : 'justify-start'} animate-[fadeIn_0.2s_ease-out]`}
                >
                  {!isCustomer && (
                    <div className="shrink-0 mt-1">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-md ${
                        isHuman ? 'bg-[#b8742f] border border-[#d7a75d]' : 'bg-gradient-to-tr from-[#51683d] to-[#7e9163] border border-[#a9b988]'
                      }`}>
                        {isHuman ? 'H' : 'A'}
                      </div>
                    </div>
                  )}

                  <div className={`max-w-[85%] sm:max-w-[78%] flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1.5 px-1">
                      <span className="text-[11px] font-semibold text-[#7b6853]">
                        {isCustomer 
                          ? (selectedPersona?.name || 'You') 
                          : isHuman 
                          ? 'Senior Specialist (Human Override)' 
                          : 'Aura (Senior AI Support)'}
                      </span>
                      <span className="text-[10px] text-[#8b7a68] font-mono px-1.5 py-0.5 rounded-full bg-[#f0e4d5] border border-[#ddc9ab]">
                        {msg.timestamp}
                      </span>
                    </div>

                    <div
                      className={`rounded-2xl p-4 sm:p-4.5 text-sm border ${
                        isCustomer
                          ? 'bg-[#51683d] text-white border-[#647c52] rounded-tr-sm shadow-sm'
                          : isHuman
                          ? 'bg-[#f3e4d3] border-[#e1c8a7] text-[#2d261f] rounded-tl-sm shadow-md'
                          : 'bg-gradient-to-br from-[#f5f0e8] to-[#ede4d9] border-2 border-[#d9c4a7] text-[#1a140d] rounded-tl-sm shadow-md'
                      }`}
                    >
                      {isCustomer ? (
                        <RichMarkdown content={msg.text} variant="user" onOrderClick={onOrderClick} />
                      ) : isAura ? (
                        <div className="leading-relaxed text-[#2d261f]">
                          <RichMarkdown content={msg.text} variant="assistant" onOrderClick={onOrderClick} />
                        </div>
                      ) : (
                        <RichMarkdown content={msg.text} variant="assistant" onOrderClick={onOrderClick} />
                      )}

                      {referencedOrder && (
                        <div className="mt-3.5 p-3 rounded-xl bg-[#f0e9df] border border-[#c9b89b] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-[#edf3e4] text-[#51683d] border border-[#9ab285]">
                              <Package className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-bold text-xs text-[#51683d]">
                                  #{referencedOrder.orderId}
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-[#e6f4ea] text-[#3f6848] border border-[#98c4a5]">
                                  {referencedOrder.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#6d5b4b]">
                                {referencedOrder.carrier} · {referencedOrder.estimatedDelivery}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => onOrderClick(referencedOrder.orderId)}
                            className="px-2.5 py-1 rounded-lg bg-[#51683d]/10 hover:bg-[#51683d]/20 text-[#405a35] text-xs font-semibold border border-[#9ab285] transition-colors cursor-pointer self-start sm:self-auto"
                          >
                            View Order
                          </button>
                        </div>
                      )}

                      {isAura && msg.quickActions && msg.quickActions.length > 0 && (
                        <div className="mt-3.5 flex flex-wrap gap-2">
                          {msg.quickActions.map((action) => (
                            <button
                              key={`${msg.id}-${action.id}`}
                              onClick={() => handleQuickAction(action.id, action.label)}
                              className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 hover:shadow-md ${
                                action.id === 'approve_refund'
                                  ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : action.id === 'send_tracking'
                                  ? 'bg-amber-50/80 text-amber-700 border-amber-200 hover:bg-amber-100'
                                  : action.id === 'download_invoice'
                                  ? 'bg-cyan-50/80 text-cyan-700 border-cyan-200 hover:bg-cyan-100'
                                  : action.id === 'transfer_call'
                                  ? 'bg-slate-50/80 text-slate-700 border-slate-200 hover:bg-slate-100'
                                  : action.id === 'escalate'
                                  ? 'bg-red-50/80 text-red-700 border-red-200 hover:bg-red-100'
                                  : action.id === 'view_account'
                                  ? 'bg-purple-50/80 text-purple-700 border-purple-200 hover:bg-purple-100'
                                  : 'bg-orange-50/80 text-orange-700 border-orange-200 hover:bg-orange-100'
                              }`}
                              title={action.label}
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className={`mt-1.5 px-1 text-[10px] font-medium ${isCustomer ? 'text-[#6d5b4b]' : 'text-[#7b6853]'}`}>
                      {receiptLabel}
                    </div>

                    {!isCustomer && (
                      <div className="flex items-center gap-2 mt-1.5 px-1 text-[#7b6853]">
                        <button
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="flex items-center gap-1 text-[11px] hover:text-[#2d261f] transition-colors cursor-pointer py-0.5 px-1.5 rounded hover:bg-[#f0e4d5]"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
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
                          className={`flex items-center gap-1 text-[11px] transition-colors cursor-pointer py-0.5 px-1.5 rounded hover:bg-[#f0e4d5] ${
                            speakingId === msg.id ? 'text-[#51683d] font-semibold' : 'hover:text-[#2d261f]'
                          }`}
                          title="Read aloud"
                        >
                          {speakingId === msg.id ? (
                            <>
                              <VolumeX className="w-3 h-3 text-[#51683d] animate-pulse" />
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
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f0e4d5] border border-[#ddc9ab] text-[#6d5b4b] ml-1">
                            {msg.metadata.category} · {msg.metadata.sentiment}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {isCustomer && (
                    <div className="shrink-0 mt-1">
                      <img
                        src={selectedPersona?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                        alt="Customer"
                        className="w-8 h-8 rounded-xl object-cover border border-[#d8c7ad]"
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {isLoading && (
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#51683d] to-[#7e9163] flex items-center justify-center text-xs font-bold text-white shadow-md">
                A
              </div>
              <div className="bg-[#f4efe7] border border-[#d8c7ad] rounded-2xl rounded-tl-sm p-4 text-[#4a4038] text-xs flex items-center gap-3 shadow-sm">
                <div className="flex gap-1.5 items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#51683d] animate-pulse" style={{ animationDelay: '0ms' }} />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#51683d] animate-pulse" style={{ animationDelay: '180ms' }} />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#51683d] animate-pulse" style={{ animationDelay: '360ms' }} />
                </div>
                <span className="text-[#5d4f40] font-semibold tracking-[0.12em] uppercase">AURA is thinking...</span>
              </div>
            </div>
          )}

          {messages.length >= 2 && !isLoading && (
            <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-[#f4efe7] via-[#f1e8da] to-[#f7f2ea] border border-[#d8c7ad] text-center">
              <h4 className="text-xs font-semibold text-[#2b241f] mb-1">
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
                          ? 'fill-[#b8742f] text-[#b8742f]'
                          : 'text-[#c3af93] hover:text-[#a38e6d]'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {csatSubmitted && (
                <p className="text-xs text-[#3f6848] font-medium mt-1">
                  Thank you! Your feedback of {csatSubmitted}/5 has been recorded.
                </p>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Composer */}
      <div className="bg-[#f8f4ef] border border-[#e3d7c4] rounded-2xl p-2.5 sm:p-3 shadow-[0_6px_16px_rgba(80,59,42,0.03)] shrink-0">
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message Aura in English, French, Arabic/Derja... (Press Enter to send)`}
              rows={2}
              className="w-full bg-[#fdfaf7] border border-[#e1d4c0] focus:border-[#51683d] focus:ring-1 focus:ring-[#51683d] rounded-xl px-3.5 py-2.5 text-sm text-[#2d261f] placeholder-[#8b7a68] resize-none outline-none transition-all"
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
              className="p-2.5 rounded-xl bg-[#f2e9dd] hover:bg-[#eadfc8] text-[#5d4f40] hover:text-[#2d261f] border border-[#dcc8a7] transition-colors cursor-pointer"
            >
              <Package className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 rounded-xl bg-[#51683d] hover:bg-[#425532] disabled:bg-[#efe5d6] disabled:text-[#9b8b77] text-white font-semibold shadow-md shadow-[#c7d4b9] transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-[#7b6853] px-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[#3f6848] font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              PII Protection Active
            </span>
          </div>
          <label className="flex items-center gap-2 rounded-full bg-[#f2e9dd] border border-[#dcc8a7] px-2 py-0.5 text-[#3d342d]">
            <span className="hidden sm:inline">Language</span>
            <select
              value={activeLanguage}
              onChange={(event) => onLanguageChange(event.target.value as LanguageCode)}
              className="bg-transparent text-[#3d342d] font-medium outline-none cursor-pointer"
              aria-label="Select chat language"
            >
              <option value="en">EN</option>
              <option value="fr">FR</option>
              <option value="ar">AR</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
};
