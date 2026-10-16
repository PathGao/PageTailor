import type { Preset } from "./types";

// Verified 2026-10-13 at 1440px on the front page and a thread page (saved copies).
export const hackerNewsApple: Preset = {
  id: "hacker-news-apple",
  name: "Hacker News 苹果风外观",
  matches: ["https://news.ycombinator.com/*"],
  intent: "苹果风格：系统字体、浅灰底、白色毛玻璃顶栏（滚动时固定）、每条新闻一张圆角卡片、来源网站做成灰色标签；评论页每条评论一张卡片并保留缩进；支持深色模式。",
  source: "preset",
  css: `
/* Apple look for Hacker News. HN's markup is tables with stable class names (athing, titleline, subtext, comtr, commtext). */
:root {
  --pt-bg: #f5f5f7;
  --pt-card: #ffffff;
  --pt-text: #1d1d1f;
  --pt-text-2: #424245;
  --pt-text-3: #6e6e73;
  --pt-line: rgb(0 0 0 / 0.07);
  --pt-chip: #f0f0f2;
  --pt-orange: #ff6600;
  --pt-link: #0066cc;
  --pt-shadow: 0 1px 2px rgb(0 0 0 / 0.04), 0 4px 14px rgb(0 0 0 / 0.04);
  --pt-font: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Helvetica Neue", sans-serif;
  --pt-mono: ui-monospace, "SF Mono", Menlo, monospace;
  color-scheme: light;
}
@media (prefers-color-scheme: dark) {
  :root {
    --pt-bg: #000000;
    --pt-card: #1c1c1e;
    --pt-text: #f5f5f7;
    --pt-text-2: #d1d1d6;
    --pt-text-3: #8e8e93;
    --pt-line: rgb(255 255 255 / 0.08);
    --pt-chip: #2c2c2e;
    --pt-link: #2997ff;
    --pt-shadow: 0 0 0 1px rgb(255 255 255 / 0.06);
    color-scheme: dark;
  }
}

html, body { background: var(--pt-bg) !important; }
body, td, input, textarea, .admin, .title, .subtext, .comment, .comhead, .pagetop, .yclinks, .hnname {
  font-family: var(--pt-font) !important;
  -webkit-font-smoothing: antialiased;
}
#hnmain {
  width: min(880px, 100% - 32px) !important;
  background: transparent !important;
  margin-top: 12px;
}

/* Header: frosted bar that stays on top while scrolling. */
#hnmain > tbody > tr:first-child > td {
  position: sticky;
  top: 12px;
  z-index: 10;
  background: color-mix(in srgb, var(--pt-card) 72%, transparent) !important;
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-radius: 16px;
  box-shadow: var(--pt-shadow);
}
#hnmain > tbody > tr:first-child > td > table { padding: 10px 14px !important; }
#hnmain > tbody > tr:first-child img[src*="y18"] {
  width: 24px !important;
  height: 24px !important;
  border: 0 !important;
  border-radius: 7px;
  background: var(--pt-orange);
}
#hnmain > tbody > tr:first-child td:first-child { width: 24px !important; padding-right: 10px !important; }
.pagetop { color: var(--pt-text-3) !important; font-size: 14px !important; line-height: 24px; }
.pagetop a { color: var(--pt-text-2) !important; }
.pagetop a:hover { color: var(--pt-orange) !important; text-decoration: none; }
.hnname { margin-right: 14px !important; }
.hnname a { color: var(--pt-text) !important; font-size: 17px; font-weight: 700; letter-spacing: -0.01em; }

/* Stories: each pair of rows becomes one card. */
#bigbox > td > table { border-collapse: separate; border-spacing: 0; width: 100%; }
#bigbox > td { padding-top: 6px; }
tr.athing.submission > td, tr.athing.submission + tr > td { background: var(--pt-card); }
tr.athing.submission > td { padding-top: 14px; }
tr.athing.submission + tr > td { padding-bottom: 14px; }
tr.athing.submission > td:first-child { border-top-left-radius: 16px; padding-left: 14px; }
tr.athing.submission > td:last-child { border-top-right-radius: 16px; padding-right: 18px; }
tr.athing.submission + tr > td:first-child { border-bottom-left-radius: 16px; }
tr.athing.submission + tr > td:last-child { border-bottom-right-radius: 16px; padding-right: 18px; }
tr.spacer { height: 12px !important; }

.rank { color: var(--pt-text-3) !important; font-size: 13px !important; font-variant-numeric: tabular-nums; }
.titleline { font-size: 17px !important; line-height: 1.35; }
.titleline > a { color: var(--pt-text) !important; font-weight: 600; letter-spacing: -0.01em; }
.titleline > a:visited { color: var(--pt-text-3) !important; }
.titleline > a:hover { color: var(--pt-orange) !important; text-decoration: none; }
.sitebit.comhead { font-size: 12px !important; color: transparent !important; margin-left: 6px; }
.sitebit a { text-decoration: none !important; }
.sitestr {
  color: var(--pt-text-3) !important;
  background: var(--pt-chip);
  padding: 2px 8px;
  border-radius: 999px;
  white-space: nowrap;
}
.subtext, .subline { font-size: 13px !important; color: var(--pt-text-3) !important; }
.subtext a, .subline a { color: var(--pt-text-3) !important; }
.subtext a:hover, .subline a:hover { color: var(--pt-orange) !important; text-decoration: none; }
.score { color: var(--pt-orange) !important; font-weight: 600; }
.votearrow { opacity: 0.55; }
.morelink {
  display: inline-block;
  margin: 8px 0 0 14px;
  padding: 8px 18px;
  border-radius: 999px;
  background: var(--pt-card);
  box-shadow: var(--pt-shadow);
  color: var(--pt-link) !important;
  font-size: 14px;
  font-weight: 500;
}

/* Thread page: the story on top, then each comment as its own card; HN's indent spacer keeps the nesting. */
table.fatitem {
  width: 100%;
  background: var(--pt-card);
  border-radius: 18px;
  padding: 10px 14px 14px;
  box-shadow: var(--pt-shadow);
}
table.fatitem tr.athing.submission > td, table.fatitem tr.athing.submission + tr > td { background: transparent; }
table.fatitem .toptext { color: var(--pt-text-2); font-size: 15px; line-height: 1.6; }
table.comment-tree { border-collapse: separate; border-spacing: 0 10px; }
tr.comtr > td > table { width: 100%; }
tr.comtr td.default {
  background: var(--pt-card);
  border-radius: 14px;
  padding: 12px 16px 14px !important;
  box-shadow: var(--pt-shadow);
}
.comhead { font-size: 12.5px !important; color: var(--pt-text-3) !important; }
.comhead a { color: var(--pt-text-3) !important; }
.hnuser { color: var(--pt-text) !important; font-weight: 600; }
.commtext, .comment { font-size: 15px !important; line-height: 1.6 !important; color: var(--pt-text) !important; }
.commtext a { color: var(--pt-link) !important; }
.commtext.cdd, .commtext.c5a, .commtext.c73, .commtext.c82, .commtext.c88, .commtext.c9c, .commtext.cae, .commtext.cbe, .commtext.cce { color: var(--pt-text-3) !important; }
.comment pre {
  background: var(--pt-chip);
  border-radius: 10px;
  padding: 10px 12px;
  overflow-x: auto;
}
.comment code { font-family: var(--pt-mono) !important; font-size: 13px; }
.reply a { color: var(--pt-text-3) !important; font-size: 12.5px; }
textarea {
  background: var(--pt-card);
  color: var(--pt-text);
  border: 1px solid var(--pt-line);
  border-radius: 12px;
  padding: 10px 12px;
}

/* Footer. */
.yclinks a { color: var(--pt-text-3) !important; }
input[type="submit"] {
  appearance: none;
  border: 0;
  border-radius: 999px;
  padding: 7px 18px;
  background: var(--pt-link);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}
input[type="submit"]:hover { filter: brightness(1.08); }
`,
};
