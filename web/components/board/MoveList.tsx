import { useEffect, useRef } from "react";

type MoveListProps = {
  moves: string[];
  played: number;
  /** "all": the whole line, upcoming moves dimmed (learn). "hide": played moves only (drill). */
  next?: "all" | "show" | "hide";
  /** Clicking a move shows the position after it (learn mode). */
  onSelect?: (index: number) => void;
};

// Moves in a numbered table, White and Black side by side, like a scoresheet.
export default function MoveList({
  moves,
  played,
  next = "show",
  onSelect,
}: MoveListProps) {
  const current = useRef<HTMLTableCellElement>(null);
  // Braces matter: in recent Chrome scrollIntoView() returns a Promise, and
  // React treats anything an effect returns as its cleanup function.
  useEffect(() => {
    current.current?.scrollIntoView({ block: "nearest" });
  }, [played]);

  const visible =
    next === "all"
      ? moves.length
      : next === "hide"
        ? played
        : Math.min(played + 1, moves.length);
  const rows = Math.ceil(
    Math.max(
      visible,
      next === "hide" && played < moves.length ? played + 1 : 0,
    ) / 2,
  );

  const cell = (i: number) => {
    if (i >= moves.length) return <td />;
    const isCurrent = i === played - 1;
    if (i >= visible) {
      return (
        <td className="px-3 py-1.5 text-muted">{i === played ? "…" : ""}</td>
      );
    }
    const tone = isCurrent
      ? "bg-amber/20 font-bold text-ivory"
      : i < played
        ? "text-ivory"
        : "text-muted";
    return (
      <td
        ref={isCurrent ? current : undefined}
        aria-current={isCurrent ? "step" : undefined}
        className="p-0.5"
      >
        {onSelect ? (
          <button
            type="button"
            onClick={() => onSelect(i + 1)}
            className={`min-h-11 w-full rounded-md px-2.5 text-left hover:bg-raised ${tone}`}
          >
            {moves[i]}
          </button>
        ) : (
          <span className={`block rounded-md px-2.5 py-1.5 ${tone}`}>
            {moves[i]}
          </span>
        )}
      </td>
    );
  };

  if (moves.length === 0)
    return (
      <p className="rounded-xl bg-night/60 p-3 text-sm text-muted">
        No moves yet.
      </p>
    );

  return (
    <div className="max-h-56 overflow-y-auto rounded-xl bg-night/60">
      <table
        aria-label="Moves"
        className="w-full border-collapse text-[15px] tabular-nums"
      >
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r} className="odd:bg-white/[0.02]">
              <th
                scope="row"
                className="w-12 bg-black/15 px-3 text-left font-medium text-muted"
              >
                {r + 1}.
              </th>
              {cell(r * 2)}
              {cell(r * 2 + 1)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
