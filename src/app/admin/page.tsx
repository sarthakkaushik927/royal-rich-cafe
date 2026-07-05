"use client";
import { useAllOrders, useActiveAds } from '@/hooks/useOrderData';
import { useAllFoodItems } from '@/hooks/useFoodData';
import { TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Page() {
  const { data: orders = [] } = useAllOrders();
  const { data: foodItems = [] } = useAllFoodItems();
  const { data: ads = [] } = useActiveAds();

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);

  return (
    <div className="space-y-8 animate-fade-in pt-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-xl border border-[#D4A24C]/15 bg-linear-to-b from-[#141210] to-[#0D0B09] p-5 text-center space-y-2">
          <span className="text-[9px] uppercase tracking-widest text-[#C7BFB2] font-bold block">Gross Revenue</span>
          <p className="font-serif text-3xl text-[#D4A24C] font-bold">${totalRevenue.toFixed(0)}</p>
          <span className="text-[8px] text-green-500 font-sans tracking-wider block">▲ 18.2% vs Last Week</span>
        </div>
        <div className="rounded-xl border border-[#D4A24C]/15 bg-linear-to-b from-[#141210] to-[#0D0B09] p-5 text-center space-y-2">
          <span className="text-[9px] uppercase tracking-widest text-[#C7BFB2] font-bold block">Total Tickets Placed</span>
          <p className="font-serif text-3xl text-[#F7F3EC] font-bold">{orders.length}</p>
          <span className="text-[8px] text-green-500 font-sans tracking-wider block">▲ 5.4% vs Last Week</span>
        </div>
        <div className="rounded-xl border border-[#D4A24C]/15 bg-linear-to-b from-[#141210] to-[#0D0B09] p-5 text-center space-y-2">
          <span className="text-[9px] uppercase tracking-widest text-[#C7BFB2] font-bold block">Guest Reservations</span>
          <p className="font-serif text-3xl text-[#F7F3EC] font-bold">0</p>
          <span className="text-[8px] text-[#D4A24C] font-sans tracking-wider block">98% Occupancy Target</span>
        </div>
        <div className="rounded-xl border border-[#D4A24C]/15 bg-linear-to-b from-[#141210] to-[#0D0B09] p-5 text-center space-y-2">
          <span className="text-[9px] uppercase tracking-widest text-[#C7BFB2] font-bold block">Low Stock Alarms</span>
          <p className="font-serif text-3xl font-bold text-green-500">
            0
          </p>
          <span className="text-[8px] text-[#C7BFB2]/60 font-sans tracking-wider block">Critical ingredients</span>
        </div>
      </div>

      {/* SVG Interactive Analytics Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Revenue Trends */}
        <div className="rounded-xl border border-[#D4A24C]/15 bg-linear-to-b from-[#141210] to-[#0D0B09] p-6 space-y-4">
          <h3 className="font-serif text-lg text-[#F7F3EC] font-bold border-b border-[#D4A24C]/10 pb-2 flex justify-between items-center">
            <span>Weekly Revenue Trend</span>
            <span className="text-[10px] text-[#D4A24C] tracking-widest">USD ($)</span>
          </h3>
          
          {/* SVG Graph */}
          <div className="h-[220px] w-full flex items-end justify-between pt-6 px-4">
            {/* Simulate weekly bar values */}
            {[
              { day: 'Mon', val: 420, h: '40%' },
              { day: 'Tue', val: 680, h: '60%' },
              { day: 'Wed', val: 510, h: '48%' },
              { day: 'Thu', val: 890, h: '80%' },
              { day: 'Fri', val: 1200, h: '98%' },
              { day: 'Sat', val: 1450, h: '100%' },
              { day: 'Sun', val: 980, h: '88%' }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center space-y-2 w-[10%]">
                <div className="text-[8px] text-[#D4A24C] font-bold">${item.val}</div>
                <div className="w-full bg-[#D4A24C]/20 hover:bg-[#D4A24C] border border-[#D4A24C]/30 rounded-t transition-all duration-500" style={{ height: item.h }}></div>
                <div className="text-[9px] text-[#C7BFB2]/60 font-sans">{item.day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Sales and Booking Predictions */}
        <div className="rounded-xl border border-[#D4A24C]/15 bg-linear-to-b from-[#141210] to-[#0D0B09] p-6 space-y-6">
          <h3 className="font-serif text-lg text-[#F7F3EC] font-bold border-b border-[#D4A24C]/10 pb-2 flex items-center space-x-2">
            <Sparkles size={16} className="text-[#D4A24C]" />
            <span>Royal AI Operations Forecasts</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-[#D4A24C]/5 border border-[#D4A24C]/20 rounded">
              <TrendingUp className="text-[#D4A24C] mt-1 flex-shrink-0" size={16} />
              <div className="text-xs space-y-1">
                <p className="text-[#F7F3EC] font-semibold">Predictive Ordering Trend</p>
                <p className="text-[#C7BFB2]/80 leading-relaxed font-light">
                  AI anticipates a <strong>24% rise</strong> in lobster consumption for upcoming Friday evening due to high reservation occasions labeled as Romantic Anniversary date nights. Recommend pre-ordering 15 extra lobster tails.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-red-950/15 border border-red-500/20 rounded">
              <AlertCircle className="text-red-400 mt-1 flex-shrink-0" size={16} />
              <div className="text-xs space-y-1">
                <p className="text-red-400 font-semibold">Critical Stock Expiry Forecast</p>
                <p className="text-[#C7BFB2]/80 leading-relaxed font-light">
                  Our Oysters batch #09 expiry threshold triggers on <strong>July 6</strong>. AI predicts only 45 units will sell organically before expiry, suggesting to run an Oyster-Caviar happy hour combo promotion on Sunday to minimize waste.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
