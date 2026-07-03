import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, Loader2 } from 'lucide-react';
import { useAllOrders } from '@/hooks/useOrderData';
import { StatusBadge } from '@/components/ui/Badge';
import { OrderDetailsModal } from './modals/OrderDetailsModal';
import type { OrderStatus } from '@/lib/types';

export default function AdminOrdersPage() {
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
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-[#F7F3EC] mb-2">Order History</h1>
        <p className="text-[#C7BFB2]">View and filter all historical orders</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C7BFB2]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, name, or phone..."
            className="w-full h-11 rounded-lg border border-[#D4A24C]/15 bg-[#141210] pl-11 pr-4 text-sm text-[#F7F3EC] placeholder:text-[#C7BFB2]/50 outline-none focus:border-[#D4A24C]/40 transition-colors"
          />
        </div>
        
        <div className="relative shrink-0">
          <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C7BFB2]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
            className="h-11 rounded-lg border border-[#D4A24C]/15 bg-[#141210] pl-10 pr-10 text-sm text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40 transition-colors appearance-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-[#D4A24C]/15 bg-linear-to-b from-[#141210] to-[#0D0B09] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#C7BFB2]">
            <thead className="border-b border-[#D4A24C]/15 bg-white/5 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4A24C]/10">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin text-[#D4A24C] mx-auto" />
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : filteredOrders.map((order) => (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={order.id}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-xs text-[#F7F3EC]">
                    #{order.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-[#F7F3EC]">{order.guest_name || 'Guest'}</div>
                    {order.guest_phone && <div className="text-xs opacity-70">{order.guest_phone}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize">{order.order_type.replace('_', ' ')}</span>
                    {order.table_number && <span className="ml-1 text-xs opacity-70">(T{order.table_number})</span>}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(order.created_at).toLocaleDateString()}
                    <div className="text-xs opacity-70">
                      {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-serif text-[#D4A24C]">
                    ₹{order.total_amount.toFixed(0)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedToken(order.tracking_token);
                        setIsDetailsOpen(true);
                      }}
                      className="p-1.5 text-[#C7BFB2] hover:text-[#D4A24C] hover:bg-white/5 rounded transition-colors inline-flex"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
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
