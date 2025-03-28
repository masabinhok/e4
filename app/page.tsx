import Link from "next/link";

export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">Chess Mastery</h1>
      <p className="text-gray-600 mb-6">
        Learn chess openings, strategies, and tactics. Choose your path to becoming a chess master.
      </p>

      <Link href="/lessons" className="inline-block">
        <button className="p-3 px-6 bg-blue-100 text-blue-800 rounded-lg font-semibold hover:bg-blue-200 transition-colors">
          Explore Lessons
        </button>
      </Link>
    </main>
  );
}