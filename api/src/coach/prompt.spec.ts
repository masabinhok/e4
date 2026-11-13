import { buildPrompt, numbered } from './prompt';

const facts = {
  openingName: 'Caro-Kann Defense',
  side: 'black' as const,
  lineTitle: 'Short System (4.Nf3)',
  moves: ['e4', 'c6', 'd4', 'd5', 'e5', 'Bf5'],
  index: 5,
  note: 'The bishop gets outside the pawn chain first.',
};

describe('coach prompt', () => {
  it('numbers moves like a scoresheet', () => {
    expect(numbered(['e4', 'c6', 'd4'])).toBe('1.e4 c6 2.d4');
  });

  it('contains only the facts it was given', () => {
    const [system, user] = buildPrompt(facts);
    expect(system.content).toMatch(/Use ONLY the facts/);
    expect(user.content.split('\n')).toEqual([
      'Opening: Caro-Kann Defense (the learner plays black)',
      'Line: Short System (4.Nf3)',
      'Moves before it: 1.e4 c6 2.d4 d5 3.e5',
      'Move: 3...Bf5, played by the learner',
      'Verified note: The bishop gets outside the pawn chain first.',
      'Explain this move in your voice.',
    ]);
  });

  it("includes the learner's wrong move when there is one", () => {
    const [, user] = buildPrompt({ ...facts, played: 'Bg4' });
    expect(user.content).toContain('The learner tried Bg4 instead');
    expect(user.content).toContain('React to their attempt');
  });

  it('knows whose move it is', () => {
    const [, user] = buildPrompt({ ...facts, index: 4 });
    expect(user.content).toContain('Move: 3.e5, played by the opponent');
  });
});
