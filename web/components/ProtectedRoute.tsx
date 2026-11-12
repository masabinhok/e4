"use client";

import { useAuth } from "@/store/auth";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

export function PageSpinner() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex min-h-[50vh] items-center justify-center"
    >
      <div className="size-8 animate-spin rounded-full border-2 border-line border-t-brass" />
    </div>
  );
}

// Redirect only after the session check has finished. Deciding earlier bounced
// every reload of a protected page to the login page (and from there to /lessons).
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, checkAuth } = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    checkAuth().finally(() => setChecked(true));
  }, [checkAuth]);

  useEffect(() => {
    if (checked && !isAuthenticated) router.replace("/auth/login");
  }, [checked, isAuthenticated, router]);

  if (!user) return checked ? null : <PageSpinner />;
  return <>{children}</>;
}
