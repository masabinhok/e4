import { create } from "zustand";

type BoardState = {
  isFlipped: boolean,
  setIsFlipped : (val: boolean) => void
}

export const useBoardStore = create<BoardState>((set) => ({
  isFlipped :false,
  setIsFlipped: (val: boolean) => set({isFlipped: val})
}));