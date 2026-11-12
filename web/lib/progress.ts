// Spaced-repetition progress as the API returns it (GET /api/progress).

export type Progress = {
  _id: string;
  variation: {
    _id: string;
    title: string;
    code: string;
    chapter?: string;
    moves: string[];
  };
  box: number;
  dueAt: string;
  reviews: number;
  lastMistakes: number;
};

export type LineStatus = "new" | "due" | "learned" | "mastered";

export const isDue = (p: Progress, now = Date.now()) =>
  new Date(p.dueAt).getTime() <= now;

// Mirrors api/src/progress/schedule.ts: box 4+ means remembered for two weeks or more.
export function statusOf(
  p: Progress | undefined,
  now = Date.now(),
): LineStatus {
  if (!p) return "new";
  if (isDue(p, now)) return "due";
  return p.box >= 4 ? "mastered" : "learned";
}

export function whenDue(dueAt: string, now = Date.now()): string {
  const days = Math.round((new Date(dueAt).getTime() - now) / 86_400_000);
  if (days <= 0) return "now";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}
