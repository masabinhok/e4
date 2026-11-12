import type { BoardFlip } from "@/types/types";

// Pure state for training one line. The page owns timers and sounds; this only
// decides what a move means, so it can be tested without a browser.

export type Mode = "learn" | "practice" | "quiz";

export type TrainerState = {
  moves: string[];
  side: BoardFlip; // the side the learner plays
  mode: Mode;
  index: number; // moves played so far
  mistakes: number;
  wrong: number; // bumps on each wrong attempt, so the UI can react to repeats
};

export type TrainerAction =
  | { type: "load"; moves: string[]; side: BoardFlip }
  | { type: "mode"; mode: Mode }
  | { type: "next" }
  | { type: "back" }
  | { type: "reset" }
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

/** In practice and quiz the opponent's replies play automatically. */
export const opponentShouldMove = (s: TrainerState) =>
  s.mode !== "learn" && !isComplete(s) && !isLearnersTurn(s);

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
    case "attempt":
      if (!isLearnersTurn(s)) return s;
      if (a.san === s.moves[s.index]) return { ...s, index: s.index + 1 };
      // Learn mode is for exploring, so only practice and quiz count mistakes.
      return {
        ...s,
        wrong: s.wrong + 1,
        mistakes: s.mode === "learn" ? s.mistakes : s.mistakes + 1,
      };
  }
}
