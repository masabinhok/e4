"use client";
import Board from "@/components/board/Board";
import {
  BOARD_THEMES,
  BoardTheme,
  PIECE_SETS,
  PieceSet,
  usePrefs,
} from "@/store/prefs";
import { useSoundStore } from "@/store/useSoundStore";

function Choice<T extends string>({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: Record<T, { label: string }>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-medium">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(options) as T[]).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={value === key}
            onClick={() => onChange(key)}
            className={`min-h-11 rounded-xl px-4 font-display text-sm font-bold ${
              value === key
                ? "bg-amber text-on-amber"
                : "bg-raised text-ivory hover:bg-line"
            }`}
          >
            {options[key].label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

// Board look and sound, saved on this device.
export default function BoardSettings() {
  const { board, pieces, sound, volume, set } = usePrefs();
  const playSound = useSoundStore((s) => s.playSound);
  return (
    <section
      aria-labelledby="board-settings"
      className="grid gap-6 rounded-2xl bg-surface p-5 sm:grid-cols-[200px_1fr]"
    >
      <div className="max-w-[200px]">
        <Board
          fen="rnbqkbnr/pp2pppp/2p5/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3"
          orientation="white"
          interactive={false}
        />
      </div>
      <div className="flex flex-col gap-5">
        <h2 id="board-settings" className="text-xl">
          Board and sound
        </h2>
        <Choice
          legend="Board"
          options={BOARD_THEMES}
          value={board}
          onChange={(v: BoardTheme) => set({ board: v })}
        />
        <Choice
          legend="Pieces"
          options={PIECE_SETS}
          value={pieces}
          onChange={(v: PieceSet) => set({ pieces: v })}
        />
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex min-h-11 items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={sound}
              onChange={(e) => set({ sound: e.target.checked })}
              className="size-5 accent-[var(--color-amber)]"
            />
            Sounds
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm font-medium">
            Volume
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={volume}
              disabled={!sound}
              onChange={(e) => set({ volume: Number(e.target.value) })}
              onPointerUp={() => playSound("move")}
              className="w-32 accent-[var(--color-amber)]"
            />
          </label>
        </div>
      </div>
    </section>
  );
}
