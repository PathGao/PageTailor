import { baidu } from "../serp/baidu";
import { columnsCss } from "../serp/columns";
import { regularGrid } from "../serp/grid";
import { tagTopModules } from "../serp/top";
import type { Preset } from "./types";

export const baiduSearchColumns: Preset = {
  id: "baidu-search-columns",
  name: "百度搜索结果多列",
  matches: baidu.matches,
  exclude: baidu.exclude,
  intent: "宽屏上把百度搜索结果排成规整的多列，窗口超过 1400 后不再变宽、居中；同一行卡片等高，末行补满；视频、百科、「大家还在搜」等特殊卡片占满整行；右侧栏保留；窄屏不动。",
  source: "preset",
  site: { id: "baidu", serp: baidu },
  enhance: () => {
    const stops = [tagTopModules(baidu), regularGrid(baidu)];
    return () => stops.forEach((stop) => stop());
  },
  css: columnsCss(baidu),
};
