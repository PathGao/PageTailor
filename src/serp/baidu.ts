import { gutter, type SerpSite } from "./site";

/** Matches nothing: for roles a site does not have. */
const NONE = ":not(*)";

// Verified 2026-10-14 on saved result pages (programming, product, weather, travel queries). Results carry tpl and
// data-module attributes (title, abstract, source, cover_img_N); class names with a _xxxxx suffix are hashed and avoided.
export const baidu: SerpSite = {
  matches: ["https://www.baidu.com/s*"],
  // The news tab shares /s; only the default web results are a plain list.
  exclude: "[?&]tn=news",

  page: "body",
  // Baidu has no dark mode of its own.
  dark: NONE,
  area: "#container",
  main: "#content_left",
  sidebar: "#content_right",
  entity: NONE,
  notices: NONE,
  below: "#page",
  // The search box is two halves (input and button) joined at the seam; reshaping one breaks the join.
  searchBox: NONE,
  searchBoxInner: NONE,
  searchInput: NONE,
  // Baidu floats the result column (608px) left and the sidebar (348px) right inside a 1076px container indented
  // 150px. Keep the floats; let the container fill the window up to the content maximum and the result column take
  // what the sidebar leaves.
  frameCss: (A) => `
  ${A} {
    width: auto !important;
    margin-left: ${gutter("clamp(24px, 6vw, 150px)")} !important;
    margin-right: ${gutter("48px")} !important;
    /* Baidu pads the container 150px on wide windows; the gutters above replace that. */
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
  ${A} > #content_left { width: calc(100% - 348px - 40px) !important; }
  ${A}:not(:has(> #content_right > *)) > #content_left { width: 100% !important; }`,
  topModuleCell: () => null,
  // Baidu's AI answer is an item of the result list.
  aiOverview: '[tpl="new_baikan_index"]',

  list: "#content_left",
  result: ".c-container[tpl]",
  // Baidu marks organic results .result and its own modules (baike, wenku, notes, video) .result-op.
  feature: ".result-op",
  titleLink: "h3 a",
  titleText: "h3",
  hasTitle: "h3 a",
  source: '[data-module="source"]',
  header: "div:has(> h3)",
  block: '[data-module]:not([data-module="title"])',
  snippet: '[data-module="abstract"] > div',
  extra: NONE,
  thumb: '[data-module^="cover_img"]',
  thumbImage: '[data-module^="cover_img"] .cos-image',
  resultLabel: NONE,
  noise: NONE,
  sitelinkRow: NONE,
};
