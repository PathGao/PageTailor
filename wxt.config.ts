import { defineConfig } from "wxt";
import { presets } from "./src/presets";

export default defineConfig({
  srcDir: "src",
  manifest: {
    name: "PageTailor",
    description: "按你的习惯改网页样式：宽屏多列、对话加宽，按网址保存。",
    permissions: ["storage"],
    host_permissions: [...new Set(presets.flatMap((p) => p.matches))],
  },
});
