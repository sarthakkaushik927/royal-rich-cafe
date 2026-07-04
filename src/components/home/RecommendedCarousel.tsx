"use client";
import Link from 'next/link';
import { Plus, Loader2 } from 'lucide-react';
import { useAllFoodItems } from '@/hooks/useFoodData';
import { useMemo } from 'react';

// Fallback items in case the database is completely empty
const FALLBACK_RECOMMENDED_ITEMS = [
  { 
    title: 'Truffle Burrata', 
    desc: 'Creamy burrata with black truffle.', 
    price: '399', 
    img: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?q=80&w=500' 
  },
  { 
    title: 'Classic Bisque', 
    desc: 'Classic Bisque lobster medallions.', 
    price: '450', 
    img: 'https://images.unsplash.com/photo-1548943487-a2e4b43b4859?q=80&w=500' 
  },
  { 
    title: 'Fried Lobster', 
    desc: 'Dip the pieces in a wet batter.', 
    price: '599', 
    img: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?q=80&w=500' 
  },
  {
    title: 'Wagyu Steak',
    desc: 'A5 Grade Wagyu with herb butter.',
    price: '1299',
    img: 'https://images.unsplash.com/photo-1546241072-4806eabc2066?q=80&w=500'
  }
];

export function RecommendedCarousel() {
  const { data: allItems = [], isLoading } = useAllFoodItems();

  // Pick up to 4 recommended items, or use the fallback if DB has no recommended items
  const recommendedItems = useMemo(() => {
    if (allItems.length > 0) {
      const dbRecommended = allItems.filter(item => item.is_recommended);
      const itemsToShow = dbRecommended.length > 0 ? dbRecommended.slice(0, 4) : allItems.slice(0, 4);
      
      return itemsToShow.map(item => ({
        title: item.name,
        desc: item.description || 'Delicious freshly prepared dish.',
        price: item.prices && item.prices.length > 0 
          ? item.prices.reduce((min, p) => p.price < min.price ? p : min).price.toString() 
          : '0',
        img: item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500'
      }));
    }
    return FALLBACK_RECOMMENDED_ITEMS;
  }, [allItems]);

  return (
    <div className="max-w-7xl mx-auto md:px-12 lg:px-24 mb-10">
      <div className="flex items-center justify-between px-6 md:px-0 mb-5 mt-2 md:mt-10">
        <h2 className="text-white font-semibold text-lg md:text-2xl tracking-wide">Recommended for you</h2>
        <Link href="/menu" className="text-white font-semibold text-[13px] md:text-sm hover:text-[#FFB846] transition-colors">View all</Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
           <Loader2 className="animate-spin text-[#FFB846]" size={32} />
        </div>
      ) : (
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 overflow-x-auto px-6 md:px-0 pb-8 scrollbar-hide snap-x">
          {recommendedItems.map((item, i) => (
            <div key={i} className="w-[145px] md:w-full shrink-0 h-[215px] md:h-auto bg-[#606060]/20 border border-[#FFB846]/10 rounded-[18px] md:rounded-[24px] p-2.5 md:p-5 flex flex-col snap-center relative shadow-xl hover:border-[#FFB846]/40 hover:-translate-y-1 transition-all group">
              <div className="w-full h-[95px] md:h-[180px] rounded-[12px] md:rounded-[16px] overflow-hidden mb-3 md:mb-5">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <h3 className="text-white text-[13px] md:text-lg font-semibold leading-tight mb-1.5 md:mb-2">{item.title}</h3>
              <p className="text-white/60 text-[10px] md:text-sm font-light leading-snug mb-auto pr-1 md:pr-0 line-clamp-2">{item.desc}</p>
              
              <div className="flex items-center justify-between mt-3 mb-1 relative md:mt-6">
                <div className="flex items-center gap-0.5 md:gap-1">
                  <span className="text-white text-[11px] md:text-sm font-medium">₹</span>
                  <span className="text-white text-[15px] md:text-xl font-bold">{item.price}</span>
                </div>
                
                <Link href={`/menu?search=${encodeURIComponent(item.title)}`} className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-[#FFA718] flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer absolute md:relative bottom-3 md:bottom-auto right-3 md:right-auto z-10">
                  <Plus size={16} className="text-black stroke-[3px] md:w-5 md:h-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
