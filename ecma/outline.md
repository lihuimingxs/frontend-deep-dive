# ECMAScript 深度学习 · 章节大纲

> 本文件是 ECMA 主题的写作蓝本。**7 阶段 · 16 章**：先用 P1-P2 讲清"为什么 JS 长这样"（历史与设计），再用 P3-P7 训练"读 800 页规范"的元能力。
> 编写日期：2026-04-27（首版，两轨结构）｜重构日期：2026-04-28（重组为 7 阶段 13 章）｜扩充日期：2026-04-28（补 P6.2 元编程谱 + P7.5 多线程 + 节级补充，共 16 章）｜目标版本：ECMA-262 第 16 版（ES2025）

---

## 元信息

- **目标编辑**：ECMA-262 16th edition (ES2025, 2025-06)，向下覆盖 ES1 (1997) 至今全部 16 版。**ES4 (2003-2008) 单独讲为重大失败案例**。
- **来源**：
  - [262.ecma-international.org/15.0](https://262.ecma-international.org/15.0/)（ES2024 即时锚点版，最新稳定 HTML）
  - [ecma-international.org publications](https://ecma-international.org/publications-and-standards/standards/ecma-262/)（所有版本归档）
  - [tc39/proposals](https://github.com/tc39/proposals)（Stage 0-4 现状）
  - 用户内部 PPT《ECMAScript 调研分享》（叙事脊柱原型，仅作灵感来源）
- **目标读者**：已学过 `javascript/` 和 `typescript/` 主题，想理解"语言为什么长这样、规范怎么读、机制怎么落到字节码"的研发工程师。

---

## 整体设计：7 阶段 · 依赖顺序组织

仿 `javascript/` 主题的"分阶段学习"模板，章节按依赖顺序铺开，建议顺序读；熟悉历史的工程师可直接跳到 P3（怎么读规范）或 P7（执行模型）。

| 阶段 | 章数 | 核心问题 |
|---|---|---|
| **P1 · 标准与演化** | 3 | ECMAScript 30 年怎么走过来、现在该用什么版本、提案怎么进标准 |
| **P2 · 设计原则与灵感** | 2 | JS 的"基因"——三大灵感、原型对象、类型/作用域/错误/迭代协议怎么设计的 |
| **P3 · 怎么读规范** | 1 | 把 800 页规范读懂的元能力：算法记法、`?`/`!` 简写、Annex B、Host hooks |
| **P4 · §6 数据类型与值** | 1 | Reference Record / Completion Record / Property Descriptor 等规范内部类型 |
| **P5 · §7 抽象操作** | 1 | ToPrimitive / ToObject / SameValueZero / 抽象相等等核心算法族 |
| **P6 · §10 内部槽与元编程** | 2 | 11 个 essential internal methods、Ordinary vs Exotic、Proxy 实现 + Reflect API + Membrane + WeakRef |
| **P7 · §9 执行模型与并发** | 5 | Realm / Agent / Job / Execution Context / Event Loop / 异步演进 / 模块求值 / **§24 Memory Model + 多线程** |

总计 **16 章 ≈ 80,000 字**，平均每章 5,000 字。

---

## 与既有主题的边界 ——「短重述 + 链回」原则

**关键约定**：当一个机制 / 概念在 `javascript/` 或 `typescript/` 已经讲透时，本主题章节里**不能直接略过**，而是：

> ✅ **短重述**：用 1-3 句话点出"它是什么 + 关键性质"，让读者不被打断
> ✅ **链回**：紧跟一句"详细的 X / Y / Z 请参考 [`javascript/{phase}/{chapter}`]"
> ❌ **不要**写"详见 X"就完事——读者还没理解就被甩到另一个主题
> ❌ **不要**完整抄一遍——那就违背了"轻量"

举例（在 P7.3 讲 Promise 时）：

> Promise 是一个状态机，状态从 `pending` 不可逆地迁移到 `fulfilled` 或 `rejected`。一旦 settled，状态永不再变。
>
> Promise 的运行时调度（HostEnqueuePromiseJob、microtask queue）和 then 链的传值规则在 [`javascript/03-async/02-promise.html`](../javascript/03-async/02-promise.html) 已详细展开，本章只在"规范如何描述这个状态机"层面继续。

这条约定适用于所有跨主题引用（包括将来 React → TS、TS → JS 等）。

---

## 内容覆盖原则 ——「PPT 是叙事，规范是知识」

**用户原话**："PPT 只参考讲解思路，说明了历史和核心特性，并没有太全面的知识点……我们要系统的学习，不能只看这些。"

落地为 3 条规则：

- **P1-P2 用 PPT 的叙事脊柱**（为什么存在 → 它是什么 → 机器怎么跑 → 单线程怎么并发），但每章的内容**按权威来源系统化补全**，不局限于 PPT 涉及的点。
- **P1-P2 权威来源**：ECMA-262 §4 历史段、TC39 meeting notes、proposals 仓库、Eich 个人 blog、HTML 规范的 Event Loop / Job 部分。
- **P3-P7 权威来源**：ECMA-262 16th edition (ES2025) 全文，按 clause 顺序系统化覆盖核心章节，不挑内容只挑深度。

这意味着：**P2 设计原则**会讲 PPT 没提的"错误处理设计、迭代协议设计、模块系统设计"；**P7.3 异步演进**会讲 PPT 没提的"async iterator、AbortController、async 错误传播"；**P3-P7** 完整覆盖 §5-§10，而不是仅 PPT 涉及的部分。

---

## 节奏建议

- **连读组**：
  - P1.1 + P1.2 + P1.3（标准 30 年 → 现代版本 → 提案旅程，是一条完整故事弧）
  - P2.1 + P2.2（设计基因要一口气讲完）
  - P4 + P5（数据类型 → 抽象操作，是规范阅读的"线性入门"）
  - P7.1 + P7.2（容器 → 执行上下文，规范的"机器视角"双子章）
- **可独立跳读**：
  - P1.2 现代版本可以单独看，作为新人入职 onboarding
  - P1.3 提案旅程是独立 case study
  - P3 怎么读规范是元能力章，独立性强
- **建议阅读路径**：
  - 产品工程师：P1 全读 + P2 全读（够用了）
  - 框架/底层工程师：P1-P2 全读 → P3 → P7 全读
  - TC39 兴趣 / 规范贡献者：P1.1 → P3 → P4-P6 → P7

---

## 文件结构重组方案

旧结构（两轨）：

```
ecma/
  01-history/                       (Track A · 5 章)
    01-standards-history.html
    02-design-principles.html
    03-execution-model.html
    04-async-evolution.html
    05-modern-ecosystem.html
  02-spec/                          (Track B · 6 章)
    01-how-to-read.html
    02-data-types.html
    03-abstract-operations.html
    04-internal-slots.html
    05-execution-context.html
    06-proposal-journey.html
```

新结构（7 阶段）：

```
ecma/
  01-standards/                     (P1 · 标准与演化 · 3 章)
    01-history.html                  ← 原 01-history/01-standards-history.html
    02-modern-ecosystem.html         ← 原 01-history/05-modern-ecosystem.html
    03-proposal-journey.html         ← 原 02-spec/06-proposal-journey.html
  02-design/                        (P2 · 设计原则与灵感 · 2 章)
    01-three-inspirations.html       ← 拆自 01-history/02-design-principles.html 上半
    02-design-tradeoffs.html         ← 拆自 01-history/02-design-principles.html 下半
  03-spec-reading/                  (P3 · 怎么读规范 · 1 章)
    01-how-to-read.html              ← 原 02-spec/01-how-to-read.html
  04-data-types/                    (P4 · §6 数据类型 · 1 章)
    01-data-types.html               ← 原 02-spec/02-data-types.html
  05-abstract-ops/                  (P5 · §7 抽象操作 · 1 章)
    01-abstract-operations.html      ← 原 02-spec/03-abstract-operations.html
  06-internal-slots/                (P6 · §10 内部槽与元编程 · 2 章)
    01-internal-slots.html           ← 原 02-spec/04-internal-slots.html
    02-reflect-meta.html             ← 新建（Wave 2）：Reflect API + Membrane + WeakRef + FinalizationRegistry
  07-execution/                     (P7 · §9 执行模型与并发 · 5 章)
    01-execution-model.html          ← 原 A3 · 执行模型基础（容器/上下文叙事）+ ShadowRealm 节 + Generator 状态机扩
    02-spec-execution-context.html   ← 原 B5 · §9 规范精读（与 01 互补：narrative + spec）
    03-event-loop-async.html         ← 原 A4 · Event Loop 与异步演进
    04-modules-tla.html              ← 新建合成：A4 TLA 段 + B5 §9.10 Module Records
    05-memory-model.html             ← 新建（Wave 1）：§24 Memory Model + Atomics + SAB + Spectre + COOP/COEP
```

**P7 三合一**是 2026-04-28 重组的最大动作：原 Track A 的"机器怎么跑 / 单线程怎么并发"（叙事性）和 Track B §9（规范精读）讲的是同一组对象（Realm/Agent/Job），合并后按"对象族"拆 4 章，每章先叙事后规范，避免读者在两处看到同一概念。

**扩充补充**（2026-04-28 同日）：
- **P6 加 1 章**（02-reflect-meta）：原 P6 只讲了 Proxy 怎么"替换" internal methods，没讲 Reflect 这个"对应物"——元编程其实是一对设计，缺一半。
- **P7 加 1 章**（05-memory-model）：填补 §24 Memory Model 与多线程内存模型的最大空白；目前 SharedArrayBuffer / Atomics 在 P7.1 / P7.3 各一段带过，没系统讲。
- **P7.1 内部扩 2 节**：ShadowRealm 提案（Stage 3 沙箱新机制）+ Generator 状态机深入（含状态转移图 + async/await desugar）。
- **P2.2 加 1 节**：跨 Realm 工程模式（Membrane / cross-realm 兼容代码）。
- **P3.1 加 1 段**：ECMA 关联标准家族（ECMA-402 / 404 / 419）。

---

# P1 · 标准与演化（3 章）

> 这一阶段回答"ECMAScript 怎么走到今天的"。三章一条故事弧：发展史（已发生）→ 现代版本（现在该选什么）→ 提案旅程（未来怎么进来）。

## P1.1 · 标准发展史

- **定位**：讲清楚 ECMAScript 这个标准如何从"10 天写出的脚本"演化为今天 16 版的"通用编程语言标准"。
- **关键知识点**：
  - **史前史（1995）**：Brendan Eich 在 Netscape 10 天写出 Mocha → LiveScript → 改名 JavaScript（蹭 Java 营销热度）
  - **第一阶段 · 1995-2004 · 标准化与僵局**：
    - 1996：MS 推出 JScript（避开 Sun 商标）→ 浏览器分裂
    - 1996-11：Netscape 把 JS 提交 Ecma；TC39 成立
    - 1997-06：**ES1 第 1 版**（92 页，"基线"）
    - 1998-08：ES2 第 2 版（仅文字校对）
    - 1999-12：ES3 第 3 版（正则、try/catch、do-while）—— **此后僵局 10 年**
    - 2003-2008：**ES4 大爆炸**（class、模块、强类型、namespace）→ 厂商分裂、Microsoft 反对、最终 2008 放弃 → 这是 TC39 流程改革的根因
  - **第二阶段 · 2004-2015 · JS 重生**：
    - 2004：Firefox 发布、AJAX 兴起（Gmail / Google Maps）
    - 2008：**Chrome + V8 发布 → JS 性能 10-100×**
    - 2009-12：**ES5 第 5 版**（strict mode、JSON、Object.create、属性描述符）—— 救场之作
    - 2010：HTML5 起势；Jobs《Thoughts on Flash》—— Apple + Google 联手围攻 Flash
    - 2011-06：ES5.1 ISO 同步版
  - **第三阶段 · 2015-至今 · 年度小步快跑**：
    - 2015-06：**ES2015 第 6 版**（class、let/const、模块、Promise、解构、箭头函数、Symbol、Iterator/Generator、Proxy/Reflect）—— 现代 JS 起点
    - **TC39 改革**：从"大爆炸式发布"切换为"年度发布 + Stage 流程"
    - ES2016 → ES2025 共 10 个年度版本（详见 P1.2）
    - 2024-06：ES2024 第 15 版（RegExp v flag、Promise.withResolvers、ArrayBuffer transfer）
    - 2025-06：ES2025 第 16 版（最新）
- **底层逻辑要点**：
  - **ES4 失败是 TC39 流程的"创始创伤"**：因为试图一次发布过多激进特性，导致厂商无法实现/不愿实现。教训：**任何特性必须有"≥2 个引擎独立实现 + 充分 spec test 覆盖"才能进 Stage 4**。今天的 Records & Tuples（卡 Stage 2 三年）就是这个机制的体现。
  - **"标准滞后实现"是常态**：`Promise` 在 2012 jQuery thenable 已普及 → 2015 才进规范；`async/await` 2015 TypeScript 已实现 → 2017 才进规范。规范的角色是"事后追认社区共识"，不是"事先发明特性"。
  - **JS 没有"版本号"，只有"宿主支持的 ES 子集"**：你写的 `??` 运算符在 Node 14- 跑不起来，不是因为"代码是 ES2020 的"，而是因为运行时引擎没有这个语法/runtime 表。
- **应用场景**：
  - 老项目 polyfill 决策：搞清楚 corejs 和 babel-preset-env 的工作原理需要先理解"ES2015+ 是分散的特性集合，而不是一个版本"
  - 团队定 baseline：根据用户浏览器市场份额选 ES 版本（P1.2 详述）
  - 新人 onboarding：解释"为什么 JS 这么古怪"
- **陷阱**：
  - ⚠️ **不存在"ES4"**（编辑号空缺）；提到 ES4 必标"abandoned"
  - ⚠️ ES2015 ≠ ES6 是同一个东西（年份命名取代序号命名是 TC39 改革的一部分）
  - 把 "JavaScript" 和 "ECMAScript" 当同义词（前者是商标 + 实现 + DOM，后者只是核心语言规范）
- **关联章节**：P2.1（设计原则继承自 ES1）、P1.2（年度版本细节）、P1.3（提案怎么进来）、P3（规范怎么读）
- **预估字数**：5500-6500（含完整版本表）

## P1.2 · 现代生态与目标版本策略

- **定位**：实战章。把 P1.1 的"年度版本表"翻译成"团队怎么定 baseline、打包器怎么配、polyfill 怎么选"。
- **关键知识点**：
  - **ES2016-ES2025 全特性表**（按版本，每版核心特性）
  - **打包器目标版本策略**：
    - **客户端保守**：ES2020 baseline（可选链、空值合并、动态 import 已 99.9% 普及，面向公众 Web 应用）
    - **客户端激进 / Electron**：ES2024 — bundle 更小，用户环境可控，top-level await 可用
    - **服务端**：直接用 ES-Next 最新版（Node 22 LTS、Bun 全部支持，无需降级）
  - **runtime feature detection**：caniuse、kangax compat-table、MDN BCD
  - **polyfill vs transpile**：
    - Babel / SWC 降语法（target 控制）
    - core-js / regenerator-runtime 补 runtime API
    - 区别：`?.` 是语法（必须 transpile）；`Array.prototype.at` 是 API（必须 polyfill）
- **底层逻辑要点**：
  - **"目标版本"决策不是技术问题，是产品问题**：取决于用户群分布。To B SaaS 可以 ES2024；toC 大众产品保守 ES2020。
  - **Babel 的 `preset-env` + `core-js: 3` 是"按 browserslist 智能 polyfill"的事实标准**：理解 `.browserslistrc` 比改 Babel 配置重要。
- **应用场景**：
  - 团队 baseline 决策：根据 Sentry / Google Analytics 的浏览器分布数据
  - 老项目升级：从 ES5 + Webpack 4 到 ES2020 + Vite 的迁移路径
  - 写新库：决定 dist 的目标 ES 版本
- **陷阱**：
  - 把 polyfill 全打进主 bundle（没用 dynamic import）
  - target 设太高导致老用户白屏（没监控 SyntaxError）
  - 用 Stage 2 提案的语法（如 pipeline）—— 可能永远不进
- **关联章节**：P1.1（版本历史）、P1.3（提案旅程）
- **预估字数**：4500-5500

## P1.3 · 提案旅程：从 Stage 0 到 §X（Case Study）

- **定位**：综合实战章。**真实追踪一个特性从 Stage 0 到 §X 写入正文的完整路径**，让读者理解"提案怎么变成标准"。
- **建议主线**：选 **Top-Level Await** 作为主 case（牵连 §9.10 + §27 + Module Records，内容丰富）+ **Records & Tuples** 作为反例（讲为什么卡 Stage 2 三年）。
- **关键知识点**：
  - **TC39 Stage 流程详解**：
    - Stage 0 Strawperson（任何想法或讨论）
    - Stage 1 Proposal（正式提案，问题 + 方案）
    - Stage 2 Draft（首选方案，初始规范文本）
    - Stage 3 Candidate（推荐实现，充分测试）
    - Stage 4 Finished（≥2 引擎实现，纳入年度标准）
  - **提案仓库结构**：README、explainer、polyfill、test262 case
  - **Champion / Stage advancement requirements**
  - **Spec text 编写**：`<emu-clause>` HTML、ecmarkup 工具
  - **跨章节修改**：Top-Level Await 同时改了 §9.4、§9.10、§16、§27
  - **实施 timeline**：V8 → SpiderMonkey → JSC → Node 集成
  - **Stage 3 提案当前快照（写作时点）**：
    - Records & Tuples（Stage 2，深 immutable，卡 3 年争议未决）
    - Pipeline Operator `|>`（Stage 2，争议大）
    - Decorator metadata（Stage 3，5.x 落地路径）
    - Iterator Helpers（Stage 4 ES2025，已落地）
    - Temporal（Stage 3，Date 替代品，浏览器 polyfill 中）
- **底层逻辑要点**：
  - **Stage 3 不等于"可以用"**：Stage 3 才能用 polyfill 实验，但浏览器原生还没；Stage 4 才能假设原生有。
  - **规范修改是跨 clause 的**：一个特性常常牵动 §9（执行）、§16（脚本/模块）、§27（控制抽象）多个 clause——读 spec diff 比读 explainer 更接近真相。
- **应用场景**：
  - 想给 TC39 提 PR 的工程师入门
  - 团队评估"要不要用 Stage 3 特性"时的决策框架
  - 解释"为什么这个 polyfill 这样写"
- **陷阱**：
  - 以为 Stage 4 = 所有引擎已实现（其实是"≥2 个引擎"）
  - 以为 polyfill 能 100% 还原原生行为（Top-Level Await 等无法 polyfill）
- **关联章节**：P1.1、P1.2、P3、P7.4（TLA 落地的规范层细节）
- **预估字数**：5500-6500

---

# P2 · 设计原则与灵感（2 章）

> 这一阶段回答"JS 的基因是什么"。讲三大灵感来源、原型对象模型、动态弱类型、词法作用域、错误处理、迭代协议、模块系统等"从 ES1 到 ES2025 的核心设计决策"。
> **与 `javascript/` 主题大量交叉**——本阶段对每个机制做 1-3 句话短重述 + 链回，正文聚焦"为什么这样设计、当时有哪些选项、TC39 怎么选的"。

## P2.1 · 三大灵感与原型对象模型

- **定位**：讲清楚 JS 的"基因图谱"——三大灵感来源是怎么塑造语言的，原型对象模型为什么是 JS 的核心。
- **关键知识点**：
  - **三大灵感来源**（Eich 自述）：
    - **Self**：原型继承、对象 = 属性包（不是 class）
    - **Scheme**：一等函数（函数是值）、闭包、词法作用域
    - **Java**：C 风格语法外衣（蹭营销）、`new` 关键字、`null`、抛错语义
  - **原型对象模型**：
    - `[[Prototype]]` 内部槽（`__proto__` 是访问器糖）
    - 属性查找算法 OrdinaryGet（沿原型链委托）
    - Shadowing 规则
    - `prototype` 属性 vs `[[Prototype]]` 内部槽（每个函数都有 `prototype`，每个对象都有 `[[Prototype]]`）
    - 函数即对象 + 函数的双重身份（`function f()` 同时是值和构造器）
- **底层逻辑要点**：
  - **JS 不是"类的 Java"，是"原型的 Self"**——理解这一点能解释 90% 的"奇怪"行为：为什么 `[].constructor === Array` 而不是某个 class metadata；为什么 `instanceof` 检查的是原型链而不是名义类型；为什么修改 `Array.prototype` 会影响所有数组（monkey patch）
  - **ECMA-262 §4.3 自述**："originally designed to be used as a scripting language"——这句话解释了所有"宽容到出奇"的设计：自动分号插入、`==` 抽象相等、隐式转 string、对象自动装箱
- **应用场景**：
  - 给 Java/C# 工程师讲 JS：从"原型 vs 类"切入最有效
  - 调试 `Object.getPrototypeOf` 链：理解 OrdinaryGet 的递归
  - 老代码读懂"IIFE 模块模式"为什么这么写
- **陷阱**：
  - 把 `prototype` 和 `[[Prototype]]` 混为一谈
  - 以为 `class` 是新引入的东西（其实是原型链 + 构造器的语法糖）
- **关联章节**：
  - JS 已有：`javascript/02-advanced/05-prototype`、`javascript/02-advanced/06-class`
  - 内部：P2.2（其他设计决策）、P4（规范层 ToObject / Property Descriptor）、P6（OrdinaryGet 内部方法）
- **预估字数**：3500-4000

## P2.2 · 类型 / 作用域 / 错误 / 迭代 / 模块的设计权衡

- **定位**：从 ES1 到 ES2025 的"设计决策清单"——为什么类型系统是动态弱类型、为什么用词法作用域、为什么 try/catch 直到 ES3 才进、为什么迭代协议在 ES2015 才统一。
- **关键知识点**：
  - **类型系统**：
    - 8 个原始类型 + 引用类型
    - 装箱/拆箱（ToPrimitive / ToObject 的桥接）
    - 弱类型 = 任何类型转换都不报错（`+` 多义、`==` 抽象相等）
    - 动态类型 = 类型在运行时绑定到值，不绑定到变量
  - **作用域与闭包**：
    - 词法作用域（Lexical Scope）vs 动态作用域
    - 闭包形成的本质：函数对象记住了创建时的 `[[Environment]]`
    - **let/const 把"先声明后使用"从最佳实践变成语言强制约束**
    - TDZ 是怎么从规范层落到引擎实现的
  - **表达式优先**：JS 的 statement 极少，绝大部分构造都是 expression（如 IIFE、三元、逗号）
  - **错误处理设计**：try/catch/finally 是 ES3 才加的（早期只有"出错就停"）；Error 类型层级；`throw` 任意值的容忍设计；ES2018 的 `try (error)` 可省略 binding；ES2022 的 Error.cause
  - **迭代协议设计**：`Symbol.iterator`、`@@iterator`、Iterator vs Iterable、ES2015 引入迭代协议是为了统一 `for...of` / spread / 解构 / `Map` 构造等多个特性的"取下一个"
  - **模块系统设计**：ES2015 ESM 的"静态结构"决策 vs CommonJS 的"运行时函数"——为什么 ESM 必须 top-level、为什么不能条件 import（除 dynamic import）、ES2022 Top-Level Await 的妥协
  - **Symbol 与扩展点设计**：ES2015 引入 Symbol 不只是"unique key"，更是为了让语言提供"可扩展协议钩子"（`@@toPrimitive`、`@@hasInstance`、`@@iterator`、`@@asyncIterator` 等 well-known symbols）
- **底层逻辑要点**：
  - **`let/const` 的 TDZ 是规范层主动加的"安全网"**：底层是 lexical environment 在 `let x` 上把 binding 标记为 uninitialized，访问时检查 → 这不是 V8 的实现技巧，而是规范要求
  - **闭包不是"高级特性"，是函数 + 词法作用域的必然产物**：JS 没有"闭包功能"，闭包是规范文本写出来的副作用
  - **迭代协议是"语言级 duck typing"**：任何对象只要实现 `[Symbol.iterator]() { return { next() { ... } } }` 就能用 `for...of`——这种用 well-known symbol 做扩展点的设计，是 JS 给 TC39 留的"未来 escape hatch"
- **应用场景**：
  - 调试 `this` 丢失：理解词法作用域和动态 `this` 的差异
  - 自定义可迭代对象：实现 `[Symbol.iterator]` 让自家类型支持 `for...of`
  - 写 ESM 库：理解为什么 named export 不能被条件 import
- **陷阱**：
  - 用 `==` 比较跨类型值
  - 在 var 时代踩 hoisting 坑后以为 let/const 也 hoist（其实 hoist 但 TDZ）
  - 以为 ESM 的 import 是"运行时 require"（其实在 parse 阶段静态确定）
- **跨 Realm 工程模式**（Wave 3 新加节，~600 字）：
  - 何时需要"跨 Realm 兼容"：iframe 通信库、Web Components 内部状态、Node vm 沙箱、ShadowRealm polyfill
  - 三种检测方式对比：`instanceof`（不工作）/ `Array.isArray` 等 Realm-aware API（工作）/ 鸭子类型（最通用）
  - Membrane 模式简介 + 链回 P6.2 完整实现
  - 设计取舍：每跨 Realm 边界都加成本，但有时候是必须的
- **关联章节**：
  - JS 已有：`javascript/01-fundamentals/01-types`、`javascript/01-fundamentals/11-symbol`、`javascript/01-fundamentals/13-iterators`、`javascript/01-fundamentals/14-errors`、`javascript/02-advanced/02-closures`、`javascript/04-modules/01-esm`
  - 内部：P2.1、P5（ToPrimitive / ToObject 算法）、P6.2（Membrane 完整实现）、P7.2（执行上下文是这套设计的"机器化"）、P7.4（模块求值）
- **预估字数**：4000-5000 → 4500-5500（含 Wave 3 加节）

---

# P3 · 怎么读规范（1 章）

> 这一阶段是规范阅读的"元能力训练"——读懂规范本身的"语法"。是后续 P4-P7 的入门钥匙。

## P3.1 · 规范阅读元能力

- **定位**：规范阅读入门。读懂规范本身的"语法"。
- **关键知识点**：
  - **规范结构**：29 个 clause + 数个 Annex
  - **Normative vs Informative**：哪些段落是必须遵守的、哪些是给读者参考的
  - **Annex B 的特殊地位**：Web 兼容性遗留特性（HTML 注释 `<!-- -->`、字符串方法 like `.substr`、`__proto__` 访问器、正则 octal 转义）—— 浏览器必须实现，Node CLI 模式不必。**ECMA-262 标准内最违反"洁癖"的部分**。
  - **Editorial vs Normative**：编辑变更（不影响行为）vs 规范变更
  - **抽象操作（Abstract Operations）的命名约定**：CamelCase 是用户可见的（`Array.from`），无前缀的是规范内部（`ToObject`、`OrdinaryGet`）
  - **算法步骤记法**：
    - "1. Let _x_ be ..." → 局部变量
    - "If _x_ is ..., then ..." → 条件
    - "Assert: ..." → 不变量声明，违反是规范 bug
    - "? GetV(...)" → 简写，等价于 `let result = GetV(...); if (result is abrupt completion) return result`
    - "! GetV(...)" → 断言不会 throw
  - **Stage 流程文档**：tc39/proposals 仓库结构、proposal repo 模板
- **底层逻辑要点**：
  - **规范用"算法风格"是为了精确，但读起来像写代码**：把规范当伪代码读，比当文档读快很多。
  - **"?" 和 "!" 是规范的核心简写**：理解这两个符号能省一半阅读量。
  - **Annex B 是历史包袱的集中地**：想知道 `String.prototype.substr` 为什么"不推荐但存在"，看 Annex B.2.3。
- **应用场景**：
  - 读 V8 / SpiderMonkey 的 GitHub issue（贡献者用 §X.Y 编号交流）
  - 写 polyfill：必须照规范实现 abrupt completion 处理
  - 解读 TC39 proposal：知道 Stage 各阶段的产出物
- **陷阱**：
  - 跳过 §5 记法约定直接读 §6 → 后面看不懂"? Op()"
  - 把 Annex B 当主规范（写出非 web 环境跑不了的代码）
- **ECMA 关联标准家族**（Wave 3 新加段，~200 字）：
  - **ECMA-262** —— 本主题主角，JS 核心语言
  - **ECMA-402** —— Intl 国际化 API 标准（独立编号但与 ECMA-262 同步发布）
  - **ECMA-404** —— JSON Data Interchange Format
  - **ECMA-414** —— ECMAScript 规范套件元标准（如何写一个 ES 标准）
  - **ECMA-419** —— ECMAScript 嵌入式 API（小型设备）
  - **关键判断**：ECMA-262 之外的标准是"扩展能力"，不影响核心语言行为；本主题只关心 ECMA-262
- **延伸阅读**：[TC39 How We Work](https://tc39.es/process-document/)、[Spec Test 262](https://github.com/tc39/test262)、[ECMA 标准家族总览](https://ecma-international.org/publications-and-standards/standards/)
- **关联章节**：P1.3（提案旅程也用规范工具）、P4-P7（具体应用）
- **预估字数**：4000-5000 → 4200-5200（含 Wave 3 加段）

---

# P4 · §6 数据类型与值（1 章）

> 这一阶段把规范内部的"类型系统"讲透——不只是用户可见的 8 种 Language Type，更是规范内部的 Reference Record / Completion Record 等"幕后角色"。

## P4.1 · 数据类型与值（§6）

- **定位**：覆盖 ECMA-262 §6.1（Language Types）+ §6.2（Specification Types）。
- **关键知识点**：
  - **Language Types**（用户可见）：Undefined、Null、Boolean、String、Symbol、Number、BigInt、Object（8 种）
  - **Specification Types**（规范内部，用户看不见）：
    - **Reference Record**（旧名 Reference Type）—— `obj.x` 表达式的中间结果，含 `[[Base]]`、`[[ReferencedName]]`、`[[Strict]]`
    - **Completion Record** —— 所有抽象操作的返回类型，含 `[[Type]]`(normal/break/continue/return/throw)、`[[Value]]`、`[[Target]]`
    - **Property Descriptor** —— `Object.getOwnPropertyDescriptor` 暴露的就是它
    - **Environment Record** —— 见 P7.2
    - **Abstract Closure** —— 规范内部的"匿名函数"
    - **Data Block / Shared Data Block** —— ArrayBuffer / SharedArrayBuffer 的规范表达
  - **Number 内部**：double-precision IEEE-754、`+0` vs `-0`、NaN 不等于自己、Number.EPSILON
  - **String 内部**：UTF-16 code unit 序列（不是 code point！）、surrogate pair、String.prototype.normalize
  - **Symbol & Well-known Symbol**：`@@iterator`、`@@toPrimitive`、`@@hasInstance`
- **底层逻辑要点**：
  - **Reference Record 是规范专门为"赋值左值"和"this 推断"创造的中间产物**：`obj.x = 1` 中 `obj.x` 不是值，是 Reference；`f()` 中 `f` 也是 Reference，所以 `f()` 才能感知是 method call 还是 plain call（this 自动推断）。
  - **Completion Record 是规范的"异常机制"**：abrupt completion (`break`/`continue`/`return`/`throw`) 是怎么沿调用栈传播的——规范用 "?" 简写就是在传 abrupt。
  - **`String` 在规范里是 UTF-16 序列，不是 Unicode**：所以 `"💩".length === 2`、`"💩"[0]` 是孤立的 surrogate。理解这点才能正确处理 emoji。
- **应用场景**：
  - 读 V8 源码的 `RawValue`、`HeapObject` 等类型对应规范 type
  - 写 emoji-safe 字符串切割：用 `Intl.Segmenter` 或 `Array.from(str)`
  - 实现 deep clone：理解 PropertyDescriptor 的 4 种形态
- **陷阱**：
  - 误以为 `String.length` 是字符数（其实是 UTF-16 unit 数）
  - 用 `===` 区分 `+0`/`-0`（其实相等，要用 `Object.is`）
  - 不知道 Reference Record，看不懂"为什么 `(0, obj.x)()` 丢失 this"
- **关联章节**：P2.2、P5
- **预估字数**：4500-5500

---

# P5 · §7 抽象操作（1 章）

> 这一阶段把 §7 的核心抽象操作（type conversion、testing、object operations、operations on iterators）讲透。

## P5.1 · 抽象操作与算法记法（§5、§7）

- **定位**：把 §7 的核心抽象操作讲透。
- **关键知识点**：
  - **类型转换族**：
    - `ToPrimitive(input [, hint])` —— `==`、`+` 的核心
    - `ToBoolean` / `ToNumeric` / `ToString` / `ToObject`
    - `ToInt32` / `ToUint32` —— 位运算的隐式转换
    - `ToPropertyKey` —— `obj[k]` 的 k 处理
    - `RequireObjectCoercible` / `IsArray` / `IsCallable` / `IsConstructor`
  - **比较族**：
    - `IsLooselyEqual`（`==`）
    - `IsStrictlyEqual`（`===`）
    - `SameValue` / `SameValueZero` / `SameValueNonNumeric`
  - **对象操作族**：`Get` / `GetV` / `Set` / `CreateDataProperty` / `DefinePropertyOrThrow` / `HasProperty` / `OrdinaryToPrimitive`
  - **迭代器操作族**：`GetIterator` / `IteratorNext` / `IteratorClose` / `IteratorValue`
- **底层逻辑要点**：
  - **`==` 的 11 步算法**（IsLooselyEqual）是规范最反直觉的部分，但每一步都是为"web 兼容"服务的。
  - **`+` 运算符走 ToPrimitive(hint=default) → 看是否有 string 操作数**：这就是 `[] + {}` 等怪现象的根因。
  - **`Map` 用 SameValueZero 做 key 比较**（`+0 === -0`，`NaN` 等于自己）；`Set.add` 同理。`Object.is` 用 SameValue（`+0 ≠ -0`）。
- **应用场景**：
  - 写自定义 toJSON / Symbol.toPrimitive 实现
  - 调试 `===` 不工作（用了 NaN 或跨 Realm）
  - 读 lodash 源码：`_.isEqual` 内部就是 SameValueZero 的递归版
- **陷阱**：
  - 用 `==` 期望"宽松相等"（结果跟 ToPrimitive 顺序相关）
  - 写 `Number(undefined)` 期望 0（其实 NaN）
- **关联章节**：P2.2、P4
- **预估字数**：4000-5000

---

# P6 · §10 内部槽与元编程（2 章）

> 这一阶段覆盖对象的 essential internal methods + ordinary vs exotic 区分（Proxy 的本质就在这里），以及 Reflect API + Membrane 模式 + WeakRef 这一整套元编程谱。

## P6.1 · 内部槽与内部方法（§6.1.7、§10）

- **定位**：覆盖对象的 11 个 essential internal methods + ordinary vs exotic 区分。
- **关键知识点**：
  - **11 个 essential internal methods**：`[[GetPrototypeOf]]` / `[[SetPrototypeOf]]` / `[[IsExtensible]]` / `[[PreventExtensions]]` / `[[GetOwnProperty]]` / `[[DefineOwnProperty]]` / `[[HasProperty]]` / `[[Get]]` / `[[Set]]` / `[[Delete]]` / `[[OwnPropertyKeys]]`
  - **Ordinary Object** —— 默认实现（OrdinaryGet 等），属性表是 List + 原型链委托
  - **Exotic Objects**：
    - **Array exotic** —— `length` 自动同步
    - **String exotic** —— index property 映射到 UTF-16 unit
    - **Arguments exotic** —— 与命名参数同步（旧 mapped arguments）
    - **Module Namespace exotic** —— frozen + 不可写
    - **Proxy exotic** —— 所有 trap 都重定向
    - **Bound function exotic** —— `.bind()` 的产物
    - **Integer-Indexed exotic** —— TypedArray
  - **`[[Construct]]` / `[[Call]]`** —— 函数对象的 internal methods
  - **PrivateElement / PrivateName** —— class `#field` 的规范层
- **底层逻辑要点**：
  - **Proxy = "替换 internal methods"**：`new Proxy(target, handler)` 创建一个 exotic 对象，所有 internal methods 都改派给 trap。如果某个 trap 没定义，回落到 OrdinaryX(target)。这就是 Proxy 的本质。
  - **`Array.length` 是 exotic 行为**：写 `arr.length = 3` 触发 `[[DefineOwnProperty]]("length", ...)` 的特殊版本，会**反向**删除超长 index。
  - **`Object.freeze` 是把 `[[IsExtensible]]` 设为 false + 所有属性改 non-writable + non-configurable**：这是规范精确定义的"冻结"，不是引擎自由发挥。
- **应用场景**：
  - 写 Proxy-based reactive 系统（Vue / Solid）
  - 调试 Array-like 对象为什么不能 `.map`（不是 Array exotic）
  - 实现深 freeze
- **陷阱**：
  - 把 Proxy 当"hook"用（其实任何 trap 不实现都要回落 ordinary，行为可能反直觉）
  - 用 `Object.assign` 复制 Array 当作 deep clone（exotic 行为不复制）
- **关联章节**：P2.1（原型对象模型）、P6.2（Reflect 配套 API）、P7.2（function 内部槽）
- **预估字数**：4500-5500

## P6.2 · Reflect 与元编程谱

- **定位**：P6.1 讲了 Proxy 怎么"替换" internal methods，但元编程是一对设计——Reflect 是 Proxy 的**对应物**，提供"以函数形式调用 internal methods"的能力。本章把 Reflect 完整 API + 元编程经典模式（Membrane / WeakRef / FinalizationRegistry）一次讲透，让 P6 形成完整的元编程谱。
- **关键知识点**：
  - **Reflect 的 13 个静态方法**：每个都对应一个 Proxy trap：
    - `Reflect.get(t, p, r)` ↔ `get` trap ↔ `[[Get]]`
    - `Reflect.set(t, p, v, r)` ↔ `set` trap ↔ `[[Set]]`
    - `Reflect.has(t, p)` ↔ `has` ↔ `[[HasProperty]]`
    - `Reflect.deleteProperty(t, p)` ↔ `deleteProperty` ↔ `[[Delete]]`
    - `Reflect.ownKeys(t)` ↔ `ownKeys` ↔ `[[OwnPropertyKeys]]`
    - `Reflect.getPrototypeOf(t)` / `Reflect.setPrototypeOf(t, p)` ↔ 同名 trap
    - `Reflect.isExtensible(t)` / `Reflect.preventExtensions(t)` ↔ 同名 trap
    - `Reflect.getOwnPropertyDescriptor(t, p)` / `Reflect.defineProperty(t, p, d)` ↔ 同名 trap
    - `Reflect.apply(f, t, args)` ↔ `apply` ↔ `[[Call]]`
    - `Reflect.construct(f, args, nt)` ↔ `construct` ↔ `[[Construct]]`
  - **Reflect vs `Object.*` / `obj.x` 的差异**：
    - 返回值约定：`Reflect.set` 返回 boolean（成功与否）；普通赋值返回 RHS 值；`Object.defineProperty` 失败抛错而 `Reflect.defineProperty` 返回 false
    - 接收 receiver 参数：`Reflect.get(t, p, r)` 显式 this（getter 内 `this` 是 r）；普通访问器拿不到这个旋钮
    - 为元编程设计：Proxy trap 内部用 Reflect 转发原行为是**首选**惯用法
  - **Membrane 模式**：跨边界对象隔离的经典实现
    - 用一对 Proxy（"内 → 外"和"外 → 内"）包装对象
    - 跨边界的引用都被 Proxy 拦截 + 记录到 WeakMap
    - 撤销整个 Membrane 时，所有跨边界引用同时失效
    - 应用：iframe 沙箱、ShadowRealm polyfill、Realms shim、SES（Secure ECMAScript）
  - **WeakRef + FinalizationRegistry**（ES2021）：
    - `WeakRef(target)` —— 持有不阻止 GC 的弱引用；`.deref()` 返回 target 或 undefined
    - `FinalizationRegistry(cleanup)` —— 注册对象 GC 时执行的 cleanup 回调
    - 使用约束：不能依赖回调时机（GC 是异步、不确定的）；不应放业务关键逻辑
    - 应用：缓存（LRU）+ 自动清理外部资源（WASM 内存、文件句柄）
  - **`Reflect.construct` 与 `new.target` 元编程**：手写 abstract class 检测、用一个构造器构造另一个的实例（changeTo subclass 模式）
- **底层逻辑要点**：
  - **Reflect 不是新功能，是把 internal methods "暴露成函数"**：之前要做这些事得用 `obj[Symbol.unscopables]`、`Object.defineProperty`、`Function.prototype.apply` 拼凑；Reflect 把它们规范化为 13 个统一签名的方法。
  - **Membrane 的本质 = 用 WeakMap 做"对象身份映射" + Proxy 拦截每次穿越边界**：是 SES（Secure ECMAScript）+ `lockdown()` + `harden()` 等可信代码执行环境的核心基础设施。
  - **WeakRef 的 GC 语义是"GC 决定的，不是你决定的"**：规范刻意不规定何时回收，避免开发者写出依赖回收时机的代码（这是设计上的"反模式防御"）。
- **应用场景**：
  - 写 Vue 3 / Solid / Mobx 等响应式系统：`Proxy` + `Reflect` 是标准搭配（trap 内调 Reflect 转发）
  - 写沙箱/插件系统：Membrane + 撤销机制实现"按需丢弃整个隔离环境"
  - 实现 LRU 缓存 + 自动清理 WASM 内存：`WeakRef` + `FinalizationRegistry`
  - 兼容 ShadowRealm polyfill / Realms shim：Membrane 是核心组件
- **典型代码**：
  - Proxy + Reflect 标准模板（每个 trap 默认调 `Reflect.X(target, ...args)`）
  - 一个最小 Membrane 实现（30 行）
  - WeakRef + FinalizationRegistry 实现"自动清理外部资源"的 LRU 缓存
- **陷阱**：
  - 在 Proxy trap 里**忘了调 Reflect 转发**——结果属性访问完全失效
  - 用 `WeakRef` 当强引用替代品（GC 时机不可预期，不能依赖）
  - `FinalizationRegistry` 回调跑业务逻辑（GC 不一定触发，可能永远不跑）
  - Membrane 漏拦截 Symbol 属性 / 原型方法，导致跨边界泄漏
- **关联章节**：
  - JS 已有：`javascript/02-advanced/08-proxy-reflect`、`javascript/01-fundamentals/10-map-set`（WeakRef 的 GC 语义）
  - 内部：P6.1（Proxy 是底层机制）、P7.1（ShadowRealm 用 Membrane 实现）
- **预估字数**：4000-5000

---

# P7 · §9 执行模型与并发（5 章）

> 这一阶段把 ECMAScript 的"运行时机器"讲透——Realm / Agent / Job / Execution Context / Environment Record / Event Loop / 模块求值 全部覆盖。
>
> **三合一设计**：原 Track A 的"机器怎么跑 / 单线程怎么并发"（叙事）和 Track B §9（规范）讲的是同一组对象。本阶段不再分两版，按对象族拆 4 章，每章先从机制叙事切入，再展开规范字段。
>
> 与 `javascript/02-advanced/` 和 `javascript/03-async/` 高度交叉——本阶段对每个机制做 1-3 句话短重述 + 链回，正文聚焦"规范层怎么定义这个机器、Host 与 ECMA-262 的责任划分"。

## P7.1 · 执行模型基础（容器与上下文）

- **定位**：用户视角讲清整套"运行时机器"——Realm / Agent / Job 三层容器 + Execution Context + Environment Record + 一次函数调用完整生命周期。这是 P7 的"故事弧"，P7.2 用规范字段视角再讲一遍。
- **关键知识点**：
  - **三层容器**：
    - **Agent**（≈ "线程"，主线程一个 Agent，每个 Worker 一个）：包含独立 Heap、Stack、Job Queue。`[[CanBlock]]` / `[[Signifier]]` / `[[IsLockFree1]]` / `[[CandidateExecution]]`
    - **Agent Cluster**：能共享 SharedArrayBuffer 的一组 Agent
    - **Realm**（≈ "全局环境"）：每个 iframe / vm.createContext / Worker 一个 Realm，含独立的 `globalThis`、Intrinsics（`Array.prototype` 等）、global object。`[[Intrinsics]]` 表 / `[[GlobalObject]]` / `[[GlobalEnv]]`
    - **Job**：宿主投递给 Agent 的执行单元（脚本、Promise reaction、async 函数 step）
  - **§9.7 Forward Progress** —— 规范层对"任务必须最终完成"的语义保证
  - **§9.8 Jobs and Host Operations to Enqueue Jobs**：HostEnqueuePromiseJob、HostEnqueueGenericJob、HostEnqueueTimeoutJob
  - **§9.9 InitializeHostDefinedRealm**
  - **Host 与 ECMA-262 的责任划分**：哪些是规范定义的（如 Job 抽象）、哪些是宿主实现的（如 setTimeout、I/O、UI 渲染）
  - **ShadowRealm 提案与未来 Realm 隔离**（Wave 1 新加节）：Stage 3 状态、与 `vm.createContext` / iframe 对比、polyfill 思路、与 Membrane 模式的关系（Realm 隔离的"新世代"）
  - **Generator 状态机深入**（Wave 1 扩节）：状态转移图（suspended-start → executing → suspended-yield → completed）、async/await 怎么用 Generator desugar、yield 双向通信细节、async generator 与 `for await...of` 协作
- **底层逻辑要点**：
  - **JS 不是"单线程"——是"单 Agent 默认"**：浏览器主线程是一个 Agent，每个 Worker 是另一个 Agent。共享 Heap 仅在 Agent Cluster + SharedArrayBuffer 才发生。
  - **Realm 隔离是 iframe / vm context 的本质**：跨 Realm 的 `Array` 不是同一个 `Array`，所以 `[] instanceof Array` 在跨 iframe 时会 false——这是"为什么 lodash 用 `Array.isArray`"的根因。
  - **Job 是规范层抽象，microtask 是浏览器实现**：Job 包含很多种（PromiseJob / CleanupFinalizationRegistry / async function step），microtask 是"PromiseJob + 类似物"的浏览器侧名称。
- **应用场景**：
  - Node `vm` 模块写沙箱：每个 vm context 是新 Realm
  - jsdom / happy-dom 测试环境：每个测试一个 Realm
  - 写跨 Worker 通信库：理解 Agent Cluster 的边界
- **陷阱**：
  - 跨 Realm 用 `instanceof`
  - 把 Job 等同于 microtask（其实 Job 包含很多种）
  - 以为 Realm 之间共享 Intrinsics（其实独立）
- **关联章节**：P7.2（Execution Context 在 Agent 上跑）、P7.3（Event Loop 调度 Job）、P2.1（原型对象模型每个 Realm 一份）
- **预估字数**：5000-6000

## P7.2 · Execution Context 与 Environment Record

- **定位**：覆盖 §9.1 Environment Records、§9.2 PrivateEnvironment Records、§9.4 Execution Contexts。**这是"作用域链"和"调用栈"的规范字段化**。
- **关键知识点**：
  - **Execution Context**（执行上下文）：
    - 函数调用栈的最小单元
    - 内部槽：`[[Function]]` / `[[Realm]]` / `[[ScriptOrModule]]` / `LexicalEnvironment` / `VariableEnvironment` / `PrivateEnvironment` / `[[Generator]]`
    - "running execution context"（栈顶）和"execution context stack"
  - **Environment Record**（作用域链节点）：
    - Declarative / Object / Function / Module / Global EnvironmentRecord 五种
    - `[[OuterEnv]]` 链 = 词法作用域链
    - `ResolveBinding` 抽象操作沿链查找
  - **PrivateEnvironment Records** —— class private fields 的作用域链
  - **strict mode 机制**：`'use strict'` 不只是"严格模式"标志，规范层把 strict 信息存进 ExecutionContext 的 `[[Strict]]`、Reference Record 的 `[[Strict]]`，影响 `this` 默认值、`with`、`arguments` 同步、`delete` 行为、保留字。模块和 class body 自动 strict
  - **生成器与协程的暂停机制**：`yield` 是怎么"暂停"函数的——规范用 `[[Generator]]` 内部槽 + GeneratorContext 把 ExecutionContext "挂起"，恢复时把它压回栈顶。这是 async/await 的底层
  - **一次函数调用的完整生命周期**（章末小结，文字版流程图）：
    1. Agent + Realm 建立
    2. 代码加载 + 全局执行（var hoisting / TDZ）
    3. 函数调用 → 创建 ExecutionContext + LexicalEnvironment
    4. 标识符解析（沿 OuterEnv 链）
    5. 闭包形成（函数对象捕获 Environment）
    6. 异步调度（Job Queue 投递，详见 P7.3）
    7. 多 Agent 协同（Worker + postMessage，详见 P7.1）
- **底层逻辑要点**：
  - **闭包的实现 = 函数对象 + `[[Environment]]` 内部槽**：函数创建时把当前 LexicalEnvironment 存到 `[[Environment]]`；调用时这个 Env 成为新 Context 的 outer。这就是为什么内层函数能访问外层变量。
  - **var 的 hoisting 不是"编译时把声明搬到顶部"**：是函数调用时 `FunctionDeclarationInstantiation` 算法**在执行上下文创建阶段**把 var 名预先 bind 到 VariableEnvironment 上。规范层根本不存在"搬运"这个动作。
  - **TDZ 是 Declarative EnvironmentRecord 的"uninitialized binding" 状态**：let 声明创建 binding 但不初始化；访问触发 ReferenceError。这是规范明确写的，不是 V8 实现技巧。
- **应用场景**：
  - 调试闭包内存泄漏：理解 `[[Environment]]` 引用为什么挂住整个外层 scope
  - 调试 class private field 跨 instance 访问
  - 理解 generator 暂停/恢复的内存模型
- **陷阱**：
  - 以为函数有"this 作用域"（this 不在 LexicalEnvironment 里，在 ExecutionContext 上）
  - 以为闭包"复制"了变量（其实共享 Environment Record 的同一个 binding）
  - 把"call stack"和"execution context stack"混为一谈（前者是 V8 实现术语，后者是规范术语）
- **关联章节**：
  - JS 已有：`javascript/02-advanced/01-scope-tdz`、`javascript/02-advanced/02-closures`、`javascript/02-advanced/03-this`、`javascript/01-fundamentals/13-iterators`（生成器）
  - 内部：P7.1、P7.3、P6（function 内部槽）
- **预估字数**：5500-6500（**最难章 · 含一次调用生命周期完整流程**）

## P7.3 · Event Loop 与异步演进

- **定位**：覆盖 ECMAScript 异步模型从"回调"到"Promise"到"async/await"再到"多线程"的演进路径，外加 §9.7-§9.8 的规范字段。**与 `javascript/03-async/` 高度交叉**——对每个机制做 1-3 句话短重述 + 链回，正文聚焦"为什么这样演进、规范层怎么改、各 ES 版本的取舍"。
- **关键知识点**：
  - **回调时代（ES1-5）**：setTimeout / setImmediate / Node-style callback / 回调地狱
  - **Event Loop 的责任划分**：
    - **HTML 规范**定义 task source、rendering steps、宏任务（setTimeout、I/O、UI）
    - **ECMA-262 规范**定义 Job 抽象、HostEnqueuePromiseJob、microtask queue
    - 浏览器的 "macrotask vs microtask" 是两份规范的合集
  - **Promise（ES2015）**：
    - 状态机：pending → fulfilled / rejected（**不可逆**）
    - 解决 vs settle：`resolve(p)` 时外层 resolved 但未 settled
    - PromiseReaction Records（规范层）
  - **Promise 组合器**：`Promise.all`（短路失败）、`Promise.race`（短路任意 settle）、`Promise.any`（ES2021，短路成功）、`Promise.allSettled`（ES2020，全收集）、`Promise.withResolvers`（ES2024）、`Promise.try`（Stage 3）
  - **async/await（ES2017）**：
    - Generator + Promise 的语法糖
    - 隐式 try/catch（await 表达式抛错变 reject）
  - **多线程突破口**：
    - Worker（HTML 规范）→ 独立 Agent + 独立 Heap
    - SharedArrayBuffer（ES2017，Spectre 后被禁，2020 配合 COOP/COEP 重启）
    - Atomics（ES2017）
  - **异步迭代器与 async generator**：`Symbol.asyncIterator`、`for await...of`、async function* —— 处理 SSE / 文件流 / 分页 API 的官方答案
  - **AbortController 与可取消异步**：DOM 规范引入、ES 端通过 Promise reject 表达；为什么 ECMA-262 不直接定义"cancel"——与 Promise 不可逆性的设计张力
  - **async 错误传播规则**：await 表达式抛错 → reject；finally 在 await 链中的语义；UnhandledPromiseRejection 的 host hook（HostPromiseRejectionTracker）
  - **资源管理：`using` / `await using`**（ES2025）：`Symbol.dispose` / `Symbol.asyncDispose`、栈式资源释放——异步资源的 RAII 答案
- **底层逻辑要点**：
  - **JS 单线程的根因不是 ECMA-262 规定，是 HTML/DOM 设计**：DOM 不是线程安全的；如果 JS 多线程，UI 就要锁。Worker 是"用 message passing 绕过共享状态"的折中。
  - **Promise 不是异步，是"延迟值"的容器**：你可以用 Promise 包同步值，then 仍然异步执行（HostEnqueuePromiseJob）——这才是 Promise 的核心抽象。
  - **微任务优先于宏任务的根因**：HTML 规范要求"每个宏任务执行完后清空 microtask queue 再继续"——这是为了让 `Promise.then` 在同一帧内连续调度，避免 UI 抖动。
  - **async/await 不是"暂停函数"，是 Generator 的状态机**：编译产物把每个 await 切成一个状态，await 后续代码作为 .then 回调注册。理解这点才能调试"为什么 async 函数 stack trace 不连续"。
- **应用场景**：
  - 排队/限流：手写 PQueue 或读 p-limit 源码
  - 取消异步：AbortController 与 Promise 不可逆性的张力
  - 异步迭代器：`for await...of` + async generator（处理 SSE / fs streams）
  - WebGPU compute / FFmpeg.wasm：靠 SharedArrayBuffer + Atomics
- **陷阱**：
  - `await` 不在 async 函数里抛 `SyntaxError`（除非 Top-Level Await 模块）
  - `Promise.all` 一个失败短路其他还在跑（资源泄漏）
  - microtask 死循环把 UI 卡死（每个 then 又投递新 microtask）
  - SharedArrayBuffer 跨 origin 必须 COOP/COEP 头
  - async 函数返回 Promise 但抛错变 reject（不会冒泡到外层 try/catch）
- **关联章节**：
  - JS 已有：`javascript/03-async/*`（全部 8 章）
  - 内部：P7.1（Job 在 Agent 上调度）、P7.4（Top-Level Await 死锁）
- **预估字数**：6000-7000（系统化补全 async iterator / AbortController / `using` 后增量）

## P7.4 · 模块系统与 Top-Level Await

- **定位**：覆盖 §9.10 Source Text Module Records 的全部子章节 + ES2022 Top-Level Await 的规范层细节。
- **关键知识点**：
  - **Source Text Module Record** —— ESM 的规范层数据结构
  - **Module 加载三阶段**：Parse → Link → Evaluate（规范层 `LoadRequestedModules` / `Link` / `Evaluate`）
  - **`[[CycleRoot]]`** —— 循环依赖的规范处理
  - **Async Module Evaluation Order**：Top-Level Await 引入的复杂性
  - **Top-Level Await 死锁检测**：cycle + async module 组合时，规范如何检测并抛 SyntaxError / 运行时挂起
  - **Host hooks**：HostResolveImportedModule / HostFinalizeImportMeta / HostLoadImportedModule / HostImportModuleDynamically
  - **Module Namespace Object** —— `import * as ns` 的规范产物（exotic object，frozen）
- **底层逻辑要点**：
  - **ESM 的"静态结构"是规范级承诺**：parse 阶段就能确定 import/export 关系，这让 tree-shaking、live binding、cycle detection 都成为可能。
  - **Top-Level Await 的死锁 vs 挂起**：cycle 中两个 async module 互相 await 对方 → 规范要求挂起（不报错），靠宿主的 timeout / unhandled rejection 检测。
  - **import.meta 的 host hook 设计**：规范不规定 `import.meta` 长什么样，由宿主（Browser / Node）填——这就是为什么 `import.meta.url` 在 Node 是 file:// 而在 Browser 是 https://。
- **应用场景**：
  - 写 Node 内置模块 hook（`--experimental-loader`）需要懂 HostResolveImportedModule
  - 调试 Top-Level Await 死锁（cycle + async）
  - 给 jsdom / linkedom 等 DOM 实现写 polyfill
- **陷阱**：
  - 在 cycle 中用 Top-Level Await（容易死锁）
  - 以为 `import * as ns` 返回普通对象（其实是 frozen Module Namespace exotic）
  - 用 dynamic import 替代静态 import（失去 tree-shaking）
- **关联章节**：
  - JS 已有：`javascript/04-modules/01-esm`、`javascript/04-modules/02-cjs-interop`、`javascript/04-modules/03-dynamic-import`
  - 内部：P1.3（Top-Level Await 是经典 case study）、P7.3（async module 的 Job 调度）
- **预估字数**：4500-5500

## P7.5 · 内存模型与多线程（§24 Memory Model + Atomics）

- **定位**：填补本主题最大空白——多线程心智模型。P7.1 / P7.3 各带过一段 SharedArrayBuffer / Atomics，但没系统讲。本章把 ECMA-262 §24 Memory Model + 同步原语 + 浏览器安全配置 + 实战模式一次性讲透。是 P7 的压轴章。
- **关键知识点**：
  - **§24 Memory Model 形式化**：
    - **Candidate Execution**：所有可能的"事件偏序"集合
    - **Synchronizes-With** 关系：什么操作之间有"happens-before"保证
    - **Sequentially Consistent**（SC）vs **Unordered**（UO）原子操作
    - **Race Condition** 的精确定义：两个事件不在 happens-before 关系里 + 至少一个是写
  - **SharedArrayBuffer**（ES2017，ES2020 配 COOP/COEP 重启）：
    - 与 ArrayBuffer 的差异：可以跨 Agent 共享同一段内存（不复制）
    - 创建 + `postMessage` 转移：传引用不传所有权，多 Agent 同时持有
    - 与 `[[ArrayBufferData]]` Block 的对应（§24.2.2 SharedDataBlock）
  - **Atomics 11 个 API**：
    - **读写原子化**：`Atomics.load(ta, i)` / `Atomics.store(ta, i, v)` —— 普通访问可能撕裂（torn read），原子访问保证完整
    - **读改写**：`Atomics.add` / `sub` / `and` / `or` / `xor` —— 单条不可中断
    - **CAS**：`Atomics.compareExchange(ta, i, expected, replacement)` —— Lock-free 数据结构核心
    - **同步**：`Atomics.wait(ta, i, value, timeout)` / `Atomics.notify(ta, i, count)` —— 实现 mutex / 条件变量
    - **栅栏**：`Atomics.exchange` / 在 Web 端不直接暴露 fence 指令
  - **Lock-free 数据结构模式**：
    - 无锁队列（SPSC ring buffer）：单生产者-单消费者
    - 自旋锁（spinlock）+ Atomics.wait 退避（避免忙等浪费 CPU）
    - 双缓冲（double buffering）：UI 主线程读 / Worker 写交替
  - **Spectre 缓解与浏览器安全**：
    - 2018 Spectre 攻击 + 同年 SAB 在浏览器被禁
    - 2020 重启：要求 **COOP**（Cross-Origin-Opener-Policy: same-origin）+ **COEP**（Cross-Origin-Embedder-Policy: require-corp）头
    - `crossOriginIsolated` 全局变量 = 当前 page 是否启用了 SAB
    - `Atomics.wait` 在主线程被禁（会阻塞 UI），只能在 Worker 用；浏览器有 `Atomics.waitAsync`（ES2024）非阻塞版本
  - **Forward Progress 与 Atomics.wait**：规范要求 `Atomics.wait` 不能让 Agent 永久挂起（所有等待最终必须能被 notify 或 timeout 解开）
  - **Memory Order vs JavaScript "看起来很简单"**：JS 没有 C++ 的 6 种 memory_order，所有 Atomics 默认 SC（顺序一致），代价是性能但简化心智
- **底层逻辑要点**：
  - **JS 多线程不是后加的"妥协"，是 §24 完整规范化的能力**：从 ES2017 起，规范层就有完整的"形式化内存模型"——比 Java、C# 都晚但比 Python、PHP 等早；这件事说明 TC39 把多线程视为"未来计算密集型 Web 应用的硬基础"。
  - **Spectre 让 SAB 经历了"上线 → 下线 → 加门槛上线"**：这是 Web 安全模型 vs 性能能力的张力典型。COOP/COEP 让浏览器把 origin 完全隔离到独立进程，恢复 SAB 的高精度时钟能力（高精度计时器是 Spectre 攻击的核心条件）。
  - **`Atomics.wait` 不能在主线程用**是 HTML 规范的 host hook 限制，不是 ECMA-262 限制——规范允许（只要满足 forward progress），但浏览器为了 UI 流畅性禁了。
  - **Lock-free 在 Web 端的现实约束**：写 SPSC 队列简单，写 MPSC（多生产者）就要 CAS + 重试；JS 在 GC 语言里写 lock-free 还要担心引用被 GC 回收的问题——所以 Web 端 lock-free 主要用在数值密集计算（音频处理、WebGPU compute），很少做对象级数据结构。
- **应用场景**：
  - **音频处理**：AudioWorklet 主线程 + Worker 共享 SAB 的 ring buffer，实时处理样本不阻塞 UI
  - **WebGPU compute**：把矩阵 / 张量直接放 SAB，多 Worker 并行计算
  - **FFmpeg.wasm**：解码视频帧到 SAB，主线程零拷贝读取展示
  - **共享状态实时协作**（Figma 风格）：多 Worker 共享 CRDT 文档状态，Atomics 保证一致性
  - **高性能 channel**：替代 postMessage 序列化开销，传引用而非拷贝
- **典型代码**：
  - 用 `Atomics.add` 实现并发计数器（vs 普通 += 的 race）
  - 用 `Atomics.compareExchange` 实现 SPSC 无锁队列（30 行）
  - 用 `Atomics.wait` + `notify` 实现 mutex（10 行）
  - COOP/COEP 完整配置（HTTP headers + CDN 链路）
- **陷阱**：
  - 没配 COOP/COEP 直接用 SAB → `crossOriginIsolated === false`，SAB 构造器抛错
  - 在主线程 `Atomics.wait` → 直接抛错（"Atomics.wait cannot be called in this context"）
  - 用 `let count = 0; count++;` 配合 SAB → 不是原子，必须 `Atomics.add`
  - 以为 `postMessage(sab)` 是转移所有权 → 实际是引用共享，双方同步修改
  - 嵌入第三方 iframe 后页面失去 `crossOriginIsolated`（COEP 要求所有子资源都标 `Cross-Origin-Resource-Policy`）
  - 把 `FinalizationRegistry` 用作 SAB 内存释放的保证 → GC 不一定触发（详见 P6.2）
- **延伸阅读**：
  - [ECMA-262 §24 Memory Model](https://262.ecma-international.org/15.0/index.html#sec-memory-model)
  - [Spectre 攻击原文 + Mitigation](https://meltdownattack.com/)
  - [HTML 规范 · Cross-Origin Isolation](https://html.spec.whatwg.org/multipage/origin.html#concept-origin)
  - [web.dev · Cross-Origin Isolation 实战](https://web.dev/articles/coop-coep)
  - [TC39 proposal-atomics-wait-async](https://github.com/tc39/proposal-atomics-wait-async)
- **关联章节**：
  - JS 已有：`javascript/03-async/*`（异步基础）、`javascript/07-advanced/01-arraybuffer-typedarray`（ArrayBuffer 单线程版）
  - 内部：P7.1（Agent Cluster 是 SAB 的边界）、P7.3（异步演进：从 Promise 到多线程）、P6.2（WeakRef + FinalizationRegistry GC 语义）
- **预估字数**：5500-6500（**最难章 · 含完整 Memory Model 形式化 + lock-free 实战**）

---

## 写作约定

### 章节内统一 6 段结构

每章遵循：**速览 → 底层逻辑 → 应用场景 → 典型代码 → 常见陷阱 → 延伸阅读**。

### 叙事 vs 精确度的混合（区别 JS 主题）

ECMA 主题相比 `javascript/` 有以下额外约定：

- **「短重述 + 链回」** —— 当一个机制在 `javascript/` 主题已详述时（如 Promise 状态机、闭包内存模型、TDZ），本主题用 1-3 句话点到本质，紧跟一句"详细机制请参考 X"，避免读者反复跳跃
- **规范字段精确名称** —— P3-P7 严格使用规范术语：`OrdinaryGet` 而非"属性查找"；`[[Prototype]]` 而非 `__proto__`（除非讨论可见 API）
- **历史决策标注动机** —— P1-P2 每个设计决策都标"当时有哪些选项、TC39 怎么选的、根因是什么"；不只罗列特性

### 必须明确标注 ⚠️ 的内容

- **ES4** 始终标 "abandoned 2008"
- **Annex B** 始终标 "web 兼容性遗留，非 web 环境可不实现"
- **Stage 0-2 提案** 始终标 "可能永远进不了标准"
- **SharedArrayBuffer** 始终标 "需 COOP/COEP 头才在浏览器可用"
- **`==`** 始终建议用 `===` 替代

---

## 与既有主题的关系

ECMA 主题**不重复** JS 主题已经讲透的运行时机制，但会在每个交叉点提供"短重述 + 链接"。常见对应：

- **P2 设计原则** → JS [类型系统](../javascript/01-fundamentals/01-types.html) / [原型链](../javascript/02-advanced/05-prototype.html) / [闭包](../javascript/02-advanced/02-closures.html)
- **P7.2 执行上下文** → JS [作用域与 TDZ](../javascript/02-advanced/01-scope-tdz.html) / [this 四规则](../javascript/02-advanced/03-this.html)
- **P7.3 异步演进** → JS [P3 · 异步 & 错误处理（全 8 章）](../javascript/03-async/index.html)
- **P7.4 模块系统** → JS [P4 · 模块 & 元编程](../javascript/04-modules/index.html)
- **P3 规范阅读** → JS / TS 章节中提到的 §X.Y.Z 都能在 P3-P7 找到对应

---

## 风险提示

### 重构风险（2026-04-28）

把两轨结构重组为 7 阶段，**最大的工作量在 P7 三合一**：原 A3 + A4 + B5 三章合并为 4 章（7.1-7.4），需要：

- 保留原叙事章节的"为什么这样演进"主线
- 保留原规范章节的精确字段表
- 删除两份重复的 Realm/Agent/Job 介绍
- 章末小结合并为一张"完整生命周期"流程图（P7.2 章末）

### 拆分风险

- 原 A2（设计原则单章）拆为 P2.1 + P2.2，需要保证两章衔接自然，不要变成"上下两半"硬切
- 原 B6（提案旅程）从规范精读尾部移到 P1.3，要重新组织——它现在是"标准与演化"的收官，不是"规范精读"的尾注

### 写不下去 / 容易翻车的章节

- **P7.1 三层容器**：Realm/Agent/Job 一旦讲不清，后续三章都没根
- **P7.2 执行上下文**：规范字段堆积如山，必须挑核心展开，不能全列
- **P1.3 提案旅程**：选对 case 才能讲透；选错了变成"提案目录"

### 可以快速产出的章节

- P1.2 现代生态、P3 怎么读规范、P5 抽象操作。套路成熟、概念正交。

### 风险：P1-P2 复用到 JS / TS / React 时的坑

通用原则：**叙事脊柱不变（为什么存在 → 它是什么 → 机器怎么跑 → 单线程怎么并发），但每个主题各自系统化补全**（不局限于 PPT 涉及的点）。每条交叉引用都按"短重述 + 链回"原则处理。

- **JS**：内容与 `javascript/` 章节高度交叉 —— 复用时改成 V8/Engine 视角（Hidden Class、Inline Cache、TurboFan、Orinoco GC），机制细节链回 `javascript/` 对应章节
- **TS**：P1 改成 TS 起源（2012 / Anders Hejlsberg / 微软 / structural typing）；P2 讲设计哲学（gradual typing / 不引入运行时）；P7 改成 TS 编译流水线（parse → bind → check → emit）+ 类型层计算
- **React**：P1 改成 React 起源（2013 / Facebook / 单向数据流）；P2 讲 UI = f(state) 设计哲学；P7 改成 Fiber 架构（双缓冲、work loop、lane 模型）+ Concurrent Mode + Suspense

---

## 总规模

| 阶段 | 章数 | 字数估计 |
|---|---|---|
| P1 · 标准与演化 | 3 | 5500 + 5000 + 6000 ≈ 16,500 |
| P2 · 设计原则 | 2 | 3700 + 5000 ≈ 8,700（含 Wave 3 跨 Realm 节）|
| P3 · 怎么读规范 | 1 | 4700（含 Wave 3 ECMA 家族段）|
| P4 · §6 数据类型 | 1 | 5000 |
| P5 · §7 抽象操作 | 1 | 4500 |
| P6 · §10 内部槽与元编程 | 2 | 5000 + 4500 ≈ 9,500（Wave 2 加 Reflect 章）|
| P7 · §9 执行模型与并发 | 5 | 7500（P7.1 扩 ShadowRealm + Generator）+ 6000 + 6500 + 5000 + 6000 ≈ 31,000（Wave 1 加 P7.5 多线程章）|
| **总计** | **16** | **≈ 79,900 字** |

平均每章 5,000 字。三波次扩充（Wave 1 P7.5 + P7.1 节级 / Wave 2 P6.2 / Wave 3 P2.2 + P3.1 节级）从 13 章 / 66,700 字 扩至 16 章 / ~80,000 字。新增覆盖：§24 Memory Model + 多线程、Reflect 完整 API + Membrane 模式、WeakRef + FinalizationRegistry、ShadowRealm 提案、跨 Realm 工程模式、ECMA 标准家族关联。
