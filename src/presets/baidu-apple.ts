import { appleCss, appleScripts } from "../serp/apple";
import { baidu } from "../serp/baidu";
import { tagTopModules } from "../serp/top";
import type { Preset } from "./types";

export const baiduApple: Preset = {
  id: "baidu-apple",
  name: "百度苹果风外观",
  matches: baidu.matches,
  exclude: baidu.exclude,
  intent: "和 Google 苹果风同一套外观：浅灰底、白色圆角卡片、系统字体、标题 2 行摘要 3 行、配图靠右、整卡可点、文字可选。",
  source: "preset",
  site: { id: "baidu", serp: baidu },
  enhance: () => {
    const stops = [appleScripts(baidu), tagTopModules(baidu)];
    return () => stops.forEach((stop) => stop());
  },
  css: appleCss(baidu),
};
