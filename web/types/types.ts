export type Mode = 'practice' | 'quiz' | 'learn'

export type BoardFlip = 'white' | 'black'


export type User = {
  _id: string;
  username: string;
  passHash?: string;
  recordedLines?: string[];
  customLines?: string[];
  practicedLines?: string[];
  quizzedLines?: string[];
  learnedLines?: string[];
  __v?: number;
};


export type OpeningVariation = {
  title: string;
  index: number;
  moves: string[];
  boardflip: BoardFlip
  description: string;
};

export type Opening = {
  name: string;
  description: string;
  code: string;
  variations: OpeningVariation[];
};
