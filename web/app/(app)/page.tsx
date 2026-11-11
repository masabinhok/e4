"use client";
import Button from "@/components/Button";
import { useAuth } from "@/store/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const { user, demoLogin, isLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");

  const startDemo = async () => {
    setError("");
    try {
      await demoLogin();
      router.push("/lessons");
    } catch {
      setError(
        "Couldn't start the demo. The server may be waking up; try again in a minute.",
      );
    }
  };

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">Chess Mastery</h1>
      <p className="text-gray-600 mb-6">
        Learn chess openings, strategies, and tactics. Choose your path to
        becoming a chess master.
      </p>

      <div className="flex gap-5 items-center justify-between">
        <Link href="/lessons" className="w-full">
          <Button text="Explore Lessons" />
        </Link>

        {!user && (
          <Button
            text={isLoading ? "Starting demo..." : "Try the demo, no signup"}
            onClick={startDemo}
            disabled={isLoading}
          />
        )}

        {user?.role === "ADMIN" && (
          <Link href="/admin" className="w-full">
            <Button color="red" text="Admin Dashboard" />
          </Link>
        )}
      </div>
      {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
    </main>
  );
}
