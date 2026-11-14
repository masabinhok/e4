import { usePrefs } from "@/store/prefs";

// The coach's voice: the browser's own speech synthesis, so no API or quota.
// Voices differ by device; prefer the natural-sounding ones when they exist.
export function speak(text: string, force = false) {
  const { voice, volume } = usePrefs.getState();
  if ((!voice && !force) || typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth || !text) return;
  synth.cancel(); // a new note replaces the old one instead of queueing
  const u = new SpeechSynthesisUtterance(text);
  const english = synth.getVoices().filter((v) => v.lang.startsWith("en"));
  u.voice =
    english.find((v) => /natural|google|samantha|daniel/i.test(v.name)) ??
    english[0] ??
    null;
  u.lang = u.voice?.lang ?? "en-US";
  u.volume = volume;
  synth.speak(u);
}

export function stopSpeaking() {
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
}
