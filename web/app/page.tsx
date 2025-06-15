'use client'
import Button from "@/components/Button";
import Link from "next/link";

export default function Home() {
  
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">Chess Mastery</h1>
      <p className="text-gray-600 mb-6">
        Learn chess openings, strategies, and tactics. Choose your path to becoming a chess master.
      </p>

      <Link href="/lessons" className="inline-block">
        <Button text="Explore Lessons" />
      </Link>
    </main>
  );
}