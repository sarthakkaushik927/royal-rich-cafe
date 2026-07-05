"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  ShoppingBag,
  ChevronRight,
  UtensilsCrossed,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { reservationService } from '@/services/reservationService';
import type { Reservation } from '@/lib/types';
import { ReservationReceiptModal } from '@/components/modals/ReservationReceiptModal';
import { OrderHistoryCard } from '@/components/orders/OrderHistoryCard';
import { BookingHistoryCard } from '@/components/orders/BookingHistoryCard';

export default function Page() {
  const [activeTab, setActiveTab] = useState<'orders' | 'bookings'>('orders');
  const router = useRouter();
  const { isAuthenticated, userId, profile, userEmail } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch food orders
  const { data: orders = [], isLoading: ordersLoading, error: ordersError } = useQuery({
    queryKey: ['my-orders', isAuthenticated, userId],
    queryFn: async () => {
      let allOrders: any[] = [];
      const stored = localStorage.getItem('royal_cafe_orders');
      const tokens = stored ? JSON.parse(stored) : [];
      if (tokens.length > 0) {
        allOrders = await orderService.getOrdersByTrackingTokens(tokens);
      }
      
      if (isAuthenticated && userId) {
        const dbOrders = await orderService.getAllOrders();
        const userOrders = dbOrders.filter(o => o.customer_id === userId || (profile?.phone && o.guest_phone === profile.phone) || (profile?.full_name && o.guest_name === profile.full_name));
        userOrders.forEach(uo => {
            if (!allOrders.some(o => o.id === uo.id)) {
                allOrders.push(uo);
            }
        });
      }
      
      return allOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
    enabled: isMounted,
    refetchOnMount: true,
  });

  // Fetch table bookings
  const { data: bookings = [], isLoading: bookingsLoading, error: bookingsError } = useQuery({
    queryKey: ['my-bookings', isAuthenticated, userId],
    queryFn: async () => {
      let allRes: any[] = [];
      const stored = localStorage.getItem('royal_cafe_reservations');
      const codes = stored ? JSON.parse(stored) : [];
      if (codes.length > 0) {
        allRes = await reservationService.getReservationsByCodes(codes);
      }
      
      if (isAuthenticated && userId) {
         const dbRes = await reservationService.getAllReservations();
         const userRes = dbRes.filter(r => (r as any).customer_id === userId || (userEmail && r.guest_email === userEmail));
         userRes.forEach(ur => {
             if (!allRes.some(r => r.id === ur.id)) {
                 allRes.push(ur);
             }
         });
      }
      
      return allRes.sort((a, b) => new Date(b.reservation_date).getTime() - new Date(a.reservation_date).getTime());
    },
    enabled: isMounted,
    refetchOnMount: true,
  });

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] w-full py-10">
        <Loader2 className="animate-spin text-[#FFB846] w-8 h-8" />
      </div>
    );
  }

  return (
    <main className="w-full h-full pt-28 pb-6">
      <section className="px-4 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-serif text-4xl text-[#F7F3EC] mb-2">My History</h1>
              <p className="text-[#C7BFB2]">
                Review your dining requests, orders, and table bookings
              </p>
            </motion.div>

            {/* Custom Tab buttons - Placed below header */}
            <div className="flex w-full sm:w-[400px] gap-2 p-1 bg-[#141210] border border-[#D4A24C]/15 rounded-lg">
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 flex justify-center items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-all duration-300 ${activeTab === 'orders'
                  ? 'bg-[#D4A24C] text-[#1A1410]'
                  : 'text-[#C7BFB2] hover:text-[#F7F3EC]'
                  }`}
              >
                <ShoppingBag size={14} />
                Food Orders
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`flex-1 flex justify-center items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-all duration-300 ${activeTab === 'bookings'
                  ? 'bg-[#D4A24C] text-[#1A1410]'
                  : 'text-[#C7BFB2] hover:text-[#F7F3EC]'
                  }`}
              >
                <Calendar size={14} />
                Table Bookings
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 pb-28">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'orders' ? (
              <motion.div
                key="orders-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {ordersLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                  </div>
                ) : ordersError ? (
                  <div className="text-center py-12 text-red-400 border border-[#D4A24C]/10 rounded-lg">
                    Failed to load your orders. Please try again.
                  </div>
                ) : orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center border border-[#D4A24C]/10 rounded-lg bg-[#141210]/20">
                    <div className="rounded-full bg-[#D4A24C]/10 p-5 mb-5">
                      <ShoppingBag size={32} className="text-[#D4A24C]" />
                    </div>
                    <h2 className="font-serif text-xl text-[#F7F3EC] mb-2">No Food Orders Yet</h2>
                    <p className="text-sm text-[#C7BFB2] mb-6">Explore our menu and experience luxury dining</p>
                    <Link
                      href="/menu"
                      className="inline-flex items-center gap-2 rounded bg-[#D4A24C] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#1A1410] hover:bg-[#c8963f] transition-all"
                    >
                      Browse Menu
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <OrderHistoryCard key={order.id} order={order} />
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="bookings-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {bookingsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                  </div>
                ) : bookingsError ? (
                  <div className="text-center py-12 text-red-400 border border-[#D4A24C]/10 rounded-lg">
                    Failed to load your table bookings. Please try again.
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center border border-[#D4A24C]/10 rounded-lg bg-[#141210]/20">
                    <div className="rounded-full bg-[#D4A24C]/10 p-5 mb-5">
                      <UtensilsCrossed size={32} className="text-[#D4A24C]" />
                    </div>
                    <h2 className="font-serif text-xl text-[#F7F3EC] mb-2">No Table Reservations</h2>
                    <p className="text-sm text-[#C7BFB2] mb-6">Book a table in advance for an exquisite dining experience</p>
                    <Link
                      href="/#reserve"
                      className="inline-flex items-center gap-2 rounded bg-[#D4A24C] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#1A1410] hover:bg-[#c8963f] transition-all"
                    >
                      Reserve Table
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <BookingHistoryCard 
                        key={booking.id} 
                        booking={booking} 
                        onViewDetails={setSelectedReservation} 
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {selectedReservation && (
        <ReservationReceiptModal
          isOpen={true}
          onClose={() => setSelectedReservation(null)}
          reservation={selectedReservation}
        />
      )}
    </main>
  );
}
