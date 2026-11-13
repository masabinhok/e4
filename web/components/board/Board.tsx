"use client";
import { useEffect, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import type { Arrow, Square } from "react-chessboard/dist/chessboard/types";
import type { BoardFlip } from "@/types/types";

type BoardProps = {
  fen: string;
  orientation: BoardFlip;
  /** Called for drags and for tap-tap moves; return true if the move was accepted. */
  onMove?: (from: string, to: string) => boolean;
  lastMove?: [string, string] | null;
  wrongMove?: [string, string] | null;
  hint?: [string, string] | null;
  interactive?: boolean;
};

const tint = {
  last: "rgba(210, 168, 67, 0.42)", // amber
  wrong: "rgba(229, 119, 95, 0.55)", // ember
  selected: "rgba(127, 179, 122, 0.5)", // moss
};

// CSS sizes the square (container width, capped by the screen height), so the
// space is reserved from the first paint; JS only reads the size for the board.
function useBoardWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() =>
      setWidth(Math.floor(el.clientWidth)),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
}

export default function Board({
  fen,
  orientation,
  onMove,
  lastMove,
  wrongMove,
  hint,
  interactive = true,
}: BoardProps) {
  const { ref, width } = useBoardWidth();
  const [selected, setSelected] = useState<string | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);
  useEffect(() => {
    setSelected(null);
  }, [fen]);

  const styles: Record<string, React.CSSProperties> = {};
  lastMove?.forEach((sq) => (styles[sq] = { backgroundColor: tint.last }));
  wrongMove?.forEach((sq) => (styles[sq] = { backgroundColor: tint.wrong }));
  if (selected) styles[selected] = { backgroundColor: tint.selected };

  // Tap a piece, then tap where it goes: easier than dragging on a phone.
  const onSquareClick = (square: Square, piece: string | undefined) => {
    if (!interactive || !onMove) return;
    if (selected && selected !== square && onMove(selected, square))
      return setSelected(null);
    setSelected(piece ? square : null);
  };

  return (
    <div
      ref={ref}
      className="mx-auto aspect-square w-full"
      style={{ maxWidth: "min(640px, calc(100dvh - 140px))" }}
      role="group"
      aria-label={`Chessboard, ${orientation} at the bottom`}
    >
      {width > 0 && (
        <div>
          <Chessboard
            position={fen}
            boardWidth={width}
            boardOrientation={orientation}
            arePiecesDraggable={interactive}
            onPieceDrop={(from, to) => (onMove ? onMove(from, to) : false)}
            onSquareClick={onSquareClick}
            customArrows={
              hint ? ([[hint[0], hint[1], "rgb(210, 168, 67)"]] as Arrow[]) : []
            }
            customSquareStyles={styles}
            customLightSquareStyle={{
              backgroundColor: "var(--color-board-light)",
            }}
            customDarkSquareStyle={{
              backgroundColor: "var(--color-board-dark)",
            }}
            customBoardStyle={{
              borderRadius: "8px",
              boxShadow: "0 18px 50px rgba(0, 0, 0, 0.45)",
            }}
            animationDuration={reduceMotion ? 0 : 180}
          />
        </div>
      )}
    </div>
  );
}
