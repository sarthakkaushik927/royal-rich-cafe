import './globals.css';
import type { ReactNode } from 'react';
import { AppProviders } from './providers';
import { Metadata } from 'next';

const brand = process.env.NEXT_PUBLIC_BRAND || 'Royal Rich Cafe';
const location = process.env.NEXT_PUBLIC_LOCATION || 'Aligarh Road, Opposite Industrial Area, Hathras, Uttar Pradesh 204101';
const phone = process.env.NEXT_PUBLIC_PHONE || '+91-7895130040';

const restaurantJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: brand,
  alternateName: ['Royal Rich Cafe and Lounge', 'Royal Rich Restaurant'],
  image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600',
  '@id': 'https://royalrichcafe.com',
  url: 'https://royalrichcafe.com',
  telephone: [phone, '+91-9837919377'],
  priceRange: '₹₹',
  menu: 'https://royalrichcafe.com/menu',
  address: { 
    '@type': 'PostalAddress', 
    streetAddress: 'Aligarh Road, Opposite Industrial Area',
    addressLocality: 'Hathras',
    addressRegion: 'Uttar Pradesh',
    postalCode: '204101',
    addressCountry: 'IN'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 27.5966, // Approx Hathras coords
    longitude: 78.0504
  },
  servesCuisine: ['North Indian', 'Chinese', 'Fast Food', 'Desserts', 'Vegetarian', 'Vegan'],
  acceptsReservations: 'True',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '11:00',
      closes: '23:30'
    }
  ],
  description: 'Experience the best vegetarian food at Royal Rich Cafe in Hathras. Enjoy our famous Dahi ke Shole, Shahi Paneer, and Veg Pizza in a classy, elegant ambience.',
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: 'Wheelchair-accessible seating', value: 'True' },
    { '@type': 'LocationFeatureSpecification', name: 'High chairs available', value: 'True' },
    { '@type': 'LocationFeatureSpecification', name: 'Indoor seating', value: 'True' }
  ],
  hasDeliveryMethod: ['DeliveryModeOwn', 'https://schema.org/OnDemand'],
  starRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.1',
    reviewCount: '298'
  }
};

const keywords = [
  'Royal Rich Cafe Hathras', 
  'Best vegetarian restaurant in Hathras', 
  'Restaurants on Aligarh Road Hathras', 
  'Top North Indian food Hathras',
  'Dine-in Hathras',
  'Swiggy delivery Hathras',
  'family restaurant near Industrial Area',
  'affordable cafes in Hathras',
  'Veg pizza Hathras'
];

export const metadata: Metadata = {
  title: { default: `${brand} | Best Vegetarian Restaurant in Hathras`, template: `%s | ${brand}` },
  description: 'Royal Rich Cafe in Hathras offers the best North Indian, Chinese, and Fast Food. Dine-in, Takeaway, or Swiggy Delivery. Open 11 AM - 11:30 PM daily.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://royalrichcafe.com'),
  alternates: { canonical: '/' },
  applicationName: brand,
  authors: [{ name: brand, url: 'https://royalrichcafe.com' }],
  keywords: keywords,
  openGraph: { 
    title: `${brand} | Best Vegetarian Restaurant in Hathras`, 
    description: `Royal Rich Cafe in Hathras offers the best North Indian, Chinese, and Fast Food.`, 
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
import { CursorGlow } from '@/components/ui/CursorGlow';
import { RoyalAI } from '@/components/RoyalAI';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }} />
      </head>
      <body className="min-h-screen bg-luxury-bg text-white font-sans antialiased overflow-x-hidden selection:bg-luxury-gold selection:text-black">
        <AppProviders>
          <LayoutClientEffects />
          <CursorGlow />
          <AppLayout>
            {children}
          </AppLayout>
          <RoyalAI />
        </AppProviders>
      </body>
    </html>
  );
}
