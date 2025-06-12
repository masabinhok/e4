'use client';

import { create } from 'zustand';

export type SoundEvent =
  | 'moveSelf'
  | 'moveOpponent'
  | 'achievement'
  | 'lessonPass'
  | 'scatter'
  | 'illegal'
  | 'incorrect'
  | 'capture'
  | 'promotion'
  | 'check'
  | 'castle';

interface SoundStore {
  playSound: (event: SoundEvent) => void;
}

export const useSoundStore = create<SoundStore>(() => ({
  playSound: (event) => {
    const getAudioPath = (event: SoundEvent): string => {
      switch (event) {
        case 'moveSelf':
          return '/audio/move-self.mp3';
        case 'moveOpponent':
          return '/audio/move-opponent.mp3';
        case 'achievement':
          return '/audio/achievement.mp3';
        case 'lessonPass':
          return '/audio/lesson-pass.mp3';
        case 'scatter':
          return '/audio/scatter.mp3';
        case 'illegal':
          return '/audio/illegal.mp3';
        case 'incorrect':
          return '/audio/incorrect.mp3';
        case 'capture':
          return '/audio/capture.mp3';
        case 'promotion':
          return '/audio/promote.mp3';
        case 'check':
          return '/audio/move-check.mp3';
        case 'castle':
          return '/audio/castle.mp3';
        default:
          return '';
      }
    };

    const path = getAudioPath(event);
    if (path) {
      const audio = new Audio(path);
      audio.play();
    }
  },
}));
