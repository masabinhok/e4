"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { FlipVertical2, RotateCcw, Undo2 } from "lucide-react";
import Board from "@/components/board/Board";
import MoveList from "@/components/board/MoveList";
import SaveLineForm from "@/components/board/SaveLineForm";
import Button from "@/components/Button";
import { positionAfter, soundFor, squaresOf, tryMove } from "@/lib/chess";
import { useAuth } from "@/store/auth";
import { useSoundStore } from "@/store/useSoundStore";
import { BoardFlip } from "@/types/types";

export default function RecordLine() {
  const code = useSearchParams().get("code");
  const { user } = useAuth();
  const playSound = useSoundStore((s) => s.playSound);
  const [moves, setMoves] = useState<string[]>([]);
  const [side, setSide] = useState<BoardFlip>("white");
  const [saved, setSaved] = useState(false);

  const onMove = (from: string, to: string) => {
    const move = tryMove(positionAfter(moves, moves.length), from, to);
    if (!move) {
      playSound("illegal");
      return false;
    }
    playSound(soundFor(move));
    setMoves([...moves, move.san]);
    setSaved(false);
    return true;
  };

  const contributing = Boolean(code);
  const blocked = contributing && user?.isDemo;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] lg:items-start">
      <section aria-label="Board" className="flex flex-col gap-4">
        <Board
          fen={positionAfter(moves, moves.length).fen()}
          orientation={side}
          onMove={onMove}
          lastMove={squaresOf(moves, moves.length - 1)}
        />
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant="secondary"
            icon={<Undo2 className="size-4" />}
            onClick={() => setMoves(moves.slice(0, -1))}
            disabled={!moves.length}
          >
            Undo
          </Button>
          <Button
            variant="ghost"
            icon={<RotateCcw className="size-4" />}
            onClick={() => setMoves([])}
            disabled={!moves.length}
          >
            Clear
          </Button>
          <Button
            variant="ghost"
            icon={<FlipVertical2 className="size-4" />}
            onClick={() => setSide(side === "white" ? "black" : "white")}
          >
            Play as {side === "white" ? "black" : "white"}
          </Button>
        </div>
      </section>

      <aside className="flex flex-col gap-5">
        <div>
          <h1 className="text-3xl">
            {contributing ? "Suggest a line" : "Record a line"}
          </h1>
          <p className="mt-2 text-muted">
            {contributing
              ? `Play the line for "${code}". An admin reviews it before it appears in the lesson.`
              : `Play both sides on the board, then save the line to practise it later. You play ${side}.`}
          </p>
        </div>

        <MoveList moves={moves} played={moves.length} />

        {blocked ? (
          <p className="rounded-xl border border-line p-4 text-sm text-muted">
            Demo accounts can record private lines but can&apos;t suggest lines
            for everyone.{" "}
            <a href="/auth/signup" className="text-amber underline">
              Create an account
            </a>{" "}
            to contribute.
          </p>
        ) : (
          <SaveLineForm
            endpoint={
              contributing
                ? `/variations/contribute/${code}`
                : "/variations/record"
            }
            moves={moves}
            side={side}
            saveLabel={contributing ? "Submit for review" : "Save line"}
            savedMessage={
              contributing
                ? "Submitted. An admin will review it."
                : "Saved to your recorded lines."
            }
            onSaved={() => {
              setMoves([]);
              setSaved(true);
            }}
          />
        )}

        {saved && !contributing && (
          <Button href="/lessons/recorded-lines" variant="secondary">
            Practise your recorded lines
          </Button>
        )}
      </aside>
    </div>
  );
}
