"use client";
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, UtensilsCrossed, Package, MapPin, User, Phone, Calendar } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import type { OrderStatus } from '@/lib/types';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackingToken: string | undefined;
}

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready to Serve' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const sizeLabels = { small: 'S', medium: 'M', large: 'L' } as const;

export function OrderDetailsModal({ isOpen, onClose, trackingToken }: OrderDetailsModalProps) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<OrderStatus | ''>('');

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', 'token', trackingToken],
    queryFn: () => orderService.getByTrackingToken(trackingToken!),
    enabled: !!trackingToken && isOpen,
  });

  useEffect(() => {
    if (order) {
      setStatus(order.status);
    }
  }, [order]);

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: OrderStatus) => {
      if (!order) return;
      return orderService.updateStatus(order.id, newStatus);
    },
    onSuccess: (_, newStatus) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', 'token', trackingToken] });
      toast.success(`Order status updated to ${newStatus}`);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update order status');
      if (order) setStatus(order.status);
    },
  });

  const handleStatusChange = (newStatus: OrderStatus) => {
    setStatus(newStatus);
    updateStatusMutation.mutate(newStatus);
  };

  const orderTypeConfig = {
    dine_in: { label: 'Dine In', icon: UtensilsCrossed },
    takeaway: { label: 'Takeaway', icon: Package },
    delivery: { label: 'Delivery', icon: MapPin },
  };

  const orderType = order ? orderTypeConfig[order.order_type] : null;
  const TypeIcon = orderType?.icon;

  return (
    <Modal open={isOpen} onClose={onClose} title={order ? `Order #${order.id.slice(0, 8)}` : 'Order Details'}>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="animate-spin text-[#D4A24C] mb-3" size={32} />
          <span className="text-sm text-[#C7BFB2]">Loading order details...</span>
        </div>
      ) : error || !order ? (
        <div className="text-center py-8 text-red-400">
          Failed to load order details.
        </div>
      ) : (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          {/* Status & Type */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D4A24C]/15 pb-4">
            <div className="flex items-center gap-2">
              {TypeIcon && <TypeIcon size={18} className="text-[#D4A24C]" />}
              <span className="text-sm text-[#F7F3EC] font-medium">
                {orderType?.label} {order.table_number ? `(Table ${order.table_number})` : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#C7BFB2] uppercase tracking-wider">Status:</span>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                disabled={updateStatusMutation.isPending}
                className="h-9 rounded-lg border border-[#D4A24C]/15 bg-[#141210] px-2 text-xs text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40 cursor-pointer disabled:opacity-50"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Customer & Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-white/5 p-4 rounded-lg border border-[#D4A24C]/10">
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-widest text-[#D4A24C] font-semibold">Customer Details</h4>
              <div className="flex items-center gap-2 text-[#F7F3EC]">
                <User size={14} className="text-[#C7BFB2]" />
                <span>{order.guest_name || 'Guest'}</span>
              </div>
              {order.guest_phone && (
                <div className="flex items-center gap-2 text-[#C7BFB2]">
                  <Phone size={14} />
                  <span>{order.guest_phone}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-widest text-[#D4A24C] font-semibold">Order Details</h4>
              <div className="flex items-center gap-2 text-[#C7BFB2]">
                <Calendar size={14} />
                <span>{new Date(order.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          {order.order_type === 'delivery' && order.delivery_address && (
            <div className="space-y-2 text-sm bg-white/5 p-4 rounded-lg border border-[#D4A24C]/10">
              <h4 className="text-xs uppercase tracking-widest text-[#D4A24C] font-semibold">Delivery Address</h4>
              <div className="flex items-start gap-2 text-[#C7BFB2]">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                <p className="leading-relaxed">{order.delivery_address}</p>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#D4A24C] font-semibold border-b border-[#D4A24C]/10 pb-1">
              Items Ordered
            </h4>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#D4A24C]/10 text-xs font-medium text-[#D4A24C] border border-[#D4A24C]/10">
                      {item.quantity}x
                    </span>
                    <div>
                      <p className="font-medium text-[#F7F3EC]">
                        {(item.food_item as { name?: string } | undefined)?.name ?? 'Item'}
                      </p>
                      <p className="text-xs text-[#C7BFB2] capitalize">
                        Size: {sizeLabels[item.size]}
                      </p>
                    </div>
                  </div>
                  <span className="text-[#F7F3EC] font-medium">
                    ₹{(item.unit_price * item.quantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Total */}
          <div className="border-t border-[#D4A24C]/15 pt-4 flex justify-between items-center">
            <span className="text-sm font-medium text-[#C7BFB2]">Total Amount</span>
            <span className="font-serif text-xl text-[#D4A24C] font-bold">
              ₹{order.total_amount.toFixed(0)}
            </span>
          </div>
        </div>
      )}
    </Modal>
  );
}
