"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle, CreditCard, Receipt, Loader2, ArrowRight, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { reservationService } from '@/services/reservationService';
import type { Reservation } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

export default function ReservationsPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-luxury-bg pt-32 pb-16 px-4 md:px-12 flex justify-center"><Loader2 className="animate-spin text-luxury-gold" /></div>}>
      <ReservationsContent />
    </React.Suspense>
  );
}

function ReservationsContent() {
  const searchParams = useSearchParams();
  const { userId, userEmail, profile } = useAuth();
  
  // Step Management: 1: Details, 2: Seat Selection, 3: Payment, 4: Receipt
  const [step, setStep] = useState(1);

  // Form states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('19:00');
  const [guests, setGuests] = useState(2);
  const [occasion, setOccasion] = useState('Casual Dining');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Auto-fill user details
  useEffect(() => {
    if (userEmail && !email) setEmail(userEmail);
    if (profile?.full_name && !name) setName(profile.full_name);
    if (profile?.phone && !phone) setPhone(profile.phone);
  }, [userEmail, profile, email, name, phone]);
  
  // Floor and Seat logic
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  
  // The system checks if seats are already booked for this date, time, and floor
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [isLoadingSeats, setIsLoadingSeats] = useState(false);

  const [bookingConfirmed, setBookingConfirmed] = useState<Reservation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // When step 2 is active or when date/time/floor changes, fetch booked seats
  useEffect(() => {
    if (step === 2) {
      const fetchSeats = async () => {
        setIsLoadingSeats(true);
        try {
          // This would ideally hit an endpoint, but since we are mocking the implementation here
          // we can just fetch all reservations for this date and time and filter
          const res = await reservationService.getAllReservations();
          const conflicting = res.filter(r => r.reservation_date === date && r.reservation_time === time && r.floor_number === selectedFloor);
          
          let bSeats: string[] = [];
          conflicting.forEach(c => {
             if (c.selected_seats) bSeats = [...bSeats, ...c.selected_seats];
          });
          setBookedSeats(bSeats);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoadingSeats(false);
        }
      };
      fetchSeats();
    }
  }, [step, date, time, selectedFloor]);

  const handleNextToSeats = () => {
    if (!name || !email || !phone) {
      toast.error("Please complete the guest credentials.");
      return;
    }
    setStep(2);
  };

  const handleNextToPayment = () => {
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat/table.");
      return;
    }
    setStep(3);
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // Mock payment delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const booked = await reservationService.createReservation({
        guest_name: name,
        guest_email: email,
        guest_phone: phone,
        reservation_date: date,
        reservation_time: time,
        guests_count: guests,
        special_requests: `Occasion: ${occasion}. ${notes}`,
        payment_status: 'paid', // They just paid
        payment_amount: 500.00 * guests, // 500 per guest
        floor_number: selectedFloor,
        selected_seats: selectedSeats,
        customer_id: userId
      });

      toast.success('Payment successful. Table reserved!');
      setBookingConfirmed(booked);
      setStep(4);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Reservation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const floors = Array.from({ length: 10 }, (_, i) => i + 1);
  const seats = Array.from({ length: 20 }, (_, i) => `${i + 1}`);

  return (
    <div className="pt-32 pb-24 bg-luxury-bg text-white min-h-screen font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <span className="text-xs uppercase tracking-[0.3em] text-luxury-gold font-sans font-medium block">
            Exclusive Table Allocation
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl tracking-tight">
            Secure Your <span className="gold-text-gradient italic">Royal Placement</span>
          </h1>
          <p className="max-w-md mx-auto text-luxury-textGrey text-xs sm:text-sm uppercase tracking-wider font-light">
            Bookings include dedicated valet parking, a custom hostess welcome, and personalized menus.
          </p>
        </div>

        {/* Stepper */}
        {step < 4 && (
          <div className="flex justify-center mb-10">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${step >= 1 ? 'bg-luxury-gold text-black' : 'bg-white/10 text-white/50'}`}>1</div>
              <div className={`w-8 h-px ${step >= 2 ? 'bg-luxury-gold' : 'bg-white/10'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${step >= 2 ? 'bg-luxury-gold text-black' : 'bg-white/10 text-white/50'}`}>2</div>
              <div className={`w-8 h-px ${step >= 3 ? 'bg-luxury-gold' : 'bg-white/10'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${step >= 3 ? 'bg-luxury-gold text-black' : 'bg-white/10 text-white/50'}`}>3</div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass-card border border-luxury-gold/15 p-6 md:p-10 rounded-xl space-y-8"
            >
              <h3 className="font-serif text-xl text-luxury-gold border-b border-luxury-gold/10 pb-3 uppercase tracking-wider">
                Step 1: Reservation Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-luxury-warmGold font-bold block">Select Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-black/60 border border-luxury-gold/20 text-white p-2.5 rounded text-xs focus:border-luxury-gold" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-luxury-warmGold font-bold block">Select Time</label>
                  <select value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-black/60 border border-luxury-gold/20 text-white p-2.5 rounded text-xs focus:border-luxury-gold">
                    <option value="12:00">12:00 PM (Lunch)</option>
                    <option value="19:00">07:00 PM (Dinner)</option>
                    <option value="21:30">09:30 PM (Late Dining)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-luxury-warmGold font-bold block">Nobles / Guests</label>
                  <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full bg-black/60 border border-luxury-gold/20 text-white p-2.5 rounded text-xs focus:border-luxury-gold">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n} Nobles</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-luxury-warmGold font-bold block">Occasion</label>
                  <select value={occasion} onChange={(e) => setOccasion(e.target.value)} className="w-full bg-black/60 border border-luxury-gold/20 text-white p-2.5 rounded text-xs focus:border-luxury-gold">
                    <option value="Casual Dining">Casual Dining</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Anniversary">Anniversary</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-luxury-gold/10">
                <input type="text" required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black/60 border border-luxury-gold/20 text-white p-2.5 rounded text-xs focus:border-luxury-gold" />
                <input type="email" required placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/60 border border-luxury-gold/20 text-white p-2.5 rounded text-xs focus:border-luxury-gold" />
                <input type="tel" required placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-black/60 border border-luxury-gold/20 text-white p-2.5 rounded text-xs focus:border-luxury-gold" />
              </div>

              <div className="flex justify-end pt-4">
                <button onClick={handleNextToSeats} className="bg-luxury-gold text-black px-6 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors">
                  Next: Select Seats <ArrowRight size={14} className="inline ml-1" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass-card border border-luxury-gold/15 p-6 md:p-10 rounded-xl space-y-6"
            >
              <div className="flex justify-between items-center border-b border-luxury-gold/10 pb-3">
                <h3 className="font-serif text-xl text-luxury-gold uppercase tracking-wider">
                  Step 2: Floor & Seat Selection
                </h3>
                <button onClick={() => setStep(1)} className="text-xs text-luxury-textGrey hover:text-white uppercase tracking-wider underline">
                  Back
                </button>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <span className="text-xs uppercase tracking-wider text-luxury-textGrey">Select Floor:</span>
                <div className="flex flex-wrap gap-2">
                  {floors.map(f => (
                    <button 
                      key={f}
                      onClick={() => setSelectedFloor(f)}
                      className={`w-8 h-8 rounded text-xs font-bold transition-colors border ${selectedFloor === f ? 'bg-luxury-gold text-black border-luxury-gold' : 'bg-transparent text-luxury-textGrey border-luxury-gold/20 hover:border-luxury-gold/50'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-black/40 rounded-xl border border-white/5 relative min-h-[300px]">
                {isLoadingSeats ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                     <Loader2 size={32} className="animate-spin text-luxury-gold" />
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-6 text-xs uppercase tracking-widest text-luxury-gold/50 font-bold border-b border-white/5 pb-2">
                      Stage / View Direction
                    </div>
                    <div className="grid grid-cols-5 gap-4 justify-items-center">
                      {seats.map(seat => {
                        const isBooked = bookedSeats.includes(seat);
                        const isSelected = selectedSeats.includes(seat);
                        return (
                          <button
                            key={seat}
                            disabled={isBooked}
                            onClick={() => {
                               if (isSelected) {
                                 setSelectedSeats(selectedSeats.filter(s => s !== seat));
                               } else {
                                 setSelectedSeats([...selectedSeats, seat]);
                               }
                            }}
                            className={`w-12 h-12 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                              isBooked 
                                ? 'bg-red-500/10 text-red-500/50 border border-red-500/20 cursor-not-allowed' 
                                : isSelected
                                ? 'bg-luxury-gold text-black border border-luxury-gold shadow-[0_0_15px_rgba(212,162,76,0.3)]'
                                : 'bg-white/5 text-luxury-textGrey border border-white/10 hover:border-luxury-gold/50 hover:text-luxury-gold'
                            }`}
                          >
                            {seat}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex justify-between items-center pt-4">
                <div className="text-xs text-luxury-textGrey uppercase tracking-wider">
                  Selected Seats: <span className="text-luxury-gold font-bold">{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</span>
                </div>
                <button onClick={handleNextToPayment} className="bg-luxury-gold text-black px-6 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors">
                  Review Summary <ArrowRight size={14} className="inline ml-1" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass-card border border-luxury-gold/15 p-6 md:p-10 rounded-xl space-y-6 max-w-lg mx-auto"
            >
              <div className="flex justify-between items-center border-b border-luxury-gold/10 pb-3">
                <h3 className="font-serif text-xl text-luxury-gold uppercase tracking-wider flex items-center gap-2">
                  <Receipt size={18} /> Reservation Summary
                </h3>
                <button onClick={() => setStep(2)} className="text-xs text-luxury-textGrey hover:text-white uppercase tracking-wider underline">
                  Back
                </button>
              </div>

              <div className="bg-black/40 p-4 rounded-lg space-y-2 text-sm text-luxury-textGrey border border-white/5">
                <div className="flex justify-between">
                  <span>Reservation Deposit (x{guests} Guests)</span>
                  <span className="text-white">₹{(500 * guests).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax & Fees</span>
                  <span className="text-white">₹{((500 * guests) * 0.18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/10 font-bold text-luxury-gold text-lg">
                  <span>Total Due</span>
                  <span>₹{((500 * guests) * 1.18).toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={handlePayment} 
                disabled={isProcessing}
                className="w-full bg-luxury-gold text-black py-3 rounded text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : 'Confirm & Proceed to Payment Gate'}
              </button>
            </motion.div>
          )}

          {step === 4 && bookingConfirmed && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto glass-card border border-luxury-gold p-8 rounded-xl text-center space-y-6"
            >
              <CheckCircle className="text-emerald-400 mx-auto animate-pulse" size={60} />
              <h2 className="font-serif text-3xl text-luxury-accent">Payment Complete</h2>
              <p className="text-luxury-textGrey text-sm leading-relaxed font-light">
                Your reservation receipt and token have been issued.
              </p>
              
              <div className="border border-luxury-gold/20 bg-black/50 p-6 rounded-lg text-left space-y-4">
                <div className="text-center pb-4 border-b border-luxury-gold/20">
                  <Receipt className="text-luxury-gold mx-auto mb-2" size={24} />
                  <h3 className="font-serif text-xl text-white">ROYAL RICH CAFE</h3>
                  <p className="text-[10px] text-luxury-textGrey uppercase tracking-widest">Official Receipt</p>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-luxury-textGrey">NAME:</span>
                    <span className="text-white font-semibold">{bookingConfirmed.guest_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-luxury-textGrey">DATE/TIME:</span>
                    <span className="text-white font-semibold">{bookingConfirmed.reservation_date} / {bookingConfirmed.reservation_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-luxury-textGrey">FLOOR & SEATS:</span>
                    <span className="text-white font-semibold">Floor {bookingConfirmed.floor_number}, Seats {bookingConfirmed.selected_seats?.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-luxury-textGrey">AMOUNT PAID:</span>
                    <span className="text-emerald-400 font-semibold">₹{bookingConfirmed.payment_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-luxury-gold/10">
                    <span className="text-luxury-textGrey">SECURITY TOKEN:</span>
                    <span className="text-luxury-gold font-mono font-bold tracking-widest">{bookingConfirmed.verification_code}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => { setStep(1); setBookingConfirmed(null); setSelectedSeats([]); }}
                  className="w-full py-3 bg-transparent border border-luxury-gold/50 text-luxury-gold font-bold uppercase tracking-widest text-[10px] rounded hover:bg-luxury-gold/10 transition duration-300"
                >
                  New Booking
                </button>
                <a href="/my-orders" className="w-full py-3 flex items-center justify-center gap-2 bg-luxury-gold text-black font-bold uppercase tracking-widest text-[10px] rounded hover:bg-white transition duration-300">
                  <UserIcon size={14} /> My History
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
