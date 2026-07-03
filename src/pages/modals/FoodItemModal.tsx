import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { foodService } from '@/services/foodService';
import { toast } from 'sonner';
import type { Category, FoodItemWithPrices } from '@/lib/types';

interface FoodItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  itemToEdit?: FoodItemWithPrices;
}

export function FoodItemModal({ isOpen, onClose, categories, itemToEdit }: FoodItemModalProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  
  // Local state for prices
  const [prices, setPrices] = useState<{ size: 'small' | 'medium' | 'large'; price: number }[]>([
    { size: 'medium', price: 0 }
  ]);

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setDescription(itemToEdit.description || '');
      setCategoryId(itemToEdit.category_id);
      setImageUrl(itemToEdit.image_url || '');
      setIsAvailable(itemToEdit.is_available);
      setPrices(itemToEdit.prices.map(p => ({ size: p.size as any, price: p.price })));
    } else {
      setName('');
      setDescription('');
      setCategoryId(categories[0]?.id || '');
      setImageUrl('');
      setIsAvailable(true);
      setPrices([{ size: 'medium', price: 0 }]);
    }
  }, [itemToEdit, categories, isOpen]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        description,
        category_id: categoryId,
        image_url: imageUrl,
        is_available: isAvailable,
      };
      if (itemToEdit) {
        return foodService.updateFoodItem(itemToEdit.id, payload, prices);
      } else {
        return foodService.createFoodItem(payload, prices);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-items'] });
      toast.success(`Item ${itemToEdit ? 'updated' : 'created'} successfully!`);
      onClose();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to save item');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      toast.error('Please select a category');
      return;
    }
    if (prices.length === 0) {
      toast.error('Please add at least one price');
      return;
    }
    saveMutation.mutate();
  };

  const addPrice = () => {
    setPrices([...prices, { size: 'medium', price: 0 }]);
  };

  const removePrice = (index: number) => {
    setPrices(prices.filter((_, i) => i !== index));
  };

  const updatePrice = (index: number, field: 'size' | 'price', value: any) => {
    const newPrices = [...prices];
    newPrices[index] = { ...newPrices[index], [field]: value };
    setPrices(newPrices);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#D4A24C]/20 bg-[#0D0B09] p-6 shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-[#C7BFB2] hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          <h2 className="font-serif text-2xl text-[#F7F3EC] mb-6">
            {itemToEdit ? 'Edit Dish' : 'Add New Dish'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#C7BFB2]">Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-[#D4A24C]/15 bg-[#141210] p-3 text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40"
                  placeholder="e.g. Wagyu Beef Sliders"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#C7BFB2]">Category</label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-lg border border-[#D4A24C]/15 bg-[#141210] p-3 text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40"
                >
                  <option value="" disabled>Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#C7BFB2]">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-[#D4A24C]/15 bg-[#141210] p-3 text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#C7BFB2]">Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full rounded-lg border border-[#D4A24C]/15 bg-[#141210] p-3 text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40"
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isAvailable"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 accent-[#D4A24C]"
              />
              <label htmlFor="isAvailable" className="text-sm font-medium text-[#C7BFB2]">
                Item is available for ordering
              </label>
            </div>

            <div className="space-y-4 border-t border-[#D4A24C]/20 pt-6">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#C7BFB2]">Prices & Sizes</label>
                <button
                  type="button"
                  onClick={addPrice}
                  className="text-xs font-medium text-[#D4A24C] flex items-center gap-1 hover:text-[#F7F3EC]"
                >
                  <Plus size={14} /> Add Price
                </button>
              </div>

              {prices.map((price, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <select
                    value={price.size}
                    onChange={(e) => updatePrice(idx, 'size', e.target.value)}
                    className="flex-1 rounded-lg border border-[#D4A24C]/15 bg-[#141210] p-3 text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                  
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C7BFB2]">₹</span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={price.price}
                      onChange={(e) => updatePrice(idx, 'price', Number(e.target.value))}
                      className="w-full rounded-lg border border-[#D4A24C]/15 bg-[#141210] pl-8 p-3 text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removePrice(idx)}
                    className="p-3 text-[#C7BFB2] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-[#D4A24C]/20 flex justify-end gap-3">
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
                {itemToEdit ? 'Save Changes' : 'Create Item'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
