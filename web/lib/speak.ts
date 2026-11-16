import { create } from "zustand";
import { usePrefs } from "@/store/prefs";

// Who is talking: the checked lesson note, or the AI coach's answer.
export type Speaker = "note" | "ai";

// Who is speaking right now, so the AI avatar can move its mouth while it talks.
export const useSpeech = create<{ speaking: Speaker | null }>(() => ({
  speaking: null,
}));

let current: SpeechSynthesisUtterance | null = null;

// The coach's voice: the browser's own speech synthesis, so no API or quota.
// Voices differ by device; prefer the natural-sounding ones when they exist.
// The AI coach gets a different voice where the device has a second good one,
// and always a higher pitch, so you can hear which part the model wrote.
export function speak(
  text: string,
  { force = false, by = "note" }: { force?: boolean; by?: Speaker } = {},
) {
  const { voice, volume } = usePrefs.getState();
  if ((!voice && !force) || typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth || !text) return;
  synth.cancel(); // a new note replaces the old one instead of queueing
  const u = new SpeechSynthesisUtterance(text);
  const english = synth.getVoices().filter((v) => v.lang.startsWith("en"));
  const good = english.filter((v) =>
    /natural|google|samantha|daniel/i.test(v.name),
  );
  const noteVoice = good[0] ?? english[0] ?? null;
  u.voice = by === "ai" ? (good[1] ?? noteVoice) : noteVoice;
  u.lang = u.voice?.lang ?? "en-US";
  u.volume = volume;
  if (by === "ai") {
    u.pitch = 1.2;
    u.rate = 1.05;
  }
  // cancel() ends the previous utterance late, so only the current one may clear the state.
  const done = () => {
    if (current !== u) return;
    current = null;
    useSpeech.setState({ speaking: null });
  };
  u.onstart = () => {
    if (current === u) useSpeech.setState({ speaking: by });
  };
  u.onend = done;
  u.onerror = done;
  current = u;
  synth.speak(u);
}

export function stopSpeaking() {
  if (typeof window === "undefined") return;
  current = null;
  useSpeech.setState({ speaking: null });
  window.speechSynthesis?.cancel();
}
