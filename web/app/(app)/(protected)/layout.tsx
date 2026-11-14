import type { Metadata } from "next";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ReactNode } from "react";

export const metadata: Metadata = { robots: { index: false } };

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
