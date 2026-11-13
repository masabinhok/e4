// Builds the coach's prompt from facts stored in the database only. The browser
// never sends free text, so the model key can't be used as a general chatbot.

export type CoachFacts = {
  openingName: string;
  side: 'white' | 'black';
  lineTitle: string;
  moves: string[]; // the whole line
  index: number; // the move being talked about: moves[index]
  note: string; // the verified note for moves[index]
  played?: string; // the learner's wrong move, if any
};

export const COACH_SYSTEM = [
  'You are the e4 chess coach: funny, warm and encouraging, talking to a club player learning an opening.',
  'Reply in at most 2 short sentences (under 45 words). Plain text: no markdown, lists or emojis.',
  'Use ONLY the facts you are given: the opening, the line, the moves and the verified note.',
  'Never invent other moves, variations, evaluations, engine numbers or historical claims.',
  'If the learner played a wrong move, tease them gently, then say which move the line plays and why, using the note.',
].join(' ');

/** Numbered SAN, e.g. ["e4","c6","d4"] → "1.e4 c6 2.d4". */
export function numbered(moves: string[]): string {
  return moves.map((m, i) => (i % 2 === 0 ? `${i / 2 + 1}.${m}` : m)).join(' ');
}

export function buildPrompt(f: CoachFacts) {
  const mover = f.index % 2 === 0 ? 'white' : 'black';
  const moveLabel = `${Math.floor(f.index / 2) + 1}${mover === 'white' ? '.' : '...'}${f.moves[f.index]}`;
  const lines = [
    `Opening: ${f.openingName} (the learner plays ${f.side})`,
    `Line: ${f.lineTitle}`,
    `Moves before it: ${numbered(f.moves.slice(0, f.index)) || '(start of the game)'}`,
    `Move: ${moveLabel}, played by ${mover === f.side ? 'the learner' : 'the opponent'}`,
    `Verified note: ${f.note || '(none)'}`,
  ];
  if (f.played)
    lines.push(
      `The learner tried ${f.played} instead, which is not this line's move.`,
    );
  lines.push(
    f.played
      ? 'React to their attempt in your voice.'
      : 'Explain this move in your voice.',
  );
  return [
    { role: 'system' as const, content: COACH_SYSTEM },
    { role: 'user' as const, content: lines.join('\n') },
  ];
}
