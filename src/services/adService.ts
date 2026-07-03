import { supabase } from '@/lib/supabaseClient';
import type { Advertisement } from '@/lib/types';

export interface AdService {
  getActiveAds(): Promise<Advertisement[]>;
  getAllAds(): Promise<Advertisement[]>;
  createAd(input: Omit<Advertisement, 'id' | 'created_at'>): Promise<Advertisement>;
  updateAd(id: string, input: Partial<Advertisement>): Promise<Advertisement>;
  deleteAd(id: string): Promise<void>;
}

export const adService: AdService = {
  async getActiveAds() {
    const { data, error } = await supabase
      .from('advertisements')
      .select('*, food_item:food_items(*, prices:food_item_prices(*))')
      .eq('active', true)
      .order('display_order');
    if (error) throw new Error(error.message);
    return data as Advertisement[];
  },

  async getAllAds() {
    const { data, error } = await supabase
      .from('advertisements')
      .select('*, food_item:food_items(*)')
      .order('display_order');
    if (error) throw new Error(error.message);
    return data as Advertisement[];
  },

  async createAd(input) {
    const { data, error } = await supabase
      .from('advertisements')
      .insert(input)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Advertisement;
  },

  async updateAd(id, input) {
    const { data, error } = await supabase
      .from('advertisements')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Advertisement;
  },

  async deleteAd(id) {
    const { error } = await supabase.from('advertisements').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
