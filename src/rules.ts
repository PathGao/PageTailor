export type StyleRule = {
  id: string;
  name: string;
  /** Manifest match patterns, e.g. "https://www.google.com/search*". */
  matches: string[];
  /** Regex source tested against the full URL; a hit skips the rule. For query-string cases match patterns can't express. */
  exclude?: string;
  css: string;
  /** The user's original request; M3 regenerates the CSS from it when the site changes. */
  intent: string;
  source: "preset" | "user";
};

/** Rule id → enabled. Rules are on until the user turns them off. */
export type EnabledMap = Record<string, boolean>;

const patternCache = new Map<string, RegExp>();

function patternToRegExp(pattern: string): RegExp {
  let re = patternCache.get(pattern);
  if (!re) {
    const m = /^(\*|https?):\/\/([^/]+)(\/.*)$/.exec(pattern);
    if (!m) throw new Error(`Invalid match pattern: ${pattern}`);
    const [, scheme, host, path] = m as unknown as [string, string, string, string];
    const esc = (s: string) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
    const schemeRe = scheme === "*" ? "https?" : scheme;
    const hostRe = host === "*" ? "[^/]+" : host.startsWith("*.") ? `(?:[^/]+\\.)?${esc(host.slice(2))}` : esc(host);
    const pathRe = path.split("*").map(esc).join(".*");
    re = new RegExp(`^${schemeRe}://${hostRe}${pathRe}$`);
    patternCache.set(pattern, re);
  }
  return re;
}

export function ruleMatches(rule: StyleRule, url: string): boolean {
  if (rule.exclude && new RegExp(rule.exclude).test(url)) return false;
  return rule.matches.some((p) => patternToRegExp(p).test(url));
}

export function isEnabled(rule: StyleRule, enabled: EnabledMap): boolean {
  return enabled[rule.id] ?? true;
}

/** Presets first, user rules after, so a user's rule overrides a preset on the same page. */
export function cssForUrl(url: string, rules: StyleRule[], enabled: EnabledMap): string {
  return [...rules]
    .sort((a, b) => Number(a.source === "user") - Number(b.source === "user"))
    .filter((r) => isEnabled(r, enabled) && ruleMatches(r, url))
    .map((r) => `/* ${r.id} */\n${r.css}`)
    .join("\n");
}
