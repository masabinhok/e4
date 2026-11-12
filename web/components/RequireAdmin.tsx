"use client";
import { useAuth } from "@/store/auth";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { PageSpinner } from "@/components/ProtectedRoute";

// Checks with the API before deciding; the persisted user may be stale. The API
// enforces the admin role either way.
export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, checkAuth } = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    checkAuth().then(() => setChecked(true));
  }, [checkAuth]);

  useEffect(() => {
    if (checked && user?.role !== "ADMIN")
      router.push(user ? "/unauthorized" : "/auth/login");
  }, [checked, user, router]);

  if (!checked || user?.role !== "ADMIN") return <PageSpinner />;
  return <>{children}</>;
}
