import { Mode } from "@/types/types";
import { BlobOptions } from "buffer";
import { create } from "zustand";


// autplay, sound, mode ko setting handle garneee
type SettingsState = {
  autoPlay: boolean,
  toggleAutoPlay: () => void;

  mode: Mode
  setMode: (mode: Mode) => void;

  playSound: boolean,
  toggleSound: () => void;

  isBrowser : boolean,
  setIsBrowser: (value: boolean )=> void;
}


export const useSettingsStore =  create<SettingsState>((set)=> ({
  autoPlay: false,
  toggleAutoPlay: () => set((state)=>({ autoPlay: !state.autoPlay})),

  mode: 'practice',
  setMode: (mode) => set({mode}),
  
  playSound: true,
  toggleSound : () => set((state)=> ({
    playSound: !state.playSound
  })),

  isBrowser: typeof window !== 'undefined',
  setIsBrowser: (value) => set({ isBrowser: value }),

}))