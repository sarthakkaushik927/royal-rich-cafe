import { motion } from 'framer-motion';
import { Calendar, Clock, Users, BookmarkCheck, CheckCircle2, XCircle } from 'lucide-react';
import type { Reservation } from '@/lib/types';

interface BookingHistoryCardProps {
  booking: Reservation;
  onViewDetails: (booking: Reservation) => void;
}

export function BookingHistoryCard({ booking, onViewDetails }: BookingHistoryCardProps) {
  return (
    <motion.div
      key={booking.id}
      className="p-6 rounded-lg border border-[#D4A24C]/15 bg-gradient-to-b from-[#141210] to-[#0D0B09] hover:border-[#D4A24C]/30 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
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
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-6 text-sm text-[#C7BFB2]">
          <span className="flex items-center gap-2">
            <Calendar size={14} className="text-[#D4A24C]" />
            {booking.reservation_date}
          </span>
          <span className="flex items-center gap-2">
            <Clock size={14} className="text-[#D4A24C]" />
            {booking.reservation_time}
          </span>
          <span className="flex items-center gap-2">
            <Users size={14} className="text-[#D4A24C]" />
            {booking.guests_count} Guests
          </span>
        </div>

        <button
          onClick={() => onViewDetails(booking)}
          className="inline-flex items-center gap-1.5 rounded-[4px] bg-[#D4A24C]/10 border border-[#D4A24C]/20 hover:bg-[#D4A24C] hover:text-[#1A1410] text-[#D4A24C] px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300"
        >
          <BookmarkCheck size={12} />
          View Details
        </button>
      </div>
    </motion.div>
  );
}
