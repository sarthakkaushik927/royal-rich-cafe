"use client";

import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#110c08] border-t border-[#31231a] py-8 text-[#f5f1e7] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand Info */}
        <div className="flex-shrink-0 flex items-center justify-center md:justify-start">
          <Link href="/" className="flex flex-col items-center md:items-start">
            <span className="font-serif text-2xl text-white tracking-widest uppercase">
              Royal Rich
            </span>
            <span className="text-[8px] uppercase tracking-[0.3em] text-luxury-gold -mt-1">
              Restaurant & Cafe
            </span>
          </Link>
        </div>

        {/* Contact Details */}
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-12 text-xs text-gray-400 tracking-wider">
          <div className="flex items-center space-x-2">
            <MapPin size={14} className="text-luxury-gold" />
            <span>1234 OAK STREET, SAN FRANCISCO, CA 94107</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone size={14} className="text-luxury-gold" />
            <span>(415) 555-1234</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail size={14} className="text-luxury-gold" />
            <span>INFO@ROYALRICH.COM</span>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-4 text-xs font-semibold tracking-widest uppercase">
          <span className="text-gray-500">FOLLOW US</span>
          <a href="#" className="text-luxury-gold hover:text-white transition">
            INSTAGRAM
          </a>
          <a href="#" className="text-luxury-gold hover:text-white transition">
            FACEBOOK
          </a>
          <a href="#" className="text-luxury-gold hover:text-white transition">
            TWITTER
          </a>
        </div>

      </div>
    </footer>
  );
}
