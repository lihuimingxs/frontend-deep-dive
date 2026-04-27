# React 深度学习 · 章节大纲

> 本文件是 React 主题的写作蓝本。**两条独立轨道**：Track A · 历史脉络与设计 / Track B · React 官网知识精读。
> 编写日期：2026-04-27 | 目标版本：React 19.x（19.0 / 19.1） | 灵感来源：ECMA 主题已建立的双轨模式

---

## 元信息

- **目标版本**：**React 19.x**（默认）—— 含 Actions / Server Components / `use` API / `useOptimistic` / `useActionState` / ref as prop。**老 API**（class components / `componentWillMount` / legacy context / `forwardRef` / `defaultProps`）只在「陷阱 / 历史」点到，不展开
- **来源**：
  - [react.dev](https://react.dev/) Reference 全量（Hooks / Components / API）
  - [React RFCs](https://github.com/reactjs/rfcs)（Server Components / Actions / Concurrent 等设计动机原始来源）
  - [React 源码](https://github.com/facebook/react)（仅 A3 Fiber 章涉及 reconciler / scheduler 包，其他章不需要读源码）
  - [Andrew Clark / Sebastian Markbåge / Dan Abramov 的 Twitter / blog](https://overreacted.io/)（设计意图最权威解读）
- **目标读者**：已学过 `javascript/`（特别是 02-advanced 闭包/this/原型）+ `typescript/` 的研发工程师，想理解"React 的设计哲学、Fiber 怎么跑、Hooks 为什么这样设计"。

---

## 设计原则：两轨独立，互不影响

**这是从 ECMA 主题继承的设计约束**——历史脉络与官网知识精读必须分开实现，**且历史轨道按 ECMA 的"4 问骨架"模板**（为什么存在 / 它是什么 / 机器怎么跑 / 单线程怎么并发 / 现代生态）。

- **Track A · 历史脉络与设计**（5 章）—— 4 问叙事脊柱 + 生态速查。**这是从 ECMA 复用过来的"补充章模板"**：内容形态和 ECMA Track A 等比改写，适合先建立心智模型再读官网。
- **Track B · React 官网知识精读**（19 章 / 4 Part）—— 按 react.dev Reference 系统化。**正文对每个 API 给出**：心智模型（why this API exists）+ 完整签名 + 典型代码 + 边界情况 + 与 React 内部机制的关系。
- **两轨之间**只通过显式 `延伸阅读` 互相链接，**不在任何章节正文里互相依赖**。读者可以只看 A 不看 B（适合架构师 / Tech Lead），或只看 B 不看 A（适合写业务 React 的工程师），或两轨穿插读。

### 与既有主题的边界 ——「短重述 + 链回」原则

延续 ECMA 主题已建立的约定：

> ✅ **短重述**：JS 已讲透的机制（闭包、Promise、Event Loop、Proxy、原型链）用 1-3 句话点出本质
> ✅ **链回**：紧跟一句"详细的 X 请参考 [`javascript/{phase}/{chapter}`]"或 `typescript/...`
> ❌ **不重复 JS / TS / ECMA 已讲透的内容**

具体交叉模式：
- React Hooks 的闭包陷阱 → 短重述 + 链回 `javascript/02-advanced/02-closures`
- `useEffect` 内的 Promise / async → 短重述 + 链回 `javascript/03-async/`
- React Props 的 TypeScript 泛型 → 短重述 + 链回 `typescript/01-handbook-basics/04-functions` / `02-type-manipulation/07-generics`
- Fiber 的微任务调度 → 短重述 + 链回 `ecma/01-history/04-async-evolution` + `javascript/03-async/02-microtask-macrotask`

### 内容覆盖原则 ——「react.dev 系统化 + RFC 设计动机」

- **Track A 用 4 问做骨架**，每章按权威来源系统化补全（不局限于 PPT/某一来源）
- **Track B 按 react.dev Reference 章节** 逐项精读，但把"<em>API 说明</em>"补成"<em>设计动机 + API + 心智模型 + 陷阱</em>"
- **关键设计决策必引 RFC**：Server Components 引 [RFC #188](https://github.com/reactjs/rfcs/pull/188)；Actions 引 [RFC #229](https://github.com/reactjs/rfcs/pull/229)；Hooks 引 [RFC #68](https://github.com/reactjs/rfcs/pull/68)
- **Fiber 内部唯一允许引用源码**（A3 章），其他章节<strong>不读源码</strong>，避免实现细节稀释心智模型

---

## 整体节奏建议

- **连读组**：
  - A1 + A2 + A3 + A4（4 问叙事弧，分开读会泄气）
  - B1 + B2 + B3 + B4（心智模型四件套）
  - B6-B11 Hooks 全谱（建议一气读完，构成完整 Hooks mental model）
  - B16 + B17 + B18（现代 React 三件套：Server Components → Actions → `use` API）
- **可独立跳读**：A5 生态、B15 Error Boundary、B19 杂项
- **建议阅读顺序**：
  - **写业务 React 的工程师**：B1-B11（心智模型 + Hooks 全谱）→ B15 Error Boundary → B19 杂项
  - **资深 / 架构师**：A1-A5 全读 → B16-B18 现代 React → 选读 Hooks 章
  - **想深入引擎的好奇心**：A1 → A3 Fiber → B12 Reconciliation → B13 Suspense → B14 Concurrent

---

# Track A · 历史脉络与设计（5 章）

> 4 问叙事脊柱 + 生态速查。形态等比 ECMA Track A，是后续可能新增主题（Vue / Svelte / Angular 等）的"补充章"母本。

## A1 · 起源与演化 ——「为什么存在？」

- **定位**：讲清楚 React 这个库如何从 2013 年的 Facebook 内部工具演化为今天的事实标准。**不是 changelog，是"<em>关键设计决策的时间线</em>"**。
- **关键知识点**：
  - **史前史（2010-2013）**：Facebook 的"<em>chat 通知 bug</em>"驱动 — Jordan Walke 受 XHP（PHP 的 XML 字面量）启发写了 React 原型
  - **第一阶段 2013-2015 · 公开发布与 JSX 争议**：
    - 2013-05 JSConf 公开 → "<em>JS 里写 HTML？这不是反模式吗</em>" 引发巨大争议
    - 2014 年 React Native + Flux 模式 → 单向数据流站稳
    - 2015 年 React 0.13 加 ES2015 class component
  - **第二阶段 2016-2018 · Fiber 架构重写**：
    - 2016 React 15.x：Stack reconciler（递归实现，无法中断）
    - 2017-09 React 16.0：**Fiber 架构上线** —— Lin Clark / Andrew Clark 主导重写，把 reconciliation 改成可中断的链表遍历
    - 2018-10 React 16.6：<code>React.memo</code> + <code>React.lazy</code> + <code>Suspense</code>（数据 fetching 仍是 experimental）
  - **第三阶段 2019-2021 · Hooks 革命**：
    - 2018-10 在 React Conf Sophie Alpert + Dan Abramov 发布 Hooks proposal
    - 2019-02 React 16.8 正式发布 Hooks → **彻底改变 React 写法**
    - 2020 React 17：无新特性，仅"<em>渐进升级</em>"基础设施 + 新 JSX runtime（不再要 <code>import React</code>）
    - 2021 React 18 alpha → Concurrent rendering 浮出水面
  - **第四阶段 2022-至今 · Concurrent 与 Server Components**：
    - 2022-03 React 18：<code>useTransition</code>、<code>useDeferredValue</code>、自动 batching、<code>renderToPipeableStream</code>
    - 2024-04 React 19 RC：Actions、<code>useActionState</code>、<code>useOptimistic</code>、<code>use</code> API、ref as prop、Server Components 稳定
    - 2024-12 React 19.0 正式发布
- **底层逻辑要点**：
  - **JSX 不是模板，是 JS 表达式**：决定了 React 不能像 Vue/Svelte 一样做编译时优化（早期），但能在 JS 表达式的所有位置用——这是 Composability 的根
  - **Fiber 重写是 React 的"创世"事件**：2016 之前的 React 是不可中断递归，性能瓶颈无法突破。Fiber 让 Concurrent / Suspense / Server Components 这些后续特性都成为可能
  - **Hooks 不是"新写法"，是"<em>函数组件能拥有状态</em>"的运行时机制**：底层依赖 Fiber 的 hooks linked list（A3 详述）
  - **React 的特性发布节奏远慢于 Vue/Svelte**：因为 Facebook 内部使用规模太大（数十亿用户产品），任何 breaking change 必须有渐进升级路径
- **应用场景**：
  - 给团队讲"<em>React 为什么这样</em>"
  - 老项目迁移：理解 16 → 17 → 18 → 19 的升级路径
  - 评估 Vue / Svelte / Solid 时的横向对比锚点
- **陷阱**：
  - ⚠️ "React 16" / "React 18" / "React 19" 是<strong>大版本号</strong>，不像 ES 版本一年一个 —— React 主版本 ~2 年一个
  - ⚠️ Class component 仍未"deprecated"——大量老代码、第三方库仍依赖
  - 别把 "Hooks" 和 "函数组件" 混为一谈：函数组件早就有，Hooks 是给函数组件加状态的机制
- **关联章节**：A2 设计哲学、A3 Fiber 架构、B19 19+ 杂项
- **预估字数**：5500-6500

## A2 · 设计哲学 ——「它是什么？」

- **定位**：讲 React 的"<strong>基因</strong>"——4 个核心设计决策。每个都是为了解决某个具体痛点。**与 B 轨的 API 章节交叉时用「短重述 + 链回」**。
- **关键知识点**：
  - **① UI = f(state)**：UI 是状态的纯函数。声明式而非命令式
    - 对比 jQuery / Vanilla JS：操作 DOM 步骤命令式
    - 对比 Angular 1.x / Knockout：双向数据绑定 + dirty checking
    - 对比 Vue：相似哲学但实现不同（Vue 用 Proxy 反应式，React 用不可变 + 重新渲染）
  - **② 单向数据流**：数据从 parent 到 child 单向传递，事件从 child 到 parent 冒泡
    - 对比 Angular 1.x 双向：状态传播路径不可预测
    - 对比 MVC / MVVM：层之间双向耦合
  - **③ Composition over inheritance**：组件通过组合而非继承复用
    - 没有 mixin（Vue 2 有但 Vue 3 也淡化）
    - 没有 trait / interface（不像 Angular service）
    - 用 Higher-Order Components（HOC）/ render props / 自定义 Hooks 替代
  - **④ 不可变 + 重新渲染**：State 不可变，每次更新创建新引用，React 通过引用比较决定是否重渲染
    - 对比 Vue 3 Proxy：Vue 拦截属性访问，React 比较引用
    - 这是 React.memo / useMemo / useCallback 存在的根因
  - **设计决策的代价**：
    - JSX 不是 HTML（class → className、for → htmlFor、style 是对象）
    - 必须 key 才能高效 list reconciliation
    - 不可变更新繁琐 → Immer / Zustand 等出现的原因
    - 函数组件每次渲染都重新创建函数 → useCallback 缓解但加心智成本
- **底层逻辑要点**：
  - **"<em>UI = f(state)</em>" 是声明式编程的具体落地**——你不告诉 React 怎么变，告诉它"<em>状态是这样</em>"，由 React 决定怎么变 DOM
  - **不可变性不是哲学洁癖，是"<em>怎么知道要重渲染</em>"的工程答案**：引用相等 = O(1) 检查，结构相等 = O(n) 检查。React 选 O(1)
  - **Hooks 把"<em>有状态</em>"从 class 解耦到任意函数**：UI = f(state) 哲学进一步落地，函数组件能等价表达 class 组件能做的所有事
  - **Server Components 是"<em>状态可以在服务器</em>"的扩展**：UI = f(state) 中 state 不再限制于客户端
- **应用场景**：
  - 给 Vue / Angular / Svelte 工程师讲 React
  - 设计自己的状态管理库（理解为什么 Redux / Zustand / Mobx 各自的取舍）
  - 评估"<em>这个第三方组件是否符合 React 哲学</em>"
- **陷阱**：
  - 把 React 当 "view 层"：React 实际是"<em>UI = f(state)</em>" 的完整运行时，包含状态机制
  - 用 Vue 的反应式心智写 React：直接 mutate state 不会触发渲染
  - 滥用 useMemo / useCallback：很多场景比直接重新计算更慢
- **关联章节**：JS · 闭包 / TS 类型系统 / B1-B5 心智模型
- **预估字数**：5500-6500

## A3 · Fiber 架构 ——「机器怎么跑？」⭐ 最难章

- **定位**：讲清楚 2016 年 Fiber 重写的<strong>具体机制</strong>。这是 React 内部最神秘也最重要的部分——理解后所有"<em>为什么 useEffect 在 commit 后跑</em>" / "<em>为什么 Concurrent 能时间切片</em>" / "<em>为什么 Suspense 能 throw promise</em>" 都有了根因。
- **与既有主题交叉的处理**：调度相关（microtask / requestIdleCallback）<strong>短重述 + 链回</strong> `javascript/03-async/` 和 `ecma/01-history/04-async-evolution`，正文聚焦 Fiber 自己的数据结构。
- **关键知识点**：
  - **Fiber 节点 = 工作单元**：每个 React 元素对应一个 Fiber 节点
    - 关键字段：<code>type</code> / <code>stateNode</code>（DOM 节点 / class 实例）/ <code>child</code> / <code>sibling</code> / <code>return</code>（parent）/ <code>memoizedState</code>（hooks 链表）/ <code>memoizedProps</code> / <code>flags</code>（要做什么操作）/ <code>lanes</code>（优先级）
    - <strong>Fiber tree 是链表而非树</strong>——可中断遍历的关键
  - **双缓冲（double buffering）**：current tree（屏幕上的）+ workInProgress tree（构建中的）。commit 时切换
  - **Work loop 工作循环**：
    - <code>workLoopSync</code>（不可中断）vs <code>workLoopConcurrent</code>（可中断）
    - <code>performUnitOfWork</code> 处理一个 Fiber → <code>beginWork</code>（render 阶段）→ <code>completeUnitOfWork</code>（unwind）
    - <code>shouldYield()</code> 让出主线程给浏览器（基于 <code>scheduler</code> 包的 5ms 时间片）
  - **Lane 模型**（React 18+）：用 31 位 bitmask 表达优先级
    - SyncLane / InputContinuousLane / DefaultLane / TransitionLane / IdleLane / OffscreenLane
    - 多个更新合并到同一 lane → batching
    - 高优先级更新打断低优先级 → 时间切片
  - **Render 阶段**（可中断）：构建 workInProgress tree，决定有哪些 effects
  - **Commit 阶段**（不可中断）：3 个子阶段
    - <strong>Before mutation</strong>：getSnapshotBeforeUpdate（class）
    - <strong>Mutation</strong>：实际 DOM 操作 + ref detach / refs 更新
    - <strong>Layout</strong>：useLayoutEffect / componentDidMount / componentDidUpdate
    - 之后异步：<strong>Passive effects</strong>（useEffect）
  - **Hooks linked list**：每个函数组件 Fiber 的 <code>memoizedState</code> 是一个单链表，<code>useState</code> / <code>useEffect</code> 等按调用顺序连接 ⭐ 解释了"<em>Hooks 必须按相同顺序调用</em>"的根因
  - **Reconciliation diff 算法**：
    - 同 type → 复用 Fiber，更新 props
    - 不同 type → 销毁老 + 创建新
    - 列表比较用 key 配对 → key 改变 = 销毁重建
- **底层逻辑要点**：
  - **Fiber 不是树，是"<em>链表 + parent 指针</em>"** —— 这才能在任意 Fiber 暂停 / 恢复
  - **双缓冲让 React 能"<em>原子提交</em>"** —— commit 阶段不会出现"<em>渲染了一半</em>" 的中间态
  - **Lane 模型是 React 18 时间切片的核心**——Lane 之间的优先级关系决定哪些更新可以合并、哪些必须打断
  - **Hooks linked list 是 Hooks 设计的"<em>引擎实现</em>"**：链表节点位置 = 调用顺序，所以 Rules of Hooks 不只是约定，是规范级要求
- **应用场景**：
  - 调试"<em>useEffect 顺序异常</em>"：理解 hooks 链表
  - 理解 React DevTools Profiler 的输出（Fiber tree、commit phase）
  - 写 react-reconciler 自定义 host（Ink / React Native / 自家渲染器）
- **陷阱**：
  - 把"render"等同于"DOM 渲染"：React 的 render 是"<em>构建 Fiber tree</em>"，commit 才动 DOM
  - 把 useLayoutEffect 当 useEffect 用：前者同步阻塞 commit、后者异步不阻塞
  - Conditional Hooks（<code>if (cond) useState()</code>）：破坏链表节点对应关系，必报错
- **关联章节**：A4 Concurrent、B6-B11 Hooks、B12 Reconciliation 用户视角
- **预估字数**：7000-8000（最难章，含数据结构图 + work loop 伪代码）

## A4 · Concurrent 与异步 ——「单线程怎么并发？」

- **定位**：把 A3 Fiber 架构能力<strong>翻译成用户可见的特性</strong>——时间切片、Suspense、useTransition、Server Components 等。
- **关键知识点**：
  - **Concurrent rendering 的核心机制**：
    - 时间切片（time slicing）：5ms work + yield to browser → 60fps 保证
    - 优先级调度：高优先级更新可以打断低优先级
    - <code>requestIdleCallback</code> vs <code>MessageChannel</code>：scheduler 包用 MessageChannel 投递宏任务（rIC 在某些浏览器太慢）
  - **Suspense 与 Promise 集成**：
    - "<em>Throw a Promise</em>" 模式：组件渲染时 throw 一个未 resolve 的 Promise → React 捕获 → 等 Promise → 重新渲染
    - 触发 Suspense fallback 的边界：最近的 Suspense boundary
    - <code>SuspenseList</code>（实验性）：协调多个 Suspense
  - **Transition vs Urgent update**：
    - <code>useTransition</code>：把更新标为 transition（低优先级、可被打断）
    - 自动 batching：一次 event handler / promise / setTimeout 的多个 setState 合并
    - <code>useDeferredValue</code>：把一个值的更新推迟到 transition
  - **Server Components 异步边界**：
    - RSC 在服务器渲染，可以 <code>async function</code> + <code>await</code>
    - Suspense + RSC：服务器流式渲染，HTML 分块到达浏览器
    - 'use client' 边界：客户端组件无法被 RSC 直接 await，需 props 传递
  - **Actions 与异步表单**：
    - <code>useActionState</code>：替代手写 useState + try/catch
    - <code>useFormStatus</code>：表单 pending 状态
    - <code>useOptimistic</code>：乐观更新
  - **<code>use</code> API（React 19）**：
    - 在组件 render 中读 Promise（搭配 Suspense）/ 读 Context
    - 替代 useContext 在某些场景的灵活性
- **底层逻辑要点**：
  - **React 的 "单线程并发" 不是真多线程，是 "<em>把渲染拆成时间片</em>"** —— 每片 5ms，让出后浏览器能响应交互
  - **Suspense 的 throw promise 是规范级 hack**：JS 没有"<em>暂停渲染</em>"原语，React 用 throw / catch 模拟（A3 Fiber 的 unwind 机制实现）
  - **Server Components 是 React 19 最大的认知挑战**：UI 不再是"<em>状态 → 视图</em>"，而是"<em>服务器状态 + 客户端状态 → 视图</em>"两层模型
  - **Actions 把"<em>异步操作 + UI 状态</em>"打包**：解决 Hooks 时代每个表单都要手写 useState/try/catch 的样板代码
- **应用场景**：
  - 大列表渲染：useTransition 让搜索过滤"丝滑"
  - 数据 fetching：Suspense + use API + RSC 替代 useEffect 模式
  - 表单：Actions 替代 React Hook Form 的部分能力
- **陷阱**：
  - useTransition 不是"<em>异步函数</em>"——它仍同步执行，只是把 setState 标为 transition
  - Suspense fallback 频繁闪烁：边界放太低导致 micro-suspense
  - RSC 内不能用 useState / useEffect / 浏览器 API
- **关联章节**：A3 Fiber、B13 Suspense、B14 useTransition、B16 RSC、B17 Actions、B18 use API
- **预估字数**：6500-7500

## A5 · 生态与工程化

- **定位**：把 React 19 时代的<strong>主流生态</strong>系统化梳理一遍——状态管理 / 路由 / 数据 fetching / 元框架。**不是教你怎么用每个库**，是给"<em>选什么 / 何时选</em>"的决策树。
- **关键知识点**：
  - **元框架（Meta-frameworks）**：
    - **Next.js App Router**（事实标准）：RSC + Actions 一等公民、文件路由、ISR
    - **Remix → React Router v7**：合并后专注 SPA + SSR / "fullstack 框架"
    - **Tanstack Start**：新兴选手，类型友好
    - **Vite + React**：保留 SPA 模式（不需要 SSR / RSC）
  - **状态管理**：
    - **Zustand**（最简）：基于 hook 的 store，无 provider
    - **Jotai**：原子化（atom-based），读时订阅
    - **Redux Toolkit**：传统选择，复杂应用 + DevTools
    - **MobX**：响应式（Vue 风格），少数项目用
    - **XState**：状态机，适合复杂流程（结账 / 表单向导）
  - **数据 fetching**：
    - **TanStack Query**（事实标准）：服务端状态、缓存、乐观更新、SSR 集成
    - **SWR**（Vercel）：轻量替代
    - **Apollo Client**：GraphQL 专属
    - **tRPC**：类型安全的 RPC（端到端 TypeScript）
  - **路由**：
    - **React Router v7**（事实标准）：嵌套路由、loaders、actions
    - **TanStack Router**：类型安全路由（路由参数自动类型推导）
    - 元框架内置（Next.js / Remix）替代独立路由库
  - **表单**：
    - **React Hook Form**：最少重渲染、简单 API
    - **Formik**：传统选择
    - **TanStack Form**：新兴选手，类型友好
    - 19+ Actions 替代部分场景
  - **测试**：
    - **Vitest** + **React Testing Library**（事实标准）
    - **Playwright** / **Cypress**：E2E
  - **UI 库**：
    - **shadcn/ui**：复制源码模式（事实标准）
    - **Radix UI**：headless primitives
    - **Material UI / Mantine / Chakra**：传统组件库
    - **Tailwind CSS**：原子 CSS 事实标准（深度学习见独立 Tailwind 主题）
- **决策框架**：
  - 何时 Next.js App Router？SEO / RSC / 全栈
  - 何时纯 Vite + React？SPA / 已有后端 / 不需要 SSR
  - 何时 Zustand vs Redux Toolkit？应用复杂度 + 团队习惯
  - 何时 TanStack Query vs RSC？是否能用 RSC（Next.js）；客户端复杂状态用 Query
- **底层逻辑要点**：
  - **元框架不是"附加功能"，是"<em>定义 React 的运行环境</em>"** —— Next.js 决定何时是 RSC、何时是 'use client'、何时 Static / Dynamic
  - **状态管理选择本质是"<em>状态生命周期</em>"问题**：组件级 → useState；跨组件 → Context；全局 → Zustand；服务端缓存 → Query；流程状态 → XState
  - **2025 年的大势**：客户端复杂度下降（更多搬到服务器）+ 类型安全提升（端到端 TS）+ "shadcn 复制模式"取代传统组件库
- **应用场景**：
  - 新项目启动选型
  - 老项目 Next.js Pages Router → App Router 升级
  - 评估"<em>是否换状态管理库</em>"
- **陷阱**：
  - 过度引入库：useState / useReducer 已能解决 90% 状态问题
  - 把 RSC 当"<em>SSR 的升级版</em>"：心智完全不同（A4 已讲）
  - shadcn 复制源码后忘了"<em>自己 own 它</em>"：升级是手动的，不是 npm update
- **关联章节**：A4 Concurrent、B16 RSC、B17 Actions
- **预估字数**：5000-6000

---

# Track B · React 官网知识精读（19 章 / 4 Part）

> 按 react.dev Reference + 设计动机系统化。每章给出：心智模型 + 完整签名 + 典型代码 + 边界情况 + 与内部机制的关系。

## Part 1 · 心智模型（5 章）

### B1 · 渲染模型与 React 元素

- **定位**：从最基础讲起——React 元素是什么？render 函数是什么？组件是什么？
- **关键知识点**：
  - **React 元素**：<code>{ type, props, key, ref, ... }</code> 对象，不是 DOM 节点
  - **JSX 是糖**：<code>&lt;div&gt;{x}&lt;/div&gt;</code> 编译为 <code>React.createElement('div', null, x)</code>（旧 runtime）或 <code>jsx('div', { children: x })</code>（新 runtime）
  - **Components 类型**：function component / class component / forwardRef component（19 退役）/ memo component / lazy component / Suspense
  - **render 触发条件**：state 变化 / props 变化 / parent re-render / context 变化 / ref 变化（在 19 中处理特殊）
  - **render 是纯函数**：相同 props + state 必须返回相同元素树。副作用必须放 useEffect
- **预估字数**：4500-5500

### B2 · JSX 编译与运行时

- **定位**：理解 JSX 不是模板而是表达式。
- **关键知识点**：
  - **新 JSX runtime（17+）** vs **classic runtime**
  - <code>jsxImportSource</code> 配置（Emotion / Theme UI 用）
  - JSX → JS 编译：Babel <code>@babel/preset-react</code> / SWC <code>@swc/plugin-jsx</code>
  - JSX 在 TypeScript 里：<code>tsconfig.jsx: "react-jsx"</code> + <code>JSX.IntrinsicElements</code>（详见 <code>typescript/03-reference/16-iterators-jsx</code>）
  - Fragment <code>&lt;&gt;</code> / <code>&lt;Fragment&gt;</code>
  - JSX 命名规则：小写 → DOM 节点，大写 → 组件
- **预估字数**：4000-5000

### B3 · 组件与 Props

- **定位**：组件是 React 的复用单元，Props 是组件的输入。
- **关键知识点**：
  - 函数组件签名：<code>(props) =&gt; JSX</code>
  - 解构 Props 的最佳实践
  - children prop 与组合
  - 默认值（19 之前 defaultProps，19 之后建议解构默认值）
  - **Props 不可变规则**：组件不能修改 props
  - TypeScript：<code>type Props = ...</code> + 何时用 type vs interface
  - Render Props 模式
  - HOC 模式（已不推荐，自定义 Hooks 替代）
- **预估字数**：4500-5500

### B4 · State 基础

- **定位**：useState 的心智模型，是后续所有 Hooks 章的基石。
- **关键知识点**：
  - <code>useState(initial)</code> 完整签名
  - Lazy initializer：<code>useState(() =&gt; expensive())</code>
  - Updater function：<code>setX(prev =&gt; prev + 1)</code> vs <code>setX(x + 1)</code>
  - **State 是不可变的**：<code>setState({...obj, x: 1})</code> 而非 mutate
  - 多个 setState 合并（自动 batching）
  - State 与闭包：经典陷阱"<em>setInterval 里的 stale state</em>"（短重述 + 链回 JS 闭包）
  - 函数式更新与 Strict Mode 双重渲染
- **预估字数**：4500-5500

### B5 · 条件 / 列表 / 事件 / Form

- **定位**：把心智模型落到日常代码模式。
- **关键知识点**：
  - 条件渲染：<code>&amp;&amp;</code> / 三元 / 早返回 / 提取子组件
  - 列表 + key：<strong>key 必须稳定 + 唯一</strong>，不要用 index
  - 事件处理：<code>onClick</code>、合成事件 vs 原生事件、事件委托
  - 表单受控 vs 非受控
  - 19+ Form Actions（短重述 + 链回 B17）
- **预估字数**：4500-5500

---

## Part 2 · Hooks 全谱（6 章）

### B6 · useState 深度

- **定位**：B4 是"<em>怎么用</em>"，本章是"<em>怎么工作</em>"。
- **关键知识点**：
  - useState 的 hook linked list 节点结构（A3 链回）
  - State 的 dispatch 函数引用稳定性（保证）
  - Object.is 比较：什么情况不触发 rerender
  - 函数 state 的特殊处理：<code>setX(() =&gt; fn)</code> vs <code>setX(fn)</code>
  - useReducer 是 useState 的超集
- **预估字数**：4000-5000

### B7 · useEffect 完整生命周期

- **定位**：useEffect 是 React 中最难掌握的 Hook。本章把它讲透。
- **关键知识点**：
  - 心智模型："<em>同步外部系统到 React state</em>"——不是"componentDidMount 替代"
  - 完整生命周期：mount → effect 跑 → state/props 变 → cleanup → effect 重跑 → unmount → cleanup
  - 依赖数组：浅比较 + Object.is
  - cleanup 的常见用途：取消订阅、abort controller、移除 listener
  - 闭包陷阱（短重述 + 链回 JS 闭包）
  - useLayoutEffect vs useEffect：同步 vs 异步
  - Strict Mode 双重 effect 触发
  - React 19 effect events（<code>useEffectEvent</code> 提案）
- **预估字数**：5500-6500（最难 Hook 章）

### B8 · useReducer / useContext

- **定位**：复杂状态 + 跨组件共享。
- **关键知识点**：
  - useReducer：替代 useState 的 4 个场景
  - <code>action</code> 类型设计（discriminated union，链回 TS）
  - useContext：避免 prop drilling
  - Context 的性能陷阱：value 引用变了就所有消费者重渲染
  - 配套 useMemo 优化 context value
  - 19+ <code>use(SomeContext)</code> 替代部分 useContext 用法
  - Context Selector 模式（user-land 实现）
- **预估字数**：5000-6000

### B9 · useMemo / useCallback

- **定位**：缓存机制——但比想象的更微妙。
- **关键知识点**：
  - useMemo：缓存计算结果
  - useCallback：缓存函数引用（其实是 <code>useMemo(() =&gt; fn, deps)</code> 的糖）
  - 何时该用：① 传给 React.memo 子组件 ② useEffect 依赖项 ③ 真的昂贵的计算（>1ms）
  - 何时不该用：基本类型计算、字符串拼接、小数组——cache 开销 > 计算开销
  - <code>React Compiler</code>（19 实验性）：自动加 memoization，未来减少手动 useMemo / useCallback
- **预估字数**：4500-5500

### B10 · useRef / useImperativeHandle

- **定位**：脱离 React 渲染体系的"逃生口"。
- **关键知识点**：
  - useRef 心智：<code>{ current: T }</code> 容器，<strong>修改不触发渲染</strong>
  - 3 种用法：① DOM ref ② 跨渲染保留可变值 ③ 缓存上次值
  - <code>useImperativeHandle</code>：自定义 ref 暴露的方法
  - React 19 <code>ref as prop</code>：取代 <code>forwardRef</code>
  - <strong>callback ref</strong>：<code>ref={node =&gt; ...}</code> 模式（19 加 cleanup）
- **预估字数**：4500-5500

### B11 · 自定义 Hooks + Rules of Hooks

- **定位**：Hooks 设计精髓——把行为从组件抽离到可复用单元。
- **关键知识点**：
  - 自定义 Hook 命名约定：<code>use*</code> 前缀（ESLint 强制）
  - Rules of Hooks 的 2 条：① 只在顶层调用 ② 只在 React 函数内调用
  - 为什么必须遵守：A3 hooks linked list 详述
  - 经典自定义 Hooks 模式：useFetch / useDebounce / useEventListener / useLocalStorage / usePrevious / useIsMounted
  - 命名 vs 实现解耦：自定义 Hook 内部可以用任意其他 Hooks
  - 何时不该抽自定义 Hook：仅 1 个组件用 + 逻辑不复杂
- **预估字数**：5000-6000

---

## Part 3 · 渲染与并发（4 章）

### B12 · Reconciliation 用户视角

- **定位**：A3 讲了 Fiber 内部，本章讲"<em>用户能感知的 reconciliation 行为</em>"。
- **关键知识点**：
  - Reconciliation 算法用户感知：相同 type 复用、不同 type 重建
  - <strong>key 的工程意义</strong>：列表中改变 key 强制重建
  - <code>React.memo</code>：浅比较 props，相同则跳过 render
  - <code>memo</code> 的限制：children 是函数 / object 仍会变
  - <strong>什么时候 memo 起作用</strong>：父组件频繁渲染 + 子组件 props 大多不变
- **预估字数**：4000-5000

### B13 · Suspense 用户视角

- **定位**：A4 讲了 Suspense 机制，本章讲怎么用。
- **关键知识点**：
  - <code>&lt;Suspense fallback={...}&gt;</code> 边界
  - 配合 <code>React.lazy</code>：代码分割
  - 配合 <code>use(promise)</code>（19+）：数据 fetching
  - 配合 RSC：流式渲染
  - 嵌套 Suspense + showFallback 行为
  - <code>SuspenseList</code>（实验性）
- **预估字数**：4000-5000

### B14 · useTransition / useDeferredValue

- **定位**：把更新标为低优先级。
- **关键知识点**：
  - useTransition：<code>const [isPending, startTransition] = useTransition()</code>
  - 典型场景：搜索框过滤大列表、Tab 切换
  - useDeferredValue：把值的更新标为低优先级
  - 与 debounce / throttle 的对比：transition 不是延迟，是优先级
  - Transition 不是异步：<code>startTransition(async () =&gt; {})</code> 是 19+ 才支持
- **预估字数**：4000-5000

### B15 · Error Boundary

- **定位**：唯一仍必须用 class component 的场景。
- **关键知识点**：
  - <code>componentDidCatch</code> + <code>getDerivedStateFromError</code>
  - 边界粒度选择
  - 重试机制
  - <strong>Error Boundary 不捕获</strong>：① event handler 抛错 ② 异步代码 ③ Server-rendered HTML 阶段错误 ④ Error Boundary 自身的错
  - <code>react-error-boundary</code> 库（社区事实标准）
  - 19+ 改进：<code>onUncaughtError</code> / <code>onCaughtError</code> root options
- **预估字数**：4000-5000

---

## Part 4 · 现代 React（4 章）

### B16 · Server Components 心智

- **定位**：React 19 最大的认知转变。
- **关键知识点**：
  - **Server Components vs Client Components**：边界决策
  - 'use client' / 'use server' 指令
  - RSC 能：fetch、async/await、读文件、读 env、直连数据库
  - RSC 不能：useState / useEffect / 浏览器 API / event handler
  - props 序列化要求：跨 'use client' 边界的 props 必须可序列化
  - Server Action：<code>'use server'</code> 函数 + form action
  - **运行时**：必须 Next.js App Router / Waku / 自家 RSC runtime（不能纯 React）
- **预估字数**：5500-6500

### B17 · Actions + useFormStatus + useOptimistic

- **定位**：React 19 表单 / 异步操作的"事实标准"。
- **关键知识点**：
  - <code>useActionState</code>：替代 useState + try/catch + loading
  - <code>useFormStatus</code>：子组件感知父 form pending
  - <code>useOptimistic</code>：乐观更新 + rollback
  - Actions 与 Server Actions 的关系
  - Form action prop：<code>&lt;form action={fn}&gt;</code>
  - 与 React Hook Form 的取舍
- **预估字数**：4500-5500

### B18 · `use` API + Promise 集成

- **定位**：React 19 的"读异步资源"统一 API。
- **关键知识点**：
  - <code>use(promise)</code>：Suspense 集成
  - <code>use(Context)</code>：替代 useContext 的灵活版（可在循环 / 条件中调用）
  - <code>use</code> 与传统 Hooks 的差异：可在循环条件中调用
  - 与 SWR / TanStack Query 的取舍
- **预估字数**：4000-5000

### B19 · ref as prop / forwardRef 退役 + 19+ 杂项

- **定位**：杂项收口。
- **关键知识点**：
  - **ref as prop**（19+）：<code>function Comp({ ref })</code> 直接接收 ref，不再需要 forwardRef
  - <code>forwardRef</code> 退役但仍可用（向后兼容）
  - <code>defaultProps</code> 退役（仅函数组件，class 仍支持）
  - 字符串 refs 彻底移除
  - <code>React.startTransition</code>（顶层 API）vs <code>useTransition</code>（Hook）
  - <code>renderToPipeableStream</code> / <code>renderToReadableStream</code>（SSR）
  - <code>React.cache</code>（仅 RSC）
- **预估字数**：4000-5000

---

## 写作约定

### Track A 章节强调"叙事"

- 用时间线、版本号、关键人物、设计动机切入
- 每章末尾必须有"小结表"或"关键决策时间点"
- 引用 RFC / blog / Twitter 原始来源

### Track B 章节强调"精确 + 心智"

- 每章先给"<em>心智模型</em>"（why this exists）
- 再给完整 API 签名
- 再给 3-5 个典型代码示例
- 再给 corner case + 陷阱
- 严禁堆 API 而无心智解释

### 必须强调"独立性"的设计

- 每章 `延伸阅读` 末尾标 **Track A** 或 **Track B** 内部链接
- 严禁让读 A 必须先读 B（反之亦然）

### 必须明确标注 ⚠️ 的内容

- **Class components** 始终标"19 仍支持但新代码避免"
- **forwardRef / defaultProps** 始终标"19 退役"
- **legacy context API** 标"已彻底废弃"
- **String refs** 标"19 已移除"
- **SuspenseList** 标"实验性，谨慎用"
- **React Compiler** 标"19 实验性，关注但不押注"

---

## 风险提示

### 可能写不下去 / 容易翻车的章节

- **A3 Fiber 架构**：内部数据结构 + work loop + lane model 三层叠加，必须有清晰图示和伪代码
- **A4 Concurrent**：抽象概念多（transition / urgent / lane / scheduler），容易讲飘
- **B7 useEffect**：陷阱密度全 React 最高，必须给"心智模型"统一答案
- **B16 RSC**：心智完全不同，必须有大量"<em>对比 useEffect 模式</em>" 的例子

### 写作顺序建议（时间紧张）

- **第一批交付**：A1 + A2（建立 React 心智整体框架）
- **第二批**：B1-B5 心智模型（读者立刻能写 React）
- **第三批**：A3 Fiber + B6-B11 Hooks（深入引擎）
- **第四批**：A4 + B12-B15 渲染并发
- **第五批**：B16-B19 现代 React + A5 生态

### 风险：和已完工主题的关系

- **JS 主题**：本主题大量"短重述 + 链回"JS（闭包、Promise、Event Loop）
- **TS 主题**：B 轨章节涉及 TypeScript 时短重述 + 链回（不重写 TS 内容）
- **ECMA 主题**：A4 Concurrent 章涉及 microtask / macrotask 时链回 ECMA A4 异步演进

### 总规模估算

- Track A：6000 + 6000 + 7500 + 7000 + 5500 ≈ **32,000 字**
- Track B：~~~ Part 1 (5500×5=22500) + Part 2 (5000×6=30000) + Part 3 (4500×4=18000) + Part 4 (5000×4=20000) ≈ **90,500 字**
- 总计：**~120,000 字 / 24 章**，比 ECMA（~57k 字 / 11 章）大 1 倍，比 TS（~95k 字 / 20 章）稍大
- **写作时间预估**：每章约 30-60 分钟（加上 cross-file updates），24 章约 12-24 小时

---

## 子代理报告

**最难写、最容易翻车**：A3 Fiber 架构、B7 useEffect、B16 Server Components。这三章如果只罗列 API 和概念，读者会觉得"<em>看完了仍不会用</em>"。必须把"<em>为什么这样设计 + 怎么用 + 不该怎么用</em>" 三段话讲透。

**可以快速产出**：A5 生态速查、B5 条件列表事件、B12 Reconciliation 用户视角、B14 useTransition、B15 Error Boundary、B19 杂项。这些章节套路成熟，概念正交。

**最有价值的一章**：A2 设计哲学。读完这一章，读者对 React 的理解从"<em>会用 API</em>" 升级到"<em>知道 React 为什么这样</em>"。是后续所有章节的"心智地基"。

**优先级建议**：先 A1+A2（心智锚定）→ B1-B5（能上手写 React）→ A3+B6-B11（深入 Hooks）→ B16+B17+A4（拥抱 React 19）→ B12-B15+B18+B19+A5（收口）。
