# TanStack Query / SWR 深度学习 · 章节大纲

> 本文件是「客户端数据获取」主题的写作蓝本。**7 阶段 · 12 章**：把 TanStack Query 当深度主线 + SWR 当横评对照，回答 React 19 + RSC 时代「客户端 fetch 库还该不该用、用在哪、和 Server Components 怎么共存」这一系列绕不开的问题。
> 编写日期：2026-05-07（首版）｜目标版本：TanStack Query v5（最新主线）/ SWR v2（最新主线）/ React 19 / Next.js 16

---

## 元信息

- **目标版本**：
  - **TanStack Query v5**（2023 年 10 月发布，至今主线）—— 单一 object signature（`useQuery({ queryKey, queryFn })`）替代 v4 多参；`gcTime` 替代 `cacheTime` 命名；`pending` 替代 `loading` 状态名；新的 `useSuspenseQuery` / `useSuspenseInfiniteQuery` / `useSuspenseQueries` 三件套（Suspense mode 进入一等公民）；`Promise.withResolvers` 化的 `streamedQuery`；React 19 兼容（fully supports `<Suspense>` + `useTransition`）。
  - **SWR v2**（2023 年起主线）—— `useSWRMutation` 进 stable；`fallback` / `keepPreviousData` 体系化；和 Vercel AI SDK / Next.js 深度配合；2025-2026 维护节奏放缓（Vercel 重心转向 RSC + AI SDK）。
  - **React 19.x**（运行时基础，`use(promise)` API 改变了"异步如何上 UI"的游戏规则）。
  - **Next.js 16**（RSC + Server Actions + Cache Components 让"server state"很大一部分跑到了 server-side，是本主题最难也最绕不开的边界）。
  - 历史回溯：jQuery $.ajax (2006) → fetch + useEffect (2014-2018) → Apollo Client (2016, GraphQL only) → Relay (2015 Meta) → Redux + thunk/saga (2015-2018) → SWR (2019, Vercel) → React Query (2020, Tanner Linsley) → RTK Query (2021) → React Query 改名 TanStack Query (2022) → React 19 `use` API (2024) → RSC + Server Actions 部分接管 server state (2024-2026)。
- **来源**：
  - [tanstack.com/query/latest](https://tanstack.com/query/latest)（官方文档全量）
  - [github.com/TanStack/query](https://github.com/TanStack/query)（仅 P3.2 / P4.2 涉及源码）
  - [swr.vercel.app](https://swr.vercel.app)（SWR 官方文档）
  - Tanner Linsley（TanStack 创始人）的 Twitter / 演讲（设计动机原始解读）
  - Shu Ding（SWR 作者）的相关文章
  - React 团队 RFC：`use(promise)` / Server Components / Actions
  - Dan Abramov / Sebastian Markbåge 关于「server state 该不该从 client 取消」的讨论
- **目标读者**：
  - 写过 React 项目、用过 useEffect + fetch 但被竞态 / loading / cache 搞炸的工程师
  - 用过 TanStack Query / SWR 但对 stale / cacheTime / refetch / mutation 心智模糊的人
  - 在 Next.js / RSC 项目里纠结"还该不该装客户端 fetch 库"的 tech lead
  - 从 Apollo / Redux + thunk 迁过来想知道根因的人
- **不是这个主题的读者**：
  - 没写过 React 的（先读 `react/` 主题再来）
  - 想要"30 分钟接 useQuery"教程的（这里讲 server state 心智 + 与 RSC 边界，不讲配方）
  - 只在 GraphQL 项目用 Apollo / Relay 的（本主题以 REST / fetch 为主线，GraphQL 客户端只在 P6 横评出现）

---

## 整体设计：7 阶段 · 沿"server state 心智 → 库 → 模式 → RSC 边界 → 决策"展开

「客户端数据获取」的核心问题：**server state 和 client state 是两类东西，传统 useState/Redux 并不解决 server state**。Tanner Linsley 在 2020 年提出这个洞见后，整个生态花 5 年时间把它落地。但 2024 起 React 19 + RSC 又把游戏规则又改了一次——`use(promise)` + Server Components 让一部分 server state 直接跑到 server-side，TanStack Query / SWR 的位置必须重新校准。

我们按"从问题到答案，再到 2026 的新边界"展开 7 阶段。

| 阶段 | 章数 | 核心问题 |
|---|---|---|
| **P1 · 是谁 / 为什么** | 2 | 客户端数据获取 15 年史 + 同代人横评（fetch+useEffect / Apollo / Relay / RTK Query / SWR / TanStack Query / RSC fetch）；server state 设计哲学（Tanner 的 manifesto + Vercel SWR 哲学） |
| **P2 · TanStack Query 心智** | 2 | queryKey + queryFn + cacheKey 三件套；stale-while-revalidate + staleTime / gcTime + fetcher 行为模型 |
| **P3 · query / mutation 生命周期** | 2 | useQuery 全谱（pending / error / refetch / select / enabled / placeholderData）；useMutation + invalidation + optimistic updates |
| **P4 · 高级查询模式** | 2 | dependent / parallel / paginated / infinite queries；Suspense mode + queryClient direct API + prefetch |
| **P5 · 与 React 19 + RSC 衔接** ⭐ | 2 | RSC 时代 TanStack Query 还该用吗？hydration 桥（Next.js dehydrate/hydrate）+ `use(promise)` + Server Actions 边界 |
| **P6 · SWR + 同代人横评** | 1 | SWR 设计哲学 + Apollo / Relay / RTK Query / Jotai-Query 等横评 |
| **P7 · 决策与陷阱** | 1 | 何时用 / 不用客户端 fetch 库 + 决策树 + 陷阱清单 + 选型收束 |

总计 **12 章 ≈ 75,000-85,000 字**，平均每章约 6,500 字。**比重偏向 P2-P5**（心智 + 生命周期 + 模式 + RSC 边界是日常主战场），P1 / P6 / P7 写得紧凑。

---

## 与既有主题的边界 ——「短重述 + 链回」原则

> ✅ **短重述**：1-3 句话点出"它在底层是什么 + 关键性质"
> ✅ **链回**：紧跟一句"详细的 X / Y / Z 请参考 [`主题/{phase}/{chapter}`]"
> ❌ **不要**直接抄一遍其他主题的论述

**关键边界**：

| 概念 | 在哪讲透 | 本主题里怎么处理 |
|---|---|---|
| React Server Components / RSC payload | `react/06-modern/01-server-components.html` + `next/03-rsc-streaming/` | 链回，P5.1 短重述 RSC 是怎么从 server 流到 client 的 |
| React 19 `use(promise)` API | `react/06-modern/02-actions.html`（含 use API） | 链回，P5.2 直接讲 use API 怎么消费 TanStack Query 的 promise |
| Server Actions / `'use server'` | `next/04-server-actions/` | 链回，P5.1 讲 Server Actions 是不是 mutation 的替代品 |
| Next.js Cache Components / `'use cache'` | `next/05-caching/` | 链回，P5.1 讨论"server cache vs client cache 双层"问题 |
| Suspense / Error Boundary | `react/05-concurrent/02-suspense.html` 与 `04-error-boundary.html` | 链回，P4.2 + P5.2 讲 useSuspenseQuery + Suspense 集成 |
| Concurrent / Transition | `react/05-concurrent/` | 链回，P3.1 讲 placeholderData + transition 的关系 |
| Hooks 心智 / closure 陷阱 | `react/03-hooks/` | 链回，P3.1 讲 enabled / queryFn 闭包陷阱 |
| useEffect 反模式 | `react/03-hooks/` | 链回，P1.1 历史回溯讲"useEffect + fetch 为什么都错" |
| fetch / streams / AbortController | `javascript/` 主题（网络层） | 链回，P3.1 讲 query cancellation |
| HTTP/2 / HTTP/3 / streaming | 待写 HTTP 主题（紧接本主题之后） | 链回（暂占位），P4.2 讲 streamedQuery 时点 |
| TypeScript 泛型 / utility types | `typescript/` 主题 | 链回，P2-P4 章在用到 generic queryFn / queryClient 类型时短重述 |
| 测试（mock fetch / MSW） | `testing/06-msw/` | 链回，P7.1 决策章点测 query 用 MSW 而不是 mock useQuery |
| Vercel AI SDK 流式 | 待写 AI SDK 主题 | 链回（暂占位），P5.2 讲 streamedQuery + Vercel AI SDK useChat 的关系 |

---

## 内容覆盖原则 ——「TanStack docs 系统化 + 设计动机回到 Tanner 原文」

TanStack Query 的特殊处：**项目由一个人主导（Tanner Linsley），文档和设计动机大量出自他的 Twitter / 博客 / 演讲**。所以写作时严格遵守：

**4 条规则**：

1. **API 定义以 TanStack Query v5 官方 docs 为准**：所有"现在怎么用"的代码示例锁定 v5；老 API（v3 / v4）只在历史 / 迁移段出现。
2. **设计动机以 Tanner Linsley 一手出处为准**：`server state vs client state` 二分、`stale-while-revalidate` 心智、queryKey 设计都有他的原文，写"为什么这么设计"必须回到一手。
3. **SWR 视角以 Vercel 官方为准**：SWR 是 Vercel 出品，设计哲学和 Vercel 的"边缘部署 + 简单 API"路线深度绑定，写 SWR 章节必须区分"Vercel 视角"和"Tanner 视角"。
4. **RSC 边界讨论必须双向引用**：P5 讨论 TanStack Query + RSC 共存时，每一段都要交叉引用 React/Next.js 团队的官方说法 + Tanner 的回应（避免"我猜他们想这样"）。

---

## 节奏建议

- **连读组**：
  - P1.1 + P1.2（历史 → 哲学，理解 server state 为什么是独立概念）
  - P2.1 + P2.2（queryKey → stale-while-revalidate，必须连读才能建立 TanStack Query 心智）
  - P3.1 + P3.2（query → mutation，前者读后者写）
  - P5.1 + P5.2（RSC 还该不该用 → 怎么用，必须连读）
- **可独立跳读**：
  - P4.1 高级查询、P4.2 Suspense + prefetch、P6.1 SWR + 同代人、P7.1 决策树
- **建议阅读顺序**：
  - **写 React + useQuery 业务的工程师**：P2 → P3 → P4（重点）
  - **从 Apollo / Redux 迁过来的人**：P1.1（看演进）→ P1.2（看哲学差异）→ P2 → P5
  - **Next.js / RSC 项目纠结要不要装的人**：P1.2 → P5（重点）→ P7
  - **tech lead / 选型者**：P1.2 → P5 → P6 → P7

---

## 章节简述

> 下面每章列出**核心问题 + 关键内容 + 写作要点**。每章按 6 段模板（速览 → 底层逻辑 → 应用场景 → 典型代码 → 常见陷阱 → 延伸阅读）。

### P1 · 是谁 / 为什么（2 章）

#### 1.1 客户端数据获取 15 年史 + 同代人横评

- **核心问题**：从 jQuery $.ajax 到 RSC fetch，客户端数据获取这条线 15 年踩了哪些坑？为什么每隔几年就有一个新方案，旧的就被嫌弃？
- **关键节点**：
  - **2006-2014** jQuery `$.ajax` + 回调地狱 / Promise（jQuery Deferred → ES6 Promise）
  - **2014-2018** React + `componentDidMount` 取数 / `componentDidUpdate` 同步—— 引入「组件挂载等于发请求」直觉
  - **2015-2016** Redux + redux-thunk / redux-saga：把异步状态当 client state 写；冗长但可控
  - **2015** Relay（Meta）+ **2016** Apollo Client：GraphQL 阵营把 server state 系统化（cache + normalized store + optimistic）
  - **2018-2019** React Hooks（16.8）+ `useEffect + fetch` 反模式（竞态 / cleanup / loading 状态各写一遍）
  - **2019** SWR（Vercel + Shu Ding）：把 stale-while-revalidate（HTTP 缓存语义）搬进 React，简洁 API + 全局缓存
  - **2020** React Query v1（Tanner Linsley）：明确 server state ≠ client state，提出独立的「query lifecycle」抽象
  - **2021** RTK Query（Redux Toolkit 内置）：Redux 阵营对 React Query 的回应；把 RTK + React Query 心智合一
  - **2022** React Query → TanStack Query（改名 + 多框架支持：Vue / Solid / Svelte）
  - **2023** TanStack Query v5：单一 object signature / `gcTime` 改名 / Suspense mode 一等公民
  - **2024** React 19 `use(promise)` + Server Components：**部分 server state 直接 server-side 解决，不再过 client cache**
  - **2026** TanStack Query v5 + Next.js 16 RSC 共存模式落地（hydration 桥成熟）；SWR 维护放缓
- **同代人横评**：
  - **fetch + useEffect**：能用但反模式频出（竞态 / 双重请求 / loading 状态散落）；只在「一次性 + 不需要缓存」场景能用
  - **Apollo Client**：GraphQL only；normalized cache 强大但运维负担重；非 GraphQL 项目不用
  - **Relay**：GraphQL only；Meta 内部经验外溢；2026 主要 Meta 系 + 大型 GraphQL 应用还在用
  - **RTK Query**：Redux 全家桶用户的自然选择；与 Redux store 共存；非 Redux 团队没必要
  - **SWR**：Vercel 出品；轻量；与 Next.js / Vercel AI SDK 强绑定；2025+ 维护节奏放缓
  - **TanStack Query**：vendor-neutral；功能最完整；社区最活跃；2026 事实上的客户端 fetch 库王者
  - **Jotai + jotai-query / Zustand + 自管 fetch**：状态库阵营对 server state 的回应，市场份额小
  - **RSC fetch**（`async function Component`）：2024 起 React 19 + Next.js 16 让一部分 server state 不再过客户端
- **写作要点**：用一张时间线 SVG 串起来；每个节点配一句"它解决了什么前一版的痛点"。**强调**「useEffect + fetch 是错误起点，但教科书还在教」这一现实矛盾。**避免**纯版本号罗列。

#### 1.2 server state vs client state：Tanner Linsley 的 manifesto + Vercel 的 SWR 哲学

- **核心问题**：为什么 TanStack Query 要把 server state 和 client state 分开？分开之后多了什么？少了什么？SWR 走的是同一条路吗？
- **Tanner 的 server state 二分法**：
  - **Client state**：UI 状态、表单输入、modal 是否打开；同步、即时、组件销毁就没了；用 `useState` / Zustand / Jotai 管。
  - **Server state**：远程数据、shared between users、async、可能 stale、需要重新拿；不是 useState 能管的东西。
  - **关键洞察**：Redux 把所有状态当一类管，导致 server state 写法臃肿；server state 应该有专门的 lifecycle 抽象（query + mutation + invalidation）。
- **Tanner 提出的 5 个 server state 特性**（这是 TanStack Query 设计的根）：
  1. **远程拥有**：你不是数据的 source of truth
  2. **异步 API**：要发请求才能拿
  3. **共享**：可能有人同时在改
  4. **可能 stale**：拿到的可能已经不是最新
  5. **需要 caching + invalidation**：不可能每次都从头拿
- **TanStack Query 的 4 个核心设计赌注**：
  1. **queryKey 是缓存身份证**：所有 query 通过 key 寻址；invalidate 通过 key 模糊匹配
  2. **stale-while-revalidate 是默认**：先返回 cache + 后台刷新；用户感受不到等待
  3. **不抢 store 的活**：不是 Redux 替代品；只管 server state；client state 你自己用 useState
  4. **vendor-neutral**：不绑定 GraphQL / 不绑定 React / 不绑定 fetch 实现
- **SWR 的设计哲学**（Shu Ding + Vercel 视角）：
  - 名字直接来自 RFC 5861（HTTP `stale-while-revalidate` cache header），把它从 HTTP 缓存提到 React hook 层
  - **极简 API**：只有 `useSWR(key, fetcher)`，没有 queryClient 概念（mutator 是局部的）
  - **更轻**：bundle size 小，适合 Vercel 边缘部署的"启动快"路线
  - **与 Next.js 强绑定**：天然贴合 Vercel 平台叙事；2024 起 Vercel 重心转 RSC + AI SDK，SWR 维护节奏明显放缓
- **TanStack Query vs SWR 关键对照**（不分胜负，分场景）：
  - 项目大 / 多团队 / 复杂 query 关系 → TanStack Query（功能全 + DevTools）
  - 项目小 / 想要极简 API / Vercel 部署 → SWR（够用 + 轻）
  - 需要 mutation + optimistic + invalidation 体系 → TanStack Query（更体系化）
  - 只是想把 GET 包装得不那么烦 → SWR
- **2026 现状**：
  - 新项目客户端 fetch 库选择大约 **70% TanStack Query / 15% SWR / 10% RTK Query / 5% 其他**
  - GraphQL 项目仍以 Apollo / Relay 为主
  - **关键趋势**：Next.js + RSC 项目里"客户端 fetch 库需求量"在下降，因为 server-side fetch 接管了一部分
- **写作要点**：本章是**整个主题的灵魂**——读者读完应该能从本质上回答"我为什么不能用 useState + useEffect 自己写"。强观点收尾："不分 server state / client state 的项目，三年内必然踩坑"。

---

### P2 · TanStack Query 心智（2 章）

#### 2.1 queryKey + queryFn + queryClient 三件套

- **核心问题**：TanStack Query 的核心是三个东西：queryKey、queryFn、queryClient。这三个怎么协作？为什么 queryKey 是「数组」而不是字符串？
- **queryKey**：
  - **形态**：`['users']` / `['users', userId]` / `['users', { filter: 'active', page: 2 }]`
  - **为什么是数组**：第一段是命名空间，后面是依赖；invalidate 时可以模糊匹配（`invalidateQueries({ queryKey: ['users'] })` 会清掉所有 `['users', ...]`）
  - **必须可序列化**：因为要参与 hash → 字符串 → cache key 的过程；object 要稳定排序后再 hash（v5 自动做）
  - **常见陷阱**：把 unstable 引用（每次 render 新对象）当作 queryKey 一部分 → 每 render 都被当成新 query → 死循环
- **queryFn**：
  - **签名**：`(context: QueryFunctionContext) => Promise<TData>` —— 接受 `{ queryKey, signal, meta, pageParam }`
  - **`signal`**：v5 自带 AbortSignal，组件卸载 / 切换 query 时自动 cancel
  - **可以从 queryKey 取参数**：`queryFn: ({ queryKey: [, userId] }) => fetchUser(userId)`
  - **必须返回 Promise**：返回 `undefined` 会报错（v5 严格了）
- **queryClient**：
  - **整个 app 一个**：通过 `<QueryClientProvider client={queryClient}>` 注入
  - **手动 API**：`queryClient.invalidateQueries / setQueryData / getQueryData / prefetchQuery / fetchQuery`
  - **跨组件状态共享**：同一个 queryKey 的 query，多个组件订阅时共享一份 cache
  - **DevTools**：通过 `<ReactQueryDevtools />` 挂载；2026 已是 React 项目调试标配
- **关键代码示例方向**：
  - 一个 todos CRUD 的完整 queryKey 设计（`['todos']` / `['todos', { filter }]` / `['todos', id]`）
  - object 引用陷阱 + 修复（用稳定值 / queryKey factory 模式）
  - queryClient.setQueryData 直接改 cache 的两种用法（mutation 后 / WebSocket 推送后）
- **写作要点**：本章是 TanStack Query 入门最大门槛；**强调** queryKey 不是 cache name，是「带依赖的身份证」；用真实 console / DevTools 截图。

#### 2.2 stale-while-revalidate + staleTime / gcTime + fetcher 行为模型

- **核心问题**：staleTime / gcTime 到底是什么？什么时候 refetch？为什么有时候打开页面立刻看到旧数据 + 后台请求？
- **stale-while-revalidate 心智**：
  - 来源 HTTP RFC 5861：cache 在 stale 之后短时间内还能用，同时后台 revalidate
  - TanStack Query 把它变成 React 层心智：query 有「fresh / stale / inactive / gc」四态
  - **fresh**：刚拿到，比 staleTime 短，**永远不会** refetch
  - **stale**：超过 staleTime，订阅者激活时（mount / window focus / network reconnect）会触发 refetch
  - **inactive**：没人订阅，进入 gc 倒计时
  - **gc**：超过 gcTime（v5 改名前叫 cacheTime），从内存清掉
- **staleTime 默认 0 的争议**：
  - 默认每次激活都 refetch（保证最新数据）
  - 大量项目会调成 `staleTime: 5 * 60 * 1000`（5 分钟）甚至更高
  - **没有"最优值"**：要看数据更新频率 + 用户感知
- **触发 refetch 的 5 个条件**（默认开，可单独关）：
  1. 组件 mount（订阅激活）+ query 是 stale
  2. window focus（切回 tab）
  3. network reconnect
  4. 显式 `refetch()` 或 `invalidateQueries()`
  5. `refetchInterval`（轮询）
- **gcTime 心智**：
  - 默认 5 分钟
  - 影响"用户切走又切回"的体验：在 gc 之前切回直接看 cache，超过 gc 就重新拿
  - 不要把 gcTime 设太短（比 staleTime 短没意义）
- **典型陷阱**：
  - staleTime 设 0 + 频繁切 tab → 网络请求爆炸
  - staleTime 设很大 + 数据其实变了 → 用户看到旧数据
  - gcTime < staleTime → 没意义（cache 还没 stale 就被 gc 了）
  - 用 `refetchInterval` 做轮询忘了组件卸载就停（默认其实会停，但很多人误以为不会）
- **关键代码示例方向**：
  - 同一个 query 在两个组件同时订阅 + window focus 时只发一次请求（共享）
  - 用 staleTime + gcTime 调出"切 tab 不刷 / 5 分钟后刷新"的策略
  - 用 DevTools 看 query 状态机
- **写作要点**：本章是 TanStack Query 最容易"用着用着才理解"的概念；**强调**「staleTime 不是 cache 过期，是 refetch 触发条件」；用一张状态机 SVG。

---

### P3 · query / mutation 生命周期（2 章）

#### 3.1 useQuery 全谱：状态机 + 选项 + 派生数据

- **核心问题**：useQuery 返回的 status / fetchStatus / isPending / isFetching / isError 一堆，到底有什么差别？什么时候用哪个？
- **两套状态正交**：
  - **`status`**：'pending' | 'success' | 'error' —— 数据视角，「我有没有数据」
  - **`fetchStatus`**：'idle' | 'fetching' | 'paused' —— 网络视角，「现在正在请求吗」
  - **组合**：`success + fetching` = 我有旧数据，正在后台刷新（stale-while-revalidate UI 关键）
- **常用选项**：
  - **`enabled`**：控制 query 是否运行；动态值实现 dependent query
  - **`select`**：从 data 派生子集；只有 select 结果变化才 re-render（性能优化）
  - **`placeholderData`**：先显示占位（不进 cache）；常用 `keepPreviousData`（v5 改成 `placeholderData: keepPreviousData`）
  - **`refetchInterval`**：轮询；可以是函数（按状态决定停 / 继续）
  - **`retry` / `retryDelay`**：失败重试策略
  - **`structuralSharing`**：v5 默认 true；只有真正变化的字段触发 re-render（深比对）
- **派生数据：select**：
  - `select: (data) => data.filter(...)` —— 派生 + memoize
  - 多个组件用同一个 query 但只关心不同字段，每个组件自己 select，互不干扰
  - 性能关键：select 结果跟 prev 用 Object.is 比；引用稳定才能避免 re-render
- **dependent query**：
  - `useQuery({ queryKey: ['user', id], queryFn, enabled: !!id })`
  - id 没拿到就不发；id 来了自动发
- **parallel query**：
  - 同组件多次 `useQuery` 自动并发
  - `useQueries({ queries: [...] })` 用于 query 数量动态
- **取消请求**：
  - v5 默认 `signal` 支持；queryFn 拿到 `{ signal }` 透传给 fetch
  - 组件卸载 / 切 query / window blur 都会自动 abort
- **关键代码示例方向**：
  - status + fetchStatus 组合渲染矩阵（4 种状态 4 种 UI）
  - select 优化：list query 全量 cache，每个 row 组件 select 自己那一项
  - dependent query：拿到 user → 再拿 user 的 settings
  - 用 placeholderData + keepPreviousData 实现"分页时不闪烁"
- **写作要点**：本章给**完整状态机表 + 决策矩阵**；强调 select 是被低估的性能武器；链回 react/03-hooks 讲 useState 心智差异。

#### 3.2 useMutation + invalidation + optimistic updates

- **核心问题**：mutation 是什么 lifecycle？提交后怎么让其他组件的 cache 跟着更新？optimistic 怎么做才不会出 bug？
- **useMutation 基础**：
  - 与 useQuery 不同：不会自动触发；调用 `mutate(variables)` 才执行
  - 状态：`isPending / isSuccess / isError / data / error`
  - 回调：`onMutate / onSuccess / onError / onSettled`
- **invalidation 模式**：
  - mutation 成功后：`queryClient.invalidateQueries({ queryKey: ['todos'] })`
  - 模糊匹配：传 `['todos']` 会失效所有 `['todos', ...]`
  - **invalidate ≠ refetch**：invalidate 只是标 stale，订阅者激活才 refetch
  - **强制 refetch**：`queryClient.refetchQueries`
- **optimistic updates 三种姿势**：
  1. **`onMutate` 改 cache**（最经典，最容易出 bug）：
     - 在 onMutate 里 `setQueryData` 直接写新值
     - **必须**：先 `cancelQueries`（避免后台请求覆盖你的乐观值）+ 保存上一版（onError 回滚）
     - 出错时回滚 + onSettled 时 invalidate（确保最终一致）
  2. **`useMutation` 自带的乐观字段**（v5 强化）：通过 `useMutationState` 拿到 pending mutation，组件内组装乐观 UI（不动 cache）
  3. **React 19 `useOptimistic`**：客户端乐观状态 hook；和 server-side `useActionState` 配合；和 TanStack Query 交叉怎么处理 → 链回 react 主题 P6.2
- **mutation 的并发问题**：
  - 同一 cache 同时 5 个 mutation 在跑 → cancelQueries + setQueryData 顺序如何保证？
  - 解法：用 `mutationKey` 把它们分组；或在 onMutate 里基于"前一个 mutation 还在 pending"做合并
- **典型陷阱**：
  - onMutate 改 cache 没 cancel → 后台 fetch 回来覆盖乐观值
  - onError 没回滚 → cache 永远 stuck 在错误状态
  - invalidate 后立刻读 `getQueryData` → 拿到的是 invalidate 之前的值（invalidate 不是同步替换）
  - mutation 成功后 navigate 走 → onSettled 没跑 / cache 没刷
- **关键代码示例方向**：
  - 一个 todo 增删改完整 mutation 闭环（含 onMutate / onError / onSettled）
  - `useMutationState` 派生乐观 UI（不动 cache）
  - 与 React 19 `useOptimistic` / `useActionState` 共存（讲清楚不冲突 + 谁管什么）
  - 一个 mutation 出错 + 自动回滚 + UI 提示的完整流程
- **写作要点**：mutation 是 TanStack Query 第二大坑（第一大坑是 staleTime / cache）；**必须**讲清"乐观更新的 4 个步骤缺一不可"；链回 react 主题 P6.2 useOptimistic + useActionState。

---

### P4 · 高级查询模式（2 章）

#### 4.1 dependent / parallel / paginated / infinite queries

- **核心问题**：除了一次性 query，真实业务的 dependent / parallel / paginated / infinite 这些怎么用 TanStack Query 优雅地写？
- **dependent query**：
  - `enabled: !!previousQuery.data` 串行触发
  - 心智：query 之间的"等"用 `enabled` 表达，不用手写 if/else
- **parallel query（已知数量）**：
  - 同组件多次 `useQuery` 自动并发
- **parallel query（动态数量）**：
  - `useQueries({ queries: ids.map(id => ({ queryKey, queryFn })) })`
  - 返回数组，可 .map 渲染
- **paginated query（页码型）**：
  - 用 `placeholderData: keepPreviousData` —— 切页时显示上一页 + 后台拉新页（不闪烁）
  - cursor 在 queryKey 里：`['posts', { page }]`
- **infinite query（"加载更多"型）**：
  - `useInfiniteQuery`：与 useQuery 不同的 hook，专门管 infinite
  - 关键概念：`getNextPageParam(lastPage, allPages)` 决定下一页 param；返回 `undefined` 表示没下一页
  - `data.pages` 是数组，每页一个元素；组件层用 `data.pages.flatMap(...)` 渲染
  - `fetchNextPage()` 触发下一页；`hasNextPage` / `isFetchingNextPage` 控制 UI
- **配合 IntersectionObserver 实现"滚到底自动加载"**（典型实战代码）
- **典型陷阱**：
  - infinite query 改了某一项要让整页失效 → invalidate 会重置整个 pages，UX 不好；需要更精细的 setQueryData 局部改
  - paginated 没用 keepPreviousData → 切页 loading 闪烁
  - dependent query 链很长 → 串行延迟累积；考虑后端聚合
- **关键代码示例方向**：
  - 完整的 infinite list（IntersectionObserver + useInfiniteQuery + flatten 渲染）
  - 一个分页表格（keepPreviousData + 排序 / 过滤变化时重置 pageIndex）
  - useQueries 实现"批量加载用户头像"
- **写作要点**：本章是实战章；用"产品里真见过的需求"驱动，避免抽象例子。链回 react 主题 P5.3 transition（pagination + transition 的关系）。

#### 4.2 Suspense mode + queryClient direct API + prefetch + streaming

- **核心问题**：useSuspenseQuery 与 useQuery 是同一个 hook 的两套用法吗？什么时候用 Suspense mode？怎么和 prefetch / streaming 配合？
- **useSuspenseQuery 三件套**（v5 一等公民）：
  - `useSuspenseQuery` / `useSuspenseInfiniteQuery` / `useSuspenseQueries`
  - 关键差异：**永远 throw promise**（pending）/ **永远 throw error**（error）→ 由外层 Suspense / ErrorBoundary 处理
  - 组件内 `data` 永远不是 `undefined`（类型层面省了 narrowing）
  - 不能用 `enabled: false`（因为没办法 throw 一个不存在的 promise）→ 这是它的限制
- **useQuery vs useSuspenseQuery 选择**：
  - **useQuery**：组件自己处理 loading / error；条件触发（enabled）；细粒度 placeholder
  - **useSuspenseQuery**：交给上层 Suspense 控制 fallback；更声明式；强制要求父级有 Suspense + ErrorBoundary
- **queryClient direct API**（不用 hook 调用）：
  - `queryClient.prefetchQuery({ queryKey, queryFn })`：预热 cache，不订阅
  - `queryClient.fetchQuery`：拿 promise（在 router loader 里典型）
  - `queryClient.ensureQueryData`：fetch + cache（如果已 cache 就直接返回）
  - **场景**：路由切换前预热（hover prefetch）；router loader 集成（TanStack Router / React Router v7）
- **streamedQuery**（v5 新）：
  - 支持 server 流式返回（SSE / chunked）
  - 边收边累加到 cache
  - 与 Vercel AI SDK useChat 哲学接近 → 链回待写 AI SDK 主题
- **prefetch 模式**：
  - 路由 hover 预热：`onMouseEnter={() => queryClient.prefetchQuery(...)}`
  - 配合 React Router / TanStack Router loader：路由切换前 ensure data
  - 配合 Next.js App Router：通过 dehydrate / hydrate 把 server fetch 桥到客户端 cache（详见 P5.2）
- **典型陷阱**：
  - useSuspenseQuery 没包 Suspense → 整个 app 报错
  - prefetch 没传 staleTime → 预热的数据立刻 stale，再请求一次
  - streamedQuery + 错误处理：流中途断了怎么办（v5 新增对应配置）
- **关键代码示例方向**：
  - 一个用 useSuspenseQuery + Suspense + ErrorBoundary 的 dashboard
  - hover prefetch 实现"导航点亮时数据已经在了"
  - streamedQuery 实现一个 LLM 流式聊天（接 OpenAI / Claude API mock）
  - 与 React Router v7 loader 集成（loader 里 ensureQueryData，组件里 useSuspenseQuery）
- **写作要点**：本章为 P5 RSC 章铺垫；**强调** prefetch 是 RSC 时代仍然有用的模式；链回 react 主题 P5.2 Suspense + react/06-modern P6.1。

---

### P5 · 与 React 19 + RSC 衔接（2 章 ⭐ 最难）

#### 5.1 RSC 时代 TanStack Query 还该用吗？

- **核心问题**：Next.js 16 + React 19 之后，server-side fetch + Server Actions 已经能做大部分 server state 工作。客户端 fetch 库还有位置吗？什么场景仍然不可替代？
- **RSC 时代 server state 路径变化**：
  - **以前（v18 + Pages Router）**：所有 server state → useQuery / SWR → 客户端 cache
  - **现在（v19 + App Router）**：
    - 首屏数据 → Server Component `async function` 直接 fetch + 'use cache'（链回 next/05-caching）
    - 数据变更 → Server Action（链回 next/04-server-actions）
    - 客户端交互后的数据 → 仍需要客户端 fetch 库（这是 TanStack Query 仍然存在的根本理由）
- **TanStack Query 在 RSC 时代仍不可替代的 5 个场景**：
  1. **客户端长生命周期 cache**：用户切 tab、回退、跨页面，仍需要 cache（RSC 没办法跨导航持久化客户端状态）
  2. **infinite scroll / 实时刷新 / 轮询**：纯客户端循环，server-side 不管这种 lifecycle
  3. **乐观更新**：用户体验关键，server roundtrip 太慢
  4. **WebSocket / SSE 流式数据 + 多组件订阅**：server-push 数据进 query cache 让多个组件共享
  5. **第三方 API（不能在 server-side 调）**：CORS / API key 在 client / 移动端 SDK
- **RSC 接管的 3 个场景（不再需要客户端 fetch 库）**：
  1. **首屏渲染数据**：Server Component fetch + 'use cache' 比 useQuery 简单且零客户端 bundle
  2. **简单数据变更**：Server Action 提交表单 + revalidatePath 比 useMutation + invalidate 直接
  3. **SEO 关键页面数据**：必须 server-render，没得选
- **官方说法对照**：
  - **React 团队（Sebastian / Dan）**：use API 是底层；上层 cache library 仍然有位置；不要把 useQuery 强行替换成 use(promise)
  - **Tanner 的回应**（2024 之后多次发文）：TanStack Query 不会消失；client-side cache 是独立问题；与 RSC 是互补不是竞争
  - **Vercel（Next.js 团队）**：推 RSC + Server Actions；同时承认仍需要客户端 fetch 库（官方文档明确说了 hydration 桥的用法）
- **决策矩阵**：
  - 数据「只首屏需要 + 不变」 → RSC fetch + 'use cache'，不用 TanStack Query
  - 数据「客户端会重新拿 / 多页面共享 / infinite / 轮询」 → TanStack Query
  - 数据「提交表单后变」 → Server Action + revalidate，不需要 TanStack Query mutation
  - 数据「客户端乐观更新 + 实时」 → TanStack Query useMutation + onMutate
- **写作要点**：本章是**整个主题最难定位的一章**；**必须**给出明确决策树（不是"看情况"）；强观点："2026 起，新项目第一选择是 RSC + Server Actions，TanStack Query 用在剩下的客户端独有场景"；链回 next 主题 P3 + P4 + P5。

#### 5.2 hydration 桥 + use(promise) + Server Actions 协作

- **核心问题**：RSC 与 TanStack Query 共存的具体姿势是什么？hydration 桥怎么做？React 19 `use(promise)` 与 TanStack Query 是什么关系？
- **Next.js + TanStack Query 推荐模式**（官方文档已收录）：
  ```
  Server Component:
    const queryClient = new QueryClient()
    await queryClient.prefetchQuery({ queryKey: ['posts'], queryFn })
    const dehydratedState = dehydrate(queryClient)

  Client Component (use client):
    <HydrationBoundary state={dehydratedState}>
      <Posts />  // 内部 useQuery 直接命中 cache，不发请求
    </HydrationBoundary>
  ```
  - **本质**：server-side 拉到的数据序列化进 RSC payload；client 反序列化后塞进 queryClient.cache
  - **解决问题**：首屏不用 client fetch loading 状态 + 客户端导航后仍能复用 cache
- **`use(promise)` API 与 TanStack Query 的关系**：
  - **`use(promise)`** 是 React 19 底层 API：消费一个 promise；pending 时 throw promise（被 Suspense 接住）；resolved 后返回 value
  - 它**不是** cache library；同一个 promise 引用在两个组件 use 会复用 React 内部的 promise cache（基于 referential equality）
  - 与 TanStack Query 关系：useSuspenseQuery 在底层就是用类似 use(promise) 机制实现的
  - **不要直接用 use(promise) 当 cache library**：每次 render 创建新 promise → 每次都 fetch；只有 RSC server-side 创建的 promise 才能被 client `use` 安全消费
- **典型模式：RSC 创建 promise + Client Component use**：
  ```
  Server Component:
    return <ClientWrapper postsPromise={fetchPosts()} />

  ClientWrapper (use client):
    const posts = use(postsPromise)  // 流式：RSC 还在拿就 throw promise
  ```
  - 适合「server-side 启动 + 客户端流式消费」场景
  - 简单单次 fetch；想要长 cache + invalidate 用 TanStack Query
- **Server Actions + TanStack Query 协作**：
  - mutation 调 Server Action：在 useMutation 的 mutationFn 里直接调用 server action
  - 成功后双向同步：`revalidatePath`（让 server cache 失效）+ `queryClient.invalidateQueries`（让 client cache 失效）
  - **小心**：两层 cache 没同步会出现"server 已变 client 还旧"或反过来
- **典型陷阱**：
  - 在 Server Component 里 `new QueryClient()` 没考虑请求隔离 → 多请求共享 cache 出问题（每个请求独立 new QueryClient）
  - dehydrate + hydrate 数据太大 → RSC payload 膨胀
  - 同一份数据 server-side fetch + 客户端再 useQuery → 双重请求；正确做法是 dehydrate 进 cache
  - use(postsPromise) 在 client 创建新 promise 而不是消费 server 传下来的 → 退化成纯客户端 fetch
- **关键代码示例方向**：
  - Next.js App Router + TanStack Query 完整 setup（Provider + dehydrate + HydrationBoundary）
  - Server Component 启动 fetch + Client Component use(promise) 流式消费
  - useMutation 调 Server Action + 双向 invalidate
  - 一个 dashboard：first paint 来自 server cache，client interaction 走 TanStack Query
- **写作要点**：本章是落地最难、生产最容易踩坑的章；**必须**给完整可运行示例；强调"两层 cache 同步"是新挑战；链回 next 主题 P3.1 + P4.1 + P5.1 / react 主题 P6.1 + P6.2。

---

### P6 · SWR + 同代人横评（1 章）

#### 6.1 SWR 设计哲学 + Apollo / Relay / RTK Query / Jotai-Query 横评

- **核心问题**：SWR 和 TanStack Query 哪个适合什么项目？Apollo / Relay 在 2026 年还有没有活跃用户？RTK Query 是不是 Redux 项目的"自然延续"？
- **SWR 深入**：
  - **API 极简**：只有 `useSWR(key, fetcher, options?)` + `mutate` 两个核心
  - **没有 queryClient**：状态全局自动管理（基于 SWRConfig）
  - **mutator 局部**：`useSWR` 返回的 `mutate` 只对当前 key；`useSWRConfig().mutate` 才是全局
  - **stale-while-revalidate 与 TanStack Query 同源**：但 SWR 没有 staleTime 概念，refetch 触发更激进（默认每次 mount + focus + reconnect 都拉）
  - **不擅长**：复杂 mutation（useSWRMutation 较弱）/ 大型项目的 cache invalidation 体系 / DevTools 较弱
  - **擅长**：极简场景 / Vercel 部署 / 与 Next.js Pages Router 配合（App Router 下被 RSC 抢戏）
- **TanStack Query vs SWR 决策表**：
  - 团队大 / 多组件复杂关系 → TanStack Query
  - 想要最少 API + 立即上手 → SWR
  - 需要 DevTools / mutation 体系 → TanStack Query
  - 已经在 Vercel + Next.js + AI SDK 生态深入 → 部分 SWR 残留
- **Apollo Client**：
  - GraphQL only；normalized cache（每个 entity 用 `__typename:id` 索引）
  - 强大但运维负担重；schema-first 工作流绑定
  - 2026 主要用户：大型 B2B SaaS / GraphQL 重度团队
- **Relay**：
  - Meta 内部生态外溢；强类型 + 编译时优化
  - 学习曲线陡；非 Meta 系大公司很少用
  - 2026 用户：Facebook / Instagram / 部分大型 GraphQL 应用
- **RTK Query**：
  - Redux Toolkit 内置；endpoint-based API；自动生成 hooks
  - 适合已经全家桶 Redux 的项目；不适合新项目（新项目直接 TanStack Query）
- **Jotai-Query / Zustand + 自管 fetch**：
  - 状态库阵营对 server state 的回应，市场份额小
  - Jotai-Query 把 atom 系统延伸到 server state；学习成本高
  - 不推荐新项目用，除非已经 Jotai 重度依赖
- **客户端 GraphQL 现状**：
  - 2026 GraphQL 总体在收缩（REST + tRPC + RSC fetch 抢回份额）
  - GraphQL 项目首选 Apollo / Relay；非 GraphQL 项目永远不要装 Apollo
- **2026 客户端 fetch 库市场份额**（粗略）：
  - TanStack Query 70% / SWR 15% / RTK Query 10% / Apollo + Relay 5%（绝大多数是历史项目）
- **写作要点**：横评要有**具体决策矩阵**，不是"差不多"；每个对手的优势必须客观写；最后一段给"我推荐 X，因为 Y"的强观点。链回 react 状态管理章（如有）。

---

### P7 · 决策与陷阱（1 章）

#### 7.1 客户端数据获取选型决策树 + 常见陷阱清单

- **核心问题**：拿到一个新 React 项目，从「需不需要客户端 fetch 库」到「选哪个 + 怎么配 staleTime」一条决策链是什么？
- **3 层决策树**：
  - **第一层：需不需要客户端 fetch 库？**
    - Next.js + 重 SEO + 数据基本静态 → 大部分用 RSC fetch + 'use cache'，**不装客户端 fetch 库**
    - SPA + 后端 REST + 客户端交互重 → **装**
    - Next.js + 客户端交互重 + 实时数据 → RSC 管首屏 + **装** TanStack Query 管客户端
  - **第二层：选哪个？**
    - 大部分场景 → **TanStack Query**（功能全 + 社区活跃 + DevTools）
    - 极简 + Vercel 部署 → SWR
    - 已有 Redux Toolkit → RTK Query
    - GraphQL 重度 → Apollo / Relay
  - **第三层：怎么配？**
    - staleTime：根据数据更新频率（5min / 30min / 1day 三档）
    - gcTime：默认 5min 一般够，长会话场景可调到 30min
    - refetchOnWindowFocus：默认开；后台运行型应用关掉避免请求风暴
    - retry：默认 3 次指数退避；金融 / 关键操作改成 1 次或关掉
- **常见陷阱清单**（一节一陷阱，每条配修复）：
  1. queryKey 用了不稳定引用 → 死循环
  2. queryFn 闭包了过期变量 → 永远拿到旧值
  3. staleTime 太小 → 网络请求爆炸
  4. mutation 乐观更新没 cancelQueries → 后台请求覆盖
  5. mutation 乐观更新没保存 prev → 出错没法回滚
  6. invalidate 后立刻 getQueryData → 拿不到新值
  7. infinite query 单项更新 → invalidate 整页 UX 不好
  8. 在 Server Component 里全局 new QueryClient() → 跨请求污染
  9. dehydrate 数据太大 → RSC payload 膨胀
  10. useSuspenseQuery 没包 Suspense → app 崩溃
  11. select 返回新引用 → 优化失效
  12. mutation onSuccess navigate 走 → onSettled 没跑 cache 没刷
- **测试 query 的姿势**（链回 testing 主题）：
  - 用 MSW mock fetch 层（不要 mock useQuery）
  - 用 `<QueryClientProvider>` 包测试组件 + 每个 test 独立 queryClient（避免 cache 污染）
  - 用 `waitFor` 等 query 完成 + DevTools `getQueriesData` 验证 cache
- **2027 展望**：
  - RSC + Server Actions 会进一步蚕食 client fetch 场景
  - TanStack Query 会更深度集成 RSC（hydration 桥 API 进一等公民）
  - SWR 维护节奏可能放缓到只 bug fix
  - GraphQL 客户端市场进一步收缩
  - AI 流式（streamedQuery / Vercel AI SDK）会成为 query 库的下一个差异化点
- **写作要点**：本章是**实战决策章**；给"看场景选什么 + 看症状改什么"的双向决策；最后给"我推荐 X，因为 Y"的强观点收尾。链回 react / next / testing 主题。

---

## 写作风格 ——「写文章人，不是建筑师」

> （遵循已有约定）

- **章节内部**：6 段模板（速览 → 底层逻辑 → 应用场景 → 典型代码 → 常见陷阱 → 延伸阅读）
- **跨章引用**：用「短重述 + 链回」，不抄不省
- **图示**：query 状态机 / stale-while-revalidate timeline / RSC + TanStack Query 数据流 / 决策树 全用 SVG
- **代码示例**：每章 5-10 段可运行的真实代码（基于 TanStack Query v5 主线）
- **加粗（克制）**：每章 ≤ 25 个 `<strong>`；每段不超过 1-2 个；不要靠加粗散点高亮"我觉得重要"的描述句
- **避免**：
  - 罗列 API 文档（链回官方）
  - "架构师式"分类标签（X 派 / Y 流）
  - 中立到没观点（每章必须给"我推荐 X，因为 Y"）
  - 抄 PPT / 抄 docs（设计动机要回到 Tanner / Shu Ding 一手）
- **观点强度**：
  - 强观点（"server state ≠ client state 是 React 生态最重要的认识之一"，"2026 起客户端 fetch 库不是默认装"）
  - 弱观点（"TanStack Query vs SWR 看场景"）
  - 不观点（"RTK Query 也不错，全家桶项目继续用"）

---

## 不写的内容（明确划线）

- **不讲**：
  - 具体某个 GraphQL schema 设计
  - Apollo Client / Relay 的完整教程（仅 P6 横评点到）
  - GraphQL 协议本身（fragments / unions / federation）
  - tRPC（不属于客户端 fetch 库范畴，但会在 P7 决策提一句）
  - 完整 React Router v7 / TanStack Router loader 配置（链回 next + react 主题）
  - WebSocket / SSE 协议本身（链回待写 HTTP 主题）
- **链回但不重复**：
  - React 19 hooks（use / useOptimistic / useActionState）→ 链回 react 主题 P6
  - RSC payload + 流式 → 链回 next 主题 P3
  - Server Actions → 链回 next 主题 P4
  - Cache Components / 'use cache' → 链回 next 主题 P5
  - Suspense / Error Boundary → 链回 react 主题 P5
  - 测试栈（MSW + Testing Library）→ 链回 testing 主题
  - TypeScript 泛型 / utility types → 链回 typescript 主题
- **暂占位（待写主题）**：
  - HTTP/2 / HTTP/3 / streaming 协议层 → 待 HTTP 主题
  - Vercel AI SDK / Claude Agent SDK 流式 → 待 AI 主题（与本主题 P4.2 + P5.2 强相关，会双向链）

---

## 路线图

- **Step 1**：本 outline.md 经用户审定 ← **当前**
- **Step 2**：建 8 个文件骨架（`tanstack-query/index.html` + 7 个 phase 目录的 `index.html`）
- **Step 3**：P1 章节正文（历史 + 设计哲学，2 章）
- **Step 4**：P2 章节正文（queryKey / queryFn / queryClient + stale-while-revalidate，2 章）
- **Step 5**：P3 章节正文（useQuery 全谱 + useMutation + optimistic，2 章）
- **Step 6**：P4 章节正文（dependent / parallel / paginated / infinite + Suspense / prefetch / streaming，2 章）
- **Step 7**：P5 章节正文（RSC 共存 + hydration 桥 + use(promise) + Server Actions 协作，2 章 ⭐ 最难）
- **Step 8**：P6 章节正文（SWR + 同代人横评，1 章）
- **Step 9**：P7 章节正文（决策树 + 陷阱清单，1 章）+ 站点首页卡片改 done

---

## 与 index.html 卡片的对应

TanStack Query / SWR 主题在站点首页的卡片描述（草拟）：
> 7 阶段 / 12 章：客户端数据获取 15 年史 + server state 设计哲学 + TanStack Query v5 心智（queryKey + stale-while-revalidate）+ query / mutation 生命周期 + dependent / paginated / infinite + Suspense / prefetch + RSC 时代位置（hydration 桥 + use API + Server Actions 协作）+ SWR 横评 + 决策树。锁定 TanStack Query v5 + React 19 + Next.js 16 主线。

按 ecosystem 主题约定（见 README 设计原则 + memory `convention_weight_center_crossref`）：
- **center of gravity**：⑦ 数据 & 网络
- **不创建 crossref 卡片**：next / react / testing 卡片描述里如需提"也覆盖客户端数据获取场景"，在描述文字内自然提及，不开独立卡片
- **横向对照（SWR / Apollo / Relay / RTK Query）**：在 P6 章内部完成，不开独立主题
