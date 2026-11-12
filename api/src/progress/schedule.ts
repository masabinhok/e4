// Leitner-style spaced repetition. A line moves up one box each time it's
// drilled without a mistake, and back to box 1 after any mistake (or hint).
// The box decides how long until it's due again.

export const MAX_BOX = 5;
const DAY = 24 * 60 * 60 * 1000;
export const INTERVAL_DAYS = [0, 1, 3, 7, 14, 30]; // indexed by box

export function schedule(box: number, mistakes: number, now = new Date()) {
  const next = mistakes > 0 ? 1 : Math.min(box + 1, MAX_BOX);
  return {
    box: next,
    dueAt: new Date(now.getTime() + INTERVAL_DAYS[next] * DAY),
  };
}

/** Box 1 and up: drilled cleanly at least once. Box 4 and up: remembered for 2+ weeks. */
export const isLearned = (box: number) => box >= 1;
export const isMastered = (box: number) => box >= 4;
