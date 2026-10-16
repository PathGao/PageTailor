# PageTailor 技术方案

工程约定写这里；界面和产品决定写 [DESIGN.md](DESIGN.md)；做什么、不做什么写 [ROADMAP.md](ROADMAP.md)。

## 技术栈

- **WXT + TypeScript**，Manifest V3。WXT 负责生成 manifest、热重载、打 Chrome 和 Firefox 两份包。M1 只用纯 TS，不引入 UI 框架。
- 为什么 M1 就用 WXT：M2 的侧边栏和 AI SDK 必须打包，M1 用裸 MV3 到时候要重搭构建。
- 包管理器 bun（本机 npm 也转给 bun），锁文件 `bun.lock`。
- 浏览器：先 Chrome（Edge 同包可用），Firefox 在 M2 前后补。

## 运行时组成

```
content script（document_start，所有已授权网站）
  ├─ 读 storage.local 里的启用状态和用户规则
  ├─ 按当前网址挑出匹配的规则，拼成一份 CSS
  ├─ 写进页面里唯一的 <style id="pagetailor">
  ├─ 监听 storage.onChanged，开关或改样式后立即更新，不用刷新
  └─ 监听 navigation 的 navigatesuccess：Google 切页签、Gemini 切对话不重新加载页面

popup（M1）       列出匹配当前网址的预设，提供开关
background（M2）  调模型 API、截图、管理会话
side panel（M2）  对话界面
```

## 样式规则

一条规则回答"哪些网址、套什么 CSS、当初为什么这样改"：

```ts
type StyleRule = {
  id: string;          // 预设用固定 id，如 "google-search-columns"
  name: string;        // 界面上显示的名字
  matches: string[];   // URL 匹配模式，语法同 manifest 的 match pattern
  exclude?: string;    // 正则，命中则跳过。match pattern 管不了查询参数时用（如 Google 图片页 udm=2）
  css: string;
  intent: string;      // 原始要求，M3 修复时交给 AI 重新生成
  source: "preset" | "user";
};
```

- **预设随代码发布，不复制进存储。** 存储里只记预设的开关状态。预设更新跟着插件版本走，不会出现用户手里留着旧 CSS 的情况。
- **用户规则存 `storage.local`**，不存网页自己的 localStorage（那里网站的 JS 读得到）。
- 匹配粒度是网址模式，不是域名。`https://www.google.com/search*` 只管搜索结果页，不碰地图和图片。
- 同一网址命中多条规则时，按预设在前、用户规则在后的顺序拼接，后面的覆盖前面的。

## 预设的增强脚本

预设类型是 `StyleRule & { enhance?: () => () => void }`（`src/presets/types.ts`）。`enhance` 是插件自己的代码，不是模型生成的；预设生效时启动，关掉或网址不再匹配时调用它返回的清理函数。content script 每次 render 带世代号，旧的存储读取结果晚到时丢弃。

现有用法（`src/serp/apple.ts`）：Google 苹果风读每条结果的网站图标像素，取饱和度最高的色相作为该网站的主色，写到卡片的 `--pt-accent`。Google 把图标内嵌成 data: URI，不联网、画布不受跨域限制。

## 搜索结果页：角色和适配分开（2026-10-14）

网页结构经常变，规则表要长期维护（和沉浸式翻译、广告拦截一样）。为了让维护集中在一处，把「什么在哪」和「长什么样」分开：

```
src/serp/site.ts     角色清单：结果区、主栏、侧栏、列表、单条结果、标题、来源、摘要、附加信息、配图、通知区、底部……
src/serp/google.ts   Google 适配：每个角色对应的选择器 + Google 专有的整页框架 CSS 和上方模块识别
src/serp/columns.ts  多列布局样式（只写角色）
src/serp/apple.ts    苹果风样式和脚本（只写角色）
src/serp/grid.ts     网格引擎：摊平包装层、过宽/过高独占一行、补满末行
src/serp/top.ts      上方模块对齐
```

样式模板在加载时把适配里的选择器填进去，生成的仍是纯 CSS，在 document_start 生效。Google 改版时只改 `google.ts`。改造时逐字核对过：生成的两份 CSS 去掉注释后与改造前完全相同。

第二个适配是百度（`src/serp/baidu.ts`，2026-10-14）。复用情况：样式模板、网格引擎原样复用；通用层只加了两处——去掉网站给结果写死的宽度（百度 608px），新增角色 `feature`（网站自己的模块卡片：百度的 `.result-op`，一律占整行；Google 的模块没有带链接的标题，本来就占整行，取 `:not(*)`）。要按网站另写的：整页框架 CSS（百度是两栏浮动，Google 是网格）、上方模块识别（百度没有）、深色模式和搜索框（百度先不改）。没有的角色取 `:not(*)`。

约束：选择器要能同时用于 CSS 和 querySelector；放进 `:has()` 的角色自己不能含 `:has()`（CSS 不允许嵌套），所以「有没有标题」单独是一个角色 `hasTitle`。

## 结果排到 AI 概览旁边（2026-10-14）

宽屏上 AI 概览按内容定宽后右边留空，`src/serp/beside.ts` 把前几条结果挪到它旁边：AI 概览后面紧跟一个新建的 `[data-pt-beside]` 容器（#rcnt 的子元素），整页网格改成「左边距 | AI 宽 | 其余 | 侧栏 | 右边距」五栏，容器里的小网格和下面结果的列宽、间距一致，上下对齐。AI 占 k 列（不超过内容宽 1104px、不少于 820px、至少留 1 列），占的行数按它的高度和普通卡片高度算，旁边放 行数 ×（总列数 − k）条结果；不够就不挪（按列布局记住，不来回切），已挪的在用户点「展开」后保留并继续补。窗口变窄或关掉预设时按原位放回（倒序放回，因为每条记的下一个兄弟可能也被挪过）。

**AI 概览本身不能动**（2026-10-14 在 ego 的真实 Google 上实测，点击位置都核实过命中按钮）：

| 做法 | 「展开」 |
|---|---|
| AI 模块挪进 #rso | 失效 |
| AI 模块在 #rcnt 里往后挪一位 | 失效 |
| AI 模块内部加一个格子放结果 | 失效 |
| AI 模块不动，紧跟其后新建兄弟容器放结果 | 正常 |
| 只改 AI 模块的 CSS（宽度、隐藏顶部空条） | 正常 |

挪进容器的普通结果「关于这条结果」菜单照常打开。样式、整卡点击、取色、失效检查都同时认 `#rso` 和这个容器。检查脚本按「列表」「旁边容器」两个区域分别查行，另查旁边卡片不压 AI（证伪过：容器左移 300px 会报）。

## 适配失效检查（自愈循环的本地部分，2026-10-14）

`src/serp/health.ts`：页面结果稳定 1.5 秒后，数「结果区里带链接的标题」（排除侧栏和网站模块内部）和适配找到的普通结果、其中有摘要和来源的各有几个。结果不到标题数一半、或摘要/来源不到三成，判为可能失效。每个网站一次检查（content script 按 `preset.site.id` 去重），结果存 `storage.local` 的 `health`，只在结论变化时写；每次打开页面的第一次检查必写，这样网站恢复后旧警告会被清掉。弹窗显示警告和「复制诊断信息」（网站、插件版本、时间、问题计数，不含网址和页面文字）。

上报给服务器的部分没做：需要服务端、用户同意方式和隐私说明，等用户定。

验证：`assess` 单元测试 5 条；检查脚本在 34 个样本页上调用同一份代码，必须不报（2026-10-14 修掉了百度上的误报：分母曾把模块内的小标题算进去）；端到端测试删掉 Google 的摘要标记模拟改版，几秒内报「摘要 0/8」，重新打开正常页面后清除。

## Google 结果的网格

规整网格（`src/serp/grid.ts`），不用瀑布流（用户否定过，见 ROADMAP Not Do）：

- 同一行卡片等高（`align-items: stretch`，卡片 `height: 100%`）。等高靠内容限行做到：Google 用 `[data-snhf]` 标结果头部、`[data-sncf]` 标内容块；头部后紧跟的内容块是摘要（限 3 行），带图的是配图（靠右），其余是附加信息（每条 1 行），标题限 2 行。
- 整行区块（视频、图片、过宽的部件）把卡片分成若干段。每段卡片数不是列数的整数倍时，要多出几格让它填满整行；这几格给内容最丰富的卡片（`richness`：配图 2 分，每个额外内容块 1 分；同分看排名）。`widen()` 按丰富度顺序穷举给哪些卡片加宽、各加几格，在内存里按顺序摆放：某张卡片在本行剩余格子里放不下就算留洞，否决；最后一行正好填满才采用。找不到就退回「最后几张均分最后一行」，这个总成立。每段不超过约 12 张、多出的格子不超过列数减 1，穷举很快。顺序不变，不用 dense 补位。单元测试 `src/serp/grid.test.ts` 随机 500 组验证不留洞。
- 在 MutationObserver 和窗口 resize 时重排，只读计算样式；不用 ResizeObserver，因为它要等渲染，Chrome 不渲染后台标签页。
- 结果列表固定是 `#rso`（`data-pt-list`）。Google 把结果包在层数不定、有时并列的包装 div 里（天气、航班、新闻页有 2–3 组并列）。凡是「不是结果本身、也不直接装着结果，但更深处有结果」的 div 都是包装，打 `data-pt-flat` 并设 `display: contents`；其余子元素是格子，打 `data-pt-item`。
- 比同段卡片中位高度高 60% 以上且多出 150px 的卡片（带 6 条子链接的官网结果），单独占一行，否则会把整行拉高、旁边卡片留大洞；它的子链接表（`tr.mslg`）在整行里排成多列。检查脚本对「卡片被拉高后内部空白超过 120px」报错；60–110px 的差异是有无价格、评分行造成的，属正常。
- 比一列宽的部件（航班、计算器、地图）：格子内容 scrollWidth 超过宽度就打 `data-pt-wide` 占满整行，打上后不撤，避免整行后不再溢出又缩回去来回跳。
- 窄卡片里配图宽度超过卡片 35% 时（视频截图拼图），把配图移到文字下面（`data-pt-stack`）。

## 结果上方的模块

AI 概览、股价图表、地点地图、人物图片条都是 `#rcnt` 的直接子元素，各自套一份 Google 的网格，内容放在从第 2 列开始的格子里，层数不定。`src/serp/top.ts` 让适配（Google 是 `googleGridCell`）在每个模块里找最高的那个「第 2 列格子」，打 `data-pt-top-grid / -cell / -card`；含 `[data-lhcontainer]` 的是 AI 概览，另打 `data-pt-ai`。多列开启时模块和结果左右对齐，有右侧知识面板时右边缘对齐面板；AI 概览例外：它的正文被 Google 限宽 764px、来源栏 260px 贴右，满宽卡片会在两者之间空出一大段，所以只左对齐，宽度按内容定（`google.ts` 的 max-width 1024px，2026-10-14）；多列关闭时 AI 概览最宽等于结果栏（ResizeObserver 量 #center_col 写进 `--pt-results-width`）。知识面板里的 `[data-lhcontainer]` 不算 AI 概览。

## 预设之间的配合

两个预设同时作用于一个页面时，用 CSS 变量传递，不互相引用代码。例：Google 多列读 `--pt-gap`（默认 `8px 40px`），苹果风把它设成 `20px`。

## 深色模式跟谁走

跟网站自己的主题，不跟系统。Google 可以在深色系统上设成浅色：Google 深色页面带 `<meta name="color-scheme" content="dark light">`，苹果风按它切换。维基百科用自己的 Codex 颜色变量，自带深色模式不受影响。Hacker News 没有深色模式，按系统走。

## 注入时机

content script 在 `document_start` 运行，读 `storage.local` 是异步的。如果读完时页面已经画出第一帧，会先闪一下原样式。2026-10-13 在本机 fixture 上实测：样式 82ms 注入，首次绘制 332ms，不闪。真实网络下如果闪，再考虑 `chrome.scripting.registerContentScripts` 静态注册预设 CSS 文件（浏览器在首帧前注入）。

## 权限

- M1：`host_permissions` 只列预设覆盖的网站，加 `storage`。
- M2：`optional_host_permissions: ["<all_urls>"]`，用户第一次在某个网站保存样式时，再申请这个网站的权限。商店审核和用户信任都比一上来就要全部网站好。

## M2 AI 改样式（草案）

- 页面信息：压缩后的 DOM 骨架（标签、稳定选择器、位置尺寸、文字前几个字）+ 当前屏截图（`chrome.tabs.captureVisibleTab`）。只发 HTML 看不出布局问题。
- 模型工具：查看某个元素的细节、输出完整样式表（整体替换上一版）、应用后截图自查。
- API key 存 `storage.local`，只发给用户配置的服务商。
- 隐私：网银、邮箱等敏感网站默认不可用；发送前提示会发送页面内容。

## M3 失效检测（草案）

页面空闲后，把规则 CSS 里的选择器逐个 `querySelector`。大部分匹配不到元素时，标记规则失效，在插件图标上提示。用户点修复后，用 `intent` 重新生成。

## 测试

- 纯逻辑（网址匹配、规则拼接）用 vitest 测，WXT 官方支持。
- 预设 CSS 的效果在真实页面上验证：Google 和 Gemini 的 DOM 随时会变，验证时记下日期。
- 端到端测试（无头 Chrome 装真插件）放在本地笔记 `PageTailor-notes/e2e/`，因为它用的 Google 页面 fixture 不能进仓库。

## 选择器原则

- 不用乱码 class（Google 的 `.MjjYud`、Gemini 的 `ng-tns-*`），网站每次发版都可能变。
- 优先用 id（Google 的 `#rcnt`、`#rso`、`#rhs`）、自定义标签名（Gemini 的 `model-response`、`user-query`）、网站自己的 CSS 变量。
- 网站的规则带特殊优先级时（Gemini 用 `:not(#_)` 抬高），用 `!important`，不去比拼选择器长度。
