"use client";
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Clock, Loader2, CheckCircle2, Flame } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import { orderService } from '@/services/orderService';
import { useKitchenOrders } from '@/hooks/useOrderData';
import { Navbar } from '@/components/layout/Navbar';
import { OrderDetailsModal } from '@/components/modals/OrderDetailsModal';
import type { Order, OrderStatus } from '@/lib/types';

const statusFlow: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];

type FilterTab = 'all' | 'pending' | 'cooking' | 'ready';

const filterConfig: { label: string; value: FilterTab }[] = [
  { label: 'ALL', value: 'all' },
  { label: 'PENDING', value: 'pending' },
  { label: 'COOKING', value: 'cooking' },
  { label: 'READY', value: 'ready' },
];

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function KitchenOrderCard({ order }: { order: Order }) {
  const [updating, setUpdating] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const nextStatus = useMemo(() => {
    const idx = statusFlow.indexOf(order.status);
    if (idx >= 0 && idx < statusFlow.length - 1) return statusFlow[idx + 1];
    return null;
  }, [order.status]);

  const handleAdvance = async () => {
    if (!nextStatus) return;
    setUpdating(true);
    try {
      await orderService.updateStatus(order.id, nextStatus);
      toast.success(`Order marked as ${nextStatus}`);
    } catch {
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const timeAgo = Math.floor(
    (new Date().getTime() - new Date(order.created_at).getTime()) / 60000
  );
  const isUrgent = timeAgo > 15 && order.status === 'pending';

  // Label for the advance button
  const actionLabel: Record<string, string> = {
    confirmed: 'COOK',
    preparing: 'READY',
    ready: 'COMPLETE',
    pending: 'CONFIRM',
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        className={`rounded-lg border bg-[#111111] p-5 ${
          isUrgent ? 'border-red-500/40' : 'border-[#2a2520]'
        }`}
      >
        {/* Card Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[#D4A24C] text-sm font-semibold">
              {order.table_number ? (order.table_number.toLowerCase().includes('table') ? order.table_number : `Table ${order.table_number}`) : 'Table Online'}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <button 
                onClick={() => setIsDetailsOpen(true)}
                className="text-[#555] text-[11px] font-mono hover:text-[#D4A24C] underline underline-offset-2 decoration-[#555] hover:decoration-[#D4A24C] transition-colors cursor-pointer"
              >
                #{order.id.slice(0, 8).toUpperCase()}
              </button>
              <span className="text-[#555] text-[11px] font-mono">
                | {order.order_type.replace('_', '-').toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[#555] text-xs">
            <Clock size={12} />
            <span className={isUrgent ? 'text-red-400 font-medium' : ''}>
              {formatTime(order.created_at)} PM
            </span>
          </div>
        </div>

        {/* Items */}
        <div 
          className="space-y-3 mb-5 cursor-pointer group"
          onClick={() => setIsDetailsOpen(true)}
        >
          {order.items?.slice(0, 2).map((item) => {
            const foodItem = item.food_item as { name?: string; description?: string } | undefined;
            return (
              <div key={item.id} className="group-hover:opacity-80 transition-opacity">
                <p className="text-[#F7F3EC] text-sm font-semibold">
                  {item.quantity}x {foodItem?.name ?? 'Item'}
                </p>
                {foodItem?.description && (
                  <p className="text-[#555] text-[11px] mt-0.5 leading-relaxed line-clamp-2">
                    Ingredients: {foodItem.description}
                  </p>
                )}
              </div>
            );
          })}
          {order.items && order.items.length > 2 && (
            <p className="text-[#D4A24C] text-[11px] font-medium pt-1">
              + {order.items.length - 2} more items...
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#1e1e1e]">
          <div>
            <p className="text-[#555] text-[10px] uppercase tracking-widest font-bold">
              Current State:
            </p>
            <p
              className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${
                order.status === 'pending'
                  ? 'text-yellow-400'
                  : order.status === 'preparing' || order.status === 'confirmed'
                  ? 'text-orange-400'
                  : order.status === 'ready'
                  ? 'text-emerald-400'
                  : 'text-[#555]'
              }`}
            >
              {order.status}
            </p>
          </div>

          {nextStatus && (
            <button
              onClick={handleAdvance}
              disabled={updating}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded transition-colors"
            >
              {updating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  <Flame size={14} />
                  {actionLabel[order.status] ?? nextStatus.toUpperCase()}
                </>
              )}
            </button>
          )}

          {!nextStatus && (
            <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 size={14} />
              Done
            </span>
          )}
        </div>
      </motion.div>

      <OrderDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        trackingToken={order.tracking_token}
      />
    </>
  );
}

export default function Page() {
  const router = useRouter();
  const { data: orders = [], isLoading } = useKitchenOrders();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
      try {
        const session = await authService.getSession();
        if (!session) {
          if (mounted) router.replace('/chef/login');
          return;
        }
        const profile = await authService.getProfile(session.userId);
        if (profile.role !== 'chef' && profile.role !== 'admin') {
          if (mounted) router.replace('/chef/login');
          return;
        }
        if (mounted) setIsAuthorized(true);
      } catch {
        if (mounted) router.replace('/');
      }
    };
    checkAuth();
    return () => { mounted = false; };
  }, [router]);

  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return orders;
    if (activeTab === 'pending') return orders.filter((o) => o.status === 'pending' || o.status === 'confirmed');
    if (activeTab === 'cooking') return orders.filter((o) => o.status === 'preparing');
    if (activeTab === 'ready') return orders.filter((o) => o.status === 'ready');
    return orders;
  }, [orders, activeTab]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0D0B09] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#D4A24C] w-8 h-8" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0D0B09]">
      <Navbar />

      {/* Page Header */}
      <section className="pt-28 pb-6 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#D4A24C] text-[#0D0B09] rounded-lg shrink-0">
              <ChefHat size={24} />
            </div>
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#F7F3EC]">
                Kitchen Display System{' '}
                <span className="text-[#D4A24C]">(KDS)</span>
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-[#C7BFB2] font-semibold mt-0.5">
                Real-time Chef Operations &amp; Queue Manager
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#111] border border-[#2a2520] rounded-lg p-1">
            {filterConfig.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded transition-all ${
                  activeTab === tab.value
                    ? 'bg-[#D4A24C] text-[#0D0B09]'
                    : 'text-[#C7BFB2] hover:text-[#F7F3EC]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Order List */}
      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={32} className="animate-spin text-[#D4A24C]" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <ChefHat size={48} className="text-[#D4A24C]/30 mb-4" />
              <p className="text-[#C7BFB2] text-sm">No orders in this queue</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredOrders.map((order) => (
                  <KitchenOrderCard key={order.id} order={order} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
