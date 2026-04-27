# 技术深度学习 · Deep Dive

面向研发工程师的多主题深度学习资源集合。每个知识点按统一 6 段模板组织：速览 → 底层逻辑 → 应用场景 → 典型代码 → 常见陷阱 → 延伸阅读。

## 主题清单

| 主题             | 状态        | 来源                                                                | 章节数            |
| ---------------- | ----------- | ------------------------------------------------------------------- | ----------------- |
| **JavaScript**   | ✅ 完成     | [javascript.info](https://javascript.info/)                         | 62 章 / 7 阶段    |
| **TypeScript**   | ✅ 完成     | [typescriptlang.org/docs](https://www.typescriptlang.org/docs/)     | 20 章 / 4 Part    |
| **ECMAScript**   | 🚧 编写中   | [ecma-international.org/ecma-262](https://ecma-international.org/publications-and-standards/standards/ecma-262/) | 11 章 / 2 轨（历史脉络 + 规范精读）|
| **Tailwind CSS** | ⏳ 规划中   | [tailwindcss.com/docs](https://tailwindcss.com/docs)                | 待定              |
| **V8 Engine**    | ⏳ 规划中   | [v8.dev/docs](https://v8.dev/docs)                                  | 待定              |

## 如何打开

**方式 1 — 直接双击**

浏览器直接打开 `index.html` 即可。所有资源（CSS/JS）都是相对路径引用，不需要 HTTP 服务器。

**方式 2 — 本地静态服务（推荐）**

某些浏览器对 `file://` 协议有限制（例如 `localStorage` 跨页面不共享），用本地服务器更稳：

```bash
# Python
cd docs/learning/deep-dive && python3 -m http.server 4321

# Node
npx serve docs/learning/deep-dive -p 4321

# Bun
bunx serve docs/learning/deep-dive -p 4321
```

然后访问 http://localhost:4321/

## 目录结构

```
docs/learning/deep-dive/
├── index.html                  # 主 hub（多主题入口）
├── README.md                   # 本文件
├── assets/                     # 跨主题共享
│   ├── styles.css              # 全站样式（明暗模式、OKLCH 色板、响应式）
│   ├── app.js                  # 主题切换、语法高亮、复制按钮、on-page TOC
│   └── favicon.svg
├── templates/
│   └── chapter.html            # 章节模板（复制起点）
│
├── javascript/                 # ✅ JavaScript 主题（62 章）
│   ├── index.html              # JS hub
│   ├── 01-fundamentals/        # P1 语言基础
│   ├── 02-advanced/            # P2 高阶语言
│   ├── 03-async/               # P3 异步 & 错误处理
│   ├── 04-modules/             # P4 模块 & 元编程
│   ├── 05-dom/                 # P5 DOM & 事件
│   ├── 06-network/             # P6 网络 & 存储
│   └── 07-advanced/            # P7 高级专题
│
├── typescript/                 # ✅ TypeScript 主题（20 章）
│   ├── index.html              # TS hub
│   ├── 01-handbook-basics/     # Part 1 · Handbook 基础（6 章）
│   ├── 02-type-manipulation/   # Part 2 · 类型操作（6 章）
│   ├── 03-reference/           # Part 3 · Reference（5 章）
│   └── 04-project/             # Part 4 · 工程化（3 章）
│
├── ecma/                       # 🚧 ECMAScript 主题（编写中，2 轨独立）
│   ├── index.html              # ES hub
│   ├── outline.md              # 写作蓝本
│   ├── 01-history/             # Track A · 历史脉络与设计（5 章）
│   └── 02-spec/                # Track B · ECMA-262 规范精读（6 章）
│
├── tailwindcss/                # ⏳ 规划中
└── v8/                         # ⏳ 规划中
```

每个主题目录下都有 `index.html`（主题首页）+ 阶段子目录；阶段目录下有 `index.html`（阶段概览 + 侧边栏）+ 编号章节文件。

## 章节模板规范

每章必须有下列 6 个 `<h2>`，顺序不变，id 与 `h-num` 徽标固定：

| id          | 徽标 | 标题     | 用途                                |
| ----------- | ---- | -------- | ----------------------------------- |
| `quick`     | 01   | 速览     | 1-3 句话定义 + 最小代码             |
| `internals` | 02   | 底层逻辑 | 引擎/规范/类型系统视角，"为什么是这样" |
| `usage`     | 03   | 应用场景 | 框架/Node/工具链里的真实案例        |
| `examples`  | 04   | 典型代码 | 可运行示例 + corner case            |
| `pitfalls`  | 05   | 常见陷阱 | 踩坑案例 + 规避方法                 |
| `further`   | 06   | 延伸阅读 | 规范链接、原站链接、相关章节        |

约束：

- **代码块**用 `<div class="code-block"><pre class="code"><code class="lang-js">…</code></pre></div>` 结构；`app.js` 会自动高亮和添加复制按钮。TS 章节用 `class="lang-ts"`。
- 代码中的 `<`、`>`、`&` 必须写成 `&lt;`、`&gt;`、`&amp;`。
- **callout**：`.callout.info | .warn | .danger | .success` 四色。
- **场景卡** `.scenario`；**陷阱块** `.pitfall`。完整片段速查见 `templates/chapter.html` 底部注释。
- **on-page TOC** 右侧导航自动从 h2/h3 生成，章节 HTML 里保留空 `<ul></ul>` 即可。

## 路径约定

- **章节页**（`{topic}/{phase}/{chapter}.html`）引用 `../../assets/styles.css`、`../../assets/app.js`
- **阶段首页**（`{topic}/{phase}/index.html`）同上
- **主题首页**（`{topic}/index.html`）引用 `../assets/...`
- **主 hub**（`deep-dive/index.html`）引用 `assets/...`

跨主题/跨阶段链接：用相对路径，例如 TS 章节链回 JS 章节用 `../../javascript/{phase}/{chapter}.html`。

## 设计原则

1. **面向研发工程师，跳过入门介绍** —— "什么是变量"这类内容不写；把篇幅留给引擎/规范/类型系统层面的机制。
2. **每个知识点都要有"为什么"** —— 底层逻辑段落是灵魂，没有它的章节视为未完成。
3. **每个知识点都要有"在哪儿用"** —— 应用场景至少 2-3 个来自现代框架/Node/工具链的真实案例。
4. **每个陷阱都要有根因** —— 不只写"这样会错"，还要写"为什么会错"。
5. **零依赖** —— 纯 HTML/CSS/JS，无构建、无 npm 包、无 CDN 引用，永久可离线打开。

## 技术选择

- **无框架**：纯静态 HTML 多页，每页独立可读。
- **CSS 设计 token**：明暗模式由 `prefers-color-scheme` + `data-theme` 覆盖，颜色用 OKLCH 便于一致调整。
- **语法高亮**：自写 JS tokenizer（`assets/app.js`），覆盖关键字、字符串、数字、注释、函数调用、属性访问。TypeScript 章节会扩展 tokenizer 支持 TS 关键字（`interface`、`type`、`as`、`satisfies`、`infer`、`keyof` 等）。
- **主题持久化**：`localStorage` 存用户选择，无则跟随系统。
- **a11y**：skip link、语义化 landmark（header/nav/main/article/aside）、`:focus-visible` 描边、`prefers-reduced-motion` 尊重。

## 状态与路线图

- ✅ JavaScript（62 章，2026-04 完成）
- ✅ TypeScript（20 章 / 4 Part 完成）
- 🚧 ECMAScript（2 轨独立：历史脉络 5 章 + 规范精读 6 章；A1 + A2 + A3 已写完）
- ⏳ Tailwind CSS / V8（规划中，需后续单独研究）

## 与 Mira 项目的关系

这是一个独立学习资源，**不是** Mira 产品的一部分。因此：

- 不应用 Mira 的 `design-system.md` 色板约束（字体、颜色、间距都是学习站点自选）
- 不引入 Mira 的 `@/lib`、`@mira/shared` 等包
- 不需要过 Mira 的 lint / build 流程

如果未来想把它变成项目的一部分（例如放进 `apps/mira-site` 的 Fumadocs），需要按 Mira 设计系统重写样式。
