import type { SerpSite } from "./site";

/** Apple look for a search results page. --pt-accent is set per card from the site's favicon. */
export function appleCss(s: SerpSite): string {
  // Results live in the list, or in the box beside the AI overview (beside.ts).
  const L = `:is(${s.list}, [data-pt-beside])`;
  return `
/* Apple look for Google results. --pt-accent is set per card from the site's favicon. */
${s.page} {
  --pt-bg: #f5f5f7;
  --pt-card: #ffffff;
  --pt-text: #1d1d1f;
  --pt-text-2: #424245;
  --pt-text-3: #6e6e73;
  --pt-line: rgb(0 0 0 / 0.06);
  --pt-blue: #0071e3;
  --pt-shadow: 0 1px 2px rgb(0 0 0 / 0.04), 0 4px 14px rgb(0 0 0 / 0.04);
  --pt-shadow-hover: 0 2px 4px rgb(0 0 0 / 0.05), 0 10px 28px rgb(0 0 0 / 0.08);
  --pt-font: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Hiragino Sans", "Helvetica Neue", sans-serif;
  --pt-font-display: -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Hiragino Sans", "Helvetica Neue", sans-serif;
  --pt-gap: 14px;
  background: var(--pt-bg) !important;
}
/* Follow Google's own theme, not the OS: Google can be set to light on a dark OS. Its dark pages carry this meta. */
${s.dark} {
  ${s.page} {
    --pt-bg: #000000;
    --pt-card: #1c1c1e;
    --pt-text: #f5f5f7;
    --pt-text-2: #c7c7cc;
    --pt-text-3: #8e8e93;
    --pt-line: rgb(255 255 255 / 0.08);
    --pt-blue: #2997ff;
    --pt-shadow: 0 0 0 1px rgb(255 255 255 / 0.06);
    --pt-shadow-hover: 0 0 0 1px rgb(255 255 255 / 0.14);
  }
}

${s.page}, ${s.page} :is(input, textarea, button) { font-family: var(--pt-font) !important; }
${s.page} ${s.area} { -webkit-font-smoothing: antialiased; }

/* Search bar: a soft pill. */
${s.page} ${s.searchBox} {
  border-radius: 999px !important;
  border: 1px solid var(--pt-line) !important;
  background: var(--pt-card) !important;
  box-shadow: var(--pt-shadow) !important;
}
${s.page} ${s.searchBoxInner} { background: transparent !important; }
${s.page} ${s.searchInput} { color: var(--pt-text) !important; }

/* Without the column layout (narrow windows, entity and local pages) Google makes the AI overview wider than the
   results; cap it at the result column's width (measured by top.ts; Google's is 652px or less).
   The column layout lifts the cap on wide screens. Its grid can use different column widths from the results
   grid, so a column span would not line up. */
[data-pt-ai] { max-width: var(--pt-results-width, 652px) !important; }

/* Modules above the results: the same card as the results, so Google's own fills (and the AI overview's
   "show more" fade) blend in. */
[data-pt-top-card], [data-pt-ai-card] {
  background: var(--pt-card);
  border-radius: 16px;
  padding: 14px 20px 10px;
  box-shadow: var(--pt-shadow);
  margin-bottom: 4px;
  /* Google's fade under "Show more" is wider than the overview; keep it inside the card. */
  overflow: clip;
}
/* Google bleeds some AI overview parts ~20px left (follow-up box, source rows); keep them off the card edge. */
[data-pt-ai] > [data-pt-top-card], [data-pt-ai-card] { padding: 16px 40px 10px; }

/* Result cards: the same slots in the same places on every card (source, title, snippet, image), so a glance down a
   column reads like a table. Cards fill their grid cell, so a row's cards share a height. Blocks in the list that are not results
   (Google's own panels) get the same card, unless they are empty placeholders (only style tags and spans), so their white or grey fills never sit bare on the page. No overflow clip:
   carousels bleed ~16px on purpose and their arrows would be cut. */
${L} ${s.result},
${L} [data-pt-item]:not(:has(${s.result})):not([data-pt-ai-card]):has(a, img, video, button, h2, h3, [role="heading"]) {
  --pt-a: var(--pt-accent, var(--pt-blue));
  position: relative;
  background: var(--pt-card);
  border-radius: 14px;
  padding: 14px 16px 12px;
  box-shadow: var(--pt-shadow);
  transition: box-shadow 0.2s ease, transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
}
${L} ${s.result}:has(${s.hasTitle}) { cursor: pointer; }
${L} ${s.result}:has(${s.hasTitle}):hover { box-shadow: var(--pt-shadow-hover); transform: translateY(-1px); }
/* The site's own color, kept quiet: a faint wash from the top-left, behind the favicon. */
${L} ${s.result} {
  background:
    radial-gradient(140% 90px at 0 0, color-mix(in srgb, var(--pt-a) 9%, transparent), transparent),
    var(--pt-card);
}
${L} ${s.result} > div { margin: 0 !important; }
${L} ${s.result} ${s.resultLabel} { display: none; }

/* Type. */
${L} ${s.result} ${s.titleText} {
  font-family: var(--pt-font-display) !important;
  font-size: 17px !important;
  line-height: 1.3 !important;
  font-weight: 600 !important;
  letter-spacing: -0.01em;
  color: var(--pt-text) !important;
  margin-top: 4px !important;
}
${L} ${s.result}:hover ${s.titleText} { color: var(--pt-a) !important; }
${L} ${s.result} ${s.titleLink}, ${L} ${s.result} ${s.titleLink} :is(${s.titleText}, span) { text-decoration: none !important; }
${L} ${s.result} ${s.source} { color: var(--pt-text-3) !important; }
${L} ${s.result} ${s.titleLink} span { color: var(--pt-text); }
${L} ${s.result} em { color: var(--pt-text); font-style: normal; font-weight: 600; }
/* Fixed slots (the adapter says where header, snippet, extras and thumbnail are). Title 2 lines, snippet 3, each
   extra (price, rating, answer count, pros and cons) 1, so cards in a row end up the same height. */
${L} ${s.result} { height: 100%; box-sizing: border-box; }
${L} ${s.result} ${s.header} ${s.titleText},
${L} ${s.result} ${s.snippet},
${L} ${s.result} ${s.extra} {
  display: -webkit-box !important;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
${L} ${s.result} ${s.header} ${s.titleText} { -webkit-line-clamp: 2; }
${L} ${s.result} ${s.snippet} { -webkit-line-clamp: 3 !important; }
${L} ${s.result} ${s.extra} { -webkit-line-clamp: 1 !important; }
${L} ${s.result} :is(span, div):not(:has(*)) { cursor: text; }
/* The thumbnail slot stays on the right edge. In a card widened to fill a row, the site's grid would leave it
   mid-card, so pin it to the top right. Its column stays reserved in that grid, so text never reaches under it. */
${L} ${s.result} ${s.thumb} { justify-self: end; }
${L} [data-pt-fill] ${s.result} ${s.thumb} { position: absolute; top: 14px; right: 16px; }

/* Google's "translate this page" / "convert to simplified" links wrap into a narrow card header; Chrome's own translate covers it. */
${L} ${s.result} ${s.noise} { display: none !important; }

/* Thumbnails: rounded, native size (Google ships 92px images). */
${L} ${s.result} ${s.thumbImage} { border-radius: 12px !important; overflow: hidden; }

/* Cards end flush with the last result; keep the section below ("People also search for") apart. Spacing only. */
${s.below} { margin-top: 36px !important; }

/* Notices above the results (SafeSearch etc.) blend into the page; apple.ts marks their wide backgrounds. */
${s.notices} [data-pt-clear] { background: transparent !important; }

/* Links elsewhere on the page. */
${s.page} ${s.area} a:not(:has(${s.titleText})) { color: var(--pt-blue); }
`;
}

/** Scripts behind the Apple look; returns the cleanup. */
export function appleScripts(s: SerpSite): () => void {
  const stops = [paintSiteColors(s), clickableCards(s), clearTopBands(s)];
  return () => stops.forEach((stop) => stop());
}

/** Dominant saturated color of a favicon. Google inlines favicons as data: URIs, so reading pixels needs no network and the canvas is not tainted. */
function accentOf(img: HTMLImageElement): string | null {
  const c = document.createElement("canvas");
  c.width = c.height = 24;
  const g = c.getContext("2d", { willReadFrequently: true });
  if (!g) return null;
  let d: Uint8ClampedArray;
  try {
    g.drawImage(img, 0, 0, 24, 24);
    d = g.getImageData(0, 0, 24, 24).data;
  } catch {
    return null;
  }
  // Hue buckets of 30°, weighted by saturation; greys, near-white and near-black pixels are ignored.
  const buckets = new Map<number, { n: number; r: number; g: number; b: number }>();
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i]!, gg = d[i + 1]!, b = d[i + 2]!;
    if (d[i + 3]! < 128) continue;
    const max = Math.max(r, gg, b), min = Math.min(r, gg, b);
    const l = (max + min) / 510;
    const s = max === min ? 0 : (max - min) / (255 - Math.abs(max + min - 255));
    if (s < 0.3 || l > 0.9 || l < 0.12) continue;
    const h = max === r ? (gg - b) / (max - min) : max === gg ? 2 + (b - r) / (max - min) : 4 + (r - gg) / (max - min);
    const k = Math.round(((h * 60 + 360) % 360) / 30) % 12;
    const e = buckets.get(k) ?? { n: 0, r: 0, g: 0, b: 0 };
    e.n += s; e.r += r * s; e.g += gg * s; e.b += b * s;
    buckets.set(k, e);
  }
  let best: { n: number; r: number; g: number; b: number } | undefined;
  for (const e of buckets.values()) if (!best || e.n > best.n) best = e;
  // Fewer than ~6 colored pixels is an outline or anti-aliasing, not a brand color.
  if (!best || best.n < 6) return null;
  return `rgb(${Math.round(best.r / best.n)} ${Math.round(best.g / best.n)} ${Math.round(best.b / best.n)})`;
}

function paintSiteColors(s: SerpSite): () => void {
  const painted = new Set<HTMLElement>();
  const paint = (card: HTMLElement) => {
    if (painted.has(card)) return;
    const img = card.querySelector<HTMLImageElement>(`${s.titleLink} img`);
    if (!img) return;
    painted.add(card);
    const run = () => {
      const a = accentOf(img);
      if (a) card.style.setProperty("--pt-accent", a);
    };
    img.complete ? run() : img.addEventListener("load", run, { once: true });
  };
  const scan = () => document.querySelectorAll<HTMLElement>(`:is(${s.list}, [data-pt-beside]) ${s.result}`).forEach(paint);
  // Results stream in after document_start and again when "More results" loads.
  const obs = new MutationObserver(scan);
  obs.observe(document.documentElement, { childList: true, subtree: true });
  scan();
  return () => {
    obs.disconnect();
    painted.forEach((card) => card.style.removeProperty("--pt-accent"));
  };
}

/**
 * The whole card opens the result, but text stays selectable: a click that ends a text selection, or lands on
 * the card's own links and buttons, is left alone. Cmd/Ctrl-click and middle-click open a new tab.
 */
function clickableCards(s: SerpSite): () => void {
  const target = (e: MouseEvent) => {
    const el = e.target as Element | null;
    const card = el?.closest?.(`:is(${s.list}, [data-pt-beside]) ${s.result}`);
    if (!card || el!.closest(`a, button, input, textarea, [role=button], [role=link], [aria-haspopup], [jsaction*=click]:not(${s.result})`)) return null;
    if (window.getSelection()?.toString()) return null;
    return card.querySelector<HTMLAnchorElement>(s.titleLink);
  };
  const onClick = (e: MouseEvent) => {
    if (e.button !== 0 || e.defaultPrevented) return;
    const a = target(e);
    if (!a) return;
    if (e.metaKey || e.ctrlKey) window.open(a.href, "_blank", "noopener");
    else a.click();
  };
  const onAux = (e: MouseEvent) => {
    if (e.button !== 1) return;
    const a = target(e);
    if (a) window.open(a.href, "_blank", "noopener");
  };
  document.addEventListener("click", onClick);
  document.addEventListener("auxclick", onAux);
  return () => {
    document.removeEventListener("click", onClick);
    document.removeEventListener("auxclick", onAux);
  };
}

/**
 * The notices area above the results (SafeSearch, "did you mean", top ads). Google paints their full-width
 * containers with its own page color, which shows as a band on our page background. Mark those wide opaque
 * containers so CSS can make them transparent; small controls such as chips keep their fills.
 */
function clearTopBands(s: SerpSite): () => void {
  let queued = false;
  const scan = () => {
    queued = false;
    const taw = document.querySelector<HTMLElement>(s.notices);
    if (!taw) return;
    const width = taw.getBoundingClientRect().width;
    for (const el of taw.querySelectorAll<HTMLElement>(":is(div, a):not([data-pt-clear])")) {
      const bg = getComputedStyle(el).backgroundColor;
      const alpha = bg.startsWith("rgba") ? parseFloat(bg.split(",")[3]!) : bg.startsWith("rgb") ? 1 : 0;
      if (alpha > 0.9 && el.getBoundingClientRect().width > width * 0.6) el.dataset.ptClear = "";
    }
  };
  // Batched per frame: the page mutates hundreds of times while loading, and this reads layout.
  const obs = new MutationObserver(() => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(scan);
    }
  });
  obs.observe(document.documentElement, { childList: true, subtree: true });
  scan();
  return () => obs.disconnect();
}
