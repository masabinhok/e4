import { expect, test } from "@playwright/test";
import { parseMoves } from "../lib/chess";
import {
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
    const s = initialTrainer(line, "black", "practice");
    expect(isLearnersTurn(s)).toBe(false);
    expect(opponentShouldMove(s)).toBe(true);
    const after = run(s, { type: "next" });
    expect(isLearnersTurn(after)).toBe(true);
  });

  test("a wrong move counts in quiz but not in learn", () => {
    const quiz = run(initialTrainer(line, "white", "quiz"), {
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
      initialTrainer(line, "white", "quiz"),
      { type: "attempt", san: "e4" },
      { type: "attempt", san: "c6" },
    );
    expect(s).toMatchObject({ index: 1, mistakes: 0 });
  });

  test("completing the line once, then restarting, clears it", () => {
    let s = initialTrainer(line, "white", "quiz");
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
        initialTrainer(line, "white", "quiz"),
        { type: "next" },
        { type: "back" },
      ).index,
    ).toBe(1);
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
