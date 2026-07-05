"use client";
import { useState } from 'react';

const mockInventory = [
  { id: '1', name: 'Italian Burrata', minStock: 5, stock: 15, unit: 'KG', expiry: '2028-07-15' },
  { id: '2', name: 'Kelp Caviar', minStock: 0.5, stock: 4.2, unit: 'KG', expiry: '2028-08-30' },
  { id: '3', name: 'Artichoke Hearts', minStock: 40, stock: 120, unit: 'PCS', expiry: '2028-07-08' },
  { id: '4', name: 'Perigord Black Truffles', minStock: 0.3, stock: 0.8, unit: 'KG', expiry: '2028-07-20' },
  { id: '5', name: 'King Oyster Mushrooms', minStock: 8, stock: 24, unit: 'KG', expiry: '2028-07-08' },
  { id: '6', name: 'Chateau Margaux 2015', minStock: 10, stock: 36, unit: 'BOTTLES', expiry: '2036-12-31' },
  { id: '7', name: 'Edible 24k Gold Leaf', minStock: 20, stock: 100, unit: 'SHEETS', expiry: '2029-01-01' },
  { id: '8', name: 'Acquerello Rice', minStock: 10, stock: 25, unit: 'KG', expiry: '2027-02-15' },
];

export default function Page() {
  const [inventory, setInventory] = useState(mockInventory);

  const adjustStock = (id: string, delta: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, stock: Math.max(0, Number((item.stock + delta).toFixed(1))) } : item
      )
    );
  };

  return (
    <div className="rounded-xl glass-card p-6 space-y-6 animate-fade-in pt-6 mt-4">
      <h3 className="font-serif text-lg text-[#D4A24C] border-b border-[#D4A24C]/10 pb-2 uppercase tracking-wider">
        Larder & Kitchen Stock Levels
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {inventory.map((item) => {
          const lowStock = item.stock <= item.minStock;
          return (
            <div 
              key={item.id} 
              className={`p-4 border rounded-lg bg-black/40 flex justify-between items-center text-xs ${
                lowStock ? 'border-red-500/35 bg-red-950/5 animate-pulse' : 'border-[#D4A24C]/10'
              }`}
            >
              <div className="space-y-1.5 max-w-[60%]">
                <div className="flex items-baseline space-x-1.5">
                  <span className="font-bold text-[#F7F3EC] text-sm">{item.name}</span>
                  {lowStock && (
                    <span className="text-[8px] text-red-400 font-bold uppercase tracking-wider animate-bounce">
                      ⚠️ Low Stock
                    </span>
                  )}
                </div>
                
                <div className="flex space-x-3 text-[10px] text-[#C7BFB2]/60">
                  <span>Min Target: {item.minStock} {item.unit}</span>
                  <span>Expiry: {item.expiry}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Controls */}
                <button
                  onClick={() => adjustStock(item.id, -1)}
                  className="w-8 h-8 rounded border border-[#D4A24C]/25 hover:border-[#D4A24C] flex items-center justify-center font-bold text-[#F7F3EC] transition"
                >
                  -
                </button>
                
                <div className="text-center w-14">
                  <span className={`font-mono text-sm font-bold ${lowStock ? 'text-red-400' : 'text-[#D4A24C]'}`}>
                    {item.stock}
                  </span>
                  <span className="text-[9px] text-[#C7BFB2]/60 block uppercase">{item.unit}</span>
                </div>

                <button
                  onClick={() => adjustStock(item.id, 1)}
                  className="w-8 h-8 rounded border border-[#D4A24C]/25 hover:border-[#D4A24C] flex items-center justify-center font-bold text-[#F7F3EC] transition"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
