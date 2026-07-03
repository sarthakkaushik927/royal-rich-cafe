import { useAllOrders, useActiveAds } from '@/hooks/useOrderData';
import { useAllFoodItems } from '@/hooks/useFoodData';
import { ReceiptText, UtensilsCrossed, Megaphone, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboardPage() {
  const { data: orders = [] } = useAllOrders();
  const { data: foodItems = [] } = useAllFoodItems();
  const { data: ads = [] } = useActiveAds();

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
  const activeOrders = orders.filter((o) => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status));

  const stats = [
    { label: 'Total Revenue', value: `₹${totalRevenue.toFixed(0)}`, icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Active Orders', value: activeOrders.length.toString(), icon: ReceiptText, color: 'text-blue-400' },
    { label: 'Menu Items', value: foodItems.length.toString(), icon: UtensilsCrossed, color: 'text-[#D4A24C]' },
    { label: 'Active Ads', value: ads.length.toString(), icon: Megaphone, color: 'text-purple-400' },
  ];

  return (
    <div className="p-6 md:p-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif text-3xl text-[#F7F3EC] mb-2">Overview</h1>
        <p className="text-[#C7BFB2] mb-8">Welcome to the Royal Rich Café Management Dashboard</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-[#D4A24C]/15 bg-linear-to-b from-[#141210] to-[#0D0B09] p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-[#C7BFB2]">{stat.label}</span>
                  <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                    <Icon size={20} />
                  </div>
                </div>
                <div className="text-3xl font-serif text-[#F7F3EC]">{stat.value}</div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
