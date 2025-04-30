export type OpeningVariation = {
  title: string;
  index: number;
  moves: string[];
  boardflip: "white" | "black";
  description: string;
};

export type Opening = {
  name: string;
  description: string;
  code: string;
  variations: OpeningVariation[];
};


export type BoardFlip = "white" | "black";