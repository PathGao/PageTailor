import { describe, expect, it } from "vitest";
import { geminiWide } from "./presets/gemini-wide";
import { googleSearchColumns } from "./presets/google-search-columns";
import { cssForUrl, ruleMatches, type StyleRule } from "./rules";

describe("Google preset scope", () => {
  const on = (url: string) => ruleMatches(googleSearchColumns, url);

  it("applies to the All and Web tabs", () => {
    expect(on("https://www.google.com/search?q=css")).toBe(true);
    expect(on("https://www.google.co.jp/search?q=css&udm=14")).toBe(true);
  });

  it("skips images, videos, shopping and news, including udm values that start with 14's digits", () => {
    expect(on("https://www.google.com/search?q=css&udm=2")).toBe(false);
    expect(on("https://www.google.com/search?udm=7&q=css")).toBe(false);
    expect(on("https://www.google.com/search?q=css&udm=28")).toBe(false);
    expect(on("https://www.google.com/search?q=css&udm=140")).toBe(false);
    expect(on("https://www.google.com/search?q=css&tbm=nws")).toBe(false);
  });

  it("does not leak onto other Google pages or lookalike hosts", () => {
    expect(on("https://www.google.com/maps/search/tokyo")).toBe(false);
    expect(on("https://www.google.com.evil.example/search?q=x")).toBe(false);
  });
});

describe("subdomain wildcard", () => {
  it("covers every Wikipedia language but not lookalike hosts", async () => {
    const { wikipediaApple } = await import("./presets/wikipedia-apple");
    expect(ruleMatches(wikipediaApple, "https://zh.wikipedia.org/wiki/东京铁塔")).toBe(true);
    expect(ruleMatches(wikipediaApple, "https://en.wikipedia.org/wiki/Tokyo_Tower")).toBe(true);
    expect(ruleMatches(wikipediaApple, "https://en.wikipedia.org.evil.example/wiki/x")).toBe(false);
    expect(ruleMatches(wikipediaApple, "https://evilwikipedia.org/wiki/x")).toBe(false);
  });
});

describe("cssForUrl", () => {
  const user: StyleRule = { ...geminiWide, id: "mine", source: "user", css: "/*mine*/" };

  it("puts user rules after presets so they win the cascade", () => {
    const css = cssForUrl("https://gemini.google.com/app/1", [user, geminiWide], {});
    expect(css.indexOf("gemini-wide")).toBeLessThan(css.indexOf("/*mine*/"));
  });

  it("rules are on by default and dropped once turned off", () => {
    const url = "https://gemini.google.com/app";
    expect(cssForUrl(url, [geminiWide, user], {})).toContain("/*mine*/");
    expect(cssForUrl(url, [geminiWide], { "gemini-wide": false })).toBe("");
  });
});
