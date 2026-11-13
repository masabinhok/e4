import { expect, test } from "@playwright/test";
import { parseMoves } from "../lib/chess";
import { Progress, statusOf, whenDue } from "../lib/progress";
import {
  branchPoint,
  initialTrainer,
  isComplete,
  isLearnersTurn,
  opponentShouldMove,
  trainerReducer,
  TrainerState,
} from "../lib/trainer";

// Pure logic, no browser needed.
const line = ["e4", "c6", "d4", "d5"];
const run = (
  s: TrainerState,
  ...actions: Parameters<typeof trainerReducer>[1][]
) => actions.reduce(trainerReducer, s);

test.describe("trainer", () => {
  test("black waits for the opponent, then moves", () => {
    const s = initialTrainer(line, "black", "drill");
    expect(isLearnersTurn(s)).toBe(false);
    expect(opponentShouldMove(s)).toBe(true);
    const after = run(s, { type: "next" });
    expect(isLearnersTurn(after)).toBe(true);
  });

  test("a wrong move counts in a drill but not in learn", () => {
    const quiz = run(initialTrainer(line, "white", "drill"), {
      type: "attempt",
      san: "d4",
    });
    expect(quiz).toMatchObject({ index: 0, mistakes: 1, wrong: 1 });
    const learn = run(initialTrainer(line, "white", "learn"), {
      type: "attempt",
      san: "d4",
    });
    expect(learn).toMatchObject({ index: 0, mistakes: 0, wrong: 1 });
  });

  test("moves out of turn are ignored", () => {
    const s = run(
      initialTrainer(line, "white", "drill"),
      { type: "attempt", san: "e4" },
      { type: "attempt", san: "c6" },
    );
    expect(s).toMatchObject({ index: 1, mistakes: 0 });
  });

  test("completing the line once, then restarting, clears it", () => {
    let s = initialTrainer(line, "white", "drill");
    s = run(
      s,
      { type: "attempt", san: "e4" },
      { type: "next" },
      { type: "attempt", san: "d4" },
      { type: "next" },
    );
    expect(isComplete(s)).toBe(true);
    expect(opponentShouldMove(s)).toBe(false);
    expect(run(s, { type: "next" })).toBe(s); // no-op past the end
    expect(run(s, { type: "reset" })).toMatchObject({ index: 0, mistakes: 0 });
  });

  test("back works only in learn mode", () => {
    expect(
      run(
        initialTrainer(line, "white", "learn"),
        { type: "next" },
        { type: "back" },
      ).index,
    ).toBe(0);
    expect(
      run(
        initialTrainer(line, "white", "drill"),
        { type: "next" },
        { type: "back" },
      ).index,
    ).toBe(1);
  });
});

test.describe("drill extras", () => {
  test("a hint counts as a mistake, on the learner's turn only", () => {
    const s = run(initialTrainer(line, "black", "drill"), { type: "hint" });
    expect(s.mistakes).toBe(0); // White to move: no hint to give
    expect(run(s, { type: "next" }, { type: "hint" }).mistakes).toBe(1);
  });

  test("branchPoint finds where a line leaves the others", () => {
    const short = ["e4", "c6", "d4", "d5", "e5", "Bf5", "Nf3"];
    const tal = ["e4", "c6", "d4", "d5", "e5", "Bf5", "h4"];
    const panov = ["e4", "c6", "d4", "d5", "exd5"];
    expect(branchPoint(short, [tal, panov])).toBe(6);
    expect(branchPoint(panov, [short])).toBe(4);
    expect(branchPoint(short, [])).toBe(0);
  });

  test("jump skips ahead only from the start", () => {
    const s = run(initialTrainer(line, "white", "drill"), {
      type: "jump",
      index: 2,
    });
    expect(s.index).toBe(2);
    expect(run(s, { type: "jump", index: 3 }).index).toBe(2);
  });
});

test.describe("goto", () => {
  test("jumps to any position in learn mode, clamped to the line", () => {
    const s = initialTrainer(line, "white", "learn");
    expect(run(s, { type: "goto", index: 3 }).index).toBe(3);
    expect(run(s, { type: "goto", index: 99 }).index).toBe(line.length);
    expect(run(s, { type: "goto", index: -2 }).index).toBe(0);
  });

  test("does nothing in a drill, so a drill can't be skipped", () => {
    expect(
      run(initialTrainer(line, "white", "drill"), { type: "goto", index: 3 })
        .index,
    ).toBe(0);
  });
});

test.describe("progress", () => {
  const p = (box: number, dueInDays: number): Progress => ({
    _id: "p",
    variation: { _id: "v", title: "t", code: "c", moves: [] },
    box,
    dueAt: new Date(Date.now() + dueInDays * 86_400_000).toISOString(),
    reviews: 1,
    lastMistakes: 0,
  });

  test("status of a line", () => {
    expect(statusOf(undefined)).toBe("new");
    expect(statusOf(p(2, -1))).toBe("due");
    expect(statusOf(p(2, 3))).toBe("learned");
    expect(statusOf(p(4, 14))).toBe("mastered");
  });

  test("when it's due, in words", () => {
    expect(whenDue(p(1, 1).dueAt)).toBe("tomorrow");
    expect(whenDue(p(2, 3).dueAt)).toBe("in 3 days");
    expect(whenDue(p(2, -2).dueAt)).toBe("now");
  });
});

test.describe("parseMoves", () => {
  test("reads a full PGN with headers, comments, variations and a result", () => {
    const pgn = `[Event "Club"]\n[White "A"]\n\n1. e4 {best by test} c6 2. d4 (2. Nc3 d5) d5 3. e5 Bf5 1-0`;
    expect(parseMoves(pgn)).toEqual(["e4", "c6", "d4", "d5", "e5", "Bf5"]);
  });

  test("reads a bare move list", () => {
    expect(parseMoves("1. d4 d5 2. Nc3 Nf6")).toEqual([
      "d4",
      "d5",
      "Nc3",
      "Nf6",
    ]);
  });

  test("rejects illegal moves and empty input", () => {
    expect(() => parseMoves("1. e4 e4")).toThrow();
    expect(() => parseMoves("   ")).toThrow();
  });
});
