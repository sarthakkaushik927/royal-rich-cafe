"use client";
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { MobileBottomNav } from '@/components/home/MobileBottomNav';
import { SplashScreen } from '@/components/common/SplashScreen';
import { Footer } from './Footer';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Don't show global nav on admin, chef, auth, or standalone pages
  const isExcluded = pathname?.startsWith('/admin') || pathname?.startsWith('/chef') || pathname?.startsWith('/auth');

  if (isExcluded) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen pb-[80px] md:pb-0">
      <SplashScreen />
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
