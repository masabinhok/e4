import type { Metadata } from "next";
import RequireAdmin from "@/components/RequireAdmin";
import { ReactNode } from "react";

export const metadata: Metadata = { robots: { index: false } };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <RequireAdmin>{children}</RequireAdmin>;
}
