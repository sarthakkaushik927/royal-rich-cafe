"use client";
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { foodService } from '@/services/foodService';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import type { Category } from '@/lib/types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category;
}

export function CategoryModal({ isOpen, onClose, categoryToEdit }: CategoryModalProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setSlug(categoryToEdit.slug);
      setImageUrl(categoryToEdit.image_url || '');
      setDisplayOrder(categoryToEdit.display_order);
    } else {
      setName('');
      setSlug('');
      setImageUrl('');
      setDisplayOrder(0);
    }
  }, [categoryToEdit, isOpen]);

  // Auto-generate slug from name if not editing
  useEffect(() => {
    if (!categoryToEdit && name) {
      setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  }, [name, categoryToEdit]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        slug,
        image_url: imageUrl || null,
        display_order: displayOrder,
      };
      if (categoryToEdit) {
        return foodService.updateCategory(categoryToEdit.id, payload);
      } else {
        return foodService.createCategory(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(`Category ${categoryToEdit ? 'updated' : 'created'} successfully!`);
      onClose();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to save category');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  return (
    <Modal open={isOpen} onClose={onClose} title={categoryToEdit ? 'Edit Category' : 'Create Category'}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#C7BFB2]">Category Name</label>
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-[#D4A24C]/15 bg-[#141210] p-3 text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40"
            placeholder="e.g. Signature Desserts"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#C7BFB2]">URL Slug</label>
          <input
            required
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-lg border border-[#D4A24C]/15 bg-[#141210] p-3 text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40"
            placeholder="signature-desserts"
          />
          <p className="text-xs text-[#C7BFB2]/60 mt-1">This will be used in the URL.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#C7BFB2]">Image URL (Optional)</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full rounded-lg border border-[#D4A24C]/15 bg-[#141210] p-3 text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40"
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#C7BFB2]">Display Order</label>
          <input
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(Number(e.target.value))}
            className="w-full rounded-lg border border-[#D4A24C]/15 bg-[#141210] p-3 text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40"
          />
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
            {categoryToEdit ? 'Save Changes' : 'Create Category'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
