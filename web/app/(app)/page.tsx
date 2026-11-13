"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/Button";
import Dashboard from "@/components/Dashboard";
import HeroBoard from "@/components/HeroBoard";
import { errorMessage } from "@/lib/api";
import { useAuth } from "@/store/auth";

const steps = [
  {
    title: "Learn",
    text: "Step through a line move by move, with a short note on why each move is played.",
  },
  {
    title: "Drill",
    text: "Play your side from memory. The opponent answers; wrong moves and hints are counted.",
  },
  {
    title: "Review",
    text: "Each line comes back when it's due: soon after a mistake, weeks later once it sticks.",
  },
];

const courses = [
  {
    name: "Caro-Kann Defense",
    side: "For Black against 1.e4",
    text: "Solid and reliable: the Advance, Exchange, Panov, Classical and Two Knights, plus the common sidelines.",
  },
  {
    name: "Jobava London System",
    side: "For White with 1.d4",
    text: "An aggressive London with Nc3 and Bf4: Nb5 tricks, the f3–g4 plan, and an h-pawn attack against ...g6.",
  },
  {
    name: "Slav Defense",
    side: "For Black against 1.d4",
    text: "The Caro-Kann's twin: ...c6 and ...Bf5 against the main lines, the slow e3 systems, and the London and Colle.",
  },
  {
    name: "Italian Game",
    side: "For White against 1...e5",
    text: "The modern, slow Giuoco Pianissimo, the Two Knights with 4.d3, quieter replies and the traps to avoid.",
  },
];

export default function Home() {
  const { isAuthenticated, demoLogin, isLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");

  const startDemo = async () => {
    setError("");
    try {
      await demoLogin();
      router.push("/lessons");
    } catch (err) {
      setError(
        errorMessage(
          err,
          "Couldn't start the demo. The server may be waking up; try again in a minute.",
        ),
      );
    }
  };

  if (isAuthenticated) return <Dashboard />;

  return (
    <div className="flex flex-col gap-20 py-4 lg:py-10">
      <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <h1 className="text-4xl leading-tight sm:text-5xl">
            Learn chess openings by playing them, not watching them.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            Annotated opening courses you play on the board. Drill your moves
            from memory, and each line comes back for review when you&apos;re
            about to forget it.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={startDemo} disabled={isLoading}>
              {isLoading ? "Starting the demo…" : "Try the demo, no signup"}
            </Button>
            <Button href="/auth/login" variant="secondary" size="lg">
              Log in
            </Button>
          </div>
          {error && (
            <p role="alert" className="mt-4 text-sm text-ember">
              {error}
            </p>
          )}
        </div>
        <HeroBoard />
      </section>

      <section aria-labelledby="how" className="max-w-4xl">
        <h2 id="how" className="text-2xl">
          How a lesson works
        </h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="border-t border-line pt-4">
              <p className="font-display text-lg">
                <span className="text-amber">{i + 1}.</span> {step.title}
              </p>
              <p className="mt-2 text-sm text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="courses" className="max-w-4xl">
        <h2 id="courses" className="text-2xl">
          Courses
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {courses.map((c) => (
            <li
              key={c.name}
              className="rounded-xl border border-line bg-surface p-5"
            >
              <p className="font-display text-xl">{c.name}</p>
              <p className="mt-1 text-sm text-amber">{c.side}</p>
              <p className="mt-3 text-sm text-muted">{c.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
