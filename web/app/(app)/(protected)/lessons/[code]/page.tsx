"use client";
import {
  use,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import {
  FlipVertical2,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
} from "lucide-react";
import Board from "@/components/board/Board";
import MoveList from "@/components/board/MoveList";
import Button from "@/components/Button";
import { PageSpinner } from "@/components/ProtectedRoute";
import useLocalStorage from "@/hooks/useLocalStorage";
import { api, errorMessage } from "@/lib/api";
import { positionAfter, soundFor, squaresOf, tryMove } from "@/lib/chess";
import {
  initialTrainer,
  isComplete,
  isLearnersTurn,
  Mode,
  opponentShouldMove,
  trainerReducer,
} from "@/lib/trainer";
import { useAuth } from "@/store/auth";
import { useSoundStore } from "@/store/useSoundStore";
import { BoardFlip, Opening } from "@/types/types";

const modes: { id: Mode; label: string; help: string }[] = [
  {
    id: "learn",
    label: "Learn",
    help: "Step through the line. You can also play the moves on the board.",
  },
  {
    id: "practice",
    label: "Practice",
    help: "Play your side; the opponent answers. The next move is shown.",
  },
  {
    id: "quiz",
    label: "Quiz",
    help: "Play your side from memory. Mistakes are counted.",
  },
];

export default function LessonPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const { user } = useAuth();
  const playSound = useSoundStore((s) => s.playSound);
  const isPersonal = code === "recorded-lines" || code === "custom-pgns";

  const [opening, setOpening] = useState<Opening | null>(null);
  const [loadError, setLoadError] = useState("");
  const [lineIndex, setLineIndex] = useLocalStorage<number>(`line:${code}`, 0);
  const [savedMode, setSavedMode] = useLocalStorage<Mode>(
    "trainer-mode",
    "learn",
  );
  const [state, dispatch] = useReducer(trainerReducer, initialTrainer());
  const [orientation, setOrientation] = useState<BoardFlip>("white");
  const [wrongMove, setWrongMove] = useState<[string, string] | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [autoplay, setAutoplay] = useState(false);

  useEffect(() => {
    api<Opening>(`/${isPersonal ? "users" : "openings"}/${code}`)
      .then(setOpening)
      .catch((err) =>
        setLoadError(errorMessage(err, "Couldn't load this lesson.")),
      );
  }, [code, isPersonal]);

  const lines = useMemo(() => opening?.variations ?? [], [opening]);
  // Lines grouped by chapter, keeping their order; contributed lines have no chapter.
  const chapters = useMemo(() => {
    const groups = new Map<
      string,
      { v: (typeof lines)[number]; i: number }[]
    >();
    lines.forEach((v, i) =>
      groups.set(v.chapter ?? "", [
        ...(groups.get(v.chapter ?? "") ?? []),
        { v, i },
      ]),
    );
    return [...groups.entries()];
  }, [lines]);
  const index = Math.min(lineIndex, Math.max(lines.length - 1, 0)); // stored index may be stale
  const line = lines[index];

  const clearFeedback = () => {
    setWrongMove(null);
    setShowHint(false);
    setAutoplay(false);
  };

  // Load the chosen line (and keep the saved mode) whenever it changes.
  useEffect(() => {
    if (!line) return;
    dispatch({ type: "mode", mode: savedMode });
    dispatch({
      type: "load",
      moves: line.moves,
      side: line.boardflip ?? "white",
    });
    setOrientation(line.boardflip ?? "white");
    clearFeedback();
  }, [line, savedMode]);

  const playNext = useCallback(() => {
    if (isComplete(state)) return;
    const move = positionAfter(state.moves, state.index).move(
      state.moves[state.index],
    );
    playSound(soundFor(move));
    dispatch({ type: "next" });
  }, [state, playSound]);

  // The opponent replies on its own in practice and quiz.
  useEffect(() => {
    if (!opponentShouldMove(state)) return;
    const t = setTimeout(playNext, 450);
    return () => clearTimeout(t);
  }, [state, playNext]);

  useEffect(() => {
    if (!autoplay) return;
    if (isComplete(state)) return setAutoplay(false);
    const t = setTimeout(playNext, 900);
    return () => clearTimeout(t);
  }, [autoplay, state, playNext]);

  const done = isComplete(state) && state.mode !== "learn";
  useEffect(() => {
    if (done) playSound(state.mode === "quiz" ? "lessonPass" : "achievement");
  }, [done, state.mode, playSound]);

  // ← and → step through the line in learn mode.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        state.mode !== "learn" ||
        (e.target as HTMLElement).closest("input, select, textarea")
      )
        return;
      if (e.key === "ArrowRight") playNext();
      if (e.key === "ArrowLeft") dispatch({ type: "back" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.mode, playNext]);

  const onMove = (from: string, to: string) => {
    if (!isLearnersTurn(state)) return false;
    const move = tryMove(positionAfter(state.moves, state.index), from, to);
    if (!move) {
      playSound("illegal");
      return false;
    }
    dispatch({ type: "attempt", san: move.san });
    if (move.san !== state.moves[state.index]) {
      playSound("incorrect");
      setWrongMove([from, to]);
      return false;
    }
    playSound(soundFor(move));
    setWrongMove(null);
    setShowHint(false);
    return true;
  };

  const chooseMode = (mode: Mode) => {
    setSavedMode(mode);
    dispatch({ type: "mode", mode });
    clearFeedback();
  };
  const chooseLine = (i: number) => setLineIndex(i);
  const nextLine = () => chooseLine((index + 1) % lines.length);

  if (!opening) {
    return loadError ? (
      <div className="max-w-md py-10">
        <p role="alert" className="text-ember">
          {loadError}
        </p>
        <Button
          href="/lessons"
          variant="secondary"
          className="mt-4"
          text="Back to lessons"
        />
      </div>
    ) : (
      <PageSpinner />
    );
  }

  const fen = positionAfter(state.moves, state.index).fen();
  const nextSquares = squaresOf(state.moves, state.index);
  const hint = state.mode === "learn" || showHint ? nextSquares : null;
  const yourTurn = isLearnersTurn(state);
  const coachNote =
    (state.index > 0 ? line?.notes?.[state.index - 1] : "") ||
    (state.index === 0 ? line?.description : "");

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] lg:items-start">
      <section aria-label="Board" className="flex flex-col gap-4">
        <Board
          fen={fen}
          orientation={orientation}
          onMove={onMove}
          lastMove={squaresOf(state.moves, state.index - 1)}
          wrongMove={wrongMove}
          hint={isComplete(state) ? null : hint}
        />

        <div className="flex flex-wrap items-center justify-center gap-2">
          {state.mode === "learn" ? (
            <>
              <Button
                variant="secondary"
                icon={<SkipBack className="size-4" />}
                onClick={() => dispatch({ type: "back" })}
                disabled={state.index === 0}
              >
                Back
              </Button>
              <Button
                icon={<SkipForward className="size-4" />}
                onClick={playNext}
                disabled={isComplete(state)}
                className="min-w-28"
              >
                Next
              </Button>
              <Button
                variant="secondary"
                icon={
                  autoplay ? (
                    <Pause className="size-4" />
                  ) : (
                    <Play className="size-4" />
                  )
                }
                onClick={() => setAutoplay((a) => !a)}
                disabled={isComplete(state)}
              >
                {autoplay ? "Pause" : "Autoplay"}
              </Button>
            </>
          ) : (
            state.mode === "practice" && (
              <Button
                variant="secondary"
                icon={<Lightbulb className="size-4" />}
                onClick={() => setShowHint(true)}
                disabled={!yourTurn || showHint}
              >
                Hint
              </Button>
            )
          )}
          <Button
            variant="ghost"
            icon={<RotateCcw className="size-4" />}
            onClick={() => {
              dispatch({ type: "reset" });
              clearFeedback();
            }}
          >
            Restart
          </Button>
          <Button
            variant="ghost"
            aria-label="Flip board"
            icon={<FlipVertical2 className="size-4" />}
            onClick={() =>
              setOrientation((o) => (o === "white" ? "black" : "white"))
            }
          />
        </div>
      </section>

      <aside className="flex flex-col gap-5">
        <div>
          <h1 className="text-3xl">{opening.name}</h1>
          {lines.length > 0 && (
            <p className="mt-1 text-sm text-muted">
              You play {line?.boardflip ?? "white"} · line {index + 1} of{" "}
              {lines.length}
            </p>
          )}
        </div>

        {lines.length === 0 ? (
          <p className="text-muted">
            No lines here yet.{" "}
            {isPersonal
              ? code === "recorded-lines"
                ? "Record one from the Record tab."
                : "Paste one in the PGNs tab."
              : ""}
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="line" className="text-sm font-medium">
                Line
              </label>
              <select
                id="line"
                value={index}
                onChange={(e) => chooseLine(Number(e.target.value))}
                className="min-h-11 rounded-lg border border-line bg-raised px-3 focus:border-brass focus:outline-none"
              >
                {chapters.map(([chapter, entries]) =>
                  chapter ? (
                    <optgroup key={chapter} label={chapter}>
                      {entries.map(({ v, i }) => (
                        <option key={v._id} value={i}>
                          {v.title}
                        </option>
                      ))}
                    </optgroup>
                  ) : (
                    entries.map(({ v, i }) => (
                      <option key={v._id} value={i}>
                        {v.title}
                      </option>
                    ))
                  ),
                )}
              </select>
              {line?.officialName && (
                <p className="text-xs text-muted">{line.officialName}</p>
              )}
            </div>

            <div
              role="radiogroup"
              aria-label="Mode"
              className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-surface p-1"
            >
              {modes.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={state.mode === m.id}
                  onClick={() => chooseMode(m.id)}
                  className={`min-h-11 rounded-lg text-sm font-medium ${state.mode === m.id ? "bg-raised text-ivory" : "text-muted hover:text-ivory"}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <p className="-mt-2 text-sm text-muted">
              {modes.find((m) => m.id === state.mode)?.help}
            </p>

            {/* The coach's voice: the note on the move just played, or the line's introduction. */}
            {coachNote && (
              <p
                aria-live="polite"
                className="font-serif text-lg italic leading-relaxed text-ivory/90"
              >
                {coachNote}
              </p>
            )}

            <MoveList
              moves={state.moves}
              played={state.index}
              next={state.mode === "quiz" ? "hide" : "show"}
            />

            <div aria-live="polite" className="min-h-6 text-sm">
              {done ? (
                <div className="flex flex-col gap-3 rounded-xl border border-moss/40 bg-moss/10 p-4">
                  <p className="text-ivory">
                    Line complete
                    {state.mode === "quiz" &&
                      (state.mistakes === 0
                        ? " with no mistakes."
                        : ` with ${state.mistakes} ${state.mistakes === 1 ? "mistake" : "mistakes"}.`)}
                    {state.mode === "practice" && "."}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        dispatch({ type: "reset" });
                        clearFeedback();
                      }}
                    >
                      Again
                    </Button>
                    {lines.length > 1 && (
                      <Button onClick={nextLine}>Next line</Button>
                    )}
                  </div>
                </div>
              ) : wrongMove ? (
                <p className="text-ember">
                  Not the move in this line. Try again
                  {state.mode === "practice" ? ", or take a hint" : ""}.
                </p>
              ) : state.mode !== "learn" ? (
                <p className="text-muted">
                  {yourTurn ? "Your move." : "Opponent is replying…"}
                </p>
              ) : null}
            </div>
          </>
        )}

        {opening.summary && (
          <details className="rounded-xl border border-line bg-surface">
            <summary className="flex min-h-11 cursor-pointer items-center px-4 font-medium">
              About this opening
            </summary>
            <div className="flex flex-col gap-3 px-4 pb-4 text-sm text-muted">
              <p className="leading-relaxed">{opening.summary}</p>
              {opening.keyIdeas?.length ? (
                <ul className="flex list-disc flex-col gap-1.5 pl-5">
                  {opening.keyIdeas.map((idea) => (
                    <li key={idea}>{idea}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </details>
        )}

        {!isPersonal && !user?.isDemo && (
          <Button
            href={`/record?code=${code}`}
            variant="ghost"
            className="self-start"
          >
            Suggest a line for this opening
          </Button>
        )}
      </aside>
    </div>
  );
}
