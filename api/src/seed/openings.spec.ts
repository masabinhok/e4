import { Chess } from 'chess.js';
import { openings } from './openings';

// Every seeded line must replay legally, so a typo can never ship to the demo.
describe('seed openings', () => {
  const lines = openings.flatMap((o) =>
    o.variations.map((v) => [`${o.code}: ${v.title}`, v.moves] as const),
  );

  it.each(lines)('%s is a legal line', (_, moves) => {
    const chess = new Chess();
    for (const move of moves) expect(() => chess.move(move)).not.toThrow();
  });

  it('has unique opening codes and variation titles', () => {
    expect(new Set(openings.map((o) => o.code)).size).toBe(openings.length);
    for (const o of openings) {
      const titles = o.variations.map((v) => v.title);
      expect(new Set(titles).size).toBe(titles.length);
    }
  });
});
