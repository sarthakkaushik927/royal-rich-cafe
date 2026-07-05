import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Receipt } from 'lucide-react';
import type { Reservation } from '@/lib/types';

interface ReservationReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation;
}

export function ReservationReceiptModal({ isOpen, onClose, reservation }: ReservationReceiptModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar bg-[#FAF8F5] rounded-xl shadow-2xl"
        >
          {/* Print specific styles */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body, html, main {
                background: white !important;
                height: 100% !important;
              }
              nav, footer, header, .no-print {
                display: none !important;
              }
              /* Hide all immediate children of main except the modal wrapper if possible, or just let them be pushed down */
              main > section {
                display: none !important;
              }
              #reservation-receipt {
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                background: white !important;
                padding: 40px !important;
                z-index: 99999 !important;
                margin: 0 !important;
                box-sizing: border-box !important;
              }
            }
          `}} />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-gray-500 hover:text-black hover:bg-gray-200 rounded-full transition-colors no-print"
          >
            <X size={20} />
          </button>

          <div id="reservation-receipt" className="p-8 text-[#1A1410] font-mono text-xs">
            <div className="text-center mb-6">
              <Receipt className="text-[#D4A24C] mx-auto mb-2" size={32} />
              <h3 className="font-serif text-2xl tracking-widest font-bold uppercase text-[#D4A24C] mb-1">
                Royal Rich Café
              </h3>
              <p className="text-[10px] uppercase tracking-wider text-gray-500">
                Reservation Receipt
              </p>
            </div>

            <div className="border-b border-dashed border-gray-300 my-4" />

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2">
                <span className="text-gray-500">GUEST NAME:</span>
                <span className="text-right font-semibold">{reservation.guest_name}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-gray-500">DATE:</span>
                <span className="text-right font-semibold">{reservation.reservation_date}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-gray-500">TIME:</span>
                <span className="text-right font-semibold">{reservation.reservation_time}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-gray-500">GUESTS:</span>
                <span className="text-right font-semibold">{reservation.guests_count}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-gray-500">FLOOR:</span>
                <span className="text-right font-semibold">{reservation.floor_number ?? '1'}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-gray-500">SEATS:</span>
                <span className="text-right font-semibold">{reservation.selected_seats?.join(', ') || 'N/A'}</span>
              </div>
              {reservation.special_requests && (
                <div className="pt-2">
                  <span className="text-gray-500 block mb-1">SPECIAL REQUESTS:</span>
                  <span className="block p-2 bg-gray-100 rounded text-gray-700">{reservation.special_requests}</span>
                </div>
              )}
            </div>

            <div className="border-b border-dashed border-gray-300 my-4" />

            <div className="space-y-2">
              <div className="grid grid-cols-2 text-sm">
                <span className="text-gray-500">PAYMENT STATUS:</span>
                <span className="text-right font-semibold uppercase">{reservation.payment_status}</span>
              </div>
              <div className="grid grid-cols-2 text-base font-bold pt-2">
                <span>AMOUNT PAID:</span>
                <span className="text-right text-emerald-600">
                  ₹{(reservation.payment_amount > 0 ? reservation.payment_amount : (reservation.guests_count * 500)).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="border-b border-dashed border-gray-300 my-4" />
            
            <div className="bg-[#D4A24C]/10 p-4 rounded-lg text-center mt-6">
              <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider">Security Token</p>
              <p className="font-mono text-xl font-bold tracking-widest text-[#D4A24C]">{reservation.verification_code}</p>
              <p className="text-[9px] text-gray-400 mt-2">Please present this code to the hostess upon arrival.</p>
            </div>
            
            <div className="mt-8 flex justify-center no-print">
              <button
                onClick={handlePrint}
                className="w-full inline-flex justify-center items-center gap-2 rounded bg-[#D4A24C] hover:bg-[#c8963f] px-6 py-3 text-sm font-bold text-[#1A1410] uppercase tracking-widest transition-colors shadow-lg shadow-[#D4A24C]/20"
              >
                Print Receipt
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
