import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, Megaphone, ReceiptText, LogOut, Menu, X, Diamond, Calendar } from 'lucide-react';
import { authService } from '@/services/authService';

const navItems = [
  { label: 'Overview', path: '/admin', icon: LayoutDashboard },
  { label: 'Menu Management', path: '/admin/menu', icon: UtensilsCrossed },
  { label: 'Advertisements', path: '/admin/ads', icon: Megaphone },
  { label: 'All Orders', path: '/admin/orders', icon: ReceiptText },
  { label: 'Reservations', path: '/admin/reservations', icon: Calendar },
];

export function AdminLayout({ children }: { children?: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authService.signOut();
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-6 border-b border-[#D4A24C]/20">
        <Link to="/" className="flex items-center gap-2 text-[#D4A24C]">
          <Diamond size={20} />
          <span className="font-serif font-bold tracking-wider uppercase">Royal Admin</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
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

      {/* Mobile Header & Sidebar overlay */}
      <div className="md:hidden">
        <header className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-[#D4A24C]/20 bg-[#141210] px-4">
          <Link to="/" className="flex items-center gap-2 text-[#D4A24C]">
            <Diamond size={20} />
            <span className="font-serif font-bold tracking-wider uppercase">Royal Admin</span>
          </Link>
          <button onClick={() => setMobileOpen(true)} className="text-[#F7F3EC] p-2">
            <Menu size={24} />
          </button>
        </header>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <aside className="relative w-64 bg-[#141210] border-r border-[#D4A24C]/20 h-full flex flex-col">
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-2 text-[#C7BFB2] hover:text-white"
              >
                <X size={20} />
              </button>
              <SidebarContent />
            </aside>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#0D0B09] pt-16 md:pt-0">
        {children || <Outlet />}
      </main>
    </div>
  );
}
