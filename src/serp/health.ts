import type { SerpSite } from "./site";

/** Role counts on one results page. Counts only: no URLs, no text, so a report can be shared as is. */
export type RoleCounts = {
  /** Linked titles in the results area, outside the sidebar and the site's own modules (whose inner lists have many):
   * the page's own idea of how many results there are. */
  titledLinks: number;
  /** Organic results the adapter found (results with a linked title, not site modules). */
  results: number;
  withSnippet: number;
  withSource: number;
};

export type Health = { site: string; at: number; problems: string[] };

/**
 * When the adapter no longer matches the site. The list or results missing while the page clearly has results means
 * the layout is off; snippets or sources gone from most results means those slots are off. A page with fewer than
 * 3 linked titles (no results, an error page) says nothing either way.
 */
export function assess(c: RoleCounts): string[] {
  if (c.titledLinks < 3) return [];
  const p: string[] = [];
  if (c.results === 0) return [`结果 0/${c.titledLinks}`];
  if (c.results < c.titledLinks / 2) p.push(`结果 ${c.results}/${c.titledLinks}`);
  if (c.results >= 3) {
    if (c.withSnippet < c.results * 0.3) p.push(`摘要 ${c.withSnippet}/${c.results}`);
    if (c.withSource < c.results * 0.3) p.push(`来源 ${c.withSource}/${c.results}`);
  }
  return p;
}

export function countRoles(s: SerpSite): RoleCounts {
  const area = document.querySelector(s.area);
  const results = [...document.querySelectorAll(`${s.list} ${s.result}:has(${s.hasTitle})`)].filter((r) => !r.matches(s.feature));
  return {
    titledLinks: area ? [...area.querySelectorAll(s.hasTitle)].filter((t) => !t.closest(`${s.sidebar}, ${s.feature}`)).length : 0,
    results: results.length,
    withSnippet: results.filter((r) => r.querySelector(s.snippet)).length,
    withSource: results.filter((r) => r.querySelector(s.source)).length,
  };
}

/**
 * Checks the adapter against the page once results settle (no DOM changes for 1.5s) and again after later bursts
 * ("more results"). Calls report only when the outcome changes, so storage is not rewritten on every mutation.
 */
export function watchHealth(siteId: string, s: SerpSite, report: (h: Health) => void): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  // No outcome yet: the first check always reports, so a healthy page clears a warning stored by an earlier visit.
  let last: string | undefined;
  const check = () => {
    const problems = assess(countRoles(s));
    const key = problems.join("|");
    if (key === last) return;
    last = key;
    report({ site: siteId, at: Date.now(), problems });
  };
  const obs = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(check, 1500);
  });
  obs.observe(document.documentElement, { childList: true, subtree: true, attributes: true });
  timer = setTimeout(check, 1500);
  return () => {
    obs.disconnect();
    clearTimeout(timer);
  };
}
