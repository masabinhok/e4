"use client";
import { Speech } from "lucide-react";
import { speak, stopSpeaking } from "@/lib/speak";
import { usePrefs } from "@/store/prefs";

export default function VoiceToggle() {
  const { voice, set } = usePrefs();
  const toggle = () => {
    set({ voice: !voice });
    // Speaking inside the tap also unlocks speech on iOS for later notes.
    if (voice) stopSpeaking();
    else speak("Coach voice on.", true);
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={voice}
      aria-label={
        voice ? "Stop reading the coach aloud" : "Read the coach aloud"
      }
      title={voice ? "Coach voice on" : "Coach voice off"}
      className={`flex size-11 items-center justify-center rounded-xl hover:bg-raised hover:text-ivory ${voice ? "text-amber" : "text-muted"}`}
    >
      <Speech className="size-5" />
    </button>
  );
}
