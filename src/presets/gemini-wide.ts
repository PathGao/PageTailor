import type { StyleRule } from "../rules";

// Verified 2026-10-13 at 2560px. Gemini's Angular tag names are stable selectors; its class names are not.
export const geminiWide: StyleRule = {
  id: "gemini-wide",
  name: "Gemini 对话加宽",
  matches: ["https://gemini.google.com/*"],
  intent: "对话正文、提问和输入框从 708px 加宽到 1100px，左右对齐；不分列，因为对话要按顺序读。",
  source: "preset",
  css: `
chat-app {
  --pt-width: 1100px;
}
/* Gemini's own width tokens: images, placeholders and some cards read these. */
chat-app * {
  --bard-chat-window-content-width-default: var(--pt-width) !important;
  --bard-chat-window-max-width-default: calc(var(--pt-width) + 16px) !important;
}
/* Gemini also hardcodes 708px on these; the markdown rule carries a :not(#_) specificity bump, hence !important. */
model-response .markdown > *,
user-query,
message-actions,
model-response-disclaimers,
.response-footer,
.response-container-header,
.response-container-footer,
thinking-overlay,
prompt-flow-bar,
.input-area-container {
  max-width: var(--pt-width) !important;
}
`,
};
