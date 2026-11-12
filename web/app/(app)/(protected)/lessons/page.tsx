"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Button from "@/components/Button";
import { PageSpinner } from "@/components/ProtectedRoute";
import { api, errorMessage } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { useMessageStore } from "@/store/messageStore";
import { Opening } from "@/types/types";

function Row({
  href,
  title,
  detail,
}: {
  href: string;
  title: string;
  detail: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-4 rounded-xl border border-line bg-surface px-5 py-4 transition-colors hover:border-brass/60 hover:bg-raised"
    >
      <div className="min-w-0">
        <p className="font-serif text-xl">{title}</p>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{detail}</p>
      </div>
      <ChevronRight
        className="size-5 shrink-0 text-muted group-hover:text-brass"
        aria-hidden="true"
      />
    </Link>
  );
}

export default function LessonsPage() {
  const { user } = useAuth();
  const addMessage = useMessageStore((s) => s.addMessage);
  const [openings, setOpenings] = useState<Opening[] | null>(null);
  const [pending, setPending] = useState<Opening[]>([]);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");

  const load = useCallback(async () => {
    setLoadError("");
    try {
      const [accepted, mine] = await Promise.all([
        api<Opening[]>("/openings"),
        api<Opening[]>("/openings/pending"),
      ]);
      setOpenings(accepted);
      setPending(mine);
    } catch (err) {
      setLoadError(errorMessage(err, "Couldn't load the lessons."));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const cancel = async (id: string) => {
    try {
      await api(`/openings/cancel/${id}`, { method: "DELETE" });
      addMessage({ content: "Submission withdrawn.", type: "success" });
      setConfirming(null);
      load();
    } catch (err) {
      addMessage({ content: errorMessage(err), type: "error" });
    }
  };

  if (loadError) {
    return (
      <div className="max-w-md py-10">
        <p role="alert" className="text-ember">
          {loadError}
        </p>
        <Button variant="secondary" className="mt-4" onClick={load}>
          Try again
        </Button>
      </div>
    );
  }
  if (!openings) return <PageSpinner />;

  return (
    <div className="flex flex-col gap-12">
      <header>
        <h1 className="text-4xl">Lessons</h1>
        <p className="mt-2 text-muted">Choose an opening to learn its lines.</p>
      </header>

      <section aria-labelledby="openings" className="flex flex-col gap-3">
        <h2 id="openings" className="text-xl">
          Openings
        </h2>
        {openings.length === 0 ? (
          <p className="text-muted">
            No openings yet. Run the seed script to add the starter courses.
          </p>
        ) : (
          openings.map((o) => (
            <Row
              key={o._id}
              href={`/lessons/${o.code}`}
              title={o.name}
              detail={`${o.variations.length} ${o.variations.length === 1 ? "line" : "lines"} · ${o.description}`}
            />
          ))
        )}
      </section>

      <section aria-labelledby="yours" className="flex flex-col gap-3">
        <h2 id="yours" className="text-xl">
          Your lines
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Row
            href="/lessons/recorded-lines"
            title="Recorded lines"
            detail="Lines you played on the board and saved."
          />
          <Row
            href="/lessons/custom-pgns"
            title="Saved PGNs"
            detail="Move lists you pasted in."
          />
        </div>
      </section>

      {!user?.isDemo && (
        <section aria-labelledby="contribute" className="flex flex-col gap-3">
          <h2 id="contribute" className="text-xl">
            Contribute
          </h2>
          {pending.map((o) => (
            <div
              key={o._id}
              className="flex flex-col gap-3 rounded-xl border border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-serif text-lg">{o.name}</p>
                <p className="text-sm text-muted">
                  Waiting for an admin to review it.
                </p>
              </div>
              {confirming === o._id ? (
                <div className="flex gap-2">
                  <Button variant="danger" onClick={() => cancel(o._id)}>
                    Withdraw it
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirming(null)}>
                    Keep
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" onClick={() => setConfirming(o._id)}>
                  Withdraw
                </Button>
              )}
            </div>
          ))}
          <div>
            <Button href="/lessons/add" variant="secondary">
              Suggest a new opening
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
