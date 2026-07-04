"use client";
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem, FoodSize } from '@/lib/types';

interface CartItemCardProps {
  item: CartItem;
  updateQuantity: (id: string, size: FoodSize, qty: number) => void;
  removeItem: (id: string, size: FoodSize) => void;
}

export function CartItemCard({ item, updateQuantity, removeItem }: CartItemCardProps) {
  return (
    <div className="bg-[#2C2C2E] rounded-2xl flex gap-4 overflow-hidden border border-gray-700 h-32 relative group">
      <img src={item.image_url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=300&auto=format&fit=crop'} alt={item.name} className="w-32 h-full object-cover shrink-0" />
      <div className="py-3 pr-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-[15px] md:text-lg mb-0.5 line-clamp-1">{item.name}</h3>
          <p className="text-gray-400 text-xs md:text-sm line-clamp-2 leading-tight">
            {item.description || 'Delicious dish from our menu'}
          </p>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-bold text-[15px] md:text-lg">₹ {item.unit_price}</span>
          <div className="bg-[#fba93b] text-black rounded-full flex items-center px-1.5 py-1 gap-2.5 shadow-sm">
              <button onClick={() => updateQuantity(item.food_item_id, item.size, item.quantity - 1)} className="bg-black text-[#fba93b] rounded-full p-1 hover:bg-gray-800 transition-colors">
                <Minus size={12} strokeWidth={3} />
              </button>
              <span className="font-bold text-sm w-3 text-center">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.food_item_id, item.size, item.quantity + 1)} className="bg-black text-[#fba93b] rounded-full p-1 hover:bg-gray-800 transition-colors">
                <Plus size={12} strokeWidth={3} />
              </button>
          </div>
        </div>
      </div>
      <button 
        onClick={() => removeItem(item.food_item_id, item.size)}
        className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
