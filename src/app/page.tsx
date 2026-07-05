import { Metadata } from 'next';
import { Suspense } from 'react';
import { HomeClient } from '@/components/home/HomeClient';

export const metadata: Metadata = {
  title: 'Royal Rich Café | A Luxury Culinary Experience',
  description: 'Experience unparalleled luxury dining at Royal Rich Café.',
};

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-luxury-bg" />}>
      <HomeClient />
    </Suspense>
  );
}
