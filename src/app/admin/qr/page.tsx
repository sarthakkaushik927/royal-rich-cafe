"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { RestaurantTable } from '@/lib/types';
import { toast } from 'sonner';
import { Loader2, Plus, QrCode, Trash2, Printer, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function AdminQRPage() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTable, setNewTable] = useState({ table_number: '', floor_number: '', capacity: 4 });
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
    fetchTables();
  }, []);

  const fetchTables = async () => {
    const { data, error } = await supabase
      .from('restaurant_tables')
      .select('*')
      .order('table_number', { ascending: true });
      
    if (error) {
      toast.error('Failed to fetch tables');
    } else {
      setTables(data as RestaurantTable[]);
    }
    setLoading(false);
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase
      .from('restaurant_tables')
      .insert([newTable])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        toast.error('Table number already exists');
      } else {
        toast.error('Failed to add table');
      }
    } else {
      toast.success('Table added successfully');
      setTables([...tables, data as RestaurantTable]);
      setIsModalOpen(false);
      setNewTable({ table_number: '', floor_number: '', capacity: 4 });
    }
    setLoading(false);
  };

  const handleDeleteTable = async (id: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return;
    const { error } = await supabase.from('restaurant_tables').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete table');
    } else {
      toast.success('Table deleted');
      setTables(tables.filter((t) => t.id !== id));
    }
  };

  const handlePrint = (table: RestaurantTable) => {
    const printContent = document.getElementById(`qr-${table.id}`);
    if (!printContent) return;
    
    const windowPrint = window.open('', '', 'width=600,height=600');
    if (!windowPrint) return;

    windowPrint.document.write(`
      <html>
        <head>
          <title>Print QR Code - Table ${table.table_number}</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
            .qr-container { text-align: center; border: 2px solid #000; padding: 2rem; border-radius: 12px; }
            h1 { margin-bottom: 0.5rem; }
            h3 { margin-top: 0; color: #555; }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1>Royal Rich Cafe</h1>
            <h3>Table ${table.table_number} ${table.floor_number ? `| Floor ${table.floor_number}` : ''}</h3>
            ${printContent.innerHTML}
            <p style="margin-top: 1rem;">Scan to view menu and order</p>
          </div>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `);
    windowPrint.document.close();
  };

  if (loading && tables.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4A24C]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif text-[#F7F3EC] mb-2 flex items-center gap-2">
            <QrCode className="text-[#D4A24C]" />
            Table QR Management
          </h1>
          <p className="text-[#C7BFB2] text-sm">Create and print QR codes for tables.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#D4A24C] text-[#1A1410] px-4 py-2 rounded-lg font-medium hover:bg-[#c8963f] transition-colors"
        >
          <Plus size={18} />
          Add Table
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map((table) => {
          const tableUrl = `${origin}/menu?table=${table.table_number}`;
          return (
            <div key={table.id} className="bg-[#141210] border border-[#D4A24C]/20 rounded-xl p-6 flex flex-col items-center relative group">
              <button 
                onClick={() => handleDeleteTable(table.id)}
                className="absolute top-3 right-3 text-[#C7BFB2]/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={18} />
              </button>
              
              <div className="text-center mb-4">
                <h3 className="text-xl font-serif text-[#F7F3EC]">Table {table.table_number}</h3>
                <p className="text-xs text-[#C7BFB2] uppercase tracking-wider">
                  {table.floor_number ? `Floor ${table.floor_number}` : 'Main Area'} • Cap: {table.capacity}
                </p>
              </div>

              <div id={`qr-${table.id}`} className="bg-white p-3 rounded-lg mb-4">
                <QRCodeSVG value={tableUrl} size={150} level="H" includeMargin={false} />
              </div>

              <button
                onClick={() => handlePrint(table)}
                className="flex items-center gap-2 text-sm text-[#D4A24C] border border-[#D4A24C]/30 px-4 py-2 rounded-lg hover:bg-[#D4A24C]/10 transition-colors w-full justify-center"
              >
                <Printer size={16} />
                Print QR Code
              </button>
            </div>
          );
        })}
        {tables.length === 0 && (
          <div className="col-span-full py-12 text-center border border-dashed border-[#D4A24C]/20 rounded-xl">
            <QrCode className="mx-auto h-12 w-12 text-[#D4A24C]/40 mb-3" />
            <p className="text-[#C7BFB2]">No tables created yet.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div className="bg-[#141210] border border-[#D4A24C]/20 rounded-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#C7BFB2] hover:text-white"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-serif text-[#F7F3EC] mb-6">Add New Table</h2>
            
            <form onSubmit={handleAddTable} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#C7BFB2] mb-1.5">Table Number *</label>
                <input
                  required
                  value={newTable.table_number}
                  onChange={(e) => setNewTable({ ...newTable, table_number: e.target.value })}
                  className="w-full h-11 rounded-lg border border-[#D4A24C]/15 bg-transparent px-4 text-sm text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40"
                  placeholder="e.g. 12 or T-12"
                />
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#C7BFB2] mb-1.5">Floor Number / Area</label>
                <input
                  value={newTable.floor_number}
                  onChange={(e) => setNewTable({ ...newTable, floor_number: e.target.value })}
                  className="w-full h-11 rounded-lg border border-[#D4A24C]/15 bg-transparent px-4 text-sm text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40"
                  placeholder="e.g. 1, Ground, Rooftop"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-[#C7BFB2] mb-1.5">Seating Capacity</label>
                <input
                  type="number"
                  min="1"
                  value={newTable.capacity}
                  onChange={(e) => setNewTable({ ...newTable, capacity: parseInt(e.target.value) || 4 })}
                  className="w-full h-11 rounded-lg border border-[#D4A24C]/15 bg-transparent px-4 text-sm text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#D4A24C] text-[#1A1410] font-medium py-3 rounded-lg hover:bg-[#c8963f] transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Create Table QR'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
