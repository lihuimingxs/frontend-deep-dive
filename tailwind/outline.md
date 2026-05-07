# Tailwind CSS 深度学习 · 章节大纲

> 本文件是 Tailwind CSS 主题的写作蓝本。**7 阶段 · 12 章**：从 Tailwind 项目史 + 同代人横评（P1）→ Utility-first 心智（P2）→ JIT/Oxide 引擎与 CSS-first 配置（P3）→ 现代 CSS 特性（P4）→ 响应式 + 变体系统（P5）→ 组件模式与类名管理（P6）→ 生态决策与同代人收束（P7）。
> 编写日期：2026-05-07（首版）｜目标版本：Tailwind v4.2（主线）/ v3.4（存量）

---

## 元信息

- **目标版本**：
  - **Tailwind CSS v4.2**（2026 主线，2026-02-18 发布）—— Oxide 引擎稳定 + Webpack plugin + 4 个新色板（mauve/olive/mist/taupe）+ logical property utilities + 编译再快 3.8×
  - **Tailwind CSS v4.0/v4.1**（2025 主线）—— v4.0 (2025-01) Oxide 首发 + CSS-first 配置 + 现代 CSS 特性；v4.1 (2025-04) text-shadow + mask 等
  - **Tailwind CSS v3.4**（仍大量在用的存量主线）—— JIT 引擎 + JS-based 配置 + 与 shadcn/ui 老版本兼容路径
  - 历史回溯：2017 Adam Wathan blog "CSS Utility Classes and 'Separation of Concerns'" → 2017-11 v0.1 alpha → 2019 v1.0 → 2020 v2.0 + dark mode → 2021 v2.2 JIT engine（实验）→ 2021-12 v3.0 JIT 默认 + arbitrary values → 2022 v3.1-3.4 大量增量改进 → 2025-01 v4.0 Oxide 引擎 + CSS-first → 2026-02 v4.2
- **来源**：
  - [tailwindcss.com/docs](https://tailwindcss.com/docs)（官方文档全量）
  - [tailwindcss.com/blog](https://tailwindcss.com/blog)（每个版本的 release notes，是设计动机最权威来源）
  - [github.com/tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss)（仅 P3 引擎章涉及源码）
  - Adam Wathan blog（adamwathan.me）+ Twitter —— Tailwind 主作者，设计哲学最权威解读
  - "Refactoring UI" 书（Adam Wathan + Steve Schoger，design system 思想源头）
  - Tailwind Labs YouTube（每次 release 配视频深度讲解）
- **目标读者**：写过传统 CSS / Bootstrap / CSS Modules，听说 Tailwind 但还没建立心智的工程师；用 v3 项目想升 v4 但被 CSS-first 配置吓住的人；从 CSS-in-JS（styled-components / emotion）切 Tailwind 时想知道根因的工程师；评估 Tailwind vs UnoCSS / vanilla-extract 的 tech lead。
- **不是这个主题的读者**：
  - 完全没写过 CSS 的（先学 CSS 基础再来）
  - 想要"Tailwind 30 分钟入门"的（这里讲为什么这么设计、不讲配方）
  - 想抄一份完整 tailwind.config 的（链回官方 docs，不重复）

---

## 整体设计：7 阶段 · 沿"从写第一个 utility 到搭设计系统"展开

Tailwind 的核心问题：**让 utility-first 在团队规模化场景下能用、能维护、能演进**。这套框架 9 年来从"Adam Wathan 一个人的 blog 实验"演化到"事实标准 + Oxide Rust 引擎"，每一步都是回应"utility-first 在更大规模会不会崩"的具体证伪。我们按"从第一个 class 到搭一套设计系统"的链路展开 7 阶段。

| 阶段 | 章数 | 核心问题 |
|---|---|---|
| **P1 · Tailwind 是谁** | 2 | 项目史 2017-2026 + 同代人横评（vs Bootstrap / CSS-in-JS / UnoCSS / vanilla-extract / 纯 CSS）+ 4 个核心设计赌注 |
| **P2 · Utility-first 心智** | 2 | utility-first 哲学（constraints over creativity / no semantic naming / co-location）+ 设计 token / 约束系统怎么成为团队 design system |
| **P3 · 引擎与配置** | 2 | JIT 引擎（v2.2-v3）→ Oxide 引擎（v4，Rust 重写）演化；CSS-first 配置（@import / @theme / @utility）替代 tailwind.config.js |
| **P4 · 现代 CSS 特性** | 1 | cascade layers / @property / color-mix / OKLCH / container queries / :has() / native nesting —— Tailwind v4 怎么押注、为什么这是必要 |
| **P5 · 响应式 + 变体系统** | 2 | mobile-first 响应式 + 暗色模式策略；状态变体（hover/focus/aria/data/group/peer）+ arbitrary values + 自定义变体 |
| **P6 · 组件模式** | 1 | CVA + cn() + tailwind-merge + prettier-plugin-tailwindcss 完整组件变体管理工具链 |
| **P7 · 生态决策** | 2 | Tailwind UI / Headless UI / Catalyst / DaisyUI / shadcn/ui 横评；决策树 + 何时不用 + 设计系统对接 + 2027 展望 |

总计 **12 章 ≈ 75,000-85,000 字**，平均每章 6,500 字。**比重偏向 P2-P3-P5**（utility-first 心智 + 引擎演化 + 变体系统是日常主战场），P4 / P6 / P7 写得紧凑。

---

## 与既有主题的边界 ——「短重述 + 链回」原则

Tailwind 主题与已写主题有少量交叉，明确划界：

> ✅ **短重述**：1-3 句话点出"它在底层是什么 + 关键性质"
> ✅ **链回**：紧跟一句"详细的 X / Y / Z 请参考 [`主题/{phase}/{chapter}`]"
> ❌ **不要**直接抄一遍其他主题的论述

**关键边界**：

| 概念 | 在哪讲透 | 本主题里怎么处理 |
|---|---|---|
| 浏览器渲染 / CSS layout / GPU 合成 | `browser-rendering/` 主题 | 链回，P4 讲 cascade layers / will-change 时短重述 |
| Web Vitals（LCP / CLS / INP） | `browser-rendering/04-vitals/` | 链回，P5 讲响应式 + 字体策略时点 |
| Vite plugin 系统 | `vite/07-plugins-and-next/01-plugin-system.html` | 链回，P3.2 讲 @tailwindcss/vite 时点 |
| Next.js next/font 字体优化 | `next/07-deploy-ecosystem/02-ecosystem-decision.html` | 链回，P5 讲 typography 时点 |
| React 19 / JSX / Server Components | `react/` 主题 | 链回，P6 讲 CVA + className 时短重述 |
| Turbopack 编译 | `next/06-turbopack/01-turbopack-bundlers.html` | 链回，P3.2 讲 Tailwind 在 Next.js 编译流程时短重述 |
| TypeScript 模板字面量 | `typescript/` 主题 | 链回，P6 讲 CVA 类型推导时点 |
| Bun runtime（Tailwind 跑在 Bun 上）| `bun/` 主题 | 链回（少用，仅 P3 提一笔） |

---

## 内容覆盖原则 ——「tailwindcss.com 系统化 + Adam Wathan 一手」

Tailwind 领域的特点：**主流哲学由 Adam Wathan 个人长期推动**——他的 blog（adamwathan.me）、"Refactoring UI" 书、Tailwind 官方 docs 都是同一套思想的不同呈现。所以写作时严格遵守：

**4 条规则**：

1. **API 定义优先官方文档**：表面 utility / 配置以 tailwindcss.com 为准。
2. **设计动机以 Adam Wathan 文章为准**：例如"为什么 utility-first"原文是 Adam 2017 年的 blog；写"为什么这么设计"必须回到一手出处。
3. **历史 / 退场以官方公告为准**：JIT 从实验到默认、Oxide 引擎、CSS-first 配置都有公开 release notes。
4. **性能数字必标条件**：v4 Oxide 引擎"快 3.5×-100×"必须标场景（首次 build / 增量 / project size），否则不写。

---

## 节奏建议

- **连读组**：
  - P1.1 + P1.2（项目史 → 同代人，理解 Tailwind 为什么会火 + 它在 CSS 生态里站哪）
  - P2.1 + P2.2（utility-first 哲学 → 设计 token，建立心智后再看引擎）
  - P3.1 + P3.2（JIT/Oxide 引擎 → CSS-first 配置，前者是怎么编译的、后者是怎么配置的）
  - P5.1 + P5.2（响应式 + 暗色 → 变体系统，构成完整的"如何应对屏幕 / 状态 / 数据"工具集）
- **可独立跳读**：
  - P4 现代 CSS、P6 组件模式、P7 生态决策
- **建议阅读顺序**：
  - **写业务 Tailwind 的工程师**：P2 → P5 → P6
  - **从 v3 升 v4 的人**：P1.1（看演进）→ P3（引擎 + 配置）→ P4（现代 CSS）
  - **tech lead / 选型者**：P1.2 → P7
  - **想深入引擎的好奇心**：P3.1 → P3.2 → P4

---

## 章节简述

> 下面每章列出**核心问题 + 关键内容 + 写作要点**。每章按 6 段模板（速览 → 底层逻辑 → 应用场景 → 典型代码 → 常见陷阱 → 延伸阅读）。

### P1 · Tailwind 是谁（2 章）

#### 1.1 Tailwind 项目史 2017-2026

- **核心问题**：Tailwind 怎么从一个"反主流"的 blog 实验变成事实标准？每个大版本的断代式重写解决了什么前一版的痛点？
- **关键节点**：
  - **2017-08** Adam Wathan 发表 blog "CSS Utility Classes and 'Separation of Concerns'"，挑战 BEM / SMACSS 的 semantic naming 主流
  - **2017-11** Tailwind v0.1 alpha，Adam + Jonathan Reinink + Steve Schoger 三人小组
  - **2019-05** v1.0 GA
  - **2020-11** v2.0 + 暗色模式 + 全新调色板
  - **2021-03** v2.2 引入 JIT engine（实验）—— 解决 v1-v2 时代"完整生成所有 utility 后再 purge"的慢
  - **2021-12** v3.0 JIT 成为默认 + arbitrary values（`w-[123px]`）+ 一切按需生成
  - **2022-2024** v3.1-3.4 大量增量（container queries / `@container` / `:has()` / aria 变体 / data 变体）
  - **2025-01** v4.0 Oxide 引擎首发（Rust 重写）+ CSS-first 配置（@theme / @utility 替代 JS config）
  - **2025-04** v4.1 text-shadow / mask 等增强
  - **2026-02** v4.2 Webpack plugin + 4 新色板 + logical properties + 编译再快 3.8×
- **关键转折点**：
  - **2017 utility-first 论战**：当时主流是 BEM + SMACSS + ITCSS，"semantic class"被视为 best practice；Adam 的 blog 引发激烈争论，但也吸引到一批工程师认同
  - **2021 JIT 革命**：v1-v2 时代 Tailwind 必须先生成所有可能 class（几 MB CSS）然后 purge；JIT 完全反转 —— 扫描源码，按需生成。这让 arbitrary values 成为可能
  - **2025 v4 重做**：JS-based 配置（tailwind.config.js）被骂多年（启动慢、类型差、看不到 CSS），v4 直接用 CSS-first 配置（@theme {} 在 CSS 里）+ Rust 引擎，是 Tailwind 历史上最大一次断代式重写
- **写作要点**：用一张时间线 SVG 串起来；每个节点配一句"它解决了什么前一版的痛点"。强调三次范式转移（2017 utility-first / 2021 JIT / 2025 Oxide + CSS-first）。

#### 1.2 同代人横评 + 设计哲学

- **核心问题**：Tailwind 在 CSS 生态里站哪？为什么它能在 9 年里把 Bootstrap / CSS-in-JS 都推到边缘？
- **同代人**：
  - **Bootstrap 5**：组件 + utility 双重模式，老牌生态；2026 仍在大量企业项目存量但增长几乎停滞
  - **CSS-in-JS**（styled-components / emotion / @emotion/css）：runtime 注入 CSS；React 18+ Concurrent Mode 让 runtime CSS-in-JS 出现 hydration 问题，2024 年起 Vercel 公开建议远离 runtime CSS-in-JS
  - **vanilla-extract**：build-time CSS-in-TS，类型安全；TS-first 团队优先；与 Tailwind 不冲突可共存
  - **UnoCSS**：原子化 CSS 引擎，"Tailwind 兼容预设"+ 零运行时；与 Vue / Vite / Astro 生态原生集成；性能更激进但生态比 Tailwind 小
  - **CSS Modules**：scoped CSS（class hash），与 Next.js / Vite 原生支持；适合"组件局部样式"场景，不解决 design system 问题
  - **纯 CSS / Sass**：仍有大量项目；Sass 增长几乎停滞（CSS native nesting + custom properties 已能覆盖 90% 用例）
  - **Pico / Tachyons / Bulma**：小众，几乎不竞争主流场景
- **横评维度**：
  - 心智模型（utility 还是 component）
  - 配置方式（CSS / JS / TS / 无配置）
  - 编译时机（build-time / runtime / 混合）
  - 生态规模（社区组件库 / 团队接受度）
  - design system 友好度
  - 性能（编译速度 + bundle 大小）
- **Tailwind 的 4 个核心设计赌注**：
  1. **Utility-first 不 semantic-first**：class name 描述视觉效果（`bg-blue-500`），不描述语义（`primary-button`）。这是 Tailwind 最大的文化赌注，也是初学者最不接受的
  2. **Constraints over creativity**：默认提供有限的 spacing scale / color palette / breakpoints，不让你随便写 `padding: 13px`。约束让团队风格一致
  3. **No semantic class abstraction**：不像 Bootstrap 提供 `.btn-primary`，让你每次都写完整 utility 串。看似冗长但消除"这个 class 在改什么"的认知负担
  4. **Co-location with markup**：CSS 与 HTML / JSX 并排写，不分离。与 React / JSX 的"组件 = 视觉 + 行为"哲学高度契合，这是 Tailwind 在 React 生态爆火的根因
- **2026 现状**：
  - 新项目大约 **70-80% 用 Tailwind**（含 React / Vue / Svelte / Astro 生态）
  - **15% 用 CSS Modules / 纯 CSS / Sass**（文档站 / 老团队 / 内容站）
  - **5% 用 vanilla-extract / UnoCSS**（特殊偏好团队）
  - **CSS-in-JS（runtime）几乎被新项目放弃**（Concurrent Mode + RSC 不兼容）
- **何时不选 Tailwind**：
  - 强烈反 utility-first 文化的团队
  - 不能改 HTML 的场景（CMS 输出 / 邮件模板）
  - 极小项目（不值得引入工具链）
- **写作要点**：横评要有具体决策矩阵；每个对手的优势必须客观写；最后一段给"我推荐 X，因为 Y"的强观点。

---

### P2 · Utility-first 心智（2 章）

#### 2.1 Utility-first 哲学 + co-location

- **核心问题**：utility-first 反直觉的地方是什么？为什么 BEM / semantic naming 反而有问题？
- **核心论点**（来自 Adam 2017 blog）：
  - **semantic CSS 的悖论**：你写 `.author-bio` 然后包 `.author-name` `.author-photo`；下个组件叫 `.user-card` 包 `.user-name` `.user-avatar`；其实它们样式一模一样。**class name 与样式没有 1:1 关系**
  - **抽象层级错位**：semantic naming 假设"组件名稳定 + 样式稳定"，但实际产品迭代中两者都在变。"author-bio"今天是 card、明天是 list item，semantic class 跟不上
  - **utility 让"重命名组件"零成本**：把 author-bio 改名 user-card，不需要改任何 CSS（class 都是 utility）
- **co-location 的根因**：
  - 与 React / JSX 的"componnet 是视觉 + 行为单元"哲学契合
  - 改样式不需要在 CSS 文件和 JSX 文件之间跳转
  - "改这个组件外观"的所有上下文在一个文件里
- **utility-first 的常见反对**：
  - "HTML 看起来很丑" → 工具能解决（prettier-plugin-tailwindcss 自动排序、可读性其实不差）
  - "重复 utility 串" → CVA / @apply / 组件抽取解决
  - "不能复用样式" → 组件复用 = 样式复用，比 class 复用更稳健
- **@apply 反模式**：很多人迁 Tailwind 时把 utility @apply 成 semantic class（`.btn { @apply px-4 py-2 ... }`），这是 anti-pattern —— 你又回到了 semantic naming 的世界，失去 Tailwind 大部分价值。正确做法是抽 React component
- **关键代码示例方向**：
  - 同一个 card 用 BEM 和 Tailwind 写的对比
  - @apply 反模式 + 修复（改 component）
  - "样式与组件 1:1 强耦合"的反模式
- **写作要点**：本章是 Tailwind 心智的根基，必须用具体例子讲清；强调"class name 不是样式的语义、组件才是"。

#### 2.2 设计 token 与约束系统

- **核心问题**：Tailwind 的 spacing / color / typography 默认值怎么设计的？为什么"约束"反而能提升效率？
- **默认 token 系统**：
  - **Spacing scale**（基于 0.25rem = 4px 单位的 0/0.5/1/1.5/2/2.5/3/4/5/6/8/10/12/16/20/24...）—— 不让你随便写 13px
  - **Color palette**（v4 + 24 个颜色家族 × 11 个 shade，OKLCH 色彩空间，2025 重做）
  - **Typography**（text-xs/sm/base/lg/xl/2xl... 含 font-size + line-height 配对）
  - **Breakpoints**（sm 640px / md 768px / lg 1024px / xl 1280px / 2xl 1536px，mobile-first）
  - **Z-index**（0/10/20/30/40/50 + auto）
  - **Border radius**（none/sm/md/lg/xl/2xl/3xl/full）
- **OKLCH 色彩空间**（v4 重要变化）：
  - 比 HSL / sRGB 更 perceptually uniform（颜色明度跨色相一致）
  - 支持 P3 / Rec.2020 wide gamut
  - 浏览器支持 95%+（2026）
- **约束怎么帮设计**：
  - 设计师不需要纠结"是 14px 还是 15px"，scale 强制选 12 / 14 / 16
  - 一个团队全用同一套 spacing，视觉一致
  - 改主题（dark mode / 品牌色变更）只改 token，不动 component
- **设计 token 与 design system 的关系**：
  - Tailwind 的 token 系统就是一套 design system 的实现
  - 大型团队可以扩展（@theme 加自家 token）
  - 与 Figma 设计 token 对接（生成 / 同步工具）
- **关键代码示例方向**：
  - 默认 spacing scale 的视觉示意
  - 自定义 token（@theme 或 v3 的 tailwind.config）
  - OKLCH vs HSL 颜色对比示例
  - Figma token → Tailwind token 同步流程
- **写作要点**：强调"约束是优势不是限制"；用真实例子讲为什么 0.25rem 单位 + 调色板这种设计是经过深思熟虑的。

---

### P3 · 引擎与配置（2 章）

#### 3.1 JIT 引擎演化 → Oxide 引擎

- **核心问题**：Tailwind 怎么把"一个项目用了 X 个 utility class"识别出来 + 编译成最终 CSS？JIT 和 Oxide 在做什么？
- **v1-v2.2 时代（2019-2021）**：
  - 启动时生成"所有可能的 utility"（几 MB CSS），然后用 PurgeCSS 扫源码删未用的
  - 慢（启动几秒-几十秒）+ 不能 arbitrary values
- **JIT 引擎（v2.2-v3，2021-2024）**：
  - JS 实现，扫源码，提取 class 字符串，按需生成对应 CSS
  - 支持 arbitrary values（`w-[123px]` / `bg-[#123456]`）
  - 性能：完整 build 1-3 秒、增量 50-200ms
- **Oxide 引擎（v4，2025+）**：
  - Rust 重写（与 SWC / Turbopack 同时代的 Rust 重写浪潮）
  - 完整 build 100-200ms（v3 的 1/5）
  - 增量 build 5ms（v3 的 1/40）
  - 与 Vite / Webpack / Turbopack 通过专用 plugin 集成
- **扫描算法核心**：
  - 不解析整个 HTML / JSX AST（太慢）
  - 用<strong>正则 + 规则</strong>识别可能是 class 的字符串
  - 误判可接受（生成 unused CSS 不严重）；漏判不可接受（缺 class）
  - "<a class={cn(...)}>" 这种动态 class 必须能识别 —— Tailwind 用 `safelist` / `// tailwind: ...` 指令补充
- **关键代码示例方向**：
  - v2 vs v3 JIT vs v4 Oxide 速度对比
  - Tailwind 怎么处理 React `className={isActive ? 'bg-blue-500' : 'bg-gray-200'}`
  - 动态 class 不被扫描的反例 + safelist 修复
- **写作要点**：唯一允许引用 Tailwind 源码的章；强调 Rust 重写是 web 工具链 2024-2026 大潮的一部分（与 Turbopack / SWC / Rolldown / Biome 同时代）。

#### 3.2 CSS-first 配置（v4 革命）

- **核心问题**：v4 为什么把配置从 tailwind.config.js 全部搬到 CSS？@theme / @utility / @custom-variant 怎么用？
- **v3 时代痛点**（用 tailwind.config.js）：
  - JS-based 配置启动慢（要跑一次 Node / require）
  - 类型推导差（虽然有 @types 但 IDE 不能跳转 token）
  - 与 CSS / 浏览器解耦（开发者要在 JS 心智和 CSS 心智之间切换）
  - Theme 配置在 JS 文件，但实际产物是 CSS 变量，中间转换层让人困惑
- **v4 CSS-first 配置**：
  ```css
  @import "tailwindcss";

  @theme {
    --color-brand: oklch(0.7 0.15 240);
    --spacing-em: 1em;
    --font-display: "Inter Display", sans-serif;
  }

  @utility tab-* {
    tab-size: --value(--tab-size-*);
  }

  @custom-variant dark (&:where(.dark, .dark *));
  ```
- **核心指令**：
  - **@import "tailwindcss"** —— 替代 v3 的 `@tailwind base/components/utilities`
  - **@theme {}** —— 定义设计 token，生成 CSS 变量 + 注册 utility（`--color-brand` → `bg-brand` / `text-brand` / `border-brand`）
  - **@utility {}** —— 定义自定义 utility，可以参数化（v4 新）
  - **@custom-variant** —— 定义自定义变体（替代 v3 的 plugin variant）
  - **@source** —— 显式指定扫描路径（替代 v3 的 content 配置）
- **从 v3 迁 v4**：
  - tailwindcss/upgrade codemod 自动迁移 80%
  - tailwind.config.js 仍可用（兼容模式），但官方不推荐新项目
  - 颜色 / spacing scale 的默认值有微调（OKLCH 色彩空间），需检查视觉
  - @apply 仍可用（虽然不推荐），@layer 语法变化
- **与 build tool 集成**：
  - **Vite**：`@tailwindcss/vite` plugin（推荐）
  - **PostCSS**：`@tailwindcss/postcss`（兼容传统 PostCSS pipeline）
  - **Webpack**：`@tailwindcss/webpack`（v4.2 新增）
  - **Next.js**：自带集成，零配置
- **关键代码示例方向**：
  - v3 tailwind.config.js → v4 @theme 完整迁移示例
  - 自定义 @utility（如 `tab-2 / tab-4`）
  - 与 Vite plugin 集成 next.config 写法
- **写作要点**：CSS-first 是 v4 最大革命，必须讲清"为什么从 JS 转 CSS"+"具体怎么写"。链回 vite / next 主题的 plugin 章节。

---

### P4 · 现代 CSS 特性（1 章）

#### 4.1 cascade layers / @property / color-mix / OKLCH / container queries / :has() / nesting

- **核心问题**：Tailwind v4 押了哪些现代 CSS 特性？为什么？这些特性怎么改变 CSS 的写法？
- **Native CSS Nesting**：
  - 2023-2024 年 95%+ 浏览器支持
  - Tailwind v4 用 native nesting 编译输出，不再需要 PostCSS 的 nested syntax
- **Cascade Layers (@layer)**：
  - 2022 GA，让 CSS 的 cascade 优先级可显式分层
  - Tailwind v4 用 cascade layers 组织 base / components / utilities，避免与 user CSS 冲突
- **@property 注册自定义属性**：
  - 让 CSS 变量有类型 + 默认值 + 可动画
  - Tailwind v4 用 @property 注册所有 theme 变量（让 transition / animation 可作用于 theme color 变化）
- **color-mix() 函数**：
  - 在两种颜色间插值
  - Tailwind v4 用它实现 opacity 修饰符（`bg-blue-500/50`）
- **OKLCH 色彩空间**：
  - perceptually uniform，跨色相明度一致
  - 支持 wide gamut（P3 / Rec.2020）
  - Tailwind v4 默认调色板全用 OKLCH 重做
- **Container Queries (`@container`)**：
  - 2023 GA，让样式响应"容器尺寸"而不是"viewport 尺寸"
  - Tailwind v3.2 起支持（`@sm:` 等容器前缀）；v4 first-class
- **`:has()` 选择器**：
  - "父元素含特定子元素时应用样式"，CSS 第一次有真正的 parent selector
  - Tailwind v3.4 起支持（`has-[...]:` 变体）
- **logical properties**（v4.2 新）：
  - inset-s / inset-e / inset-bs / inset-be 等支持 RTL / 双向布局
- **写作要点**：本章是"Tailwind v4 押 CSS 而非 JS"的具体表达；每个特性配 1 段代码示例；强调 v4 之所以能 Rust 重写 + CSS-first，前提是浏览器现代 CSS 已经成熟。链回 browser-rendering 主题。

---

### P5 · 响应式 + 变体系统（2 章）

#### 5.1 响应式策略 + 暗色模式

- **核心问题**：Tailwind 的 mobile-first 响应式怎么用？暗色模式有几种实现策略？v4 container queries 怎么改写"组件级响应式"？
- **Mobile-first 响应式**：
  - 默认是最小尺寸样式，breakpoint 前缀（`sm:` / `md:` / `lg:`）应用更大尺寸
  - 与传统 desktop-first 媒体查询相反
  - 心智："写无前缀的样式 = 移动端"，前缀逐级覆盖
- **Breakpoint 默认值**（v4）：
  - sm 640px / md 768px / lg 1024px / xl 1280px / 2xl 1536px
  - v4 默认值微调（与 v3 略有差异）
- **Container Queries（@container）**：
  - 让组件响应"父容器尺寸"而非"viewport 尺寸"
  - 卡片在 sidebar 里小一点、在主区大一点 —— 容器查询解决
  - 语法：`@container (min-width: 400px) { ... }`；Tailwind 用 `@sm:` `@md:` 容器前缀
- **暗色模式 3 种策略**：
  - **media 策略**（默认）：基于 `prefers-color-scheme`，跟随系统
  - **class 策略**：在 root 加 `.dark` class，js 控制
  - **selector 策略**（v4 新）：用 `@custom-variant dark (&:where(.dark, .dark *))` 自定义
- **与 next-themes / use-system-theme 集成**：
  - next-themes 是 React 生态最流行的暗色 toggle 库
  - 配合 `class` 策略 + localStorage 持久化
- **关键代码示例方向**：
  - mobile-first 响应式 layout（grid 在 md / lg 不同列数）
  - container queries 实现"卡片在不同容器大小响应"
  - next-themes 完整集成 + 持久化
- **写作要点**：强调 mobile-first（很多新人错把 Tailwind 当 desktop-first 用）+ container queries 的"组件级响应"威力。

#### 5.2 状态变体 + 自定义变体 + arbitrary values

- **核心问题**：Tailwind 的变体系统是什么？hover / focus / aria / data / group / peer 怎么用？arbitrary values 何时用？
- **基础状态变体**：
  - `hover:` / `focus:` / `focus-within:` / `focus-visible:` / `active:` / `disabled:`
  - 与原生 CSS 伪类一一对应
- **结构变体**：
  - `first:` / `last:` / `odd:` / `even:` / `nth-3:` / `empty:`
  - 大幅减少 JS 计算 className 的需求
- **群组 / 同级变体**（重要）：
  - **group-hover:** —— 父元素 hover 时子元素应用样式；要先在父元素加 `group` class
  - **peer-checked:** —— 同级元素 checked 时应用样式；要先在 peer 元素加 `peer` class
  - 解决"无 JS 实现 hover 联动"的常见需求
- **数据 / aria 变体**：
  - `data-[state=open]:` —— 配合 Radix UI 的 data attributes
  - `aria-[checked=true]:` —— a11y 友好
- **`:has()` 变体**（v3.4+）：
  - `has-[input:checked]:bg-blue-500` —— 父元素含选中 input 时变蓝
- **Arbitrary values**（v3+）：
  - `w-[clamp(20rem,30vw,40rem)]` —— 任意值 escape utility 系统
  - 何时用：临时一次性值；不要滥用，否则 design system 失去约束
- **自定义变体**（v4）：
  - `@custom-variant theme-light (&:where([data-theme=light], [data-theme=light] *))`
- **关键代码示例方向**：
  - group-hover 实现"hover 卡片显示按钮"
  - peer-checked 实现"checkbox 控制兄弟显示"
  - data-[state=open]: 与 Radix Dialog 集成
  - arbitrary values vs 扩展 theme 的判断
- **写作要点**：变体系统是 Tailwind 强大的根因之一；强调 group / peer / has 让"无 JS 实现复杂交互"成为可能。

---

### P6 · 组件模式（1 章）

#### 6.1 CVA + cn() + tailwind-merge + prettier-plugin

- **核心问题**：怎么管理"一个组件有多种变体（primary / secondary / outline / ghost）"？怎么处理类名冲突？怎么让 className 字符串可读？
- **CVA（class-variance-authority）**：
  - 类型安全的组件变体管理标准模式
  - 由 Joe Bell 设计，shadcn/ui 推广
  - 替代 classnames + 自己拼字符串的老模式
- **cn() helper**（来自 shadcn/ui）：
  - 内部用 clsx + tailwind-merge
  - 让条件 className 可读
- **tailwind-merge**：
  - 解决"两个冲突 class 怎么办"（如 `px-4 px-6`，期望后者 override）
  - 内部理解 Tailwind 的 utility 优先级规则
- **prettier-plugin-tailwindcss**：
  - 自动按 Tailwind 推荐顺序排列 class
  - 团队代码 review 一致性
- **完整组件模板**：
  ```tsx
  import { cva, VariantProps } from 'class-variance-authority';
  import { cn } from '@/lib/utils';

  const buttonVariants = cva(
    'inline-flex items-center justify-center rounded-md text-sm font-medium ...',
    {
      variants: {
        variant: {
          primary: 'bg-blue-500 text-white hover:bg-blue-600',
          secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
          outline: 'border border-gray-200 hover:bg-gray-100',
          ghost: 'hover:bg-gray-100',
        },
        size: {
          sm: 'h-8 px-3 text-xs',
          md: 'h-10 px-4',
          lg: 'h-12 px-6 text-base',
        },
      },
      defaultVariants: { variant: 'primary', size: 'md' },
    }
  );

  type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

  export function Button({ className, variant, size, ...props }: ButtonProps) {
    return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  }
  ```
- **关键代码示例方向**：
  - CVA + Button 完整实现
  - 用 cn() 处理 className 冲突
  - tailwind-merge 行为示例
  - prettier-plugin-tailwindcss 配置
- **写作要点**：本章是"Tailwind 在团队规模化下怎么不崩"的关键工具链；CVA + cn 是 shadcn/ui 时代的事实标准模式。链回待写 shadcn/ui 主题。

---

### P7 · 生态决策（2 章）

#### 7.1 Tailwind UI / Headless UI / Catalyst / DaisyUI / shadcn/ui 横评

- **核心问题**：用 Tailwind 时还要不要选 UI 库？这些库各自是什么定位？
- **官方生态**：
  - **Tailwind UI**：Tailwind Labs 商业组件库（299$/lifetime），HTML / React / Vue 三版本；样式精美，用作设计参考
  - **Headless UI**：Tailwind Labs 开源 unstyled 组件（Dialog / Popover / Listbox 等），与 Tailwind 配合
  - **Catalyst**：Tailwind Labs 商业 React UI kit，比 Tailwind UI 更工程化（带 component），需要 Tailwind UI 订阅
- **shadcn/ui**（最重要）：
  - 不是 npm 包，是"组件代码 copy-paste"模式 —— 用 CLI 把组件源码复制到你的项目
  - 基于 Radix UI（headless 行为）+ Tailwind（样式）
  - 不能升级，但代码完全在你项目里、可任意修改
  - 2024-2026 React 生态事实标准；与 Next.js / React Router 都兼容
  - **本主题 P7.1 短重述、详细单独写 shadcn/ui 主题**（待写）
- **DaisyUI**：
  - Tailwind plugin，提供 semantic class（`.btn` / `.card`）
  - 与 utility-first 哲学有冲突，但对从 Bootstrap 迁来的人友好
  - 适合不接受 utility 串的团队
- **NextUI / Mantine**：
  - 不基于 Tailwind 的 React UI 库，作为对照
- **Tailwind Components / Tailwind Toolbox**：
  - 社区免费组件示例，参考价值
- **横评维度**：
  - 是否提供组件还是只 utility
  - 是否需要 license
  - 是否可深度定制
  - 是否可升级
  - 与 Tailwind 哲学的契合度
- **2026 实战分布**：
  - 新 React 项目 60%+ 用 shadcn/ui
  - 20% 用 Tailwind UI / Catalyst（商业项目能买）
  - 10% 用 DaisyUI（小项目 / Bootstrap 移民）
  - 10% 自己拼 Tailwind + Headless UI
- **写作要点**：本章避免成为"组件库目录"；重点讲每个库的<strong>定位</strong>和<strong>何时用</strong>；shadcn/ui 是重点（它已经是事实标准）。

#### 7.2 决策树 + 何时不用 + 设计系统对接 + 2027 展望

- **核心问题**：什么时候 Tailwind 是对的选择？什么时候应该选别的？怎么对接 Figma / 设计 token？
- **何时用 Tailwind**：
  - React / Vue / Svelte / Astro 应用（接受 utility-first）
  - 团队多人协作，需要约束统一风格
  - 起步快 + 长期维护可控
  - 与 shadcn/ui 配合 = React 生态最强组合
- **何时不用 Tailwind**：
  - **CMS 输出 / 邮件模板**（不能改 HTML class）→ 用 inline CSS 或 Sass
  - **极小项目**（5 页营销站）→ 一份纯 CSS 更轻
  - **强烈反 utility-first 文化**（团队就是不接受）→ 别强推
  - **Web Components 内部样式**（Shadow DOM 隔离）→ 限制多
- **设计系统对接**：
  - **Figma → Tailwind token**：用 Tokens Studio plugin / Figma Variables 同步到 @theme
  - **Tailwind token → Figma**：反向同步（少见）
  - **多品牌**：用 CSS variables 在 root 切（@theme 定义 --color-brand，不同品牌覆盖）
- **大型项目踩坑总结**：
  - 不要 @apply 滥用（变成 semantic class）
  - 动态 class 用 safelist
  - 团队建议每个项目早期定义"自己的 token 扩展"，不要直接用默认
  - prettier-plugin 是必须装的（不装代码 review 会乱）
  - eslint-plugin-tailwindcss 帮 catch 错误 class
- **2027 展望**：
  - **Oxide 引擎进一步成熟**（Rust 工具链 + Wasm 部署）
  - **CSS native nesting + cascade layers + container queries 完全主流**，Tailwind 会更多采用
  - **shadcn/ui v3+ 生态稳定**（从 React 扩到其他框架）
  - **AI 辅助 utility 生成**（Cursor / Claude / GitHub Copilot 已能流畅写 Tailwind）
- **写作要点**：本章是<strong>实战决策章</strong>；给"看场景选什么"的决策矩阵；最后给"我推荐 X，因为 Y"的强观点收尾。链回 shadcn/ui 待写主题 + Next.js / Vite / Bun / 测试主题。

---

## 写作风格 ——「写文章人，不是建筑师」

> （遵循已有约定）

- **章节内部**：6 段模板（速览 → 底层逻辑 → 应用场景 → 典型代码 → 常见陷阱 → 延伸阅读）
- **跨章引用**：用「短重述 + 链回」，不抄不省
- **图示**：utility-first vs semantic 对比图 / spacing scale 视觉示意 / OKLCH 色相图 / cascade layers 图 / 全用 SVG
- **代码示例**：每章 5-10 段可运行的真实代码（基于 v4.2 主线，部分 v3 对照）
- **加粗（克制）**：每章 ≤ 25 个 `<strong>`；每段不超过 1-2 个；不要靠加粗散点高亮"我觉得重要"的描述句
- **避免**：
  - 罗列 utility 文档（链回官方）
  - "架构师式"分类标签（X 派 / Y 流）
  - 中立到没观点（每章必须给"我推荐 X，因为 Y"）
  - 抄 PPT / 抄 release notes（设计动机要回到 Adam Wathan blog 一手）
- **观点强度**：
  - 强观点（"@apply 滥用是反模式"，"CSS-in-JS runtime 模式应该被淘汰"）
  - 弱观点（"暗色模式 class vs media 看场景"）
  - 不观点（"DaisyUI 也是好选择，存量项目继续用"）

---

## 不写的内容（明确划线）

- **不讲**：
  - 完整 utility 文档（链回 tailwindcss.com）
  - Bootstrap 完整教程
  - 纯 CSS 全套（链回 browser-rendering 主题）
  - 完整 shadcn/ui 组件 catalog（待写 shadcn/ui 主题）
- **链回但不重复**：
  - 浏览器渲染 / GPU 合成（链回 browser-rendering）
  - Vite plugin（链回 vite）
  - Turbopack（链回 next）
  - React 19（链回 react）
- **暂占位（待写主题）**：
  - shadcn/ui + Radix UI 完整深度（独立主题）
  - 详细 Figma → 代码 design system 工作流（独立主题）

---

## 路线图

- **Step 1**：本 outline.md 经用户审定 ← **当前**
- **Step 2**：建 8 个文件骨架（`tailwind/index.html` + 7 个 phase 目录的 `index.html`）
- **Step 3**：P1 章节正文（项目史 + 同代人横评，2 章）
- **Step 4**：P2 章节正文（utility-first + 设计 token，2 章）
- **Step 5**：P3 章节正文（JIT/Oxide 引擎 + CSS-first 配置，2 章）
- **Step 6**：P4 章节正文（现代 CSS 特性，1 章）
- **Step 7**：P5 章节正文（响应式 + 变体系统，2 章）
- **Step 8**：P6 章节正文（CVA + cn + tailwind-merge，1 章）
- **Step 9**：P7 章节正文（生态决策树，2 章）+ 站点首页卡片改 done

---

## 与 index.html 卡片的对应

Tailwind 主题在站点首页的卡片描述（草拟）：
> 7 阶段 / 12 章：项目史 + 同代人横评 + utility-first 心智 + 设计 token / 约束系统 + JIT → Oxide 引擎演化 + CSS-first 配置（v4 革命） + 现代 CSS 特性 + 响应式 + 变体系统 + CVA + cn 组件模式 + 生态决策（vs UnoCSS / vanilla-extract / shadcn 集成）。锁定 Tailwind v4.2 主线（Oxide / @theme / OKLCH / container queries）。
