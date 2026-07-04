import { Metadata } from 'next';
import { MobileHeader } from '@/components/home/MobileHeader';
import { SearchBar } from '@/components/home/SearchBar';
import { AppHeroBanner } from '@/components/home/AppHeroBanner';
import { CategoryCarousel } from '@/components/home/CategoryCarousel';
import { RecommendedCarousel } from '@/components/home/RecommendedCarousel';

export const metadata: Metadata = {
  title: 'Royal Rich Café | A Luxury Culinary Experience',
  description: 'Experience unparalleled luxury dining at Royal Rich Café.',
};

export default function HomePage() {
  return (
    <div className="bg-[#161718] min-h-screen text-white font-sans selection:bg-[#FFB846]/30 relative overflow-x-hidden">
      {/* Main Content Area */}
      <main className="w-full relative pb-32 md:pb-0">
        <MobileHeader />
        <SearchBar />
        <AppHeroBanner />
        <CategoryCarousel />
        <RecommendedCarousel />
      </main>
    </div>
  );
}
