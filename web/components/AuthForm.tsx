"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import Button from "@/components/Button";
import Field from "@/components/Field";
import ServerStatus from "@/components/ServerStatus";
import { errorMessage } from "@/lib/api";
import { useAuth } from "@/store/auth";

// Login and signup share one form; signup adds a name field and the password rules.
export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";
  const router = useRouter();
  const { login, signup, demoLogin, isLoading } = useAuth();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) router.replace("/lessons");
  }, [isAuthenticated, router]);

  const run = async (action: () => Promise<void>, to: string) => {
    setError("");
    try {
      await action();
      router.push(to);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    run(
      () =>
        isSignup
          ? signup(String(form.get("fullName")), email, password)
          : login(email, password),
      "/lessons",
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 py-6 lg:py-16">
      <div>
        <h1 className="text-3xl">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-muted">
          {isSignup
            ? "Save the lines you record and contribute your own."
            : "Log in to pick up where you left off."}
        </p>
      </div>

      <ServerStatus />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {isSignup && (
          <Field
            label="Name"
            id="fullName"
            autoComplete="name"
            required
            maxLength={100}
          />
        )}
        <Field
          label="Email"
          id="email"
          type="email"
          autoComplete="email"
          required
        />
        <Field
          label="Password"
          id="password"
          type={showPassword ? "text" : "password"}
          autoComplete={isSignup ? "new-password" : "current-password"}
          required
          minLength={isSignup ? 8 : undefined}
          maxLength={72}
          hint={isSignup ? "8 to 72 characters." : undefined}
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="flex size-11 items-center justify-center rounded-lg text-muted hover:text-ivory"
            >
              {showPassword ? (
                <EyeOff className="size-5" />
              ) : (
                <Eye className="size-5" />
              )}
            </button>
          }
        />

        {error && (
          <p role="alert" className="text-sm text-ember">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" disabled={isLoading}>
          {isSignup
            ? isLoading
              ? "Creating account…"
              : "Create account"
            : isLoading
              ? "Logging in…"
              : "Log in"}
        </Button>
      </form>

      <div className="flex items-center gap-3 text-sm text-muted">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>

      <Button
        variant="secondary"
        size="lg"
        disabled={isLoading}
        onClick={() => run(demoLogin, "/lessons")}
      >
        Try the demo, no signup
      </Button>

      <p className="text-center text-sm text-muted">
        {isSignup ? "Already have an account? " : "New to e4? "}
        <Link
          href={isSignup ? "/auth/login" : "/auth/signup"}
          className="font-medium text-brass hover:underline"
        >
          {isSignup ? "Log in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}
