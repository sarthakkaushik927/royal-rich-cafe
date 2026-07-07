"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
  costPerUnit: number;
  expiry: string;
};

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

const initialInventory: InventoryItem[] = [
  { id: "1", name: "Italian Burrata", category: "Dairy & Cheese", minStock: 5, stock: 15, unit: "KG", costPerUnit: 1200, expiry: "2028-07-15" },
  { id: "2", name: "Kelp Caviar", category: "Garnishes", minStock: 0.5, stock: 4.2, unit: "KG", costPerUnit: 8500, expiry: "2028-08-30" },
  { id: "3", name: "Artichoke Hearts", category: "Vegetables", minStock: 40, stock: 120, unit: "PCS", costPerUnit: 45, expiry: "2028-07-08" },
  { id: "4", name: "Perigord Black Truffles", category: "Garnishes", minStock: 0.3, stock: 0.8, unit: "KG", costPerUnit: 45000, expiry: "2028-07-20" },
  { id: "5", name: "King Oyster Mushrooms", category: "Vegetables", minStock: 8, stock: 24, unit: "KG", costPerUnit: 350, expiry: "2028-07-08" },
  { id: "6", name: "Chateau Margaux 2015", category: "Beverages", minStock: 10, stock: 36, unit: "BOTTLES", costPerUnit: 12000, expiry: "2036-12-31" },
  { id: "7", name: "Edible 24k Gold Leaf", category: "Garnishes", minStock: 20, stock: 100, unit: "SHEETS", costPerUnit: 180, expiry: "2029-01-01" },
  { id: "8", name: "Acquerello Rice", category: "Grains & Pasta", minStock: 10, stock: 25, unit: "KG", costPerUnit: 800, expiry: "2027-02-15" },
];

const emptyForm: Omit<InventoryItem, "id"> = {
  name: "",
  category: "Other",
  stock: 0,
  minStock: 0,
  unit: "KG",
  costPerUnit: 0,
  expiry: "",
};

export default function Page() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
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
      const aLow = a.stock <= a.minStock ? 0 : 1;
      const bLow = b.stock <= b.minStock ? 0 : 1;
      return aLow - bLow || a.name.localeCompare(b.name);
    });

  const lowStockCount = inventory.filter((i) => i.stock <= i.minStock).length;
  const totalValue = inventory.reduce((sum, i) => sum + i.stock * i.costPerUnit, 0);

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
      minStock: item.minStock,
      unit: item.unit,
      costPerUnit: item.costPerUnit,
      expiry: item.expiry,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      setInventory((prev) =>
        prev.map((item) => (item.id === editingId ? { ...item, ...form } : item))
      );
    } else {
      setInventory((prev) => [
        ...prev,
        { ...form, id: `inv_${Date.now()}` },
      ]);
    }
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setInventory((prev) => prev.filter((i) => i.id !== id));
  };

  const adjustStock = (id: string, delta: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, stock: Math.max(0, Number((item.stock + delta).toFixed(1))) }
          : item
      )
    );
  };

  const setStockDirect = (id: string, val: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, stock: Math.max(0, val) } : item
      )
    );
    setStockInput(null);
  };

  return (
    <div className="animate-fade-in pt-4 space-y-6">
      {/* Stats bar */}
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

        {/* Filters */}
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

        {/* Inventory grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInventory.map((item) => {
            const lowStock = item.stock <= item.minStock;
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
                    <div className="flex flex-wrap gap-2 text-[10px]">
                      <span className="px-2 py-0.5 rounded-full bg-[#D4A24C]/10 text-[#D4A24C] font-medium">
                        {item.category}
                      </span>
                      <span className="text-[#C7BFB2]/50">
                        ₹{item.costPerUnit}/{item.unit}
                      </span>
                      {item.expiry && (
                        <span className="text-[#C7BFB2]/50">Exp: {item.expiry}</span>
                      )}
                    </div>
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

                {/* Stock controls */}
                <div className="flex items-center justify-between pt-2 border-t border-[#D4A24C]/5">
                  <div className="text-[10px] text-[#C7BFB2]/50">
                    Min: {item.minStock} {item.unit}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => adjustStock(item.id, -1)}
                      className="w-7 h-7 rounded border border-[#D4A24C]/25 hover:border-[#D4A24C] flex items-center justify-center font-bold text-[#F7F3EC] text-sm transition"
                    >
                      −
                    </button>

                    {isEditingStock ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          autoFocus
                          value={stockInput.value}
                          onChange={(e) =>
                            setStockInput({ id: item.id, value: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") setStockDirect(item.id, Number(stockInput.value));
                            if (e.key === "Escape") setStockInput(null);
                          }}
                          className="w-16 text-center bg-black/60 border border-[#D4A24C]/40 rounded px-1 py-0.5 text-sm text-[#D4A24C] font-mono outline-none"
                        />
                        <button
                          onClick={() => setStockDirect(item.id, Number(stockInput.value))}
                          className="p-1 text-green-400 hover:bg-green-500/10 rounded"
                        >
                          <Check size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          setStockInput({ id: item.id, value: String(item.stock) })
                        }
                        className="text-center w-16 cursor-pointer hover:bg-white/5 rounded py-0.5 transition-colors"
                        title="Click to type value"
                      >
                        <span
                          className={`font-mono text-sm font-bold ${
                            lowStock ? "text-red-400" : "text-[#D4A24C]"
                          }`}
                        >
                          {item.stock}
                        </span>
                        <span className="text-[9px] text-[#C7BFB2]/60 block uppercase">
                          {item.unit}
                        </span>
                      </button>
                    )}

                    <button
                      onClick={() => adjustStock(item.id, 1)}
                      className="w-7 h-7 rounded border border-[#D4A24C]/25 hover:border-[#D4A24C] flex items-center justify-center font-bold text-[#F7F3EC] text-sm transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowForm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg rounded-2xl border border-[#D4A24C]/20 bg-[#0D0B09] p-6 shadow-2xl"
            >
              <button
                onClick={() => setShowForm(false)}
                className="absolute right-6 top-6 text-[#C7BFB2] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="font-serif text-xl text-[#F7F3EC] mb-5">
                {editingId ? "Edit Item" : "Add Inventory Item"}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#C7BFB2]">Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded-lg border border-[#D4A24C]/15 bg-[#141210] p-2.5 text-sm text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40"
                      placeholder="e.g. Wagyu Beef"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#C7BFB2]">Category</label>
                    <input
                      type="text"
                      list="inventory-categories"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full rounded-lg border border-[#D4A24C]/15 bg-[#141210] p-2.5 text-sm text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40"
                      placeholder="e.g. Vegetables"
                    />
                    <datalist id="inventory-categories">
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#C7BFB2]">Current Stock</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                      className="w-full rounded-lg border border-[#D4A24C]/15 bg-[#141210] p-2.5 text-sm text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#C7BFB2]">Min Stock</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={form.minStock}
                      onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })}
                      className="w-full rounded-lg border border-[#D4A24C]/15 bg-[#141210] p-2.5 text-sm text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#C7BFB2]">Unit</label>
                    <input
                      type="text"
                      list="inventory-units"
                      value={form.unit}
                      onChange={(e) => setForm({ ...form, unit: e.target.value })}
                      className="w-full rounded-lg border border-[#D4A24C]/15 bg-[#141210] p-2.5 text-sm text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40 uppercase"
                      placeholder="e.g. KG"
                    />
                    <datalist id="inventory-units">
                      {UNITS.map((u) => (
                        <option key={u} value={u} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#C7BFB2]">Cost per Unit (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.costPerUnit}
                      onChange={(e) => setForm({ ...form, costPerUnit: Number(e.target.value) })}
                      className="w-full rounded-lg border border-[#D4A24C]/15 bg-[#141210] p-2.5 text-sm text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#C7BFB2]">Expiry Date</label>
                    <input
                      type="date"
                      value={form.expiry}
                      onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                      className="w-full rounded-lg border border-[#D4A24C]/15 bg-[#141210] p-2.5 text-sm text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40 [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-3">
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-5 py-2 rounded-lg text-sm font-medium text-[#C7BFB2] hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!form.name.trim()}
                    className="flex items-center gap-2 rounded-lg bg-[#D4A24C] px-5 py-2 text-sm font-medium text-[#1A1410] hover:bg-[#c8963f] transition-all disabled:opacity-50"
                  >
                    {editingId ? "Save Changes" : "Add Item"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
