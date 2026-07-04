import Link from 'next/link';
import { Coffee, Fish, Pizza, Cake, ChefHat } from 'lucide-react';

const CATEGORIES = [
  { name: 'Breakfast', slug: 'breakfast', icon: <Coffee size={24} className="text-black md:w-8 md:h-8" /> },
  { name: 'Coffee', slug: 'beverages', icon: <Coffee size={22} className="text-black md:w-7 md:h-7" /> },
  { name: 'SeaFood', slug: 'seafood', icon: <Fish size={24} className="text-black md:w-8 md:h-8" /> },
  { name: 'Fast Food', slug: 'fast-food', icon: <Pizza size={24} className="text-black md:w-8 md:h-8" /> },
  { name: 'Dessert', slug: 'dessert', icon: <Cake size={24} className="text-black md:w-8 md:h-8" /> },
  { name: 'Lunch', slug: 'lunch', icon: <ChefHat size={24} className="text-black md:w-8 md:h-8" /> }
];

export function CategoryCarousel() {
  return (
    <div className="max-w-7xl mx-auto md:px-12 lg:px-24 mb-10">
      <div className="flex items-center justify-between px-6 md:px-0 mb-5">
        <h2 className="text-white font-semibold text-lg md:text-2xl tracking-wide">Categories</h2>
        <Link href="/menu" className="text-white font-semibold text-[13px] md:text-sm hover:text-[#FFB846] transition-colors">View all</Link>
      </div>

      <div className="flex gap-6 md:gap-10 overflow-x-auto px-6 md:px-0 pb-6 scrollbar-hide snap-x">
        {CATEGORIES.map((cat, i) => (
          <Link href={`/menu/${cat.slug}`} key={i} className="flex flex-col items-center gap-3 snap-center shrink-0 group cursor-pointer">
            <div className="w-[52px] h-[52px] md:w-[80px] md:h-[80px] rounded-[16px] md:rounded-[24px] bg-[#FFB846] flex items-center justify-center shadow-lg group-hover:-translate-y-2 transition-transform duration-300">
              {cat.icon}
            </div>
            <span className="text-white text-xs md:text-sm font-normal tracking-wide">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
