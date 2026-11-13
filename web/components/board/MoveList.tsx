import { useEffect, useRef } from "react";

type MoveListProps = {
  moves: string[];
  played: number;
  /** Show the upcoming move faintly (learn, practice) or as "…" (quiz). */
  next?: "show" | "hide";
};

// Moves in numbered pairs, the way they're written on a scoresheet.
export default function MoveList({
  moves,
  played,
  next = "show",
}: MoveListProps) {
  const current = useRef<HTMLSpanElement>(null);
  // Braces matter: in recent Chrome scrollIntoView() returns a Promise, and
  // React treats anything an effect returns as its cleanup function.
  useEffect(() => {
    current.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [played]);

  const shown = moves.slice(0, Math.min(played + 1, moves.length));
  return (
    <ol
      aria-label="Moves"
      className="flex max-h-48 flex-wrap content-start gap-x-3 gap-y-1 overflow-y-auto rounded-lg bg-night/60 p-3 text-[15px] tabular-nums"
    >
      {shown.map((san, i) => {
        const isNext = i === played;
        const isLast = i === played - 1;
        return (
          <li key={i} className="flex items-baseline gap-1">
            {i % 2 === 0 && <span className="text-muted">{i / 2 + 1}.</span>}
            <span
              ref={isLast ? current : undefined}
              aria-current={isLast ? "step" : undefined}
              className={
                isNext
                  ? "text-muted"
                  : isLast
                    ? "rounded bg-amber/20 px-1 font-semibold text-amber-bright"
                    : "text-ivory"
              }
            >
              {isNext ? (next === "hide" ? "…" : san) : san}
            </span>
          </li>
        );
      })}
      {moves.length === 0 && <li className="text-muted">No moves yet.</li>}
    </ol>
  );
}
