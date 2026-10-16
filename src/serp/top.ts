import type { SerpSite } from "./site";

/**
 * Tags the modules a site puts above the results (AI overview, stock chart, local map, image strip) so CSS can align
 * them with the results and style them as cards. They are children of the results area other than the main column
 * and the sidebar; the site adapter finds each one's content cell. An AI overview inside the result list is tagged
 * as a card only, since the list's grid already places it. Idempotent.
 */
export function tagTopModules(s: SerpSite): () => void {
  const tag = () => {
    const area = document.querySelector<HTMLElement>(s.area);
    if (!area) return;
    for (const block of area.children as HTMLCollectionOf<HTMLElement>) {
      if (block.matches(`${s.main}, ${s.sidebar}, [data-pt-top]`)) continue;
      const cell = s.topModuleCell(block);
      if (!cell) continue;
      block.dataset.ptTop = "";
      cell.parentElement!.dataset.ptTopGrid = "";
      cell.dataset.ptTopCell = "";
      if (cell.querySelector(s.aiOverview)) cell.dataset.ptAi = "";
      (cell.firstElementChild as HTMLElement | null)?.setAttribute("data-pt-top-card", "");
    }
    for (const ai of document.querySelectorAll<HTMLElement>(`${s.list} ${s.aiOverview}`)) {
      ai.closest<HTMLElement>(`[data-pt-item], ${s.list} > div`)?.setAttribute("data-pt-ai-card", "");
    }
  };
  // Without the column layout the AI overview is capped at the result column's width, which depends on the window
  // and on whether a knowledge panel sits beside it; CSS reads it from this variable.
  const widths = new ResizeObserver(([entry]) => {
    document.documentElement.style.setProperty("--pt-results-width", `${Math.round(entry!.contentRect.width)}px`);
  });
  const run = () => {
    tag();
    const col = document.querySelector<HTMLElement>(s.main);
    if (col && !col.hasAttribute("data-pt-measured")) {
      col.dataset.ptMeasured = "";
      widths.observe(col);
    }
  };
  const obs = new MutationObserver(run);
  obs.observe(document.documentElement, { childList: true, subtree: true });
  run();
  return () => {
    obs.disconnect();
    widths.disconnect();
    document.querySelector(s.main)?.removeAttribute("data-pt-measured");
  };
}
