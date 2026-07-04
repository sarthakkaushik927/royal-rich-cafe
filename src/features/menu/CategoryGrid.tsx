import { Category } from '@/lib/types';
import { ArrowRight } from 'lucide-react';

interface CategoryGridProps {
  categories: Category[];
  onSelect: (slug: string) => void;
}

const CATEGORY_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1533089859736-229f379058b7?q=80&w=500',
  'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=500',
  'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=500',
  'https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=500',
  'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=500',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=500'
];

export function CategoryGrid({ categories, onSelect }: CategoryGridProps) {
  if (categories.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto pt-6">
      {categories.map((cat, i) => {
        const imageSrc = cat.image_url || CATEGORY_FALLBACK_IMAGES[i % CATEGORY_FALLBACK_IMAGES.length];
        return (
          <div 
            key={cat.id} 
            onClick={() => onSelect(cat.slug)}
            className="w-full flex flex-col bg-[#1A1A1A] rounded-[24px] overflow-hidden cursor-pointer hover:scale-105 transition-all shadow-xl group relative"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(cat.slug);
              }
            }}
            aria-label={`View ${cat.name} category`}
          >
            <div className="w-full aspect-[4/3] overflow-hidden">
              <img 
                src={imageSrc}
                alt={cat.name} 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-110 duration-500"
                loading="lazy"
              />
            </div>
            <div className="w-full bg-[#FFB846] py-3 px-5 flex items-center justify-between">
              <span className="text-black font-bold text-sm md:text-base">
                {cat.name}
              </span>
              <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center shrink-0">
                <ArrowRight size={16} className="text-[#FFB846]" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
