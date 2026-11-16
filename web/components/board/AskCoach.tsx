"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { speak, useSpeech } from "@/lib/speak";
import AiCoachAvatar from "./AiCoachAvatar";

type Answer = { text: string; source: "ai" | "cache" | "note" };

// "Ask the coach": a playful AI take on the move, built on the checked note.
// The note stays visible above it; this is extra flavour, not the source of truth.
export default function AskCoach({
  variationId,
  index,
  played,
}: {
  variationId: string;
  index: number;
  played?: string;
}) {
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [shown, setShown] = useState("");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const aiSpeaking = useSpeech((s) => s.speaking === "ai");

  // A new move or attempt starts a new conversation.
  useEffect(() => {
    setAnswer(null);
    setShown("");
    setFailed(false);
  }, [variationId, index, played]);

  // Type the reply out, unless the reader prefers less motion.
  useEffect(() => {
    if (!answer || answer.source === "note") return;
    speak(answer.text, { by: "ai" });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(answer.text);
      return;
    }
    let i = 0;
    const timer = setInterval(() => {
      i += 2;
      setShown(answer.text.slice(0, i));
      if (i >= answer.text.length) clearInterval(timer);
    }, 18);
    return () => clearInterval(timer);
  }, [answer]);

  const ask = async () => {
    setLoading(true);
    setFailed(false);
    try {
      setAnswer(
        await api<Answer>("/coach", {
          method: "POST",
          body: JSON.stringify({ variationId, index, played }),
        }),
      );
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  if (!answer) {
    return (
      <div className="mt-2">
        <button
          type="button"
          onClick={ask}
          disabled={loading}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 font-display text-sm font-extrabold text-amber hover:bg-amber/10 disabled:opacity-60"
        >
          <AiCoachAvatar
            state={loading ? "thinking" : "idle"}
            className="-ml-1 size-11"
          />
          {loading ? "The AI coach is thinking…" : "Ask the AI coach"}
        </button>
        {failed && (
          <p className="text-sm text-muted">
            The coach couldn&apos;t answer just now. Try again in a moment.
          </p>
        )}
      </div>
    );
  }

  if (answer.source === "note") {
    return (
      <div className="mt-2 flex items-center gap-2.5">
        <AiCoachAvatar state="sleeping" className="size-11 shrink-0" />
        <p className="text-sm text-muted">
          The AI coach is resting right now, so the note above is all there is.
        </p>
      </div>
    );
  }

  const typing = shown.length < answer.text.length;
  // It talks while the reply types out, and for as long as the voice reads it.
  return (
    <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-night/50 px-3 py-2.5">
      <AiCoachAvatar
        state={typing || aiSpeaking ? "speaking" : "idle"}
        className="size-11 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-xs font-bold text-moss">
          AI coach
          <span className="rounded-md bg-moss/15 px-1.5 py-px text-[11px] tracking-wide">
            LLM-generated
          </span>
        </p>
        <p
          className="mt-0.5 font-display text-[15px] font-bold text-ivory"
          aria-live="polite"
        >
          {shown}
          {typing && <span className="animate-pulse">▍</span>}
        </p>
        <p className="mt-1 text-xs text-muted">
          Playful, can be wrong. The note above is checked.
        </p>
      </div>
    </div>
  );
}
