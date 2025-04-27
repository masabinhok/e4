'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type SoundEvent =
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

interface SoundContextType {
  playSound: (event: SoundEvent) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [soundEvent, setSoundEvent] = useState<SoundEvent | null>(null);

  useEffect(() => {
    if (!soundEvent) return;

    const playSound = (path: string) => {
      const audio = new Audio(path);
      audio.play();
    };

    switch (soundEvent) {
      case 'moveSelf':
        playSound('/audio/move-self.mp3');
        break;
      case 'moveOpponent':
        playSound('/audio/move-opponent.mp3');
        break;
      case 'achievement':
        playSound('/audio/achievement.mp3');
        break;
      case 'lessonPass':
        playSound('/audio/lesson-pass.mp3');
        break;
      case 'scatter':
        playSound('/audio/scatter.mp3');
        break;
      case 'illegal':
        playSound('/audio/illegal.mp3');
        break;
      case 'incorrect':
        playSound('/audio/incorrect.mp3');
        break;
      case 'capture':
        playSound('/audio/capture.mp3');
        break;
      case 'promotion':
        playSound('/audio/promote.mp3');
        break;
      case 'check':
        playSound('/audio/move-check.mp3');
        break;
      case 'castle':
        playSound('/audio/castle.mp3');
        break;
      default:
        break;
    }

    setSoundEvent(null);
  }, [soundEvent]);

  const playSound = (event: SoundEvent) => {
    setSoundEvent(event);
  };

  return (
    <SoundContext.Provider value={{ playSound }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
}