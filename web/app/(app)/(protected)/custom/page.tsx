"use client";
import { FormEvent, useState } from "react";
import { SkipBack, SkipForward } from "lucide-react";
import Board from "@/components/board/Board";
import MoveList from "@/components/board/MoveList";
import SaveLineForm from "@/components/board/SaveLineForm";
import Button from "@/components/Button";
import Field from "@/components/Field";
import { parseMoves, positionAfter, squaresOf } from "@/lib/chess";
import { BoardFlip } from "@/types/types";

export default function CustomLine() {
  const [moves, setMoves] = useState<string[]>([]);
  const [cursor, setCursor] = useState(0);
  const [side, setSide] = useState<BoardFlip>("white");
  const [error, setError] = useState("");

  const load = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      const parsed = parseMoves(
        String(new FormData(e.currentTarget).get("pgn")),
      );
      setMoves(parsed);
      setCursor(parsed.length);
    } catch (err) {
      setMoves([]);
      setError(err instanceof Error ? err.message : "Couldn't read that PGN.");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] lg:items-start">
      <section aria-label="Board" className="flex flex-col gap-4">
        <Board
          fen={positionAfter(moves, cursor).fen()}
          orientation={side}
          lastMove={squaresOf(moves, cursor - 1)}
          interactive={false}
        />
        <div className="flex justify-center gap-2">
          <Button
            variant="secondary"
            icon={<SkipBack className="size-4" />}
            onClick={() => setCursor(cursor - 1)}
            disabled={cursor === 0}
          >
            Back
          </Button>
          <Button
            variant="secondary"
            icon={<SkipForward className="size-4" />}
            onClick={() => setCursor(cursor + 1)}
            disabled={cursor >= moves.length}
          >
            Next
          </Button>
        </div>
      </section>

      <aside className="flex flex-col gap-5">
        <div>
          <h1 className="text-3xl">Add a PGN</h1>
          <p className="mt-2 text-muted">
            Paste a game or a move list. Headers, comments and the result are
            fine; the main line is kept.
          </p>
        </div>

        <form onSubmit={load} className="flex flex-col gap-3">
          <Field
            label="PGN or moves"
            id="pgn"
            multiline
            rows={4}
            required
            placeholder="1. e4 c6 2. d4 d5 3. e5 Bf5"
          />
          {error && (
            <p role="alert" className="text-sm text-ember">
              {error}
            </p>
          )}
          <Button type="submit" variant="secondary">
            Load
          </Button>
        </form>

        {moves.length > 0 && (
          <>
            <MoveList moves={moves} played={cursor} />
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1.5 text-sm font-medium">You play</legend>
              <div className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-surface p-1">
                {(["white", "black"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={side === s}
                    onClick={() => setSide(s)}
                    className={`min-h-11 rounded-lg text-sm font-medium capitalize ${side === s ? "bg-raised text-ivory" : "text-muted hover:text-ivory"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </fieldset>
            <SaveLineForm
              endpoint="/variations/custom"
              moves={moves}
              side={side}
              saveLabel="Save PGN"
              savedMessage="Saved to your PGNs."
              onSaved={() => {
                setMoves([]);
                setCursor(0);
              }}
            />
          </>
        )}
      </aside>
    </div>
  );
}
