export type Mode = 'practice' | 'quiz' | 'learn'

export type BoardFlip = 'white' | 'black'

export enum Role {
  Admin = 'ADMIN',
  User = 'USER'
}


export type User = {
  _id: string;
  fullName: string;
  email: string;
  role: Role
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
  _id: string;
  name: string;
  description: string;
  code: string;
  variations: OpeningVariation[];
};
