import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { Chess } from 'chess.js';
import { BoardFlip } from 'src/types/types';

// Courses live as plain files so they can be edited in any chess GUI or in a
// Lichess Study and reviewed line by line in a pull request:
//   courses/<folder>/course.json        name, code, side, summary, key ideas
//   courses/<folder>/NN-<slug>.pgn      one line per file, with {notes}
// Each PGN needs [Chapter], [Line] and [Opening] (the Lichess name) headers.

export interface CourseLine {
  file: string;
  chapter: string;
  title: string;
  officialName: string;
  description: string; // comment before the first move
  moves: string[];
  notes: string[]; // notes[i] explains moves[i]; '' when there's none
}

export interface Course {
  code: string;
  name: string;
  side: BoardFlip;
  description: string;
  summary: string;
  keyIdeas: string[];
  lines: CourseLine[];
}

export const COURSES_DIR = join(__dirname, 'courses');

export function parseLine(file: string, pgn: string): CourseLine {
  const chess = new Chess();
  try {
    chess.loadPgn(pgn);
  } catch (err) {
    throw new Error(`${file}: ${err instanceof Error ? err.message : err}`);
  }
  const headers = chess.getHeaders();
  const comments = new Map(chess.getComments().map((c) => [c.fen, c.comment]));
  const history = chess.history({ verbose: true });
  const missing = ['Chapter', 'Line', 'Opening'].filter((h) => !headers[h]);
  if (missing.length)
    throw new Error(`${file}: missing [${missing.join('], [')}]`);

  return {
    file,
    chapter: headers.Chapter,
    title: headers.Line,
    officialName: headers.Opening,
    description: comments.get(history[0]?.before ?? '') ?? '',
    moves: history.map((m) => m.san),
    notes: history.map((m) => comments.get(m.after) ?? ''),
  };
}

export function loadCourses(dir = COURSES_DIR): Course[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const folder = join(dir, d.name);
      const meta = JSON.parse(
        readFileSync(join(folder, 'course.json'), 'utf8'),
      ) as Omit<Course, 'lines'>;
      const lines = readdirSync(folder)
        .filter((f) => f.endsWith('.pgn'))
        .sort()
        .map((f) =>
          parseLine(`${d.name}/${f}`, readFileSync(join(folder, f), 'utf8')),
        );
      return { ...meta, lines };
    });
}
