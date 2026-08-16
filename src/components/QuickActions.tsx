import { CheckCircle, Link2, FileText, Phone, AlertCircle, Eye, RotateCcw } from 'lucide-react';
import type { QuickActionType } from '../types';

interface QuickActionButtonProps {
  id: QuickActionType;
  label: string;
  onClick: () => void;
  requiresConfirmation?: boolean;
}

const quickActionConfig: Record<QuickActionType, { icon: typeof CheckCircle; color: string }> = {
  'approve_refund': { icon: CheckCircle, color: 'from-[#51683d] to-[#3d5629]' },
  'send_tracking': { icon: Link2, color: 'from-[#6d976d] to-[#4a6a4a]' },
  'download_invoice': { icon: FileText, color: 'from-[#8b7355] to-[#6b5344]' },
  'transfer_call': { icon: Phone, color: 'from-[#5a5a5a] to-[#3a3a3a]' },
  'escalate': { icon: AlertCircle, color: 'from-[#b85c3a] to-[#8b441e]' },
  'view_account': { icon: Eye, color: 'from-[#7b6853] to-[#5a4a38]' },
  'process_return': { icon: RotateCcw, color: 'from-[#9b6b4f] to-[#6b4a37]' }
};

export function QuickActionButton({ id, label, onClick, requiresConfirmation }: QuickActionButtonProps) {
  const config = quickActionConfig[id];
  const Icon = config.icon;

  const handleClick = () => {
    if (requiresConfirmation) {
      if (confirm(`Confirm action: ${label}?`)) {
        onClick();
      }
    } else {
      onClick();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r ${config.color} px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-95`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </button>
  );
}

interface QuickActionsRowProps {
  actions: Array<{
    id: QuickActionType;
    label: string;
    onClick: () => void;
    requiresConfirmation?: boolean;
  }>;
}

export function QuickActionsRow({ actions }: QuickActionsRowProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 border-t border-[#e4d7c5] pt-3">
      {actions.map((action, _idx) => (
        <QuickActionButton
          id={action.id}
          label={action.label}
          onClick={action.onClick}
          requiresConfirmation={action.requiresConfirmation ?? false}
        />
      ))}
    </div>
  );
}
