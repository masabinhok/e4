"use client";
import Link from "next/link";
import Button from "@/components/Button";
import { PageSpinner } from "@/components/ProtectedRoute";
import { whenDue } from "@/lib/progress";
import { useLearning } from "@/lib/useLearning";

export default function ReviewPage() {
  const { openings, progress, due, upcoming, error, courseName, reviewLink } =
    useLearning();

  if (error)
    return (
      <p role="alert" className="py-10 text-ember">
        {error}
      </p>
    );
  if (!openings) return <PageSpinner />;

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <header>
        <h1 className="text-4xl">Review</h1>
        <p className="mt-2 text-muted">
          Lines come back here when they&apos;re due. A clean drill pushes the
          next review further away; a mistake brings it back tomorrow.
        </p>
      </header>

      {progress.length === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded-xl border border-line p-6">
          <p>
            Nothing to review yet. Drill a line in any lesson and it will show
            up here when it&apos;s due.
          </p>
          <Button href="/lessons">Choose a lesson</Button>
        </div>
      ) : due.length === 0 ? (
        <div className="flex flex-col items-start gap-2 rounded-xl border border-moss/40 bg-moss/10 p-6">
          <p className="font-serif text-xl">All caught up.</p>
          <p className="text-muted">
            Next up: {upcoming[0].variation.title}, {whenDue(upcoming[0].dueAt)}
            .
          </p>
        </div>
      ) : (
        <section aria-labelledby="due" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="due" className="text-xl">
              {due.length} {due.length === 1 ? "line" : "lines"} due
            </h2>
            <Button href={reviewLink(due[0])} size="lg">
              Start review
            </Button>
          </div>
          <ul className="flex flex-col gap-2">
            {due.map((p) => (
              <li key={p._id}>
                <Link
                  href={reviewLink(p)}
                  className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-line bg-surface px-5 py-3 hover:border-brass/60"
                >
                  <span className="min-w-0">
                    <span className="block truncate">{p.variation.title}</span>
                    <span className="block text-sm text-muted">
                      {courseName(p.variation.code)}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm text-muted">
                    {p.lastMistakes ? "missed last time" : "due"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
