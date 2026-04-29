# React 深度学习 · 章节大纲

> 本文件是 React 主题的写作蓝本。**7 阶段 · 24 章**：从 React 项目史与设计哲学（P1）讲起，沿"用户接触深度"铺开 —— 渲染心智模型（P2）→ Hooks 全谱（P3）→ Fiber 内部机制（P4）→ Concurrent 并发（P5）→ Server Components 与 Actions（P6）→ 生态与工程化（P7）。
> 编写日期：2026-04-27（首版双轨）｜重构日期：2026-04-29（参照 V8 / ECMA / Node 范式重组为单轨 7 阶段）｜目标版本：React 19.x（19.0 / 19.1）

---

## 元信息

- **目标版本**：**React 19.x**（默认）—— 含 Actions / Server Components / `use` API / `useOptimistic` / `useActionState` / ref as prop。**老 API**（class components / `componentWillMount` / legacy context / `forwardRef` / `defaultProps`）只在「陷阱 / 历史」点到，不展开。
- **来源**：
  - [react.dev](https://react.dev/) Reference 全量（Hooks / Components / API）
  - [React RFCs](https://github.com/reactjs/rfcs)（Server Components / Actions / Concurrent 等设计动机原始来源）
  - [React 源码](https://github.com/facebook/react)（仅 P4.1 Fiber 章涉及 reconciler / scheduler 包）
  - [Andrew Clark / Sebastian Markbåge / Dan Abramov 的 Twitter / blog](https://overreacted.io/)（设计意图最权威解读）
- **目标读者**：已学过 `javascript/`（特别是 02-advanced 闭包/this/原型）+ `typescript/` 的研发工程师，想理解"React 的设计哲学、Fiber 怎么跑、Hooks 为什么这样设计"。

---

## 整体设计：7 阶段 · 沿"用户接触深度"铺开

参照 V8 / ECMA / Node 主题的多阶段范式，把 React 的所有内容沿"用户从写组件到理解引擎"的深度铺开：

| 阶段 | 章数 | 核心问题 |
|---|---|---|
| **P1 · React 是谁** | 2 | React 怎么来、设计哲学怎么落地 |
| **P2 · 渲染心智模型** | 5 | 写 React 组件需要建立的心智模型（元素 / JSX / 组件 / Props / State） |
| **P3 · Hooks 全谱** | 6 | 函数组件怎么拥有状态：useState / useEffect / useReducer / useMemo / useRef / 自定义 Hooks |
| **P4 · Fiber 内部机制** | 2 | Fiber 数据结构 + work loop（机制视角）+ Reconciliation（用户视角） |
| **P5 · Concurrent 并发** | 4 | 时间切片 / Suspense / useTransition / Error Boundary |
| **P6 · Server Components 与 Actions** | 4 | RSC / Actions / use API / 现代杂项 |
| **P7 · 生态与工程化** | 1 | 元框架 / 状态 / 数据 / 路由 / 测试 / UI 决策树 |

总计 **24 章 ≈ 145,000 字**（已写完，重构主要是分组方式调整）。

---

## 重构 vs 原双轨结构

**原结构（2026-04-27）**：Track A · 历史脉络（5 章）+ Track B · 官网精读（19 章）= 双轨独立。
**新结构（2026-04-29）**：单轨 7 阶段。借鉴 V8 / ECMA / Node 主题的统一范式。

**原章节到新阶段的映射**：

| 原 | 新位置 | 章节 |
|---|---|---|
| A1 起源 | P1.1 | 项目史 2013-2025 |
| A2 设计哲学 | P1.2 | 设计哲学 |
| A3 Fiber | P4.1 | Fiber 架构（机制视角） |
| A4 Concurrent | P5.1 | Concurrent 总览 |
| A5 生态 | P7.1 | 生态决策树 |
| B1-B5 心智模型 | P2.1-P2.5 | 渲染模型 / JSX / 组件 / State / 条件列表事件 |
| B6-B11 Hooks | P3.1-P3.6 | useState / useEffect / useReducer+Context / useMemo+useCallback / useRef / 自定义 Hooks |
| B12 Reconciliation | P4.2 | Reconciliation（用户视角） |
| B13-B15 渲染并发 | P5.2-P5.4 | Suspense / Transition / Error Boundary |
| B16-B19 RSC & Actions | P6.1-P6.4 | RSC / Actions / use API / 杂项 |

---

## 与既有主题的边界 ——「短重述 + 链回」原则

延续主题家族的统一约定：

> ✅ **短重述**：JS / TS / V8 / ECMA 已讲透的机制（闭包、Promise、Event Loop、Proxy、原型链、V8 Hidden Class）用 1-3 句话点出本质
> ✅ **链回**：紧跟一句"详细的 X 请参考 [`javascript/{phase}/{chapter}`]"或 `typescript/...` / `v8/...` / `ecma/...`
> ❌ **不重复 JS / TS / V8 / ECMA 已讲透的内容**

具体交叉模式：

| 概念 | 在哪讲透 | React 主题里怎么处理 |
|---|---|---|
| 闭包陷阱（Hooks 经典坑）| `javascript/02-advanced/02-closures` | 短重述 + 链回，P3 各章用闭包讲 stale state |
| Promise / async 用户视角 | `javascript/03-async/` | 短重述 + 链回，P5.2 Suspense 讲 throw promise 时只点设计 |
| TypeScript 泛型 | `typescript/02-type-manipulation/07-generics` | 链回，P2.3 Props 类型设计时引用 |
| Event Loop / Microtask | `ecma/07-execution/03-event-loop-async` + `v8/05-embedding/01-embedder-api` | 短重述 + 链回，P4.1 Fiber 调度讲 scheduler 与 microtask 协作时引用 |
| V8 Hidden Class / IC | `v8/03-speedup/` | 链回，P2.1 讲 React 不可变性时点 V8 优化的关系 |
| Module Records | `ecma/07-execution/04-modules-tla` | 链回，P2.2 JSX 编译讲 import 时引用 |

---

## 内容覆盖原则 ——「react.dev 系统化 + RFC 设计动机」

- **P1 历史 + 设计哲学**：用 4 问骨架（为什么存在 / 它是什么 / 机器怎么跑 / 怎么并发）支撑，每章按权威来源系统化补全
- **P2-P3 心智 + Hooks**：按 react.dev Reference 章节逐项精读，但把"<em>API 说明</em>"补成"<em>设计动机 + API + 心智模型 + 陷阱</em>"
- **关键设计决策必引 RFC**：Server Components 引 [RFC #188](https://github.com/reactjs/rfcs/pull/188)；Actions 引 [RFC #229](https://github.com/reactjs/rfcs/pull/229)；Hooks 引 [RFC #68](https://github.com/reactjs/rfcs/pull/68)
- **Fiber 内部唯一允许引用源码**（P4.1 章），其他章节<strong>不读源码</strong>，避免实现细节稀释心智模型

---

## 节奏建议

- **连读组**：
  - P1.1 + P1.2（项目史 → 设计哲学，是 React 的"基因"）
  - P2.1-P2.5（心智模型五件套，必须连读）
  - P3.1-P3.6（Hooks 全谱，构成完整 Hooks mental model）
  - P4.1 + P4.2（Fiber 机制 → Reconciliation 用户视角，互为前提）
  - P5.1 + P5.2 + P5.3（Concurrent 总览 → Suspense → Transition）
  - P6.1 + P6.2 + P6.3（现代 React 三件套：RSC → Actions → use API）
- **可独立跳读**：
  - P5.4 Error Boundary、P6.4 杂项、P7.1 生态决策树
- **建议阅读顺序**：
  - **写业务 React 的工程师**：P2 → P3 → P5.4 + P6.4
  - **资深 / 架构师**：P1 全读 → P4 全读 → P6 全读
  - **想深入引擎的好奇心**：P1.1 → P4.1 → P4.2 → P5（全）

---

## 文件结构（重构后）

```
react/
  01-overview/                       (P1 · React 是谁 · 2 章)
    01-history.html                  ← 原 01-history/01-origin.html
    02-design-philosophy.html        ← 原 01-history/02-design-philosophy.html
  02-mental-model/                   (P2 · 渲染心智模型 · 5 章)
    01-rendering-model.html          ← 原 02-reference/01-rendering-model.html
    02-jsx.html
    03-components-props.html
    04-state-basics.html
    05-conditional-list-event-form.html
  03-hooks/                          (P3 · Hooks 全谱 · 6 章)
    01-use-state.html                ← 原 02-reference/06-use-state-deep.html
    02-use-effect.html
    03-use-reducer-context.html
    04-use-memo-callback.html
    05-use-ref.html
    06-custom-hooks.html
  04-fiber/                          (P4 · Fiber 内部机制 · 2 章)
    01-fiber-architecture.html       ← 原 01-history/03-fiber.html
    02-reconciliation.html           ← 原 02-reference/12-reconciliation.html
  05-concurrent/                     (P5 · Concurrent 并发 · 4 章)
    01-concurrent-overview.html      ← 原 01-history/04-concurrent.html
    02-suspense.html
    03-transition.html
    04-error-boundary.html
  06-modern/                         (P6 · Server Components 与 Actions · 4 章)
    01-server-components.html
    02-actions.html
    03-use-api.html
    04-misc.html
  07-ecosystem/                      (P7 · 生态与工程化 · 1 章)
    01-ecosystem-decision.html       ← 原 01-history/05-ecosystem.html
  index.html
  outline.md
```

---

## 章节简述

> **重要**：所有章节的<strong>正文已在原双轨结构下完成</strong>。重构只是迁移文件 + 重组目录 + 更新导航。下方简述用于查阅。

### P1 · React 是谁（2 章）

- **P1.1 · React 项目史 2013-2025**：从 Facebook 内部的 chat 通知 bug → JSX 公开争议 → 2017 Fiber 架构重写 → 2018 Hooks 革命 → 2022 Concurrent → 2024 Server Components 稳定。
- **P1.2 · 设计哲学**：4 个核心设计决策——UI = f(state) / 单向数据流 / Composition over inheritance / 不可变 + 重新渲染。每个都是为了解决某个具体痛点。

### P2 · 渲染心智模型（5 章）

- **P2.1 · 渲染模型与 React 元素**：React 元素是对象 `{type, props, key, ref, ...}` 不是 DOM；render 是纯函数；不同组件类型（function / class / forwardRef / memo / lazy）各自语义。
- **P2.2 · JSX 编译与运行时**：JSX 是糖；新 JSX runtime（17+） vs classic；TypeScript 中的 JSX；Fragment；命名规则。
- **P2.3 · 组件与 Props**：组件是函数；Props 设计；children；ref as prop（19）；TypeScript 类型设计。
- **P2.4 · State 基础**：useState 用法层；setState 触发 render；批处理；setState 函数式更新；状态提升。
- **P2.5 · 条件 / 列表 / 事件 / 表单**：条件渲染模式；列表 + key 设计；合成事件系统；受控 vs 非受控表单。

### P3 · Hooks 全谱（6 章）

- **P3.1 · useState 深入**：Hook linked list 节点结构；dispatch 函数引用稳定性；Object.is bailout；函数 state 特殊处理；与 useReducer 的等价。
- **P3.2 · useEffect**：副作用模型；effect 时机（commit 后异步）；依赖数组；cleanup；和 useLayoutEffect 区别。
- **P3.3 · useReducer + Context**：复杂状态用 reducer；Context 性能特性；何时该用、何时该选 Zustand。
- **P3.4 · useMemo + useCallback**：缓存语义；何时该用、滥用反模式；Object.is 比较。
- **P3.5 · useRef**：DOM ref 与 mutable ref；ref callback；instance var 模式；与 forwardRef / ref as prop 的关系。
- **P3.6 · 自定义 Hooks**：组合范式；命名约定；测试自定义 Hook；与 HOC / render props 对比。

### P4 · Fiber 内部机制（2 章）

- **P4.1 · Fiber 架构 ⭐ 最难章**：Fiber 节点 = 工作单元；双缓冲；work loop；Lane 模型（31-bit 优先级）；Render / Commit 阶段；Hooks linked list。这是 React 内部最重要章。
- **P4.2 · Reconciliation 用户视角**：从 Fiber 视角看 diff；同 type 复用 / 不同 type 销毁；列表 key 配对；何时整棵子树销毁；reconciliation 与 React.memo 关系。

### P5 · Concurrent 并发（4 章）

- **P5.1 · Concurrent 总览**：把 P4.1 Fiber 能力翻译成用户特性——时间切片 / 优先级调度 / Suspense / Transition / RSC 异步边界 / Actions 表单。
- **P5.2 · Suspense**：Suspense boundary；throw promise 模式；fallback；Suspense + RSC 流式渲染。
- **P5.3 · useTransition + useDeferredValue**：把更新标为 transition；自动 batching；何时用 deferredValue。
- **P5.4 · Error Boundary**：class component 实现的 error boundary；错误恢复策略；与 Suspense 的协作。

### P6 · Server Components 与 Actions（4 章）

- **P6.1 · Server Components**：RSC 心智（服务器状态 + 客户端状态两层模型）；'use client' 边界；流式渲染；与传统 SSR 的区别。
- **P6.2 · Actions**：useActionState / useFormStatus / useOptimistic；表单 progressive enhancement；与 Server Actions 配合。
- **P6.3 · use API**：在组件 render 中读 Promise 和 Context；与 Suspense 的协作；和 useContext 的关系。
- **P6.4 · 现代杂项**：ref as prop、`<Context>` as provider、document metadata、新 hydration 错误等 19 杂项特性。

### P7 · 生态与工程化（1 章）

- **P7.1 · 生态决策树**：元框架（Next.js / React Router v7 / TanStack Start）/ 状态管理（Zustand / Jotai / Redux Toolkit）/ 数据 fetching（TanStack Query / SWR）/ 路由 / 表单 / 测试 / UI 库。给"选什么 / 何时选"决策框架。

---

## 与 index.html 卡片的对应

React 主题在站点首页的卡片描述（重构后）：
> 7 阶段 / 24 章：项目史 + 设计哲学 + 渲染心智模型 + Hooks 全谱 + Fiber 架构 + Concurrent 并发 + Server Components + Actions + use API + 生态决策树。

本大纲全部覆盖：
- ✅ 历史与设计 → P1
- ✅ 心智模型 → P2
- ✅ Hooks → P3
- ✅ Fiber → P4
- ✅ Concurrent → P5
- ✅ Server Components 与 Actions → P6
- ✅ 生态 → P7
