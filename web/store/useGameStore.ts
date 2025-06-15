import { create } from 'zustand';
import { Chess, Move, Square } from 'chess.js';

// Define the shape of the store's state and actions
interface GameStore {
  game: Chess;
  code: string | null;
  variation: string[];
  currentMoveIndex: number;
  practiceCompleted: boolean;

  setCode: (code: string) => void;
  setVariation: (variation: string[]) => void;

  makeMove: (move: string) => void;
  resetGame: () => void;

  nextMove: () => void;
  prevMove: () => void;

  setPracticeCompleted: (val: boolean) => void;
}

// Create the Zustand store with types
export const useGameStore = create<GameStore>((set, get) => ({
  game: new Chess(),
  code: null,
  variation: [],
  currentMoveIndex: 0,
  practiceCompleted: false,

  setCode: (code) => set({ code }),

  setVariation: (variation) =>
    set({
      variation,
      currentMoveIndex: 0,
      game: new Chess(), // optional reset
    }),

  makeMove: (move) => {
    const currentGame = new Chess(get().game.fen());
    const result = currentGame.move(move);
    if (result) {
      set({ game: currentGame });
    }
  },

  resetGame: () =>
    set({
      game: new Chess(),
      currentMoveIndex: 0,
      practiceCompleted: false,
    }),

  nextMove: () => {
    const { variation, currentMoveIndex, game } = get();
    if (currentMoveIndex < variation.length) {
      const move = variation[currentMoveIndex];
      const updatedGame = new Chess(game.fen());
      const result = updatedGame.move(move);
      if (result) {
        set({
          game: updatedGame,
          currentMoveIndex: currentMoveIndex + 1,
        });
      }
    }
  },

  prevMove: () => {
    const { variation, currentMoveIndex } = get();
    if (currentMoveIndex > 0) {
      const newGame = new Chess();
      for (let i = 0; i < currentMoveIndex - 1; i++) {
        newGame.move(variation[i]);
      }
      set({
        game: newGame,
        currentMoveIndex: currentMoveIndex - 1,
      });
    }
  },

  setPracticeCompleted: (val) => set({ practiceCompleted: val }),
}));
