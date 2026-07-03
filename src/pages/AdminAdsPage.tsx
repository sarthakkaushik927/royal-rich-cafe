import { useAllAds } from '@/hooks/useOrderData';
import { motion } from 'framer-motion';
import { Plus, ToggleLeft, ToggleRight, Edit2, Trash2, Loader2 } from 'lucide-react';

import { useQueryClient, useMutation } from '@tanstack/react-query';
import { adService } from '@/services/adService';
import { toast } from 'sonner';

import { AdvertisementModal } from './modals/AdvertisementModal';
import { useAllFoodItems } from '@/hooks/useFoodData';
import type { Advertisement } from '@/lib/types';
import { useState } from 'react';

export default function AdminAdsPage() {
  const queryClient = useQueryClient();
  const { data: ads = [], isLoading } = useAllAds();
  const { data: foodItems = [] } = useAllFoodItems();

  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | undefined>();

  const handleOpenModal = (ad?: Advertisement) => {
    setEditingAd(ad);
    setIsAdModalOpen(true);
  };

  const toggleMutation = useMutation({
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

  const handleToggleActive = (ad: Advertisement) => {
    toggleMutation.mutate({ id: ad.id, active: !ad.active });
  };

  const deleteMutation = useMutation({
    mutationFn: adService.deleteAd,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      toast.success('Advertisement deleted successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete advertisement');
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this advertisement?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl text-[#F7F3EC] mb-2">Promotional Banners</h1>
          <p className="text-[#C7BFB2]">Manage carousel advertisements shown on the menu page</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 rounded-lg bg-[#D4A24C] px-5 py-2.5 text-sm font-medium text-[#1A1410] hover:bg-[#c8963f] transition-all shrink-0"
        >
          <Plus size={16} />
          Create Banner
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-[#D4A24C] w-8 h-8" />
        </div>
      ) : ads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#D4A24C]/30 bg-[#141210] p-12 text-center">
          <p className="text-[#C7BFB2]">No promotional banners found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ads.map((ad, i) => (
            <motion.div
              key={ad.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col md:flex-row items-center gap-6 rounded-xl border border-[#D4A24C]/15 bg-[#141210] p-4 transition-all hover:border-[#D4A24C]/30"
            >
              {ad.banner_image_url || ad.food_item?.image_url ? (
                <div className="h-32 w-full md:w-56 shrink-0 overflow-hidden rounded-lg">
                  <img
                    src={(ad.banner_image_url || ad.food_item?.image_url) as string}
                    alt={ad.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-32 w-full md:w-56 shrink-0 rounded-lg bg-white/5 flex items-center justify-center text-sm text-[#C7BFB2]/50">
                  No Image
                </div>
              )}

              <div className="flex-1 min-w-0 text-center md:text-left">
                <h3 className="font-serif text-xl text-[#F7F3EC]">{ad.title}</h3>
                {ad.subtitle && <p className="text-sm text-[#C7BFB2] mt-1 line-clamp-2">{ad.subtitle}</p>}
                
                <div className="mt-3 flex items-center justify-center md:justify-start gap-4 text-xs text-[#C7BFB2]/70">
                  <span>Order: {ad.display_order}</span>
                  {ad.food_item && <span>Links to: {ad.food_item.name}</span>}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button 
                  onClick={() => handleToggleActive(ad)}
                  disabled={toggleMutation.isPending}
                  className="flex flex-col items-center gap-1 text-xs text-[#D4A24C] hover:text-[#F7F3EC] transition-colors disabled:opacity-50"
                >
                  {ad.active ? <ToggleRight size={24} /> : <ToggleLeft size={24} className="text-[#C7BFB2]" />}
                  {ad.active ? 'Active' : 'Inactive'}
                </button>
                <div className="w-px h-8 bg-white/10 mx-2" />
                <button 
                  onClick={() => handleOpenModal(ad)}
                  className="p-2 text-[#C7BFB2] hover:text-[#D4A24C] hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(ad.id)}
                  className="p-2 text-[#C7BFB2] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      <AdvertisementModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
        foodItems={foodItems}
        adToEdit={editingAd}
      />
    </div>
  );
}
