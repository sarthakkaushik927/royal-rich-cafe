import { create } from 'zustand';
import type { CartItem, FoodSize } from '@/lib/types';

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (foodItemId: string, size: FoodSize) => void;
  updateQuantity: (foodItemId: string, size: FoodSize, quantity: number) => void;
  clearCart: () => void;
  totalAmount: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

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
        };
      }
      return { items: [...state.items, incoming] };
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
}));
