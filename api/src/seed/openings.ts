import { readFileSync } from 'fs';
import { join } from 'path';
import { BoardFlip } from 'src/types/types';

export interface SeedOpening {
  name: string;
  code: string;
  description: string;
  variations: {
    title: string;
    description: string;
    boardflip: BoardFlip;
    moves: string[];
  }[];
}

// Read at runtime: the tsconfig has no esModuleInterop, so JSON default imports don't work.
// (Not named openings.json: require('./openings') would resolve the JSON before this file.)
export const openings = JSON.parse(
  readFileSync(join(__dirname, 'openings.data.json'), 'utf8'),
) as SeedOpening[];
