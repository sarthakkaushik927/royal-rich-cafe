import { Search } from 'lucide-react';

export function SearchBar() {
  return (
    <div className="px-6 md:px-12 lg:px-24 mb-7 md:mt-28 md:mb-12 max-w-4xl mx-auto">
      <div className="h-[51px] md:h-[60px] bg-white/[0.15] rounded-full flex items-center px-5 gap-3 border-[1.5px] border-white/20 focus-within:border-[#FFB846]/50 transition-colors shadow-lg backdrop-blur-sm">
        <Search size={20} className="text-white/60 md:w-6 md:h-6" />
        <input 
          type="text" 
          placeholder="Search for dishes, cuisines..." 
          className="bg-transparent border-none outline-none text-white placeholder:text-white/60 w-full text-sm md:text-base font-normal"
        />
      </div>
    </div>
  );
}
