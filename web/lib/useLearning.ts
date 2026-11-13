"use client";
import { useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { isDue, Progress } from "@/lib/progress";
import { Opening } from "@/types/types";

/** Courses plus this user's progress: what the dashboard, review queue and profile need. */
export function useLearning() {
  const [openings, setOpenings] = useState<Opening[] | null>(null);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api<Opening[]>("/openings"), api<Progress[]>("/progress")])
      .then(([o, p]) => {
        setOpenings(o);
        setProgress(p);
      })
      .catch((err) =>
        setError(errorMessage(err, "Couldn't load your progress.")),
      );
  }, []);

  const due = progress
    .filter((p) => isDue(p))
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  const upcoming = progress
    .filter((p) => !isDue(p))
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  const courseName = (code: string) =>
    openings?.find((o) => o.code === code)?.name ??
    (code === "recorded-lines"
      ? "Recorded lines"
      : code === "custom-pgns"
        ? "Saved PGNs"
        : code);
  const reviewLink = (p: Progress) =>
    `/lessons/${p.variation.code}?line=${p.variation._id}&mode=drill&review=1`;

  return { openings, progress, due, upcoming, error, courseName, reviewLink };
}
