"use client";
import { useState } from 'react';
import { useAllAds } from '@/hooks/useOrderData';
import { useAllFoodItems } from '@/hooks/useFoodData';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, Edit2, Trash2, Loader2, X, Check, ToggleRight, ToggleLeft } from 'lucide-react';

import { useQueryClient, useMutation } from '@tanstack/react-query';
import { adService } from '@/services/adService';
import { foodService } from '@/services/foodService';
import { toast } from 'sonner';

import { AdvertisementModal } from '@/components/modals/AdvertisementModal';
import type { Advertisement, FoodItemWithPrices } from '@/lib/types';

export default function Page() {
  const queryClient = useQueryClient();
  const { data: ads = [], isLoading: adsLoading } = useAllAds();
  const { data: foodItems = [], isLoading: itemsLoading } = useAllFoodItems();

  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | undefined>();

  const [isRecModalOpen, setIsRecModalOpen] = useState(false);
  const [recSearch, setRecSearch] = useState('');

  const recommendedItems = foodItems.filter(item => item.is_recommended);
  const unrecommendedItems = foodItems.filter(item => !item.is_recommended && item.name.toLowerCase().includes(recSearch.toLowerCase()));

  const handleOpenAdModal = (ad?: Advertisement) => {
    setEditingAd(ad);
    setIsAdModalOpen(true);
  };

  const toggleAdMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adService.updateAd(id, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      toast.success('Advertisement status updated');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
    },
  });

  const handleToggleAdActive = (ad: Advertisement) => {
    toggleAdMutation.mutate({ id: ad.id, active: !ad.active });
  };

  const deleteAdMutation = useMutation({
    mutationFn: adService.deleteAd,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      toast.success('Advertisement deleted successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete advertisement');
    },
  });

  const handleDeleteAd = (id: string) => {
    if (confirm('Are you sure you want to delete this advertisement?')) {
      deleteAdMutation.mutate(id);
    }
  };

  const toggleRecMutation = useMutation({
    mutationFn: ({ id, is_recommended }: { id: string; is_recommended: boolean }) =>
      foodService.updateFoodItem(id, { is_recommended }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-items'] });
      toast.success('Recommendation updated');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update recommendation');
    },
  });

  const handleToggleRecommendation = (id: string, is_recommended: boolean) => {
    toggleRecMutation.mutate({ id, is_recommended });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in pt-4">
      {/* Left Column: Actions */}
      <div className="lg:col-span-4 space-y-6">
         <div className="rounded-xl glass-card p-5 space-y-5">
            <h3 className="font-serif text-lg text-[#D4A24C] border-b border-[#D4A24C]/10 pb-2 uppercase tracking-wider flex items-center space-x-1.5">
              <Edit3 size={16} />
              <span>Draft Content</span>
            </h3>
            
            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <p className="text-[#C7BFB2]/70 leading-relaxed font-semibold uppercase tracking-wider text-[10px]">Promotional Banners</p>
                <button 
                  onClick={() => handleOpenAdModal()}
                  className="w-full py-3 bg-black/60 border border-[#D4A24C]/20 text-white font-serif tracking-widest uppercase text-xs rounded transition duration-300 shadow-md hover:border-[#D4A24C] text-center"
                >
                  Create Banner Ad
                </button>
              </div>

              <div className="space-y-2 pt-4 border-t border-[#D4A24C]/10">
                <p className="text-[#C7BFB2]/70 leading-relaxed font-semibold uppercase tracking-wider text-[10px]">Homepage Highlights</p>
                <button 
                  onClick={() => setIsRecModalOpen(true)}
                  className="w-full py-3 bg-[#D4A24C] text-[#0D0B09] font-serif font-bold tracking-widest uppercase text-xs rounded transition duration-300 shadow-md hover:bg-[#c8963f]"
                >
                  Add Recommendation
                </button>
              </div>
            </div>
         </div>
      </div>

      {/* Right Column: Live Data */}
      <div className="lg:col-span-8 space-y-8">
        
        {/* Ads List */}
        <div className="rounded-xl glass-card p-5 space-y-4">
          <h3 className="font-serif text-lg text-[#D4A24C] border-b border-[#D4A24C]/10 pb-2 uppercase tracking-wider">
            Published Banners Catalog ({ads.length} Live)
          </h3>

          <div className="space-y-3">
            {adsLoading ? (
               <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[#D4A24C]" /></div>
            ) : ads.length === 0 ? (
               <p className="text-[#C7BFB2]/50 text-xs py-4">No promotional banners active.</p>
            ) : ads.map((ad) => (
              <div key={ad.id} className="border border-[#D4A24C]/10 bg-black/40 p-4 rounded-lg flex justify-between items-center text-xs group hover:border-[#D4A24C]/30 transition-all">
                <div className="flex gap-4 items-center max-w-[70%]">
                  {ad.banner_image_url || ad.food_item?.image_url ? (
                    <img src={(ad.banner_image_url || ad.food_item?.image_url) as string} alt="" className="w-16 h-12 object-cover rounded opacity-80 group-hover:opacity-100 transition" />
                  ) : (
                    <div className="w-16 h-12 bg-white/5 rounded" />
                  )}
                  <div className="space-y-1">
                    <h4 className="font-serif font-bold text-[#F7F3EC] text-sm">{ad.title}</h4>
                    <p className="text-[#C7BFB2]/70 text-[10px] leading-relaxed line-clamp-1 uppercase tracking-wider">
                      {ad.active ? <span className="text-green-500">ACTIVE CAMPAIGN</span> : <span className="text-[#C7BFB2]">INACTIVE</span>} | {ad.subtitle || 'NO SUBTITLE'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button onClick={() => handleToggleAdActive(ad)} className="p-2 bg-black/60 hover:bg-white/10 border border-[#D4A24C]/25 rounded text-[#C7BFB2] transition">
                    {ad.active ? <ToggleRight size={14} className="text-[#D4A24C]" /> : <ToggleLeft size={14} />}
                  </button>
                  <button onClick={() => handleOpenAdModal(ad)} className="p-2 bg-black/60 hover:bg-white/10 border border-[#D4A24C]/25 rounded text-[#C7BFB2] transition">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDeleteAd(ad.id)} className="p-2 bg-red-950/20 hover:bg-red-900 border border-red-500/25 rounded text-red-400 transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations List */}
        <div className="rounded-xl glass-card p-5 space-y-4">
          <h3 className="font-serif text-lg text-[#D4A24C] border-b border-[#D4A24C]/10 pb-2 uppercase tracking-wider">
            Curated Recommendations ({recommendedItems.length} Featured)
          </h3>

          <div className="space-y-3">
            {itemsLoading ? (
               <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[#D4A24C]" /></div>
            ) : recommendedItems.length === 0 ? (
               <p className="text-[#C7BFB2]/50 text-xs py-4">No featured dishes selected. System defaulting to top menu items.</p>
            ) : recommendedItems.map((item) => (
              <div key={item.id} className="border border-[#D4A24C]/10 bg-black/40 p-4 rounded-lg flex justify-between items-center text-xs group hover:border-[#D4A24C]/30 transition-all">
                <div className="flex gap-4 items-center max-w-[70%]">
                  <img src={item.image_url || ''} alt="" className="w-12 h-12 object-cover rounded opacity-80 group-hover:opacity-100 transition" />
                  <div className="space-y-1">
                    <h4 className="font-serif font-bold text-[#F7F3EC] text-sm">{item.name}</h4>
                    <p className="text-[#C7BFB2]/70 text-[10px] leading-relaxed line-clamp-1 uppercase tracking-wider">
                      {item.category?.name || 'Dish'} | FEATURED ON HOMEPAGE
                    </p>
                  </div>
                </div>

                <button onClick={() => handleToggleRecommendation(item.id, false)} className="p-2 bg-red-950/20 hover:bg-red-900 border border-red-500/25 rounded text-red-400 transition">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <AdvertisementModal isOpen={isAdModalOpen} onClose={() => setIsAdModalOpen(false)} foodItems={foodItems} adToEdit={editingAd} />

      {/* Recommended Item Picker Modal */}
      <AnimatePresence>
        {isRecModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsRecModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md max-h-[80vh] flex flex-col rounded-2xl border border-[#D4A24C]/20 bg-[#0D0B09] p-6 shadow-2xl">
              <button onClick={() => setIsRecModalOpen(false)} className="absolute right-6 top-6 text-[#C7BFB2] hover:text-white transition-colors"><X size={20} /></button>
              <h2 className="font-serif text-xl text-[#F7F3EC] mb-4">Add Recommendation</h2>
              <input type="text" placeholder="Search dishes..." value={recSearch} onChange={(e) => setRecSearch(e.target.value)} className="w-full rounded-lg border border-[#D4A24C]/15 bg-[#141210] p-3 text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40 mb-4" />
              <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                {unrecommendedItems.length === 0 ? (
                  <p className="text-center text-[#C7BFB2]/50 text-sm py-8">No matching dishes found.</p>
                ) : (
                  unrecommendedItems.map(item => (
                    <div key={item.id} className="flex flex-row items-center justify-between p-3 rounded-xl border border-white/5 hover:border-[#D4A24C]/20 bg-[#141210] transition-colors">
                      <div className="flex items-center gap-3">
                        <img src={item.image_url || ''} alt="" className="w-10 h-10 rounded-lg object-cover bg-white/5" />
                        <div>
                          <h4 className="text-sm font-medium text-[#F7F3EC]">{item.name}</h4>
                          <span className="text-[10px] text-[#C7BFB2]">{item.category?.name}</span>
                        </div>
                      </div>
                      <button onClick={() => handleToggleRecommendation(item.id, true)} className="p-2 text-[#D4A24C] hover:bg-[#D4A24C]/10 rounded-lg transition-colors"><Plus size={16} /></button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
