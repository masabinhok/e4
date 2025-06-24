import RequireAdmin from "@/components/RequireAdmin";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAdmin>
      {children}
    </RequireAdmin>
  )
}