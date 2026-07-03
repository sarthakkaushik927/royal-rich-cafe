import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import type { FoodItemWithPrices } from '@/lib/types';

interface FoodItemCardProps {
  item: FoodItemWithPrices;
  onSelect: (item: FoodItemWithPrices) => void;
  index: number;
}

function getStartingPrice(item: FoodItemWithPrices): number | null {
  if (item.prices.length === 0) return null;
  return Math.min(...item.prices.map((p) => p.price));
}

export function FoodItemCard({ item, onSelect, index }: FoodItemCardProps) {
  const startingPrice = getStartingPrice(item);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group cursor-pointer overflow-hidden rounded-lg border border-[#D4A24C]/10 bg-linear-to-b from-[#141210] to-[#0D0B09] transition-all duration-300 hover:border-[#D4A24C]/30 hover:shadow-[0_0_30px_rgba(212,162,76,0.08)]"
      onClick={() => onSelect(item)}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#D4A24C]/5">
            <ShoppingBag size={40} className="text-[#D4A24C]/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-[#0D0B09]/80 via-transparent to-transparent" />

        {!item.is_available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="rounded-full bg-red-500/20 px-4 py-1.5 text-sm font-medium text-red-400 border border-red-500/30">
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-serif text-lg text-[#F7F3EC] group-hover:text-[#D4A24C] transition-colors">
          {item.name}
        </h3>
        {item.description && (
          <p className="mt-1 text-sm text-[#C7BFB2] line-clamp-2">{item.description}</p>
        )}

        <div className="mt-3 flex items-center justify-between">
          {startingPrice !== null ? (
            <span className="text-[#D4A24C] font-medium">
              From ₹{startingPrice.toFixed(0)}
            </span>
          ) : (
            <span className="text-[#C7BFB2]/50 text-sm">No pricing</span>
          )}

          <button
            className="inline-flex items-center gap-1.5 rounded-[4px] bg-[#D4A24C] px-4 py-2 text-sm font-medium text-[#1A1410] transition-all hover:bg-[#c8963f] hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={!item.is_available}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item);
            }}
          >
            <ShoppingBag size={14} />
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );
}
