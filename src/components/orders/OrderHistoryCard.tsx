import Link from 'next/link';
import { Calendar, ChevronRight } from 'lucide-react';
import type { Order, OrderStatus } from '@/lib/types';
import { Clock, CheckCircle2, ChefHat, PackageCheck, CircleDot, XCircle } from 'lucide-react';

const statusConfig: Record<
  OrderStatus,
  { label: string; bg: string; text: string; icon: typeof Clock }
> = {
  pending: { label: 'Pending Approval', bg: 'bg-yellow-500/10', text: 'text-yellow-400', icon: Clock },
  confirmed: { label: 'Confirmed', bg: 'bg-blue-500/10', text: 'text-blue-400', icon: CheckCircle2 },
  preparing: { label: 'In the Kitchen', bg: 'bg-orange-500/10', text: 'text-orange-400', icon: ChefHat },
  ready: { label: 'Ready to Serve', bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: PackageCheck },
  completed: { label: 'Completed', bg: 'bg-gray-500/10', text: 'text-gray-400', icon: CircleDot },
  cancelled: { label: 'Cancelled', bg: 'bg-red-500/10', text: 'text-red-400', icon: XCircle },
};

interface OrderHistoryCardProps {
  order: Order;
}

export function OrderHistoryCard({ order }: OrderHistoryCardProps) {
  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-lg border border-[#D4A24C]/15 bg-gradient-to-b from-[#141210] to-[#0D0B09] hover:border-[#D4A24C]/30 transition-all duration-300 group">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-bold text-[#F7F3EC]">
            #{order.id.slice(0, 8).toUpperCase()}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.bg} ${status.text}`}
          >
            <StatusIcon size={12} />
            {status.label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#C7BFB2]">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {new Date(order.created_at).toLocaleDateString()}
          </span>
          <span>•</span>
          <span className="capitalize">{order.order_type.replace('_', ' ')}</span>
          {order.table_number && (
            <>
              <span>•</span>
              <span>Table {order.table_number}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-0 border-[#D4A24C]/10">
        <div className="text-left md:text-right">
          <span className="block text-[10px] uppercase tracking-wider text-[#C7BFB2]">Total Amount</span>
          <span className="font-serif text-lg text-[#D4A24C] font-semibold">₹{order.total_amount.toFixed(0)}</span>
        </div>

        <Link
          href={`/order/${order.tracking_token}`}
          className="inline-flex items-center gap-1.5 rounded-[4px] bg-[#D4A24C]/10 border border-[#D4A24C]/20 hover:bg-[#D4A24C] hover:text-[#1A1410] text-[#D4A24C] px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300"
        >
          Track
          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
