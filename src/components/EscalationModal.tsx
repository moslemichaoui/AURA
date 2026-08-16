import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { ChatMessage, SentimentType, PriorityType } from '../types';

interface EscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmEscalation: (reason: string) => void;
  customerName: string;
  lastMessage: ChatMessage | null;
  sentiment: SentimentType;
  priority: PriorityType;
}

export function EscalationModal({
  isOpen,
  onClose,
  onConfirmEscalation,
  customerName,
  lastMessage,
  sentiment,
  priority
}: EscalationModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirmEscalation(reason);
      setReason('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2f2a24]/40 backdrop-blur-[1px]">
      <div className="mx-auto max-w-md rounded-xl border border-[#d9c4a7] bg-[#f8f4ef] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e4d7c5] px-5 py-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-[#b85c3a]" />
            <h2 className="text-sm font-bold text-[#2b241f]">Escalate to Human Agent</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#dcc8a7] bg-[#f2e9dd] text-[#3d342d] transition-colors hover:bg-[#eadfc8]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <p className="text-xs font-semibold text-[#7b6853]">Customer</p>
            <p className="mt-1 text-sm font-medium text-[#2f2a24]">{customerName}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-[#f0e7da] p-2.5">
              <p className="text-[10px] font-semibold text-[#7b6853]">Sentiment</p>
              <p className="mt-1 text-xs font-bold text-[#3d342d]">{sentiment}</p>
            </div>
            <div className="rounded-lg bg-[#f5e4d4] p-2.5">
              <p className="text-[10px] font-semibold text-[#7b6853]">Priority</p>
              <p className="mt-1 text-xs font-bold text-[#3d342d]">{priority}</p>
            </div>
          </div>

          <div>
            <label htmlFor="escalation-reason" className="text-xs font-semibold text-[#7b6853]">
              Escalation Reason
            </label>
            <textarea
              id="escalation-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe why this needs human attention..."
              className="mt-2 h-24 w-full rounded-lg border border-[#d9c4a7] bg-white px-3 py-2 text-xs text-[#2f2a24] placeholder-[#b8a599] focus:border-[#9ab285] focus:outline-none focus:ring-2 focus:ring-[#9ab285]/20"
            />
          </div>

          {lastMessage && (
            <div className="rounded-lg border border-[#e4d7c5] bg-white p-3">
              <p className="text-[10px] font-semibold text-[#7b6853]">Last Message</p>
              <p className="mt-2 line-clamp-3 text-xs text-[#3d342d]">{lastMessage.text}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-[#e4d7c5] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-[#d9c4a7] bg-[#f2e9dd] px-4 py-2 text-xs font-semibold text-[#3d342d] transition-colors hover:bg-[#eadfc8]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!reason.trim()}
            className="flex-1 rounded-lg bg-gradient-to-r from-[#b85c3a] to-[#8b441e] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50"
          >
            Escalate
          </button>
        </div>
      </div>
    </div>
  );
}

