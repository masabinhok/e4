'use client'
import { useAuth } from "@/store/auth";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/unauthorized');
    }
  }, [user, isLoading, router])

  if (isLoading || !user) return <div> Loading... </div>;

  return <>{children}</>
}