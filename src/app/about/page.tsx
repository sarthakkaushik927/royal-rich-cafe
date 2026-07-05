"use client";

import React from 'react';
import { ShieldCheck, Compass, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="pt-32 pb-24 bg-luxury-bg text-white min-h-screen font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <span className="text-xs uppercase tracking-[0.3em] text-luxury-gold font-sans font-medium block">
            Our Legacy
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl tracking-tight">
            The Heritage of <span className="gold-text-gradient italic">Royal Dining</span>
          </h1>
          <p className="max-w-md mx-auto text-luxury-textGrey text-xs sm:text-sm uppercase tracking-wider font-light">
            An uncompromising search for perfection, served in an atmosphere of absolute luxury.
          </p>
        </div>

        {/* Section 1: Detailed Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-serif text-3xl sm:text-4xl text-luxury-accent">
              Our Journey to the <br />
              <span className="gold-text-gradient italic">Michelin Pinnacle</span>
            </h2>
            <p className="text-luxury-textGrey text-sm leading-relaxed font-light">
              Founded in 2012 by Culinary Master Alexander Thorne, Royal Rich Restaurant & Cafe was built on a single, uncompromising vision: to elevate dining into a sensory ritual. Alexander spent years studying with legendary French patissiers, Italian cheese artisans, and Japanese Wagyu breeders.
            </p>
            <p className="text-luxury-textGrey text-sm leading-relaxed font-light">
              By merging classical Escoffier preparation methodologies with modern culinary chemistry and palatial architecture, Royal Rich became an instant sanctuary for world leaders, gastronomes, and celebratory gatherings.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-luxury-gold/15 shadow-2xl h-80">
            <img 
              src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=800" 
              alt="Dining room" 
              className="w-full h-full object-cover filter brightness-[0.75]"
            />
          </div>
        </div>

        {/* Section 2: Values Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card border border-luxury-gold/10 p-6 rounded-xl space-y-4">
            <ShieldCheck className="text-luxury-gold" size={24} />
            <h3 className="font-serif text-lg text-luxury-accent font-bold uppercase tracking-wider">Pristine Sourcing</h3>
            <p className="text-luxury-textGrey text-xs leading-relaxed font-light">
              Every steak, herb, oyster, and wine bottle is certified. We only purchase ingredients from farms and estates that maintain sustainable, certified organic ecosystems.
            </p>
          </div>

          <div className="glass-card border border-luxury-gold/10 p-6 rounded-xl space-y-4">
            <Compass className="text-luxury-gold" size={24} />
            <h3 className="font-serif text-lg text-luxury-accent font-bold uppercase tracking-wider">Visual Symphony</h3>
            <p className="text-luxury-textGrey text-xs leading-relaxed font-light">
              Plating is an architectural exercise. Colors, textures, steam levels, and gold details are curated to create a visually striking structure on your table.
            </p>
          </div>

          <div className="glass-card border border-luxury-gold/10 p-6 rounded-xl space-y-4">
            <Sparkles className="text-luxury-gold" size={24} />
            <h3 className="font-serif text-lg text-luxury-accent font-bold uppercase tracking-wider">Personalized Hospitality</h3>
            <p className="text-luxury-textGrey text-xs leading-relaxed font-light">
              Through our Royal AI and visual seating allocation engine, every guest feels like nobility. Hostesses track dining history to suggest ideal seating, preferences, and custom menus.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
