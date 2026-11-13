"use client";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { isDue } from "@/lib/progress";
import { useLearning } from "@/lib/useLearning";
import { useAuth } from "@/store/auth";

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { progress } = useLearning();
  if (!user) return null;

  const stats = [
    { label: "Lines learned", value: progress.length, href: "/lessons" },
    {
      label: "Mastered (2+ weeks)",
      value: progress.filter((p) => p.box >= 4).length,
      href: "/lessons",
    },
    {
      label: "Due now",
      value: progress.filter((p) => isDue(p)).length,
      href: "/review",
    },
    {
      label: "Drills done",
      value: progress.reduce((n, p) => n + p.reviews, 0),
      href: "/review",
    },
    {
      label: "Recorded lines",
      value: user.recordedLines?.length ?? 0,
      href: "/lessons/recorded-lines",
    },
    {
      label: "Saved PGNs",
      value: user.customLines?.length ?? 0,
      href: "/lessons/custom-pgns",
    },
  ];

  return (
    <div className="flex max-w-2xl flex-col gap-10">
      <header className="flex items-center gap-4">
        <div
          aria-hidden="true"
          className="flex size-16 shrink-0 items-center justify-center rounded-full bg-raised font-display text-2xl text-amber"
        >
          {user.fullName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-3xl">
            {user.isDemo ? "Demo visitor" : user.fullName}
          </h1>
          <p className="text-muted">
            {user.isDemo
              ? "This account and everything in it are deleted 24 hours after it was created."
              : `${user.email} · joined ${new Date(user.createdAt).toLocaleDateString()}`}
          </p>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <a
            key={s.label}
            href={s.href}
            className="rounded-xl border border-line bg-surface p-5 hover:border-amber/60"
          >
            <dt className="text-sm text-muted">{s.label}</dt>
            <dd className="mt-1 font-display text-4xl tabular-nums">
              {s.value}
            </dd>
          </a>
        ))}
      </dl>

      <div className="flex flex-col gap-3 sm:flex-row">
        {user.role === "ADMIN" && (
          <Button href="/admin" variant="secondary">
            Admin
          </Button>
        )}
        <Button href="/credit" variant="ghost">
          About the author
        </Button>
        <Button
          variant="danger"
          onClick={async () => {
            await logout();
            router.push("/");
          }}
        >
          Log out
        </Button>
      </div>
    </div>
  );
}
