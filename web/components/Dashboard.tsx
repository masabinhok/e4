"use client";
import Link from "next/link";
import Button from "@/components/Button";
import { PageSpinner } from "@/components/ProtectedRoute";
import { whenDue } from "@/lib/progress";
import { useLearning } from "@/lib/useLearning";
import { useAuth } from "@/store/auth";

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
              className="flex flex-col gap-3 rounded-xl border border-line bg-surface px-5 py-4 hover:border-brass/60"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-serif text-xl">{o.name}</span>
                <span className="shrink-0 text-sm text-muted tabular-nums">
                  {learned} / {total} learned
                </span>
              </div>
              <div
                role="progressbar"
                aria-label={`${o.name} progress`}
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={learned}
                className="h-1.5 overflow-hidden rounded-full bg-raised"
              >
                <div
                  className="h-full rounded-full bg-brass"
                  style={{ width: `${total ? (learned / total) * 100 : 0}%` }}
                />
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
