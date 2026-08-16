import { TrendingUp, Clock, RotateCcw, Award } from 'lucide-react';
import type { CRMCustomerProfile } from '../types';

interface CustomerInfoPanelProps {
  customer: CRMCustomerProfile | null;
}

export function CustomerInfoPanel({ customer }: CustomerInfoPanelProps) {
  if (!customer) {
    return (
      <div className="rounded-xl border border-[#e4d7c5] bg-[#f8f4ef] p-4">
        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7b6853]">Customer Profile</div>
        <div className="mt-3 text-sm text-[#7b6853]">No customer data loaded</div>
      </div>
    );
  }

  const loyaltyColors: Record<string, string> = {
    'Bronze': 'bg-[#cd7f32]/10 text-[#8b5a2b]',
    'Silver': 'bg-[#c0c0c0]/10 text-[#6b7280]',
    'Gold': 'bg-[#ffd700]/10 text-[#b8860b]',
    'Platinum': 'bg-[#e5e4e2]/10 text-[#71797e]'
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[#e4d7c5] bg-[#f8f4ef] p-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7b6853]">Customer Profile</p>
            <h3 className="mt-1 text-sm font-bold text-[#2f2a24]">{customer.name}</h3>
            <p className="text-[10px] text-[#7b6853]">{customer.email}</p>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${loyaltyColors[customer.loyaltyTier]}`}>
            {customer.loyaltyTier}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-[#e4d7c5] pt-3">
          <div>
            <div className="text-[10px] font-semibold text-[#7b6853]">Lifetime Value</div>
            <div className="mt-1 text-sm font-bold text-[#2f2a24]">${customer.lifetimeValue.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold text-[#7b6853]">Total Orders</div>
            <div className="mt-1 text-sm font-bold text-[#2f2a24]">{customer.totalOrders}</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold text-[#7b6853]">Avg. Order Value</div>
            <div className="mt-1 text-sm font-bold text-[#2f2a24]">${customer.averageOrderValue.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold text-[#7b6853]">Return Rate</div>
            <div className="mt-1 text-sm font-bold text-[#2f2a24]">{customer.returnRate}%</div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#e4d7c5] bg-[#f8f4ef] p-3">
        <div className="space-y-2 text-[10px] text-[#3d342d]">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-[#7b6853]" />
              Customer Since
            </span>
            <span className="font-semibold">{new Date(customer.joinDate).toLocaleDateString()}</span>
          </div>
          {customer.lastPurchaseDate && (
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3 text-[#7b6853]" />
                Last Purchase
              </span>
              <span className="font-semibold">{new Date(customer.lastPurchaseDate).toLocaleDateString()}</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <RotateCcw className="h-3 w-3 text-[#7b6853]" />
              Preferred Channel
            </span>
            <span className="font-semibold">{customer.preferredChannel}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <Award className="h-3 w-3 text-[#7b6853]" />
              Language
            </span>
            <span className="font-semibold uppercase">{customer.preferredLanguage}</span>
          </div>
        </div>
      </div>

      {customer.notes && (
        <div className="rounded-xl border border-[#e4d7c5] bg-[#f8f4ef] p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7b6853]">Internal Notes</div>
          <p className="mt-2 text-xs text-[#3d342d] leading-relaxed">{customer.notes}</p>
        </div>
      )}
    </div>
  );
}
