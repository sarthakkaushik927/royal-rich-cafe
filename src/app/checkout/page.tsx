"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, MapPin, UtensilsCrossed, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useCartStore } from '@/hooks/useCartStore';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '@/services/orderService';
import { CheckoutFormSchema, type CheckoutFormData, type OrderType } from '@/lib/types';

const orderTypeConfig: { value: OrderType; label: string; icon: typeof UtensilsCrossed }[] = [
  { value: 'dine_in', label: 'Dine In', icon: UtensilsCrossed },
  { value: 'takeaway', label: 'Takeaway', icon: Package },
  { value: 'delivery', label: 'Delivery', icon: MapPin },
];

const sizeLabels = { small: 'S', medium: 'M', large: 'L' } as const;

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const totalAmount = useCartStore((s) => s.totalAmount());
  const clearCart = useCartStore((s) => s.clearCart);
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated, loading, userId } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(CheckoutFormSchema),
    defaultValues: {
      guest_name: '',
      guest_phone: '',
      order_type: 'dine_in',
      table_number: '',
      delivery_address: '',
    },
  });

  const orderType = watch('order_type');

  useEffect(() => {
    setIsMounted(true);
    if (!loading && !isAuthenticated) {
      router.push('/auth?redirect=/checkout');
    }
  }, [loading, isAuthenticated, router]);

  if (!isMounted || loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0D0B09] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#D4A24C] w-8 h-8" />
      </div>
    );
  }

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setSubmitting(true);
    try {
      const order = await orderService.createOrder({
        customer_id: userId ?? undefined,
        guest_name: data.guest_name,
        guest_phone: data.guest_phone,
        order_type: data.order_type,
        table_number: data.order_type === 'dine_in' ? data.table_number : undefined,
        delivery_address: data.order_type === 'delivery' ? data.delivery_address : undefined,
        items,
      });

      clearCart();

      // Save order tracking token locally
      const storedTokens = localStorage.getItem('royal_cafe_orders');
      const tokens = storedTokens ? JSON.parse(storedTokens) : [];
      tokens.push(order.tracking_token);
      localStorage.setItem('royal_cafe_orders', JSON.stringify(tokens));

      toast.success('Order placed successfully!');
      router.push(`/order/${order.tracking_token}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#0D0B09]">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
          <h2 className="font-serif text-2xl text-[#F7F3EC] mb-3">Cart is empty</h2>
          <p className="text-[#C7BFB2] mb-6">Add items from the menu before checking out</p>
          <Link
            href="/menu"
            className="rounded-[4px] bg-[#D4A24C] px-6 py-3 font-medium text-[#1A1410] hover:bg-[#c8963f] transition-colors"
          >
            Browse Menu
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0D0B09]">
      <Navbar />

      <section className="pt-24 pb-6 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-serif text-4xl text-[#F7F3EC] mb-2">Checkout</h1>
            <p className="text-[#C7BFB2]">Complete your order details</p>
          </motion.div>
        </div>
      </section>

      <section className="px-6 md:px-12 pb-24">
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-lg border border-[#D4A24C]/15 bg-linear-to-b from-[#141210] to-[#0D0B09] p-6"
            >
              <h2 className="font-serif text-lg text-[#F7F3EC] mb-4">Contact Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#C7BFB2] mb-1.5">Name *</label>
                  <input
                    {...register('guest_name')}
                    className="w-full h-11 rounded-lg border border-[#D4A24C]/15 bg-transparent px-4 text-sm text-[#F7F3EC] placeholder:text-[#C7BFB2]/40 outline-none focus:border-[#D4A24C]/40 transition-colors"
                    placeholder="Your name"
                  />
                  {errors.guest_name && (
                    <p className="mt-1 text-xs text-red-400">{errors.guest_name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#C7BFB2] mb-1.5">Phone *</label>
                  <input
                    {...register('guest_phone')}
                    className="w-full h-11 rounded-lg border border-[#D4A24C]/15 bg-transparent px-4 text-sm text-[#F7F3EC] placeholder:text-[#C7BFB2]/40 outline-none focus:border-[#D4A24C]/40 transition-colors"
                    placeholder="+91 98765 43210"
                  />
                  {errors.guest_phone && (
                    <p className="mt-1 text-xs text-red-400">{errors.guest_phone.message}</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Order type */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-lg border border-[#D4A24C]/15 bg-linear-to-b from-[#141210] to-[#0D0B09] p-6"
            >
              <h2 className="font-serif text-lg text-[#F7F3EC] mb-4">Order Type</h2>
              <div className="grid grid-cols-3 gap-3">
                {orderTypeConfig.map((opt) => {
                  const isActive = orderType === opt.value;
                  const Icon = opt.icon;
                  return (
                    <label
                      key={opt.value}
                      className={`flex flex-col items-center gap-2 cursor-pointer rounded-lg border p-4 text-center transition-all ${isActive
                          ? 'border-[#D4A24C] bg-[#D4A24C]/10 text-[#D4A24C]'
                          : 'border-[#D4A24C]/15 text-[#C7BFB2] hover:border-[#D4A24C]/30'
                        }`}
                    >
                      <input
                        type="radio"
                        value={opt.value}
                        {...register('order_type')}
                        className="sr-only"
                      />
                      <Icon size={20} />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </label>
                  );
                })}
              </div>

              {orderType === 'dine_in' && (
                <div className="mt-4">
                  <label className="block text-xs uppercase tracking-widest text-[#C7BFB2] mb-1.5">
                    Table Number
                  </label>
                  <input
                    {...register('table_number')}
                    className="w-full h-11 rounded-lg border border-[#D4A24C]/15 bg-transparent px-4 text-sm text-[#F7F3EC] placeholder:text-[#C7BFB2]/40 outline-none focus:border-[#D4A24C]/40 transition-colors"
                    placeholder="e.g. Table 5"
                  />
                </div>
              )}

              {orderType === 'delivery' && (
                <div className="mt-4">
                  <label className="block text-xs uppercase tracking-widest text-[#C7BFB2] mb-1.5">
                    Delivery Address *
                  </label>
                  <textarea
                    {...register('delivery_address')}
                    rows={3}
                    className="w-full rounded-lg border border-[#D4A24C]/15 bg-transparent px-4 py-3 text-sm text-[#F7F3EC] placeholder:text-[#C7BFB2]/40 outline-none focus:border-[#D4A24C]/40 transition-colors resize-none"
                    placeholder="Full delivery address"
                  />
                </div>
              )}
            </motion.div>
          </div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="h-fit rounded-lg border border-[#D4A24C]/15 bg-linear-to-b from-[#141210] to-[#0D0B09] p-6"
          >
            <h2 className="font-serif text-lg text-[#F7F3EC] mb-4">Order Summary</h2>
            <div className="space-y-2 border-b border-[#D4A24C]/10 pb-4 mb-4">
              {items.map((item) => (
                <div key={`${item.food_item_id}-${item.size}`} className="flex justify-between text-sm">
                  <span className="text-[#C7BFB2] truncate mr-2">
                    {item.name} ({sizeLabels[item.size]}) × {item.quantity}
                  </span>
                  <span className="text-[#F7F3EC] shrink-0">₹{(item.unit_price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-[#C7BFB2] font-medium">Total</span>
              <span className="text-2xl font-serif text-[#D4A24C]">₹{totalAmount.toFixed(0)}</span>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-[4px] bg-[#D4A24C] px-6 py-3 font-medium text-[#1A1410] hover:bg-[#c8963f] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Placing Order...
                </>
              ) : (
                'Place Order'
              )}
            </button>
          </motion.div>
        </form>
      </section>

      <Footer />
    </main>
  );
}
