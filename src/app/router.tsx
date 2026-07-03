import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { CustomCursor } from '@/components/common/CustomCursor';
import { Chatbot } from '@/components/common/Chatbot';
import { Home } from '@/pages/Home';
import MenuPage from '@/pages/MenuPage';

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToHashElement() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (hash) {
      const elementId = hash.replace('#', '');
      const timer = setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 200);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash, pathname]);

  return null;
}

function RootLayout() {
  return (
    <>
      <CustomCursor />
      <ScrollToHashElement />
      <Outlet />
      <Chatbot />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/menu', element: <MenuPage /> },
      { path: '/menu/:categorySlug', element: <MenuPage /> },

      // Milestone 3: Cart & Checkout
      { path: '/cart', lazy: () => import('@/pages/CartPage').then(m => ({ Component: m.default })) },
      { path: '/checkout', lazy: () => import('@/pages/CheckoutPage').then(m => ({ Component: m.default })) },

      // Milestone 4: Order tracking
      { path: '/order/:trackingToken', lazy: () => import('@/pages/OrderTrackingPage').then(m => ({ Component: m.default })) },
      { path: '/my-orders', lazy: () => import('@/pages/MyOrdersPage').then(m => ({ Component: m.default })) },

      // Milestone 5: Chef dashboard
      { path: '/chef/login', lazy: () => import('@/pages/ChefLoginPage').then(m => ({ Component: m.default })) },
      { 
        path: '/chef', 
        lazy: () => import('@/components/auth/ProtectedRoute').then(m => ({ Component: m.ProtectedRoute })),
        loader: () => ({ allowedRoles: ['chef', 'admin'], redirectPath: '/chef/login' }),
        children: [
          { index: true, lazy: () => import('@/pages/ChefDashboardPage').then(m => ({ Component: m.default })) },
        ]
      },

      // Milestone 6: Admin dashboard
      { path: '/admin/login', lazy: () => import('@/pages/AdminLoginPage').then(m => ({ Component: m.default })) },
      {
        path: '/admin',
        lazy: () => import('@/components/auth/ProtectedRoute').then(m => ({ Component: m.ProtectedRoute })),
        loader: () => ({ allowedRoles: ['admin'], redirectPath: '/admin/login' }),
        children: [
          {
            path: '',
            lazy: () => import('@/components/layout/AdminLayout').then(m => ({ Component: m.AdminLayout })),
            children: [
              { index: true, lazy: () => import('@/pages/AdminDashboardPage').then(m => ({ Component: m.default })) },
              { path: 'menu', lazy: () => import('@/pages/AdminMenuPage').then(m => ({ Component: m.default })) },
              { path: 'ads', lazy: () => import('@/pages/AdminAdsPage').then(m => ({ Component: m.default })) },
              { path: 'orders', lazy: () => import('@/pages/AdminOrdersPage').then(m => ({ Component: m.default })) },
              { path: 'reservations', lazy: () => import('@/pages/AdminReservationsPage').then(m => ({ Component: m.default })) },
            ],
          }
        ]
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
