"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  ChefHat,
  PackageCheck,
  CircleDot,
  ChevronRight,
  UtensilsCrossed,
  Printer,
  Users,
  BookmarkCheck,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { reservationService } from '@/services/reservationService';
import type { OrderStatus } from '@/lib/types';

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

export default function Page() {
  const [activeTab, setActiveTab] = useState<'orders' | 'bookings'>('orders');
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!loading && !isAuthenticated) {
      router.push('/auth?redirect=/my-orders');
    }
  }, [loading, isAuthenticated, router]);

  // Fetch food orders
  const { data: orders = [], isLoading: ordersLoading, error: ordersError } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const stored = localStorage.getItem('royal_cafe_orders');
      const tokens = stored ? JSON.parse(stored) : [];
      if (tokens.length === 0) return [];
      return orderService.getOrdersByTrackingTokens(tokens);
    },
    enabled: isMounted,
  });

  // Fetch table bookings
  const { data: bookings = [], isLoading: bookingsLoading, error: bookingsError } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const stored = localStorage.getItem('royal_cafe_reservations');
      const codes = stored ? JSON.parse(stored) : [];
      if (codes.length === 0) return [];
      return reservationService.getReservationsByCodes(codes);
    },
    enabled: isMounted,
  });

  if (!isMounted || loading || !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] w-full py-10">
        <Loader2 className="animate-spin text-[#FFB846] w-8 h-8" />
      </div>
    );
  }

  const handlePrintBooking = (verificationCode: string) => {
    // Print a specific pass container
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const booking = bookings.find((b) => b.verification_code === verificationCode);
    if (!booking) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Reservation Pass - ${booking.verification_code}</title>
          <style>
            body { font-family: monospace; padding: 40px; color: #1a1410; }
            .ticket { border: 2px solid #D4A24C; padding: 30px; max-width: 400px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .title { font-family: serif; font-size: 24px; color: #D4A24C; text-transform: uppercase; margin: 0 0 5px 0; }
            .code-box { background: #f7f3ec; border: 1px dashed #D4A24C; padding: 15px; text-align: center; margin: 20px 0; }
            .code { font-size: 28px; font-weight: bold; letter-spacing: 2px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
            .label { color: #666; }
            .value { font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #999; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="ticket">
            <div class="header">
              <h2 class="title">Royal Rich Café</h2>
              <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Luxury Table Booking Pass</div>
            </div>
            <div class="code-box">
              <div style="font-size: 10px; color: #666; margin-bottom: 5px;">VERIFICATION CODE</div>
              <div class="code">${booking.verification_code}</div>
            </div>
            <div class="row">
              <span class="label">GUEST NAME:</span>
              <span class="value">${booking.guest_name}</span>
            </div>
            <div class="row">
              <span class="label">DATE:</span>
              <span class="value">${booking.reservation_date}</span>
            </div>
            <div class="row">
              <span class="label">TIME:</span>
              <span class="value">${booking.reservation_time}</span>
            </div>
            <div class="row">
              <span class="label">GUESTS:</span>
              <span class="value">${booking.guests_count} Guests</span>
            </div>
            <div class="row">
              <span class="label">DEPOSIT:</span>
              <span class="value">₹${booking.payment_amount.toFixed(0)} PAID</span>
            </div>
            <div class="footer">
              Please present this code upon arrival at the reception.<br>
              We look forward to hosting your fine dining experience.
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <main className="w-full h-full pt-6 pb-6">
      <section className="px-4 md:px-12">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-sm text-[#C7BFB2] hover:text-[#D4A24C] transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Back to Menu
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
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

            {/* Custom Tab buttons */}
            <div className="flex w-full sm:w-[400px] gap-2 p-1 bg-[#141210] border border-[#D4A24C]/15 rounded-lg self-start sm:self-auto">
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
        <div className="max-w-4xl mx-auto">
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
                    {orders.map((order) => {
                      const status = statusConfig[order.status];
                      const StatusIcon = status.icon;

                      return (
                        <div
                          key={order.id}
                          className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-lg border border-[#D4A24C]/15 bg-gradient-to-b from-[#141210] to-[#0D0B09] hover:border-[#D4A24C]/30 transition-all duration-300 group"
                        >
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
                    })}
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
                      <div
                        key={booking.id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-lg border border-[#D4A24C]/15 bg-gradient-to-b from-[#141210] to-[#0D0B09] hover:border-[#D4A24C]/30 transition-all duration-300"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm font-bold text-[#F7F3EC] bg-white/5 border border-[#D4A24C]/25 px-2 py-0.5 rounded">
                              {booking.verification_code}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${booking.status === 'confirmed'
                                  ? 'bg-blue-500/10 text-blue-400'
                                  : booking.status === 'attended'
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : 'bg-red-500/10 text-red-400'
                                }`}
                            >
                              {booking.status === 'confirmed' ? (
                                <>
                                  <BookmarkCheck size={12} className="mr-1" />
                                  Confirmed
                                </>
                              ) : booking.status === 'attended' ? (
                                <>
                                  <CheckCircle2 size={12} className="mr-1" />
                                  Attended
                                </>
                              ) : (
                                <>
                                  <XCircle size={12} className="mr-1" />
                                  Cancelled
                                </>
                              )}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#C7BFB2]">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} className="text-[#D4A24C]" />
                              {booking.reservation_date}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} className="text-[#D4A24C]" />
                              {booking.reservation_time}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Users size={12} className="text-[#D4A24C]" />
                              {booking.guests_count} Guests
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-0 border-[#D4A24C]/10">
                          <div className="text-left md:text-right">
                            <span className="block text-[10px] uppercase tracking-wider text-[#C7BFB2]">Deposit Status</span>
                            <span className="text-xs font-serif text-[#D4A24C] font-semibold">
                              ₹{booking.payment_amount.toFixed(0)} PAID
                            </span>
                          </div>

                          <button
                            onClick={() => handlePrintBooking(booking.verification_code)}
                            className="inline-flex items-center gap-1.5 rounded-[4px] bg-[#D4A24C]/10 border border-[#D4A24C]/20 hover:bg-[#D4A24C] hover:text-[#1A1410] text-[#D4A24C] px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300"
                          >
                            <Printer size={12} />
                            Print Pass
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
