"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LeafBranch } from '@/components/ui/Doodles';
import { useAllFoodItems } from '@/hooks/useFoodData';
import { reviews } from '@/data/content';
import { QRScanner } from '@/components/ui/QRScanner';
import { QrCode } from 'lucide-react';

export function HomeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: menu = [] } = useAllFoodItems();
  
  const tableNum = searchParams.get('table');
  const tableSuffix = tableNum ? `?table=${tableNum}` : '';

  // Get 4 items for the Chef's favorites (mocking signature by just taking first 4)
  const signatures = menu.slice(0, 4);

  // Hero Slider
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const sliderImages = [
    '/slider/slide1.png',
    '/slider/slide2.png',
    '/slider/slide3.png',
    '/slider/slide4.png',
    '/slider/slide5.jpg'
  ];

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, [sliderImages.length]);

  return (
    <div className="font-serif">
      {showQRScanner && <QRScanner onClose={() => setShowQRScanner(false)} />}
      
      {/* 1. HERO SECTION (Full Screen Landscape) */}
      <section className="relative min-h-screen flex items-center justify-center bg-luxury-bg text-white overflow-hidden border-b-8 border-luxury-dark">
        {/* Background Image Slider */}
        <div className="absolute inset-0 z-0">
          {sliderImages.map((src, index) => (
            <img 
              key={index}
              src={src} 
              alt={`Hero Slide ${index + 1}`} 
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-2000 ease-in-out ${
                index === currentSlide ? 'opacity-100 scale-105 z-10' : 'opacity-0 scale-100 z-0'
              }`}
              style={{ transitionProperty: 'opacity, transform', transitionDuration: '2s, 10s' }}
            />
          ))}
          {/* Dark Overlay for Text Legibility */}
          <div className="absolute inset-0 bg-black/40 bg-linear-to-r from-luxury-bg/90 via-black/40 to-transparent z-20"></div>
        </div>

        {/* Foreground Content */}
        <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-start text-left mt-20">
          <div className="space-y-8 flex flex-col items-start lg:w-2/3">
            
            <div className="flex items-center space-x-4 animate-fade-up">
              <div className="w-16 h-px bg-luxury-gold"></div>
              <h3 className="text-luxury-gold text-3xl sm:text-4xl italic font-serif">Welcome To Royal Rich</h3>
              <div className="w-16 h-px bg-luxury-gold"></div>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-[5rem] font-bold tracking-wider leading-[1.1] uppercase text-white animate-fade-up-delay-1 font-serif" style={{textShadow: "0 4px 20px rgba(0,0,0,0.5)"}}>
              GOOD FOOD.<br />GOOD MOOD.
            </h1>
            
            <p className="text-[#d8cebe] text-lg sm:text-xl max-w-2xl leading-relaxed font-sans font-light tracking-wide mt-6 animate-fade-up-delay-2 drop-shadow-lg">
              Where authentic vegetarian flavors meet modern elegance. Every dish is crafted with passion, served with grace, and made with absolute love.
            </p>
            
            <div className="pt-10 animate-fade-up-delay-3 flex flex-col sm:flex-row gap-4 w-full">
              <Link 
                href={`/menu${tableSuffix}`} 
                className="group relative inline-flex items-center justify-center px-12 py-4 border border-luxury-gold/60 bg-black/20 backdrop-blur-md text-[#e4c295] font-sans font-light text-sm tracking-[0.3em] uppercase transition-all duration-700 hover:bg-luxury-gold hover:border-luxury-gold hover:text-luxury-bg hover:shadow-gold overflow-hidden rounded-sm text-center"
              >
                <span className="relative z-10 flex items-center">
                  EXPLORE MENU 
                  <span className="ml-4 font-serif italic text-lg transition-transform duration-500 group-hover:translate-x-2">&rarr;</span>
                </span>
              </Link>
              
              <button 
                onClick={() => setShowQRScanner(true)}
                className="group relative inline-flex items-center justify-center px-10 py-4 border border-luxury-gold/40 bg-transparent text-[#e4c295] font-sans font-light text-sm tracking-[0.2em] uppercase transition-all duration-500 hover:bg-luxury-gold/10 hover:border-luxury-gold hover:text-white rounded-sm"
              >
                <QrCode className="mr-3" size={18} />
                SCAN TABLE QR
              </button>
            </div>
          </div>
        </div>

        {/* Slider Dots */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
          {sliderImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-500 ${
                index === currentSlide ? 'bg-luxury-gold w-8' : 'bg-white/50 hover:bg-white/90 w-2'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 2. OUR STORY SECTION (Light Cream) */}
      <section className="py-24 bg-[#f8f6f0] text-luxury-bg relative overflow-hidden">
        {/* Uploaded Leaf Background Images */}
        <div className="absolute top-0 left-0 pointer-events-none w-[400px] md:w-[500px] h-auto mix-blend-multiply opacity-80 z-0">
          <img src="/leaf-left.png" alt="Leaf Branch" className="w-full h-full object-contain origin-top-left scale-110" />
        </div>
        <div className="absolute top-0 right-0 pointer-events-none w-[300px] md:w-[400px] h-auto mix-blend-multiply opacity-70 z-0">
          <img src="/leaf-right.png" alt="Scattered Leaves" className="w-full h-full object-contain" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="relative">
            <div className="border border-luxury-gold p-2">
              <img 
                src="/food/interior.png" 
                alt="Restaurant Interior" 
                className="w-full h-[500px] object-cover"
              />
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <h3 className="text-luxury-gold text-3xl italic font-serif">Our Story</h3>
              <div className="w-16 h-px bg-luxury-gold"></div>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold uppercase tracking-widest leading-tight">
              CRAFTED WITH <br/> PASSION & TRADITION
            </h2>
            <p className="text-gray-700 text-base leading-relaxed font-sans font-light max-w-md pt-4">
              At Royal Rich, we celebrate the true essence of luxury vegetarian cuisine. Using the freshest ingredients and time-honored recipes, we bring people together over unforgettable meals.
            </p>
            <div className="pt-6">
              <Link 
                href="/about" 
                className="inline-block px-8 py-3 border border-luxury-gold text-luxury-gold font-bold text-xs tracking-[0.2em] uppercase hover:bg-luxury-gold hover:text-white transition duration-300"
              >
                ABOUT US
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SAVOR THE BEST SECTION (Dark Brown) */}
      <section className="py-24 bg-luxury-bg text-white border-y-8 border-luxury-dark relative overflow-hidden">
        {/* Dark Leaves Doodles */}
        <div className="absolute -left-20 top-1/2 -translate-y-1/2 text-luxury-gold opacity-5 pointer-events-none w-96 h-96 transform -rotate-45">
          <LeafBranch className="w-full h-full" />
        </div>
        <div className="absolute -right-20 top-1/4 text-luxury-gold opacity-5 pointer-events-none w-80 h-80 transform rotate-135">
          <LeafBranch className="w-full h-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-4 mb-16">
            <h3 className="text-luxury-gold text-2xl italic font-serif">Chef's Favorites</h3>
            <h2 className="text-4xl sm:text-5xl font-bold uppercase tracking-widest">SAVOR THE BEST</h2>
            <div className="w-24 h-px bg-luxury-gold mx-auto mt-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
            {signatures.map((dish) => (
              <div key={dish.id} className="group cursor-pointer flex flex-col items-center" onClick={() => router.push(`/menu${tableSuffix}`)}>
                {/* Arch shaped image container */}
                <div className="relative w-full aspect-4/5 rounded-t-[10rem] overflow-hidden mb-8 border-[0.5px] border-[#3a2c20] group-hover:border-luxury-gold transition-all duration-700 shadow-xl">
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors duration-700 z-10"></div>
                  <img src={dish.image_url || '/placeholder.jpg'} alt={dish.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" />
                </div>
                {/* Text Content */}
                <h3 className="text-xl sm:text-2xl font-bold mb-4 text-[#e4c295] group-hover:text-white transition-colors duration-300 text-center font-serif">{dish.name}</h3>
                <div className="w-8 h-px bg-luxury-gold/50 mb-4 group-hover:w-16 transition-all duration-500"></div>
                <p className="text-sm text-gray-400 font-sans font-light px-2 mb-6 text-center line-clamp-2 leading-relaxed h-10">{dish.description}</p>
                <p className="text-xl text-luxury-gold font-medium tracking-widest">₹{dish.prices?.[0]?.price ?? 0}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link 
              href={`/menu${tableSuffix}`} 
              className="inline-block px-10 py-4 border border-luxury-gold text-luxury-gold font-bold text-xs tracking-[0.2em] uppercase hover:bg-luxury-gold hover:text-luxury-bg transition duration-300"
            >
              VIEW FULL MENU &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 4. REVIEWS SECTION (Light Cream) */}
      <section className="py-24 bg-[#f8f6f0] text-luxury-bg relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="space-y-4">
            <h3 className="text-luxury-gold text-3xl italic font-serif">Guest Book</h3>
            <h2 className="text-4xl sm:text-5xl font-bold uppercase tracking-widest">WHAT THEY SAY</h2>
            <div className="w-24 h-px bg-luxury-gold mx-auto mt-6"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review, idx) => (
              <div key={idx} className="border border-[#e0d6c8] bg-white p-10 flex flex-col items-center text-center shadow-sm relative mt-6">
                <div className="absolute -top-10">
                  <img src={typeof review.avatar === 'string' ? review.avatar : (review.avatar as any)?.src || ''} alt={review.name} className="w-20 h-20 rounded-full border-2 border-luxury-gold object-cover" />
                </div>
                <div className="flex text-luxury-gold mt-6 mb-4">
                  {[...Array(review.rating)].map((_, i) => <span key={i}>★</span>)}
                </div>
                <p className="text-gray-600 font-sans font-light italic leading-relaxed mb-6">"{review.text}"</p>
                <h4 className="font-bold uppercase tracking-widest text-sm text-luxury-bg">{review.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. RESERVATION SECTION (Split Layout on Light Cream) */}
      <section className="py-20 bg-[#f8f6f0] text-luxury-bg border-t border-[#e0d6c8] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left space-y-6 relative">
            {/* Background decoration doodle */}
            <div className="absolute -left-16 -bottom-10 text-luxury-bg opacity-10 pointer-events-none w-72 h-72 transform -rotate-60">
              <LeafBranch className="w-full h-full" />
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-bold uppercase tracking-widest leading-tight relative z-10">
              GOOD FOOD DESERVES <br /> GREAT COMPANY
            </h2>
            <p className="text-gray-700 font-sans font-light max-w-sm mx-auto lg:mx-0 relative z-10">
              Book your table now and make every moment delicious. Experience the Royal Rich standard of dining.
            </p>
          </div>
          
          <div className="bg-white border border-[#e0d6c8] p-10 shadow-sm relative z-10">
            <h3 className="text-2xl font-bold uppercase tracking-widest mb-8 text-center text-luxury-bg">RESERVE YOUR TABLE</h3>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); router.push(`/reservations${tableSuffix}`); }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="FULL NAME" className="border border-[#e0d6c8] bg-[#f8f6f0] p-3 text-xs font-sans tracking-widest uppercase outline-none focus:border-luxury-gold w-full" />
                <input type="text" placeholder="PHONE NUMBER" className="border border-[#e0d6c8] bg-[#f8f6f0] p-3 text-xs font-sans tracking-widest uppercase outline-none focus:border-luxury-gold w-full" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="date" className="border border-[#e0d6c8] bg-[#f8f6f0] p-3 text-xs font-sans tracking-widest uppercase outline-none focus:border-luxury-gold w-full text-gray-500" />
                <select className="border border-[#e0d6c8] bg-[#f8f6f0] p-3 text-xs font-sans tracking-widest uppercase outline-none focus:border-luxury-gold w-full text-gray-500">
                  <option>TIME</option>
                  <option>18:00</option>
                  <option>19:00</option>
                  <option>20:00</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <select className="border border-[#e0d6c8] bg-[#f8f6f0] p-3 text-xs font-sans tracking-widest uppercase outline-none focus:border-luxury-gold w-full text-gray-500">
                  <option>GUESTS</option>
                  <option>2 People</option>
                  <option>4 People</option>
                  <option>6+ People</option>
                </select>
                <button type="submit" className="bg-luxury-bg text-luxury-gold font-bold text-xs tracking-[0.2em] uppercase py-3 px-6 hover:bg-[#31231a] transition duration-300 w-full">
                  BOOK NOW
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

    </div>
  );
}
