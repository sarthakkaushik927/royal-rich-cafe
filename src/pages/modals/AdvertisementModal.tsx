import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { adService } from '@/services/adService';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import type { Advertisement, FoodItemWithPrices } from '@/lib/types';

interface AdvertisementModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodItems: FoodItemWithPrices[];
  adToEdit?: Advertisement;
}

export function AdvertisementModal({ isOpen, onClose, foodItems, adToEdit }: AdvertisementModalProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [foodItemId, setFoodItemId] = useState('');
  const [active, setActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);

  useEffect(() => {
    if (adToEdit) {
      setTitle(adToEdit.title);
      setSubtitle(adToEdit.subtitle || '');
      setBannerImageUrl(adToEdit.banner_image_url || '');
      setFoodItemId(adToEdit.food_item_id);
      setActive(adToEdit.active);
      setDisplayOrder(adToEdit.display_order);
    } else {
      setTitle('');
      setSubtitle('');
      setBannerImageUrl('');
      setFoodItemId(foodItems[0]?.id || '');
      setActive(true);
      setDisplayOrder(0);
    }
  }, [adToEdit, foodItems, isOpen]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title,
        subtitle: subtitle || null,
        banner_image_url: bannerImageUrl || null,
        food_item_id: foodItemId,
        active,
        display_order: displayOrder,
        starts_at: null,
        ends_at: null,
      };
      if (adToEdit) {
        return adService.updateAd(adToEdit.id, payload);
      } else {
        return adService.createAd(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      toast.success(`Advertisement ${adToEdit ? 'updated' : 'created'} successfully!`);
      onClose();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to save advertisement');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodItemId) {
      toast.error('Please select a linked food item');
      return;
    }
    saveMutation.mutate();
  };

  return (
    <Modal open={isOpen} onClose={onClose} title={adToEdit ? 'Edit Advertisement' : 'Create Advertisement'}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#C7BFB2]">Title</label>
          <input
            required
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-[#D4A24C]/15 bg-[#141210] p-3 text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40"
            placeholder="e.g. Weekend Special"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#C7BFB2]">Subtitle</label>
          <textarea
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-[#D4A24C]/15 bg-[#141210] p-3 text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#C7BFB2]">Linked Food Item</label>
          <select
            required
            value={foodItemId}
            onChange={(e) => setFoodItemId(e.target.value)}
            className="w-full rounded-lg border border-[#D4A24C]/15 bg-[#141210] p-3 text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40"
          >
            <option value="" disabled>Select Item</option>
            {foodItems.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <p className="text-xs text-[#C7BFB2]/60 mt-1">Customers will be taken to this item when they click the ad.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#C7BFB2]">Banner Image URL (Optional)</label>
          <input
            type="url"
            value={bannerImageUrl}
            onChange={(e) => setBannerImageUrl(e.target.value)}
            className="w-full rounded-lg border border-[#D4A24C]/15 bg-[#141210] p-3 text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40"
            placeholder="https://..."
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-[#C7BFB2]">Display Order</label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              className="w-full rounded-lg border border-[#D4A24C]/15 bg-[#141210] p-3 text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40"
            />
          </div>
          <div className="flex-1 flex items-center pt-6 gap-3">
            <input
              type="checkbox"
              id="adActive"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 accent-[#D4A24C]"
            />
            <label htmlFor="adActive" className="text-sm font-medium text-[#C7BFB2]">
              Active
            </label>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#C7BFB2] hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 rounded-lg bg-[#D4A24C] px-5 py-2.5 text-sm font-medium text-[#1A1410] hover:bg-[#c8963f] transition-all disabled:opacity-50"
          >
            {saveMutation.isPending && <Loader2 size={16} className="animate-spin" />}
            {adToEdit ? 'Save Changes' : 'Create Ad'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
