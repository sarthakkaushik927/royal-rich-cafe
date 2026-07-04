"use client";
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useCartStore } from '@/hooks/useCartStore';
import { toast } from 'sonner';
import type { FoodItemWithPrices, FoodSize } from '@/lib/types';

interface ItemSelectionModalProps {
  item: FoodItemWithPrices | null;
  onClose: () => void;
}

const sizeLabels: Record<FoodSize, string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
};

const sizeOrder: FoodSize[] = ['small', 'medium', 'large'];

export function ItemSelectionModal({ item, onClose }: ItemSelectionModalProps) {
  const [selectedSize, setSelectedSize] = useState<FoodSize>('medium');
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  const sortedPrices = useMemo(() => {
    if (!item) return [];
    return sizeOrder
      .map((size) => item.prices.find((p) => p.size === size))
      .filter(Boolean) as NonNullable<typeof item.prices[number]>[];
  }, [item]);

  const currentPrice = sortedPrices.find((p) => p.size === selectedSize);
  const lineTotal = currentPrice ? currentPrice.price * quantity : 0;

  const handleAdd = () => {
    if (!item || !currentPrice) return;
    addItem({
      food_item_id: item.id,
      name: item.name,
      image_url: item.image_url,
      size: selectedSize,
      quantity,
      unit_price: currentPrice.price,
    });
    toast.success(`${item.name} (${sizeLabels[selectedSize]}) added to cart`);
    setQuantity(1);
    onClose();
  };

  // Reset state when item changes
  if (!item) return null;

  return (
    <Modal open={!!item} onClose={onClose} title={item.name}>
      <div className="space-y-6">
        {/* Image */}
        {item.image_url && (
          <div className="relative h-48 w-full overflow-hidden rounded-lg">
            <img
              src={item.image_url}
              alt={item.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#0D0B09]/60 to-transparent" />
          </div>
        )}

        {item.description && (
          <p className="text-[#C7BFB2] text-sm leading-relaxed">{item.description}</p>
        )}

        {/* Size selector */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-widest text-[#C7BFB2] mb-3">
            Select Size
          </label>
          <div className="grid grid-cols-3 gap-2">
            {sortedPrices.map((price) => {
              const isActive = price.size === selectedSize;
              return (
                <motion.button
                  key={price.size}
                  onClick={() => setSelectedSize(price.size)}
                  className={`relative rounded-lg border px-3 py-3 text-center transition-all ${
                    isActive
                      ? 'border-[#D4A24C] bg-[#D4A24C]/10 text-[#D4A24C]'
                      : 'border-[#D4A24C]/15 text-[#C7BFB2] hover:border-[#D4A24C]/30'
                  }`}
                  whileTap={{ scale: 0.96 }}
                >
                  <span className="block text-sm font-medium">{sizeLabels[price.size]}</span>
                  <span className="block mt-0.5 text-xs opacity-80">₹{price.price.toFixed(0)}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Quantity stepper */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-widest text-[#C7BFB2] mb-3">
            Quantity
          </label>
          <div className="inline-flex items-center gap-4 rounded-lg border border-[#D4A24C]/15 px-2 py-1.5">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="rounded-md p-1.5 text-[#C7BFB2] transition-colors hover:bg-[#D4A24C]/10 hover:text-[#D4A24C] disabled:opacity-30"
              disabled={quantity <= 1}
            >
              <Minus size={16} />
            </button>
            <span className="min-w-8 text-center text-lg font-medium text-[#F7F3EC]">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => Math.min(20, q + 1))}
              className="rounded-md p-1.5 text-[#C7BFB2] transition-colors hover:bg-[#D4A24C]/10 hover:text-[#D4A24C]"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Line total + Add to cart */}
        <div className="flex items-center justify-between border-t border-[#D4A24C]/10 pt-4">
          <div>
            <span className="text-xs text-[#C7BFB2]">Total</span>
            <p className="text-2xl font-serif text-[#D4A24C]">₹{lineTotal.toFixed(0)}</p>
          </div>
          <button
            onClick={handleAdd}
            disabled={!currentPrice}
            className="inline-flex items-center gap-2 rounded-[4px] bg-[#D4A24C] px-6 py-3 font-medium text-[#1A1410] transition-all hover:bg-[#c8963f] hover:scale-[1.02] disabled:opacity-40"
          >
            <ShoppingBag size={16} />
            Add to Cart
          </button>
        </div>
      </div>
    </Modal>
  );
}
