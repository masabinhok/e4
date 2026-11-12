"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/Button";
import Dashboard from "@/components/Dashboard";
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
    <div className="flex flex-col gap-16 py-4 lg:py-16">
      <section className="max-w-2xl">
        <h1 className="text-4xl leading-tight sm:text-5xl">
          Learn chess openings by playing them, not watching them.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted">
          Pick an opening, play through its main lines on the board, and drill
          them until you know what comes next.
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
      </section>

      <section aria-labelledby="how" className="max-w-4xl">
        <h2 id="how" className="text-2xl">
          How a lesson works
        </h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="border-t border-line pt-4">
              <p className="font-serif text-lg">
                <span className="text-brass">{i + 1}.</span> {step.title}
              </p>
              <p className="mt-2 text-sm text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
