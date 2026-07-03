import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import type { Advertisement, FoodItemWithPrices } from '@/lib/types';

interface AdsCarouselProps {
  ads: Advertisement[];
  onSelectItem: (item: FoodItemWithPrices) => void;
}

export function AdsCarousel({ ads, onSelectItem }: AdsCarouselProps) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % ads.length);
  }, [ads.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + ads.length) % ads.length);
  }, [ads.length]);

  useEffect(() => {
    if (ads.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [ads.length, next]);

  if (ads.length === 0) return null;

  const ad = ads[current];

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#D4A24C]/15 bg-linear-to-r from-[#141210] to-[#0D0B09]">
      <AnimatePresence mode="wait">
        <motion.div
          key={ad.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row items-center gap-6 p-6 md:p-8 cursor-pointer"
          onClick={() => {
            if (ad.food_item) onSelectItem(ad.food_item);
          }}
        >
          {/* Image side */}
          {(ad.banner_image_url || ad.food_item?.image_url) && (
            <div className="relative h-40 w-full md:h-48 md:w-72 shrink-0 overflow-hidden rounded-lg">
              <img
                src={ad.banner_image_url || ad.food_item?.image_url || ''}
                alt={ad.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-r from-transparent to-[#0D0B09]/40" />
            </div>
          )}

          {/* Text side */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#D4A24C]/10 px-3 py-1 text-xs font-medium text-[#D4A24C] mb-3">
              <Sparkles size={12} />
              Featured
            </div>
            <h3 className="font-serif text-2xl md:text-3xl text-[#F7F3EC]">{ad.title}</h3>
            {ad.subtitle && (
              <p className="mt-2 text-[#C7BFB2]">{ad.subtitle}</p>
            )}
            <button className="mt-4 inline-flex items-center gap-2 rounded-[4px] bg-[#D4A24C] px-6 py-2.5 text-sm font-medium text-[#1A1410] transition-all hover:bg-[#c8963f] hover:scale-[1.02]">
              Order Now
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Nav arrows */}
      {ads.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-[#0D0B09]/70 p-2 text-[#D4A24C] backdrop-blur-sm transition-colors hover:bg-[#D4A24C]/20"
            aria-label="Previous ad"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[#0D0B09]/70 p-2 text-[#D4A24C] backdrop-blur-sm transition-colors hover:bg-[#D4A24C]/20"
            aria-label="Next ad"
          >
            <ChevronRight size={18} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {ads.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? 'w-6 bg-[#D4A24C]' : 'w-1.5 bg-[#D4A24C]/30'
                }`}
                aria-label={`Go to ad ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
