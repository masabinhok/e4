export type Mode = 'practice' | 'quiz' | 'learn'

export type BoardFlip = 'white' | 'black'


export type User = {
  username: string;
  _id: string;
}

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
