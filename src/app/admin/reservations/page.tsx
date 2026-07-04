"use client";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, ShieldCheck, Mail, Phone, Search, Loader2, X, BookmarkCheck } from 'lucide-react';
import { reservationService } from '@/services/reservationService';
import { toast } from 'sonner';

export default function Page() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'confirmed' | 'attended' | 'cancelled'>('all');

  // Fetch reservations
  const { data: reservations = [], isLoading, error } = useQuery({
    queryKey: ['admin-reservations'],
    queryFn: () => reservationService.getAllReservations(),
  });

  // Mutation to update reservation status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'confirmed' | 'cancelled' | 'attended' }) => {
      await reservationService.updateReservationStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
      toast.success('Reservation status updated');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    },
  });

  // Mutation to update payment status
  const updatePaymentMutation = useMutation({
    mutationFn: async ({ id, paymentStatus }: { id: string; paymentStatus: 'pending' | 'paid' }) => {
      await reservationService.updatePaymentStatus(id, paymentStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
      toast.success('Payment status updated');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update payment status');
    },
  });

  // Filter & Search Logic
  const filteredReservations = reservations.filter((res) => {
    const matchesSearch =
      res.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.guest_phone.includes(searchQuery) ||
      res.verification_code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = activeTab === 'all' || res.status === activeTab;

    return matchesSearch && matchesTab;
  });

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-[#F7F3EC] mb-1">Table Reservations</h1>
          <p className="text-sm text-[#C7BFB2]">Manage guests, table booking deposits, and venue entry passes.</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-[#D4A24C]/15 bg-[#141210]">
          <span className="block text-xs uppercase tracking-wider text-[#C7BFB2] mb-1">Total Bookings</span>
          <span className="font-serif text-2xl text-[#F7F3EC] font-semibold">{reservations.length}</span>
        </div>
        <div className="p-4 rounded-lg border border-[#D4A24C]/15 bg-[#141210]">
          <span className="block text-xs uppercase tracking-wider text-emerald-400 mb-1">Confirmed/Active</span>
          <span className="font-serif text-2xl text-emerald-400 font-semibold">
            {reservations.filter((r) => r.status === 'confirmed').length}
          </span>
        </div>
        <div className="p-4 rounded-lg border border-[#D4A24C]/15 bg-[#141210]">
          <span className="block text-xs uppercase tracking-wider text-[#D4A24C] mb-1">Attended</span>
          <span className="font-serif text-2xl text-[#D4A24C] font-semibold">
            {reservations.filter((r) => r.status === 'attended').length}
          </span>
        </div>
        <div className="p-4 rounded-lg border border-[#D4A24C]/15 bg-[#141210]">
          <span className="block text-xs uppercase tracking-wider text-red-400 mb-1">Cancelled</span>
          <span className="font-serif text-2xl text-red-400 font-semibold">
            {reservations.filter((r) => r.status === 'cancelled').length}
          </span>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D4A24C]/15 pb-4">
        {/* Tabs */}
        <div className="flex gap-2">
          {(['all', 'confirmed', 'attended', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-[#D4A24C] text-[#1A1410]'
                  : 'border border-[#D4A24C]/25 text-[#C7BFB2] hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C7BFB2]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, phone, code..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-[#D4A24C]/15 bg-[#141210] text-sm text-[#F7F3EC] placeholder:text-[#C7BFB2]/40 outline-none focus:border-[#D4A24C]/40 transition-colors"
          />
        </div>
      </div>

      {/* Reservations list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-[#D4A24C]" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-400">
          Failed to load reservations database.
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="text-center py-20 border border-[#D4A24C]/10 rounded-lg bg-[#141210]/5 text-[#C7BFB2]">
          No matching reservations found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredReservations.map((res) => (
            <motion.div
              key={res.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-[#D4A24C]/15 rounded-lg bg-[#141210] p-6 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-6"
            >
              {/* Left Column: Code & Guest */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-base font-bold text-[#F7F3EC] bg-white/5 border border-[#D4A24C]/20 px-2 py-0.5 rounded">
                    {res.verification_code}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      res.status === 'confirmed'
                        ? 'bg-blue-500/10 text-blue-400'
                        : res.status === 'attended'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {res.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif text-lg text-[#F7F3EC]">{res.guest_name}</h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#C7BFB2]">
                    <span className="flex items-center gap-1">
                      <Phone size={12} className="text-[#D4A24C]" />
                      {res.guest_phone}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Mail size={12} className="text-[#D4A24C]" />
                      {res.guest_email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle Column: Details & Payment */}
              <div className="space-y-2 md:w-64">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-1 text-[#C7BFB2]">
                    <Calendar size={12} className="text-[#D4A24C]" />
                    <span>{res.reservation_date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#C7BFB2]">
                    <Clock size={12} className="text-[#D4A24C]" />
                    <span>{res.reservation_time}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#C7BFB2]">
                    <Users size={12} className="text-[#D4A24C]" />
                    <span>{res.guests_count} Guests</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#C7BFB2]">Deposit:</span>
                  <span className="text-xs font-serif text-[#D4A24C] font-semibold">₹{res.payment_amount.toFixed(0)}</span>
                  <button
                    onClick={() =>
                      updatePaymentMutation.mutate({
                        id: res.id,
                        paymentStatus: res.payment_status === 'paid' ? 'pending' : 'paid',
                      })
                    }
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                      res.payment_status === 'paid'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20'
                    }`}
                  >
                    {res.payment_status === 'paid' ? (
                      <>
                        <ShieldCheck size={10} />
                        Paid
                      </>
                    ) : (
                      'Pending'
                    )}
                  </button>
                </div>

                {res.special_requests && (
                  <p className="text-xs text-[#C7BFB2]/70 italic bg-white/5 border border-white/5 p-2 rounded">
                    Requests: "{res.special_requests}"
                  </p>
                )}
              </div>

              {/* Right Column: Status Actions */}
              <div className="flex items-center gap-2 pt-4 md:pt-0 border-t md:border-0 border-[#D4A24C]/10 justify-end">
                {res.status === 'confirmed' && (
                  <>
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: res.id, status: 'attended' })}
                      className="inline-flex items-center gap-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors"
                      title="Mark as Attended"
                    >
                      <BookmarkCheck size={14} />
                      Attended
                    </button>
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: res.id, status: 'cancelled' })}
                      className="inline-flex items-center gap-1 rounded bg-red-950/40 border border-red-500/30 hover:bg-red-900/40 text-red-400 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors"
                      title="Cancel Reservation"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  </>
                )}

                {res.status !== 'confirmed' && (
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: res.id, status: 'confirmed' })}
                    className="inline-flex items-center gap-1 rounded border border-[#D4A24C]/35 text-[#D4A24C] hover:bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors"
                  >
                    Restore Status
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
