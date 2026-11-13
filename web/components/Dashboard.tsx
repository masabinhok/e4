"use client";
import Link from "next/link";
import Board from "@/components/board/Board";
import Button from "@/components/Button";
import { PageSpinner } from "@/components/ProtectedRoute";
import { whenDue } from "@/lib/progress";
import { useLearning } from "@/lib/useLearning";
import { useAuth } from "@/store/auth";

// The position each course is built around, for its cover tile.
// shortcut: hard-coded per course; move into course.json when there are more than a few.
const COVERS: Record<string, { fen: string; side: "white" | "black" }> = {
  carokann: {
    fen: "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
    side: "black",
  },
  jobava: {
    fen: "rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/2N5/PPP1PPPP/R2QKBNR b KQkq - 3 3",
    side: "white",
  },
  slav: {
    fen: "rnbqkbnr/pp2pppp/2p5/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
    side: "black",
  },
  italian: {
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
    side: "white",
  },
};

// Home for a signed-in learner: what's due, and how far each course has got.
export default function Dashboard() {
  const { user } = useAuth();
  const { openings, progress, due, upcoming, error, reviewLink } =
    useLearning();

  if (error)
    return (
      <p role="alert" className="py-10 text-ember">
        {error}
      </p>
    );
  if (!openings) return <PageSpinner />;

  const started = new Set(progress.map((p) => p.variation._id));

  return (
    <div className="flex max-w-3xl flex-col gap-10">
      <header>
        <h1 className="text-4xl">
          {user?.isDemo
            ? "Welcome to the demo"
            : `Welcome back, ${user?.fullName.split(" ")[0]}`}
        </h1>
        <p className="mt-2 text-muted">
          {user?.isDemo
            ? "Drill a line, then come back to Review: that's the loop. This account resets after 24 hours."
            : "Pick up where you left off."}
        </p>
      </header>

      <section
        aria-labelledby="today"
        className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-6"
      >
        <h2 id="today" className="text-xl">
          Today
        </h2>
        {due.length > 0 ? (
          <>
            <p className="text-muted">
              {due.length} {due.length === 1 ? "line is" : "lines are"} due for
              review.
            </p>
            <Button href={reviewLink(due[0])} className="self-start">
              Start review
            </Button>
          </>
        ) : progress.length > 0 ? (
          <p className="text-muted">
            Nothing due. Your next review is {whenDue(upcoming[0].dueAt)}.
            Learning a new line is a good use of the time.
          </p>
        ) : (
          <>
            <p className="text-muted">
              Start with a course below: read a line in Learn mode, then switch
              to Drill.
            </p>
          </>
        )}
      </section>

      <section aria-labelledby="courses" className="flex flex-col gap-3">
        <h2 id="courses" className="text-xl">
          Courses
        </h2>
        {openings.map((o) => {
          const learned = o.variations.filter((id) =>
            started.has(String(id)),
          ).length;
          const total = o.variations.length;
          return (
            <Link
              key={o._id}
              href={`/lessons/${o.code}`}
              className="flex items-center gap-4 rounded-2xl bg-surface p-4 hover:bg-raised"
            >
              {COVERS[o.code] && (
                <div className="w-20 shrink-0 sm:w-24">
                  <Board
                    fen={COVERS[o.code].fen}
                    orientation={COVERS[o.code].side}
                    interactive={false}
                  />
                </div>
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <span className="font-display text-xl font-black">
                  {o.name}
                </span>
                <span className="text-sm text-muted tabular-nums">
                  You play {o.side ?? "both"} · {learned} / {total} learned
                </span>
                <div
                  role="progressbar"
                  aria-label={`${o.name} progress`}
                  aria-valuemin={0}
                  aria-valuemax={total}
                  aria-valuenow={learned}
                  className="h-1.5 overflow-hidden rounded-full bg-raised"
                >
                  <div
                    className="h-full rounded-full bg-amber"
                    style={{ width: `${total ? (learned / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
