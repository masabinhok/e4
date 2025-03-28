'use client'
import ChessGame from "@/components/Chessboard";
import { use } from "react";

export default function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params); // Unwrap params using React.use()
  return (
    <main className="">
      <section className="flex flex-col items-center fixed bottom-10 right-10 ">
        <h1 className=" font-bold">Lesson: {slug.toUpperCase()}</h1>
      </section>
      <section className="w-full">
        <ChessGame />
      </section>
    </main>
  );
}
