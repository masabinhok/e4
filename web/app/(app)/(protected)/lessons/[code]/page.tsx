"use client";
import {
  use,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FastForward,
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
import { isDue, Progress, statusOf, whenDue } from "@/lib/progress";
import {
  branchPoint,
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
    help: "Step through the line and read why each move is played.",
  },
  {
    id: "drill",
    label: "Drill",
    help: "Play your side from memory. Wrong moves and hints count, and decide when the line comes back for review.",
  },
];
const statusLabel = {
  new: "",
  due: " · due",
  learned: " · learned",
  mastered: " · mastered",
};

export default function LessonPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const query = useSearchParams();
  const router = useRouter();
  const reviewing = query.get("review") === "1";
  const { user } = useAuth();
  const playSound = useSoundStore((s) => s.playSound);
  const isPersonal = code === "recorded-lines" || code === "custom-pgns";

  const [opening, setOpening] = useState<Opening | null>(null);
  const [loadError, setLoadError] = useState("");
  const [progress, setProgress] = useState<Progress[]>([]);
  const [lineIndex, setLineIndex] = useLocalStorage<number>(`line:${code}`, 0);
  const [savedMode, setSavedMode] = useLocalStorage<Mode>(
    "trainer-mode",
    "learn",
  );
  const [state, dispatch] = useReducer(trainerReducer, initialTrainer());
  const [orientation, setOrientation] = useState<BoardFlip>("white");
  const [wrong, setWrong] = useState<{
    squares: [string, string];
    san: string;
  } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [result, setResult] = useState<Progress | null>(null);

  useEffect(() => {
    api<Opening>(`/${isPersonal ? "users" : "openings"}/${code}`)
      .then(setOpening)
      .catch((err) =>
        setLoadError(errorMessage(err, "Couldn't load this lesson.")),
      );
    api<Progress[]>("/progress")
      .then(setProgress)
      .catch(() => {}); // badges are a bonus; the lesson works without them
  }, [code, isPersonal]);

  const lines = useMemo(() => opening?.variations ?? [], [opening]);
  // ?line=<id> (from the review queue) wins over the remembered line.
  const requested = lines.findIndex((v) => v._id === query.get("line"));
  const index =
    requested >= 0
      ? requested
      : Math.min(lineIndex, Math.max(lines.length - 1, 0));
  const line = lines[index];
  const mode: Mode =
    query.get("mode") === "drill"
      ? "drill"
      : savedMode === "drill"
        ? "drill"
        : "learn";

  const byLine = useMemo(
    () => new Map(progress.map((p) => [p.variation._id, p])),
    [progress],
  );
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
  const skipTo = useMemo(
    () =>
      line
        ? branchPoint(
            line.moves,
            lines.filter((v) => v._id !== line._id).map((v) => v.moves),
          )
        : 0,
    [line, lines],
  );

  const clearFeedback = () => {
    setWrong(null);
    setShowHint(false);
    setAutoplay(false);
    setResult(null);
  };

  useEffect(() => {
    if (!line) return;
    dispatch({ type: "mode", mode });
    dispatch({
      type: "load",
      moves: line.moves,
      side: line.boardflip ?? "white",
    });
    setOrientation(line.boardflip ?? "white");
    clearFeedback();
  }, [line, mode]);

  const playNext = useCallback(() => {
    if (isComplete(state)) return;
    const move = positionAfter(state.moves, state.index).move(
      state.moves[state.index],
    );
    playSound(soundFor(move));
    dispatch({ type: "next" });
  }, [state, playSound]);

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

  // A finished drill is saved, which schedules the line's next review.
  const done = isComplete(state) && state.mode === "drill";
  useEffect(() => {
    if (!done || !line) return;
    playSound(state.mistakes === 0 ? "lessonPass" : "achievement");
    api<Progress>(`/progress/${line._id}`, {
      method: "POST",
      body: JSON.stringify({ mistakes: state.mistakes }),
    })
      .then((saved) => {
        setResult(saved);
        setProgress((all) => [
          ...all.filter((p) => p.variation._id !== line._id),
          { ...saved, variation: { ...line } },
        ]);
      })
      .catch(() => {});
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps -- save once per completion

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
      setWrong({ squares: [from, to], san: move.san });
      return false;
    }
    playSound(soundFor(move));
    setWrong(null);
    setShowHint(false);
    return true;
  };

  const chooseMode = (next: Mode) => {
    setSavedMode(next);
    if (query.get("mode")) router.replace(`/lessons/${code}`);
    dispatch({ type: "mode", mode: next });
    clearFeedback();
  };
  const chooseLine = (i: number) => {
    if (query.get("line")) router.replace(`/lessons/${code}`);
    setLineIndex(i);
  };
  const restart = () => {
    dispatch({ type: "reset" });
    clearFeedback();
  };
  const hint = () => {
    dispatch({ type: "hint" });
    setShowHint(true);
  };
  const nextDue = () => {
    const due = progress.filter(
      (p) => isDue(p) && p.variation._id !== line?._id,
    );
    router.push(
      due.length
        ? `/lessons/${due[0].variation.code}?line=${due[0].variation._id}&mode=drill&review=1`
        : "/review",
    );
  };

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
  const yourTurn = isLearnersTurn(state);
  const drilling = state.mode === "drill";
  // After a wrong move in a drill, show the right one so it sticks.
  const arrow = isComplete(state)
    ? null
    : !drilling || showHint || wrong
      ? nextSquares
      : null;
  const coachNote =
    (state.index > 0 ? line?.notes?.[state.index - 1] : "") ||
    (state.index === 0 ? line?.description : "");
  const correctNote = line?.notes?.[state.index];
  const transposition = wrong
    ? lines.find(
        (v) =>
          v._id !== line?._id &&
          v.moves[state.index] === wrong.san &&
          v.moves.slice(0, state.index).join() ===
            state.moves.slice(0, state.index).join(),
      )
    : undefined;
  const learnedCount = lines.filter((v) => byLine.has(v._id)).length;
  const dueCount = lines.filter(
    (v) => statusOf(byLine.get(v._id)) === "due",
  ).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] lg:items-start">
      <section aria-label="Board" className="flex flex-col gap-4">
        <Board
          fen={fen}
          orientation={orientation}
          onMove={onMove}
          lastMove={squaresOf(state.moves, state.index - 1)}
          wrongMove={wrong?.squares}
          hint={arrow}
        />

        <div className="flex flex-wrap items-center justify-center gap-2">
          {!drilling ? (
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
            <>
              <Button
                variant="secondary"
                icon={<Lightbulb className="size-4" />}
                onClick={hint}
                disabled={!yourTurn || showHint}
              >
                Hint
              </Button>
              {state.index === 0 && skipTo >= 4 && (
                <Button
                  variant="secondary"
                  icon={<FastForward className="size-4" />}
                  onClick={() => dispatch({ type: "jump", index: skipTo })}
                >
                  Skip to move {Math.floor(skipTo / 2) + 1}
                </Button>
              )}
            </>
          )}
          <Button
            variant="ghost"
            icon={<RotateCcw className="size-4" />}
            onClick={restart}
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
          {reviewing && (
            <p className="mb-1 text-sm font-medium text-amber">Review</p>
          )}
          <h1 className="text-3xl">{opening.name}</h1>
          {lines.length > 0 && (
            <p className="mt-1 text-sm text-muted">
              You play {line?.boardflip ?? "white"} · {learnedCount} of{" "}
              {lines.length} lines learned
              {dueCount > 0 && ` · ${dueCount} due`}
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
                className="min-h-11 rounded-lg border border-line bg-raised px-3 focus:border-amber focus:outline-none"
              >
                {chapters.map(([chapter, entries]) => {
                  const options = entries.map(({ v, i }) => (
                    <option key={v._id} value={i}>
                      {v.title}
                      {statusLabel[statusOf(byLine.get(v._id))]}
                    </option>
                  ));
                  return chapter ? (
                    <optgroup key={chapter} label={chapter}>
                      {options}
                    </optgroup>
                  ) : (
                    options
                  );
                })}
              </select>
              {line?.officialName && (
                <p className="text-xs text-muted">{line.officialName}</p>
              )}
            </div>

            <div
              role="radiogroup"
              aria-label="Mode"
              className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-surface p-1"
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

            {coachNote && !wrong && (
              <p
                aria-live="polite"
                className="font-display text-lg font-bold leading-relaxed text-ivory/90"
              >
                {coachNote}
              </p>
            )}

            <MoveList
              moves={state.moves}
              played={state.index}
              next={drilling ? "hide" : "show"}
            />

            <div aria-live="polite" className="min-h-6 text-sm">
              {done ? (
                <div className="flex flex-col gap-3 rounded-xl border border-moss/40 bg-moss/10 p-4">
                  <p className="text-ivory">
                    {state.mistakes === 0
                      ? "Clean run."
                      : `Done, with ${state.mistakes} ${state.mistakes === 1 ? "mistake or hint" : "mistakes or hints"}.`}
                    {result &&
                      ` You'll see this line again ${whenDue(result.dueAt)}.`}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {reviewing ? (
                      <Button onClick={nextDue}>Next review</Button>
                    ) : (
                      lines.length > 1 && (
                        <Button
                          onClick={() => chooseLine((index + 1) % lines.length)}
                        >
                          Next line
                        </Button>
                      )
                    )}
                    <Button variant="secondary" onClick={restart}>
                      Again
                    </Button>
                  </div>
                </div>
              ) : wrong ? (
                <div className="flex flex-col gap-2 rounded-xl border border-ember/40 bg-ember/10 p-4">
                  <p className="text-ivory">
                    {transposition
                      ? `${wrong.san} is the move in "${transposition.title}". This line plays ${state.moves[state.index]}.`
                      : `Not ${wrong.san}. This line plays ${state.moves[state.index]}.`}
                  </p>
                  {correctNote && (
                    <p className="font-display text-ivory/90">{correctNote}</p>
                  )}
                </div>
              ) : drilling ? (
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
