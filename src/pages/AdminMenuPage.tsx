import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Plus, Trash2, Search, Loader2 } from 'lucide-react';
import { useCategories, useAllFoodItems } from '@/hooks/useFoodData';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { foodService } from '@/services/foodService';
import { toast } from 'sonner';
import { FoodItemModal } from './modals/FoodItemModal';
import { CategoryModal } from './modals/CategoryModal';
import type { FoodItemWithPrices, Category } from '@/lib/types';

export default function AdminMenuPage() {
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading: catLoading } = useCategories();
  const { data: items = [], isLoading: itemsLoading } = useAllFoodItems();
  const [search, setSearch] = useState('');

  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItemWithPrices | undefined>();

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();

  const handleOpenFoodModal = (item?: FoodItemWithPrices) => {
    setEditingItem(item);
    setIsFoodModalOpen(true);
  };

  const handleOpenCategoryModal = (cat?: Category) => {
    setEditingCategory(cat);
    setIsCategoryModalOpen(true);
  };

  const deleteMutation = useMutation({
    mutationFn: foodService.deleteFoodItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-items', 'all'] });
      toast.success('Food item deleted successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete item');
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredItems = items.filter(
    (i) => i.name.toLowerCase().includes(search.toLowerCase()) || 
           (i.description?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl text-[#F7F3EC] mb-2">Menu Management</h1>
          <p className="text-[#C7BFB2]">Add, edit, or remove categories and dishes</p>
        </div>
        <button 
          onClick={() => handleOpenFoodModal()}
          className="inline-flex items-center gap-2 rounded-lg bg-[#D4A24C] px-5 py-2.5 text-sm font-medium text-[#1A1410] hover:bg-[#c8963f] transition-all shrink-0"
        >
          <Plus size={16} />
          Add New Item
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-[#F7F3EC]">Categories</h2>
            <button 
              onClick={() => handleOpenCategoryModal()}
              className="p-1.5 text-[#D4A24C] hover:bg-[#D4A24C]/10 rounded-md transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          
          <div className="space-y-2">
            {catLoading ? (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin text-[#D4A24C]" /></div>
            ) : categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between rounded-lg border border-[#D4A24C]/10 bg-white/5 px-4 py-3 text-sm text-[#F7F3EC] hover:border-[#D4A24C]/30 transition-colors cursor-pointer"
              >
                <span>{cat.name}</span>
                <button 
                  onClick={() => handleOpenCategoryModal(cat)}
                  className="p-1 text-[#C7BFB2] hover:text-[#D4A24C] transition-colors"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Items List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C7BFB2]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes..."
              className="w-full h-12 rounded-xl border border-[#D4A24C]/15 bg-[#141210] pl-12 pr-4 text-[#F7F3EC] placeholder:text-[#C7BFB2]/50 outline-none focus:border-[#D4A24C]/40 transition-colors"
            />
          </div>

          <div className="rounded-xl border border-[#D4A24C]/15 bg-linear-to-b from-[#141210] to-[#0D0B09] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#C7BFB2]">
                <thead className="border-b border-[#D4A24C]/15 bg-white/5 uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-4 font-medium">Item</th>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Prices</th>
                    <th className="px-6 py-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D4A24C]/10">
                  {itemsLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <Loader2 className="animate-spin text-[#D4A24C] mx-auto" />
                      </td>
                    </tr>
                  ) : filteredItems.map((item) => {
                    const cat = categories.find((c) => c.id === item.category_id);
                    return (
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key={item.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {item.image_url ? (
                              <img src={item.image_url} alt="" className="h-10 w-10 rounded object-cover" />
                            ) : (
                              <div className="h-10 w-10 rounded bg-white/5" />
                            )}
                            <div>
                              <div className="font-medium text-[#F7F3EC]">{item.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">{cat?.name || 'Unknown'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            item.is_available ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                          }`}>
                            {item.is_available ? 'Available' : 'Hidden'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1 flex-wrap">
                            {item.prices.map((p) => (
                              <span key={p.size} className="text-[10px] uppercase bg-white/5 px-1.5 py-0.5 rounded text-[#D4A24C]">
                                {p.size.charAt(0)}: ₹{p.price}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleOpenFoodModal(item)}
                              className="p-1.5 text-[#C7BFB2] hover:text-[#D4A24C] hover:bg-white/5 rounded transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 text-[#C7BFB2] hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <FoodItemModal 
        isOpen={isFoodModalOpen} 
        onClose={() => setIsFoodModalOpen(false)} 
        categories={categories}
        itemToEdit={editingItem}
      />
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categoryToEdit={editingCategory}
      />
    </div>
  );
}
