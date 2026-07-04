"use client";
import { useState } from 'react';
import { useAllAds } from '@/hooks/useOrderData';
import { useAllFoodItems } from '@/hooks/useFoodData';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ToggleLeft, ToggleRight, Edit2, Trash2, Loader2, X, Check } from 'lucide-react';

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

  // Recommendations state
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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-12">
      {/* ---------------- ADS SECTION ---------------- */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-serif text-2xl text-[#F7F3EC] mb-1">Promotional Banners</h2>
            <p className="text-sm text-[#C7BFB2]">Manage carousel advertisements shown on the menu page</p>
          </div>
          <button 
            onClick={() => handleOpenAdModal()}
            className="inline-flex items-center gap-2 rounded-lg bg-[#D4A24C] px-4 py-2 text-sm font-medium text-[#1A1410] hover:bg-[#c8963f] transition-all shrink-0"
          >
            <Plus size={16} />
            Create Banner
          </button>
        </div>

        {adsLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-[#D4A24C] w-8 h-8" />
          </div>
        ) : ads.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#D4A24C]/30 bg-[#141210] p-12 text-center">
            <p className="text-[#C7BFB2]">No promotional banners found.</p>
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar snap-x">
            {ads.map((ad, i) => (
              <motion.div
                key={ad.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col w-[300px] shrink-0 snap-center rounded-xl border border-[#D4A24C]/15 bg-[#141210] p-4 transition-all hover:border-[#D4A24C]/30 shadow-lg relative group"
              >
                {ad.banner_image_url || ad.food_item?.image_url ? (
                  <div className="h-40 w-full overflow-hidden rounded-lg mb-4">
                    <img
                      src={(ad.banner_image_url || ad.food_item?.image_url) as string}
                      alt={ad.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="h-40 w-full rounded-lg bg-white/5 flex items-center justify-center text-sm text-[#C7BFB2]/50 mb-4">
                    No Image
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-lg text-[#F7F3EC] line-clamp-1">{ad.title}</h3>
                  {ad.subtitle && <p className="text-xs text-[#C7BFB2] mt-1 line-clamp-2">{ad.subtitle}</p>}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                  <button 
                    onClick={() => handleToggleAdActive(ad)}
                    disabled={toggleAdMutation.isPending}
                    className="flex items-center gap-1.5 text-xs text-[#D4A24C] hover:text-[#F7F3EC] transition-colors disabled:opacity-50"
                  >
                    {ad.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} className="text-[#C7BFB2]" />}
                    {ad.active ? 'Active' : 'Inactive'}
                  </button>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleOpenAdModal(ad)}
                      className="p-1.5 text-[#C7BFB2] hover:text-[#D4A24C] hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteAd(ad.id)}
                      className="p-1.5 text-[#C7BFB2] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ---------------- RECOMMENDATIONS SECTION ---------------- */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-serif text-2xl text-[#F7F3EC] mb-1">Homepage Recommendations</h2>
            <p className="text-sm text-[#C7BFB2]">Manage dishes shown in the Recommended section</p>
          </div>
          <button 
            onClick={() => setIsRecModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#D4A24C] px-4 py-2 text-sm font-medium text-[#1A1410] hover:bg-[#c8963f] transition-all shrink-0"
          >
            <Plus size={16} />
            Add Recommendation
          </button>
        </div>

        {itemsLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-[#D4A24C] w-8 h-8" />
          </div>
        ) : (
          <>
            {recommendedItems.length === 0 && (
              <div className="mb-4 rounded-xl border border-dashed border-[#D4A24C]/30 bg-[#141210] p-4 text-center">
                <p className="text-[#C7BFB2] text-sm mb-2">No recommended dishes explicitly selected in the database.</p>
                <p className="text-[#F7F3EC] text-sm">Currently showing the first 4 available dishes on the homepage as a fallback.</p>
              </div>
            )}
            <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar snap-x">
              {(recommendedItems.length > 0 ? recommendedItems : foodItems.slice(0, 4)).map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col w-[200px] shrink-0 snap-center rounded-xl border border-[#D4A24C]/15 bg-[#141210] p-3 transition-all hover:border-[#D4A24C]/30 shadow-lg relative group"
                >
                  <div className="h-32 w-full overflow-hidden rounded-lg mb-3">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                      alt={item.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0 mb-3">
                    <h3 className="font-serif text-sm text-[#F7F3EC] line-clamp-1">{item.name}</h3>
                    <span className="text-[10px] text-[#C7BFB2]/70 uppercase">{item.category?.name || 'Dish'}</span>
                  </div>

                  <button 
                    onClick={() => handleToggleRecommendation(item.id, !item.is_recommended)}
                    className={`w-full py-1.5 flex justify-center items-center gap-1.5 text-xs rounded-lg transition-colors ${
                      item.is_recommended 
                        ? 'text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20'
                        : 'text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20'
                    }`}
                  >
                    {item.is_recommended ? (
                      <><Trash2 size={12} /> Remove</>
                    ) : (
                      <><Check size={12} /> Set as Recommended</>
                    )}
                  </button>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </section>
      
      <AdvertisementModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
        foodItems={foodItems}
        adToEdit={editingAd}
      />

      {/* Recommended Item Picker Modal */}
      <AnimatePresence>
        {isRecModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsRecModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md max-h-[80vh] flex flex-col rounded-2xl border border-[#D4A24C]/20 bg-[#0D0B09] p-6 shadow-2xl"
            >
              <button
                onClick={() => setIsRecModalOpen(false)}
                className="absolute right-6 top-6 text-[#C7BFB2] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="font-serif text-xl text-[#F7F3EC] mb-4">Add Recommendation</h2>
              
              <input 
                type="text" 
                placeholder="Search dishes..."
                value={recSearch}
                onChange={(e) => setRecSearch(e.target.value)}
                className="w-full rounded-lg border border-[#D4A24C]/15 bg-[#141210] p-3 text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40 mb-4"
              />

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
                      <button 
                        onClick={() => handleToggleRecommendation(item.id, true)}
                        className="p-2 text-[#D4A24C] hover:bg-[#D4A24C]/10 rounded-lg transition-colors"
                      >
                        <Plus size={16} />
                      </button>
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
