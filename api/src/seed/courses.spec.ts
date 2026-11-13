import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { Chess } from 'chess.js';
import { loadCourses } from './courses';

// Lichess's CC0 opening names, keyed by position. Lichess names positions,
// not move orders, so a transposition gets the same name.
const positionKey = (fen: string) => fen.split(' ').slice(0, 4).join(' ');

function lichessNames(): Map<string, string> {
  const dir = join(__dirname, '../../test/fixtures/lichess-openings');
  const names = new Map<string, string>();
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.tsv'))) {
    for (const row of readFileSync(join(dir, file), 'utf8')
      .split('\n')
      .slice(1)) {
      const [, name, pgn] = row.split('\t');
      if (!pgn) continue;
      const chess = new Chess();
      chess.loadPgn(pgn);
      const key = positionKey(chess.fen());
      if (!names.has(key)) names.set(key, name);
    }
  }
  return names;
}

/** The Lichess name of the deepest named position along the line. */
function deepestName(moves: string[], names: Map<string, string>) {
  const chess = new Chess();
  let name: string | undefined;
  for (const move of moves) {
    chess.move(move);
    name = names.get(positionKey(chess.fen())) ?? name;
  }
  return name;
}

const courses = loadCourses();
const names = lichessNames();

describe('courses', () => {
  it('has courses', () => {
    expect(courses.length).toBeGreaterThan(0);
  });

  describe.each(courses.map((c) => [c.code, c] as const))('%s', (_, course) => {
    it('has its metadata', () => {
      expect(['white', 'black']).toContain(course.side);
      expect(course.name && course.summary && course.description).toBeTruthy();
      expect(course.keyIdeas.length).toBeGreaterThan(0);
      expect(course.lines.length).toBeGreaterThan(0);
    });

    it('has unique line titles', () => {
      const titles = course.lines.map((l) => l.title);
      expect(new Set(titles).size).toBe(titles.length);
    });

    // chess.js has already replayed every move while loading, so they're legal.
    it.each(course.lines.map((l) => [l.file, l] as const))('%s', (_, line) => {
      const learnerParity = course.side === 'white' ? 0 : 1;
      const unexplained = line.moves.filter(
        (m, i) => i % 2 === learnerParity && !line.notes[i],
      );
      expect({ file: line.file, unexplained }).toEqual({
        file: line.file,
        unexplained: [],
      });

      expect(line.moves.length).toBeLessThanOrEqual(30);
      // The learner should make the last move, so a line ends on something they know.
      expect((line.moves.length - 1) % 2).toBe(learnerParity);

      // The [Opening] header must be Lichess's name for the line, which
      // catches mislabels like "Smyslov" on a Bronstein-Larsen line.
      expect(line.officialName).toBe(deepestName(line.moves, names));
    });
  });
});
