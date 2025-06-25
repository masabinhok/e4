'use client'

import { useAuth } from "@/store/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Unauthorized() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === 'ADMIN') {
        router.push('/admin')
    }
  })
  return (
    <div className="p-10 text-center   text-red-500">
      🚫 You do not have permission to view this page.
    </div>
  );
}
