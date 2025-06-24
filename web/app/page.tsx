'use client'
import Button from "@/components/Button";
import { useAuth } from "@/store/auth";
import Link from "next/link";

export default function Home() {
  const { user } = useAuth();

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">Chess Mastery</h1>
      <p className="text-gray-600 mb-6">
        Learn chess openings, strategies, and tactics. Choose your path to becoming a chess master.
      </p>

      <div className="flex gap-5 items-center justify-between">

        <Link href="/lessons" className="w-full">
          <Button text="Explore Lessons" />
        </Link>

        {user?.role === 'ADMIN' && (
          <Link href="/admin" className="w-full">
            <Button color="red" text="Admin Dashboard" />
          </Link>
        )}
      </div>
    </main>
  );
}