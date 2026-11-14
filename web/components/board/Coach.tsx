"use client";
import { useEffect } from "react";
import { LogoMark } from "@/components/Logo";
import { speak, stopSpeaking } from "@/lib/speak";

const tones = {
  note: "bg-raised",
  correct: "bg-moss/15 ring-1 ring-moss/40",
  wrong: "bg-ember/15 ring-1 ring-ember/40",
  done: "bg-amber/15 ring-1 ring-amber/50",
};

// The coach's voice: an avatar and a speech bubble.
// `say` is the plain text read aloud when the coach voice is on.
export default function Coach({
  tone = "note",
  say,
  children,
}: {
  tone?: keyof typeof tones;
  say?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!say) return;
    speak(say);
    return stopSpeaking;
  }, [say]);

  return (
    <div className="flex items-start gap-3" aria-live="polite">
      <LogoMark className="mt-1 size-10 shrink-0 rounded-full" />
      <div
        className={`relative min-w-0 flex-1 rounded-2xl rounded-tl-md px-4 py-3 text-[15px] leading-relaxed ${tones[tone]}`}
      >
        {children}
      </div>
    </div>
  );
}
