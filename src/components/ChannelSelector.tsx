import { MessageCircle, MessageSquare, Phone, Mail, Send } from 'lucide-react';
import type { ChannelType } from '../types';

interface ChannelSelectorProps {
  currentChannel: ChannelType;
  onChannelChange: (channel: ChannelType) => void;
}

const channelConfig: Record<ChannelType, { icon: typeof MessageCircle; label: string; color: string }> = {
  'Live Chat': {
    icon: MessageCircle,
    label: 'Live Chat',
    color: 'from-[#51683d] to-[#3d5629]'
  },
  'Call Center Transcript': {
    icon: MessageSquare,
    label: 'Call Center Transcript',
    color: 'from-[#8b7355] to-[#6b5344]'
  },
  'Web Chat': {
    icon: MessageCircle,
    label: 'Web Chat',
    color: 'from-[#51683d] to-[#3d5629]'
  },
  'WhatsApp': {
    icon: Send,
    label: 'WhatsApp Business',
    color: 'from-[#25d366] to-[#1da851]'
  },
  'SMS': {
    icon: MessageSquare,
    label: 'SMS Text Support',
    color: 'from-[#6d976d] to-[#4a6a4a]'
  },
  'Email': {
    icon: Mail,
    label: 'Email Support',
    color: 'from-[#8b7355] to-[#6b5344]'
  },
  'Phone': {
    icon: Phone,
    label: 'Phone Support',
    color: 'from-[#5a5a5a] to-[#3a3a3a]'
  }
};

export function ChannelSelector({ currentChannel, onChannelChange }: ChannelSelectorProps) {
  const config = channelConfig[currentChannel];
  const CurrentIcon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-2 rounded-lg bg-gradient-to-r ${config.color} px-3 py-2 shadow-sm`}>
        <CurrentIcon className="h-4 w-4 text-white" />
        <span className="text-xs font-semibold text-white">{config.label}</span>
      </div>

      <div className="relative group">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#dcc8a7] bg-[#f2e9dd] text-[#3d342d] transition-colors hover:bg-[#eadfc8]"
          aria-label="Switch communication channel"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div className="absolute right-0 top-full z-50 mt-1 hidden min-w-[180px] gap-1 rounded-lg border border-[#d9c4a7] bg-[#f8f4ef] p-2 shadow-lg group-hover:flex flex-col">
          {(Object.keys(channelConfig) as ChannelType[]).map((channel) => {
            const chConfig = channelConfig[channel];
            const ChIcon = chConfig.icon;
            const isActive = channel === currentChannel;

            return (
              <button
                key={channel}
                type="button"
                onClick={() => onChannelChange(channel)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#e7efdd] text-[#405a35]'
                    : 'bg-transparent text-[#3d342d] hover:bg-[#f0e7da]'
                }`}
              >
                <ChIcon className="h-4 w-4" />
                <span>{chConfig.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
