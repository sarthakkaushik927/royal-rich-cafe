import { supabase } from '@/lib/supabaseClient';
import type { Category, FoodItem, FoodItemPrice, FoodItemWithPrices } from '@/lib/types';

export interface FoodService {
  getCategories(): Promise<Category[]>;
  getFoodItemsByCategory(categoryId: string): Promise<FoodItemWithPrices[]>;
  getAllFoodItems(): Promise<FoodItemWithPrices[]>;
  getFoodItem(itemId: string): Promise<FoodItemWithPrices>;
  createCategory(input: Omit<Category, 'id' | 'created_at'>): Promise<Category>;
  updateCategory(id: string, input: Partial<Category>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  createFoodItem(
    item: Omit<FoodItem, 'id' | 'created_at'>,
    prices: { size: string; price: number }[]
  ): Promise<FoodItemWithPrices>;
  updateFoodItem(
    id: string,
    item: Partial<FoodItem>,
    prices?: { size: string; price: number }[]
  ): Promise<FoodItemWithPrices>;
  deleteFoodItem(id: string): Promise<void>;
}

async function attachPrices(items: FoodItem[]): Promise<FoodItemWithPrices[]> {
  if (items.length === 0) return [];

  const ids = items.map((i) => i.id);
  const { data: prices, error } = await supabase
    .from('food_item_prices')
    .select('*')
    .in('food_item_id', ids);

  if (error) throw new Error(error.message);

  const priceMap = new Map<string, FoodItemPrice[]>();
  for (const p of (prices ?? []) as FoodItemPrice[]) {
    const list = priceMap.get(p.food_item_id) ?? [];
    list.push(p);
    priceMap.set(p.food_item_id, list);
  }

  return items.map((item) => ({
    ...item,
    prices: priceMap.get(item.id) ?? [],
  }));
}

export const foodService: FoodService = {
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order');
    if (error) throw new Error(error.message);
    return data as Category[];
  },

  async getFoodItemsByCategory(categoryId) {
    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_available', true);
    if (error) throw new Error(error.message);
    return attachPrices(data as FoodItem[]);
  },

  async getAllFoodItems() {
    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return attachPrices(data as FoodItem[]);
  },

  async getFoodItem(itemId) {
    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .eq('id', itemId)
      .single();
    if (error) throw new Error(error.message);
    const [withPrices] = await attachPrices([data as FoodItem]);
    return withPrices;
  },

  async createCategory(input) {
    const { data, error } = await supabase
      .from('categories')
      .insert(input)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Category;
  },

  async updateCategory(id, input) {
    const { data, error } = await supabase
      .from('categories')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Category;
  },

  async deleteCategory(id) {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async createFoodItem(item, prices) {
    const { data, error } = await supabase
      .from('food_items')
      .insert(item)
      .select()
      .single();
    if (error) throw new Error(error.message);

    const foodItem = data as FoodItem;

    if (prices.length > 0) {
      const priceRows = prices.map((p) => ({
        food_item_id: foodItem.id,
        size: p.size,
        price: p.price,
      }));
      const { error: priceError } = await supabase
        .from('food_item_prices')
        .insert(priceRows);
      if (priceError) throw new Error(priceError.message);
    }

    return this.getFoodItem(foodItem.id);
  },

  async updateFoodItem(id, item, prices) {
    if (Object.keys(item).length > 0) {
      const { error } = await supabase.from('food_items').update(item).eq('id', id);
      if (error) throw new Error(error.message);
    }

    if (prices) {
      await supabase.from('food_item_prices').delete().eq('food_item_id', id);
      if (prices.length > 0) {
        const priceRows = prices.map((p) => ({
          food_item_id: id,
          size: p.size,
          price: p.price,
        }));
        const { error: priceError } = await supabase
          .from('food_item_prices')
          .insert(priceRows);
        if (priceError) throw new Error(priceError.message);
      }
    }

    return this.getFoodItem(id);
  },

  async deleteFoodItem(id) {
    const { error } = await supabase.from('food_items').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
