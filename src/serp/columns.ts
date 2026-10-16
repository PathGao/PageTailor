import type { SerpSite } from "./site";

/** The column layout: results in a regular grid filling the window. Pairs with grid.ts and top.ts. */
export function columnsCss(s: SerpSite): string {
  // Wide screens only, and only on plain result lists: pages the site composes itself (entity pages) keep its layout.
  const A = `${s.area}:not(:has(${s.entity}))`;
  return `
/* Wide screens only, and only on plain result lists: entity pages keep the site's layout. */
@media (min-width: 1224px) {${s.frameCss(A)}
  /* The result list, tagged by grid.ts once it holds results. */
  ${A} [data-pt-list] {
    display: grid !important;
    grid-template-columns: repeat(auto-fill, minmax(var(--pt-col, 380px), 1fr));
    --pt-row-gap: var(--pt-gap, 8px);
    gap: var(--pt-row-gap) var(--pt-gap, 40px);
    /* Cards in a row share a height; grid.ts widens the cards of a short last row so no row has holes. */
    align-items: stretch;
  }
  /* Sites leave invisible slots (style tags, empty ad containers) between results; real blocks always hold a link or media. */
  ${A} [data-pt-item]:not(:has(a, img, video, button)) { display: none !important; }
  /* Anything that is not a plain result (AI overview, videos, people also ask) spans the full row. */
  ${A} [data-pt-item]:not(:has(${s.hasTitle})),
  ${A} [data-pt-item]:is(${s.feature}),
  ${A} [data-pt-item]:has(> ${s.feature}) { grid-column: 1 / -1; }
  /* Sites may fix a result's width to their own column (Baidu: 608px); in the grid it takes its cell. */
  ${A} [data-pt-item] { min-width: 0; margin: 0 !important; width: auto !important; max-width: none !important; }
  /* The grid drops the site's per-result margins, which also spaced the last result from what follows. */
  ${A} ${s.below} { margin-top: 36px !important; }
  /* Sites cap a result's content at their own column width; a card widened past that would keep its content in a corner. */
  ${s.list} [data-pt-item] ${s.result} > div { max-width: none !important; }
  /* A full-row result's sitelinks flow into columns instead of full-width rows. */
  ${s.list} [data-pt-wide] table:has(${s.sitelinkRow}) { width: 100% !important; }
  ${s.list} [data-pt-wide] tbody:has(> ${s.sitelinkRow}) { display: grid !important; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); column-gap: 32px; }
  ${s.list} [data-pt-wide] ${s.sitelinkRow} { display: block; min-width: 0; }
  /* Widgets wider than a column (flights, calculator, maps), and cards much taller than the rest; grid.ts measures them. */
  ${A} [data-pt-wide] { grid-column: 1 / -1; }
  /* Results moved up beside the AI overview (beside.ts): a small grid with the result columns' width and gaps. */
  ${A} > [data-pt-beside] {
    display: grid;
    grid-template-columns: repeat(var(--pt-side-cols, 1), minmax(0, 1fr));
    gap: var(--pt-gap, 8px) var(--pt-beside-gap, 40px);
    align-content: start;
    align-items: stretch;
    padding-left: var(--pt-beside-gap, 40px);
    min-width: 0;
  }
  /* Wrappers that only group results drop out of layout so their results are grid items too. */
  ${s.area} [data-pt-flat] { display: contents !important; }
  /* Media too wide for a narrow card goes under the text (grid.ts decides). */
  ${s.list} [data-pt-stack] { display: flex !important; flex-direction: column !important; align-items: stretch !important; gap: 10px; }
  ${s.list} [data-pt-stack] > * { width: auto !important; max-width: 100% !important; grid-area: auto !important; margin-left: 0 !important; padding-left: 0 !important; }
}
`;
}
