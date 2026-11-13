"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import PasteLine from "@/components/lines/PasteLine";
import PlayLine from "@/components/lines/PlayLine";
import { useAuth } from "@/store/auth";

const tabs = [
  { id: "play", label: "Play a line" },
  { id: "paste", label: "Paste a PGN" },
] as const;

// Your own lines: the ones you've saved, and the two ways to add more.
export default function MyLinesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const tab = useSearchParams().get("tab") === "paste" ? "paste" : "play";

  const saved = [
    {
      href: "/lessons/recorded-lines",
      title: "Played lines",
      count: user?.recordedLines?.length ?? 0,
    },
    {
      href: "/lessons/custom-pgns",
      title: "Pasted PGNs",
      count: user?.customLines?.length ?? 0,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-4xl">My lines</h1>
        <p className="mt-2 text-muted">
          Save lines you play or paste, then learn and drill them like any
          course line.
        </p>
      </header>

      <section aria-label="Saved lines" className="grid gap-3 sm:grid-cols-2">
        {saved.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group flex items-center justify-between gap-4 rounded-2xl bg-surface px-5 py-4 hover:bg-raised"
          >
            <span>
              <span className="block font-display text-lg font-black">
                {s.title}
              </span>
              <span className="text-sm text-muted tabular-nums">
                {s.count} saved · practise them
              </span>
            </span>
            <ChevronRight
              className="size-5 text-muted group-hover:text-amber"
              aria-hidden="true"
            />
          </Link>
        ))}
      </section>

      <section aria-label="Add a line" className="flex flex-col gap-6">
        <div
          role="tablist"
          aria-label="Add a line"
          className="grid grid-cols-2 gap-1 rounded-2xl bg-surface p-1 sm:w-fit"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={tab === t.id}
              onClick={() =>
                router.replace(
                  `/my-lines${t.id === "paste" ? "?tab=paste" : ""}`,
                )
              }
              className={`min-h-11 rounded-xl px-5 font-display text-[15px] font-extrabold ${
                tab === t.id
                  ? "bg-amber text-on-amber"
                  : "text-muted hover:text-ivory"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab === "paste" ? <PasteLine embedded /> : <PlayLine embedded />}
      </section>
    </div>
  );
}
