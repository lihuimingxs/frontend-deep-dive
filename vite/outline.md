# Vite & 构建工具深度学习 · 章节大纲

> 本文件是 Vite & 构建工具主题的写作蓝本。**7 阶段 · 12 章**：从构建工具 30 年史 + 同代人横评（P1）→ Vite 双模架构 dev/build（P2）→ ESM vs CJS 模块系统（P3）→ Tree Shaking 真相（P4）→ HMR 与 React Refresh（P5）→ 编译器后端 esbuild/SWC + Source maps（P6）→ 插件系统 + 下一代构建工具横评（P7）。
> 编写日期：2026-05-06（首版）｜目标版本：Vite 6+（含 Rolldown 集成）；对照 Webpack 5 / Rollup 4 / Turbopack（Next.js 15 stable）/ Rspack 1+ / Bun build / Farm。

---

## 元信息

- **目标版本**：
  - **Vite 6**（2024-11 发布）+ Vite 7（预计 2026-Q2）；含 Environment API、Rolldown 实验性集成
  - **Rollup 4+**（current Vite build mode 后端）
  - **Rolldown**（Rust 实现的 Rollup 兼容 bundler，2026 接班 Vite build mode）
  - **esbuild 0.24+**（Vite dev mode 后端 + 工业基础）
  - **Webpack 5+**（仍主流但增长停滞）
  - **Turbopack**（Vercel，Next.js 15 production stable）
  - **Rspack 1+**（字节跳动，Rust webpack 兼容）
  - **Bun build**（Bun 自家 bundler，详见 Bun 主题）
  - **Farm**（中国社区 Rust bundler）
- **来源**：
  - [vitejs.dev](https://vitejs.dev/)（Vite 官方）
  - [rollupjs.org](https://rollupjs.org/)（Rollup）
  - [esbuild.github.io](https://esbuild.github.io/)（esbuild + Evan W 的设计 essay）
  - [swc.rs](https://swc.rs/)（SWC）
  - [rolldown.rs](https://rolldown.rs/)（Rolldown）
  - [turbo.build/pack](https://turbo.build/pack)（Turbopack）
  - [rspack.dev](https://rspack.dev/)（Rspack）
  - [webpack.js.org](https://webpack.js.org/)（Webpack）
  - Evan You 的 talks（VueConf / JSConf 演讲，Vite 设计）
  - Tobias Koppers (Webpack 作者) 的演讲与 blog
  - Rich Harris (Rollup / Svelte 作者) 的演讲
- **目标读者**：写过前端项目的工程师；理解 npm install + npm run dev 但不知道底层；遇到过"为什么 build 出来这么大"、"HMR 为什么有时丢状态"、"Tree shaking 为什么没生效"等具体问题。
- **不是这个主题的读者**：从没用过 bundler 的人（先用一段时间 Vite 再来）；只关心 Webpack 配置（这里只讲原理）。

---

## 整体设计：7 阶段 · 沿"构建工具演化"展开

构建工具的核心问题：<strong>把开发时模块化的源码 → 用户能跑的产物</strong>。30 年来这个问题从 "Make 编译 C" 进化到 "Vite 双模架构 + native ESM + Rust bundler"。我们按这条主线展开 7 阶段。

| 阶段 | 章数 | 核心问题 |
|---|---|---|
| **P1 · 构建工具是谁** | 2 | 构建工具 30 年史 + 同代人横评（Webpack/Rollup/Vite/Turbopack/Rspack/Rolldown/Bun build/Farm/esbuild） |
| **P2 · Vite 双模架构** | 2 | Dev mode（esbuild 依赖预构建 + native ESM）+ Build mode（Rollup → Rolldown 接班） |
| **P3 · ESM vs CJS 模块系统** | 2 | ESM 标准 + import.meta + import attributes + dynamic import；双 package hazard + interop |
| **P4 · Tree Shaking 真相** | 1 | sideEffects 标记 + 静态分析 + Rollup/Webpack/esbuild 实现差异 + 失效场景 |
| **P5 · HMR 与 React Refresh** | 1 | HMR 协议 + 模块边界 + accept callback + React Refresh / Vue HMR / Svelte HMR |
| **P6 · 编译器后端** | 2 | esbuild Go 实现 vs SWC Rust 实现 vs Babel；Source maps（raw → composite → 多层） |
| **P7 · 插件 + 下一代** | 2 | Vite/Rollup 插件 API + Unplugin；下一代构建工具（Turbopack/Rspack/Rolldown/Bun build/Farm）选型 |

总计 **12 章 ≈ 75,000-85,000 字**，平均每章 6,500 字。

---

## 与既有主题的边界 ——「短重述 + 链回」原则

构建工具主题与多个既有主题有交集，必须明确划界：

> ✅ **短重述**：1-3 句话点出"它在底层是什么 + 关键性质"
> ✅ **链回**：紧跟一句"详细的 X / Y / Z 请参考 [`主题/{phase}/{chapter}`]"
> ❌ **不要**直接抄一遍其他主题的论述

**关键边界**：

| 概念 | 在哪讲透 | Vite 主题里怎么处理 |
|---|---|---|
| Bun build / Bun bundler 内部 | `bun/04-toolchain/03-bun-build.html` | 链回，仅在 P1.2 同代人 + P7.2 下一代横评时点出 |
| Bun install vs npm/pnpm | `bun/04-toolchain/01-bun-install.html` | 链回，本主题不讲包管理（独立主题"pnpm & monorepo"） |
| ECMA 模块语义（spec 层） | `ecma/07-execution/04-module-system.html` | 短重述，P3.1 讲 ESM 时点出 spec 层语义 |
| JS 模块（开发者视角） | `javascript/04-modules/` | 链回，本主题讲 bundler 角度 |
| Node CJS / ESM 双系统 | `node/03-modules/` | 短重述，P3.2 讲 interop 时强调"bundler 怎么处理 Node 双系统" |
| TS 编译相关 | `typescript/05-engineering/` | 链回，本主题讲 bundler 怎么调 SWC / TSC / Babel，不讲 TS 语义 |
| React Server Components / Next.js bundler | 待写 Next.js 主题 | 链回，P7.2 横评时短提 |
| HTTP/2/3 影响代码分包 | 待写 HTTP 主题 | 链回，P2.2 build mode 讲 chunk 策略时点 |
| 浏览器原生 ESM 加载 | `browser-rendering/03-crp/01-parse-dom-cssom.html` | 短重述，P2.1 dev mode 提 |

---

## 内容覆盖原则 ——「Evan You / Rich Harris / Tobias Koppers 一手」

构建工具领域特点：**作者博客 + 演讲是一手**（每个工具都是某人的"个人项目"演化出来的）；社区文章常二手转述。本主题<strong>优先一手作者解释，二手做佐证</strong>。

**3 条规则**：

1. **优先官方文档 + 作者博客**：Vite（Evan You）/ Rollup（Rich Harris）/ esbuild（Evan W）/ SWC（Donny Wong）/ Webpack（Tobias Koppers）每个都有作者公开的设计 essay。每个工具的"为什么这样设计"必须来自作者。
2. **版本号必标 + 性能数据要对照**：构建工具领域版本演化快（Vite 半年一个 major），每个特性必标版本 + 主流工具对照（Webpack X / Rollup Y / Vite Z）。
3. **关注"实测 vs 营销"差距**：构建工具营销战激烈（"快 100x"等），实测往往打折。涉及性能比较时<strong>同时引用作者声称 + 第三方 benchmark + 真实项目体验</strong>。

---

## 节奏建议

- **连读组**：
  - P1.1 + P1.2（项目史 → 同代人对照，逻辑链最强）
  - P2.1 + P2.2（dev mode → build mode，Vite 双模必须连读）
  - P3.1 + P3.2（ESM → 双 package hazard，模块系统完整）
  - P6.1 + P6.2（编译器后端 → source maps）
  - P7.1 + P7.2（插件 → 下一代横评，"工具链怎么演化"完整链条）
- **可独立跳读**：
  - P4 Tree Shaking 真相相对独立
  - P5 HMR 相对独立
- **建议阅读路径**：
  - 已用 Vite 的工程师：P2 → P3 → P4 → P5
  - 想从 Webpack 迁移：P1.2 + P2 + P7.2
  - 写 Vite 插件：P3 + P6.1 + P7.1
  - 性能调优：P2.2 + P4 + P6.1

---

## 文件结构

```
vite/
  01-overview/                     (P1 · 构建工具是谁 · 2 章)
    01-history.html                ← Make 1976 → Grunt → Webpack → Rollup → Parcel → Vite → 下一代
    02-landscape.html              ← 横评 Webpack/Rollup/Parcel/Vite/Turbopack/Rspack/Rolldown/Bun build/esbuild/Farm
  02-vite-architecture/            (P2 · Vite 双模架构 · 2 章)
    01-dev-mode.html               ← esbuild 依赖预构建 + native ESM + on-demand transform
    02-build-mode.html             ← Rollup 生产打包 + chunk 分包策略 + Rolldown 接班
  03-modules/                      (P3 · ESM vs CJS · 2 章)
    01-esm-standard.html           ← ESM 标准 + import.meta + import attributes + dynamic import
    02-cjs-interop.html            ← 双 package hazard + Node CJS/ESM interop + bundler 处理
  04-tree-shaking/                 (P4 · Tree Shaking · 1 章)
    01-tree-shaking.html           ← sideEffects 标记 + 静态分析 + Rollup/Webpack/esbuild 实现差异
  05-hmr/                          (P5 · HMR · 1 章)
    01-hmr-and-react-refresh.html  ← HMR 协议 + 模块边界 + React Refresh / Vue HMR / Svelte HMR
  06-compilers/                    (P6 · 编译器后端 · 2 章)
    01-esbuild-swc.html            ← esbuild Go 实现 vs SWC Rust 实现 vs Babel
    02-source-maps.html            ← raw mappings → composite source maps → 多层 sourcemap
  07-plugins-and-next/             (P7 · 插件 + 下一代 · 2 章)
    01-plugins.html                ← Vite/Rollup 插件 API + Unplugin
    02-next-gen.html               ← Turbopack/Rspack/Rolldown/Bun build/Farm 横评 + 选型
  index.html
  outline.md
```

---

# P1 · 构建工具是谁（2 章）

> 不讲技术细节，只解决两个问题：构建工具 30 年怎么走到今天、同代人现在的格局。给后面所有"为什么这样设计"提供历史坐标。

## P1.1 · 构建工具项目史（1976-2026）

- **定位**：把构建工具 50 年史讲成一条主线 —— 不是按工具版本，按"<strong>每次范式转移及其根因</strong>"。
- **关键节点**：
  - **1976 · Make**：Stuart Feldman 在贝尔实验室；用 Makefile 描述依赖图；至今仍是 C/C++ 标配。<strong>"基于文件依赖图编译"模式起源</strong>
  - **2006-2009 · 早期 JS 构建（手工 / 自家脚本）**：jQuery 时代；YUI Compressor / Closure Compiler 做压缩；没有"模块"概念
  - **2012-01 · Grunt**：Ben Alman；JS 版 Make + 配置插件化；任务驱动；当时主流
  - **2013-07 · Browserify**：把 Node 的 CommonJS 模块带到浏览器；启动 "JS bundler" 时代
  - **2013-10 · Gulp**：Eric Schoffstall；流式 + 代码胜过配置；2014-2015 短暂主流，被 Webpack 替代
  - **2014-03 · Webpack 1**：Tobias Koppers；<strong>"任何东西都是模块"</strong>哲学（JS / CSS / image / font 都是 module）；Loader 转换 + Plugin 钩子；2016-2018 成为事实标准
  - **2015-05 · Rollup**：Rich Harris；<strong>专注 ES Module + Tree Shaking</strong>；Webpack 太重不适合库，Rollup 给库作者用；启动 "ESM 静态分析" 时代
  - **2016 · ESM 进入浏览器**：Chrome 61 / Safari 10.1 / Firefox 60 默认支持 <code>&lt;script type="module"&gt;</code>；为 Vite 设计奠定基础
  - **2017-2018 · Webpack 4 主导期**：tree-shaking 改善 / mode 配置 / babel-loader 普及；但配置复杂度爆炸（webpack.config.js 几百行常见）
  - **2018 · Parcel 1.0**：Devon Govett；<strong>"零配置"</strong>挑战 Webpack；Parcel 2 用 Rust（2021）；但 ecosystem 不及 Webpack
  - **2020-01 · esbuild 0.1**：Evan W（前 Figma 工程师）；<strong>Go 实现 + 极致并行 + 100x 快</strong>；启动 "原生语言（Go/Rust）写 bundler" 时代
  - **2020-04 · Vite 1.0**：尤雨溪（Vue 作者）；<strong>Dev mode 用 native ESM + esbuild 预构建 + Build mode 用 Rollup</strong>；颠覆 "全量打包 dev server" 模式
  - **2020-12 · SWC 1.0**：Donny Wong（DongYoon Kang）；<strong>Rust 实现 + Babel 替代</strong>；后来被 Next.js / Deno 采用
  - **2022-2023 · Vite 主流化**：Vue 3 / Svelte / SolidJS / Astro 等都用 Vite；React 也越来越多人从 CRA → Vite 迁移；CRA 2023 弃用
  - **2022-2023 · Turbopack alpha**：Tobias Koppers（Webpack 原作者）跳槽到 Vercel 重写；Rust 实现；Next.js 15（2024-10）production stable
  - **2023-03 · Rspack 0.1**：字节跳动；<strong>Rust webpack 兼容</strong>；让 webpack 项目"换 Rspack 即可加速"；2024 v1.0
  - **2023-08 · Rolldown 启动**：尤雨溪团队；<strong>Rust 实现的 Rollup 兼容 bundler</strong>；目标接管 Vite build mode
  - **2024-09 · Bun build**：Bun 自家 bundler；详见 <a href="../bun/04-toolchain/03-bun-build.html">Bun P4.3</a>
  - **2024-10 · Next.js 15 + Turbopack production stable**
  - **2024-11 · Vite 6**：Environment API（让 SSR / RSC / Edge 都跑同一 Vite）+ Rolldown 实验性集成
  - **2026-Q2 (预期) · Vite 7 + Rolldown stable**：build mode 默认 Rolldown
- **底层逻辑要点**：
  - **从"文件依赖"到"模块依赖"再到"原生 ESM"是 3 次范式转移**：Make 看文件 → Browserify/Webpack 看模块（CommonJS） → Vite 看模块（ESM）+ 浏览器自己懂模块
  - **Webpack 主导 2016-2022 的根因**：(1) "什么都是模块"哲学普适；(2) Loader / Plugin ecosystem 巨大；(3) React/Vue 等大框架内置 Webpack；但代价是配置复杂 + 启动慢
  - **Vite 颠覆 dev server 的关键创新**：dev mode 不打包 —— 浏览器原生 ESM 一个文件一请求，esbuild 只做依赖预构建；让 dev 启动从分钟级变秒级
  - **Rust/Go 写 bundler 是 2020+ 不可逆趋势**：JS bundler 性能上限低（V8 + 单线程 + 无 native 优化）；Go/Rust 让构建快 10-100x；esbuild / SWC / Turbopack / Rspack / Rolldown 全是这个方向
  - **Webpack 仍存活但停止增长**：核心团队（Tobias）走了去做 Turbopack；Rspack 是 Webpack 的 Rust 兼容版；2026 新项目几乎没人选 Webpack，但旧项目存量大
- **预估字数**：6,500-7,500

## P1.2 · 同代人横评（2026-05 现状）

- **定位**：横向对照章。把 ~10 个主流构建工具排一行讲清各自定位。
- **关键工具与定位**：
  - **Webpack 5+**：老牌；Loader/Plugin 生态最大；但启动慢 / 增长停滞；新项目不选，旧项目存量大
  - **Rollup 4+**：库打包标准；ESM 优先；不擅长 dev server；很多 bundler 内部用 Rollup 做 build
  - **Parcel 2+**：Rust 后端 + 零配置；ecosystem 比 Webpack/Vite 小；适合简单项目
  - **Vite 6+**：app dev 事实标准；双模架构；Rolldown 接班 build mode；2026 最主流 app bundler
  - **Turbopack**：Next.js 15+ 主推；Rust + 增量编译；Next.js 强绑定，独立用罕见
  - **Rspack 1+**：字节跳动；Rust webpack 兼容；让 webpack 项目"换 Rspack 即加速"；大型企业 webpack 迁移用
  - **Rolldown**：Vite 团队；Rust Rollup 兼容；2026-Q2 stable 后接班 Vite build
  - **Bun build**：Bun 自家；与 Bun runtime 深度集成；详见 <a href="../bun/04-toolchain/03-bun-build.html">Bun P4.3</a>
  - **esbuild**：Go 实现；极快但不做完整 bundler 工作（无 HMR / 弱 code splitting）；常作为其他 bundler 的子工具
  - **Farm**：中国社区 Rust bundler；Vite 兼容 plugin API；2024+ 慢热
  - **SWC**：编译器（不是 bundler），Babel 替代；广泛被各 bundler 采用
- **设计选择对比表**：
  | 维度 | Webpack | Rollup | Vite | Turbopack | Rspack | Rolldown | Bun build | esbuild |
  |---|---|---|---|---|---|---|---|---|
  | 实现语言 | JS | JS | JS+esbuild+Rollup | Rust | Rust | Rust | Zig | Go |
  | Dev server | ✅ | ❌ | ✅ 原生 ESM | ✅ 增量 | ✅ | (无 dev) | ✅ | 弱 |
  | Build | ✅ | ✅ | Rollup→Rolldown | ✅ | ✅ | ✅ | ✅ | 弱 |
  | HMR | ✅ | ❌ | ✅ | ✅ | ✅ | (规划) | ✅ | ❌ |
  | Plugin 生态 | 巨大 | 大 | 中（兼容 Rollup） | 弱 | 巨大（webpack 兼容） | 中 | 弱 | 弱 |
  | 配置复杂度 | 高 | 中 | 低 | 低 | 中（webpack 风格） | 低 | 极低 | 极低 |
  | 启动速度 | 慢（10-60s） | (无 dev) | 快（&lt; 1s） | 极快 | 快 | (无 dev) | 极快 | 极快 |
  | Build 速度 | 慢 | 中 | 中（Rollup 拖累） | 快 | 快 | 快 | 极快 | 极快 |
  | 主要用户 | 旧项目 | 库作者 | app 主流 | Next.js | 大型企业 | (Vite 接班) | Bun 用户 | 工具链子组件 |
- **底层逻辑要点**：
  - **每个工具都有"sweet spot"**：库 → Rollup；app → Vite；Next.js → Turbopack；Webpack 迁移 → Rspack；Bun 项目 → Bun build；通用快 transform → esbuild / SWC
  - **2026 趋势：Vite 是 app dev 默认，Rust bundlers 是 build 默认**：Webpack 被边缘化但仍有大量存量；Rollup 仍是库标准但 Rolldown 接班浏览器 / Node 生态
  - **Turbopack vs Rspack 的差异**：都是 Rust + Tobias Koppers 思路；Turbopack 重写（增量编译 / 共享缓存）+ Vercel 推 Next.js；Rspack 兼容 Webpack API（"换上即加速"）+ 字节跳动推
- **关联章节**：[`bun/04-toolchain/03-bun-build.html`]
- **预估字数**：7,000-8,000

---

# P2 · Vite 双模架构（2 章）

> Vite 最颠覆的设计：<strong>dev mode 用一套实现，build mode 用另一套</strong>。这一阶段两章把它讲透。

## P2.1 · Dev mode：esbuild 预构建 + 浏览器原生 ESM + on-demand transform

- **定位**：Vite 设计核心。回答"为什么 Vite dev 启动这么快"。
- **关键知识点**：
  - **核心思想**：浏览器原生支持 ESM，dev mode 不打包 —— 让浏览器请求每个 module 文件，server on-demand 转换返回
  - **依赖预构建（dependency pre-bundling）**：node_modules 里的依赖（如 react / lodash）通常是 CJS 或散文件；esbuild 把它们预 bundle 成单个 ESM 文件，避免浏览器发几百个请求
  - **缓存机制**：预构建结果存在 .vite/ 目录；hash-based invalidation；package.json 改了才重新预构建
  - **on-demand transform**：源代码（src/）按浏览器请求逐个转换：TS → JS / Vue SFC → JS / JSX → JS。用 esbuild 做 transform（不做 bundle）
  - **HTTP 请求模型**：浏览器看到 <code>import './foo.tsx'</code> → 发请求 /foo.tsx → server 编译返回 JS → 浏览器解析里面的 import 继续请求
  - **import 重写（import rewriting）**：浏览器只接受 absolute / relative URL；Vite server 把 <code>import 'react'</code> 重写为 <code>/node_modules/.vite/deps/react.js</code> 等
  - **CSS / 静态资源处理**：CSS 也按 ESM 处理（<code>import './style.css'</code>）；Vite server 把 CSS 包装成 JS module（HMR 用）
  - **Pre-bundle 的两个目的**：(1) 把 CJS 转 ESM（浏览器只懂 ESM）；(2) 把多文件依赖打成一个文件（少请求）
- **关键性能机制**：
  - **冷启动 &lt; 1s**：依赖预构建 ~几百 ms（首次）/ 几十 ms（缓存命中）；server boot 几十 ms；浏览器原生 ESM 解析快
  - **HMR &lt; 50ms**：源文件改动 → server 编译单文件 → push 给浏览器 → React Refresh 注入
  - **大型项目可扩展**：因为 dev 不全量打包，1000 文件的项目和 100 文件的项目启动时间几乎一样
- **底层逻辑要点**：
  - **"浏览器懂 ESM 后 bundler 是不是不需要了"**：dev 不需要，build 仍需要（chunk 优化 / tree shaking / 代码压缩）；这是 Vite 双模存在的逻辑
  - **预构建是 dev 性能的关键不是 esbuild**：esbuild 只是预构建快；真正快的是"不全量打包整个项目"。即使把 esbuild 换成更慢的 bundler，启动也仍然快
  - **"每个 import 一个 HTTP 请求"在 HTTP/2/3 下不是问题**：HTTP/2 多路复用让小请求高效；浏览器 cache 让二次访问几乎免费
- **关联章节**：[`browser-rendering/03-crp/01-parse-dom-cssom.html`]、[`bun/04-toolchain/03-bun-build.html`]
- **预估字数**：7,000-8,000

## P2.2 · Build mode：Rollup 生产打包 + chunk 分包 + Rolldown 接班

- **定位**：Vite 生产构建。回答"为什么 dev 用 esbuild，build 用 Rollup"。
- **关键知识点**：
  - **Build mode 仍要 bundle**：生产代码要 chunk 分包 / tree shaking / 代码压缩 / sourcemap / 资源优化。这些 esbuild 做得不够好，所以 Vite build 默认用 Rollup
  - **Rollup 4 优势**：成熟 ESM 处理 / 优秀 tree shaking / 完善 plugin ecosystem / 优秀 sourcemap
  - **Vite 在 Rollup 之上加了什么**：智能 chunk 策略 / CSS code splitting / 资源处理 / 默认 minify（terser）/ multi-page 支持
  - **Chunk 分包策略**：
    - 默认每个 dynamic import 一个 chunk
    - vendor 分割（node_modules 单独 chunk，让缓存友好）
    - manualChunks 配置自定义分包
    - 2024+ 智能分包（自动按使用频率）
  - **CSS 处理**：每个 entry 的 CSS 独立 .css 文件；CSS code splitting 让按需加载
  - **资源处理**：图片 / 字体小于 4KB 默认 inline base64；其他独立 file + hash
  - **Rolldown 接班**：Vite 6 实验性，Vite 7+ 默认；Rolldown 是 Rust Rollup 兼容版本，10x+ 快但 plugin API 兼容
- **关键性能机制**：
  - **Tree shaking** —— 详见 P4
  - **Code splitting** —— 减少首屏加载
  - **Asset hashing** —— 长期缓存
  - **Multi-format 输出** —— ESM / CJS / UMD / IIFE 同时产出（库场景）
- **底层逻辑要点**：
  - **"为什么 dev/build 不统一用一个工具"**：dev 求"启动快 + 单文件转换快"；build 求"代码体积小 + 优化彻底"。两个目标方向不同
  - **Rollup → Rolldown 接班是平滑的**：Rolldown 设计目标是 100% Rollup plugin 兼容；用户切换时 plugin 不需改
  - **Bundle 大小决定首屏**：production app 的 LCP 直接受 bundle 大小影响（详见 <a href="../browser-rendering/04-performance/01-load-metrics.html">浏览器渲染 P4.1</a>）；chunk 分包是 LCP 优化第一关
- **关联章节**：[`browser-rendering/04-performance/01-load-metrics.html`]、[`bun/04-toolchain/03-bun-build.html`]
- **预估字数**：6,500-7,500

---

# P3 · ESM vs CJS 模块系统（2 章）

> 模块系统是 bundler 的"输入 + 输出"基础。Web 标准 ESM 与 Node CJS 共存让 bundler 必须处理 interop。

## P3.1 · ESM 标准 + import.meta + import attributes + dynamic import

- **定位**：现代模块系统。讲清 ESM spec 关键特性 + bundler 如何处理。
- **关键知识点**：
  - **ESM 静态分析特性**：<code>import</code> 必须在顶层（不能 if 里）+ 字符串 literal 路径（不能 require(var)）；让<strong>静态分析</strong>（tree shaking）成为可能
  - **ESM live binding**：<code>import { count } from './counter'</code>，外部能看到 count 后续变化；与 CJS 的"复制值"不同
  - **import.meta**：每个 module 有独立元数据；<code>import.meta.url</code> 是 module 的 URL；<code>import.meta.env</code>（Vite 扩展）是环境变量
  - **import attributes**（2025 stage 4）：<code>import data from './data.json' with { type: 'json' }</code>；让 ESM 安全 import 非 JS 资源
  - **dynamic import**：<code>const mod = await import('./foo')</code>；运行时 import；返回 Promise；用于 code splitting
  - **top-level await**：ESM 模块可以顶层 await；与 CJS 不兼容（CJS 是同步 require）
  - **import maps**（浏览器特性）：让浏览器知道 <code>import 'react'</code> 解析到哪个 URL；Vite dev mode 内部用类似机制
  - **bundler 视角**：bundler 做的事是"<strong>把所有 import 解析 + 合并成产物</strong>"。每个工具对 ESM spec 的覆盖度不同
- **关键应用**：
  - **Code splitting via dynamic import**：<code>const Page = lazy(() =&gt; import('./Page'))</code>；bundler 把 dynamic import 切成独立 chunk
  - **Lazy loading for routes**：路由模块按需加载
  - **Worker module**：<code>new Worker('./worker.js', { type: 'module' })</code>；ESM worker
  - **import attributes for JSON / CSS / wasm**：<code>import data from './data.json' with { type: 'json' }</code>；2026 standard
- **底层逻辑要点**：
  - **静态 vs 动态的根本权衡**：CJS 是动态（runtime resolve）→ require(any string) 都行 → 没法 tree shake；ESM 是静态（compile-time resolve）→ 只能 import literal → 能 tree shake
  - **live binding 让 ESM 与 CJS 互操作复杂**：Node 早期 ESM 实现（12.x）尝试 100% spec 兼容，导致 CJS 互操作的痛点至今犹存
  - **bundler 必须做"虚拟 ESM 解析"**：浏览器原生 ESM 用 URL；bundler 要把 <code>import 'react'</code> 这种 bare specifier 解析到具体文件（用 node_modules / package.json 等规则）
- **关联章节**：[`ecma/07-execution/04-module-system.html`]、[`javascript/04-modules/`]、[`node/03-modules/`]
- **预估字数**：6,500-7,500

## P3.2 · CJS Interop + 双 Package Hazard + bundler 处理

- **定位**：现实世界的模块混乱。回答"为什么我 import lodash 报错"。
- **关键知识点**：
  - **CJS（CommonJS）核心**：<code>module.exports = ...</code> + <code>require(...)</code>；同步 require；Node 1.0+；Browserify 把它带到浏览器
  - **CJS vs ESM 不兼容点**：
    - CJS 同步 require / ESM 异步 import + top-level await
    - CJS 复制值 / ESM live binding
    - CJS 动态路径 / ESM 静态路径
    - CJS exports namespace / ESM named exports + default
  - **双 package hazard（详见 <a href="../node/03-modules/">Node P3</a>）**：一个包同时发布 CJS 和 ESM 版本；可能 import 两次（CJS 一份 / ESM 一份）→ 状态不一致
  - **package.json exports 字段**：精细声明每个 entry 的 CJS / ESM / types：
    ```json
    "exports": {
      ".": {
        "import": "./esm/index.js",
        "require": "./cjs/index.js",
        "types": "./types/index.d.ts"
      }
    }
    ```
  - **bundler 怎么处理 CJS**：
    - Vite (Rollup)：用 @rollup/plugin-commonjs 把 CJS 转 ESM AST；不完美（动态 require 处理不全）
    - Webpack：原生支持两种；自动 wrapper
    - esbuild：原生支持两种 + 自动 interop
  - **bundler 输出格式**：
    - ESM：现代浏览器 / Node ESM
    - CJS：旧 Node
    - UMD：Universal（浏览器全局 + Node CJS）
    - IIFE：浏览器全局 only
- **关键现实场景**：
  - **lodash-es vs lodash**：lodash 是 CJS，lodash-es 是 ESM；用 lodash-es tree shaking 才生效
  - **Node fetch 错误**：<code>const fetch = require('node-fetch')</code>（CJS）vs <code>import fetch from 'node-fetch'</code>（ESM）；node-fetch 3+ 只 ESM，CJS 用户痛
  - **Vite SSR 模式**：dev 时 SSR 用 ESM（Vite server）；build 时可能输出 CJS（Node 旧版）
  - **CJS-only 库 lock 项目**：你想升 ESM，依赖里有个 CJS-only 包 → 卡住
- **底层逻辑要点**：
  - **CJS / ESM 共存是 Node ecosystem 的"原罪"**：Node 决定 ESM 时社区已有 100k+ CJS 包；不能强制全切 ESM；几年来都在管理两个系统
  - **package.json exports 是最重要的现代约定**：所有新包都应该用 exports 而不是 main
  - **bundler 的 interop 哲学不同**：Webpack "尽量自动转"；Rollup "rejection by default + plugin opt-in"；esbuild "spec-correct + 简单"
- **关联章节**：[`node/03-modules/`]、[`javascript/04-modules/`]、[`typescript/05-engineering/`]
- **预估字数**：7,000-8,000

---

# P4 · Tree Shaking 真相（1 章）

> 行业最被误解的特性之一。"我开了 tree shaking 怎么 bundle 还这么大"是常见困惑。

## P4.1 · sideEffects 标记 + 静态分析 + Rollup/Webpack/esbuild 实现差异

- **定位**：Tree shaking 怎么真正工作 + 为什么经常失效。
- **关键知识点**：
  - **Tree shaking 定义**：编译时分析模块图 → 标记未使用的 export → 不打包
  - **前提**：模块用 ESM（静态 import / export）；CJS 不能 tree shake
  - **side effects 概念**：模块加载时执行的代码（console.log / 注册全局 / polyfill）<strong>有副作用</strong>。tree shaker 默认假设所有模块有副作用 → 不能删
  - **package.json sideEffects 字段**：
    ```json
    "sideEffects": false   // 整个包都纯
    "sideEffects": ["./src/polyfill.js", "*.css"]   // 只有这些有副作用
    ```
  - **静态分析的限制**：
    - 动态 import / require 不能分析
    - 调用未知函数（可能改全局）保守处理
    - re-export（<code>export * from</code>）扩展分析图
    - destructuring import 是必要不充分（虽然 import 但用了什么不一定确定）
  - **Rollup vs Webpack vs esbuild 的 tree shaking 差异**：
    - Rollup：最严格 + 最干净；ESM-only；tree shaking 是"第一公民"
    - Webpack：依赖 sideEffects + Babel pure annotation；常有"假阳性"（认为有副作用其实没有）
    - esbuild：快 + 中等严格；不及 Rollup 干净但接近
- **典型失效场景**：
  - **导入整个 lodash**：<code>import _ from 'lodash'</code> 导入所有；用 <code>import { debounce } from 'lodash-es'</code> 才 tree shake
  - **没标 sideEffects: false**：第三方包不标 → bundler 保守保留
  - **CSS 副作用**：CSS import 是副作用（注入 DOM），不能 tree shake；但 <code>sideEffects: ["*.css"]</code> 让 JS 部分仍能 tree shake
  - **模块顶层 console.log**：被认为副作用，整个模块保留
  - **Babel 转译破坏 tree shaking**：Babel 把 class / let 转 var / function 时，可能加 helper（破坏 ESM 静态结构）
- **关键工具**：
  - **/* @__PURE__ */ 注释**：标注函数调用纯（无副作用）
  - **rollup-plugin-visualizer**：可视化 bundle 内容
  - **Vite build --mode development**：保留 tree shaking 但不 minify，方便 inspect
- **底层逻辑要点**：
  - **Tree shaking 不是"开关"**：依赖整个生态（包正确标 sideEffects + bundler 实现 + 用户写 code 风格）共同配合；任何一环失效都让 tree shake 失败
  - **静态分析能力天花板**：没法做 100%；保守 = 多打包；激进 = 可能误删
  - **动态 import 是 tree shaking 反面**：dynamic import 让代码"按需加载"，但每个 chunk 内的 tree shaking 仍要 ESM
- **预估字数**：7,000-8,000

---

# P5 · HMR 与 React Refresh（1 章）

> "改一行 React 代码不丢 state" 是 modern dev 体验核心。

## P5.1 · HMR 协议 + 模块边界 + accept callback + React Refresh / Vue HMR / Svelte HMR

- **定位**：HMR 怎么真正工作 + 为什么有时丢 state。
- **关键知识点**：
  - **HMR（Hot Module Replacement）核心思想**：源代码改了 → 不重启浏览器（保留 state） → 热替换改动的模块
  - **HMR 协议层**：
    1. Vite server 监听文件变化（chokidar）
    2. 检测到 src/foo.tsx 改动 → 编译新版本
    3. WebSocket push HMR update message 给浏览器
    4. 浏览器 client（vite/client.js）收到 → 决定 accept 或 full reload
    5. 如果 accept → fetch 新模块 → 替换 + 调 accept callback
  - **import.meta.hot API**：模块声明自己怎么 accept HMR：
    ```js
    if (import.meta.hot) {
      import.meta.hot.accept((newModule) => {
        // 重新挂载新逻辑
      });
    }
    ```
  - **HMR boundary（边界）**：
    - 模块 accept 自己 → 自我边界
    - 父模块 accept 子模块 → 父是边界
    - 一直没 accept → 走到顶 → full reload
  - **React Refresh**：自动给每个 React 组件加 HMR boundary：
    - 组件改了 → 重新挂载组件 + 保留 useState/useReducer 状态
    - hook order 改变（违反 Rules of Hooks）→ full reload
    - 非组件改动（导出 utility 函数）→ 由父模块决定
  - **Vue HMR**：SFC（.vue 文件）每个 block（template / script / style）独立 HMR；Vue runtime 处理保留 reactive state
  - **Svelte HMR**：编译时 instrument；保留组件实例 state
- **典型失败场景**：
  - **修改 hook 数量** → React Refresh 无法保留 state，full reload
  - **修改 export 名字** → bundler 检测到 module API 变化 → full reload
  - **顶层定义全局状态**（不在组件内）→ HMR 不感知 → state 重置
  - **修改 CSS-in-JS 样式名** → React Refresh OK，但样式可能不同步
  - **第三方库副作用注册（map polyfill）** → HMR 后副作用重复执行
- **底层逻辑要点**：
  - **HMR 不是"全自动"**：依赖框架和 user code 一起配合；React Refresh 让 React 组件自动 HMR，但其他模块要手写 import.meta.hot.accept
  - **HMR 状态保留有边界**：组件 state 保留；模块顶层变量重置（除非框架特别处理）
  - **HMR 是 dev mode only**：production build 不需要 HMR
- **预估字数**：6,500-7,500

---

# P6 · 编译器后端（2 章）

> bundler 内部用什么编译器把 TS / JSX / 现代 JS → 浏览器能跑的 JS。这一阶段两章覆盖 esbuild/SWC/Babel + sourcemap。

## P6.1 · esbuild Go 实现 vs SWC Rust 实现 vs Babel

- **定位**：现代编译器后端横评。
- **关键知识点**：
  - **Babel（2014-）**：JS 实现；插件 ecosystem 最大；性能慢（100-1000ms/文件）；长期是事实标准
  - **esbuild（2020-）**：Evan W；Go 实现；并行 + AST in memory；极快（&lt; 10ms/文件）；功能 baseline 但不复杂
  - **SWC（2020-）**：DongYoon Kang；Rust 实现；插件用 wasm（Rust）；接近 Babel 兼容性 + 接近 esbuild 速度
  - **应用场景对比**：
    - 库作者：用 Babel + babel/preset-env（最广 target 兼容）
    - app：用 esbuild / SWC（速度优先）
    - Next.js：默认 SWC
    - Vite：dev 用 esbuild，build 用 esbuild 或 Rollup
  - **三者的"做什么"**：
    - **Transform 现代 JS → 老 JS**：箭头函数 → function / class → 函数 / async/await → generator
    - **Transform JSX → React.createElement / jsx-runtime**
    - **Transform TypeScript → JS**：类型擦除 + 装饰器
    - **Polyfill 注入**：core-js / regenerator-runtime
  - **Babel preset 系统**：preset-env / preset-react / preset-typescript；每个 preset 是 plugin 集合
  - **SWC plugin 系统**：用 Rust 写，编译成 wasm；性能损失小
  - **esbuild 不支持插件做 AST transform**：只支持 plugin hook（resolve / load）；不能改 AST
- **性能对比（典型 TS 文件 transform）**：
  | 工具 | 100 文件 | 1000 文件 |
  |---|---|---|
  | Babel | 5-10s | 50-100s |
  | SWC | 0.5-1s | 5-10s |
  | esbuild | 0.1-0.5s | 1-5s |
- **底层逻辑要点**：
  - **JS 写 compiler 性能上限**：V8 + 单线程 + 字符串处理；esbuild 用 Go (goroutine + 多核 + 自家 AST in memory) 突破
  - **Rust vs Go 在 compiler 场景**：Rust 更精细 / Go 更快开发 + 并发更天然；两者都比 JS 快 100x
  - **Babel 不会消失**：它的 plugin ecosystem 太大；新工具（SWC）兼容 Babel API 是必选
- **关联章节**：[`typescript/05-engineering/`]、[`bun/02-internals/02-zig-language.html`]
- **预估字数**：6,500-7,500

## P6.2 · Source Maps 工程化

- **定位**：Sourcemap 是怎么真正 work 的 + production 调试。
- **关键知识点**：
  - **Source map 格式（v3）**：JSON 文件，含 mappings（VLQ 编码的位置映射）+ sources + names
  - **VLQ 编码**：变长 base64 编码每行偏移；让 sourcemap 紧凑
  - **生成方式**：编译器在 transform 时同时生成 source map；记录每个输出位置对应输入位置
  - **多层 sourcemap（composite）**：source → TS → JS（map 1）→ bundled（map 2）→ minified（map 3）；浏览器 devtools 自动追踪到原始 .ts
  - **生产 sourcemap 部署**：
    - inline（//# sourceMappingURL=data:...）—— 体积大，不推荐
    - external file（//# sourceMappingURL=foo.js.map）—— 浏览器按需加载
    - private CDN + Sentry 等错误追踪用 sourcemap 解析 stack trace
  - **sourcemap 安全考虑**：production 暴露 sourcemap = 暴露源码；通常只给 Sentry 用，不公网暴露
- **常见问题**：
  - **HMR 后 sourcemap 错位** → bundler bug 或 plugin 顺序问题
  - **Babel + esbuild 链 sourcemap 丢失** → Babel 没传递上游 map
  - **Production stack trace 显示 minified 名字** → sourcemap 没上传到错误追踪服务
- **底层逻辑要点**：
  - **sourcemap 是"调试体验"基础**：没它，production 错误几乎无法 debug
  - **多层链路要每一步保留 sourcemap**：任何一步 plugin 不传递就断链
  - **inline sourcemap 适合 dev / external 适合 production**
- **预估字数**：6,000-7,000

---

# P7 · 插件 + 下一代（2 章）

> Plugin 是 bundler 的扩展机制；下一代 Rust bundler 是 2024+ 趋势。

## P7.1 · Vite/Rollup 插件 API + Unplugin

- **定位**：怎么写 Vite / Rollup plugin + Unplugin 跨工具抽象。
- **关键知识点**：
  - **Rollup plugin hooks**：
    - <code>resolveId</code>：把 import 字符串解析到文件路径
    - <code>load</code>：读取文件内容
    - <code>transform</code>：改文件内容（编译）
    - <code>buildStart / buildEnd</code>：生命周期
    - <code>generateBundle / writeBundle</code>：产物生成
  - **Vite 在 Rollup hooks 之上加的**：
    - <code>config / configResolved</code>：访问 Vite 配置
    - <code>configureServer</code>：在 dev server 上加 middleware
    - <code>handleHotUpdate</code>：自定义 HMR
    - <code>transformIndexHtml</code>：处理 index.html
  - **Plugin 顺序**：pre / default / post；Vite 内置 plugin 有固定顺序
  - **Unplugin（Anthony Fu）**：跨 Vite / Rollup / Webpack / esbuild / Rspack 的 plugin 抽象；让一个 plugin 在多个 bundler 里跑
  - **典型 plugin 例子**：
    - vite-plugin-react / vite-plugin-vue（框架）
    - vite-plugin-pwa（PWA）
    - vite-plugin-pages / vite-plugin-routes（文件路由）
    - unplugin-auto-import（自动 import）
    - unplugin-icons（icon component）
- **底层逻辑要点**：
  - **Rollup plugin API 是事实标准**：因为 Vite/Rolldown/Bun build 都基于或兼容 Rollup API
  - **Unplugin 让 plugin 作者维护一份代码**：跨工具 ecosystem 共享
  - **写 plugin 的常见 mistake**：transform 顺序错 / 没处理 query string / sourcemap 丢失
- **预估字数**：6,500-7,500

## P7.2 · 下一代构建工具横评 + 选型

- **定位**：2026 选什么 bundler。
- **关键知识点**：
  - **Turbopack（Vercel）**：
    - Tobias Koppers 主导（Webpack 原作者跳槽 Vercel）
    - Rust + 增量编译 + 共享缓存
    - Next.js 15+ production stable
    - 独立用罕见（生态以 Next.js 为中心）
  - **Rspack（字节跳动）**：
    - Rust + Webpack 兼容 API
    - 适合 Webpack 项目"换上即加速"
    - 大型企业用（字节跳动自家 + 抖音 / TikTok）
  - **Rolldown（Vite team）**：
    - Rust + Rollup 兼容 API
    - 2026-Q2 stable 后接班 Vite build mode
    - 库 + app 通用
  - **Bun build**（Bun 团队）：
    - Zig 实现 + JSC 集成
    - 与 Bun runtime 深度协作
    - 详见 <a href="../bun/04-toolchain/03-bun-build.html">Bun P4.3</a>
  - **Farm（中国社区）**：
    - Rust + Vite plugin 兼容
    - 比 Vite 快 5-10x（声称）
    - 用户群较小但活跃
- **选型决策树**：
  - **Next.js 项目** → Turbopack（默认）
  - **Webpack 大项目迁移** → Rspack（兼容性最好）
  - **Vite 项目升级** → Rolldown（自动接班，Vite 7+）
  - **Bun runtime 项目** → Bun build
  - **新项目默认** → Vite（Rolldown 接班后更快）
  - **库作者** → Rollup / Rolldown
  - **极致速度 + 不需要复杂 plugin** → esbuild / Bun build
- **2026-2030 趋势**：
  - Webpack 持续退场（仍有大量存量但增长停滞）
  - Vite + Rolldown 成为 app dev/build 双标准
  - Rust bundlers 占据 90%+ 新项目
  - Component Model（详见 <a href="../wasm/07-component-model/01-component-and-apps.html">WASM P7</a>）让 wasm + bundler 进一步集成（如 wasm 作为 build cache 后端）
- **底层逻辑要点**：
  - **bundler 分裂成 "Rust 实现 + 不同 API 兼容层"**：Turbopack（自家 API）/ Rspack（Webpack）/ Rolldown（Rollup）；每个绑定一个生态
  - **Vite 模型胜出的根因**：dev 用原生 ESM 让"启动慢"问题消失；build 用专业 bundler；这是 2026 默认架构
  - **Webpack 退场不是技术原因**：技术上 Webpack 仍能用；但配置复杂 + 启动慢 + 维护停滞让新人不选
- **关联章节**：[`bun/04-toolchain/03-bun-build.html`]、[`wasm/07-component-model/01-component-and-apps.html`]
- **预估字数**：7,500-8,500

---

## 附：参考资料汇总

**官方文档**：
- [vitejs.dev](https://vitejs.dev/) · Vite
- [rollupjs.org](https://rollupjs.org/) · Rollup
- [esbuild.github.io](https://esbuild.github.io/) · esbuild
- [swc.rs](https://swc.rs/) · SWC
- [rolldown.rs](https://rolldown.rs/) · Rolldown
- [turbo.build/pack](https://turbo.build/pack) · Turbopack
- [rspack.dev](https://rspack.dev/) · Rspack
- [webpack.js.org](https://webpack.js.org/) · Webpack

**作者博客与演讲**：
- Evan You · Vite 设计 talks（VueConf / JSConf）
- Rich Harris · Rollup / Svelte 设计 talks
- Evan W · esbuild 设计 essay（github 上）
- Tobias Koppers · Webpack / Turbopack 演讲（Vercel blog）
- Anthony Fu · Unplugin / vite-plugin-* 系列博客

**深度文章**：
- [How Vite works (Vite 文档自己讲解)](https://vitejs.dev/guide/why.html)
- [Source Maps under the hood](https://web.dev/articles/source-maps)
- [Tree-shaking versus dead code elimination (Rich Harris)](https://medium.com/@Rich_Harris/tree-shaking-versus-dead-code-elimination-d3765df85c80)
- [Why Turbopack? (Vercel)](https://vercel.com/blog/turbopack-2-0)

**社区资源**：
- [vite-plugin- 系列](https://github.com/vitejs/awesome-vite)
- [unplugin/unplugin](https://github.com/unjs/unplugin)
- [Bundle size analyzer 工具集](https://github.com/btd/rollup-plugin-visualizer)

---

## 与 index.html 卡片的对应

Vite & 构建工具主题在站点首页的卡片描述是：
> Vite 双模架构（dev: esbuild + native ESM；build: Rollup）、HMR 协议、插件机制、SWC vs Babel、与 Rolldown / Turbopack / Bun build 横评、tree shaking 真相、source map 工程化。

本大纲全部覆盖 + 扩充：
- ✅ Vite 双模架构 → P2 全覆盖
- ✅ HMR 协议 → P5 全覆盖
- ✅ 插件机制 → P7.1 全覆盖
- ✅ SWC vs Babel → P6.1 全覆盖
- ✅ 与 Rolldown / Turbopack / Bun build 横评 → P1.2 + P7.2 全覆盖
- ✅ tree shaking 真相 → P4 单独成章
- ✅ source map 工程化 → P6.2 单独成章
- ➕ 扩充：构建工具 30 年史（P1.1）、ESM vs CJS 模块系统（P3）

写完后建议把 index.html 的卡片标题从 "⏳ 规划中" 改为 "✅ 12 章 / 7 阶段完成"。
