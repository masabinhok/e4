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

    const playAudio = (path: string) => {
      const audio = new Audio(path);
      audio.play();
    };

    switch (soundEvent) {
      case 'moveSelf':
        playAudio('/audio/move-self.mp3');
        break;
      case 'moveOpponent':
        playAudio('/audio/move-opponent.mp3');
        break;
      case 'achievement':
        console.log('Playing achievement sound');
        playAudio('/audio/achievement.mp3');
        break;
      case 'lessonPass':
        console.log('Playing lessonPass sound');
        playAudio('/audio/lesson-pass.mp3');
        break;
      case 'scatter':
        playAudio('/audio/scatter.mp3');
        break;
      case 'illegal':
        playAudio('/audio/illegal.mp3');
        break;
      case 'incorrect':
        playAudio('/audio/incorrect.mp3');
        break;
      case 'capture':
        playAudio('/audio/capture.mp3');
        break;
      case 'promotion':
        playAudio('/audio/promote.mp3');
        break;
      case 'check':
        playAudio('/audio/move-check.mp3');
        break;
      case 'castle':
        playAudio('/audio/castle.mp3');
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