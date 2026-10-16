/**
 * What is where on a search results page. A site adapter answers this with selectors; styles (columns.ts, apple.ts)
 * and scripts (grid.ts, top.ts) are written against these roles only, so a site redesign means editing its adapter.
 * Selectors are used in CSS and in querySelector, so each must be a valid selector; inside :has() they must not use
 * :has() themselves (CSS forbids nesting it), which is why presence checks get their own roles (hasTitle).
 */
export type SerpSite = {
  matches: string[];
  /** Regex on the full URL; a hit means this page is not a plain results list (images tab etc.). */
  exclude?: string;

  /** Page frame. */
  page: string;
  /** Root selector present when the site itself is in dark mode. */
  dark: string;
  area: string;
  main: string;
  sidebar: string;
  /** Present on pages whose layout the site composes itself (entity pages); the column layout stays off there. */
  entity: string;
  notices: string;
  below: string;
  searchBox: string;
  searchBoxInner: string;
  searchInput: string;
  /** Site-specific CSS that frees the result column (and the modules above it) to the full width. */
  frameCss: (scope: string) => string;
  /** The content cell of a module above the results, or null. */
  topModuleCell: (block: HTMLElement) => HTMLElement | null;
  aiOverview: string;

  /** Results. */
  list: string;
  result: string;
  /** Results the site builds as its own modules (encyclopedia, video, notes); they get a full row, as their height
   * and inner layout do not fit a column. Google's have no linked title and get the row anyway. */
  feature: string;
  titleLink: string;
  titleText: string;
  /** Inside :has(): the result has a linked title. */
  hasTitle: string;
  source: string;
  header: string;
  /** Any content block of a result; counted for richness. */
  block: string;
  snippet: string;
  extra: string;
  thumb: string;
  thumbImage: string;
  /** Hidden in cards: the site's own label above each result. */
  resultLabel: string;
  /** Hidden in cards: links that wrap badly in a narrow card (translate this page). */
  noise: string;
  sitelinkRow: string;
};

/**
 * On wide screens the column layout stops growing and centres, so a row of results stays within one glance: past a
 * 1400px window (user's choice, 2026-10-16) the content keeps the width it has there, 1400 minus the 84 + 48px
 * gutters, and the gutters share the leftover. A gutter is its narrow-screen width or that share, whichever is wider.
 */
export const gutter = (narrow: string) => `max(${narrow}, (100vw - ${1400 - 84 - 48}px) / 2)`;
