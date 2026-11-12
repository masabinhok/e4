"use client";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { useAuth } from "@/store/auth";

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  if (!user) return null;

  // Only what the API actually records; practice and quiz progress isn't saved yet.
  const stats = [
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
          className="flex size-16 shrink-0 items-center justify-center rounded-full bg-raised font-serif text-2xl text-brass"
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
            className="rounded-xl border border-line bg-surface p-5 hover:border-brass/60"
          >
            <dt className="text-sm text-muted">{s.label}</dt>
            <dd className="mt-1 font-serif text-4xl tabular-nums">{s.value}</dd>
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
