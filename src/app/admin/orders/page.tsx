"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, Loader2, ReceiptText } from 'lucide-react';
import { useAllOrders } from '@/hooks/useOrderData';
import { StatusBadge } from '@/components/ui/Badge';
import { OrderDetailsModal } from '@/components/modals/OrderDetailsModal';
import type { OrderStatus } from '@/lib/types';

export default function Page() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedToken, setSelectedToken] = useState<string | undefined>();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const { data: orders = [], isLoading } = useAllOrders();

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      (order.guest_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (order.guest_phone || '').includes(search);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="animate-fade-in pt-4 space-y-6">
      
      <div className="rounded-xl glass-card p-5 space-y-5">
        <h3 className="font-serif text-lg text-[#D4A24C] border-b border-[#D4A24C]/10 pb-2 uppercase tracking-wider flex items-center space-x-1.5 justify-between">
          <div className="flex items-center space-x-2">
            <ReceiptText size={16} />
            <span>Order History Catalog ({filteredOrders.length} Records)</span>
          </div>
        </h3>

        <div className="flex flex-col sm:flex-row gap-4 mb-2">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C7BFB2]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, name, or phone..."
              className="w-full bg-black/60 border border-[#D4A24C]/20 text-white py-2 pl-9 pr-3 rounded text-xs focus:outline-none focus:border-[#D4A24C] transition-colors"
            />
          </div>
          
          <div className="relative shrink-0">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C7BFB2]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
              className="w-full sm:w-48 bg-black/60 border border-[#D4A24C]/20 text-white py-2 pl-9 pr-8 rounded text-xs focus:outline-none focus:border-[#D4A24C] transition-colors appearance-none cursor-pointer"
            >
              <option value="all">ALL STATUSES</option>
              <option value="pending">PENDING</option>
              <option value="confirmed">CONFIRMED</option>
              <option value="preparing">PREPARING</option>
              <option value="ready">READY</option>
              <option value="completed">COMPLETED</option>
              <option value="cancelled">CANCELLED</option>
            </select>
          </div>
        </div>

        <div className="rounded-lg border border-[#D4A24C]/10 bg-black/40 overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs text-[#C7BFB2]">
              <thead className="border-b border-[#D4A24C]/10 bg-white/5 uppercase tracking-wider text-[10px] text-[#D4A24C]">
                <tr>
                  <th className="px-4 py-3 font-bold">Order ID</th>
                  <th className="px-4 py-3 font-bold">Customer</th>
                  <th className="px-4 py-3 font-bold">Type</th>
                  <th className="px-4 py-3 font-bold">Date & Time</th>
                  <th className="px-4 py-3 font-bold">Total</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4A24C]/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <Loader2 className="animate-spin text-[#D4A24C] mx-auto w-6 h-6" />
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[#C7BFB2]/50">
                      No orders found matching your criteria.
                    </td>
                  </tr>
                ) : filteredOrders.map((order) => (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={order.id}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-4 py-3 font-mono text-[10px] text-[#F7F3EC]">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-serif font-bold text-[#F7F3EC] text-sm">{order.guest_name || 'Guest'}</div>
                      {order.guest_phone && <div className="text-[10px] opacity-70 mt-0.5 tracking-wider">{order.guest_phone}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="uppercase tracking-widest text-[10px]">{order.order_type.replace('_', ' ')}</span>
                      {order.table_number && <span className="ml-1 text-[10px] text-[#D4A24C] font-bold">T{order.table_number}</span>}
                    </td>
                    <td className="px-4 py-3 text-[10px] uppercase tracking-wider">
                      {new Date(order.created_at).toLocaleDateString()}
                      <div className="opacity-70 mt-0.5">
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-[#D4A24C]">
                      ₹{order.total_amount.toFixed(0)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="scale-90 origin-left">
                        <StatusBadge status={order.status} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedToken(order.tracking_token);
                          setIsDetailsOpen(true);
                        }}
                        className="p-1.5 bg-black/60 border border-[#D4A24C]/20 hover:border-[#D4A24C] text-[#C7BFB2] hover:text-[#D4A24C] rounded transition-colors inline-flex opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <OrderDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedToken(undefined);
        }}
        trackingToken={selectedToken}
      />
    </div>
  );
}
