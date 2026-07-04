"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, UtensilsCrossed, Megaphone, ReceiptText, Calendar } from 'lucide-react';

export function AdminMobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Menu', path: '/admin/menu', icon: UtensilsCrossed },
    { label: 'Ads', path: '/admin/ads', icon: Megaphone },
    { label: 'Orders', path: '/admin/orders', icon: ReceiptText },
    { label: 'Reserve', path: '/admin/reservations', icon: Calendar },
  ];

  const activeIndex = navItems.findIndex(
    (item) => pathname === item.path || (item.path !== '/admin' && pathname?.startsWith(item.path))
  );

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 flex justify-center z-[100] pb-0">
      <div className="relative bg-[#FFB846] w-full h-[62px] rounded-t-[32px] flex items-center w-full shadow-[0_-10px_40px_rgba(255,184,70,0.15)]">
        
        {/* The moving Cutout (dent) */}
        {activeIndex !== -1 && (
          <div 
            className="absolute top-0 left-0 h-[56px] w-[20%] transition-transform duration-500 ease-in-out flex justify-center pointer-events-none"
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
          >
            {/* SVG for smooth cutout - dips down to create a black background for the icon */}
            <svg width="90" height="46" viewBox="0 0 86 46" className="fill-[#0D0B09] -mt-[1px]">
              <path d="M0,0 C18,0 23,44 43,44 C63,44 68,0 86,0 Z" />
            </svg>
          </div>
        )}

        {navItems.map((item, index) => {
          const isActive = index === activeIndex;
          const Icon = item.icon;

          return (
            <Link 
              key={item.path} 
              href={item.path} 
              className="relative flex flex-col items-center justify-center w-[20%] h-full z-10 tap-highlight-transparent pt-1"
            >
              <div className="flex flex-col items-center justify-between h-[46px]">
                <div className={`flex items-center justify-center transition-colors duration-500 z-20 mt-0.5 ${
                  isActive ? 'text-[#FFB846]' : 'text-[#161718]'
                }`}>
                  <Icon size={22} className={isActive ? 'stroke-[2.5]' : 'stroke-2'} fill="none" />
                </div>
                <span className="text-[11px] font-medium text-[#161718] z-20 mb-0.5">
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
