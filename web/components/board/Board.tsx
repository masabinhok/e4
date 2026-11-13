"use client";
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Chessboard } from "react-chessboard";
import type {
  Arrow,
  CustomPieces,
  CustomSquareProps,
  Square,
} from "react-chessboard/dist/chessboard/types";
import { Chess } from "chess.js";
import { Check, X } from "lucide-react";
import { BOARD_THEMES, usePrefs } from "@/store/prefs";
import type { BoardFlip } from "@/types/types";

export type Marker = { square: string; kind: "correct" | "wrong" };

type BoardProps = {
  fen: string;
  orientation: BoardFlip;
  /** Called for drags and for tap-tap moves; return true if the move was accepted. */
  onMove?: (from: string, to: string) => boolean;
  lastMove?: [string, string] | null;
  wrongMove?: [string, string] | null;
  hint?: [string, string] | null;
  /** A ✓ or ✗ badge on a square, for drill feedback. */
  marker?: Marker | null;
  interactive?: boolean;
};

const tint = {
  last: "rgba(255, 196, 77, 0.42)", // amber
  wrong: "rgba(255, 122, 98, 0.5)", // ember
  selected: "rgba(255, 196, 77, 0.6)",
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

// Badges and move dots reach the squares through context, so the 64 squares
// keep their identity (no remounts, animations stay smooth).
const Overlay = createContext<{
  marker?: Marker | null;
  dots: Set<string>;
  captures: Set<string>;
}>({
  dots: new Set(),
  captures: new Set(),
});

const SquareWithOverlay = forwardRef<HTMLDivElement, CustomSquareProps>(
  function SquareWithOverlay({ children, square, style }, ref) {
    const { marker, dots, captures } = useContext(Overlay);
    const badge = marker?.square === square ? marker.kind : null;
    return (
      <div ref={ref} style={{ ...style, position: "relative" }}>
        {children}
        {dots.has(square) && (
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 m-auto rounded-full ${
              captures.has(square)
                ? "size-[86%] border-[5px] border-black/20"
                : "size-[30%] bg-black/20"
            }`}
          />
        )}
        {badge && (
          <span
            role="img"
            aria-label={badge === "correct" ? "Correct move" : "Wrong move"}
            className={`pointer-events-none absolute -top-[14%] -right-[14%] z-10 grid size-[46%] place-items-center rounded-full border-2 border-white text-white shadow-md ${
              badge === "correct" ? "bg-[#3fae4a]" : "bg-[#e5533d]"
            }`}
          >
            {badge === "correct" ? (
              <Check className="size-[70%]" strokeWidth={3.5} />
            ) : (
              <X className="size-[70%]" strokeWidth={3.5} />
            )}
          </span>
        )}
      </div>
    );
  },
);

const PIECE_KEYS = [
  "wK",
  "wQ",
  "wR",
  "wB",
  "wN",
  "wP",
  "bK",
  "bQ",
  "bR",
  "bB",
  "bN",
  "bP",
] as const;

export default function Board({
  fen,
  orientation,
  onMove,
  lastMove,
  wrongMove,
  hint,
  marker,
  interactive = true,
}: BoardProps) {
  const { ref, width } = useBoardWidth();
  const [selected, setSelected] = useState<string | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const { board, pieces } = usePrefs();
  const theme = BOARD_THEMES[board] ?? BOARD_THEMES.maple;

  useEffect(() => {
    setReduceMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);
  useEffect(() => {
    setSelected(null);
  }, [fen]);

  const customPieces = useMemo<CustomPieces>(
    () =>
      Object.fromEntries(
        PIECE_KEYS.map((key) => [
          key,
          ({ squareWidth }: { squareWidth: number }) => (
            // eslint-disable-next-line @next/next/no-img-element -- tiny static SVGs, drawn many times
            <img
              src={`/pieces/${pieces}/${key}.svg`}
              alt=""
              width={squareWidth}
              height={squareWidth}
              draggable={false}
            />
          ),
        ]),
      ),
    [pieces],
  );

  // Legal moves of the tapped piece, shown as dots (rings on captures).
  const overlay = useMemo(() => {
    const dots = new Set<string>();
    const captures = new Set<string>();
    if (selected) {
      try {
        for (const m of new Chess(fen).moves({
          square: selected as Square,
          verbose: true,
        })) {
          dots.add(m.to);
          if (m.captured) captures.add(m.to);
        }
      } catch {
        /* not a piece of the side to move */
      }
    }
    return { marker, dots, captures };
  }, [fen, selected, marker]);

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
        <Overlay.Provider value={overlay}>
          <Chessboard
            position={fen}
            boardWidth={width}
            boardOrientation={orientation}
            arePiecesDraggable={interactive}
            onPieceDrop={(from, to) => (onMove ? onMove(from, to) : false)}
            onSquareClick={onSquareClick}
            customPieces={customPieces}
            customSquare={SquareWithOverlay}
            customArrows={
              hint
                ? ([[hint[0], hint[1], "rgba(255, 176, 32, 0.85)"]] as Arrow[])
                : []
            }
            customSquareStyles={styles}
            customLightSquareStyle={{ backgroundColor: theme.light }}
            customDarkSquareStyle={{ backgroundColor: theme.dark }}
            customBoardStyle={{
              borderRadius: "10px",
              boxShadow: "0 18px 50px rgba(0, 0, 0, 0.5)",
            }}
            animationDuration={reduceMotion ? 0 : 200}
          />
        </Overlay.Provider>
      )}
    </div>
  );
}
