"use client";

import React, { useState } from 'react';
import { Clock, User, ArrowRight, X } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  author: string;
  image: string;
}

const blogs: BlogPost[] = [
  {
    id: 'b1',
    title: 'The Art of Burrata: Understanding Artisanal Italian Cheese',
    excerpt: 'Deep-dive into the meticulous crafting processes and strict culinary grading that makes Italian burrata the pinnacle of world gastronomy.',
    content: 'Our artisanal burrata is crafted in the warm climate of southern Italy. Known for its gorgeous porcelain-white color and dense, creamy center, this cheese is a masterpiece. In this post, we explain why the cream melts at room temperature, creating that unforgettable "melt-in-your-mouth" feeling, and how our executive chef pairs it perfectly with heirloom tomatoes.',
    category: 'Recipes & Guides',
    date: '2026-06-25',
    author: 'Chef Alexander Thorne',
    image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'b2',
    title: 'Perigord Truffles: Searching for the Black Diamonds',
    excerpt: 'Explore the fascinating world of truffle hunting in the oak forests of France and how these aromatic fungi elevate modern fine-dining.',
    content: 'Known as the "black diamond of the kitchen," the Tuber melanosporum or Perigord black truffle is one of the most luxury ingredients globally. Sourced from the roots of oak and hazelnut trees in southern France, these truffles are harvested in mid-winter using specially trained dogs. Their aroma is complex, earthy, sweet, and slightly musky. At Royal Rich, we shave fresh truffles at your table to release their volatile aromatic oils directly onto warm risotto, where the temperature activates their full potential.',
    category: 'Fine Dining Culture',
    date: '2026-07-02',
    author: 'Sommelier Evelyn Rose',
    image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&q=80&w=600'
  }
];

export default function BlogsPage() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  return (
    <div className="pt-32 pb-24 bg-luxury-bg text-white min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs uppercase tracking-[0.3em] text-luxury-gold font-sans font-medium block">
            The Royal Archives
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl tracking-tight">
            Culinary <span className="gold-text-gradient italic">Journals & Philosophy</span>
          </h1>
          <p className="max-w-md mx-auto text-luxury-textGrey text-xs sm:text-sm uppercase tracking-wider font-light">
            Insights into high gastronomy, wine selections, and the heritage of Michelin-starred culture.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogs.map((post) => (
            <div 
              key={post.id}
              className="glass-card glass-card-hover rounded overflow-hidden flex flex-col justify-between group border-luxury-gold/5"
            >
              <div>
                {/* Media frame */}
                <div className="relative h-[260px] overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover filter brightness-80 group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-luxury-bg/95 via-transparent to-transparent"></div>
                  <span className="absolute bottom-4 left-4 bg-luxury-gold text-luxury-bg text-[9px] font-bold uppercase tracking-[0.25em] px-3 py-1 rounded">
                    {post.category}
                  </span>
                </div>

                {/* Content info */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center space-x-4 text-[10px] text-luxury-textGrey/60 uppercase tracking-widest">
                    <span className="flex items-center space-x-1">
                      <Clock size={12} />
                      <span>{post.date}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <User size={12} />
                      <span>{post.author}</span>
                    </span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-wide text-luxury-accent group-hover:text-luxury-gold transition duration-300">
                    {post.title}
                  </h3>
                  
                  <p className="text-luxury-textGrey text-xs sm:text-sm font-light leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              {/* Read button */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => setSelectedPost(post)}
                  className="text-xs uppercase tracking-widest text-luxury-gold hover:text-luxury-accent font-semibold flex items-center space-x-2 group/btn transition cursor-pointer"
                >
                  <span>Read Full Article</span>
                  <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ARTICLE READER MODAL */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="bg-luxury-dark border border-luxury-gold/25 w-full max-w-3xl rounded-xl overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[85vh]">
            
            {/* Header image frame */}
            <div className="h-48 sm:h-64 relative overflow-hidden flex-shrink-0">
              <img 
                src={selectedPost.image} 
                alt={selectedPost.title} 
                className="w-full h-full object-cover filter brightness-75"
              />
              <div className="absolute inset-0 bg-linear-to-t from-luxury-dark to-transparent"></div>
              
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 bg-black/60 p-2 text-white hover:text-luxury-gold rounded transition cursor-pointer"
              >
                <X size={20} />
              </button>
              
              <div className="absolute bottom-4 left-6">
                <span className="bg-luxury-gold text-luxury-bg text-[9px] font-bold uppercase tracking-[0.25em] px-2.5 py-0.5 rounded block w-max mb-2">
                  {selectedPost.category}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-white leading-tight">
                  {selectedPost.title}
                </h2>
              </div>
            </div>

            {/* Scrolling Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-sm leading-relaxed text-luxury-accent/90 pr-3 scrollbar-thin">
              <div className="flex flex-wrap gap-2 items-center text-[10px] text-luxury-textGrey/60 uppercase tracking-widest border-b border-luxury-gold/10 pb-4">
                <span>By {selectedPost.author}</span>
                <span className="hidden sm:inline">•</span>
                <span>Published {selectedPost.date}</span>
                <span className="hidden sm:inline">•</span>
                <span>5 Min Read</span>
              </div>

              {/* Paragraphed contents */}
              <div className="space-y-4 font-light text-luxury-textGrey/90">
                {selectedPost.content.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-black/60 p-4 border-t border-luxury-gold/10 flex justify-between items-center text-xs">
              <span className="text-luxury-warmGold font-semibold">Celebrate Life with Royal Dining</span>
              <button
                onClick={() => setSelectedPost(null)}
                className="px-4 py-2 border border-luxury-gold/20 hover:border-luxury-gold text-luxury-accent rounded uppercase tracking-wider text-[10px] transition cursor-pointer"
              >
                Close Archive
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
