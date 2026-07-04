import { ChevronRight } from 'lucide-react';

export interface TableOption {
  id: string;
  name: string;
  img: string;
  desc: string;
}

export const TABLE_OPTIONS: TableOption[] = [
  { 
    id: 'sidetine',
    name: 'Sidetine Dining', 
    img: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=500', 
    desc: 'Elegant dining with panoramic city views.' 
  },
  { 
    id: 'main-hall',
    name: 'Main Dining Hall', 
    img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=500', 
    desc: 'Vibrant atmosphere in the heart of the restaurant.' 
  },
  { 
    id: 'intimate',
    name: 'Intimate Table', 
    img: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?q=80&w=500', 
    desc: 'A cozy corner for a private dining experience.' 
  }
];

interface TableSelectionProps {
  onSelect: (tableName: string) => void;
}

export function TableSelection({ onSelect }: TableSelectionProps) {
  return (
    <div className="space-y-4">
      {TABLE_OPTIONS.map((table) => (
        <div key={table.id} className="w-full max-w-[373px] mx-auto bg-gradient-to-b from-white/5 to-black/40 border border-[#FFB846]/30 rounded-[22px] h-[165px] relative overflow-hidden flex items-center p-1 shrink-0">
          <img src={table.img} alt={table.name} className="w-[160px] sm:w-[195px] h-[157px] object-cover rounded-[16px] shrink-0" />
          <div className="pl-4 pr-1 flex flex-col justify-center h-[157px]">
            <h3 className="text-white font-semibold text-[15px] leading-tight mb-1 font-sans">{table.name}</h3>
            <p className="text-white font-light text-[13px] leading-[16px] mb-4 opacity-90 font-sans">{table.desc}</p>
            
            <button 
              type="button"
              onClick={() => onSelect(table.name)}
              className="flex items-center justify-between h-[34px] pl-4 pr-0.5 rounded-full bg-gradient-to-r from-[#FFB846] to-[#FFCC02] text-black font-semibold text-[13px] hover:opacity-90 transition-opacity w-[145px]"
            >
              <span>Reserve a Table</span>
              <div className="w-[30px] h-[30px] rounded-full bg-black flex items-center justify-center shrink-0">
                <ChevronRight size={14} className="text-[#FFB846]" />
              </div>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
