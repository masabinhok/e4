"use client";
import { useEffect, useState } from "react";

// The free API host sleeps when idle. If it hasn't answered within 2 s, say so
// instead of leaving people staring at a form that seems broken.
export default function ServerStatus() {
  const [waking, setWaking] = useState(false);

  useEffect(() => {
    let answered = false;
    const timer = setTimeout(() => !answered && setWaking(true), 2000);
    fetch("/api/health")
      .catch(() => {})
      .finally(() => {
        answered = true;
        setWaking(false);
      });
    return () => clearTimeout(timer);
  }, []);

  if (!waking) return null;
  return (
    <p
      role="status"
      className="rounded-lg border border-line bg-surface px-4 py-3 text-sm text-muted"
    >
      Waking the server. The first request after a quiet spell can take up to a
      minute.
    </p>
  );
}
