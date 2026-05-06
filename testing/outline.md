# 测试工具深度学习 · 章节大纲

> 本文件是 测试工具 主题的写作蓝本。**7 阶段 · 12 章**：从测试工具 15 年史 + 同代人横评（P1）→ 测试心智（金字塔 / 测行为不测实现）（P2）→ Vitest 内部 + 单元测试横评（P3）→ DOM 测试（Testing Library + jsdom/happy-dom/browser mode）（P4）→ 网络 mock（MSW 主线）（P5）→ E2E（Playwright + Cypress 横评）（P6）→ 视觉回归 + Coverage + CI（P7）。
> 编写日期：2026-05-06（首版）｜目标版本：Vitest 3 / Jest 30 / Playwright 1.49 / Testing Library 16 / MSW 2.x / Cypress 14。

---

## 元信息

- **目标版本**：
  - **Vitest 3**（2026 主线，Vite 6+ 配套；含 browser mode GA、workspace、并行优化）
  - **Jest 30**（2025-2026 主线，由 OpenJS 维护；ESM 支持改善但仍非首选 ESM 项目）
  - **Playwright 1.49+**（2026 现代 e2e 事实标准，含 trace viewer + UI mode + multi-browser）
  - **Cypress 14**（仍存量但增长停滞，与 Playwright 形成长期共存）
  - **Testing Library 16**（DOM + React + Vue + Svelte 适配统一在 16）
  - **MSW 2.x**（2024 重写：Service Worker + Node 双模 + WebSocket interceptor）
  - **Bun test**（详见 Bun 主题；本主题作横评对照）
  - **node:test**（Node 22+ 内置 runner，作横评对照）
  - 历史回溯：Mocha 2011 → Jasmine → Jest 2014 (Facebook) → Cypress 2017 → Puppeteer 2017 → Playwright 2020 → Vitest 2021 → Bun test 2023 → MSW 2.0 2024
- **来源**：
  - [vitest.dev](https://vitest.dev/)（Vitest 官方）
  - [jestjs.io](https://jestjs.io/)（Jest 官方，OpenJS 维护）
  - [testing-library.com](https://testing-library.com/)（Testing Library 全家族）
  - [mswjs.io](https://mswjs.io/)（MSW 官方）
  - [playwright.dev](https://playwright.dev/)（Playwright 官方）
  - [cypress.io/docs](https://docs.cypress.io/)（Cypress 官方）
  - [bun.com/docs/cli/test](https://bun.com/docs/cli/test)（Bun test）
  - [nodejs.org/api/test.html](https://nodejs.org/api/test.html)（node:test）
  - Kent C. Dodds blog（kentcdodds.com）—— Testing Library + Testing Trophy 概念原作者
  - Anthony Fu blog（antfu.me）—— Vitest 主要作者
  - Aleksandra Sikora 演讲 —— MSW 主要作者
  - Microsoft Playwright Engineering Blog
- **目标读者**：写过项目但测试覆盖率低 / 测试动不动就 flaky 的工程师；从 Jest 切 Vitest / 从 Cypress 切 Playwright 时想知道根因的工程师；准备搭测试金字塔但不知道每层放什么的 tech lead。
- **不是这个主题的读者**：从没写过测试的人（先学单元测试基础再来）；只想抄一份 Vitest config（这里讲为什么不是配方）。

---

## 整体设计：7 阶段 · 沿"测试金字塔的层级"展开

测试工具的核心问题：**写出能信任 + 能维护 + 跑得快 + 不 flaky 的测试**。这套工具链 15 年来从"Mocha + Jasmine 各自手写 stub"进化到"Vitest + Testing Library + MSW + Playwright 一套现代默认"。我们按"测试金字塔"层级展开 7 阶段。

| 阶段 | 章数 | 核心问题 |
|---|---|---|
| **P1 · 测试工具是谁** | 2 | 项目史（Mocha 2011 → Vitest 2021 → Bun test 2023）+ 同代人横评（8 家 runner） |
| **P2 · 测试心智** | 2 | 测试金字塔 vs 测试奖杯（Kent Dodds）；"测行为不测实现"哲学 + enzyme 为什么死了 |
| **P3 · Vitest + 单元测试** | 2 | Vitest 内部（Vite 复用 + ESM + workspace + browser mode）；Vitest vs Jest vs Bun test vs node:test 横评 |
| **P4 · DOM 测试** | 2 | Testing Library 设计哲学（query by accessibility / userEvent）；jsdom vs happy-dom vs Vitest browser mode 真实浏览器 |
| **P5 · 网络 mock** | 1 | MSW 设计（Service Worker + Node 双模 + WebSocket）+ 与 nock / fetch-mock / 手写 stub 的对比 |
| **P6 · E2E 测试** | 2 | Playwright 内部（CDP/WebDriver BiDi 协议 + fixtures + trace viewer + parallel）；Playwright vs Cypress 横评 |
| **P7 · 视觉、覆盖率、CI** | 1 | Visual regression（Percy / Chromatic / Playwright snapshot）+ Coverage（Istanbul vs V8）+ CI 集成 + flaky 治理 + 决策树 |

总计 **12 章 ≈ 75,000-85,000 字**，平均每章 6,500 字。**比重偏向 P3-P6**（Vitest / Testing Library / MSW / Playwright 是日常主战场），P1-P2 写得紧凑、P7 是收束章。

---

## 与既有主题的边界 ——「短重述 + 链回」原则

测试工具主题与已写主题有多处交集，必须明确划界：

> ✅ **短重述**：1-3 句话点出"它在底层是什么 + 关键性质"
> ✅ **链回**：紧跟一句"详细的 X / Y / Z 请参考 [`主题/{phase}/{chapter}`]"
> ❌ **不要**直接抄一遍其他主题的论述

**关键边界**：

| 概念 | 在哪讲透 | 本主题里怎么处理 |
|---|---|---|
| Vite dev server / plugin 系统 | `vite/02-vite-architecture/` 与 `vite/07-plugins-and-next/` | 链回，P3.1 讲 Vitest 复用 Vite 时短重述 |
| ESM / CJS interop | `vite/03-modules/02-cjs-interop.html` | 链回，P3.2 讲 Jest ESM 痛苦时短重述 |
| Bun test 内部 | `bun/04-toolchain/04-bun-test.html` | 链回，P1.2 横评 + P3.2 横评时短重述 |
| node:test runner | `node/06-modern/01-modern-node.html` | 链回，P3.2 横评时短重述 |
| 浏览器 DOM API（Custom Elements / Shadow DOM） | `browser-rendering/` 主题 | 链回，P4.2 讲 jsdom 实现限制时点 |
| Web APIs（fetch / Request / Response） | `node/04-streams-network/` 与 `browser-rendering/` | 链回，P5 讲 MSW 拦截 fetch 时点 |
| pnpm workspace + filter | `pnpm-monorepo/04-workspaces/02-filter-topological.html` | 链回，P3.1 讲 Vitest workspace + monorepo 测试时点 |
| Turborepo cache + test affected | `pnpm-monorepo/05-orchestration/01-turborepo.html` | 链回，P7 讲 CI 集成时点 |
| TypeScript 类型测试（expect-type / ts-expect） | `typescript/` 主题 | 短重述，P3.1 讲 Vitest 类型测试时点 |
| React Server Components 测试 | 待写 Next.js 主题 | 链回（暂占位），P4.1 讲 Testing Library + RSC 时短点 |

---

## 内容覆盖原则 ——「Kent Dodds 与 Anthony Fu 一手」

测试领域的特点：**主流哲学由几位核心人物长期推动**——Kent C. Dodds（Testing Library + Testing Trophy）、Anthony Fu（Vitest）、Andrey Lushnikov（Playwright）、Aleksandra Sikora（MSW）。他们的 blog / 演讲 / RFC 是写作时的一手依据。

**4 条规则**：

1. **API 定义优先官方文档**：表面 API 以 vitest.dev / playwright.dev / testing-library.com 为准。
2. **设计动机以作者文章为准**：例如"为什么测行为不测实现"原文是 Kent 2016 年的 blog；写"为什么这么设计"必须回到一手出处。
3. **历史 / 退场以官方公告为准**：Enzyme 维护停滞、Cypress 团队动荡、Jest 转 OpenJS 等都有公开公告。
4. **flaky / 性能数字必标条件**：测试场景不同，"Vitest 比 Jest 快 N 倍"需要标项目规模 + ESM/CJS + workspace 维度，否则不写。

---

## 节奏建议

- **连读组**：
  - P1.1 + P1.2（项目史 → 同代人，理解今天的格局）
  - P2.1 + P2.2（金字塔 → 测行为不测实现，建立心智后再看工具）
  - P3.1 + P3.2（Vitest 内部 → 横评，单元测试主战场）
  - P4.1 + P4.2（Testing Library → DOM 实现，前者是哲学后者是落地）
  - P6.1 + P6.2（Playwright 内部 → 与 Cypress 横评）
- **可独立跳读**：
  - 已用 Jest 想换 Vitest：P3.2 单读
  - 准备搭测试金字塔：P2 + P7 单读
  - 写 e2e 选型：P6 全读
  - 治理 flaky：P7 单读
- **建议阅读路径**：
  - 第一次系统学：P1 → P2 → P3 → P4 → P5 → P6 → P7 顺序
  - 已有 Jest 项目：P1.2 + P2.2 + P3.2 重点
  - 准备引入 e2e：P6 + P7

---

## 文件结构

```
testing/
  index.html                         (主题入口卡片)
  outline.md                         (本文件)
  01-overview/                       (P1 · 测试工具是谁 · 2 章)
    01-history.html                  ← 测试工具 15 年史（Mocha → Jasmine → Jest → Cypress → Playwright → Vitest → Bun test）
    02-landscape.html                ← 同代人横评（8 家 runner + 4 家 e2e + Testing Library 全家族）
  02-mindset/                        (P2 · 测试心智 · 2 章)
    01-pyramid-trophy.html           ← 测试金字塔 vs 测试奖杯（Kent Dodds）；单元/集成/e2e/视觉各占多少
    02-behavior-not-implementation.html ← 测行为不测实现哲学 + enzyme 为什么死了 + implementation detail trap
  03-vitest-unit/                    (P3 · Vitest + 单元测试 · 2 章)
    01-vitest-internals.html         ← Vitest 内部：Vite 复用 + ESM + workspace + browser mode + watch
    02-runner-comparison.html        ← Vitest vs Jest vs Bun test vs node:test 全维度横评
  04-dom-testing/                    (P4 · DOM 测试 · 2 章)
    01-testing-library.html          ← Testing Library 设计哲学：accessibility queries + userEvent + 不测 implementation
    02-jsdom-vs-browser.html         ← jsdom vs happy-dom vs Vitest browser mode：何时需要真实浏览器
  05-network-mock/                   (P5 · 网络 mock · 1 章)
    01-msw.html                      ← MSW 设计（Service Worker + Node 双模 + WebSocket）+ nock / fetch-mock / 手写 stub 对比
  06-e2e/                            (P6 · E2E 测试 · 2 章)
    01-playwright-internals.html     ← Playwright 内部：CDP / WebDriver BiDi 协议 + fixtures + trace viewer + parallel
    02-playwright-vs-cypress.html    ← Playwright vs Cypress 横评 + 选型决策
  07-visual-coverage-ci/             (P7 · 视觉、覆盖率、CI · 1 章)
    01-visual-coverage-ci.html       ← Visual regression + Coverage 真相 + CI 集成 + flaky 治理 + 决策树
```

---

## 各章详细大纲

### P1 · 测试工具是谁（2 章）

#### 1.1 测试工具项目史（2011-2026）

- **2011 Mocha**：TJ Holowaychuk 出品，第一个流行的 Node 测试 runner；BDD 风格 + 灵活 reporter
- **2010-2014 Jasmine**：BDD 描述语法（describe / it / expect）成为后续所有 runner 的 API 模板
- **2014-04 Jest**：Facebook 出品，自带 mock + snapshot + 并行；"零配置"成为 React 默认
- **2017 Cypress**：第一个全图形界面 e2e；time-travel debugging；但单 chromium、跨域受限
- **2017 Puppeteer**：Google 出品，CDP 协议直驱 Chrome；Playwright 的前身
- **2020-01 Playwright**：Andrey Lushnikov 团队从 Google 跳到 Microsoft；多浏览器 + 异步事件 + auto-wait + trace viewer
- **2021 Vitest**：Anthony Fu 起步；Vite 生态需要原生 ESM runner；Jest 兼容 API + 性能领先
- **2022 Enzyme 死亡**：Airbnb 维护停滞；React 18 不兼容；Testing Library 全面取代
- **2023-09 Bun test**：Jest 兼容 + Bun 速度；详见 <a href="../bun/04-toolchain/04-bun-test.html">Bun P4.4</a>
- **2024 node:test 进 LTS**：Node 22 内置；轻量但功能不全
- **2024 MSW 2.0**：Service Worker + Node fetch + WebSocket 三模一统
- **2025 Jest 30**：转 OpenJS 治理；ESM 改善但仍非首选 ESM 项目
- **写作要点**：把"今天为什么这样选工具"讲清楚——每代都是回应上代某个具体痛点。**给一张时间轴 SVG**。

#### 1.2 同代人横评

- **横评维度**：
  - **核心定位**（unit / DOM / e2e / visual）
  - **ESM 原生支持**（Jest 仍痛苦 vs Vitest 原生）
  - **配置零度**（Jest 0 / Vitest 0 / Mocha 重）
  - **性能**（小项目 / 中型 / 大型 monorepo）
  - **生态成熟**（Vitest 后来居上）
  - **Snapshot / mock / coverage 内置度**
  - **TypeScript 类型测试支持**
- **横评对象**：
  - **Vitest 3**（unit + 部分 DOM + browser mode）
  - **Jest 30**（unit，存量项目主流）
  - **Mocha 11**（unit，灵活但需自配）
  - **Bun test**（unit，Bun 用户首选）
  - **node:test**（unit 轻量，最低门槛）
  - **Playwright**（e2e + Component Testing）
  - **Cypress**（e2e，存量大但增速放缓）
  - **Testing Library**（DOM helper，配合任一 runner）
- **写作要点**：每家给一段"它的世界观"——不只是"快多少"，而是"它认为测试应该长什么样"。**给一张多维对比表 + 选型决策树**。

---

### P2 · 测试心智（2 章）

#### 2.1 测试金字塔 vs 测试奖杯

- **传统测试金字塔**（Mike Cohn 2003）：单元最多 → 集成中等 → e2e 最少。强调"快 + 稳定 + 隔离"
- **Kent C. Dodds 测试奖杯**（2018）：Static（TypeScript / ESLint）→ Unit → Integration（最大的肚子）→ E2E（少而关键）
  - **核心论点**：单元测试容易写但价值低；集成测试是性价比最高的层
  - 静态层（TypeScript / lint）作为新一层
- **2026 实测分布参考**：
  - 单元测试 30%（Vitest + Testing Library 写组件 / utility）
  - 集成测试 50%（多组件 + MSW mock + 不真实浏览器）
  - E2E 15%（Playwright + 真浏览器，覆盖关键用户路径）
  - 视觉 5%（Chromatic / Percy 跑 Storybook）
- **测试金字塔 vs 测试梯形**：测试梯形是"e2e 太多 unit 太少"的反模式；常出现在团队"Cypress everything"时
- **2026 趋势**：组件测试（Vitest browser mode + Playwright Component Testing）模糊单元/集成/e2e 边界
- **写作要点**：让读者能为自己项目"定下每层占多少"；**给金字塔 vs 奖杯对比 SVG**。

#### 2.2 "测行为不测实现"——Testing Library 哲学

- **Kent C. Dodds 2016 原文**：Testing Implementation Details；这是 Testing Library 的基础哲学
- **核心原则**：
  - 测<strong>用户能看到 / 操作的</strong>（accessible name / role / 输入文字 / 点按钮）
  - 不测<strong>实现细节</strong>（私有 state、内部函数、组件树结构、CSS class 名）
  - 测试应该<strong>反映用户体验</strong>，重构组件内部不该破坏测试
- **enzyme 为什么死了**：
  - shallow rendering 让"测内部"变得太容易
  - React 18 改变内部结构，enzyme 适配跟不上
  - 维护者疲倦，2022 年正式停止
- **implementation detail trap**：典型反模式列表
  - 测组件 setState 调用次数
  - 测某个 useEffect 跑了几次
  - 用 component.find('.btn-primary') 而非 byRole('button')
  - 用 instance().myMethod() 直接调内部
- **正确写法 vs 错误写法**：5-10 个对比例子（重点）
- **测试代价**：
  - "测得太死"——重构破坏；
  - "测得太松"——bug 漏过
  - 平衡点：测<strong>对外契约</strong>不测<strong>内部实现</strong>
- **写作要点**：这章是<strong>测试质量</strong>的根基。不理解这章，后面所有 Vitest / Testing Library 知识都是表面。给 8-10 段对比代码。

---

### P3 · Vitest + 单元测试（2 章）

#### 3.1 Vitest 内部

- **Vitest 与 Vite 的关系**：Vitest 复用 Vite dev server 的所有能力——ESM 模块图、HMR、plugin、resolve。详见 <a href="../vite/02-vite-architecture/01-dev-mode.html">Vite P2.1</a>
- **核心架构**：
  - 主进程跑 Vite dev server（编译）
  - Worker 进程跑测试用例（隔离）
  - 通信走 Tinypool（基于 piscina，进程池）
- **API 兼容 Jest**：describe / test / expect / vi.mock / vi.fn —— 几乎可直接迁移
- **关键差异**：
  - 原生 ESM 不需要 babel 转换
  - 配置在 vite.config.ts 一处
  - HMR 模式 watch（改一个文件只重跑相关测试）
- **workspace 模式**（详见 <a href="../pnpm-monorepo/04-workspaces/02-filter-topological.html">pnpm P4.2</a>）：
  - vitest.workspace.ts 配多 project（每个 workspace 子包独立 config）
  - 配合 pnpm filter / Turborepo cache（详见 <a href="../pnpm-monorepo/05-orchestration/01-turborepo.html">pnpm P5.1</a>）
- **browser mode**（Vitest 2.0+）：
  - 在真实浏览器跑（Chromium / Firefox / WebKit via Playwright）
  - 兼容 jsdom API
  - 适合需要真实 DOM 行为的组件测试
- **类型测试**：
  - <code>expect-type</code> 静态验证类型
  - <code>assertType()</code> + <code>expectTypeOf()</code> 在测试中混用类型断言
- **覆盖率**：v8 provider（默认）vs istanbul provider；详见 P7
- **写作要点**：把 Vitest 在 monorepo / TypeScript / browser mode 各场景的实战配置讲清楚。

#### 3.2 Vitest vs Jest vs Bun test vs node:test 横评

- **Jest 30 现状**：
  - OpenJS 接管后维护活跃但创新放缓
  - ESM 仍需 <code>--experimental-vm-modules</code>（性能折损）
  - 大型 React/Next.js 项目存量主力
  - Babel 依赖让 build 慢
- **Bun test**（详见 <a href="../bun/04-toolchain/04-bun-test.html">Bun P4.4</a>）：
  - Jest 兼容 API + Bun 速度
  - watch 模式优秀
  - 但需要项目 Bun 化才发挥
- **node:test**（详见 <a href="../node/06-modern/01-modern-node.html">Node P6.1</a>）：
  - 内置不需装；轻量
  - 但缺 mock / snapshot 等高阶特性
  - 适合 lib 项目"不引依赖"测试
- **横评决策矩阵**：
  - 新项目 + Vite 栈 → Vitest
  - 老项目 + 已用 Jest → 留 Jest 或渐进 Vitest
  - 已用 Bun runtime → Bun test
  - 微型 lib + 不引依赖 → node:test
  - Storybook 集成 → Vitest（Storybook 7+ 默认）
- **真实迁移案例**：
  - Astro 从 Jest → Vitest（性能 5x）
  - Vite 自身用 Vitest
  - Vue 全家桶用 Vitest
  - Next.js 推荐 Jest（出于历史 + 团队偏好）
- **写作要点**：**给一张 4 家全维度对比表 + 决策树**；不当任一家广告。

---

### P4 · DOM 测试（2 章）

#### 4.1 Testing Library 设计哲学

- **跨框架统一 API**：@testing-library/react / vue / svelte / preact 共享 @testing-library/dom 内核
- **核心 query 哲学**：按"<strong>用户看到的方式</strong>"找元素：
  - 优先级 1: <code>getByRole</code> / <code>getByLabelText</code>（可访问性优先）
  - 优先级 2: <code>getByText</code> / <code>getByPlaceholderText</code>（用户能看到的文字）
  - 优先级 3: <code>getByTestId</code>（最后退路）
  - 不推荐: <code>getByClassName</code> / <code>container.querySelector</code>（实现细节）
- **userEvent vs fireEvent**：
  - fireEvent 直接触发 DOM 事件（底层）
  - userEvent 模拟<strong>真实用户操作</strong>（点击触发 mouseover→mousedown→mouseup→click 完整链）
  - 始终优先 userEvent
- **async query**：
  - <code>findByRole</code>（异步等待出现）
  - <code>waitFor</code>（轮询自定义条件）
  - 何时用 await 何时不用
- **常见 anti-pattern**：
  - 等异步用 <code>setTimeout</code> 而不是 <code>findBy</code>
  - 用 <code>data-testid</code> 而不是 accessibility query
  - 测组件 props 传递而不是渲染结果
- **配合 jest-dom matcher**：
  - <code>toBeInTheDocument()</code> / <code>toHaveTextContent()</code> / <code>toBeDisabled()</code> 等
  - Vitest 装 <code>@testing-library/jest-dom</code> + <code>vi.expect.extend</code>
- **写作要点**：给 8-12 段"对比写法"代码——每段展示"反模式 vs 正确"。

#### 4.2 jsdom vs happy-dom vs Vitest browser mode

- **jsdom**（2010+）：
  - 完整模拟 DOM Level 4 + HTML5 spec
  - 纯 JS 实现，跑在 Node 进程内
  - 慢（启动 + 解析）但兼容性最好
  - 不支持：CSS layout、transition、SVG 渲染、Canvas、WebGL
- **happy-dom**（2020+）：
  - 性能比 jsdom 快 3-5x
  - API 兼容 jsdom 大部分
  - 但 spec 覆盖不全（一些边界 case 行为不一致）
  - Vitest 默认推荐
- **Vitest browser mode**（2024 GA）：
  - 真浏览器（Chromium / Firefox / WebKit）via Playwright
  - 真 layout / 真事件 / 真 CSS
  - 慢于 jsdom 但快于完整 e2e
  - 适合：CSS 测试、Canvas、组件库
- **选哪个**：
  - 业务组件大部分 → happy-dom（够用 + 快）
  - 测 layout / 视觉 → browser mode
  - 复杂 DOM API + 边界 case → jsdom（spec 严格）
  - **2026 实测分布**：happy-dom 60% / jsdom 25% / browser mode 15%
- **配置切换**：vitest.config.ts 中 <code>environment: 'happy-dom'</code> / <code>'jsdom'</code> / <code>'browser'</code>
- **跨环境写法**：测试代码不感知 environment（Testing Library 自动适配）
- **写作要点**：给 3 个真实测试 case 在三个 environment 下的差异演示。

---

### P5 · 网络 mock（1 章）

#### 5.1 MSW · Service Worker + Node 双模

- **MSW 设计原则**：在<strong>网络层</strong>拦截，而不是在<strong>应用代码层</strong>替换 fetch
  - 优点：测试代码与生产代码完全一致；切换 dev / test / prod 只换 server.start() / handlers
  - 缺点：需要 Service Worker（浏览器）/ undici interceptor（Node）双重配置
- **三模实现**：
  - **浏览器**：Service Worker 拦截 fetch / XHR
  - **Node**：基于 undici / msw/node 拦截 global fetch
  - **WebSocket**（MSW 2.0+）：拦截 WebSocket connection
- **handlers 写法**：
  - <code>http.get('/api/users', () => HttpResponse.json(...))</code>
  - 支持 path params / query params / body 解析
  - 支持 dynamic response（按 input 返回不同 mock）
- **server / worker 启动**：
  - 测试：<code>server.listen()</code> + <code>server.resetHandlers()</code> + <code>server.close()</code>
  - dev：worker.start() 在浏览器入口注入
  - 生产：不启用
- **vs 替代方案**：
  - <code>nock</code>（Node only，旧）→ MSW 接管市场份额
  - <code>fetch-mock</code>（替换 global fetch）→ 应用代码感知，不推荐
  - 手写 vi.mock('axios')：仅简单场景；多 endpoint 时累
- **常见陷阱**：
  - Service Worker 的 cache 干扰（dev 模式重启 SW）
  - Node 模式：global fetch polyfill 错（Node 18+ 不需要 node-fetch）
  - handlers 顺序问题（first match wins）
- **写作要点**：给一份"<strong>一份 handlers 服务 dev + test + storybook</strong>"完整工程化实践。

---

### P6 · E2E 测试（2 章）

#### 6.1 Playwright 内部

- **背景**：Playwright 是 Andrey Lushnikov 等 Puppeteer 团队从 Google 跳 Microsoft 后做的"二代品"。设计目标：跨浏览器 + 不依赖 CDP（Chrome 专属协议）
- **协议层**：
  - **CDP**（Chrome DevTools Protocol）—— Chrome / Edge
  - **WebDriver BiDi**（W3C 标准）—— Firefox / 标准化路径
  - **WebKit Inspector Protocol** —— Safari / WebKit
  - Playwright 在三种协议上做统一抽象层
- **核心机制**：
  - **auto-wait**：每个动作（click / fill）自动等待元素稳定（visible / enabled / not animating）
  - **fixtures**：测试隔离 + 资源共享；每个 worker 独立 browser context
  - **trace viewer**：录制每个 action 的 DOM snapshot + console + network；失败时回放
  - **parallel**：进程级并行（默认 = CPU 核数）；多 worker 共享 worker pool
  - **retries**：CI 默认开 2 次重试；区分 flaky vs 真失败
- **关键 API**：
  - <code>page.locator()</code>（替代 selector，懒求值 + auto-retry）
  - <code>page.getByRole()</code> / <code>getByLabel()</code>（与 Testing Library 一致）
  - <code>expect(locator).toBeVisible()</code> 等 awaitable expects
- **Component Testing**（Playwright 1.30+）：
  - 单测 React / Vue / Svelte 组件在真浏览器
  - 与 Vitest browser mode 重叠（两者并存）
- **trace viewer 实战**：
  - <code>--trace=on-first-retry</code>（CI 推荐）
  - trace 文件可分享（拖到 trace.playwright.dev 网页查看）
  - 包含每帧截图 / DOM / network / console
- **写作要点**：把"<strong>为什么 Playwright 比 Cypress 不那么 flaky</strong>"讲清楚（auto-wait 机制 + 真异步 vs Cypress promise chain）。

#### 6.2 Playwright vs Cypress 横评

- **Cypress 设计**：
  - 单浏览器（chromium-based + Firefox 实验）
  - 跑在浏览器里（不是控制浏览器）—— 这是它"快"的原因也是限制（跨域受限）
  - Promise chain DSL（<code>cy.visit().get().click()</code>）
  - 极佳的开发者体验（GUI runner + time travel）
- **Playwright 设计**：
  - 多浏览器（Chromium + Firefox + WebKit + 移动端模拟）
  - 跑在外部进程（控制浏览器，不在浏览器内）
  - 标准 async/await
  - UI mode（2024+）追平 Cypress 的开发者体验
- **核心差异**：
  - **跨域**：Cypress 受限（要 origin 切换）；Playwright 任意
  - **多 tab / window**：Cypress 不支持；Playwright 原生
  - **iframes**：Cypress 难处理；Playwright frame locator
  - **网络拦截**：Cypress <code>cy.intercept()</code> 简单；Playwright <code>page.route()</code> 强大
  - **并行**：Cypress Cloud 付费；Playwright 内置免费
- **2026 现状**：
  - 新项目 70-80% 选 Playwright
  - 存量 Cypress 项目继续维护（迁移成本高）
  - Cypress 团队 2024 年动荡 + 商业化压力 → 增长停滞
- **何时仍选 Cypress**：
  - 已有大量 Cypress 测试 + 团队熟悉
  - 单一 Chrome 场景 + 强调 GUI 调试
- **何时选 Playwright**：
  - 跨浏览器需求（特别是 Safari）
  - 多 tab / 跨域 / 复杂场景
  - 全面新项目
- **写作要点**：**横评决策矩阵 + 真实迁移案例**（如 Vercel 从 Cypress 迁 Playwright）。

---

### P7 · 视觉、覆盖率、CI（1 章）

#### 7.1 视觉回归 + Coverage 真相 + CI 集成

- **视觉回归技术**：
  - 截图对比（pixel diff）：Playwright snapshot / Percy / Chromatic
  - 像素差分阈值：完全相等不现实（fonts / antialiasing 差异）；用 percentage threshold + 像素 ignore region
  - **Chromatic**：基于 Storybook，CI 自动跑视觉回归 + 团队 review
  - **Percy**：跨平台视觉回归 + 浏览器矩阵
  - **Playwright snapshot**：内置 + 免费 + 但缺集成 review 工具
- **覆盖率真相**：
  - **Istanbul**：成熟 + 灵活 + 慢；通过 babel transform 注入计数
  - **V8 coverage**：Node 内置（v8 自带）；Vitest 默认；快但精度略差
  - **覆盖率 ≠ 质量**：100% 行覆盖不代表 0 bug；可以测垃圾代码
  - **branch coverage / function coverage / statement coverage 区别**
- **CI 集成**：
  - **Vitest** + GitHub Actions（cache .vitest）
  - **Playwright** + GitHub Actions：浏览器装在 docker；trace 上传 artifact
  - 与 Turborepo cache 配合（详见 <a href="../pnpm-monorepo/05-orchestration/01-turborepo.html">pnpm P5.1</a>）
- **flaky 治理**：
  - Playwright <code>--retries</code> 区分 flaky vs 真失败
  - flaky test 仪表盘（GitHub Actions test reporter / Playwright report）
  - 每周 review flaky list；超过阈值删
  - 根因常见：竞态、network mock 时序、CSS animation 未关
- **决策树**（收束本主题）：
  - 单元测试：**Vitest + Testing Library + happy-dom**（默认）
  - 集成：**Vitest + MSW + happy-dom**
  - E2E：**Playwright**
  - 视觉：**Chromatic**（OSS）/ **Playwright snapshot**（自建）
  - 覆盖率：**Vitest v8 provider**
- **5 年展望**：
  - Vitest 取代 Jest 大多数新项目
  - Playwright 取代 Cypress
  - Component Testing 模糊单元/集成边界
  - AI 辅助测试生成（Anthropic Computer Use / Playwright AI test gen 等）
- **写作要点**：本章是<strong>实战决策章</strong>；给一份完整的 GitHub Actions 配置示例（Vitest + Playwright + Chromatic 一条龙）。

---

## 写作风格 ——「写文章人，不是建筑师」

> （遵循用户已有约定）

- **章节内部**：6 段模板（速览 → 底层逻辑 → 应用场景 → 典型代码 → 常见陷阱 → 延伸阅读）
- **跨章引用**：用"短重述 + 链回"，不抄不省
- **图示**：测试金字塔 / 测试奖杯 SVG；架构图用 SVG；具体实现用代码块
- **代码示例**：每章 5-10 段可运行的测试 case
- **加粗（新规则）**：每章 ≤ 25 个 `<strong>`；每段不超过 1-2 个；不要散点高亮"我觉得重要"的描述句
- **避免**：
  - "架构师式"分类标签（X 派 / Y 流）
  - 中立到没观点（每章必须给"我推荐 X，因为 Y"）
  - PPT 抄页式（PPT 只是灵感，知识从 vitest.dev / Kent blog / 作者文章来）
- **观点强度**：
  - 强观点（"测行为不测实现是底线"）
  - 弱观点（"happy-dom vs jsdom 看项目"）
  - 不观点（"Cypress 没有错，老项目继续用"）

---

## 不写的内容（明确划线）

- **不讲**：
  - 完整 Vitest API 参考（这不是配方书，链回官方 docs）
  - Cypress 全教程（已被 Playwright 主流取代，本主题侧重对比 + 选型）
  - 测试金字塔的所有变体（金字塔 + 奖杯就够）
  - 性能 benchmark 测试（独立主题，不在本范围）
- **链回但不重复**：
  - Vite dev server / plugin（链回 vite 主题）
  - Bun test（链回 bun 主题）
  - node:test（链回 node 主题）
  - workspace + filter（链回 pnpm-monorepo 主题）
- **暂占位（待写主题）**：
  - React Server Components 测试 → 待 Next.js 主题
  - HTTP/3 / QUIC 测试 → 待网络主题

---

## 路线图

- **Step 1**：本 outline.md 经用户审定 ← **当前**
- **Step 2**：建 8 个文件骨架（`testing/index.html` + 7 个 phase 目录的 `index.html`）
- **Step 3**：P1 章节正文（项目史 + 同代人横评，2 章）
- **Step 4**：P2 章节正文（金字塔 + 测行为不测实现，2 章）
- **Step 5**：P3 章节正文（Vitest 内部 + 横评，2 章）
- **Step 6**：P4 章节正文（Testing Library + jsdom/happy-dom/browser，2 章）
- **Step 7**：P5 章节正文（MSW + 网络 mock，1 章）
- **Step 8**：P6 章节正文（Playwright + Cypress 横评，2 章）
- **Step 9**：P7 章节正文（视觉 + 覆盖率 + CI 决策树，1 章）+ 站点首页卡片改 done
