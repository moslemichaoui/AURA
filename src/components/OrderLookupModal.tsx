import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  RotateCcw, 
  ExternalLink,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { OrderRecord } from '../types';

interface OrderLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderRecord[];
  onOrderSelectInChat: (order: OrderRecord) => void;
  onIssueRefund: (orderId: string) => void;
}

export const OrderLookupModal: React.FC<OrderLookupModalProps> = ({
  isOpen,
  onClose,
  orders,
  onOrderSelectInChat,
  onIssueRefund
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.orderId || '');

  if (!isOpen) return null;

  const filteredOrders = orders.filter(o =>
    o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOrder = orders.find(o => o.orderId === selectedOrderId) || filteredOrders[0] || orders[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'In Transit':
      case 'Out for Delivery':
        return 'bg-sky-950 text-sky-300 border-sky-800';
      case 'Processing':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'Refunded':
        return 'bg-purple-950 text-purple-300 border-purple-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/40">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Verified Order & Logistics Explorer
              </h2>
              <p className="text-xs text-slate-400">
                Ground-truth database accessed by Aura for ownership verification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Order ID (e.g. #AUR-8921), customer name, email, tracking #..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Split Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Order List (Left 5 cols) */}
          <div className="md:col-span-5 border-r border-slate-800 overflow-y-auto p-3 space-y-2 max-h-[50vh] md:max-h-full">
            {filteredOrders.length === 0 ? (
              <p className="text-xs text-slate-500 p-4 text-center">No orders found.</p>
            ) : (
              filteredOrders.map((order) => {
                const isSelected = selectedOrder?.orderId === order.orderId;
                return (
                  <div
                    key={order.orderId}
                    onClick={() => setSelectedOrderId(order.orderId)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-850 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-950/60 hover:bg-slate-900 border-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-xs text-indigo-400">
                        #{order.orderId}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-200">{order.customerName}</h4>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span>{order.carrier}</span>
                      <span className="font-mono font-medium">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Selected Order Details (Right 7 cols) */}
          {selectedOrder && (
            <div className="md:col-span-7 p-5 overflow-y-auto space-y-4 max-h-[50vh] md:max-h-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-indigo-400">
                      Order #{selectedOrder.orderId}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Placed on {selectedOrder.datePlaced}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onOrderSelectInChat(selectedOrder);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Inquire with Aura</span>
                  </button>
                </div>
              </div>

              {/* Customer & Shipping Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Customer:</span>
                  <p className="font-semibold text-slate-200 mt-0.5">{selectedOrder.customerName}</p>
                  <p className="text-slate-400 text-[11px]">{selectedOrder.customerEmail}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Tracking & Delivery:</span>
                  <p className="font-mono font-semibold text-indigo-300 mt-0.5">{selectedOrder.carrier} ({selectedOrder.trackingNumber})</p>
                  <p className="text-slate-400 text-[11px]">{selectedOrder.estimatedDelivery}</p>
                </div>
              </div>

              {/* Destination Address */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Shipping Address:</span>
                <p className="text-slate-200 mt-0.5">{selectedOrder.shippingAddress}</p>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Items Ordered ({selectedOrder.items.length}):
                </span>
                <div className="space-y-1.5">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-500 text-[11px]">{item.qty}x</span>
                        <span className="font-medium text-slate-200">{item.name}</span>
                      </div>
                      <span className="font-mono font-semibold text-slate-300">
                        ${(item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Refund Action */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Total Order Value:</span>
                  <span className="font-mono font-bold text-white text-sm ml-2">
                    ${selectedOrder.total.toFixed(2)}
                  </span>
                </div>

                {selectedOrder.status !== 'Refunded' ? (
                  <button
                    onClick={() => onIssueRefund(selectedOrder.orderId)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Issue Verified Refund</span>
                  </button>
                ) : (
                  <span className="text-xs text-purple-400 font-semibold">
                    ✓ Refunded ${selectedOrder.total.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
