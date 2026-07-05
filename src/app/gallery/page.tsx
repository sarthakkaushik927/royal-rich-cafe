"use client";

import React, { useState } from 'react';
import { Eye, X, MoveHorizontal, Compass } from 'lucide-react';

interface GalleryItem {
  id: string;
  category: 'food' | 'ambiance' | 'pastry' | 'vault';
  url: string;
  title: string;
}

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'food' | 'ambiance' | 'pastry' | 'vault'>('all');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  
  // 360 Tour simulation state
  const [panPosition, setPanPosition] = useState(50); // % horizontal offset

  const galleryItems: GalleryItem[] = [
    { id: 'g1', category: 'food', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600', title: 'A5 Miyazaki Wagyu Searing' },
    { id: 'g2', category: 'ambiance', url: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=600', title: 'The Main Chandelier Dining Salon' },
    { id: 'g3', category: 'pastry', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600', title: 'Gold Chocolate Dome Pour' },
    { id: 'g4', category: 'vault', url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=600', title: 'Private Wine Collector Vault' },
    { id: 'g5', category: 'food', url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&q=80&w=600', title: 'Caviar Plating & Champagne Mignonette' },
    { id: 'g6', category: 'ambiance', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600', title: 'Fireplace Cozy Seating Booths' }
  ];

  const filteredItems = galleryItems.filter(
    item => activeFilter === 'all' || item.category === activeFilter
  );

  return (
    <div className="pt-32 pb-24 bg-luxury-bg text-white min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs uppercase tracking-[0.3em] text-luxury-gold font-sans font-medium block">
            Visual Craftsmanship
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl tracking-tight">
            The Royal <span className="gold-text-gradient italic">Galleria</span>
          </h1>
          <p className="max-w-md mx-auto text-luxury-textGrey text-xs sm:text-sm uppercase tracking-wider font-light">
            A window into our plating precision, luxury interior styling, and rare vintage selection.
          </p>
        </div>

        {/* 1. 360 PANORAMIC TOUR COMPONENT */}
        <div className="glass-card border border-luxury-gold/20 p-6 rounded-xl space-y-6 mb-16">
          <div className="flex flex-col sm:flex-row justify-between items-center border-b border-luxury-gold/10 pb-4 gap-2">
            <h3 className="font-serif text-lg text-luxury-gold uppercase tracking-wider flex items-center space-x-2">
              <Compass className="animate-spin text-luxury-gold" style={{ animationDuration: '8s' }} size={20} />
              <span>Interactive 360° Salon Panorama Tour</span>
            </h3>
            <span className="text-[10px] text-luxury-warmGold font-semibold">DRAG THE SLIDER TO ROTATE ROOM VIEW</span>
          </div>

          {/* Panoramic screen */}
          <div 
            className="w-full h-80 rounded-lg bg-cover bg-no-repeat border border-luxury-gold/10 relative overflow-hidden transition-all duration-300"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1600')",
              backgroundPositionX: `${panPosition}%`,
              backgroundPositionY: 'center'
            }}
          >
            {/* Dark glass label overlay */}
            <div className="absolute bottom-4 left-4 bg-black/75 px-4 py-2 border border-luxury-gold/20 rounded flex items-center space-x-2 text-xs">
              <MoveHorizontal size={14} className="text-luxury-gold animate-bounce" />
              <span>Table Placement: Grand Fireplace Salon Suite</span>
            </div>
          </div>

          {/* Slider input */}
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              value={panPosition}
              onChange={(e) => setPanPosition(Number(e.target.value))}
              className="w-full accent-luxury-gold bg-luxury-card h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[8px] uppercase tracking-widest text-luxury-textGrey/60 font-sans">
              <span>◄ East Wing (Garden View)</span>
              <span>Center Chandelier Area</span>
              <span>West Wing (Fireplace Room) ►</span>
            </div>
          </div>
        </div>

        {/* 2. MASONRY GRID GALLERY */}
        <div className="space-y-8">
          {/* Categories Tab bar */}
          <div className="flex flex-wrap justify-center gap-2 border-b border-luxury-gold/10 pb-6">
            {(['all', 'food', 'ambiance', 'pastry', 'vault'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded text-xs uppercase tracking-widest transition duration-300 font-sans ${
                  activeFilter === filter
                    ? 'bg-luxury-gold text-luxury-bg font-semibold'
                    : 'bg-luxury-card hover:bg-luxury-gold/10 text-luxury-accent/80 border border-luxury-gold/10'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div 
                key={item.id} 
                className="glass-card rounded overflow-hidden relative group cursor-pointer border-luxury-gold/5 h-80"
                onClick={() => setLightboxUrl(item.url)}
              >
                <img 
                  src={item.url} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-90 group-hover:brightness-75"
                />
                
                {/* Glow & details overlay on hover */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-linear-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="space-y-1">
                    <span className="text-[9px] text-luxury-gold font-sans uppercase tracking-[0.2em] font-semibold">
                      {item.category}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-luxury-accent">
                      {item.title}
                    </h3>
                  </div>
                  <Eye className="text-luxury-gold absolute top-4 right-4 animate-pulse" size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* LIGHTBOX OVERLAY */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-4xl w-full max-h-[85vh] flex flex-col items-center justify-center">
            
            <button
              onClick={() => setLightboxUrl(null)}
              className="fixed top-4 right-4 z-[110] text-white hover:text-luxury-gold bg-black/50 backdrop-blur p-2 rounded-full transition flex items-center justify-center shadow-lg"
            >
              <X size={24} />
            </button>
            
            <img 
              src={lightboxUrl} 
              alt="High resolution inspect" 
              className="max-w-full max-h-[75vh] object-contain rounded border border-luxury-gold/25 shadow-2xl"
            />
          </div>
        </div>
      )}

    </div>
  );
}
