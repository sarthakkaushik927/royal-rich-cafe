"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, UtensilsCrossed, Megaphone, ReceiptText, LogOut, Menu, X, Diamond, Calendar } from 'lucide-react';
import { authService } from '@/services/authService';
import { AdminMobileBottomNav } from './AdminMobileBottomNav';

const navItems = [
  { label: 'Overview', path: '/admin', icon: LayoutDashboard },
  { label: 'Menu Management', path: '/admin/menu', icon: UtensilsCrossed },
  { label: 'Advertisements', path: '/admin/ads', icon: Megaphone },
  { label: 'All Orders', path: '/admin/orders', icon: ReceiptText },
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
          if (mounted) router.push('/admin/login');
          return;
        }
        const profile = await authService.getProfile(session.userId);
        if (profile.role !== 'admin') {
          if (mounted) router.push('/'); // Kick non-admins to home
          return;
        }
        if (mounted) setIsAuthorized(true);
      } catch (err) {
        if (mounted) router.push('/');
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
    router.push('/admin/login');
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-6 border-b border-[#D4A24C]/20">
        <Link href="/" className="flex items-center gap-2 text-[#D4A24C]">
          <Diamond size={20} />
          <span className="font-serif font-bold tracking-wider uppercase">Royal Admin</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#D4A24C]/10 text-[#D4A24C]'
                  : 'text-[#C7BFB2] hover:bg-white/5 hover:text-[#F7F3EC]'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-[#D4A24C]/20">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[#C7BFB2] transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0D0B09] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-[#D4A24C]/20 bg-[#141210]">
        <SidebarContent />
      </aside>

      {/* Mobile Top Header (Just for Logo/Logout now) */}
      <div className="md:hidden">
        <header className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-[#D4A24C]/20 bg-[#141210] px-4">
          <Link href="/" className="flex items-center gap-2 text-[#D4A24C]">
            <Diamond size={20} />
            <span className="font-serif font-bold tracking-wider uppercase">Royal Admin</span>
          </Link>
          <button onClick={handleLogout} className="text-[#C7BFB2] hover:text-[#D4A24C] p-2 transition-colors">
            <LogOut size={20} />
          </button>
        </header>
        <AdminMobileBottomNav />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#0D0B09] pt-16 md:pt-0 pb-24 md:pb-0">
        {children}
      </main>
    </div>
  );
}
