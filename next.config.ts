import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow external image domains used in Supabase Storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
