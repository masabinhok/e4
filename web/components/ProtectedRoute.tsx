
'use client'

import { useAuth } from "@/store/auth";


import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

interface ProtectedRouteProps {
  children: ReactNode,
  fallback?: ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, checkAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Always check auth on mount
    checkAuth();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      )
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return <>{children}</>;
}