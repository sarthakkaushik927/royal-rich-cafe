import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/hooks/useCartStore';
import { useRouter } from 'next/navigation';
import type { FoodSize } from '@/lib/types';

export function CartSidebar() {
  const router = useRouter();
  const { isOpen, closeCart, items, updateQuantity, removeItem, totalAmount } = useCartStore();
  const [deliveryMethod, setDeliveryMethod] = useState<'dine-in' | 'pickup' | 'delivery'>('pickup');
  const [promoCode, setPromoCode] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleCheckout = () => {
    closeCart();
    // Navigate to the checkout page, passing delivery method via query param or just simple redirect
    router.push('/checkout');
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeCart();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={handleOverlayClick}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="w-full max-w-[480px] bg-[#111111] h-full shadow-2xl flex flex-col font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-luxury-gold" size={20} />
                <h2 className="text-luxury-gold uppercase tracking-[0.2em] font-serif font-bold text-sm">
                  Your Gourmet Cart
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="text-luxury-textGrey hover:text-white transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                  <ShoppingBag size={48} className="text-luxury-gold/50 mb-4" />
                  <p className="text-white font-serif text-lg">Your cart is empty.</p>
                  <p className="text-luxury-textGrey text-xs mt-2 uppercase tracking-widest">
                    Add some exquisite dishes
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={`${item.food_item_id}-${item.size}`}
                    className="flex flex-col border-b border-white/5 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-white font-bold font-serif text-lg leading-tight">
                          {item.name}
                        </h3>
                        <p className="text-luxury-textGrey text-xs mt-1 uppercase tracking-wider">
                          ${item.unit_price.toFixed(2)} each {item.size !== 'medium' && `(${item.size})`}
                        </p>
                      </div>
                      <span className="text-luxury-gold font-bold font-mono">
                        ${(item.unit_price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-2">
                      <div className="flex items-center gap-4 bg-black/40 border border-white/10 rounded-sm px-3 py-1">
                        <button
                          onClick={() => updateQuantity(item.food_item_id, item.size, item.quantity - 1)}
                          className="text-luxury-textGrey hover:text-luxury-gold transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-white font-bold text-sm min-w-[12px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.food_item_id, item.size, item.quantity + 1)}
                          className="text-luxury-textGrey hover:text-luxury-gold transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.food_item_id, item.size)}
                        className="text-luxury-textGrey hover:text-red-400 transition-colors p-1 border border-white/10 rounded-sm bg-black/40"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Area */}
            {items.length > 0 && (
              <div className="p-6 bg-[#0D0D0D] border-t border-white/5 space-y-6">
                {/* Delivery Method */}
                <div>
                  <h4 className="text-[10px] text-luxury-gold font-bold uppercase tracking-widest mb-3">
                    Delivery Method
                  </h4>
                  <div className="flex bg-[#111] p-1 rounded-sm gap-1">
                    {['dine-in', 'pickup', 'delivery'].map((method) => (
                      <button
                        key={method}
                        onClick={() => setDeliveryMethod(method as any)}
                        className={`flex-1 py-2 text-[10px] uppercase font-bold tracking-wider rounded-sm transition-all ${
                          deliveryMethod === method
                            ? 'bg-luxury-gold text-black shadow-lg'
                            : 'text-luxury-textGrey hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Promo Code */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo Code (e.g. ROYAL10)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 bg-black/50 border border-white/10 text-white px-4 py-2 text-sm focus:outline-none focus:border-luxury-gold transition-colors rounded-sm"
                  />
                  <button className="px-6 py-2 bg-transparent border border-white/10 text-luxury-gold font-bold uppercase tracking-widest text-xs hover:border-luxury-gold transition-colors rounded-sm">
                    Apply
                  </button>
                </div>

                {/* Totals */}
                <div className="space-y-2 border-t border-white/5 pt-4">
                  <div className="flex justify-between text-luxury-textGrey text-sm">
                    <span>Subtotal:</span>
                    <span className="font-bold text-white">${totalAmount().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-luxury-gold font-bold uppercase tracking-widest text-sm">
                      Grand Total:
                    </span>
                    <span className="text-luxury-gold font-bold text-xl">${totalAmount().toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 bg-luxury-gold hover:bg-[#c8963f] text-black font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 rounded-sm transition-colors shadow-lg shadow-luxury-gold/20"
                >
                  Authorize Checkout Ticket <ArrowRight size={14} />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
