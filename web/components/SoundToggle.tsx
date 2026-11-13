"use client";
import { Volume2, VolumeX } from "lucide-react";
import { usePrefs } from "@/store/prefs";

export default function SoundToggle() {
  const { sound, set } = usePrefs();
  return (
    <button
      type="button"
      onClick={() => set({ sound: !sound })}
      aria-pressed={sound}
      aria-label={sound ? "Mute sounds" : "Turn sounds on"}
      className="flex size-11 items-center justify-center rounded-xl text-muted hover:bg-raised hover:text-ivory"
    >
      {sound ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
    </button>
  );
}
