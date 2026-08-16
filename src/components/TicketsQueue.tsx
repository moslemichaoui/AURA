import React, { useState } from 'react';
import { 
  Inbox, 
  Search, 
  Filter, 
  User, 
  Clock, 
  MessageSquare, 
  CheckCircle, 
  AlertTriangle, 
  Tag, 
  Send, 
  Download, 
  DollarSign, 
  Eye, 
  Flame, 
  Star,
  ChevronRight,
  X,
  FileText
} from 'lucide-react';
import { TicketRecord, PriorityType, SentimentType, CategoryType, OrderRecord } from '../types';
import { RichMarkdown } from '../lib/markdown';

interface TicketsQueueProps {
  tickets: TicketRecord[];
  onSelectTicket: (ticket: TicketRecord) => void;
  onResolveTicket: (ticketId: string) => void;
  onEscalateTicket: (ticketId: string) => void;
  onSendHumanReply: (ticketId: string, text: string) => void;
  onRefundTicket: (ticketId: string, orderId?: string) => void;
  onOrderClick: (orderId: string) => void;
  orders: OrderRecord[];
}

export const TicketsQueue: React.FC<TicketsQueueProps> = ({
  tickets,
  onSelectTicket,
  onResolveTicket,
  onEscalateTicket,
  onSendHumanReply,
  onRefundTicket,
  onOrderClick,
  orders
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [activeTicketId, setActiveTicketId] = useState<string | null>(tickets[0]?.id || null);
  const [humanReplyText, setHumanReplyText] = useState('');

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.orderId && t.orderId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesPri = selectedPriority === 'All' || t.priority === selectedPriority;
    const matchesSent = selectedSentiment === 'All' || t.sentiment === selectedSentiment;
    const matchesStat = selectedStatus === 'All' || t.status === selectedStatus;

    return matchesSearch && matchesCat && matchesPri && matchesSent && matchesStat;
  });

  const activeTicket = tickets.find(t => t.id === activeTicketId) || filteredTickets[0] || null;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!humanReplyText.trim() || !activeTicket) return;
    onSendHumanReply(activeTicket.id, humanReplyText.trim());
    setHumanReplyText('');
  };

  const getPriorityBadge = (priority: PriorityType) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50';
      case 'high':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'medium':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/50';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/50';
    }
  };

  const getSentimentBadge = (sentiment: SentimentType) => {
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

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'escalated':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'refund requested':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      default:
        return 'bg-indigo-950 text-indigo-300 border-indigo-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer, email, order # (e.g. #AUR-8921), subject..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2.5 py-2 text-xs outline-none focus:border-indigo-500"
            >
              <option value="All">All Categories</option>
              <option value="Shipping">Shipping</option>
              <option value="Billing">Billing</option>
              <option value="Technical">Technical</option>
              <option value="Account">Account</option>
              <option value="General">General</option>
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2.5 py-2 text-xs outline-none focus:border-indigo-500"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Sentiment Filter */}
            <select
              value={selectedSentiment}
              onChange={(e) => setSelectedSentiment(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2.5 py-2 text-xs outline-none focus:border-indigo-500"
            >
              <option value="All">All Sentiments</option>
              <option value="Frustrated">Frustrated</option>
              <option value="Negative">Negative</option>
              <option value="Neutral">Neutral</option>
              <option value="Positive">Positive</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2.5 py-2 text-xs outline-none focus:border-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Escalated">Escalated</option>
              <option value="Resolved">Resolved</option>
              <option value="Refund Requested">Refund Requested</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Split CRM: Tickets List on Left, Active Ticket Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tickets List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold">
            <span>{filteredTickets.length} ACTIVE INQUIRIES</span>
            <span>SORTED BY RECENCY</span>
          </div>

          <div className="space-y-2.5 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 text-xs">
                No tickets match your filters.
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = activeTicket?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setActiveTicketId(t.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-indigo-500/80 ring-1 ring-indigo-500/40 shadow-lg'
                        : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={t.customerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
                          alt={t.customerName}
                          className="w-7 h-7 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-100">{t.customerName}</h4>
                          <span className="text-[10px] text-slate-400">{t.customerEmail}</span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(t.status)}`}>
                        {t.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-medium line-clamp-1 mb-2">
                      {t.subject}
                    </p>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${getPriorityBadge(t.priority)}`}>
                          {t.priority}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${getSentimentBadge(t.sentiment)}`}>
                          {t.sentiment}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                          {t.category}
                        </span>
                      </div>

                      <span className="text-[10px] text-slate-500 font-mono">
                        {t.updatedAt.slice(-5)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Full Ticket Inspector & Human Override */}
        <div className="lg:col-span-7">
          {activeTicket ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-5">
              {/* Ticket Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-indigo-400 font-bold">
                      #{activeTicket.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(activeTicket.status)}`}>
                      {activeTicket.status}
                    </span>
                    {activeTicket.csatScore && (
                      <span className="flex items-center gap-1 text-xs text-amber-400 font-semibold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {activeTicket.csatScore}/5 CSAT
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-bold text-white mt-1">
                    {activeTicket.subject}
                  </h2>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {activeTicket.status !== 'Resolved' && (
                    <button
                      onClick={() => onResolveTicket(activeTicket.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Mark Resolved
                    </button>
                  )}

                  {activeTicket.status !== 'Escalated' && (
                    <button
                      onClick={() => onEscalateTicket(activeTicket.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Escalate to Tier 2
                    </button>
                  )}

                  {activeTicket.orderId && (
                    <button
                      onClick={() => onOrderClick(activeTicket.orderId!)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Order #{activeTicket.orderId}
                    </button>
                  )}
                </div>
              </div>

              {/* Customer Profile Banner */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={activeTicket.customerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
                    alt={activeTicket.customerName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-white">{activeTicket.customerName}</h3>
                    <p className="text-[11px] text-slate-400">{activeTicket.customerEmail}</p>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Assigned Handler</span>
                  <span className="font-semibold text-slate-200">{activeTicket.assignedAgent || 'Aura AI Specialist'}</span>
                </div>
              </div>

              {/* Conversation Log */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {activeTicket.messages.map((m) => {
                  const isUser = m.sender === 'customer';
                  return (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-xl text-xs ${
                        isUser
                          ? 'bg-slate-950 border border-slate-800 text-slate-200'
                          : m.sender === 'human_agent'
                          ? 'bg-amber-950/30 border border-amber-700/50 text-slate-100'
                          : 'bg-indigo-950/20 border border-indigo-800/40 text-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-indigo-300">
                          {isUser ? activeTicket.customerName : m.sender === 'human_agent' ? 'Human Agent' : 'Aura (Senior AI)'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{m.timestamp}</span>
                      </div>
                      <RichMarkdown content={m.text} onOrderClick={onOrderClick} />
                    </div>
                  );
                })}
              </div>

              {/* Internal Notes History */}
              {activeTicket.internalNotes && activeTicket.internalNotes.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800">
                  <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block mb-1.5">
                    Internal Staff Notes:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300 pl-3 list-disc">
                    {activeTicket.internalNotes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Human Override Reply Composer */}
              <form onSubmit={handleSendReply} className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                  <span>Send Human Specialist Override Reply:</span>
                  <span className="text-[10px] text-amber-400">Transfers thread to Human Agent</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={humanReplyText}
                    onChange={(e) => setHumanReplyText(e.target.value)}
                    placeholder="Type a verified response to send directly to customer..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!humanReplyText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 text-xs">
              Select an active inquiry from the queue to view full transcript and triage.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
