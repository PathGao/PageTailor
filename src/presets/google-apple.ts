import { appleCss, appleScripts } from "../serp/apple";
import { google } from "../serp/google";
import { tagTopModules } from "../serp/top";
import type { Preset } from "./types";

export const googleApple: Preset = {
  id: "google-apple",
  name: "Google 苹果风外观",
  matches: google.matches,
  exclude: google.exclude,
  intent: "苹果风格：系统字体、浅灰底、紧凑的白色圆角卡片、柔和阴影、胶囊搜索框，深色跟随 Google 自己的主题设置（不跟系统）。AI 概览也做成卡片并和结果左右对齐。隐藏 Google 的「翻译此页」「转为简体网页」链接（窄卡片里会折行）；结果下方的区域（用户还搜索了、翻页）不改。结果上方的通知（安全搜索等）去掉整条白底，融入页面。网站图标的主色用得克制：卡片左上角一层很淡的底色，加上标题悬停色。整张卡片可点击打开结果，文字仍可选中复制；每张卡片固定四个位置：来源、标题（最多 2 行）、摘要（最多 3 行）、右侧配图；价格、评分、回答数等附加信息各 1 行。",
  source: "preset",
  site: { id: "google", serp: google },
  enhance: () => {
    const stops = [appleScripts(google), tagTopModules(google)];
    return () => stops.forEach((stop) => stop());
  },
  css: appleCss(google),
};
