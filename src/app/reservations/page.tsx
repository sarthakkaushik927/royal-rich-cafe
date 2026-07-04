"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ReservationModal } from "@/components/modals/ReservationModal";

import { motion, AnimatePresence } from 'framer-motion';
import { ReservationForm } from '@/features/reservations/ReservationForm';
import { ReservationTicket } from '@/features/reservations/ReservationTicket';
import type { Reservation } from '@/lib/types';
import { toast } from 'sonner';
import { TableSelection } from '@/features/reservations/TableSelection';

function ReservationsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();


  const initialData = {
    date: searchParams.get("date") || new Date().toISOString().split("T")[0],
    time: searchParams.get("time") || "19:00",
    guests: searchParams.get("guests") || "2",
  };

  const [step, setStep] = useState<'select-table' | 'details' | 'success'>('select-table');
  const [selectedTable, setSelectedTable] = useState<string>('');
  
  // Completed reservation details
  const [reservation, setReservation] = useState<Reservation | null>(null);

  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] w-full py-8">
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

      <section className="px-4 flex flex-col items-center justify-center w-full pb-16">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-serif text-3xl md:text-4xl text-[#F7F3EC] mb-3">
              {step === 'select-table' ? 'Reservation' : step === 'details' ? 'Complete Reservation' : 'Reservation Secured'}
            </h1>
            <p className="text-[#C7BFB2]">
              {step === 'select-table' ? 'Select your preferred dining experience.' : step === 'details' ? 'Please fill out the details below to secure your table.' : 'We look forward to serving you.'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'select-table' && (
              <motion.div
                key="select-table"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <TableSelection 
                  onSelect={(tableName) => { 
                    setSelectedTable(tableName); 
                    setStep('details'); 
                  }} 
                />
              </motion.div>
            )}

            {step === 'details' && (
              <ReservationForm
                initialData={initialData}
                selectedTable={selectedTable}
                onSuccess={(res) => {
                  setReservation(res);
                  setStep('success');
                }}
                onCancel={() => router.push('/')}
                variant="page"
              />
            )}

            {step === 'success' && reservation && (
              <ReservationTicket 
                reservation={reservation} 
                onClose={() => router.push('/')} 
                variant="page" 
              />
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}

export default function ReservationsPage() {
  return (
    <Suspense fallback={<div className="w-full h-full" />}>
      <ReservationsContent />
    </Suspense>
  );
}

