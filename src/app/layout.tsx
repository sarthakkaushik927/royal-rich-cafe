import './globals.css';
import type { ReactNode } from 'react';
import { AppProviders } from './providers';
import { Metadata } from 'next';

const brand = process.env.NEXT_PUBLIC_BRAND || 'Royal Cafe';
const location = process.env.NEXT_PUBLIC_LOCATION || '123 Luxury Boulevard, Chanakyapuri, New Delhi';
const phone = process.env.NEXT_PUBLIC_PHONE || '+91 11 4987 6543';

const restaurantJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: brand,
  image: 'https://royalcafe.com/images/hero.jpg',
  telephone: phone,
  address: { 
    '@type': 'PostalAddress', 
    streetAddress: '123 Luxury Boulevard',
    addressLocality: 'Chanakyapuri',
    addressRegion: 'New Delhi',
    postalCode: '110021',
    addressCountry: 'IN'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 28.5961,
    longitude: 77.1887
  },
  priceRange: '$$$',
  servesCuisine: ['Fine Dining', 'International', 'Indian'],
  acceptsReservations: 'True',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '11:00',
      closes: '23:00'
    }
  ],
  description: `${brand} — luxury dining experience in New Delhi. High-end cuisine, elegant ambiance, and impeccable service.`,
};

export const metadata: Metadata = {
  title: { default: `${brand} | Luxury Fine Dining in New Delhi`, template: `%s | ${brand}` },
  description: `Experience the epitome of luxury dining at ${brand} in Chanakyapuri, New Delhi. Discover our exquisite international cuisine and reserve your table today.`,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://royalcafe.com'),
  alternates: { canonical: '/' },
  applicationName: brand,
  authors: [{ name: brand, url: 'https://royalcafe.com' }],
  keywords: ['luxury dining', 'fine dining New Delhi', 'Royal Cafe', 'best restaurant Chanakyapuri', 'high-end cuisine', 'premium restaurant'],
  openGraph: { 
    title: `${brand} | Luxury Fine Dining`, 
    description: `Experience the epitome of luxury dining at ${brand} in Chanakyapuri, New Delhi.`, 
    type: 'website',
    locale: 'en_IN',
    siteName: brand,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${brand} | Luxury Fine Dining`,
    description: `Experience the epitome of luxury dining at ${brand}.`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'food',
};

import { LayoutClientEffects } from '@/components/common/LayoutClientEffects';
import { AppLayout } from '@/components/layout/AppLayout';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }} />
      </head>
      <body className="min-h-screen bg-[#161718] text-[#F7F3EC] font-sans antialiased">
        <AppProviders>
          <LayoutClientEffects />
          <AppLayout>
            {children}
          </AppLayout>
        </AppProviders>
      </body>
    </html>
  );
}
