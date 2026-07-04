"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, UtensilsCrossed, Search, ShoppingBag, User } from 'lucide-react';
import { useCartStore } from '@/hooks/useCartStore';

export function BottomNav() {
  const pathname = usePathname();
  const totalCartItems = useCartStore((s) => s.totalItems());

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Menu', href: '/menu', icon: UtensilsCrossed },
    { label: 'Cart', href: '/checkout', icon: ShoppingBag, badge: totalCartItems > 0 ? totalCartItems : null },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#161718] border-t border-white/5 pb-safe pt-2 px-6 pb-4">
      <div className="flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className="relative flex flex-col items-center gap-1"
            >
              <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-[#FFB846]/20 text-[#FFB846]' : 'text-white/40 hover:text-white/70'}`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {item.badge && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FFB846] text-[9px] font-bold text-black border border-[#161718]">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-[#FFB846]' : 'text-white/40'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
