import { existsSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { Chess } from 'chess.js';
import { loadCourses } from './courses';

// Dev-only content check (not part of CI): asks Lichess's free cloud eval about
// every position where the learner moves, and flags moves that are outside the
// engine's top 3 and lose more than about a pawn. "no eval" means Lichess has no
// stored analysis, which usually means the position is rarely reached.
// Usage: npm run check:evals [-- course-code]

type Pv = { moves: string; cp?: number; mate?: number };
const CACHE = join(tmpdir(), 'e4-cloud-eval-cache.json');
const cache: Record<string, Pv[] | null> = existsSync(CACHE)
  ? JSON.parse(readFileSync(CACHE, 'utf8'))
  : {};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function evalOf(fen: string): Promise<Pv[] | null> {
  if (fen in cache) return cache[fen];
  for (;;) {
    const res = await fetch(
      `https://lichess.org/api/cloud-eval?multiPv=3&fen=${encodeURIComponent(fen)}`,
    );
    await sleep(1100); // stay well under Lichess's rate limit
    if (res.status === 429) {
      console.log('  rate limited, waiting a minute…');
      await sleep(60_000);
      continue;
    }
    cache[fen] = res.ok ? ((await res.json()) as { pvs: Pv[] }).pvs : null;
    writeFileSync(CACHE, JSON.stringify(cache));
    return cache[fen];
  }
}

// Lichess writes castling king-to-rook (e1h1); chess.js writes e1g1.
const CASTLING: Record<string, string> = {
  e1h1: 'e1g1',
  e1a1: 'e1c1',
  e8h8: 'e8g8',
  e8a8: 'e8c8',
};
const firstMove = (pv: Pv) => {
  const uci = pv.moves.split(' ')[0];
  return CASTLING[uci] ?? uci;
};

// Lichess reports from White's point of view; convert to the side to move.
// Mates count as ±100 pawns.
const score = (pv: Pv, turn: 'w' | 'b') =>
  (turn === 'w' ? 1 : -1) *
  (pv.mate !== undefined ? Math.sign(pv.mate) * 10_000 : (pv.cp ?? 0));

async function main() {
  const only = process.argv[2];
  let flags = 0;
  for (const course of loadCourses().filter((c) => !only || c.code === only)) {
    console.log(`\n${course.name} (${course.side})`);
    const learner = course.side === 'white' ? 0 : 1;
    for (const line of course.lines) {
      const chess = new Chess();
      const problems: string[] = [];
      for (const [i, san] of line.moves.entries()) {
        const before = chess.fen();
        const move = chess.move(san);
        if (i % 2 !== learner) continue;
        const pvs = await evalOf(before);
        const label = `${Math.floor(i / 2) + 1}${i % 2 ? '...' : '.'}${san}`;
        if (!pvs?.length) {
          problems.push(`${label}: no eval`);
          continue;
        }
        // Castling notation only differs for a king move, and a top-3 king move from e1/e8 is castling here.
        if (pvs.some((pv) => firstMove(pv) === move.lan)) continue;
        const after = await evalOf(chess.fen());
        const loss = after?.length
          ? (score(pvs[0], move.color) + score(after[0], chess.turn())) / 100
          : undefined;
        if (loss === undefined || loss > 1) {
          problems.push(
            `${label}: not in top 3${loss === undefined ? '' : `, about ${loss.toFixed(1)} pawns worse`}`,
          );
        }
      }
      flags += problems.length;
      console.log(
        `  ${problems.length ? '!' : '✓'} ${line.title}${problems.length ? `\n      ${problems.join('\n      ')}` : ''}`,
      );
    }
  }
  console.log(`\n${flags} flag(s).`);
}

void main();
