'use client'
import ChessGame from "@/components/ChessGame";
import { use } from "react";

export default function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params); // Unwrap params using React.use()
  return (
    <main className="">
      <section className="w-full">
        <ChessGame code={slug} />
      </section>
    </main>
  );
}
