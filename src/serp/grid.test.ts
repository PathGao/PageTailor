import { describe, expect, it } from "vitest";
import { widen } from "./grid";

/** Places spans in order; returns false on a hole (a span that does not fit the rest of its row) or a short last row. */
function fills(spans: number[], cols: number): boolean {
  let c = 0;
  for (const s of spans) {
    if (s > cols || c + s > cols) return false;
    c = (c + s) % cols;
  }
  return c === 0;
}

describe("widen", () => {
  it("always fills whole rows without holes", () => {
    let seed = 7;
    const rand = (m: number) => (seed = (seed * 1103515245 + 12345) % 2 ** 31) % m;
    for (let t = 0; t < 500; t++) {
      const cols = 2 + rand(4);
      const scores = Array.from({ length: 1 + rand(12) }, () => rand(4));
      const spans = widen(scores, cols);
      expect(fills(spans, cols), `cols=${cols} scores=${scores} spans=${spans}`).toBe(true);
    }
  });

  it("gives the room to the richest card when it can take it", () => {
    // 4 cards, 3 columns: the rich last card becomes a full row instead of the last row being split.
    expect(widen([0, 0, 0, 5], 3)).toEqual([1, 1, 1, 3]);
    // The rich card sits first; widening it to 2 still leaves the run hole-free.
    expect(widen([4, 0, 0, 0, 0], 3)).toEqual([2, 1, 1, 1, 1]);
  });

  it("skips a rich card whose wider span would not fit its row, preferring the earlier rank among ties", () => {
    // Card 2 is richest but sits at the end of row 1, where a span of 2 leaves a hole; card 0 widens instead.
    expect(widen([0, 0, 3, 0, 0], 3)).toEqual([2, 1, 1, 1, 1]);
  });

  it("leaves a run that already fills its rows alone", () => {
    expect(widen([1, 2, 3], 3)).toEqual([1, 1, 1]);
  });
});
