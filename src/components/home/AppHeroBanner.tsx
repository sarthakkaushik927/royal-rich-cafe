import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function AppHeroBanner() {
  return (
    <div className="px-6 md:px-12 lg:px-24 mb-8 md:mb-16">
      <div className="relative w-full h-[192px] md:h-[300px] lg:h-[400px] rounded-[16px] md:rounded-[24px] overflow-hidden flex items-end p-5 md:p-10 shadow-2xl group mx-auto max-w-6xl">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2000')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#161718] via-black/40 to-transparent opacity-90 md:opacity-80" />
        
        <div className="relative z-10 md:w-1/2 flex flex-col gap-4">
          <h1 className="hidden md:block text-4xl lg:text-6xl font-bold text-white font-serif leading-tight">
            An Exquisite <br className="hidden lg:block"/> Culinary Journey
          </h1>
          <p className="hidden md:block text-[#C7BFB2] text-lg mb-4">
            Discover a menu curated by world-class chefs, blending timeless elegance with modern flavor profiles.
          </p>
          <Link 
            href="/menu" 
            className="flex items-center gap-2 h-[36px] md:h-[48px] px-5 md:px-8 rounded-full bg-gradient-to-r from-[#FFB846] to-[#FFCC02] text-black font-semibold text-sm md:text-base hover:opacity-90 transition-opacity shadow-[0_4px_15px_rgba(255,184,70,0.4)] w-max"
          >
            Reserve a Table
            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-black flex items-center justify-center ml-1">
               <ArrowRight size={12} className="text-[#FFB846] md:w-3 md:h-3" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
