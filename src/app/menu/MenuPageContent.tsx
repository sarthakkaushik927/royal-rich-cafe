"use client";

import React, { useState, useMemo, use } from 'react';
import { Search, Flame, Clock, ShoppingBag, Eye, HelpCircle } from 'lucide-react';
import { useCategories, useAllFoodItems } from '@/hooks/useFoodData';
import { useCartStore } from '@/hooks/useCartStore';
import type { FoodItemWithPrices, CartItem } from '@/lib/types';
import { useRouter, useParams, useSearchParams } from 'next/navigation';

export default function Page() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#111111] pt-32 pb-16 px-4 flex justify-center"><div className="w-8 h-8 border-4 border-[#D4A24C] border-t-transparent rounded-full animate-spin" /></div>}>
      <MenuPage />
    </React.Suspense>
  );
}

function MenuPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const categoryParams = params?.categorySlug;
  const urlCategorySlug = Array.isArray(categoryParams) ? categoryParams[0] : (categoryParams ?? null);
  const initialSearch = searchParams?.get('search') ?? '';

  const { data: categories = [], isLoading: catLoading } = useCategories();
  const { data: allItems = [], isLoading: itemsLoading } = useAllFoodItems();
  const addItemToCart = useCartStore(state => state.addItem);
  const router = useRouter();

  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(urlCategorySlug);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedItem, setSelectedItem] = useState<FoodItemWithPrices | null>(null);

  // Customization choices
  const [quantity, setQuantity] = useState(1);
  const [customNotes, setCustomNotes] = useState('');
  const [prepStyle, setPrepStyle] = useState('Medium Rare');
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('small');

  const filteredItems = useMemo(() => {
    let items = allItems;
    if (activeCategorySlug) {
      const activeCat = categories.find((c) => c.slug === activeCategorySlug);
      if (activeCat) {
        items = items.filter((i) => i.category_id === activeCat.id);
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.description?.toLowerCase().includes(q) ?? false)
      );
    }
    return items.filter((i) => i.is_available);
  }, [allItems, categories, activeCategorySlug, searchQuery]);

  const handleOpenDetailModal = (item: FoodItemWithPrices) => {
    setSelectedItem(item);
    setQuantity(1);
    setCustomNotes('');
    const hasSmall = item.prices.some(p => p.size === 'small');
    setSelectedSize(hasSmall ? 'small' : item.prices[0]?.size || 'small');
    setPrepStyle('Standard');
  };

  const handleConfirmAdd = () => {
    if (selectedItem) {
      const priceObj = selectedItem.prices.find(p => p.size === selectedSize) || selectedItem.prices[0];
      const unitPrice = priceObj ? priceObj.price : 0;
      
      const customizationStr = `${prepStyle}${customNotes ? ` (${customNotes})` : ''}`;
      
      const cartItem: CartItem = {
        food_item_id: selectedItem.id,
        name: selectedItem.name,
        description: customizationStr,
        image_url: selectedItem.image_url,
        size: selectedSize,
        quantity: quantity,
        unit_price: unitPrice
      };
      
      addItemToCart(cartItem);
      setSelectedItem(null);
    }
  };

  const handleQuickAdd = (item: FoodItemWithPrices) => {
    const priceObj = item.prices.find(p => p.size === 'small') || item.prices[0];
    const unitPrice = priceObj ? priceObj.price : 0;
    
    addItemToCart({
      food_item_id: item.id,
      name: item.name,
      description: '',
      image_url: item.image_url,
      size: priceObj?.size || 'small',
      quantity: 1,
      unit_price: unitPrice
    });
  };

  return (
    <div className="pt-32 pb-24 bg-luxury-bg text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs uppercase tracking-[0.3em] text-luxury-gold font-sans font-medium block">
            Michelin Star Catalog
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl tracking-tight">
            The Royal <span className="gold-text-gradient italic">Gastronomical Menu</span>
          </h1>
          <p className="max-w-xl mx-auto text-luxury-textGrey text-xs sm:text-sm uppercase tracking-wider font-light">
            Every dish is handcrafted by our master chefs using organically farmed and globally sourced ingredients.
          </p>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-12 bg-luxury-dark/40 border border-luxury-gold/10 p-6 rounded-xl glass-card">
          
          {/* Search Box */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-gold/50" size={18} />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/60 border border-luxury-gold/20 text-white placeholder-luxury-textGrey/50 pl-11 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-luxury-gold transition duration-300"
            />
          </div>

          {/* Category Selector Tabs */}
          <div className="flex flex-wrap justify-center gap-2 w-full lg:w-auto">
            <button
              onClick={() => setActiveCategorySlug(null)}
              className={`px-4 py-2 rounded text-xs uppercase tracking-widest transition duration-300 font-sans ${
                !activeCategorySlug
                  ? 'bg-luxury-gold text-luxury-bg font-semibold'
                  : 'bg-luxury-card hover:bg-luxury-gold/10 text-luxury-accent/80 border border-luxury-gold/10'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategorySlug(cat.slug)}
                className={`px-4 py-2 rounded text-xs uppercase tracking-widest transition duration-300 font-sans ${
                  activeCategorySlug === cat.slug
                    ? 'bg-luxury-gold text-luxury-bg font-semibold'
                    : 'bg-luxury-card hover:bg-luxury-gold/10 text-luxury-accent/80 border border-luxury-gold/10'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Cards Grid */}
        {itemsLoading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {Array.from({ length: 6 }).map((_, i) => (
               <div key={i} className="h-96 bg-luxury-dark/50 animate-pulse rounded border border-luxury-gold/10"></div>
             ))}
           </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-luxury-dark/20 border border-luxury-gold/15 rounded-xl mt-8">
            <HelpCircle size={48} className="text-luxury-gold/40 mx-auto mb-4" />
            <h3 className="font-serif text-2xl text-luxury-accent">No Delicacies Found</h3>
            <p className="text-luxury-textGrey text-sm mt-2">Adjust your filters or query and search again.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => {
              const priceSmall = item.prices.find(p => p.size === 'small')?.price;
              const priceDisplay = priceSmall ?? item.prices[0]?.price ?? 0;
              const isBestSeller = item.is_recommended;
              
              return (
                <div
                  key={item.id}
                  className="glass-card glass-card-hover rounded overflow-hidden flex flex-col justify-between group border-luxury-gold/5"
                >
                  {/* Media Layer */}
                  <div className="relative h-[240px] overflow-hidden">
                    <img
                      src={item.image_url || '/placeholder.jpg'}
                      alt={item.name}
                      className="w-full h-full object-cover filter brightness-[0.85] group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-luxury-bg/90 via-transparent to-transparent"></div>
                    
                    {isBestSeller && (
                      <span className="absolute top-4 right-4 bg-luxury-gold text-luxury-bg text-[8px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded shadow-lg">
                        Best Seller
                      </span>
                    )}
                  </div>

                  {/* Info Layer */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-serif text-lg font-bold tracking-wide text-luxury-accent">
                          {item.name}
                        </h3>
                        <span className="font-serif text-base font-bold text-luxury-gold">â‚¹{priceDisplay}</span>
                      </div>
                      <p className="text-luxury-textGrey text-xs leading-relaxed font-light line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    {/* Preparation metrics */}
                    <div className="flex space-x-4 text-[10px] uppercase tracking-wider text-luxury-warmGold border-t border-luxury-gold/5 pt-4">
                      <div className="flex items-center space-x-1">
                        <Clock size={12} />
                        <span>15-20 min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Flame size={12} />
                        <span>Hot</span>
                      </div>
                    </div>

                    {/* Purchase / Inspect triggers */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => handleOpenDetailModal(item)}
                        className="py-2 px-3 border border-luxury-gold/20 hover:border-luxury-gold text-luxury-accent hover:text-luxury-gold text-[10px] uppercase tracking-widest font-sans rounded transition duration-300 flex items-center justify-center space-x-1"
                      >
                        <Eye size={12} />
                        <span>Inspect</span>
                      </button>
                      <button
                        onClick={() => handleOpenDetailModal(item)}
                        className="py-2 px-3 bg-luxury-gold hover:opacity-90 text-luxury-bg font-sans font-bold text-[10px] uppercase tracking-widest rounded transition duration-300 flex items-center justify-center space-x-1"
                      >
                        <ShoppingBag size={12} />
                        <span>Order Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* DETAIL MODAL OVERLAY */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-luxury-dark border border-luxury-gold/25 w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl animate-slide-up flex flex-col md:flex-row max-h-[85dvh] overflow-y-auto relative">
            {/* Mobile Close Button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="md:hidden absolute top-3 right-3 z-10 bg-black/50 backdrop-blur p-2 rounded-full text-white hover:text-luxury-gold shadow-lg"
            >
              âœ•
            </button>
            
            {/* Left media */}
            <div className="w-full md:w-1/2 h-48 sm:h-64 md:h-auto relative shrink-0">
              <img
                src={selectedItem.image_url || '/placeholder.jpg'}
                alt={selectedItem.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-luxury-dark opacity-90 hidden md:block"></div>
            </div>

            {/* Right details content */}
            <div className="w-full md:w-1/2 p-6 pb-8 md:pb-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-serif text-2xl font-bold tracking-wide text-luxury-accent">
                      {selectedItem.name}
                    </h2>
                    <span className="text-[10px] text-luxury-gold font-sans uppercase tracking-widest font-semibold">
                      {categories.find(c => c.id === selectedItem.category_id)?.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="hidden md:block p-1 hover:bg-white/5 rounded text-luxury-accent/60 hover:text-luxury-gold transition"
                  >
                    âœ•
                  </button>
                </div>

                <p className="text-luxury-textGrey text-xs leading-relaxed font-light">
                  {selectedItem.description}
                </p>

                {/* Ingredients list */}
                <div className="space-y-1">
                  <span className="text-[10px] text-luxury-warmGold font-sans uppercase tracking-wider block font-bold">
                    Key Ingredients
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedItem.ingredients && selectedItem.ingredients.length > 0
                      ? selectedItem.ingredients
                      : ['Premium Quality', 'Organic Spices', 'Chef\'s Special']
                    ).map((ing, idx) => (
                      <span
                        key={idx}
                        className="bg-black/60 text-luxury-accent/80 border border-luxury-gold/10 px-2.5 py-0.5 rounded-full text-[9px] font-sans"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Size Options */}
                <div className="space-y-2 pt-2 border-t border-luxury-gold/10">
                  <span className="text-[10px] text-luxury-warmGold font-sans uppercase tracking-wider block font-bold">
                    Portion Size
                  </span>
                  <div className="flex gap-2">
                    {selectedItem.prices.map((p) => (
                      <button
                        key={p.size}
                        onClick={() => setSelectedSize(p.size)}
                        className={`flex-1 py-2 text-xs uppercase tracking-widest rounded border transition ${
                          selectedSize === p.size
                            ? 'bg-luxury-gold/20 border-luxury-gold text-luxury-gold'
                            : 'bg-black/60 border-luxury-gold/20 text-luxury-accent/70 hover:border-luxury-gold/50'
                        }`}
                      >
                        {p.size} <span className="block mt-1 font-bold">â‚¹{p.price}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prep Customization options */}
                <div className="space-y-2 pt-2 border-t border-luxury-gold/10">
                  <span className="text-[10px] text-luxury-warmGold font-sans uppercase tracking-wider block font-bold">
                    Preparation Preferences
                  </span>
                  {(selectedItem.preparation_options && selectedItem.preparation_options.length > 0) ? (
                    <select
                      value={prepStyle}
                      onChange={(e) => setPrepStyle(e.target.value)}
                      className="w-full bg-black/60 border border-luxury-gold/20 text-white px-3 py-2 rounded text-xs focus:outline-none focus:border-luxury-gold"
                    >
                      {selectedItem.preparation_options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : categories.find(c => c.id === selectedItem.category_id)?.slug === 'cafe' ? (
                    <select
                      value={prepStyle}
                      onChange={(e) => setPrepStyle(e.target.value)}
                      className="w-full bg-black/60 border border-luxury-gold/20 text-white px-3 py-2 rounded text-xs focus:outline-none focus:border-luxury-gold"
                    >
                      <option value="Whole Milk">Whole Milk</option>
                      <option value="Oat Milk">Oat Milk</option>
                      <option value="Almond Milk">Almond Milk</option>
                      <option value="Decaf Espresso">Decaf Espresso</option>
                    </select>
                  ) : (
                    <select
                      value={prepStyle}
                      onChange={(e) => setPrepStyle(e.target.value)}
                      className="w-full bg-black/60 border border-luxury-gold/20 text-white px-3 py-2 rounded text-xs focus:outline-none focus:border-luxury-gold"
                    >
                      <option value="Mild Spiced">Mild Spiced</option>
                      <option value="Medium Spiced">Medium Spiced</option>
                      <option value="Extra Spicy">Extra Spicy</option>
                      <option value="Jain (No Onion, No Garlic)">Jain (No Onion, No Garlic)</option>
                      <option value="Less Oil / Butter">Less Oil / Butter</option>
                    </select>
                  )}
                  
                  <input
                    type="text"
                    placeholder="Allergies or special instructions..."
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    className="w-full bg-black/60 border border-luxury-gold/20 text-white placeholder-luxury-textGrey/40 px-3 py-2 rounded text-xs focus:outline-none focus:border-luxury-gold transition duration-300 mt-2"
                  />
                </div>
              </div>

              {/* Order Actions footer inside modal */}
              <div className="border-t border-luxury-gold/10 pt-4 flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-serif text-lg font-bold text-luxury-gold">
                    â‚¹{(selectedItem.prices.find(p => p.size === selectedSize)?.price || 0) * quantity}
                  </span>
                  
                  {/* Quantity selector */}
                  <div className="flex items-center border border-luxury-gold/25 rounded bg-black/40 text-sm">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 text-luxury-accent/60 hover:text-luxury-gold transition"
                    >
                      -
                    </button>
                    <span className="px-3 font-semibold text-luxury-accent">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1 text-luxury-accent/60 hover:text-luxury-gold transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleConfirmAdd}
                  className="w-full py-3 bg-luxury-gold hover:opacity-90 text-luxury-bg font-sans font-bold text-xs uppercase tracking-widest rounded transition duration-300 flex items-center justify-center space-x-2"
                >
                  <ShoppingBag size={14} />
                  <span>Confirm Addition</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
