import { columnsCss } from "../serp/columns";
import { google } from "../serp/google";
import { regularGrid } from "../serp/grid";
import { tagTopModules } from "../serp/top";
import type { Preset } from "./types";

export const googleSearchColumns: Preset = {
  id: "google-search-columns",
  name: "Google 搜索结果多列",
  matches: google.matches,
  exclude: google.exclude,
  intent: "宽屏上把搜索结果排成多列（每列至少 380px，MacBook 内置屏 3 列），窗口超过 1400 后不再变宽、居中；AI 概览与结果左右对齐；规整网格：同一行卡片等高，每段末行不满时拉宽卡片补满，不留空；比其他卡片高很多的（带一排子链接的官网）单独占一行，子链接排成多列；窄卡片里过宽的配图移到文字下方；视频等非普通结果占满整行；右侧知识面板保留；实体页和窄屏不动。",
  source: "preset",
  site: { id: "google", serp: google },
  enhance: () => {
    const stops = [tagTopModules(google), regularGrid(google)];
    return () => stops.forEach((stop) => stop());
  },
  css: columnsCss(google),
};
