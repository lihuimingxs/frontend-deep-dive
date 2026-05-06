# 浏览器渲染管线深度学习 · 章节大纲

> 本文件是浏览器渲染主题的写作蓝本。**5 阶段 · 11 章**：从浏览器项目史 + 引擎对照（P1）→ Chromium 多进程架构（P2）→ 关键渲染路径 CRP 三段（P3）→ Web Vitals 性能 metrics + 动画性能（P4）→ 现代 Web Platform 特性（P5）。
> 编写日期：2026-05-06（首版）｜目标版本：Chrome 130+ / Safari 18+ / Firefox 130+；历史回溯至 1993 NCSA Mosaic。

---

## 元信息

- **目标版本**：Chromium 130+（Chrome / Edge / Brave / Opera 等共享）+ WebKit 18+（Safari） + Gecko 130+（Firefox）。覆盖 1993 至 2026 全部主要演进；Chromium 主导地位（90%+ 浏览器份额）作为现状基线。
- **来源**：
  - [developer.chrome.com](https://developer.chrome.com/)（Chrome 官方文档、设计博客、性能指南）
  - [web.dev](https://web.dev/)（Google 出品的现代 Web 标准 + Web Vitals 权威）
  - [w3.org/TR](https://www.w3.org/TR/) + [whatwg.org](https://whatwg.org/)（HTML / CSS / DOM 规范）
  - [chromium.org/developers/design-documents](https://www.chromium.org/developers/design-documents/)（Chromium 设计文档，权威一手）
  - [webkit.org/blog](https://webkit.org/blog/)（WebKit / Safari 设计博客）
  - [hacks.mozilla.org](https://hacks.mozilla.org/)（Firefox / Gecko / Servo 设计文章）
  - Paul Irish / Addy Osmani / Una Kravets 等 Chrome team 公开演讲
- **目标读者**：已学完 `v8/` `ecma/` `javascript/` 主题的工程师；理解 V8 怎么跑 JS，现在想知道浏览器怎么把 HTML/CSS/JS 渲染成像素 + 怎么诊断性能问题。
- **不是这个主题的读者**：纯后端工程师 / 没写过前端的人——本主题假设读者写过前端代码，遇到过 reflow / repaint / 卡顿这些问题。

---

## 整体设计：5 阶段 · 沿"渲染管线"展开

浏览器渲染是<strong>从 URL 到屏幕像素</strong>的完整流水线 —— 涉及网络 / 进程 / 解析 / 布局 / 绘制 / 合成多层。我们按这条管线展开：从最底层（项目史 + 多进程架构）到中层（CRP 关键渲染路径）到上层（Web Vitals 性能 + 现代特性）。

| 阶段 | 章数 | 核心问题 |
|---|---|---|
| **P1 · 浏览器是谁** | 2 | 浏览器 30 年项目史 + Blink/WebKit/Gecko 三引擎对照（Chromium 90%+ 份额的现状） |
| **P2 · 多进程架构** | 2 | Chromium Browser/Renderer/GPU/Network 进程职责 + Site Isolation + OOPIF（Spectre 后的安全演化） |
| **P3 · 关键渲染路径 CRP** | 3 | HTML→DOM→CSSOM 解析 → Style→Layout → Paint→Composite 三段，把"从 HTML 到像素"讲透 |
| **P4 · Web Vitals 与性能** | 3 | LCP/FCP/TTFB 载入侧、INP/Long Tasks 交互侧、CLS+动画 fps（jank 诊断） |
| **P5 · 现代 Web Platform** | 1 | View Transitions / Container Queries / Speculation Rules / Scheduler API（2024-2026 新特性） |

总计 **11 章 ≈ 70,000-80,000 字**，平均每章 6,500 字。

---

## 与既有主题的边界 ——「短重述 + 链回」原则

浏览器渲染主题与 V8 / ECMA / JS 主题有显著重叠（特别是 V8 + Event Loop），必须明确划界：

> ✅ **短重述**：1-3 句话点出"它在底层是什么 + 关键性质"
> ✅ **链回**：紧跟一句"详细的 X / Y / Z 请参考 [`v8/{phase}/{chapter}`]"
> ❌ **不要**直接抄一遍 V8 / ECMA / JS 那边的论述

**关键边界**：

| 概念 | 在哪讲透 | 浏览器渲染主题里怎么处理 |
|---|---|---|
| V8 编译流水线 | `v8/02-pipeline/` | 链回，仅在 P1.2 浏览器引擎对照时点出 V8 是 Blink 的 JS 引擎 |
| V8 Hidden Class / IC | `v8/03-speedup/` | 链回，与渲染无直接关系 |
| V8 GC | `v8/04-memory/02-orinoco-gc.html` | 链回，仅在 P4.2 讲长任务暂停时短重述（GC 暂停是 Long Task 来源之一） |
| V8 Isolate / Context | `v8/05-embedding/01-embedder-api.html` | 链回，P2.1 讲 Renderer 进程内多 Isolate 时点出 |
| Event Loop（规范） | `ecma/07-execution/03-event-loop-async.html` | 短重述，P4.2 讲 INP / Long Tasks 时强调"浏览器 EL ≠ Node EL"；浏览器 EL 还有 rendering steps |
| Microtask / Promise | `javascript/03-async/` + `ecma/07-execution/` | 链回，P4.2 提及 microtask 不让出渲染机会 |
| requestAnimationFrame | `ecma/07-execution/03-event-loop-async.html` | 短重述（规范在 HTML spec），重点讲 rAF 与渲染管线的协作 |
| Cloudflare Workers / Edge | `v8/01-overview/02-engine-landscape.html` + `node/01-overview/02-runtime-landscape.html` | 链回，本主题不展开服务端 Edge runtime |
| HTTP / fetch | 待写的 HTTP/2/3 主题 | P1 / P3 提及网络层是渲染前置；P3.1 讲 preload scanner 时短提 |
| Service Worker / PWA | （本主题不展开，可能未来独立章节） | 仅 P5 简短点出 |

---

## 内容覆盖原则 ——「web.dev 是源头，Chromium 设计文档做对照」

浏览器领域的特点：**Chrome team 文档极强**（web.dev / developer.chrome.com）但偏向"如何用"；**Chromium 设计文档**（chromium.org）讲"为什么这样设计"。本主题用<strong>web.dev 教用法 + Chromium docs 教内核</strong>。

**3 条规则**：

1. **优先 chromium.org / webkit.org / hacks.mozilla.org 一手**：每个机制的"权威定义"必须来自浏览器引擎团队官方文档。社区博客（CSS-Tricks / smashingmagazine）只用来佐证或补充实测。
2. **版本号与浏览器都要标**：浏览器特性 cross-browser 兼容性差异大，每个特性必标"Chrome X 引入 / Safari Y 跟进 / Firefox Z 跟进"。caniuse.com 是验证工具。
3. **关注"Spec → 实现"差距**：W3C / WHATWG 规范定义行为，但浏览器实现往往有 quirks。涉及 corner case 时<strong>同时引用规范 + 引擎源码 + caniuse</strong>。

---

## 节奏建议

- **连读组**：
  - P1.1 + P1.2（浏览器史 → 引擎对照）
  - P2.1 + P2.2（多进程 → Site Isolation，进程模型完整）
  - P3.1 + P3.2 + P3.3（CRP 三段必须连读，是渲染管线的核心）
  - P4.1 + P4.2 + P4.3（Web Vitals 三段，性能 metric 闭环）
- **可独立跳读**：
  - P5 现代 Web Platform 特性相对独立
- **建议阅读路径**：
  - 已写过前端的工程师：P3 → P4，补底层与性能
  - 性能调优 / 排障：P3.3 + P4 全部 + DevTools Performance panel
  - 做 SSR / 全栈框架：P2 + P3.1（preload / blocking 行为）

---

## 文件结构

```
browser-rendering/
  01-overview/                     (P1 · 浏览器是谁 · 2 章)
    01-history.html                ← Mosaic 1993 → Netscape → IE → Webkit/Gecko/Blink → Chromium 主导
    02-engine-landscape.html       ← Blink / WebKit / Gecko 三引擎对照 + 同代人现状
  02-multi-process/                (P2 · 多进程架构 · 2 章)
    01-process-model.html          ← Browser/Renderer/GPU/Network/Utility 进程职责
    02-site-isolation.html         ← Spectre 后的 Site Isolation + OOPIF + COOP/COEP
  03-crp/                          (P3 · 关键渲染路径 · 3 章)
    01-parse-dom-cssom.html        ← HTML parser + preload scanner + CSSOM 阻塞行为
    02-style-layout.html           ← Style cascade + computed style + Layout/Reflow + box model
    03-paint-composite.html        ← Paint phase + layer tree + GPU 合成 + tile rasterization
  04-performance/                  (P4 · Web Vitals 与性能 · 3 章)
    01-load-metrics.html           ← LCP / FCP / TTFB 载入侧；preload / fetchpriority
    02-inp-long-tasks.html         ← INP / Long Tasks / scheduler.yield()；事件响应链
    03-cls-animation.html          ← CLS 布局稳定性；动画 fps + jank + will-change
  05-modern-platform/              (P5 · 现代 Web Platform · 1 章)
    01-modern-features.html        ← View Transitions / Container Queries / Speculation Rules / Scheduler API
  index.html
  outline.md
```

---

# P1 · 浏览器是谁（2 章）

> 不讲技术细节，只解决两个问题：浏览器 30 年怎么走到今天、三大引擎现在的格局是什么。给后面所有"为什么这样设计"提供历史坐标。

## P1.1 · 浏览器项目史（1993-2026）

- **定位**：把浏览器 33 年的故事讲成一条主线 —— 不是按版本号，而是按"每次范式转移及其根因"。
- **关键节点**：
  - **1993-04 · NCSA Mosaic**：Marc Andreessen 团队推出图形浏览器，Web 走向大众；同年 NCSA 大量开发者后来创立 Netscape
  - **1994-12 · Netscape Navigator 1.0**：商业浏览器先驱；JavaScript 1995 年由 Brendan Eich 在 10 天内写出
  - **1995-08 · IE 1.0 + 第一次浏览器战争**：微软借 Windows 95 捆绑 IE；1998 年 IE 占 80%+ 份额，Netscape 被迫开源（Mozilla 起源）
  - **1998-01 · Netscape 开源 → Mozilla**：直接开源失败（代码太烂），1998 启动 Gecko 重写；2002 Mozilla 1.0 / 2004 Firefox 1.0
  - **2001-11 · IE 6**：Web 发展停滞 5 年；2003-2008 IE 不更新（IE 6 用了 7 年）
  - **2003-01 · Apple 推出 Safari + WebKit**：Apple fork KHTML / KJS（KDE 项目）+ 加 mobile 优化；2007 iPhone Safari 让 WebKit 在 mobile 主宰
  - **2008-09 · Chrome + V8 + Blink**：Google 推 Chrome（基于 WebKit），用 V8 替代当时业内最快的 JSCore；2013 Chrome fork WebKit → Blink，独立演进
  - **2010-2015 · 第二次浏览器战争**：Chrome / Firefox / Safari / IE / Opera 五分天下；标准化加速（HTML5 / CSS3）
  - **2015-07 · Microsoft Edge 取代 IE**：但 Edge Legacy 用自家 EdgeHTML 引擎，市场份额上不来
  - **2018-12 · Microsoft 宣布 Edge 切 Chromium**：意味着 Blink / Chromium 事实标准；EdgeHTML 退出历史
  - **2020+ · Chromium 主导**：Chrome + Edge + Brave + Opera + Vivaldi + Arc 等都是 Chromium。<strong>2026 年 Chromium 占浏览器份额 90%+</strong>
  - **2024 · EU DMA 解禁 iOS 第三方引擎**：之前 Apple 强制 iOS 浏览器必须用 WebKit；DMA 后 Chromium / Gecko 理论上能上 iOS（实际仍 WebKit 主导）
- **底层逻辑要点**：
  - **第一次浏览器战争（1995-2003）的教训**：单一公司（Microsoft）控制平台 → 标准停滞 5 年；Web 标准化运动（W3C / WHATWG）就是这场战争的反思
  - **WebKit fork 出 Blink 的根因**：Google 想要更激进的多进程架构 + 更快的迭代节奏；Apple WebKit 仍以 Safari 优先，节奏不匹配
  - **Chromium 90%+ 份额是好是坏**：标准化加速（不需要测 5 个引擎）、但生态多样性损失（如果 Chromium 设计错误，整个 Web 都要错）；Apple WebKit / Mozilla Gecko 是关键的"反向制衡"
- **预估字数**：6,000-7,000

## P1.2 · 三大引擎对照：Blink / WebKit / Gecko

- **定位**：横向对照章。讲清三个浏览器引擎各自做了什么不同选择 + 现状份额 + 互相制约。
- **关键知识点**：
  - **Blink (Chromium 系)**：基于 WebKit fork（2013）；Chrome/Edge/Brave/Opera/Vivaldi/Arc 都用；JS 引擎是 V8；多进程架构最激进；新特性优先实现
  - **WebKit (Apple/Safari)**：原始 KHTML/KJS fork（2003）；Safari + iOS 浏览器；JS 引擎是 JavaScriptCore（详见 `bun/02-internals/01-javascriptcore.html`）；mobile 优化深；新特性较保守
  - **Gecko (Mozilla/Firefox)**：1998 年从 Netscape 重写；JS 引擎是 SpiderMonkey；2017 Servo 项目实验 Rust 重写但部分被吸收回 Gecko；标准化最严格
- **设计选择对比**：
  | 维度 | Blink | WebKit | Gecko |
  |---|---|---|---|
  | JS 引擎 | V8 | JavaScriptCore | SpiderMonkey |
  | 多进程 | 极激进（每 site 一进程） | 较激进（per tab） | 中等（Fission 项目跟进中） |
  | 新特性速度 | 最快 | 最慢（Apple 偏保守） | 中 |
  | mobile 表现 | Android 主导 | iOS 唯一 | Mobile 弱 |
  | 市场份额 | ~70% | ~20% | ~3% |
  | 标准合规 | 中（推自家 origin trial 有时绕规范） | 中 | 高（标准最严格） |
- **底层逻辑要点**：
  - **三引擎制衡的实际作用**：Apple 拒绝实现某些 API（如 PWA 入口、WebUSB）让 Chrome 不能彻底主导；Mozilla 标准合规态度让 Web 不至于变 Chrome-only
  - **iOS 上的 WebKit 强制（2024 前）**：让 WebKit 在 mobile 不能被 Chromium 完全替代；2024 EU DMA 解禁后改变可能发生但慢
  - **Chromium "优先实现 + 推标准"模式**：Origin trial 让 Chrome 提前给开发者用新 API，反向推 Web 标准化（如 View Transitions / Speculation Rules）—— 但有时不被其他引擎接受
- **关联章节**：[`v8/01-overview/02-engine-landscape.html`]、[`bun/02-internals/01-javascriptcore.html`]
- **预估字数**：6,000-7,000

---

# P2 · 多进程架构（2 章）

> Chrome 2008 年立项的核心创新是<strong>多进程架构</strong>——把网页 / 浏览器 UI / GPU 各放独立进程。这一阶段把它讲透。

## P2.1 · Chromium 进程模型

- **定位**：讲清 Browser process / Renderer / GPU / Network / Utility 各自职责。
- **关键知识点**：
  - **Browser process（浏览器主进程）**：UI / 标签管理 / 进程协调 / 安装 PWA 等系统级操作；每个浏览器只有 1 个
  - **Renderer process（渲染进程）**：跑网页内容（HTML/CSS/JS）；每个 tab 通常 1 个；Site Isolation 后每个 origin 也独立
  - **GPU process**：合成 + 硬件加速绘制；只 1 个；崩溃不影响其他进程
  - **Network process**：所有网络请求集中处理；Mojo IPC 与 Renderer 通信；2017 后独立出来
  - **Utility processes**：临时任务（音频解码、图像解码、PDF 渲染等）；每个任务一个临时进程
  - **进程间通信（IPC）**：Mojo（Chromium 自家 IPC 框架，替代 Chrome IPC）；通过 message + shared memory
  - **每 Renderer 进程内部**：1 个主线程（runs JS / Layout / Paint）+ Compositor thread + Worker threads
- **底层逻辑要点**：
  - **多进程的 4 个收益**：(1) 安全（沙箱隔离）；(2) 稳定（一 tab 崩不影响其他）；(3) 性能（多核利用）；(4) 内存（不用进程时回收）
  - **多进程的代价**：内存翻倍（每进程独立 V8 / 其他基础设施）；启动慢；IPC 开销
  - **Renderer 进程内部「主线程一切」的瓶颈**：JS / Layout / Paint 都在主线程跑，long task 卡所有渲染——这是 INP / Long Tasks metric 的来源
- **关联章节**：[`v8/05-embedding/01-embedder-api.html`]（Renderer 内 V8 Isolate）、[`node/05-multicore-native/01-worker-cluster.html`]（多进程概念对照）
- **预估字数**：6,500-7,500

## P2.2 · Site Isolation + OOPIF + COOP/COEP

- **定位**：Spectre 漏洞（2018）后浏览器安全模型的根本性变化。
- **关键知识点**：
  - **Spectre / Meltdown（2018）**：硬件级 CPU 漏洞，让恶意 JS 能跨进程读其他 site 数据；触发浏览器全面重构
  - **Site Isolation**（Chrome 67, 2018）：每个 origin 独立 Renderer 进程；之前是 per tab，现在是 per site
  - **Out-of-Process iframes (OOPIF)**：iframe 跨域时跑独立进程；解决 iframe 嵌入恶意内容的隔离
  - **COOP（Cross-Origin-Opener-Policy）+ COEP（Cross-Origin-Embedder-Policy）**：让网页声明"我要进入 cross-origin isolated 状态"，启用 SharedArrayBuffer 等高级 API
  - **SharedArrayBuffer 限制**：Spectre 后 SAB 默认禁用；只在 cross-origin isolated 网页可用
  - **CORS / CORP**：跨域资源策略；与 COOP/COEP 配合
- **底层逻辑要点**：
  - **Site Isolation 的代价**：内存增加 ~10-20%（每 site 独立进程）；但安全收益巨大
  - **WebAssembly + SAB 的高级用途被限制**：Cross-origin isolation 是必要前提，让一些游戏 / 计算密集应用部署变复杂
  - **Spectre 教训**：硬件层面的安全假设被打破后，软件层不得不重构；这是浏览器历史最大的范式转移之一
- **关联章节**：[`ecma/07-execution/05-memory-model.html`]（SharedArrayBuffer + Atomics）
- **预估字数**：5,500-6,500

---

# P3 · 关键渲染路径（CRP）（3 章）

> Web 性能的核心理论：<strong>从 URL 到屏幕像素</strong>的完整流水线。这一阶段三章把它讲透。

## P3.1 · HTML → DOM → CSSOM 解析

- **定位**：渲染管线第一段。HTML / CSS 怎么变成 DOM 树 + CSSOM 树。
- **关键知识点**：
  - **HTML parser**：Tokenizer + Tree builder；流式 parse（边下载边构造 DOM）
  - **Preload scanner**：HTML parser 之外的"预扫描器"，提前发现 <code>&lt;link&gt;</code> / <code>&lt;script&gt;</code> / <code>&lt;img&gt;</code> 等开始下载
  - **CSS parsing**：CSSOM 树构造；样式表是<strong>渲染阻塞资源</strong>（必须 parse 完才能 layout）
  - **JS 阻塞行为**：<code>&lt;script&gt;</code> 默认阻塞 HTML parser；<code>async</code> / <code>defer</code> / <code>module</code> 各自的语义
  - **CSSOM 阻塞 JS 执行**：JS 可能查询 style，所以 JS 执行前 CSS 必须 parse 完
  - **DOMContentLoaded vs load**：DOM 解析完成 vs 所有资源加载完成
- **关键性能机制**：
  - **&lt;link rel="preload"&gt;**：显式声明高优先级资源
  - **&lt;link rel="modulepreload"&gt;**：预加载 ES Module
  - **fetchpriority 属性**：Chrome 102+，调整资源优先级
  - **&lt;script type="module"&gt; 默认 defer**：现代写法
- **底层逻辑要点**：
  - **Preload scanner 的存在感**：很多人不知道这玩意，以为 HTML parser 串行处理；preload scanner 让浏览器并行下载资源
  - **CSS 阻塞渲染**：<code>&lt;link rel="stylesheet"&gt;</code> 必须放 head，但放 head 让首屏渲染等待 CSS——折中是 critical CSS inline + 其他 async load
  - **JS 三种加载顺序**：default（阻塞 + 文档顺序执行）/ defer（不阻塞 + 文档顺序执行）/ async（不阻塞 + 完成顺序执行）
- **预估字数**：6,500-7,500

## P3.2 · Style → Layout（Reflow）

- **定位**：渲染管线第二段。DOM + CSSOM 怎么变成"每个元素的位置 + 大小"（Layout tree）。
- **关键知识点**：
  - **Style cascade**：CSS 选择器优先级 + inheritance + initial / inherit / unset / revert
  - **Computed style**：每个元素的最终样式值（resolved %、计算继承）
  - **Layout tree（Render tree）**：包含<strong>需要布局的元素</strong>（display: none 不在内）；与 DOM tree 不同
  - **Layout 算法**：Block formatting context / Inline formatting context / Flexbox / Grid 各自规则
  - **Box model**：content / padding / border / margin；box-sizing 影响
  - **Reflow 触发条件**：geometry 变化（宽高 / 位置 / margin / padding）；某些 CSS 属性
  - **Layout invalidation**：改一个元素几乎一定让其他元素也 invalidate（因为流式布局）
- **现代特性**：
  - **CSS Containment**：<code>contain: layout</code> 隔离 reflow 影响；性能优化关键
  - **content-visibility**：让浏览器跳过屏幕外元素的 layout/paint
  - **CSS Subgrid**：Grid 嵌套场景
  - **Flexbox / Grid 算法细节**：min-content / max-content / fr unit
- **底层逻辑要点**：
  - **Reflow 是性能大头**：改一个 style 可能导致整树 reflow，几十 ms 量级；批量 DOM 操作 + read/write batching 是优化核心
  - **Layout vs Layout tree**：Layout 是动作（计算几何），Layout tree 是结果（带几何信息的元素树）
  - **Containment 是 2020+ 浏览器最重要的性能 API**：明确告诉浏览器"这块独立"，让 reflow 不外扩
- **关联章节**：[`javascript/05-dom/`]（DOM API）
- **预估字数**：7,000-8,000

## P3.3 · Paint → Composite（GPU 合成）

- **定位**：渲染管线第三段。Layout tree 怎么变成屏幕像素。
- **关键知识点**：
  - **Paint phase**：把 layout tree 中每个元素绘制成 paint records（绘制指令列表）；不是真实绘制
  - **Layer tree**：把 paint records 按 layer 分组；每个 layer 独立 raster + 合成
  - **Compositing**：GPU 把所有 layer 合成成最终屏幕图像；transform / opacity 在 GPU 上免费
  - **Tile-based rasterization**：每 layer 切成 256x256 tiles；只 raster 可见 tile + 异步 raster
  - **Will-change 属性**：给元素强制独立 layer；常被滥用
  - **transform / opacity 走 GPU 直通**：不触发 reflow / paint，只走合成；这是 60fps 动画的关键
- **现代特性**：
  - **GPU raster**：把 raster 移到 GPU；Chrome 默认开启
  - **OOP-D（Out-of-Process Display Compositor）**：合成器在 GPU 进程独立运行
  - **Vulkan / Metal 后端**：Chromium 用现代图形 API 加速
- **底层逻辑要点**：
  - **三态：Reflow vs Repaint vs Composite**：geometry 改 → reflow + repaint + composite；颜色 / 背景改 → repaint + composite；transform / opacity 改 → composite only。后者是动画黄金路径
  - **Layer 不是越多越好**：每 layer 占内存 + composite 开销；will-change 滥用会让性能更差
  - **GPU 合成是浏览器近 10 年最重要的性能跃迁**：让 60fps 动画从"奢侈"变成"默认"
- **关联章节**：[`v8/04-memory/01-heap-and-objects.html`]（GPU 内存与 V8 堆）
- **预估字数**：7,000-8,000

---

# P4 · Web Vitals 与性能（3 章）

> 2020 Google 推出的 Web Vitals 是<strong>"用户体验可量化"</strong>的事实标准。这一阶段三章覆盖载入 / 交互 / 视觉稳定性三个维度。

## P4.1 · 载入侧 metrics：LCP / FCP / TTFB

- **定位**：从 URL 输入到主要内容渲染完成的性能。
- **关键知识点**：
  - **LCP（Largest Contentful Paint）**：最大内容元素绘制时间；目标 ≤ 2.5s（"good"）；2020 起核心 Web Vital
  - **FCP（First Contentful Paint）**：首次内容绘制；目标 ≤ 1.8s
  - **TTFB（Time To First Byte）**：服务器响应首字节；目标 ≤ 800ms
  - **LCP 优化路径**：服务器响应快 + critical CSS inline + 关键资源 preload + 图片格式 / 大小优化
  - **fetchpriority="high"**：Chrome 102+，告诉浏览器哪些资源优先
  - **&lt;link rel="preload"&gt; vs &lt;link rel="preconnect"&gt; vs &lt;link rel="dns-prefetch"&gt;**：三个层级
  - **HTTP/2 vs HTTP/3 影响**：QUIC + 0-RTT 在 mobile 网络下差距明显（详见待写的 HTTP 主题）
- **底层逻辑要点**：
  - **LCP 的 ROI**：改善 LCP 1s 通常带来 conversion 提升 8-20%；电商场景特别敏感
  - **LCP 元素的可预测性**：通常是 hero image / 主标题 / 视频；提前 preload 是基础优化
  - **关键资源 vs 非关键资源**：只 preload 真正阻塞 LCP 的；过度 preload 反而拖慢
- **关联章节**：HTTP/2/3 主题（待写）
- **预估字数**：6,500-7,500

## P4.2 · 交互侧 metrics：INP / Long Tasks

- **定位**：从用户输入到响应完成的性能。
- **关键知识点**：
  - **INP（Interaction to Next Paint）**：2024 起替代 FID 成为核心 Web Vital；目标 ≤ 200ms
  - **FID（First Input Delay）**：旧 metric，2024 已移除；只看首次交互
  - **Long Tasks**：&gt; 50ms 的 task 阻塞主线程；浏览器 reportable
  - **PerformanceObserver API**：监听 long-task / longtask / event 等 entries
  - **scheduler.yield()**：Chrome 129+，让出主线程；比 setTimeout(0) 更优
  - **scheduler.postTask()**：精细调度（user-blocking / user-visible / background）
  - **Event 处理链**：input dispatch → handler → microtask → rendering steps
- **关键性能机制**：
  - **isInputPending() API**：让长任务能"中途让出"
  - **requestIdleCallback**：空闲时跑非紧急任务
  - **AbortController + AbortSignal**：取消长跑 work
- **底层逻辑要点**：
  - **INP 比 FID 严格**：FID 只看首次，INP 看所有交互；很多页面 FID 好但 INP 差
  - **JS 长任务的根因**：(1) 大 React 组件 reconcile；(2) 大数据 JSON.parse；(3) 大 array 排序 / 过滤；(4) 同步 layout flushing
  - **scheduler API 是 2024+ 的关键**：之前只能 setTimeout 让出，scheduler.yield() 让"让出 + 立即继续"成为一等公民
- **关联章节**：[`ecma/07-execution/03-event-loop-async.html`]、[`javascript/03-async/`]
- **预估字数**：7,000-8,000

## P4.3 · CLS + 动画性能（fps + jank）

- **定位**：视觉稳定性 + 流畅性。
- **关键知识点**：
  - **CLS（Cumulative Layout Shift）**：视口内元素位置移动量；目标 ≤ 0.1
  - **CLS 的常见来源**：未声明尺寸的图片 / 异步加载的广告 / Web font 替换 / 异步注入的内容
  - **width/height 属性 + aspect-ratio CSS**：让浏览器预留空间
  - **font-display: optional / swap**：字体加载策略
  - **fps（frames per second）**：60fps = 16.67ms/frame；卡顿是连续多帧 &gt; 16.67ms
  - **Jank**：可感知的卡顿；通常是 long task / GC pause / 动画走 layout 路径
  - **Animation worklet / OffscreenCanvas**：高性能动画的现代方案
  - **DevTools Performance panel**：jank 排查的核心工具
- **底层逻辑要点**：
  - **CLS 优化的核心是"占位"**：浏览器需要知道元素的最终尺寸才能不 shift；image / iframe 必须声明 width/height
  - **60fps 的硬约束**：JS 给到 layout/paint/composite 的预算只有 ~10ms；超过就掉帧
  - **transform / opacity 是黄金动画属性**：只走 composite，不触发 reflow / paint；JS 操作 top/left 改成 transform 是经典优化
- **关联章节**：[`v8/04-memory/02-orinoco-gc.html`]（GC 暂停作为 jank 来源）
- **预估字数**：7,000-8,000

---

# P5 · 现代 Web Platform（1 章）

> 2024-2026 的关键新特性，让浏览器从"渲染引擎"进化为"应用平台"。

## P5.1 · View Transitions / Container Queries / Speculation Rules / Scheduler API

- **定位**：把 4-5 个 2024+ 关键特性集中讲，每个独立但都体现"Web Platform 现代化"方向。
- **关键知识点**：
  - **View Transitions API**：浏览器内置的页面间动画过渡；Chrome 111+；与 SPA / MPA 都能用
  - **Container Queries**：基于父容器（不是视口）的 responsive；Chrome 105 / Safari 16 / Firefox 110
  - **Speculation Rules API**：预渲染下一页（不是 prefetch，是真预渲染）；Chrome 121+
  - **Scheduler API**（详见 P4.2）：scheduler.postTask / scheduler.yield
  - **Popover API**：原生 modal / popover（不需要 JS 实现 z-index 管理）；Chrome 114+ / 全引擎
  - **CSS Anchor Positioning**：原生锚点定位；Chrome 125+；替代 floating-ui 库
  - **CSS Nesting**：原生支持嵌套；不需要 SCSS / PostCSS
  - **Origin Private File System**：浏览器内文件系统（PWA 用）
- **底层逻辑要点**：
  - **从「JS hack」到「平台原语」的趋势**：View Transitions 替代 Framer Motion 一部分场景；Popover 替代 Headless UI 的 modal；Anchor Positioning 替代 floating-ui
  - **每个特性都对应一个长期 hack**：浏览器把开发者反复写的"应该是平台特性"东西标准化 + 实现
  - **跨引擎差异是阻塞因素**：Chrome 抢先实现 → 开发者用 → Safari/Firefox 跟进慢；原 trial → 官方标准的过程往往 2-3 年
- **关联章节**：[`react/`]（React 框架与这些特性的协作）
- **预估字数**：7,000-8,000

---

## 附：参考资料汇总

**官方一手**：
- [web.dev](https://web.dev/) · Google Chrome team 出品的现代 Web 教学
- [developer.chrome.com](https://developer.chrome.com/) · Chrome 开发者文档
- [chromium.org/developers/design-documents](https://www.chromium.org/developers/design-documents/) · Chromium 设计文档
- [webkit.org/blog](https://webkit.org/blog/) · WebKit 团队博客
- [hacks.mozilla.org](https://hacks.mozilla.org/) · Mozilla / Firefox 团队博客
- [w3.org/TR](https://www.w3.org/TR/) · W3C 规范
- [whatwg.org](https://whatwg.org/) · WHATWG（HTML / DOM 等活规范）

**关键演讲与文档**：
- [Inside look at modern web browser (4 part series)](https://developer.chrome.com/blog/inside-browser-part1) · Mariko Kosaka 讲 Chromium 内部
- [Web Vitals docs](https://web.dev/vitals/) · LCP / INP / CLS 权威定义
- [The Anatomy of a Frame](https://aerotwist.com/blog/the-anatomy-of-a-frame/) · Paul Lewis 讲渲染管线
- [Render Performance](https://web.dev/articles/rendering-performance) · 性能优化
- [Site Isolation explainer](https://www.chromium.org/Home/chromium-security/site-isolation/) · Spectre 后的设计

**社区资源**：
- [caniuse.com](https://caniuse.com/) · 浏览器特性兼容查询
- [MDN Web Docs](https://developer.mozilla.org/) · Mozilla 文档（中立 + 详细）
- [CSS-Tricks](https://css-tricks.com/) · CSS 实战
- [Smashing Magazine](https://www.smashingmagazine.com/) · Web 标准与设计

---

## 与 index.html 卡片的对应

浏览器渲染管线主题在站点首页的卡片描述是：
> 关键渲染路径（CRP / Compositor / Reflow）/ Web Vitals 根因 / 多进程架构 / Site Isolation / 现代 Web Platform 特性。

本大纲全部覆盖 + 扩充：
- ✅ CRP / Compositor / Reflow → P3 全覆盖
- ✅ Web Vitals 根因 → P4 全覆盖
- ✅ 多进程架构 → P2 全覆盖
- ➕ 扩充：浏览器项目史（P1）、Site Isolation 单独成章（P2.2）、现代 Web Platform 特性（P5）

写完后建议把 index.html 的卡片标题从 "⏳ 规划中" 改为 "✅ 11 章 / 5 阶段完成"。
