import { gutter, type SerpSite } from "./site";

// Verified 2026-10-13/14 on 30 saved result pages (22 kinds: weather, flights, news, shopping, entity, local, sitelinks,
// Chinese, Japanese, Arabic, dark…) at 1100–2560px. Hashed class names are avoided; ids (#rcnt, #rso…), data-*
// attributes and the old tr.mslg sitelink table have outlived several redesigns.
// Page gutters around the results; they widen to centre the content past its maximum width.
const L = gutter("clamp(24px, 6vw, 260px)");
const R = gutter("48px");

export const google: SerpSite = {
  matches: [
    "https://www.google.com/search*",
    "https://www.google.com.hk/search*",
    "https://www.google.com.tw/search*",
    "https://www.google.co.jp/search*",
  ],
  // Images, news, videos and shopping tabs share /search; only "All" (no udm) and "Web" (udm=14) are plain result lists.
  exclude: "[?&](tbm=|udm=(?!14(?:&|#|$)))",

  page: "body.srp",
  // Google can be set to light on a dark OS; its dark pages carry this meta, so follow it rather than the OS.
  dark: 'html:has(meta[name="color-scheme"][content^="dark"])',
  area: "#rcnt",
  main: "#center_col",
  sidebar: "#rhs",
  entity: ".kp-wholepage",
  notices: "#taw",
  below: "#botstuff",
  searchBox: 'form[role="search"] div:has(> div > div > textarea[name="q"])',
  searchBoxInner: 'form[role="search"] div:has(> div > textarea[name="q"])',
  searchInput: 'textarea[name="q"]',
  frameCss: (A) => `
  ${A} {
    grid-template-columns: ${L} minmax(0, 1fr) 0 ${R} !important;
    column-gap: 0 !important;
  }
  /* The knowledge panel has no intrinsic width; Google sizes it to 372px itself. */
  ${A}:has(> #rhs) {
    grid-template-columns: ${L} minmax(0, 1fr) 372px ${R} !important;
  }
  ${A} > #center_col {
    grid-column: 2 / 3 !important;
    width: auto !important;
    max-width: none !important;
    padding-right: 40px;
  }
  ${A} > #rhs { grid-column: 3 / 4 !important; margin: 0 !important; }
  /* Modules above the results (AI overview, stock chart, map) sit in their own copy of Google's grid;
     top.ts tags that grid and its cell. */
  ${A} [data-pt-top-grid] {
    grid-template-columns: ${L} minmax(0, 1fr) ${R} !important;
    column-gap: 0 !important;
  }
  ${A} [data-pt-top-cell] {
    grid-column: 2 / 3 !important;
    width: auto !important;
    max-width: none !important;
    padding-right: 40px;
  }
  /* With a knowledge panel, modules span above it too and end on its right edge (the 40px is the results-panel gap). */
  ${A}:has(> #rhs) [data-pt-top-cell] { padding-right: 0; }
  /* The AI overview's text is capped at 764px and its 260px source column is pinned right, so a full-width card
     opens an empty stretch between them. Size the card to its content, 764 + 260 (its padding comes on top). */
  ${A} [data-pt-ai] > [data-pt-top-card] { max-width: 1024px; }
  /* Results beside the AI overview (beside.ts): the main column splits into the overview's width and the rest. The
     overview stays in place (moving it breaks "Show more"); only its columns change. */
  ${A}:has(> [data-pt-beside]) {
    grid-template-columns: ${L} var(--pt-ai-w) minmax(0, 1fr) 0 ${R} !important;
  }
  ${A}:has(> [data-pt-beside]):has(> #rhs) {
    grid-template-columns: ${L} var(--pt-ai-w) minmax(0, 1fr) 372px ${R} !important;
  }
  ${A}:has(> [data-pt-beside]) > #center_col { grid-column: 2 / 4 !important; }
  ${A}:has(> [data-pt-beside]) > #rhs { grid-column: 4 / 5 !important; }
  ${A}:has(> [data-pt-beside]) > [data-pt-top]:has([data-pt-ai]) { grid-column: 1 / 3 !important; }
  ${A}:has(> [data-pt-beside]) > [data-pt-top]:has([data-pt-ai]) [data-pt-top-grid] {
    grid-template-columns: ${L} minmax(0, 1fr) 0 !important;
  }
  ${A}:has(> [data-pt-beside]) [data-pt-ai] { padding-right: 0 !important; }
  /* Google's empty 16px bar above the overview would drop its card below the cards beside it. Hidden by CSS only. */
  ${A}:has(> [data-pt-beside]) > [data-pt-top]:has([data-pt-ai]) > :not(:has([data-pt-top-card])) { display: none !important; }
  ${A}:has(> [data-pt-beside]) [data-pt-ai] > [data-pt-top-card] { max-width: none; }
  ${A} > [data-pt-beside] { grid-column: 3 / 4; padding-right: 40px; }`,
  topModuleCell: googleGridCell,
  aiOverview: "[data-lhcontainer]",

  list: "#rso",
  result: "[data-rpos]",
  feature: ":not(*)",
  titleLink: "a:has(h3)",
  titleText: "h3",
  hasTitle: "a h3",
  source: "cite",
  // Google marks a result's header [data-snhf] and its content blocks [data-sncf]: the block right after the header
  // is the snippet, a block with an image is the thumbnail, the rest are extras (price, rating, answer count).
  header: "[data-snhf]",
  block: "[data-sncf]",
  snippet: "[data-snhf] + [data-sncf]:not(:has(img)) > div",
  extra: "[data-snhf] + [data-sncf] ~ [data-sncf]:not(:has(img)) > div",
  thumb: "[data-sncf]:has(img):not(:has(em))",
  thumbImage: "a:not(:has(h3)) div:has(> img)",
  resultLabel: "h2:first-child",
  noise: "span:has(> a > h3) ~ div a",
  sitelinkRow: "tr.mslg",
};

/**
 * Modules above the results are children of #rcnt, each in its own copy of Google's grid with the content in a cell
 * placed from column 2. The grid's depth varies, and a block can hold several such grids (a 16px bar above the AI
 * overview), so search a few levels breadth-first and take the tallest cell.
 */
function googleGridCell(block: HTMLElement): HTMLElement | null {
  let best: HTMLElement | null = null;
  let level: Element[] = [block];
  for (let depth = 0; depth < 6 && level.length; depth++) {
    const next: Element[] = [];
    for (const el of level) {
      if (getComputedStyle(el).display === "grid") {
        for (const c of el.children as HTMLCollectionOf<HTMLElement>) {
          if (getComputedStyle(c).gridColumnStart === "2" && c.offsetHeight > (best?.offsetHeight ?? 8)) best = c;
        }
      }
      next.push(...el.children);
    }
    level = next;
  }
  return best;
}
