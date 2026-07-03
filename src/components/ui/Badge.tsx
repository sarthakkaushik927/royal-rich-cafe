import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/lib/types';

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  confirmed: { label: 'Confirmed', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  preparing: { label: 'Preparing', className: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  ready: { label: 'Ready', className: 'bg-green-500/15 text-green-400 border-green-500/30' },
  completed: { label: 'Completed', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  cancelled: { label: 'Cancelled', className: 'bg-red-500/15 text-red-400 border-red-500/30' },
};

interface BadgeProps {
  status: OrderStatus;
  className?: string;
}

export function StatusBadge({ status, className }: BadgeProps) {
  const config = statusConfig[status] ?? statusConfig.pending;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
