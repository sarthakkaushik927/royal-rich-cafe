"use client";
import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { MobileBottomNav } from '@/components/home/MobileBottomNav';
import { SplashScreen } from '@/components/common/SplashScreen';
import { Footer } from './Footer';
import { CartSidebar } from '@/components/cart/CartSidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Don't show global nav on chef, auth, or login pages
  const isExcluded = pathname === '/admin/login' || pathname?.startsWith('/chef') || pathname?.startsWith('/auth');

  if (isExcluded) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SplashScreen />
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      {/* <MobileBottomNav /> */}
      <CartSidebar />
    </div>
  );
}
