import type { StyleRule } from "../rules";
import type { SerpSite } from "../serp/site";

/**
 * A rule shipped with the extension. `enhance` runs extension code (never model output) while the preset is active and
 * returns its cleanup. `site` names the adapter the preset is built on, so the page can check that adapter still fits.
 */
export type Preset = StyleRule & { enhance?: () => () => void; site?: { id: string; serp: SerpSite } };
