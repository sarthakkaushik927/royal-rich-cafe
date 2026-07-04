import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Menu | Royal Rich Café',
  description: 'Explore the exquisite culinary offerings of Royal Rich Café. Discover a symphony of flavors crafted for luxury dining.',
  openGraph: {
    title: 'Our Menu | Royal Rich Café',
    description: 'Explore the exquisite culinary offerings of Royal Rich Café.',
  },
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
