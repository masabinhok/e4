"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  FileText,
  LogOut,
  Shield,
  SquarePen,
  UserRound,
} from "lucide-react";
import logo from "@/public/icons/e4.svg";
import { useAuth } from "@/store/auth";

const items = [
  { href: "/lessons", label: "Lessons", Icon: BookOpen },
  { href: "/record", label: "Record", Icon: SquarePen },
  { href: "/custom", label: "PGNs", Icon: FileText },
  { href: "/profile", label: "Profile", Icon: UserRound },
];

function Wordmark() {
  return (
    <Link href="/" className="flex min-h-11 items-center gap-2.5">
      <Image src={logo} alt="" width={32} height={32} className="size-8" />
      <span className="font-serif text-xl font-semibold">e4.learnchess</span>
    </Link>
  );
}

// Desktop: a fixed left rail. Mobile: a slim top bar plus bottom tabs, so the
// main sections are one thumb-tap away and the board keeps the full width.
export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);
  const navItems =
    user?.role === "ADMIN"
      ? [...items, { href: "/admin", label: "Admin", Icon: Shield }]
      : items;

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <>
      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-night px-5 py-6 lg:flex">
        <Wordmark />
        {isAuthenticated ? (
          <nav aria-label="Main" className="mt-10 flex flex-col gap-1">
            {navItems.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-[15px] transition-colors ${
                  isActive(href)
                    ? "bg-raised text-ivory"
                    : "text-muted hover:bg-surface hover:text-ivory"
                }`}
              >
                <Icon
                  className={`size-5 ${isActive(href) ? "text-brass" : ""}`}
                  aria-hidden="true"
                />
                {label}
              </Link>
            ))}
          </nav>
        ) : (
          <div className="mt-10 flex flex-col gap-2">
            <Link
              href="/auth/login"
              className="flex min-h-11 items-center rounded-lg px-3 text-muted hover:bg-surface hover:text-ivory"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="flex min-h-11 items-center rounded-lg px-3 text-muted hover:bg-surface hover:text-ivory"
            >
              Sign up
            </Link>
          </div>
        )}

        <div className="mt-auto flex flex-col gap-1 border-t border-line pt-4 text-sm">
          {isAuthenticated && user && (
            <div className="flex items-center justify-between gap-2 px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-ivory">
                  {user.isDemo ? "Demo visitor" : user.fullName}
                </p>
                {user.isDemo && (
                  <p className="text-xs text-muted">Resets after 24 hours</p>
                )}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Log out"
                className="flex size-11 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface hover:text-ivory"
              >
                <LogOut className="size-5" />
              </button>
            </div>
          )}
          <Link
            href="/credit"
            className="flex min-h-11 items-center rounded-lg px-3 text-muted hover:text-ivory"
          >
            About the author
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-night/95 px-4 backdrop-blur lg:hidden">
        <Wordmark />
        {!isAuthenticated && (
          <Link
            href="/auth/login"
            className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-brass"
          >
            Log in
          </Link>
        )}
      </header>

      {/* Mobile bottom tabs */}
      {isAuthenticated && (
        <nav
          aria-label="Main"
          className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-night/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        >
          {items.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 text-xs ${
                isActive(href) ? "text-brass" : "text-muted"
              }`}
            >
              <Icon className="size-5" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
