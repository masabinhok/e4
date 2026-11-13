import type { BoardFlip } from "@/types/types";

// Pure state for training one line. The page owns timers, sounds and saving;
// this only decides what a move means, so it can be tested without a browser.
//
// Learn: step through the line freely. Drill: play your side from memory; the
// opponent replies automatically, and wrong moves and hints count as mistakes,
// which decides when the line comes back for review.

export type Mode = "learn" | "drill";

export type TrainerState = {
  moves: string[];
  side: BoardFlip; // the side the learner plays
  mode: Mode;
  index: number; // moves played so far
  mistakes: number; // wrong moves + hints, in drill mode
  wrong: number; // bumps on each wrong attempt, so the UI can react to repeats
};

export type TrainerAction =
  | { type: "load"; moves: string[]; side: BoardFlip }
  | { type: "mode"; mode: Mode }
  | { type: "next" }
  | { type: "back" }
  | { type: "reset" }
  | { type: "hint" }
  | { type: "jump"; index: number }
  | { type: "goto"; index: number }
  | { type: "attempt"; san: string };

export const initialTrainer = (
  moves: string[] = [],
  side: BoardFlip = "white",
  mode: Mode = "learn",
): TrainerState => ({
  moves,
  side,
  mode,
  index: 0,
  mistakes: 0,
  wrong: 0,
});

export const isComplete = (s: TrainerState) =>
  s.moves.length > 0 && s.index >= s.moves.length;

/** True when it's the learner's move (white moves at even indexes). */
export const isLearnersTurn = (s: TrainerState) =>
  !isComplete(s) && (s.index % 2 === 0) === (s.side === "white");

/** In drill mode the opponent's replies play automatically. */
export const opponentShouldMove = (s: TrainerState) =>
  s.mode === "drill" && !isComplete(s) && !isLearnersTurn(s);

/**
 * How far this line shares its moves with another line of the course: the
 * point where it branches off. Drilling can skip straight there.
 */
export function branchPoint(moves: string[], others: string[][]): number {
  let shared = 0;
  for (const other of others) {
    let n = 0;
    while (n < moves.length && n < other.length && moves[n] === other[n]) n++;
    if (n < moves.length) shared = Math.max(shared, n);
  }
  return shared;
}

export function trainerReducer(
  s: TrainerState,
  a: TrainerAction,
): TrainerState {
  switch (a.type) {
    case "load":
      return initialTrainer(a.moves, a.side, s.mode);
    case "mode":
      return initialTrainer(s.moves, s.side, a.mode);
    case "reset":
      return initialTrainer(s.moves, s.side, s.mode);
    case "next":
      return isComplete(s) ? s : { ...s, index: s.index + 1 };
    case "back":
      return s.mode === "learn" && s.index > 0
        ? { ...s, index: s.index - 1 }
        : s;
    case "jump":
      return s.index === 0 && a.index > 0 && a.index < s.moves.length
        ? { ...s, index: a.index }
        : s;
    case "goto":
      // Learn mode only: click any move in the table to see that position.
      return s.mode === "learn"
        ? { ...s, index: Math.max(0, Math.min(a.index, s.moves.length)) }
        : s;
    case "hint":
      return s.mode === "drill" && isLearnersTurn(s)
        ? { ...s, mistakes: s.mistakes + 1 }
        : s;
    case "attempt":
      if (!isLearnersTurn(s)) return s;
      if (a.san === s.moves[s.index]) return { ...s, index: s.index + 1 };
      // Learn mode is for exploring, so only drills count mistakes.
      return {
        ...s,
        wrong: s.wrong + 1,
        mistakes: s.mode === "learn" ? s.mistakes : s.mistakes + 1,
      };
  }
}
