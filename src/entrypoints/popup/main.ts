import { presets } from "@/presets";
import { isEnabled, ruleMatches } from "@/rules";
import { load, loadHealth, setEnabled } from "@/storage";

const list = document.getElementById("list")!;
const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
const here = presets.filter((p) => tab?.url && ruleMatches(p, tab.url));
const { enabled } = await load();
const health = await loadHealth();

if (here.length === 0) {
  list.innerHTML = "<p>当前网页没有可用的预设。</p>";
}
for (const p of here) {
  const label = document.createElement("label");
  const box = document.createElement("input");
  box.type = "checkbox";
  box.setAttribute("role", "switch");
  box.checked = isEnabled(p, enabled);
  box.onchange = () => setEnabled(p.id, box.checked);
  const name = document.createElement("span");
  name.textContent = p.name;
  label.append(name, box);
  list.append(label);
}

// The last check of each site's adapter on this device (see serp/health.ts): counts only, no URLs or page text.
for (const site of new Set(here.map((p) => p.site?.id).filter((id): id is string => !!id))) {
  const h = health[site];
  if (!h?.problems.length) continue;
  const warn = document.createElement("div");
  warn.className = "warn";
  const text = document.createElement("p");
  text.textContent = `这个网站可能改版了，预设没有完全生效：${h.problems.join("，")}。`;
  const copy = document.createElement("button");
  copy.textContent = "复制诊断信息";
  copy.onclick = async () => {
    const report = { site, version: browser.runtime.getManifest().version, checkedAt: new Date(h.at).toISOString(), problems: h.problems };
    await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    copy.textContent = "已复制";
  };
  warn.append(text, copy);
  list.after(warn);
}
