import { describe, expect, it } from "vitest";
import { assess } from "./health";

describe("assess", () => {
  it("is quiet on a healthy page", () => {
    expect(assess({ titledLinks: 10, results: 8, withSnippet: 8, withSource: 7 })).toEqual([]);
  });

  it("says nothing about pages with almost no results", () => {
    expect(assess({ titledLinks: 2, results: 0, withSnippet: 0, withSource: 0 })).toEqual([]);
  });

  it("reports results the adapter cannot find", () => {
    expect(assess({ titledLinks: 10, results: 0, withSnippet: 0, withSource: 0 })).toEqual(["结果 0/10"]);
    expect(assess({ titledLinks: 10, results: 3, withSnippet: 3, withSource: 3 })).toEqual(["结果 3/10"]);
  });

  it("reports slots gone from most results", () => {
    expect(assess({ titledLinks: 10, results: 9, withSnippet: 0, withSource: 9 })).toEqual(["摘要 0/9"]);
    expect(assess({ titledLinks: 10, results: 9, withSnippet: 9, withSource: 2 })).toEqual(["来源 2/9"]);
  });

  it("tolerates a few results without a snippet", () => {
    expect(assess({ titledLinks: 10, results: 9, withSnippet: 3, withSource: 9 })).toEqual([]);
  });
});
