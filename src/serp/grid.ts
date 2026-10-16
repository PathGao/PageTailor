import { resultsBesideAi } from "./beside";
import type { SerpSite } from "./site";

// The site's result list holds results grouped in wrapper divs, nested to varying depth and sometimes side by side
// (Google's weather, flights, news pages); wrappers get display: contents so every result is an item of one grid.
// A result item is a result element or its direct parent; a wrapper holds results deeper down.

/**
 * A regular grid: rows of equal-height cards in reading order. Each run of cards between full-row blocks ends with a
 * full row: when the last row is short, its cards widen to fill it, so no gap is left at the end of a run or page.
 * Runs on mutations and window resizes (not ResizeObserver, which waits for rendering that Chrome skips in background
 * tabs), and only reads computed styles, so it also works before the page is first shown.
 */
export function regularGrid(s: SerpSite): () => void {
  let queued = false;
  const beside = resultsBesideAi(s);
  const layout = () => {
    queued = false;
    const list = document.querySelector<HTMLElement>(s.list);
    if (!list?.querySelector(s.result)) return;
    list.dataset.ptList = "";
    const items = gridItems(list, s);
    for (const item of items) {
      if (!item.hasAttribute("data-pt-seen")) {
        item.dataset.ptSeen = "";
        stackWideMedia(item, s);
      }
      // A widget wider than a column (flights, calculator, maps) would be cut off: give it the full row, for good,
      // since at full width it no longer overflows and flipping back would oscillate.
      const card = item.querySelector<HTMLElement>(s.result) ?? item;
      if (!item.hasAttribute("data-pt-wide") && card.scrollWidth > card.clientWidth + 4) item.dataset.ptWide = "";
    }
    promoteTallCards(items, s);
    fillLastRows(list, beside.layout(list, items, (e) => contentHeight(e, s)), s);
  };
  const queue = () => {
    if (!queued) {
      queued = true;
      queueMicrotask(layout);
    }
  };
  const obs = new MutationObserver(queue);
  obs.observe(document.documentElement, { childList: true, subtree: true });
  addEventListener("resize", queue);
  layout();
  return () => {
    obs.disconnect();
    removeEventListener("resize", queue);
    beside.restore();
    document.querySelectorAll<HTMLElement>("[data-pt-fill]").forEach((e) => {
      e.style.removeProperty("grid-column");
      e.removeAttribute("data-pt-fill");
    });
    for (const tag of ["data-pt-list", "data-pt-flat", "data-pt-item", "data-pt-wide", "data-pt-seen", "data-pt-stack"]) {
      document.querySelectorAll(`[${tag}]`).forEach((e) => e.removeAttribute(tag));
    }
  };
}

/** How tall a card's content is, regardless of how far the row stretched it. */
function contentHeight(item: HTMLElement, s: SerpSite): number {
  const card = item.querySelector<HTMLElement>(s.result) ?? item;
  const top = card.getBoundingClientRect().top;
  const bottom = Math.max(top, ...[...card.children].map((c) => c.getBoundingClientRect().bottom));
  return bottom - top + parseFloat(getComputedStyle(card).paddingBottom);
}

/**
 * A card much taller than its neighbours (a homepage result with six sitelinks) would stretch its whole row and leave
 * holes in the other cards. Give it a row of its own: at least 1.6x the median card and 150px taller. Sticky, like
 * the wide widgets, so the median shifting afterwards cannot flip it back.
 */
function promoteTallCards(items: HTMLElement[], s: SerpSite) {
  const cards = items.filter((i) => !i.hasAttribute("data-pt-wide") && i.querySelector(s.hasTitle) && getComputedStyle(i).display !== "none");
  if (cards.length < 3) return;
  const heights = cards.map((c) => contentHeight(c, s));
  const median = [...heights].sort((a, b) => a - b)[Math.floor(heights.length / 2)]!;
  cards.forEach((c, i) => {
    if (heights[i]! > median * 1.6 && heights[i]! - median > 150) c.dataset.ptWide = "";
  });
}

/**
 * Cards fill the grid in order; full-row blocks (and hidden placeholders) split them into runs. When a run would end
 * on a short row, some cards widen to close the gap. The widened cards are the ones that gain most from the room
 * (richest content, see richness), not merely the last ones; Google's rank only breaks ties, since rank measures
 * relevance and is open to SEO. Site preferences will take over this choice (ROADMAP).
 */
function fillLastRows(list: HTMLElement, items: HTMLElement[], s: SerpSite) {
  for (const e of list.querySelectorAll<HTMLElement>("[data-pt-fill]")) {
    e.style.removeProperty("grid-column");
    e.removeAttribute("data-pt-fill");
  }
  const cols = getComputedStyle(list).gridTemplateColumns.split(" ").filter(Boolean).length;
  if (getComputedStyle(list).display !== "grid" || cols < 2) return;
  const fullRow = (e: HTMLElement) => {
    const st = getComputedStyle(e);
    return st.gridColumnStart === "1" && st.gridColumnEnd === "-1";
  };
  const shown = items.filter((e) => getComputedStyle(e).display !== "none");
  const widenRun = (run: HTMLElement[], width: number) => {
    const spans = widen(run.map((e) => richness(e, s)), width);
    run.forEach((e, i) => {
      if (spans[i]! > 1) {
        e.style.gridColumn = `span ${spans[i]}`;
        e.dataset.ptFill = "";
      }
    });
  };
  let run: HTMLElement[] = [];
  for (let i = 0; i < shown.length; i++) {
    const item = shown[i]!;
    if (fullRow(item)) {
      widenRun(run, cols);
      run = [];
    } else run.push(item);
  }
  widenRun(run, cols);
}

/** How much a card has to show beyond title and snippet: a thumbnail counts 2, each extra block (price, rating, answers) 1. */
function richness(item: HTMLElement, s: SerpSite): number {
  const card = item.querySelector(s.result) ?? item;
  const title = card.querySelector(s.titleLink);
  const thumb = [...card.querySelectorAll<HTMLElement>("img")].some((i) => !title?.contains(i) && i.offsetWidth > 40);
  return (thumb ? 2 : 0) + Math.max(0, card.querySelectorAll(s.block).length - 1);
}

/**
 * Column spans for a run of cards so the run fills whole rows with no holes. Cards are placed in order; a span that
 * does not fit in what is left of a row would leave a hole, so such layouts are rejected. Extra columns go to the
 * richest cards first (earlier rank on ties); runs are short (≤ ~12 cards, ≤ cols-1 extra columns), so the search is
 * exhaustive over that order. Falls back to widening the last cards, which always fits.
 */
export function widen(scores: number[], cols: number): number[] {
  const n = scores.length;
  const spans = scores.map(() => 1);
  const extra = (cols - (n % cols)) % cols;
  if (!extra) return spans;
  const fits = (sp: number[]) => {
    let c = 0;
    for (const s of sp) {
      if (c + s > cols) return false;
      c = (c + s) % cols;
    }
    return c === 0;
  };
  const order = scores.map((_, i) => i).sort((a, b) => scores[b]! - scores[a]! || a - b);
  const search = (left: number, from: number): boolean => {
    if (left === 0) return fits(spans);
    for (let k = from; k < order.length; k++) {
      const i = order[k]!;
      for (let add = Math.min(left, cols - 1); add >= 1; add--) {
        spans[i]! += add;
        if (search(left - add, k + 1)) return true;
        spans[i]! -= add;
      }
    }
    return false;
  };
  if (search(extra, 0)) return spans;
  // Always valid: the last r cards share the row.
  const r = n % cols;
  spans.fill(1);
  for (let j = 0; j < r; j++) spans[n - r + j] = Math.floor(cols / r) + (j < cols % r ? 1 : 0);
  return spans;
}

/** The list's grid items, looking through (and tagging) wrapper divs that only group results. */
function gridItems(parent: HTMLElement, s: SerpSite, out: HTMLElement[] = []): HTMLElement[] {
  for (const child of parent.children as HTMLCollectionOf<HTMLElement>) {
    const isWrapper = child.tagName === "DIV" && !child.matches(`${s.result}, :has(> ${s.result})`) && child.querySelector(s.result);
    if (isWrapper) {
      child.dataset.ptFlat = "";
      gridItems(child, s, out);
    } else {
      child.dataset.ptItem = "";
      out.push(child);
    }
  }
  return out;
}

/**
 * Google lays a result's text and media side by side, sized for its 650px column. In a narrow card a wide media
 * block (a collage of video frames) squeezes the text into a sliver; then put the media under the text instead.
 * Small single thumbnails (~25% of the card) keep Google's layout.
 */
function stackWideMedia(item: HTMLElement, s: SerpSite) {
  const card = item.querySelector<HTMLElement>(s.result);
  const title = card?.querySelector(s.titleLink);
  if (!card || !title) return;
  const media = [...card.querySelectorAll<HTMLElement>("img")].filter((i) => !title.contains(i) && i.offsetWidth > 40);
  if (media.length === 0) return;
  // The row holding text and media: nearest ancestor of the first media that also holds the snippet text.
  let row = media[0]!.parentElement;
  while (row && row !== card && !row.querySelector(":scope em, :scope span:not(:has(*))")) row = row.parentElement;
  if (!row || row === card) return;
  const left = Math.min(...media.map((m) => m.getBoundingClientRect().left));
  const right = Math.max(...media.map((m) => m.getBoundingClientRect().right));
  if ((right - left) / card.getBoundingClientRect().width > 0.35) row.dataset.ptStack = "";
}
