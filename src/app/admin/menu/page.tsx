"use client";
import { useState } from 'react';
import { Edit2, Plus, Trash2, Search, Loader2 } from 'lucide-react';
import { useCategories, useAllFoodItems } from '@/hooks/useFoodData';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { foodService } from '@/services/foodService';
import { toast } from 'sonner';
import { FoodItemModal } from '@/components/modals/FoodItemModal';
import { CategoryModal } from '@/components/modals/CategoryModal';
import type { FoodItemWithPrices, Category } from '@/lib/types';

export default function Page() {
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in pt-4">
      {/* Left Column: Actions & Categories */}
      <div className="lg:col-span-4 space-y-8">
         {/* Publish New Dish (Quick Button) */}
         <div className="rounded-xl glass-card p-5 space-y-5">
            <h3 className="font-serif text-lg text-[#D4A24C] border-b border-[#D4A24C]/10 pb-2 uppercase tracking-wider flex items-center space-x-1.5">
              <Plus size={16} />
              <span>Publish New Dish</span>
            </h3>
            
            <div className="space-y-4 text-xs">
              <p className="text-[#C7BFB2]/70 leading-relaxed">
                Use the advanced menu compiler to publish new dishes to the live database, complete with dietary tags, preparation options, and rich imagery.
              </p>
              
              <button 
                onClick={() => handleOpenFoodModal()}
                className="w-full py-3 bg-[#D4A24C] text-[#0D0B09] font-serif font-bold tracking-widest uppercase text-xs rounded transition duration-300 shadow-md hover:bg-[#c8963f]"
              >
                Open Compiler
              </button>
            </div>
         </div>

         {/* Categories Manager */}
         <div className="rounded-xl glass-card p-5 space-y-4">
            <h3 className="font-serif text-lg text-[#D4A24C] border-b border-[#D4A24C]/10 pb-2 uppercase tracking-wider flex items-center justify-between">
              <span>Categories</span>
              <button onClick={() => handleOpenCategoryModal()} className="p-1 text-[#C7BFB2] hover:text-[#D4A24C] transition-colors"><Plus size={16} /></button>
            </h3>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
              {catLoading ? (
                <div className="flex justify-center p-4"><Loader2 className="animate-spin text-[#D4A24C]" /></div>
              ) : categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between rounded border border-[#D4A24C]/10 bg-black/40 px-3 py-2 text-xs font-medium text-[#F7F3EC] hover:border-[#D4A24C]/30 transition-all group"
                >
                  <span className="truncate pr-2">{cat.name}</span>
                  <button 
                    onClick={() => handleOpenCategoryModal(cat)}
                    className="p-1 rounded bg-black/50 text-[#C7BFB2] hover:text-[#D4A24C] transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Edit2 size={12} />
                  </button>
                </div>
              ))}
            </div>
         </div>
      </div>

      {/* Right Column: Live Database Catalog CMS */}
      <div className="lg:col-span-8 rounded-xl glass-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#D4A24C]/10 pb-2 gap-3">
            <h3 className="font-serif text-lg text-[#D4A24C] uppercase tracking-wider">
              Live Database Catalog CMS ({items.length} Items)
            </h3>
            <div className="relative w-full sm:w-56">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C7BFB2]" />
              <input 
                type="text" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="w-full bg-black/60 border border-[#D4A24C]/20 text-white py-1.5 pl-8 pr-3 rounded text-xs focus:outline-none focus:border-[#D4A24C]" 
                placeholder="Search catalog..." 
              />
            </div>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1 no-scrollbar">
            {itemsLoading ? (
               <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#D4A24C] w-8 h-8" /></div>
            ) : filteredItems.map((item) => {
              const cat = categories.find((c) => c.id === item.category_id);
              const minPrice = item.prices?.length ? Math.min(...item.prices.map(p => Number(p.price))) : 0;
              
              return (
                <div key={item.id} className="border border-[#D4A24C]/10 bg-black/40 p-3 rounded-lg flex justify-between items-center text-xs group hover:border-[#D4A24C]/30 transition-colors">
                  <div className="space-y-1 max-w-[70%]">
                    <div className="flex items-center space-x-2">
                      <span className="font-serif font-bold text-[#F7F3EC] text-sm">{item.name}</span>
                      <span className="text-[8px] bg-[#D4A24C]/15 text-[#D4A24C] px-2 py-0.5 rounded uppercase tracking-wider">
                        {cat?.name || 'Uncategorized'}
                      </span>
                      {!item.is_available && (
                        <span className="text-[8px] bg-red-950/40 text-red-400 px-2 py-0.5 rounded uppercase tracking-wider border border-red-500/20">
                          Hidden
                        </span>
                      )}
                    </div>
                    <p className="text-[#C7BFB2]/70 text-[10px] leading-relaxed line-clamp-1">{item.description || 'No description provided.'}</p>
                  </div>

                  <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
                    <div className="flex items-center space-x-1">
                      <span className="text-[#D4A24C] font-bold">₹</span>
                      <span className="text-[#F7F3EC] font-bold text-sm w-12 text-right">{minPrice}+</span>
                    </div>

                    <div className="flex items-center space-x-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenFoodModal(item)}
                        className="p-2 bg-black/60 hover:bg-white/10 border border-[#D4A24C]/25 rounded text-[#C7BFB2] transition"
                        title="Edit Dish"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-red-950/20 hover:bg-red-900 border border-red-500/25 rounded text-red-400 transition"
                        title="Delete Dish"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredItems.length === 0 && !itemsLoading && (
              <div className="text-center py-12 text-[#C7BFB2]/50 text-sm">
                No menu items found.
              </div>
            )}
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
