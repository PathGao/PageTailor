import { presets } from "@/presets";
import { cssForUrl, isEnabled, ruleMatches } from "@/rules";
import { watchHealth } from "@/serp/health";
import { load, saveHealth } from "@/storage";

export default defineContentScript({
  matches: [...new Set(presets.flatMap((p) => p.matches))],
  runAt: "document_start",
  main() {
    const style = document.createElement("style");
    style.id = "pagetailor";
    const running = new Map<string, () => void>();
    // One adapter check per site, whichever of its presets are on.
    const checking = new Map<string, () => void>();
    let generation = 0;

    async function render() {
      const mine = ++generation;
      const { enabled, userRules } = await load();
      // A newer render started while we awaited storage; its read is fresher.
      if (mine !== generation) return;
      style.textContent = cssForUrl(location.href, [...presets, ...userRules], enabled);
      if (!style.isConnected) document.documentElement.append(style);

      const sites = new Map(presets.filter((p) => p.site && isEnabled(p, enabled) && ruleMatches(p, location.href)).map((p) => [p.site!.id, p.site!.serp]));
      for (const [id, serp] of sites) if (!checking.has(id)) checking.set(id, watchHealth(id, serp, saveHealth));
      for (const [id, stop] of checking) {
        if (!sites.has(id)) {
          stop();
          checking.delete(id);
        }
      }

      for (const p of presets) {
        if (!p.enhance) continue;
        const on = isEnabled(p, enabled) && ruleMatches(p, location.href);
        if (on && !running.has(p.id)) running.set(p.id, p.enhance());
        if (!on && running.has(p.id)) {
          running.get(p.id)!();
          running.delete(p.id);
        }
      }
    }

    render();
    browser.storage.onChanged.addListener((_, area) => area === "local" && render());
    // Google switches tabs and Gemini switches chats without a page load.
    (window as any).navigation?.addEventListener("navigatesuccess", render);
  },
});
