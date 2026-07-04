"use client";
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShoppingBag, LayoutGrid, List, Search, ArrowLeft, UtensilsCrossed } from 'lucide-react';
import { MobileHeader } from '@/components/home/MobileHeader';
import { FoodItemCard } from '@/features/menu/FoodItemCard';
import { AdsCarousel } from '@/features/menu/AdsCarousel';
import { ItemSelectionModal } from '@/features/item-selection/ItemSelectionModal';
import { FoodCardSkeleton } from '@/components/ui/Skeleton';
import { CategoryGrid } from '@/features/menu/CategoryGrid';
import { useCategories, useAllFoodItems } from '@/hooks/useFoodData';
import { useActiveAds } from '@/hooks/useOrderData';
import { useCartStore } from '@/hooks/useCartStore';
import type { FoodItemWithPrices } from '@/lib/types';

import { use } from 'react';

export default function MenuPage({ 
  params,
  searchParams 
}: { 
  params?: Promise<{ categorySlug?: string[] }>,
  searchParams?: Promise<{ search?: string }>
}) {
  const resolvedParams = params ? use(params) : {};
  const resolvedSearchParams = searchParams ? use(searchParams) : {};
  const urlCategorySlug = resolvedParams.categorySlug?.[0] ?? null;
  const initialSearch = resolvedSearchParams.search ?? '';
  
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(urlCategorySlug);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedItem, setSelectedItem] = useState<FoodItemWithPrices | null>(null);

  const { data: categories = [], isLoading: catLoading } = useCategories();
  const { data: allItems = [], isLoading: itemsLoading, error: itemsError } = useAllFoodItems();
  const { data: ads = [] } = useActiveAds();
  const totalCartItems = useCartStore((s) => s.totalItems());

  const activeCategory = activeCategorySlug
    ? categories.find((c) => c.slug === activeCategorySlug)
    : null;

  const filteredItems = useMemo(() => {
    let items = allItems;
    if (activeCategory) {
      items = items.filter((i) => i.category_id === activeCategory.id);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.description?.toLowerCase().includes(q) ?? false)
      );
    }
    return items.filter((i) => i.is_available);
  }, [allItems, activeCategory, searchQuery]);

  return (
    <main className="min-h-screen bg-[#161718] font-sans pb-24">
      <MobileHeader />

      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-6 pt-4">
        {/* Ads Carousel */}
        {/* Controls bar / Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {(!activeCategorySlug && !searchQuery) ? (
            <div className="flex items-center justify-between w-full">
              <h2 className="text-white font-bold text-2xl tracking-wide">Categories</h2>
              <button className="text-white text-sm font-medium hover:text-[#FFB846] transition-colors">
                View all
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <button 
                onClick={() => { setActiveCategorySlug(null); setSearchQuery(''); }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFB846]/10 border border-[#FFB846]/20 text-[#FFB846] hover:bg-[#FFB846]/20 transition-colors text-sm font-medium"
              >
                <ArrowLeft size={16} />
                Back to Categories
              </button>
              
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search menu..."
                  className="h-10 w-40 md:w-48 rounded-full border border-white/10 bg-black/20 pl-9 pr-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#FFB846]/40 transition-colors"
                />
              </div>
            </div>
          )}
        </div>

        {/* Food items grid/list */}
        {itemsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <FoodCardSkeleton key={i} />
            ))}
          </div>
        ) : itemsError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-red-500/10 p-4 mb-4">
              <UtensilsCrossed size={32} className="text-red-400" />
            </div>
            <h3 className="font-serif text-xl text-[#F7F3EC] mb-2">Unable to load menu</h3>
            <p className="text-sm text-[#C7BFB2] mb-4">Please check your connection and try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-[4px] bg-[#D4A24C] px-6 py-2 text-sm font-medium text-[#1A1410] hover:bg-[#c8963f]"
            >
              Retry
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-[#D4A24C]/10 p-4 mb-4">
              <UtensilsCrossed size={32} className="text-[#D4A24C]" />
            </div>
            <h3 className="font-serif text-xl text-[#F7F3EC] mb-2">No dishes found</h3>
            <p className="text-sm text-[#C7BFB2]">
              {searchQuery
                ? 'Try a different search term'
                : 'Menu items will appear here once they are added'}
            </p>
          </div>
        ) : !activeCategorySlug && !searchQuery ? (
          <>
            <CategoryGrid categories={categories} onSelect={setActiveCategorySlug} />
            
            {ads.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-8"
              >
                <AdsCarousel ads={ads} onSelectItem={setSelectedItem} />
              </motion.div>
            )}
          </>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredItems.map((item, i) => (
              <FoodItemCard key={item.id} item={item} onSelect={setSelectedItem} index={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                onClick={() => setSelectedItem(item)}
                className="flex items-center gap-4 cursor-pointer rounded-lg border border-[#D4A24C]/10 bg-linear-to-r from-[#141210] to-[#0D0B09] p-4 transition-all hover:border-[#D4A24C]/25"
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-16 w-16 rounded-lg object-cover shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-[#D4A24C]/5">
                    <ShoppingBag size={20} className="text-[#D4A24C]/30" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-[#F7F3EC] truncate">{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-[#C7BFB2] truncate">{item.description}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  {item.prices.length > 0 && (
                    <span className="text-[#D4A24C] font-medium">
                      From ₹{Math.min(...item.prices.map((p) => p.price)).toFixed(0)}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Item selection modal */}
      <ItemSelectionModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </main>
  );
}
