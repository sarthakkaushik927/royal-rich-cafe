import { Navigate, Outlet, useLoaderData } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/lib/types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  redirectPath?: string;
}

export function ProtectedRoute(props: ProtectedRouteProps) {
  const loaderData = useLoaderData() as ProtectedRouteProps | undefined;
  const allowedRoles = props.allowedRoles || loaderData?.allowedRoles || [];
  const redirectPath = props.redirectPath || loaderData?.redirectPath || '/';
  
  const { profile, loading, isAuthenticated } = useAuth();

  // Show a full-page loading spinner while we resolve auth
  if (loading || (isAuthenticated && !profile)) {
    return (
      <div className="min-h-screen bg-[#0D0B09] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#D4A24C] w-8 h-8" />
      </div>
    );
  }

  // If completely unauthenticated, bounce to login or home
  if (!isAuthenticated || !profile) {
    return <Navigate to={redirectPath} replace />;
  }

  // If authenticated but wrong role, bounce home
  if (!allowedRoles.includes(profile.role as UserRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
