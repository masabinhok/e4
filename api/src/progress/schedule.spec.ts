import { INTERVAL_DAYS, MAX_BOX, schedule } from './schedule';

const now = new Date('2026-01-01T12:00:00Z');
const days = (d: Date) => (d.getTime() - now.getTime()) / 86_400_000;

describe('schedule', () => {
  it('a first clean run puts a new line in box 1, due tomorrow', () => {
    const s = schedule(0, 0, now);
    expect(s.box).toBe(1);
    expect(days(s.dueAt)).toBe(1);
  });

  it('each clean run moves up a box and waits longer', () => {
    let box = 0;
    const waits: number[] = [];
    for (let i = 0; i < 6; i++) {
      const s = schedule(box, 0, now);
      box = s.box;
      waits.push(days(s.dueAt));
    }
    expect(waits).toEqual([1, 3, 7, 14, 30, 30]); // capped at the top box
    expect(box).toBe(MAX_BOX);
  });

  it('any mistake sends the line back to box 1', () => {
    const s = schedule(4, 2, now);
    expect(s.box).toBe(1);
    expect(days(s.dueAt)).toBe(INTERVAL_DAYS[1]);
  });
});
