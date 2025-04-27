export type OpeningVariation = {
  name: string;
  index: number;
  line: string[];
  boardflip: "white" | "black";
  description: string;
};

export type Opening = {
  name: string;
  description: string;
  code: string;
  variations: OpeningVariation[];
};
