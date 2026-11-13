"use client";

import { create } from "zustand";
import { usePrefs } from "@/store/prefs";

// e4's own sound set, synthesised by web/scripts/render-sounds.mjs.
const FILES = {
  move: "/sounds/move.mp3",
  opponent: "/sounds/move-opponent.mp3",
  capture: "/sounds/capture.mp3",
  check: "/sounds/check.mp3",
  castle: "/sounds/castle.mp3",
  correct: "/sounds/correct.mp3",
  wrong: "/sounds/wrong.mp3",
  illegal: "/sounds/illegal.mp3",
  complete: "/sounds/complete.mp3",
  cleanRun: "/sounds/clean-run.mp3",
} as const;

export type SoundEvent = keyof typeof FILES;

// One preloaded element per sound, cloned when it's already playing, instead of
// downloading and decoding a new Audio object on every move.
const cache = new Map<SoundEvent, HTMLAudioElement>();
function audioFor(event: SoundEvent) {
  let audio = cache.get(event);
  if (!audio) {
    audio = new Audio(FILES[event]);
    audio.preload = "auto";
    cache.set(event, audio);
  }
  return audio.paused ? audio : (audio.cloneNode() as HTMLAudioElement);
}

interface SoundStore {
  playSound: (event: SoundEvent) => void;
}

export const useSoundStore = create<SoundStore>(() => ({
  playSound: (event) => {
    const { sound, volume } = usePrefs.getState();
    if (!sound || typeof window === "undefined") return;
    const audio = audioFor(event);
    audio.volume = volume;
    audio.currentTime = 0;
    audio.play().catch(() => {}); // browsers block sound until the first tap; that's fine
  },
}));
