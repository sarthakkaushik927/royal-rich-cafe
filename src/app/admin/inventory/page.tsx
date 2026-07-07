"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryService } from "@/services/inventoryService";
import type { InventoryItem } from "@/lib/types";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Pencil,
  Search,
  Filter,
  Package,
  AlertTriangle,
  X,
  Check,
  Loader2,
} from "lucide-react";

const CATEGORIES = [
  "Proteins",
  "Dairy & Cheese",
  "Vegetables",
  "Grains & Pasta",
  "Spices & Seasonings",
  "Beverages",
  "Dessert Supplies",
  "Oils & Sauces",
  "Garnishes",
  "Other",
];

const UNITS = ["KG", "G", "L", "ML", "PCS", "BOTTLES", "SHEETS", "PACKS", "DOZEN"];

const emptyForm: Omit<InventoryItem, "id" | "created_at" | "updated_at"> = {
  name: "",
  category: "Other",
  stock: 0,
  min_stock: 0,
  unit: "KG",
  cost_per_unit: 0,
  expiry: "",
};

export default function Page() {
  const queryClient = useQueryClient();
  
  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: inventoryService.getAllInventory
  });

  const createMutation = useMutation({
    mutationFn: inventoryService.createInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success("Item added successfully");
      setShowForm(false);
    },
    onError: (err: any) => toast.error(err.message || "Failed to add item")
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<InventoryItem> }) => 
      inventoryService.updateInventoryItem(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success("Item updated successfully");
      setShowForm(false);
      setStockInput(null);
    },
    onError: (err: any) => toast.error(err.message || "Failed to update item")
  });

  const deleteMutation = useMutation({
    mutationFn: inventoryService.deleteInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success("Item deleted successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete item")
  });
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [stockInput, setStockInput] = useState<{ id: string; value: string } | null>(null);

  const filteredInventory = inventory
    .filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Low stock items first
      const aLow = a.stock <= a.min_stock ? 0 : 1;
      const bLow = b.stock <= b.min_stock ? 0 : 1;
      return aLow - bLow || a.name.localeCompare(b.name);
    });

  const lowStockCount = inventory.filter((i) => i.stock <= i.min_stock).length;
  const totalValue = inventory.reduce((sum, i) => sum + i.stock * i.cost_per_unit, 0);

  const usedCategories = Array.from(new Set(inventory.map((i) => i.category))).sort();

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (item: InventoryItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      category: item.category,
      stock: item.stock,
      min_stock: item.min_stock,
      unit: item.unit,
      cost_per_unit: item.cost_per_unit,
      expiry: item.expiry || "",
    });
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editingId) {
      updateMutation.mutate({ id: editingId, updates: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleStockUpdate = (id: string) => {
    if (stockInput && stockInput.id === id) {
      const newStock = parseFloat(stockInput.value);
      if (!isNaN(newStock) && newStock >= 0) {
        updateMutation.mutate({ id, updates: { stock: newStock } });
      }
    }
  };

  return (
    <div className="animate-fade-in pt-4 space-y-6">
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-[#D4A24C]" size={32} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[#D4A24C]">{inventory.length}</div>
              <div className="text-[10px] uppercase tracking-wider text-[#C7BFB2]/60">Total Items</div>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold ${lowStockCount > 0 ? "text-red-400" : "text-green-400"}`}>
                {lowStockCount}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-[#C7BFB2]/60">Low Stock</div>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[#D4A24C]">{usedCategories.length}</div>
              <div className="text-[10px] uppercase tracking-wider text-[#C7BFB2]/60">Categories</div>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[#D4A24C]">
                ₹{totalValue >= 100000 ? `${(totalValue / 100000).toFixed(1)}L` : totalValue.toLocaleString()}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-[#C7BFB2]/60">Stock Value</div>
            </div>
          </div>

          <div className="rounded-xl glass-card p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg text-[#D4A24C] uppercase tracking-wider flex items-center gap-2">
                <Package size={16} />
                Larder & Kitchen Stock ({filteredInventory.length})
              </h3>
              <button
                onClick={openAddForm}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#D4A24C] text-[#1A1410] text-xs font-bold hover:bg-[#c8963f] transition-colors"
              >
                <Plus size={14} /> Add Item
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-md">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C7BFB2]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search inventory..."
                  className="w-full bg-black/60 border border-[#D4A24C]/20 text-white py-2 pl-9 pr-3 rounded text-xs focus:outline-none focus:border-[#D4A24C] transition-colors"
                />
              </div>
              <div className="relative shrink-0">
                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C7BFB2]" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full sm:w-48 bg-black/60 border border-[#D4A24C]/20 text-white py-2 pl-9 pr-8 rounded text-xs focus:outline-none focus:border-[#D4A24C] transition-colors appearance-none cursor-pointer"
                >
                  <option value="all">ALL CATEGORIES</option>
                  {usedCategories.map((c) => (
                    <option key={c} value={c}>
                      {c.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {filteredInventory.map((item) => {
                  const lowStock = item.stock <= item.min_stock;
                  const isEditingStock = stockInput?.id === item.id;
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 border rounded-lg bg-black/40 group transition-colors ${
                        lowStock
                          ? "border-red-500/35 bg-red-950/5"
                          : "border-[#D4A24C]/10 hover:border-[#D4A24C]/30"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#F7F3EC] text-sm truncate">{item.name}</span>
                            {lowStock && (
                              <AlertTriangle size={12} className="text-red-400 shrink-0 animate-pulse" />
                            )}
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-[#D4A24C]/10 text-[#D4A24C] font-medium text-[10px]">
                            {item.category}
                          </span>
                        </div>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                          <button
                            onClick={() => openEditForm(item)}
                            className="p-1.5 rounded text-[#C7BFB2] hover:text-[#D4A24C] hover:bg-[#D4A24C]/10 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded text-[#C7BFB2] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4 pt-2 border-t border-[#D4A24C]/5">
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] text-[#C7BFB2]/50">
                            Min: {item.min_stock} {item.unit}
                          </div>
                          <div className="flex items-center gap-2">
                            {isEditingStock ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  autoFocus
                                  value={stockInput.value}
                                  onChange={(e) => setStockInput({ id: item.id, value: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleStockUpdate(item.id);
                                    if (e.key === "Escape") setStockInput(null);
                                  }}
                                  className="w-16 text-center bg-black/60 border border-[#D4A24C]/40 rounded px-1 py-0.5 text-sm text-[#D4A24C] font-mono outline-none"
                                />
                                <button onClick={() => handleStockUpdate(item.id)} className="p-1 text-green-400 hover:bg-green-500/10 rounded">
                                  <Check size={12} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setStockInput({ id: item.id, value: String(item.stock) })}
                                className="text-center w-16 cursor-pointer hover:bg-white/5 rounded py-0.5 transition-colors"
                              >
                                <span className={`font-mono text-sm font-bold ${lowStock ? "text-red-400" : "text-[#D4A24C]"}`}>
                                  {item.stock}
                                </span>
                                <span className="text-[9px] text-[#C7BFB2]/60 block uppercase">{item.unit}</span>
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-end justify-between">
                          <div className="space-y-1 text-xs">
                            <p className="text-[#C7BFB2]/60">Cost / Unit</p>
                            <p className="font-medium text-[#F7F3EC]">₹{item.cost_per_unit.toLocaleString()}</p>
                          </div>
                          <div className="space-y-1 text-xs text-right">
                            <p className="text-[#C7BFB2]/60">Expiry Date</p>
                            <p className={`font-medium ${item.expiry && new Date(item.expiry) < new Date() ? 'text-red-400' : 'text-[#F7F3EC]'}`}>
                              {item.expiry ? new Date(item.expiry).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                {filteredInventory.length === 0 && (
                  <div className="col-span-full py-12 text-center border border-dashed border-[#D4A24C]/20 rounded-xl">
                    <Package className="mx-auto h-8 w-8 text-[#C7BFB2]/40 mb-3" />
                    <h3 className="text-sm font-medium text-[#F7F3EC]">No items found</h3>
                    <p className="text-xs text-[#C7BFB2] mt-1">Try adjusting your filters or add a new item.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg rounded-2xl border border-[#D4A24C]/20 bg-[#0D0B09] p-6 shadow-2xl">
              <button onClick={() => setShowForm(false)} className="absolute right-6 top-6 text-[#C7BFB2] hover:text-white"><X size={20} /></button>
              <h2 className="font-serif text-xl text-[#F7F3EC] mb-5">{editingId ? "Edit Item" : "Add Inventory Item"}</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#C7BFB2]">Name *</label>
                    <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-[#D4A24C]/15 bg-[#141210] p-2.5 text-sm text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#C7BFB2]">Category</label>
                    <input type="text" list="inventory-categories" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-[#D4A24C]/15 bg-[#141210] p-2.5 text-sm text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40" />
                    <datalist id="inventory-categories">{CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#C7BFB2]">Current Stock</label>
                    <input type="number" step="0.1" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseFloat(e.target.value) || 0 })} className="w-full rounded-lg border border-[#D4A24C]/15 bg-[#141210] p-2.5 text-sm text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#C7BFB2]">Min. Stock Alert</label>
                    <input type="number" step="0.1" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: parseFloat(e.target.value) || 0 })} className="w-full rounded-lg border border-[#D4A24C]/15 bg-[#141210] p-2.5 text-sm text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#C7BFB2]">Unit</label>
                    <input type="text" list="inventory-units" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full rounded-lg border border-[#D4A24C]/15 bg-[#141210] p-2.5 text-sm text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40 uppercase" />
                    <datalist id="inventory-units">{UNITS.map((u) => <option key={u} value={u} />)}</datalist>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#C7BFB2]">Cost Per Unit (₹)</label>
                    <input type="number" step="0.01" value={form.cost_per_unit} onChange={(e) => setForm({ ...form, cost_per_unit: parseFloat(e.target.value) || 0 })} className="w-full rounded-lg border border-[#D4A24C]/15 bg-[#141210] p-2.5 text-sm text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#C7BFB2]">Expiry Date</label>
                    <input type="date" value={form.expiry || ""} onChange={(e) => setForm({ ...form, expiry: e.target.value })} className="w-full rounded-lg border border-[#D4A24C]/15 bg-[#141210] p-2.5 text-sm text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40 [color-scheme:dark]" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-lg border border-[#D4A24C]/20 bg-transparent py-2.5 text-sm font-medium text-[#F7F3EC] hover:bg-white/5 transition-colors">Cancel</button>
                  <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 rounded-lg bg-[#D4A24C] py-2.5 text-sm font-bold text-[#1A1410] hover:bg-[#c8963f] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 size={16} className="animate-spin" />}
                    Save Item
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
