import React from 'react';
import { 
  MessageSquareText, 
  Cpu, 
  Inbox, 
  BookOpen, 
  BarChart3, 
  Search, 
  Sparkles,
  Clock
} from 'lucide-react';

export type ActiveTab = 'chat' | 'ops' | 'tickets' | 'kb' | 'analytics';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenOrderLookup: () => void;
  onOpenPersonaSelector: () => void;
  unreadCount?: number;
  companyName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenOrderLookup,
  onOpenPersonaSelector,
  unreadCount = 3,
  companyName,
}) => {
  // Check if current GMT+1 time is within business hours (Mon-Fri 8am-6pm)
  const isBusinessHours = (() => {
    const now = new Date();
    const utcHours = now.getUTCHours();
    const gmt1Hours = (utcHours + 1) % 24;
    const day = now.getUTCDay();
    return day >= 1 && day <= 5 && gmt1Hours >= 8 && gmt1Hours < 18;
  })();

  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'chat', label: 'Live Chat', icon: MessageSquareText },
    { id: 'ops', label: 'Dual Inspector', icon: Cpu },
    { id: 'tickets', label: 'Tickets Queue', icon: Inbox },
    { id: 'kb', label: 'Knowledge Base', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#d6c7ae]/80 bg-[#f4efe7]/90 backdrop-blur-md shadow-[0_1px_0_rgba(98,84,66,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Title (Single line, single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#6d976d] to-[#51683d] flex items-center justify-center shadow-md shadow-[#d9d1c3] border border-[#8aa278]/40">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-[#2b241f] whitespace-nowrap">
            AURA <span className="text-[#51683d] font-light">| AI SUPPORT</span>
          </span>
          <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#f2e9dd] border border-[#d7c4a3] text-[11px] text-[#5d4f40] font-mono">
            <span className={`w-1.5 h-1.5 rounded-full ${isBusinessHours ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            {isBusinessHours ? 'GMT+1 LIVE' : 'AFTER HOURS'}
          </span>
        </div>

        {/* Zone 2: Navigation Links (4-6 links, single-line, 1-2 words) */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#e7efdd] text-[#405a35] border border-[#9ab285] shadow-sm'
                    : 'text-[#6d5b4b] hover:text-[#2f2a24] hover:bg-[#f0ece5] border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#51683d]' : 'text-[#7b6853]'}`} />
                <span>{item.label}</span>
                {item.id === 'tickets' && unreadCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#e7efdd] text-[#405a35] text-[10px] font-mono border border-[#9ab285]">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions (1-2 single-line buttons) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenPersonaSelector}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f2e9dd] hover:bg-[#e9ddca] text-[#3d342d] border border-[#d9c4a7] text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#51683d]" />
            <span className="hidden sm:inline">Simulate Scenarios</span>
            <span className="sm:hidden">Personas</span>
          </button>

          <button
            onClick={onOpenOrderLookup}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#51683d] hover:bg-[#425532] text-white border border-[#6d976d]/40 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shadow-sm shadow-[#c7d4b9]"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Order Lookup</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Strip for small screens */}
      <div className="lg:hidden flex items-center justify-around px-2 py-2 border-t border-slate-800/60 bg-slate-950 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#e7efdd] text-[#405a35] border border-[#9ab285]'
                  : 'text-[#6d5b4b] hover:text-[#2f2a24]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
