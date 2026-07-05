"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, UtensilsCrossed, Megaphone, ReceiptText, LogOut, Menu, X, Diamond, Calendar } from 'lucide-react';
import { authService } from '@/services/authService';
import { AdminMobileBottomNav } from './AdminMobileBottomNav';

const navItems = [
  { label: 'Analytics', path: '/admin', icon: LayoutDashboard },
  { label: 'Menu CMS', path: '/admin/menu', icon: UtensilsCrossed },
  { label: 'Inventory', path: '/admin/inventory', icon: Diamond },
  { label: 'Ads CMS', path: '/admin/ads', icon: Megaphone },
  { label: 'Orders', path: '/admin/orders', icon: ReceiptText },
  { label: 'Reservations', path: '/admin/reservations', icon: Calendar },
];

export function AdminLayout({ children }: { children?: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    
    if (pathname === '/admin/login') {
      setIsAuthorized(true);
      return;
    }

    const checkAuth = async () => {
      try {
        const session = await authService.getSession();
        if (!session) {
          if (mounted) router.replace('/admin/login');
          return;
        }
        const profile = await authService.getProfile(session.userId);
        if (profile.role !== 'admin') {
          if (mounted) router.replace('/admin/login'); // Redirect non-admins to login
          return;
        }
        if (mounted) setIsAuthorized(true);
      } catch (err) {
        if (mounted) router.replace('/');
      }
    };
    checkAuth();
    return () => { mounted = false; };
  }, [router, pathname]);

  // Allow the layout (and sidebar) to render if we are on the login page,
  // otherwise show the verifying screen until authorized.
  const isLoginPage = pathname === '/admin/login';

  if (!isAuthorized && !isLoginPage) {
    return (
      <div className="min-h-screen bg-[#0D0B09] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4 text-[#D4A24C]">
          <Diamond size={32} className="animate-bounce" />
          <span className="text-sm tracking-widest uppercase">Verifying Clearance...</span>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await authService.signOut();
    router.replace('/admin/login');
  };

  return (
    <div className="pt-32 pb-24 bg-[#0B0B0B] text-[#F7F3EC] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header matching reference */}
        <div className="flex items-center justify-between mb-10 border-b border-[#D4A24C]/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#D4A24C] text-[#0D0B09] rounded">
              <Diamond size={28} />
            </div>
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-wide">
                Royal Rich <span className="text-[#D4A24C]">Administration Hub</span>
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-[#C7BFB2] font-semibold">
                Global content editor, stock levels, and operations panel
              </p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm font-medium text-[#C7BFB2] transition-colors hover:text-red-400">
             <LogOut size={20} />
             <span className="hidden md:inline uppercase tracking-wider text-[10px] font-bold">Sign Out</span>
          </button>
        </div>

        {/* Dash Tabs matching reference */}
        <div className="flex space-x-2 border-b border-[#D4A24C]/10 mb-8 pb-1 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition duration-300 whitespace-nowrap flex items-center gap-2 ${
                  isActive 
                    ? 'text-[#D4A24C] border-b-2 border-[#D4A24C]' 
                    : 'text-[#C7BFB2]/50 hover:text-[#D4A24C]'
                }`}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -15, filter: 'blur(8px)' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
      
      {/* Mobile nav fallback if needed */}
      <div className="md:hidden">
        <AdminMobileBottomNav />
      </div>
    </div>
  );
}
