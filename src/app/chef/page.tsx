"use client";
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Clock, LogOut, Loader2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/ui/Badge';
import { authService } from '@/services/authService';
import { orderService } from '@/services/orderService';
import { useKitchenOrders } from '@/hooks/useOrderData';
import { ChefMobileBottomNav } from '@/components/layout/ChefMobileBottomNav';
import type { Order, OrderStatus } from '@/lib/types';

const statusFlow: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];

function KitchenOrderCard({ order }: { order: Order }) {
  const [updating, setUpdating] = useState(false);

  const nextStatus = useMemo(() => {
    const idx = statusFlow.indexOf(order.status);
    if (idx >= 0 && idx < statusFlow.length - 1) {
      return statusFlow[idx + 1];
    }
    return null;
  }, [order.status]);

  const handleAdvance = async () => {
    if (!nextStatus) return;
    setUpdating(true);
    try {
      await orderService.updateStatus(order.id, nextStatus);
      toast.success(`Order #${order.id.slice(0, 5)} marked as ${nextStatus}`);
    } catch (err) {
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const timeAgo = Math.floor((new Date().getTime() - new Date(order.created_at).getTime()) / 60000);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`rounded-lg border bg-linear-to-b from-[#141210] to-[#0D0B09] p-5 shadow-xl ${
        timeAgo > 15 && order.status === 'pending'
          ? 'border-red-500/30'
          : 'border-[#D4A24C]/20'
      }`}
    >
      <div className="flex items-start justify-between mb-4 border-b border-[#D4A24C]/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm text-[#F7F3EC]">#{order.id.slice(0, 5)}</span>
            <span className="rounded bg-[#D4A24C]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#D4A24C]">
              {order.order_type.replace('_', ' ')}
            </span>
            {order.table_number && (
              <span className="rounded bg-[#0D0B09] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#C7BFB2] border border-[#D4A24C]/20">
                T {order.table_number}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-[#C7BFB2]">
            <Clock size={12} />
            <span className={timeAgo > 15 && order.status === 'pending' ? 'text-red-400 font-medium' : ''}>
              {timeAgo === 0 ? 'Just now' : `${timeAgo} min ago`}
            </span>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="space-y-3 mb-5 min-h-[100px]">
        {order.items?.map((item) => (
          <div key={item.id} className="flex justify-between items-start">
            <div className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#D4A24C]/15 text-sm font-medium text-[#D4A24C]">
                {item.quantity}
              </span>
              <div>
                <p className="text-sm font-medium text-[#F7F3EC]">
                  {(item.food_item as { name?: string } | undefined)?.name ?? 'Item'}
                </p>
                <p className="text-xs text-[#C7BFB2] capitalize">Size: {item.size}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {nextStatus && (
        <button
          onClick={handleAdvance}
          disabled={updating}
          className="flex w-full items-center justify-center gap-2 rounded bg-[#D4A24C]/10 border border-[#D4A24C]/20 py-2.5 text-sm font-medium text-[#D4A24C] transition-all hover:bg-[#D4A24C] hover:text-[#1A1410] disabled:opacity-50"
        >
          {updating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              Mark as {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
              <CheckCircle2 size={16} />
            </>
          )}
        </button>
      )}
    </motion.div>
  );
}

export default function Page() {
  const router = useRouter();
  const { data: orders = [], isLoading } = useKitchenOrders();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
      try {
        const session = await authService.getSession();
        if (!session) {
          if (mounted) router.push('/chef/login');
          return;
        }
        const profile = await authService.getProfile(session.userId);
        if (profile.role !== 'chef' && profile.role !== 'admin') {
          if (mounted) router.push('/');
          return;
        }
        if (mounted) setIsAuthorized(true);
      } catch (err) {
        if (mounted) router.push('/');
      }
    };
    checkAuth();
    return () => { mounted = false; };
  }, [router]);

  const handleLogout = async () => {
    await authService.signOut();
    router.push('/chef/login');
  };

  // Group orders by status
  const pending = orders.filter((o) => o.status === 'pending');
  const confirmed = orders.filter((o) => o.status === 'confirmed');
  const preparing = orders.filter((o) => o.status === 'preparing');
  const ready = orders.filter((o) => o.status === 'ready');

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0D0B09] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#D4A24C] w-8 h-8" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0D0B09] flex flex-col md:h-screen">
      {/* Desktop Header (Hidden on Mobile) */}
      <header className="hidden md:flex sticky top-0 z-40 border-b border-[#D4A24C]/20 bg-[#0D0B09]/95 backdrop-blur px-6 py-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4A24C]/10 border border-[#D4A24C]/20">
               <ChefHat size={20} className="text-[#D4A24C]" />
            </div>
            <div>
              <h1 className="font-serif text-xl text-[#F7F3EC]">Kitchen Dashboard</h1>
              <p className="text-xs tracking-wider text-[#C7BFB2] flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                LIVE SYNC
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-[#C7BFB2] hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>
      
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 border-b border-[#D4A24C]/20 bg-[#0D0B09]/95 backdrop-blur px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2 text-[#D4A24C]">
          <ChefHat size={20} />
          <span className="font-serif font-bold tracking-wider uppercase">Kitchen</span>
        </div>
        <button onClick={handleLogout} className="text-[#C7BFB2] hover:text-[#D4A24C] p-2">
          <LogOut size={18} />
        </button>
      </header>

      {/* Kanban Board */}
      <div className="flex-1 overflow-y-auto md:overflow-x-auto p-4 md:p-6 pb-24 md:pb-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={32} className="animate-spin text-[#D4A24C]" />
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6 md:min-h-full items-start">
            {/* Column: Pending */}
            <div className="w-full md:w-[350px] shrink-0">
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="font-serif text-lg text-[#F7F3EC]">New Orders</h2>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500/20 text-xs font-bold text-yellow-400">
                  {pending.length}
                </span>
              </div>
              <div className="space-y-4">
                <AnimatePresence>
                  {pending.map((order) => (
                    <KitchenOrderCard key={order.id} order={order} />
                  ))}
                </AnimatePresence>
                {pending.length === 0 && (
                  <div className="rounded-lg border border-dashed border-[#C7BFB2]/20 py-12 text-center text-sm text-[#C7BFB2]/50">
                    No new orders
                  </div>
                )}
              </div>
            </div>

            {/* Column: Confirmed */}
            <div className="w-full md:w-[350px] shrink-0">
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="font-serif text-lg text-[#F7F3EC]">Confirmed</h2>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">
                  {confirmed.length}
                </span>
              </div>
              <div className="space-y-4">
                <AnimatePresence>
                  {confirmed.map((order) => (
                    <KitchenOrderCard key={order.id} order={order} />
                  ))}
                </AnimatePresence>
                {confirmed.length === 0 && (
                  <div className="rounded-lg border border-dashed border-[#C7BFB2]/20 py-12 text-center text-sm text-[#C7BFB2]/50">
                    Queue is empty
                  </div>
                )}
              </div>
            </div>

            {/* Column: Preparing */}
            <div className="w-full md:w-[350px] shrink-0">
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="font-serif text-lg text-[#F7F3EC]">Preparing</h2>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/20 text-xs font-bold text-orange-400">
                  {preparing.length}
                </span>
              </div>
              <div className="space-y-4">
                <AnimatePresence>
                  {preparing.map((order) => (
                    <KitchenOrderCard key={order.id} order={order} />
                  ))}
                </AnimatePresence>
                {preparing.length === 0 && (
                  <div className="rounded-lg border border-dashed border-[#C7BFB2]/20 py-12 text-center text-sm text-[#C7BFB2]/50">
                    Nothing in prep
                  </div>
                )}
              </div>
            </div>

            {/* Column: Ready to Serve */}
            <div className="w-full md:w-[350px] shrink-0">
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="font-serif text-lg text-[#F7F3EC]">Ready to Serve</h2>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                  {ready.length}
                </span>
              </div>
              <div className="space-y-4">
                <AnimatePresence>
                  {ready.map((order) => (
                    <KitchenOrderCard key={order.id} order={order} />
                  ))}
                </AnimatePresence>
                {ready.length === 0 && (
                  <div className="rounded-lg border border-dashed border-[#C7BFB2]/20 py-12 text-center text-sm text-[#C7BFB2]/50">
                    No ready orders
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <ChefMobileBottomNav />
    </main>
  );
}
