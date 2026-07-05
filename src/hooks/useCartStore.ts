"use client";
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, FoodSize } from '@/lib/types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (foodItemId: string, size: FoodSize) => void;
  updateQuantity: (foodItemId: string, size: FoodSize, quantity: number) => void;
  clearCart: () => void;
  totalAmount: () => number;
  totalItems: () => number;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

  addItem(incoming) {
    set((state) => {
      const existing = state.items.find(
        (i) => i.food_item_id === incoming.food_item_id && i.size === incoming.size
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.food_item_id === incoming.food_item_id && i.size === incoming.size
              ? { ...i, quantity: i.quantity + incoming.quantity }
              : i
          ),
          isOpen: true // auto open cart on add
        };
      }
      return { items: [...state.items, incoming], isOpen: true };
    });
  },

  removeItem(foodItemId, size) {
    set((state) => ({
      items: state.items.filter(
        (i) => !(i.food_item_id === foodItemId && i.size === size)
      ),
    }));
  },

  updateQuantity(foodItemId, size, quantity) {
    if (quantity <= 0) {
      get().removeItem(foodItemId, size);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.food_item_id === foodItemId && i.size === size ? { ...i, quantity } : i
      ),
    }));
  },

  clearCart() {
    set({ items: [] });
  },

  totalAmount() {
    return get().items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  },

  totalItems() {
    return get().items.reduce((sum, i) => sum + i.quantity, 0);
  },

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
}),
{
  name: 'royal-cafe-cart',
}
));
