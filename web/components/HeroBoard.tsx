"use client";
import { useEffect, useState } from "react";
import Board from "@/components/board/Board";
import { positionAfter, squaresOf } from "@/lib/chess";

// The opening of the Caro-Kann "Short System" line, with its notes from the
// course (api/src/seed/courses/caro-kann/01-advance-short.pgn). Kept here so the
// landing page renders without waiting for the API to wake up.
const moves = ["e4", "c6", "d4", "d5", "e5", "Bf5", "Nf3", "e6", "Be2", "c5"];
const notes: Record<number, string> = {
  2: "...c6 prepares ...d5, so Black can challenge the centre with a pawn while the c8 bishop keeps its diagonal open.",
  4: "...d5: hit e4 straight away, backed up by the c6 pawn.",
  6: "...Bf5: the bishop gets outside the pawn chain before ...e6 locks it in.",
  8: '...e6 is safe now: the "bad" bishop is already developed.',
  10: "...c5 hits d4, the base of White's pawn chain.",
};

export default function HeroBoard() {
  const [played, setPlayed] = useState(moves.length);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // stay on the final position
    let n = 0;
    setPlayed(0);
    const timer = setInterval(() => {
      n = n >= moves.length + 2 ? 0 : n + 1; // linger two beats on the last move, then start over
      setPlayed(Math.min(n, moves.length));
    }, 1400);
    return () => clearInterval(timer);
  }, []);

  const note =
    notes[played] ??
    notes[played - 1] ??
    "Caro-Kann Defense, Short System. You play Black.";
  return (
    <figure className="flex flex-col gap-4">
      <Board
        fen={positionAfter(moves, played).fen()}
        orientation="black"
        interactive={false}
        lastMove={squaresOf(moves, played - 1)}
      />
      <figcaption
        aria-live="off"
        className="min-h-[4.5rem] font-display text-lg font-bold leading-relaxed text-ivory/90"
      >
        {note}
      </figcaption>
    </figure>
  );
}
