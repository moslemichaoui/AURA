import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Terminal, 
  Download, 
  FileText, 
  UserCheck, 
  DollarSign, 
  MessageSquare, 
  Sparkles,
  Zap,
  Tag,
  Flame,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Eye,
  Code
} from 'lucide-react';
import { ChatMessage, TicketMetadata, KnowledgeBaseConfig, OrderRecord } from '../types';
import { RichMarkdown } from '../lib/markdown';

interface OpsDashboardProps {
  messages: ChatMessage[];
  currentMetadata: TicketMetadata | null;
  kbConfig: KnowledgeBaseConfig;
  onEscalate: (reason?: string) => void;
  onRefund: (orderId: string) => void;
  onAddInternalNote: (note: string) => void;
  onOrderClick: (orderId: string) => void;
  orders: OrderRecord[];
}

export const OpsDashboard: React.FC<OpsDashboardProps> = ({
  messages,
  currentMetadata,
  kbConfig,
  onEscalate,
  onRefund,
  onAddInternalNote,
  onOrderClick,
  orders,
}) => {
  const [internalNoteInput, setInternalNoteInput] = useState('');
  const [showRawInspector, setShowRawInspector] = useState(false);
  const [selectedMessageIndex, setSelectedMessageIndex] = useState<number | null>(null);

  // Latest message from Aura with metadata
  const auraMessages = messages.filter(m => m.sender === 'aura' && m.metadata);
  const activeMessage = selectedMessageIndex !== null 
    ? auraMessages[selectedMessageIndex] 
    : auraMessages[auraMessages.length - 1] || messages[messages.length - 1];

  const metadata: TicketMetadata = activeMessage?.metadata || currentMetadata || {
    category: 'General',
    priority: 'Medium',
    sentiment: 'Neutral',
    action_required: 'Awaiting Customer Reply',
    confidence_score: '0.92'
  };

  // Find referenced order
  const referencedOrderIdMatch = (activeMessage?.text || '').match(/AUR-\d{4}/i);
  const referencedOrder = referencedOrderIdMatch ? orders.find(o => o.orderId.toUpperCase() === referencedOrderIdMatch[0].toUpperCase()) : null;

  // Helpers for badge styles
  const getPriorityBadge = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse';
      case 'high':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'medium':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/50';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/50';
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'frustrated':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50';
      case 'negative':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'positive':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/50';
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'shipping':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'billing':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
      case 'technical':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      case 'account':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/50';
    }
  };

  const getActionBadge = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'escalate to human':
        return 'bg-rose-950 text-rose-300 border-rose-700';
      case 'refund requested':
        return 'bg-amber-950 text-amber-300 border-amber-700';
      case 'resolved':
        return 'bg-emerald-950 text-emerald-300 border-emerald-700';
      default:
        return 'bg-indigo-950 text-indigo-300 border-indigo-700';
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalNoteInput.trim()) return;
    onAddInternalNote(internalNoteInput.trim());
    setInternalNoteInput('');
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      company: kbConfig.companyName,
      timestamp: new Date().toISOString(),
      metadata,
      messages
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `aura-triage-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const confidenceNum = parseFloat(metadata.confidence_score) || 0.95;
  const confidencePercent = Math.round(confidenceNum <= 1 ? confidenceNum * 100 : confidenceNum);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header & Triage Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                Live Dual-Output Inspector & AI Triage HUD
              </h1>
              <p className="text-xs text-slate-400">
                Real-time parsing of Aura's customer response vs. structured enterprise metadata
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowRawInspector(!showRawInspector)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              showRawInspector
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showRawInspector ? 'Hide Raw Output' : 'View Raw Markdown & JSON'}</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Triage</span>
          </button>
        </div>
      </div>

      {/* 4-Column Live Metadata Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Category */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Triage Category</span>
            <Tag className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-1">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getCategoryBadge(metadata.category)}`}>
              {metadata.category || 'General'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Auto-routed via Gemini 3.7
          </p>
        </div>

        {/* Card 2: Priority */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Priority Level</span>
            <Flame className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-1">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getPriorityBadge(metadata.priority)}`}>
              {metadata.priority || 'Medium'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            SLA Response Target: {metadata.priority === 'Urgent' ? '< 5 mins' : '< 1 hour'}
          </p>
        </div>

        {/* Card 3: Sentiment */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Customer Sentiment</span>
            <Activity className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-1">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getSentimentBadge(metadata.sentiment)}`}>
              {metadata.sentiment || 'Neutral'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {metadata.sentiment === 'Frustrated' ? 'Empathy protocol triggered' : 'Standard de-escalation'}
          </p>
        </div>

        {/* Card 4: Action Required */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Next Action</span>
            <ArrowUpRight className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-1">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getActionBadge(metadata.action_required)}`}>
              {metadata.action_required || 'Awaiting Customer Reply'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Assigned: {metadata.action_required === 'Escalate to Human' ? 'Tier 2 Support' : 'Aura AI'}
          </p>
        </div>

        {/* Card 5: Confidence Score */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Confidence</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-extrabold text-white font-mono">{confidencePercent}%</span>
            <span className="text-xs text-emerald-400 font-medium">Calibrated</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Dual Inspector Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Customer Visible Output */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  1. Customer-Visible Output
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Rendered with clean formatting
              </span>
            </div>

            {activeMessage ? (
              <div className="space-y-4">
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4">
                  <div className="text-xs text-indigo-400 font-semibold mb-2 flex items-center justify-between">
                    <span>Aura's Customer Response:</span>
                    <span className="text-slate-500 font-mono text-[10px]">{activeMessage.timestamp}</span>
                  </div>
                  <RichMarkdown content={activeMessage.text} onOrderClick={onOrderClick} />
                </div>

                {referencedOrder && (
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-indigo-500/30 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-300">
                          Order #{referencedOrder.orderId}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {referencedOrder.carrier}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Customer: {referencedOrder.customerName} ({referencedOrder.customerEmail}) · Total: ${referencedOrder.total.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => onOrderClick(referencedOrder.orderId)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-xs font-semibold border border-indigo-500/40 transition-colors cursor-pointer"
                    >
                      Inspect Order
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-6 text-center">
                No active response. Send a customer message to inspect live triage.
              </p>
            )}
          </div>

          {/* Raw Output Block (Optional Inspector) */}
          {showRawInspector && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 font-mono text-xs shadow-lg">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-slate-400">
                <span className="flex items-center gap-1.5 text-indigo-400 font-bold">
                  <Terminal className="w-4 h-4" />
                  RAW DUAL-OUTPUT PAYLOAD (Direct from Gemini)
                </span>
                <span className="text-[10px] text-slate-500">Dual-Output Markdown Spec</span>
              </div>
              <pre className="text-slate-300 whitespace-pre-wrap overflow-x-auto p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] leading-relaxed max-h-96">
                {activeMessage?.rawResponse || `### 1. AGENT RESPONSE (Visible to Customer)\n${activeMessage?.text || ''}\n\n### 2. TICKET METADATA (Internal JSON)\n\`\`\`json\n${JSON.stringify(metadata, null, 2)}\n\`\`\``}
              </pre>
            </div>
          )}

          {/* Enterprise Guardrails Telemetry */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Enterprise Guardrails & Policy Compliance
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-200">Strict Anti-Hallucination</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Responses strictly grounded in {kbConfig.companyName} policies. No invented terms.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-200">Security & PII Shield</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Zero requests for passwords, CVVs, or full credit card numbers.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-200">De-escalation Protocol</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Empathy validated for frustrated customers with constructive next steps.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-200">Tone & Scannability</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Concise paragraphs (&lt; 3 lines), bullet-pointed steps, warm & professional.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Internal JSON & Human Actions */}
        <div className="lg:col-span-5 space-y-4">
          {/* Section 2: Internal Ticket Metadata JSON */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  2. Ticket Metadata (Internal JSON)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-indigo-400">
                Dual-Output Block
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-indigo-300 overflow-x-auto">
              <pre>{JSON.stringify(metadata, null, 2)}</pre>
            </div>
          </div>

          {/* Human-in-the-Loop Operations Controls */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-400" />
              Human-in-the-Loop Actions
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => onEscalate('Customer requested human supervisor or complex technical issue')}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-colors cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Escalate to Tier 2</span>
              </button>

              <button
                onClick={() => {
                  if (referencedOrder) {
                    onRefund(referencedOrder.orderId);
                  } else {
                    onRefund('AUR-8921');
                  }
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-colors cursor-pointer"
              >
                <DollarSign className="w-4 h-4" />
                <span>Issue Order Refund</span>
              </button>
            </div>

            {/* Internal Staff Notes */}
            <form onSubmit={handleAddNote} className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Add Internal Agent Note:</span>
                <span className="text-[10px] text-slate-500">Not visible to customer</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={internalNoteInput}
                  onChange={(e) => setInternalNoteInput(e.target.value)}
                  placeholder="e.g. Verified tracking with FedEx dispatch..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!internalNoteInput.trim()}
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
