"use client";
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/types';
import { Skeleton } from '@/components/ui/Skeleton';

interface CategoryTabsProps {
  categories: Category[];
  activeSlug: string | null;
  onSelect: (slug: string | null) => void;
  loading?: boolean;
}

export function CategoryTabs({ categories, activeSlug, onSelect, loading }: CategoryTabsProps) {
  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 shrink-0 rounded-full" />
        ))}
      </div>
    );
  }

  const tabs = [{ slug: null, name: 'All' }, ...categories.map((c) => ({ slug: c.slug, name: c.name }))];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {tabs.map((tab) => {
        const isActive = tab.slug === activeSlug;
        return (
          <motion.button
            key={tab.slug ?? 'all'}
            onClick={() => onSelect(tab.slug)}
            className={cn(
              'relative shrink-0 rounded-full px-5 py-2 text-sm font-medium tracking-wide transition-colors',
              isActive
                ? 'text-[#1A1410]'
                : 'text-[#C7BFB2] hover:text-[#F7F3EC] border border-[#D4A24C]/20 hover:border-[#D4A24C]/40'
            )}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {isActive && (
              <motion.span
                layoutId="category-tab-bg"
                className="absolute inset-0 rounded-full bg-[#D4A24C]"
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              />
            )}
            <span className="relative z-10">{tab.name}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
