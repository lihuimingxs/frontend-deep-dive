# Next.js 深度学习 · 章节大纲

> 本文件是 Next.js 主题的写作蓝本。**7 阶段 · 12 章**：从 Next.js 项目史 + 元框架同代人横评（P1）→ App Router 心智（P2）→ RSC 与流式渲染（P3）→ Server Actions 与数据变更（P4）→ 缓存系统真相（P5）→ Turbopack 与工具链（P6）→ 部署模型 + 生态决策树（P7）。
> 编写日期：2026-05-07（首版）｜目标版本：Next.js 16（主线）/ 15.4（存量）/ React 19 / Turbopack stable

---

## 元信息

- **目标版本**：
  - **Next.js 16**（2026 主线）—— Turbopack 在 dev + prod 双稳定且默认；PPR（Partial Prerendering）正式 GA；Cache Components 用 `'use cache'` 指令替代 dynamicIO；新增 `updateTag()` / 改造的 `revalidatePath()` / `revalidateTag()`；async request APIs（cookies/headers/params/searchParams 全 Promise）。
  - **Next.js 15.4**（仍大量在用的存量主线）—— App Router stable / Server Actions stable / React 19 / Turbopack dev stable / 缓存默认从 cache-by-default 改为 explicit-opt-in。本主题以 16 为主，关键差异处会标 15 → 16 的迁移要点。
  - **React 19.x**（运行时基础，详见 `react/` 主题）
  - **Turbopack** Rust bundler（与 Webpack 数据兼容、增量计算）
  - 历史回溯：Next.js 1.0 (2016, getInitialProps) → 9 (2019, TS + API Routes) → 9.3 (2020, getStaticProps/getServerSideProps) → 9.5 (2020, ISR) → 13 (2022, App Router beta + RSC + Turbopack alpha) → 14 (2023, Server Actions stable + PPR 预览) → 15 (2024, React 19 + async APIs + Turbopack dev GA) → 16 (2026, Turbopack prod GA + PPR GA + Cache Components)
- **来源**：
  - [nextjs.org/docs](https://nextjs.org/docs)（官方文档全量）
  - [nextjs.org/blog](https://nextjs.org/blog)（每个版本的 release notes，是设计动机最权威来源）
  - [vercel.com/blog](https://vercel.com/blog)（Partial Prerendering / Cache Components 的设计文章）
  - [github.com/vercel/next.js](https://github.com/vercel/next.js)（仅 P3.1 RSC payload 与 P6.1 Turbopack 章涉及源码）
  - Lee Robinson / Tim Neutkens / Sebastian Markbåge / Andrew Clark 的 Twitter / 演讲（设计意图原始解读）
  - React 团队 RFC（Server Components / Actions —— Next.js 是 RSC 的首发实现）
- **目标读者**：写过 React 项目、用过 Pages Router 或 App Router 但被缓存搞迷糊 / RSC 边界模糊 / Server Actions 不知道怎么测的工程师；从 Pages Router 迁 App Router 时想知道根因的人；考虑 Next.js vs React Router v7 vs TanStack Start 的 tech lead。
- **不是这个主题的读者**：
  - 没写过 React 的（先读 `react/` 主题再来）
  - 想要"30 分钟搭一个 Next.js 应用"教程的（这里讲为什么这么设计，不讲配方）
  - 想学 Next.js 13 之前 Pages Router 全套的（本主题以 App Router 为主线，Pages Router 只在 P1.1 历史 + P2.1 对照中出现）

---

## 整体设计：7 阶段 · 沿"从路由到部署的全栈链路"展开

Next.js 的核心问题：**把 React 的渲染模型扩展到全栈，同时不让前端工程师变成运维**。这套框架 10 年来从"SSR + getInitialProps"演进到"App Router + RSC + Server Actions + PPR"，每一步都是在 React 自身能力上做"约定 + 缓存 + 部署"的加法。我们按"用户从写一个 page 到上线"的链路展开 7 阶段。

| 阶段 | 章数 | 核心问题 |
|---|---|---|
| **P1 · Next.js 是谁** | 2 | 项目史 2016-2026（从 getInitialProps 到 Cache Components）+ 元框架同代人横评（Remix / RR v7 / TanStack Start / Astro / SvelteKit / Nuxt） |
| **P2 · App Router 心智** | 2 | 文件系统路由约定（page / layout / loading / error / parallel / intercepting）；Server / Client 边界与序列化 |
| **P3 · RSC 与流式渲染** | 2 | RSC 工作原理（payload 协议 + flush）；Suspense 流式 + selective hydration + loading UX |
| **P4 · Server Actions 与数据变更** | 1 | `'use server'` 函数 / form actions / 与 React 19 hooks 协作 / revalidate / 安全边界 |
| **P5 · 缓存系统真相** | 2 | 五层缓存模型（v13-15）→ Cache Components（v16）；PPR + `'use cache'` + revalidate 决策 |
| **P6 · Turbopack 与工具链** | 1 | Turbopack 内部（Rust + 增量计算 + Webpack 数据兼容）；与 Vite / Bun build / Rspack 横评 |
| **P7 · 部署模型 + 生态决策** | 2 | Edge / Node runtime + 部署矩阵（Vercel / self-host / standalone / static export）；生态决策（image / font / metadata / auth）+ Next.js vs RR v7 vs TanStack Start 收束 |

总计 **12 章 ≈ 80,000-90,000 字**，平均每章 7,000 字。**比重偏向 P2-P5**（App Router + RSC + Server Actions + 缓存是日常主战场，也是踩坑最多的地方），P1 / P6 / P7 写得紧凑。

---

## 与既有主题的边界 ——「短重述 + 链回」原则

Next.js 主题与已写主题大量交叉，必须明确划界：

> ✅ **短重述**：1-3 句话点出"它在底层是什么 + 关键性质"
> ✅ **链回**：紧跟一句"详细的 X / Y / Z 请参考 [`主题/{phase}/{chapter}`]"
> ❌ **不要**直接抄一遍其他主题的论述

**关键边界**：

| 概念 | 在哪讲透 | 本主题里怎么处理 |
|---|---|---|
| React Server Components 心智模型 | `react/06-modern/01-server-components.html` | 链回，P3.1 直接讲 Next.js 怎么实现 RSC 协议（payload 序列化、flush 机制）|
| React 19 Actions / `useActionState` / `useOptimistic` | `react/06-modern/02-actions.html` | 链回，P4.1 短重述 React 侧 hooks，专讲 Next.js Server Actions 怎么和它们对接 |
| Suspense / Error Boundary | `react/05-concurrent/02-suspense.html` 与 `04-error-boundary.html` | 链回，P3.2 直接讲 `loading.tsx` / `error.tsx` 文件约定怎么映射到 Suspense / ErrorBoundary |
| Fiber / Concurrent | `react/04-fiber/` 与 `react/05-concurrent/` | 链回，P3.2 讲 selective hydration 时点 Fiber 调度 |
| ESM / CJS / Module Records | `vite/03-modules/` 与 `ecma/07-execution/04-modules-tla.html` | 链回，P6.1 讲 Turbopack 模块图时短重述 |
| Webpack / Rollup / esbuild bundler 史 | `vite/01-overview/01-build-tool-history.html` | 链回，P6.1 讲 Turbopack 与 Webpack 兼容 + 横评时短重述 |
| Vite dev server / HMR | `vite/02-vite-architecture/` 与 `vite/05-hmr/` | 链回，P6.1 横评时点出 Vite 双模与 Turbopack 的差异 |
| Bun bundler / runtime | `bun/04-toolchain/02-bun-build.html` 与 `bun/02-runtime/` | 链回，P6.1 横评 + P7.1 部署运行时讨论时点 |
| HTTP/2 / HTTP/3 / Streaming | 待写 HTTP 主题 | 链回（暂占位），P3.2 讲流式渲染时点 |
| pnpm workspace + monorepo | `pnpm-monorepo/04-workspaces/` | 链回，P6.1 讲 Turbopack monorepo 解析时点 |
| Vitest + Playwright + 测试金字塔 | `testing/` 主题 | 链回，P7.2 生态决策树点 Next.js 测试栈选择 |
| TypeScript（generics / utility types / module resolution）| `typescript/` 主题 | 链回，P2 / P4 各章用到时短重述 |
| V8 / Node runtime（streams / fetch / Web APIs）| `v8/` 与 `node/` 主题 | 链回，P7.1 讲 Node vs Edge runtime 时点 V8 isolate / Web APIs |
| 浏览器渲染（CSS / Web Vitals） | `browser-rendering/` 主题 | 链回，P7.2 讲 next/font / next/image 优化 LCP/CLS 时点 |
| WebAssembly | `wasm/` 主题 | 链回（暂时少用），P6.1 讲 SWC / Turbopack 编译产物时一笔 |

---

## 内容覆盖原则 ——「nextjs.org 系统化 + 设计动机回到 RFC / blog」

Next.js 领域的特点：**版本演进激进、文档随版本快速变化**——两年前的 best practice 在今天可能已经反向（最典型：缓存默认值在 v15 反转）。所以写作时严格遵守：

**4 条规则**：

1. **API 定义以 v16 官方 docs 为准**：所有"现在怎么用"的代码示例锁定 Next.js 16；老 API 只在历史 / 迁移段出现。
2. **设计动机以 release notes / Vercel blog / RFC 为准**：例如"PPR 为什么诞生"原文是 Vercel 2024 blog；写"为什么这么设计"必须回到一手出处，避开二手解读。
3. **历史 / 退场以官方公告为准**：getInitialProps deprecated、Pages Router 的边缘化、Webpack 被 Turbopack 取代、cache-by-default 反转，都有公开公告。
4. **缓存 / 性能数字必标条件**：Next.js 缓存层多、性能数字争议大，"PPR 比 SSG 快 N 倍"必须标场景（数据来源 + 流式还是非流式 + Vercel 还是 self-host），否则不写。

---

## 节奏建议

- **连读组**：
  - P1.1 + P1.2（项目史 → 同代人，理解 Next.js 在元框架格局里的位置）
  - P2.1 + P2.2（App Router 路由约定 → Server/Client 边界，必须连读才能建立 App Router 心智）
  - P3.1 + P3.2（RSC 工作原理 → 流式渲染，前者是协议后者是落地）
  - P5.1 + P5.2（缓存五层模型 → Cache Components + PPR 决策，缓存是 Next.js 最难的部分，必须连读）
- **可独立跳读**：
  - P4.1 Server Actions、P6.1 Turbopack、P7.1 部署矩阵、P7.2 生态决策
- **建议阅读顺序**：
  - **写业务 Next.js 的工程师**：P2 → P3 → P4 → P5（重点）
  - **从 Pages Router 迁 App Router 的人**：P1.1（看演进）→ P2 → P5（缓存反转是最大坑）
  - **tech lead / 选型者**：P1.2 → P5 → P7.2
  - **想深入引擎的好奇心**：P3.1 → P5.1 → P6.1

---

## 章节简述

> 下面每章列出**核心问题 + 关键内容 + 写作要点**。每章按 6 段模板（速览 → 底层逻辑 → 应用场景 → 典型代码 → 常见陷阱 → 延伸阅读）。

### P1 · Next.js 是谁（2 章）

#### 1.1 Next.js 项目史 2016-2026

- **核心问题**：Next.js 怎么从一个 SSR 工具变成全栈元框架？每一次大版本跃迁解决了什么具体痛点？
- **关键节点**：
  - **2016** Next.js 1.0（Vercel/Zeit 开源）：getInitialProps + Pages Router + 自动 code splitting；解决"React + SSR 配置地狱"
  - **2019** Next.js 9：TypeScript / API Routes / 自动静态优化；标志 Next.js 从"SSR 工具"扩展为"全栈"
  - **2020** Next.js 9.3 + 9.5：getStaticProps / getServerSideProps / ISR；从"运行时 SSR"分化出"build-time + 运行时 + 增量"三种模式
  - **2022** Next.js 13：App Router beta + RSC + Turbopack alpha + 新 image/font；最大一次断代式重写，押注 RSC
  - **2023** Next.js 14：Server Actions stable + PPR 预览；表单全栈化
  - **2024** Next.js 15：React 19 + async request APIs + Turbopack dev GA；**默认缓存从 cache-by-default 改为 explicit-opt-in**（被骂最多的"反转"）
  - **2026** Next.js 16：Turbopack prod GA + PPR GA + Cache Components（`'use cache'` 替代 dynamicIO）+ 三个新缓存函数；这一版把缓存系统重新理顺
- **关键转折点**：
  - **2022 押注 RSC**：当时 React Server Components 还在 RFC，Vercel 直接押宝并把 App Router 围绕它建；这是 Next.js 与 Remix（RR v7）路线分叉的根本点
  - **2024 缓存反转**：v13-14 默认 fetch 缓存"激进"踩了大量生产坑，v15 把默认改回 explicit；v16 用 Cache Components 重做心智
  - **2025-2026 Turbopack 上岸**：Webpack 终于完全被 Rust 替代
- **写作要点**：用一张时间线 SVG 串起来；每个节点配一句"它解决了什么前一版的痛点"。**避免**纯版本号罗列；**强调**断代式重写（13 / 16）的设计赌注。

#### 1.2 元框架同代人横评 + 设计哲学

- **核心问题**：Next.js 在元框架格局里站在哪？为什么 Vercel 选择"Server-first + 约定 + 缓存"这条路？
- **同代人**：
  - **React Router v7**（formerly Remix）：loaders + actions + nested routes；2024 Remix 和 RR 合并；优势是"贴近 Web 标准"，劣势是不押注 RSC
  - **TanStack Start**：2025 起 beta；vendor-neutral；与 TanStack Query/Router 同生态
  - **Astro**：内容站点为主；Islands 架构；`server:defer` + 选择性 hydration；2026 也加了 Server Actions
  - **Qwik City**：Resumability（不 hydrate 而是 resume）；理论先进但生态小
  - **SvelteKit / Nuxt 3**：非 React 阵营对照
- **横评维度**：
  - 路由模型（文件 vs 配置）
  - 数据获取（loader vs RSC + fetch）
  - 表单（Action vs Server Action）
  - 默认渲染（SSR vs SSG vs Streaming vs Resumable）
  - 部署（vendor-locked vs neutral）
  - 缓存（框架管 vs 用户管）
- **Next.js 的 4 个核心设计赌注**：
  1. **Server-first**：默认 RSC，client component 是 opt-in 边界；和 Remix 的"Web 标准 form first"是不同哲学
  2. **约定优于配置**：文件夹 = 路由段；page.tsx / layout.tsx / loading.tsx 全是约定；和 TanStack Router 的"代码定义路由"对立
  3. **框架管缓存**：从 v13 起就把缓存层做成框架职责（fetch cache / Router Cache / `unstable_cache` / Cache Components）；和 Astro/Remix 的"用户管"不同
  4. **Vercel 部署优先**：所有新特性都先在 Vercel 验证；self-host 总是滞后（特别是 ISR + edge middleware）
- **2026 现状**：
  - 新项目大约 **60-70% 选 Next.js**（含 Vercel 生态）
  - **15-20% React Router v7**（重 Web 标准 / 多 vendor 团队）
  - **TanStack Start 增长快**（vendor-neutral 的下一代）
  - **Astro** 在内容站点 / 文档站点稳态领先
- **何时不选 Next.js**：
  - 强 self-host + 不想被 Vercel 缓存抽象绑架
  - 团队不接受 RSC 心智（要纯 Client app）
  - 内容站点（Astro 更合适）
- **写作要点**：横评要有具体决策矩阵（不是"差不多"）；每个对手的优势必须客观写；最后一段给"我推荐 X，因为 Y"的强观点。

---

### P2 · App Router 心智（2 章）

#### 2.1 文件系统路由与约定

- **核心问题**：App Router 用了哪些文件约定？这些约定怎么映射到 React 渲染树？
- **核心约定**：
  - `page.tsx` / `layout.tsx` / `loading.tsx` / `error.tsx` / `not-found.tsx` / `template.tsx` / `default.tsx`
  - 动态段：`[slug]` / `[...slug]` / `[[...slug]]`
  - 路由分组：`(group)` —— 不影响 URL，只影响代码组织
  - 私有文件夹：`_internal/`
  - **Parallel Routes**（`@slot`）：同时渲染多个独立的子路由，常用于 dashboard 多面板 + modal
  - **Intercepting Routes**（`(.)folder` / `(..)folder`）：在不离开当前页面的情况下"插队"渲染，常用于图片预览 / 详情 modal
  - **Route Groups + Multiple Root Layouts**：一个 app 里有多个 root layout（marketing site + app）
  - `route.ts`（Route Handlers，REST/HTTP API）
- **App Router vs Pages Router 关键差异**：
  - **Pages Router**：每个 page 是一棵独立的渲染树；layout 用 `_app.tsx` 全局包裹
  - **App Router**：嵌套布局原生；同一个 layout 在路由切换时不重新挂载（state 保留）
  - **Pages Router**：getStaticProps / getServerSideProps 在 page 层
  - **App Router**：每个 Server Component 都可以独立 fetch；数据获取分散
- **关键代码示例方向**：
  - 一个 dashboard 路由结构（`/dashboard/[orgId]/(workspace)/projects/[projectId]/...`）
  - Parallel Routes 实现 `@modal` slot 的 modal 模式
  - Intercepting Routes 实现 Twitter/Instagram 风格的图片详情 modal
- **写作要点**：路由是 Next.js 的入口心智，必须用具体例子讲清"哪个文件管什么"；avoid 罗列所有 API，**只**讲"实战会用到 + 容易踩坑"的那 7-8 个约定。

#### 2.2 Server / Client 边界与序列化

- **核心问题**：`'use client'` 和 `'use server'` 是边界标记，不是文件类型；React 怎么判断哪段在哪边？序列化怎么过桥？
- **核心心智**：
  - **默认 Server**：App Router 里所有组件默认是 RSC，除非你写 `'use client'`
  - **`'use client'` 是模块边界**：标记后，整个模块 + 它 import 的所有东西都打到 client bundle（除非进一步是 Server-only 模块）
  - **`'use server'` 是函数边界**：标记后，函数变成 Server Action（详见 P4）
  - **跨边界传值规则**：Server Component → Client Component 的 props 必须可序列化（plain object / 数组 / Promise / Date / Map / Set / RegExp 都行；class instance / 函数 / Symbol 不行）
  - **特例**：函数 props 不能传，但你可以传 **Server Action 的引用**（'use server' 标记的函数会被替换成"调用句柄"）
- **典型陷阱**：
  - 在 Server Component 里 `useState` → 报错（Server 没有 state）
  - 在 Client Component 里直接 import server-only 模块 → 报错；用 `import 'server-only'` 防御
  - 把 Date 转字符串再传给 Client Component（无必要，可以直接传 Date）
  - children prop 是"已经渲染好的 RSC 树"，可以直接塞进 Client Component（这是混合的关键技巧）
- **关键模式**：**Server Component 包 Client Component 包 Server Component**（通过 children）—— 让 Client Component 不污染整棵子树
- **关键代码示例方向**：
  - 一个 Theme 切换器（Client）包一个 Markdown 渲染（Server，能 await fs 读文件）
  - props 序列化失败的几种典型错误
  - `import 'server-only'` 与 `import 'client-only'` 的防御性使用
- **写作要点**：**这是 App Router 最难建立的心智**；用对比图（一棵树着两种颜色）讲；**避免**抽象描述，多用真实代码。链回 react 主题 P6.1 RSC 心智。

---

### P3 · RSC 与流式渲染（2 章）

#### 3.1 RSC 工作原理：payload 协议与 flush

- **核心问题**：RSC payload 长什么样？Next.js 怎么把它从 server 流到 client？SSR 阶段 + 客户端导航阶段是两套不同的路径吗？
- **核心机制**：
  - **RSC payload**：一段特殊的序列化格式（不是 HTML，也不是 JSON）—— 描述"组件树 + props + 异步占位 + Client Component 引用"；React 团队定的协议（参考 `react-server-dom-webpack`）
  - **首次访问（SSR）**：Server 同时输出 HTML（给搜索引擎 + 首屏）和 RSC payload（给 hydration / 后续导航对账）；HTML 里嵌着 `<script>self.__next_f.push(...)</script>` 流式注入 RSC payload
  - **客户端导航**：Server 只返回 RSC payload，不返回 HTML；Router 用 payload 局部更新树
  - **flush 机制**：每次 `Suspense` boundary 解析完，server 立刻 push 一段 chunk 到 stream；这就是流式渲染的本质
- **payload 真实形态**（用一段实际抓包的简化示例展示）：
  ```
  0:["$","html",null,{...
  1:I["chunks/page.js",["chunks/123.js"],"Page"]
  2:["$","$L1","",{...}]
  ```
- **与传统 SSR 区别**：
  - 传统 SSR：server 渲染整棵 HTML → client hydrate 整棵
  - RSC：server 渲染"server 部分 + client 占位"→ client 只 hydrate client 占位
  - 关键差异：**RSC bundle 不下发 server component 代码到 client**（这是包体积优化的根源）
- **关键代码示例方向**：
  - 抓一个真实的 RSC 流式请求 trace
  - 对比 `await fetch` 在 RSC 和传统 SSR 里的执行时机
- **写作要点**：唯一允许引用 React 源码 / Next.js 源码的章；**这一章是 RSC 神话祛魅**——讲清楚 payload 长啥样、stream 怎么走，比讲一千句"RSC 很神奇"有用。链回 react 主题 P6.1。

#### 3.2 Suspense 流式 + Selective Hydration + loading UX

- **核心问题**：`loading.tsx` 怎么映射到 React Suspense？流式渲染下 hydration 怎么按需进行？
- **核心机制**：
  - **`loading.tsx`**：约定 = `<Suspense fallback={<Loading />}>{children}</Suspense>` 包裹 page
  - **嵌套 Suspense**：每个 layout 段都可以有自己的 loading.tsx；流式时分段 reveal
  - **Selective Hydration**：React 18+ 特性—— 一段 hydrate 完就立即可交互，不等整棵树 hydrate；Next.js App Router 默认开
  - **loading.tsx vs `<Suspense>`**：约定式自动包 vs 手写控制；何时用哪个
  - **error.tsx + 错误边界**：约定 = ErrorBoundary 包裹；reset 函数 + 错误恢复
  - **template.tsx vs layout.tsx**：template 每次导航都重新挂载，layout 不重挂；用于 reset 状态的场景（页面级别 transition / animation）
- **流式渲染 UX 案例**：
  - 一个慢接口（3 秒）+ 一个快接口（200ms）—— 快的先显示 + 慢的占位 + 解析后填充
  - 多个 Suspense boundary 并行流（每个独立 reveal）
  - **避免 waterfall**：在 Server Component 里把多个 fetch 提前并行（`Promise.all` / 早期 trigger）
- **关键代码示例方向**：
  - 一个 dashboard 页面：导航条（快）+ 数据卡片（中）+ 图表（慢）三段独立流
  - waterfall 反例 + 修复（在 layout 提前触发 fetch）
  - 错误恢复：error.tsx 的 reset 与 Server Action 配合
- **写作要点**：流式是 Next.js 用户**直接能感知的最大特性**；用 Network timeline 截图讲；链回 react 主题 P5.2 Suspense + P5.4 Error Boundary。

---

### P4 · Server Actions 与数据变更（1 章）

#### 4.1 Server Actions 全谱

- **核心问题**：Server Actions 是什么？它和 Route Handlers / 传统 API 有什么区别？怎么和 React 19 的表单 hooks 配合？
- **核心机制**：
  - **`'use server'` 标记函数** → 函数被替换成"调用句柄"，client 实际调用时变成一次 POST 请求到当前路由（带 action ID 路由）
  - **3 种声明位置**：
    - 文件级别 `'use server'`（整个文件的 export 都是 actions）
    - 函数内 `'use server'`（仅这个函数）
    - 在 Server Component 里 inline 定义
  - **跨边界传递**：可以从 Server Component 传给 Client Component 作为 prop；可以传给 `<form action={...}>` 作为表单提交目标
  - **与 React 19 hooks 配合**：
    - `useActionState`：把 action 包成有 state 的 form
    - `useFormStatus`：在表单子组件里读 `pending`
    - `useOptimistic`：乐观更新
  - **revalidate 三件套**：
    - `revalidatePath('/foo')`：让某个路径下次访问重新生成
    - `revalidateTag('user')`：让带这个 tag 的所有 fetch 失效
    - **`updateTag('user')`**（v16 新）：失效 + 在当前请求内立即重新计算（不等下次访问）
  - **redirect / cookies / headers**：在 action 内可调用
- **安全边界**：
  - **CSRF**：Server Actions 自带 origin 校验 + 加密的 action ID（v15+）
  - **Auth**：action 内必须重新校验权限（不要假设"能调用 = 已登录"）
  - **不要把秘密信息暴露**：action 名称 / 文件位置都会出现在 client（虽然 ID 加密）
  - **大文件上传**：注意 body size limit；推荐配合直传 S3 模式
- **何时用 Server Actions vs Route Handlers**：
  - **Server Actions**：表单 / 数据变更 / 与 React 19 hooks 配合 / progressive enhancement（无 JS 也能 submit）
  - **Route Handlers** (`route.ts`)：REST API / 第三方 webhook / 与非 React 客户端通信 / 需要返回非 React 友好格式（image/PDF/CSV）
- **关键代码示例方向**：
  - 一个 todo CRUD：useActionState + useOptimistic + revalidateTag 完整闭环
  - 表单 progressive enhancement（关 JS 也能 submit）
  - file upload 与 Server Action 配合
  - 与 zod 校验配合
- **写作要点**：Server Actions 是 Next.js 把"表单 + 数据变更"重新整合的核心；强调它解决了"传统 React 表单要写 fetch + 自己管 loading + 自己 revalidate 缓存"的繁琐。链回 react 主题 P6.2。

---

### P5 · 缓存系统真相（2 章 ⭐ 最难）

#### 5.1 五层缓存模型 → Cache Components 重构

- **核心问题**：Next.js 缓存为什么这么难懂？v13-15 五层缓存模型踩了哪些坑？v16 Cache Components 怎么重新理顺？
- **v13-15 五层缓存（要把每一层讲清楚）**：
  1. **Request Memoization**：同一次 request 内的 fetch 去重（基于 React cache）
  2. **Data Cache**：跨 request 持久化的 fetch 缓存（`{ next: { revalidate, tags } }`）
  3. **Full Route Cache**：整个 route 的渲染结果缓存（决定 static vs dynamic）
  4. **Router Cache**（client）：导航时的客户端 RSC payload 缓存
  5. **CDN / 浏览器**（外层）
- **v13-14 的问题**：
  - **默认 cache-by-default**：fetch 不写选项就被缓存；很多团队踩了 stale data 的坑
  - **dynamic 触发条件不直观**：用了 cookies / headers 整个 route 自动 dynamic；不告诉你
  - **revalidatePath 副作用大**：能炸掉一大片 cache
  - **5 层叠加心智复杂**：用户根本说不清"为什么这次拿到旧数据"
- **v15 反转**：默认改为 explicit-opt-in；fetch 不写选项就是 dynamic；要 cache 必须显式 `{ cache: 'force-cache' }`
- **v16 Cache Components**（最大变革）：
  - **`'use cache'`** 函数级 / 文件级指令 —— 把"哪段是 cacheable 单元"显式标出来
  - **PPR 默认开**：`cacheComponents: true` 后整个 app 走"static shell + dynamic holes"
  - **静态壳（用 `'use cache'` 包的部分）+ 动态洞（Suspense + 读 cookies/headers/runtime APIs 的部分）**
  - 旧的 `unstable_cache` 被 `'use cache'` 替代
  - **`updateTag`**：在当前请求内立即失效 + 重新计算（解决"提交后立刻看到新数据"）
- **迁移路径**（v15 → v16）：
  - 把 `unstable_cache` 改 `'use cache'`
  - 把整个 page 拆成"static 部分 + Suspense 包的 dynamic 部分"
  - revalidate 策略重新设计
- **写作要点**：这是 Next.js 最被骂的部分；**必须**讲清"v13-14 哪里设计错了 + 为什么 v16 这么改"；用一张演化图。链回 react 主题 P6.1（cache 是 RSC 推动的）。

#### 5.2 PPR + `'use cache'` + revalidate 决策

- **核心问题**：拿到一个新页面，怎么决定每段是 static 还是 dynamic？revalidate 用 path / tag / updateTag 哪个？
- **决策框架**：
  - **看每段数据的"新鲜度要求"**：
    - 永久不变（marketing 文案 / 文档）→ static / 长 revalidate
    - 周期性更新（榜单 / 热门）→ ISR + revalidate 时间
    - 用户/请求特定（dashboard / 个性化）→ dynamic
    - 写后立即变（提交表单 + 立刻显示）→ updateTag
  - **看每段是否依赖 cookies / headers**：依赖 → dynamic（在 Suspense 里）
- **PPR 心智**：
  - 一个 page = 静态壳（CDN 秒返）+ 动态洞（流式补齐）
  - 静态壳的边界 = `'use cache'` 标记的最外层组件
  - 动态洞 = `<Suspense>` 包的、读 cookies/headers/搜索参数的部分
- **revalidate 三件套决策**：
  - `revalidatePath('/foo')`：知道哪个 URL 受影响
  - `revalidateTag('user-123')`：知道哪个数据 ID 受影响（更精准）
  - `updateTag('user-123')`：本次请求内就要看到新数据（提交表单后立即显示）
- **典型场景**：
  - **Blog**：page 是 'use cache' + 长 revalidate；评论区是 Suspense 包的 dynamic
  - **Dashboard**：导航是 'use cache'；数据卡片是 dynamic（reads cookies）
  - **Todo**：列表 'use cache' + tag('todos')；新增 action 用 updateTag 立刻刷
- **常见陷阱**：
  - 在 'use cache' 函数里读 cookies → 错误（cache 不能依赖 request-specific）
  - revalidateTag 的 tag 没在 fetch 里声明 → 静默无效
  - PPR 下 Suspense fallback 必须能 hydrate 成有意义 UI（不能是空 div）
- **写作要点**：本章要给一份**完整决策树 SVG**；每个分支配一段代码。这是 Next.js 主题最实战的一章，要让读者读完能直接判断生产代码该怎么改。

---

### P6 · Turbopack 与工具链（1 章）

#### 6.1 Turbopack 内部 + Bundler 横评

- **核心问题**：Turbopack 怎么实现"比 Webpack 快 10-20 倍"？为什么 Vercel 押 Rust 而 Vite 押 esbuild + Rolldown？
- **Turbopack 内部**：
  - **Rust + 增量计算引擎（turbo-tasks）**：每个编译单元是一个可缓存的 task；改了一个文件只重算受影响的 task
  - **与 Webpack 数据兼容**：loader / plugin 接口部分兼容（迁移友好）
  - **基于 SWC**（Rust 写的 Babel 替代）
  - **dev + prod 共用同一套 pipeline**（v16 stable）
- **Bundler 格局对照**（链回 vite 主题）：
  - **Webpack**：JS 写、生态最丰富、慢
  - **esbuild**：Go 写、最快但功能有限（Vite dev 用它）
  - **Rolldown**：Vite 自家的 Rust Rollup-compat 重写（2026 GA），Vite 7 默认
  - **Rspack**：字节跳动的 Rust Webpack-compat 重写
  - **Bun build**：Zig 写、与 Bun runtime 同源（链回 bun 主题）
  - **Turbopack**：Rust + 增量、Vercel 押注
- **横评维度**：
  - 速度（dev 启动 / HMR / prod build）
  - 生态兼容（Webpack loader 复用度）
  - prod 产物质量（tree-shaking / code-split）
  - 是否绑定单一框架（Turbopack ≈ Next.js 专用；其他基本通用）
- **为什么 Vercel 押 Turbopack 而不是用 Vite**：
  - 想完全控制全栈（dev server + prod bundle + RSC + cache 一体）
  - Vite 的双模架构（dev ≠ prod）在 RSC 流式场景有适配负担
  - 长期赌 Rust 比 Go/Zig 在增量计算上更适合
- **2026 现状**：
  - Next.js 16+ 默认 Turbopack（不再有 Webpack）
  - 其他框架（Remix / TanStack Start / Astro / SvelteKit）基本都基于 Vite + Rolldown
  - Bundler 战争实质结束：Rust 是赢家，路径只剩两条（Turbopack vendor-locked / Vite-Rolldown 通用）
- **写作要点**：本章是工具链章，深度可控；**重点**讲"Turbopack 的增量计算心智 + 为什么它和 Vite 路线分叉"；不展开所有 API。链回 vite 主题 P1 + P2 + P6 + bun 主题 P4.2。

---

### P7 · 部署模型 + 生态决策（2 章）

#### 7.1 Edge / Node Runtime + 部署矩阵

- **核心问题**：Next.js 在哪些 runtime 上跑？Edge runtime 限制是什么？self-host 和 Vercel 部署有什么本质差异？
- **两套 runtime**：
  - **Node.js runtime**（默认）：完整 Node API；冷启动慢；适合 dashboard / dynamic page
  - **Edge runtime**（V8 isolate，Web APIs 子集）：冷启动几乎 0；不能用 Node API（fs / child_process / 部分 npm 包）；适合 middleware / 简单 routing / auth check / a/b test
  - **指定方式**：`export const runtime = 'edge' | 'nodejs'`
  - **middleware.ts 永远在 Edge runtime**
- **Edge runtime 限制**：
  - 没有 fs / child_process
  - 没有部分 npm 包（特别是 native bindings）
  - 内存限制 + CPU 时间限制（Vercel 50ms-30s 不等）
  - 包大小限制（影响冷启动）
- **部署模型**：
  - **Vercel**（一等公民）：所有特性即开即用；ISR / Edge Functions / 缓存层全自动
  - **`output: 'standalone'`**：Node.js 自部署；ISR + revalidate 需要持久化层（Redis / FS）
  - **`output: 'export'`**（static export）：纯静态；不支持 ISR / Server Actions / Edge middleware；适合纯营销站
  - **Cloudflare Workers / Pages**：通过 OpenNext.js 适配；2026 已比较成熟
  - **Docker / Kubernetes**：standalone + 自管 cache 层
- **self-host 的痛点**：
  - **缓存持久化**：默认 fs cache 在容器重启会丢；需要自定义 cache handler（v16 文档新增）
  - **ISR**：需要协调多实例间的 revalidate
  - **Image Optimization**：Vercel 自带，self-host 要么禁用 next/image 优化、要么自部署 sharp
- **关键代码示例方向**：
  - 一个 Dockerfile（standalone + cache handler）
  - 自定义 cache handler 接 Redis
  - middleware.ts 实现 a/b test（Edge runtime 跑）
- **写作要点**：本章面向"要 self-host"的工程师；**强调** Vercel 之外的真实生产部署陷阱；链回 v8 主题 P5.1（V8 isolate）+ node 主题（Node runtime）+ 待写 HTTP 主题（CDN / streaming）。

#### 7.2 生态决策树 + Next.js vs 同代人收束

- **核心问题**：用 Next.js 的时候，image / font / metadata / auth 这些选什么？什么时候应该不选 Next.js？
- **Next.js 生态全谱**：
  - **next/image**：自动优化（sharp / squoosh）+ LQIP + lazy + responsive；解决 LCP / CLS
  - **next/font**：build-time 字体优化；自动 self-host Google Fonts；消除 FOIT/FOUT
  - **next/metadata API**：声明式 SEO + OG image + sitemap
  - **next-intl / next-i18next**：国际化（Next.js 内置 i18n 在 v15 移除，转向社区方案）
  - **NextAuth (Auth.js)**：一等公民 auth；OAuth + magic link + 自托管
  - **状态 / 数据**：客户端用 Zustand / Jotai / TanStack Query；Server-side 状态走 RSC + Server Actions
  - **测试**：Vitest（单元）+ Playwright（E2E）→ 链回 testing 主题
  - **Monorepo**：pnpm + Turborepo → 链回 pnpm-monorepo 主题
- **何时用 Next.js**：
  - 全栈 React 应用（dashboard / SaaS / 电商）
  - 重 SEO 的内容站（marketing site）
  - Vercel 部署（一等支持）
  - 需要 RSC + 流式 + Server Actions 完整组合的团队
- **何时不用 Next.js**：
  - **纯 SPA + 自管 backend** → React Router v7 / TanStack Router
  - **不接受 vendor-locked 缓存** → React Router v7 / TanStack Start
  - **内容站点为主** → Astro
  - **不接受 RSC 心智** → Vite + React Router
- **2027 展望**：
  - Cache Components 心智会逐渐稳定（v16 是过渡）
  - Turbopack 全面取代 Webpack 后剩下的优化空间在编译图增量
  - Server Components 协议会被其他框架陆续采用（已在 RR / TanStack Start 路线图）
  - AI 集成（Vercel AI SDK）会成为 Next.js 的下一个差异化点 → 链回待写 AI SDK 主题
- **写作要点**：本章是**实战决策章**；给"看场景选什么"的决策矩阵；最后给"我推荐 X，因为 Y"的强观点收尾。链回 react / testing / pnpm-monorepo / vite / bun 主题。

---

## 写作风格 ——「写文章人，不是建筑师」

> （遵循已有约定）

- **章节内部**：6 段模板（速览 → 底层逻辑 → 应用场景 → 典型代码 → 常见陷阱 → 延伸阅读）
- **跨章引用**：用「短重述 + 链回」，不抄不省
- **图示**：路由树 / RSC 流式 timeline / 五层缓存图 / PPR 静态壳 + 动态洞 / 部署矩阵 全用 SVG
- **代码示例**：每章 5-10 段可运行的真实代码（基于 Next.js 16 主线）
- **加粗（克制）**：每章 ≤ 25 个 `<strong>`；每段不超过 1-2 个；不要靠加粗散点高亮"我觉得重要"的描述句
- **避免**：
  - 罗列 API 文档（链回官方）
  - "架构师式"分类标签（X 派 / Y 流）
  - 中立到没观点（每章必须给"我推荐 X，因为 Y"）
  - 抄 PPT / 抄 release notes（设计动机要回到 RFC / blog 一手）
- **观点强度**：
  - 强观点（"v15 默认缓存反转是迟到的修正"，"Server Actions 应该是数据变更默认选择"）
  - 弱观点（"PPR vs 全 dynamic 看场景"）
  - 不观点（"React Router v7 也是好选择，老项目继续用"）

---

## 不写的内容（明确划线）

- **不讲**：
  - Pages Router 的全套教程（已被边缘化，仅在 P1.1 历史 + P2.1 对照中出现）
  - getInitialProps / getStaticProps / getServerSideProps 详解（同上，仅历史回溯）
  - 完整 next.config.js 选项参考（链回官方 docs）
  - Vercel 平台特定功能详解（KV / Postgres / Blob 这些）
  - RSC 协议的逐字节解析（点到为止，深度有但不展开）
- **链回但不重复**：
  - React 19 hooks（链回 react 主题 P6）
  - Suspense / Concurrent / Fiber（链回 react 主题 P4 + P5）
  - Bundler 历史（链回 vite 主题 P1）
  - ESM / CJS（链回 vite + ecma 主题）
  - 测试栈（链回 testing 主题）
  - pnpm workspace（链回 pnpm-monorepo）
- **暂占位（待写主题）**：
  - 国际化深度 → 暂时社区方案点到
  - Auth 协议（OAuth / OIDC / JWT）→ 待 HTTP / 安全主题
  - HTTP/2 / HTTP/3 / Streaming 协议 → 待 HTTP 主题
  - AI SDK + Vercel AI → 待 AI 主题（与 Next.js 强相关，会双向链）

---

## 路线图

- **Step 1**：本 outline.md 经用户审定 ← **当前**
- **Step 2**：建 8 个文件骨架（`next/index.html` + 7 个 phase 目录的 `index.html`）
- **Step 3**：P1 章节正文（项目史 + 元框架横评，2 章）
- **Step 4**：P2 章节正文（App Router 路由 + Server/Client 边界，2 章）
- **Step 5**：P3 章节正文（RSC 协议 + 流式渲染，2 章）
- **Step 6**：P4 章节正文（Server Actions 全谱，1 章）
- **Step 7**：P5 章节正文（缓存五层 → Cache Components + PPR 决策，2 章 ⭐ 最难）
- **Step 8**：P6 章节正文（Turbopack + bundler 横评，1 章）
- **Step 9**：P7 章节正文（Edge/Node runtime + 部署 + 生态决策，2 章）+ 站点首页卡片改 done

---

## 与 index.html 卡片的对应

Next.js 主题在站点首页的卡片描述（草拟）：
> 7 阶段 / 12 章：项目史 + 元框架横评 + App Router 心智 + RSC 协议与流式 + Server Actions + 五层缓存到 Cache Components + Turbopack + 部署矩阵 + 生态决策。锁定 Next.js 16 主线（Turbopack stable / PPR GA / `'use cache'`），与 React Router v7 / TanStack Start / Astro 横评。

按 ecosystem 主题约定（见 README 设计原则 #6 + memory `convention_weight_center_crossref`）：
- **center of gravity**：⑤ 框架（与 React 同列）
- **不创建 crossref 卡片**：vite / pnpm-monorepo / testing / bun 卡片描述里如需提"也覆盖 Next.js 场景"，在描述文字内自然提及，不开独立卡片
