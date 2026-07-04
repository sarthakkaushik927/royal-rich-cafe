"use client";
import Link from 'next/link';
import { MapPin, ChevronDown, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/hooks/useCartStore';

export function MobileHeader() {
  const totalCartItems = useCartStore((s) => s.totalItems());

  return (
    <div className="flex md:hidden flex-col px-6 pt-10 pb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#FFB846] flex items-center justify-center flex-shrink-0">
            <MapPin size={18} className="text-black" />
          </div>
          <div className="flex items-center gap-1 cursor-pointer">
            <span className="text-white text-lg font-medium">Home</span>
            <ChevronDown size={18} className="text-white mt-1" />
          </div>
        </div>
        <Link href="/checkout" className="w-10 h-10 rounded-full bg-[#FFB846] flex items-center justify-center flex-shrink-0 relative">
          <ShoppingCart size={18} className="text-black" />
          {totalCartItems > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border border-[#161718]">
              {totalCartItems}
            </span>
          )}
        </Link>
      </div>
      <p className="text-white/70 text-[13px] font-light leading-snug w-[85%] mt-1">
        Modern furniture, Delhi Rd, opposite sbi bank8
      </p>
    </div>
  );
}
