import { AlertTriangle, AlertCircle, SmilePlus, Meh } from 'lucide-react';
import type { SentimentType, PriorityType } from '../types';

interface SentimentMeterProps {
  sentiment: SentimentType;
  priority: PriorityType;
  confidenceScore?: number;
}

const sentimentConfig: Record<SentimentType, { icon: typeof AlertTriangle; label: string; color: string; bg: string }> = {
  'Positive': {
    icon: SmilePlus,
    label: 'Satisfied',
    color: 'text-[#405a35]',
    bg: 'bg-[#edf3e4]'
  },
  'Neutral': {
    icon: Meh,
    label: 'Neutral',
    color: 'text-[#7b6853]',
    bg: 'bg-[#f0e7da]'
  },
  'Negative': {
    icon: AlertCircle,
    label: 'Unhappy',
    color: 'text-[#9b6b4f]',
    bg: 'bg-[#f5e4d4]'
  },
  'Frustrated': {
    icon: AlertTriangle,
    label: 'Frustrated',
    color: 'text-[#b85c3a]',
    bg: 'bg-[#f9e6da]'
  }
};

const priorityConfig: Record<PriorityType, { label: string; color: string; bg: string }> = {
  'Low': { label: 'Low', color: 'text-[#405a35]', bg: 'bg-[#edf3e4]' },
  'Medium': { label: 'Medium', color: 'text-[#7b6853]', bg: 'bg-[#f0e7da]' },
  'High': { label: 'High', color: 'text-[#9b6b4f]', bg: 'bg-[#f5e4d4]' },
  'Urgent': { label: 'Urgent', color: 'text-[#b85c3a]', bg: 'bg-[#f9e6da]' }
};

export function SentimentMeter({ sentiment, priority, confidenceScore }: SentimentMeterProps) {
  const sentConfig = sentimentConfig[sentiment];
  const SentIcon = sentConfig.icon;
  const prioConfig = priorityConfig[priority];

  return (
    <div className="space-y-2">
      <div className="rounded-xl border border-[#e4d7c5] bg-[#f8f4ef] p-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7b6853]">Sentiment & Urgency</div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className={`flex items-center gap-2 rounded-lg ${sentConfig.bg} px-2.5 py-2`}>
            <SentIcon className={`h-4 w-4 ${sentConfig.color}`} />
            <div>
              <div className="text-[10px] font-semibold text-[#7b6853]">Customer Mood</div>
              <div className={`text-xs font-bold ${sentConfig.color}`}>{sentConfig.label}</div>
            </div>
          </div>

          <div className={`flex items-center gap-2 rounded-lg ${prioConfig.bg} px-2.5 py-2`}>
            <AlertCircle className={`h-4 w-4 ${prioConfig.color}`} />
            <div>
              <div className="text-[10px] font-semibold text-[#7b6853]">Urgency</div>
              <div className={`text-xs font-bold ${prioConfig.color}`}>{prioConfig.label}</div>
            </div>
          </div>
        </div>

        {confidenceScore !== undefined && (
          <div className="mt-3 border-t border-[#e4d7c5] pt-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#7b6853]">AI Confidence</span>
              <span className="text-[10px] font-bold text-[#2f2a24]">{Math.round(confidenceScore * 100)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#e4d7c5]">
              <div
                className="h-full bg-gradient-to-r from-[#6d976d] to-[#51683d]"
                style={{ width: `${confidenceScore * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-[#e4d7c5] bg-[#f8f4ef] p-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7b6853]">Agent Mode</span>
          <span className="rounded-full bg-[#edf3e4] px-2 py-1 text-[10px] font-semibold text-[#405a35]">
            {sentiment === 'Frustrated' || priority === 'Urgent' ? 'Escalation Ready' : 'Standard'}
          </span>
        </div>
        <div className="mt-2 text-[10px] leading-relaxed text-[#3d342d]">
          {sentiment === 'Frustrated' || priority === 'Urgent'
            ? '⚠️ This customer needs immediate attention or escalation to a human agent.'
            : '✓ Customer mood is stable. AI-assisted resolution is appropriate.'}
        </div>
      </div>
    </div>
  );
}
