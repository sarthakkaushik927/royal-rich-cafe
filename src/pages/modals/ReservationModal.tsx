import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Calendar, Clock, Users, Printer, CheckCircle, ChevronRight } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { reservationService } from '@/services/reservationService';
import type { Reservation } from '@/lib/types';
import { toast } from 'sonner';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    date: string;
    time: string;
    guests: string;
  };
}

export function ReservationModal({ isOpen, onClose, initialData }: ReservationModalProps) {
  const [step, setStep] = useState<'details' | 'success'>('details');
  
  // Contact details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Completed reservation details
  const [reservation, setReservation] = useState<Reservation | null>(null);

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
        special_requests: specialRequests,
        payment_status: 'paid',
        payment_amount: 0.00, // Payment waived/removed
      });

      // Save reservation verification code to local storage
      const storedReservations = localStorage.getItem('royal_cafe_reservations');
      const resCodes = storedReservations ? JSON.parse(storedReservations) : [];
      resCodes.push(booked.verification_code);
      localStorage.setItem('royal_cafe_reservations', JSON.stringify(resCodes));

      setReservation(booked);
      setStep('success');
      toast.success('Table reserved successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Reservation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintPass = () => {
    window.print();
  };

  const handleResetAndClose = () => {
    setStep('details');
    setName('');
    setEmail('');
    setPhone('');
    setSpecialRequests('');
    setReservation(null);
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={handleResetAndClose} title={step !== 'success' ? 'Complete Reservation' : 'Reservation Secured'}>
      {/* Print Pass Stylesheet Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          nav, footer, .no-print, .modal-no-print, header, aside, button {
            display: none !important;
          }
          body, main, section, html, #root {
            background: white !important;
            color: black !important;
            min-height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          #print-pass-area {
            display: block !important;
            background: white !important;
            color: black !important;
            padding: 20px !important;
            border: 2px solid #D4A24C !important;
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}} />

      <AnimatePresence mode="wait">
        {step === 'details' && (
          <motion.form
            key="details-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleConfirmReservation}
            className="space-y-4 text-[#F7F3EC]"
          >
            {/* Selection summary */}
            <div className="grid grid-cols-3 gap-2 bg-[#D4A24C]/10 border border-[#D4A24C]/20 p-3 rounded-lg text-xs">
              <div className="flex items-center gap-1.5 text-[#C7BFB2]">
                <Calendar size={12} className="text-[#D4A24C]" />
                <span className="truncate">{initialData.date}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#C7BFB2]">
                <Clock size={12} className="text-[#D4A24C]" />
                <span>{initialData.time}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#C7BFB2]">
                <Users size={12} className="text-[#D4A24C]" />
                <span>{initialData.guests}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#C7BFB2] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 rounded border border-[#D4A24C]/20 bg-[#141110] px-3 text-sm focus:outline-none focus:border-[#D4A24C]/60"
                  placeholder="Your Name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#C7BFB2] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 rounded border border-[#D4A24C]/20 bg-[#141110] px-3 text-sm focus:outline-none focus:border-[#D4A24C]/60"
                    placeholder="name@email.com"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#C7BFB2] mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-10 rounded border border-[#D4A24C]/20 bg-[#141110] px-3 text-sm focus:outline-none focus:border-[#D4A24C]/60"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-[#C7BFB2] mb-1">Special Requests (Optional)</label>
                <textarea
                  rows={3}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full rounded border border-[#D4A24C]/20 bg-[#141110] p-3 text-sm focus:outline-none focus:border-[#D4A24C]/60 resize-none"
                  placeholder="dietary needs, preferred seating, etc."
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#D4A24C]/15 flex justify-end">
              <button
                type="submit"
                disabled={isProcessing}
                className="flex items-center gap-1.5 rounded-[4px] bg-[#D4A24C] hover:bg-[#c8963f] text-[#1A1410] px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    Booking Table...
                  </>
                ) : (
                  <>
                    Confirm Reservation
                    <ChevronRight size={14} />
                  </>
                )}
              </button>
            </div>
          </motion.form>
        )}

        {step === 'success' && reservation && (
          <motion.div
            key="success-form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-[#1A1410]"
          >
            {/* Visual ticket print area */}
            <div id="print-pass-area" className="bg-[#FAF8F5] border border-[#D4A24C]/40 rounded-lg p-6 relative overflow-hidden shadow-xl text-left">
              {/* Gold borders/decorations */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#D4A24C]" />

              <div className="text-center space-y-1 mb-5">
                <CheckCircle size={32} className="text-emerald-600 mx-auto" />
                <h4 className="font-serif text-lg tracking-widest font-bold uppercase text-[#1A1410]">
                  Royal Rich Café
                </h4>
                <p className="text-[9px] uppercase tracking-widest text-gray-500">Luxury Table Booking Pass</p>
              </div>

              {/* Booking Code block */}
              <div className="bg-[#1A1410]/5 border border-dashed border-[#D4A24C]/40 p-4 rounded text-center mb-5">
                <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-medium mb-1">
                  Verification Code
                </span>
                <span className="font-mono text-2xl font-bold tracking-widest text-[#D4A24C]">
                  {reservation.verification_code}
                </span>
              </div>

              {/* Reservation info */}
              <div className="space-y-2.5 text-xs border-b border-gray-200 pb-4 mb-4">
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
                  <span className="text-gray-500">DEPOSIT STATUS:</span>
                  <span className="font-bold text-emerald-700">
                    {reservation.payment_amount > 0 ? `₹${reservation.payment_amount.toFixed(0)} PAID` : 'WAIVED'}
                  </span>
                </div>
              </div>

              {/* Barcode representation */}
              <div className="flex flex-col items-center justify-center gap-1 opacity-80 py-2">
                <div className="flex gap-[2px] h-8 items-center bg-gray-900 px-3 py-1 rounded">
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
                <span className="text-[8px] font-mono text-gray-400">
                  {reservation.id.slice(0, 18).toUpperCase()}
                </span>
              </div>

              <div className="text-center text-[9px] text-gray-400 mt-4 leading-relaxed">
                Please present this code upon arrival at the reception.
                <br />
                We look forward to hosting your fine dining experience.
              </div>
            </div>

            {/* Buttons (hidden during browser print) */}
            <div className="flex justify-end gap-3 pt-2 border-t border-white/10 modal-no-print">
              <button
                onClick={handlePrintPass}
                className="flex items-center gap-1.5 rounded-[4px] bg-[#D4A24C] hover:bg-[#c8963f] text-[#1A1410] px-5 py-2 text-xs font-bold uppercase tracking-widest transition-colors shadow-lg shadow-[#D4A24C]/10"
              >
                <Printer size={12} />
                Print Pass
              </button>
              <button
                onClick={handleResetAndClose}
                className="rounded-[4px] border border-[#D4A24C]/20 text-[#D4A24C] hover:bg-white/5 px-5 py-2 text-xs font-bold uppercase tracking-widest transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
