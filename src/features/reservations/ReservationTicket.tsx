import { motion } from 'framer-motion';
import { Printer, CheckCircle } from 'lucide-react';
import type { Reservation } from '@/lib/types';

interface ReservationTicketProps {
  reservation: Reservation;
  onClose: () => void;
  variant?: 'page' | 'modal';
}

export function ReservationTicket({ reservation, onClose, variant = 'page' }: ReservationTicketProps) {
  const isModal = variant === 'modal';
  
  const handlePrintPass = () => {
    window.print();
  };

  return (
    <motion.div
      key="success-form"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`space-y-${isModal ? '6' : '8'} text-[#1A1410]`}
    >
      <div id="print-pass-area" className={`bg-[#FAF8F5] border border-[#D4A24C]/40 rounded-${isModal ? 'lg' : 'xl'} p-${isModal ? '6' : '8'} relative overflow-hidden shadow-2xl mx-auto max-w-md text-left`}>
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#D4A24C]" />

        <div className={`text-center space-y-${isModal ? '1' : '2'} mb-${isModal ? '5' : '6'}`}>
          <CheckCircle size={isModal ? 32 : 40} className="text-emerald-600 mx-auto" />
          <h4 className={`font-serif ${isModal ? 'text-lg' : 'text-xl'} tracking-widest font-bold uppercase text-[#1A1410]`}>
            Royal Rich Café
          </h4>
          <p className="text-[10px] uppercase tracking-widest text-gray-500">Luxury Table Booking Pass</p>
        </div>

        <div className={`bg-[#1A1410]/5 border border-dashed border-[#D4A24C]/40 p-${isModal ? '4' : '5'} rounded-lg text-center mb-${isModal ? '5' : '6'}`}>
          <span className="block text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-medium mb-1.5">
            Verification Code
          </span>
          <span className={`font-mono ${isModal ? 'text-2xl' : 'text-3xl'} font-bold tracking-widest text-[#D4A24C]`}>
            {reservation.verification_code}
          </span>
        </div>

        <div className={`space-y-${isModal ? '2.5' : '3.5'} ${isModal ? 'text-xs' : 'text-sm'} border-b border-gray-200 pb-${isModal ? '4' : '5'} mb-${isModal ? '4' : '5'}`}>
          <div className="flex justify-between">
            <span className="text-gray-500">GUEST NAME:</span>
            <span className="font-semibold text-gray-900">{reservation.guest_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">DATE:</span>
            <span className="font-semibold text-gray-900">{reservation.reservation_date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">TIME:</span>
            <span className="font-semibold text-gray-900">{reservation.reservation_time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">GUESTS:</span>
            <span className="font-semibold text-gray-900">{reservation.guests_count} Guests</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">STATUS:</span>
            <span className="font-bold text-emerald-700">CONFIRMED</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-1.5 opacity-80 py-2">
          <div className="flex gap-[2px] h-10 items-center bg-gray-900 px-4 py-1.5 rounded">
            <div className="w-[3px] h-full bg-white" />
            <div className="w-[1px] h-full bg-white" />
            <div className="w-[4px] h-full bg-white" />
            <div className="w-[2px] h-full bg-white" />
            <div className="w-[1px] h-full bg-white" />
            <div className="w-[3px] h-full bg-white" />
            <div className="w-[2px] h-full bg-white" />
            <div className="w-[4px] h-full bg-white" />
            <div className="w-[1px] h-full bg-white" />
          </div>
          <span className="text-[10px] font-mono text-gray-400">
            {reservation.id.slice(0, 18).toUpperCase()}
          </span>
        </div>

        <div className="text-center text-[10px] md:text-xs text-gray-400 mt-5 leading-relaxed">
          Please present this pass upon arrival at the reception.
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-white/10 modal-no-print">
        <button
          onClick={handlePrintPass}
          className="flex items-center gap-1.5 rounded-lg bg-[#D4A24C] hover:bg-[#c8963f] text-[#1A1410] px-5 py-2 text-xs font-bold uppercase tracking-widest transition-colors shadow-lg shadow-[#D4A24C]/10"
        >
          <Printer size={16} />
          Print Pass
        </button>
        <button
          onClick={onClose}
          className="rounded-lg border border-[#D4A24C]/20 text-[#D4A24C] hover:bg-white/5 px-5 py-2 text-xs font-bold uppercase tracking-widest transition-colors"
        >
          Close
        </button>
      </div>
    </motion.div>
  );
}
