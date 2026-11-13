import { Chess, Move } from "chess.js";
import type { SoundEvent } from "@/store/useSoundStore";
import type { BoardFlip } from "@/types/types";

export function positionAfter(moves: string[], count: number): Chess {
  const chess = new Chess();
  moves.slice(0, count).forEach((m) => chess.move(m));
  return chess;
}

/** Plays `from`-`to` in the position; returns the move, or null if it's illegal. */
export function tryMove(chess: Chess, from: string, to: string): Move | null {
  try {
    return new Chess(chess.fen()).move({ from, to, promotion: "q" });
  } catch {
    return null;
  }
}

export function soundFor(move: Move, byOpponent = false): SoundEvent {
  const after = new Chess(move.after);
  if (after.inCheck()) return "check";
  if (move.isKingsideCastle() || move.isQueensideCastle()) return "castle";
  if (move.isCapture()) return "capture";
  return byOpponent ? "opponent" : "move";
}

export const sideToMove = (index: number): BoardFlip =>
  index % 2 === 0 ? "white" : "black";

/** The from/to squares of the move at `index`, for highlights and hint arrows. */
export function squaresOf(
  moves: string[],
  index: number,
): [string, string] | null {
  if (index < 0 || index >= moves.length) return null;
  const move = positionAfter(moves, index).move(moves[index]);
  return [move.from, move.to];
}

/**
 * Accepts a full PGN (headers, comments, variations, result) or a bare move
 * list, and returns the main line in SAN. Throws with a readable message.
 */
export function parseMoves(text: string): string[] {
  const chess = new Chess();
  try {
    chess.loadPgn(text.trim());
  } catch (err) {
    throw new Error(
      `That doesn't read as a legal game: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
  const moves = chess.history();
  if (!moves.length)
    throw new Error(
      "No moves found. Paste a PGN or a list like 1. e4 c6 2. d4 d5",
    );
  return moves;
}
