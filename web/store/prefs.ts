import { create } from "zustand";
import { persist } from "zustand/middleware";

// Per-device preferences: board look and sound. Kept in localStorage only.

export const BOARD_THEMES = {
  maple: { label: "Maple", light: "#f1dcba", dark: "#c2915f" },
  walnut: { label: "Walnut", light: "#e8d3b0", dark: "#8f6a4a" },
  rosewood: { label: "Rosewood", light: "#f3e2cf", dark: "#b07b62" },
} as const;
export const PIECE_SETS = {
  papercut: { label: "Papercut", credit: "Nikolay Anzarov, CC BY 4.0" },
  chessnut: { label: "Chessnut", credit: "Alexis Luengas, Apache-2.0" },
} as const;

export type BoardTheme = keyof typeof BOARD_THEMES;
export type PieceSet = keyof typeof PIECE_SETS;

type Prefs = {
  board: BoardTheme;
  pieces: PieceSet;
  sound: boolean;
  volume: number; // 0..1
  set: (p: Partial<Omit<Prefs, "set">>) => void;
};

export const usePrefs = create<Prefs>()(
  persist(
    (set) => ({
      board: "maple",
      pieces: "papercut",
      sound: true,
      volume: 0.8,
      set: (p) => set(p),
    }),
    { name: "e4-prefs" },
  ),
);
