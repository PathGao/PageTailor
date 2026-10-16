import type { EnabledMap, StyleRule } from "./rules";
import type { Health } from "./serp/health";

export type Stored = { enabled: EnabledMap; userRules: StyleRule[] };

// storage.local, not the page's localStorage: the site's own scripts can read the latter.
export async function load(): Promise<Stored> {
  const got = (await browser.storage.local.get(["enabled", "userRules"])) as Partial<Stored>;
  return { enabled: got.enabled ?? {}, userRules: got.userRules ?? [] };
}

export async function setEnabled(id: string, on: boolean): Promise<void> {
  const { enabled } = await load();
  await browser.storage.local.set({ enabled: { ...enabled, [id]: on } });
}

/** Last adapter check per site (see serp/health.ts). Kept on this device only. */
export async function loadHealth(): Promise<Record<string, Health>> {
  return ((await browser.storage.local.get("health")).health as Record<string, Health>) ?? {};
}

export async function saveHealth(h: Health): Promise<void> {
  await browser.storage.local.set({ health: { ...(await loadHealth()), [h.site]: h } });
}
