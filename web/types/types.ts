export type Mode = "practice" | "quiz" | "learn";

export type BoardFlip = "white" | "black";

export enum Role {
  Admin = "ADMIN",
  User = "USER",
}

export enum Status {
  Pending = "PENDING",
  Accepted = "ACCEPTED",
  Rejected = "REJECTED",
}

export type User = {
  _id: string;
  fullName: string;
  email: string;
  role: Role;
  recordedLines?: string[];
  customLines?: string[];
  practicedLines?: string[];
  quizzedLines?: string[];
  learnedLines?: string[];
  __v?: number;
  createdAt: string;
};

export type OpeningVariation = {
  _id: string;
  title: string;
  moves: string[];
  boardflip: BoardFlip;
  description: string;
  status: Status;
  code: string;
  contributor: string;
};

export type Opening = {
  _id: string;
  name: string;
  description: string;
  code: string;
  variations: OpeningVariation[];
  status: Status;
};
