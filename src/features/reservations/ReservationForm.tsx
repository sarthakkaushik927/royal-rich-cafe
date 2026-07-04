import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Calendar, Clock, Users, ChevronRight } from 'lucide-react';
import { reservationService } from '@/services/reservationService';
import type { Reservation } from '@/lib/types';
import { toast } from 'sonner';

interface ReservationFormProps {
  initialData: { date: string; time: string; guests: string };
  selectedTable?: string;
  onSuccess: (reservation: Reservation) => void;
  onCancel: () => void;
  variant?: 'page' | 'modal';
}

export function ReservationForm({ initialData, selectedTable, onSuccess, onCancel, variant = 'page' }: ReservationFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const isModal = variant === 'modal';
  const textClass = isModal ? 'text-xs' : 'text-sm';
  const inputHeight = isModal ? 'h-10' : 'h-12';
  const paddingClass = isModal ? 'p-3' : 'p-4';

  const handleConfirmReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      toast.error('Please fill in all required contact details');
      return;
    }

    setIsProcessing(true);
    try {
      const booked = await reservationService.createReservation({
        guest_name: name,
        guest_email: email,
        guest_phone: phone,
        reservation_date: initialData.date,
        reservation_time: initialData.time,
        guests_count: parseInt(initialData.guests) || 2,
        special_requests: specialRequests + (selectedTable ? ` (Table: ${selectedTable})` : ''),
        payment_status: 'paid',
        payment_amount: 0.00,
      });

      const storedReservations = localStorage.getItem('royal_cafe_reservations');
      const resCodes = storedReservations ? JSON.parse(storedReservations) : [];
      resCodes.push(booked.verification_code);
      localStorage.setItem('royal_cafe_reservations', JSON.stringify(resCodes));

      toast.success('Table reserved successfully!');
      onSuccess(booked);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Reservation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.form
      key="details-form"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onSubmit={handleConfirmReservation}
      className={`space-y-${isModal ? '4' : '6'} text-[#F7F3EC]`}
    >
      <div className={`grid grid-cols-3 gap-${isModal ? '2' : '4'} bg-[#D4A24C]/10 border border-[#D4A24C]/20 ${paddingClass} rounded-xl ${textClass}`}>
        <div className="flex items-center gap-2 text-[#C7BFB2] justify-center">
          <Calendar size={16} className="text-[#D4A24C]" />
          <span className="truncate">{initialData.date}</span>
        </div>
        <div className="flex items-center gap-2 text-[#C7BFB2] justify-center">
          <Clock size={16} className="text-[#D4A24C]" />
          <span>{initialData.time}</span>
        </div>
        <div className="flex items-center gap-2 text-[#C7BFB2] justify-center">
          <Users size={16} className="text-[#D4A24C]" />
          <span>{initialData.guests}</span>
        </div>
      </div>

      <div className={`space-y-${isModal ? '3' : '4'}`}>
        <div>
          <label className={`block ${textClass} uppercase tracking-widest text-[#C7BFB2] mb-1.5`}>Full Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full ${inputHeight} rounded-lg border border-[#D4A24C]/20 bg-[#1A1410] px-4 ${textClass} focus:outline-none focus:border-[#D4A24C]/60 transition-colors`}
            placeholder="Your Name"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={`block ${textClass} uppercase tracking-widest text-[#C7BFB2] mb-1.5`}>Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full ${inputHeight} rounded-lg border border-[#D4A24C]/20 bg-[#1A1410] px-4 ${textClass} focus:outline-none focus:border-[#D4A24C]/60 transition-colors`}
              placeholder="name@email.com"
            />
          </div>
          <div>
            <label className={`block ${textClass} uppercase tracking-widest text-[#C7BFB2] mb-1.5`}>Phone Number *</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`w-full ${inputHeight} rounded-lg border border-[#D4A24C]/20 bg-[#1A1410] px-4 ${textClass} focus:outline-none focus:border-[#D4A24C]/60 transition-colors`}
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        <div>
          <label className={`block ${textClass} uppercase tracking-widest text-[#C7BFB2] mb-1.5`}>Special Requests (Optional)</label>
          <textarea
            rows={isModal ? 3 : 4}
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            className={`w-full rounded-lg border border-[#D4A24C]/20 bg-[#1A1410] ${paddingClass} ${textClass} focus:outline-none focus:border-[#D4A24C]/60 resize-none transition-colors`}
            placeholder="Dietary needs, preferred seating, etc."
          />
        </div>
      </div>

      <div className="pt-4 border-t border-[#D4A24C]/15 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-lg border border-[#D4A24C]/30 text-[#D4A24C] hover:bg-[#D4A24C]/10 text-xs font-bold uppercase tracking-widest transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isProcessing}
          className={`flex items-center justify-center ${isModal ? 'min-w-[150px]' : 'min-w-[200px]'} gap-2 rounded-lg bg-[#D4A24C] hover:bg-[#c8963f] text-[#1A1410] px-6 py-3 text-xs font-bold uppercase tracking-widest transition-colors shadow-lg shadow-[#D4A24C]/20 disabled:opacity-50`}
        >
          {isProcessing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Booking Table...
            </>
          ) : (
            <>
              Confirm Reservation
              <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>
    </motion.form>
  );
}
