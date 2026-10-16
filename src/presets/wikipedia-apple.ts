import type { Preset } from "./types";

// Verified 2026-10-13 at 1440px on the live English article "Tokyo Tower". Rules are scoped to .skin-vector-2022, so other skins are untouched.
export const wikipediaApple: Preset = {
  id: "wikipedia-apple",
  name: "维基百科苹果风外观",
  matches: ["https://*.wikipedia.org/wiki/*"],
  intent: "苹果风格：系统字体（标题用 SF Display 替代衬线体）、正文行距放宽、信息框和表格做成圆角卡片、图片圆角、搜索框和按钮做成胶囊形、顶部提示改成灰色提示条。颜色沿用维基百科自己的变量，保留它的深色模式。",
  source: "preset",
  css: `
/* Apple look for Wikipedia (Vector 2022). Colors come from Wikipedia's own Codex tokens, so its night mode keeps working. */
:root {
  --pt-font: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Hiragino Sans", "Helvetica Neue", sans-serif;
  --pt-font-display: -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Hiragino Sans", "Helvetica Neue", sans-serif;
  --pt-radius: 14px;
  --pt-shadow: 0 1px 2px rgb(0 0 0 / 0.05), 0 8px 24px rgb(0 0 0 / 0.07);
}
html.skin-theme-clientpref-night { --pt-shadow: 0 0 0 1px rgb(255 255 255 / 0.08); }
@media (prefers-color-scheme: dark) {
  html.skin-theme-clientpref-os { --pt-shadow: 0 0 0 1px rgb(255 255 255 / 0.08); }
}

body.skin-vector-2022 {
  font-family: var(--pt-font) !important;
  -webkit-font-smoothing: antialiased;
}
.skin-vector-2022 .mw-body-content { font-size: 1rem; }
.skin-vector-2022 .mw-parser-output p { line-height: 1.7; }

/* Headings: SF Display instead of Linux Libertine; no rule lines. */
.skin-vector-2022 :is(h1, h2, .mw-heading2 h2, .mw-heading1 h1, #firstHeading) {
  font-family: var(--pt-font-display) !important;
  font-weight: 700 !important;
  letter-spacing: -0.02em;
}
.skin-vector-2022 #firstHeading { font-size: 2.4em; }
.skin-vector-2022 :is(.mw-heading2, h2) { border-bottom: 0 !important; margin-top: 1.6em; }
.skin-vector-2022 :is(h3, h4, .mw-heading3 h3) { font-weight: 600 !important; }

/* Search: a pill. */
.skin-vector-2022 .cdx-text-input__input,
.skin-vector-2022 #searchInput {
  border-radius: 999px !important;
  padding-left: 36px !important;
  box-shadow: none !important;
}
.skin-vector-2022 .cdx-search-input--has-end-button .cdx-text-input__input { border-radius: 999px 0 0 999px !important; }
.skin-vector-2022 .cdx-search-input__end-button { border-radius: 0 999px 999px 0 !important; }

/* Infobox, figures and tables as soft rounded cards. */
.skin-vector-2022 .infobox {
  border: 0 !important;
  border-radius: 18px;
  padding: 10px !important;
  box-shadow: var(--pt-shadow);
  overflow: hidden;
  border-collapse: separate !important;
}
.skin-vector-2022 .infobox :is(th, td) { border: 0 !important; }
.skin-vector-2022 .infobox-above { font-family: var(--pt-font-display); font-weight: 700; font-size: 1.3em !important; }
.skin-vector-2022 .infobox img,
.skin-vector-2022 figure img,
.skin-vector-2022 .thumbinner img,
.skin-vector-2022 .gallerybox img { border-radius: 10px; }
.skin-vector-2022 figure[typeof~="mw:File/Thumb"],
.skin-vector-2022 figure[typeof~="mw:File/Frame"] {
  border: 0 !important;
  background: transparent !important;
  padding: 0 !important;
}
.skin-vector-2022 figure > figcaption { border: 0 !important; padding: 6px 2px 0 !important; color: var(--color-subtle, #54595d); font-size: 0.85em; }
.skin-vector-2022 .wikitable {
  border: 0 !important;
  border-radius: var(--pt-radius);
  overflow: hidden;
  border-collapse: separate !important;
  border-spacing: 0;
  box-shadow: var(--pt-shadow);
}
.skin-vector-2022 .wikitable > * > tr > :is(th, td) {
  border: 0 !important;
  border-bottom: 1px solid var(--border-color-subtle, #eaecf0) !important;
  padding: 8px 12px !important;
}
.skin-vector-2022 .wikitable > * > tr:last-child > :is(th, td) { border-bottom: 0 !important; }
.skin-vector-2022 .wikitable > * > tr > th { font-weight: 600; }

/* Notes like "redirects here": a quiet callout instead of italics. */
.skin-vector-2022 .hatnote {
  font-style: normal;
  background: var(--background-color-neutral-subtle, #f8f9fa);
  border-radius: 12px;
  padding: 8px 14px;
  margin-bottom: 1em;
  font-size: 0.9em;
}

/* Side panels and buttons. */
.skin-vector-2022 .vector-pinnable-header-toggle-button,
.skin-vector-2022 .cdx-button { border-radius: 999px !important; }
.skin-vector-2022 .vector-toc .vector-toc-list-item-active > .vector-toc-link { font-weight: 600; }
.skin-vector-2022 .navbox { border-radius: var(--pt-radius); overflow: hidden; }
`,
};
