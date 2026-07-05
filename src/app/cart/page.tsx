"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useCartStore } from '@/hooks/useCartStore';
import type { FoodSize } from '@/lib/types';

const sizeLabels: Record<FoodSize, string> = {
  small: 'S',
  medium: 'M',
  large: 'L',
};

export default function CartPage() {
  const [isMounted, setIsMounted] = React.useState(false);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalAmount = useCartStore((s) => s.totalAmount());
  const totalItems = useCartStore((s) => s.totalItems());

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <main className="min-h-screen bg-[#0D0B09]" />;
  }

  return (
    <main className="min-h-screen bg-[#0D0B09]">
      <Navbar />

      <section className="pt-24 pb-12 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-sm text-[#C7BFB2] hover:text-[#D4A24C] transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Back to Menu
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-serif text-4xl text-[#F7F3EC] mb-2">Your Cart</h1>
            <p className="text-[#C7BFB2]">
              {totalItems > 0 ? `${totalItems} item${totalItems > 1 ? 's' : ''} in your cart` : 'Your cart is empty'}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-4xl mx-auto">
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="rounded-full bg-[#D4A24C]/10 p-6 mb-6">
                <ShoppingBag size={40} className="text-[#D4A24C]" />
              </div>
              <h2 className="font-serif text-2xl text-[#F7F3EC] mb-3">Nothing here yet</h2>
              <p className="text-[#C7BFB2] mb-6">Browse our menu and add some delicious dishes</p>
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 rounded-[4px] bg-[#D4A24C] px-6 py-3 font-medium text-[#1A1410] hover:bg-[#c8963f] transition-colors"
              >
                Explore Menu
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart items */}
              <div className="lg:col-span-2 space-y-3">
                {items.map((item, i) => (
                  <motion.div
                    key={`${item.food_item_id}-${item.size}`}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="flex items-center gap-4 rounded-lg border border-[#D4A24C]/10 bg-linear-to-r from-[#141210] to-[#0D0B09] p-4"
                  >
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-16 w-16 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-[#D4A24C]/5">
                        <ShoppingBag size={20} className="text-[#D4A24C]/30" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-[#F7F3EC] truncate">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center rounded-full bg-[#D4A24C]/10 px-2 py-0.5 text-xs text-[#D4A24C]">
                          {sizeLabels[item.size]}
                        </span>
                        <span className="text-sm text-[#C7BFB2]">₹{item.unit_price.toFixed(0)} each</span>
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.food_item_id, item.size, item.quantity - 1)}
                        className="rounded-md p-1.5 text-[#C7BFB2] hover:bg-[#D4A24C]/10 hover:text-[#D4A24C] transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="min-w-6 text-center text-sm font-medium text-[#F7F3EC]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.food_item_id, item.size, item.quantity + 1)}
                        className="rounded-md p-1.5 text-[#C7BFB2] hover:bg-[#D4A24C]/10 hover:text-[#D4A24C] transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <span className="text-[#D4A24C] font-medium w-20 text-right shrink-0">
                      ₹{(item.unit_price * item.quantity).toFixed(0)}
                    </span>

                    <button
                      onClick={() => removeItem(item.food_item_id, item.size)}
                      className="rounded-md p-1.5 text-[#C7BFB2] hover:bg-red-500/10 hover:text-red-400 transition-colors shrink-0"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={clearCart}
                    className="text-sm text-[#C7BFB2] hover:text-red-400 transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              {/* Order summary */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="h-fit rounded-lg border border-[#D4A24C]/15 bg-linear-to-b from-[#141210] to-[#0D0B09] p-6"
              >
                <h2 className="font-serif text-xl text-[#F7F3EC] mb-4">Order Summary</h2>
                <div className="space-y-3 border-b border-[#D4A24C]/10 pb-4 mb-4">
                  {items.map((item) => (
                    <div key={`${item.food_item_id}-${item.size}`} className="flex justify-between text-sm">
                      <span className="text-[#C7BFB2] truncate mr-2">
                        {item.name} ({sizeLabels[item.size]}) × {item.quantity}
                      </span>
                      <span className="text-[#F7F3EC] shrink-0">
                        ₹{(item.unit_price * item.quantity).toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[#C7BFB2] font-medium">Total</span>
                  <span className="text-2xl font-serif text-[#D4A24C]">₹{totalAmount.toFixed(0)}</span>
                </div>
                <Link
                  href="/checkout"
                  className="flex w-full items-center justify-center gap-2 rounded-[4px] bg-[#D4A24C] px-6 py-3 font-medium text-[#1A1410] hover:bg-[#c8963f] hover:scale-[1.01] transition-all"
                >
                  Proceed to Checkout
                  <ArrowRight size={16} />
                </Link>
              </motion.div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
