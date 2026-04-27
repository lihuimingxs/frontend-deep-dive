# ECMAScript 深度学习 · 章节大纲

> 本文件是 ECMA 主题的写作蓝本。**两条独立轨道**：Track A · 历史脉络与设计 / Track B · ECMA-262 规范精读。
> 编写日期：2026-04-27 | 目标版本：ECMA-262 第 16 版（ES2025） | 灵感来源：用户内部分享 PPT《ECMAScript 调研分享》

---

## 元信息

- **目标编辑**：ECMA-262 16th edition (ES2025, 2025-06)，向下覆盖 ES1 (1997) 至今全部 16 版。**ES4 (2003-2008) 单独讲为重大失败案例**。
- **来源**：
  - [262.ecma-international.org/15.0](https://262.ecma-international.org/15.0/)（ES2024 即时锚点版，最新稳定 HTML）
  - [ecma-international.org publications](https://ecma-international.org/publications-and-standards/standards/ecma-262/)（所有版本归档）
  - [tc39/proposals](https://github.com/tc39/proposals)（Stage 0-4 现状）
  - 用户内部 PPT《ECMAScript 调研分享》（叙事脊柱原型）
- **目标读者**：已学过 `javascript/` 和 `typescript/` 主题，想理解"语言为什么长这样、规范怎么读、机制怎么落到字节码"的研发工程师。

---

## 设计原则：两轨独立，互不影响

**这是用户在 2026-04-27 明确的设计约束**：历史脉络与规范精读必须分开实现，**且历史轨道未来要被 JS / TS / React 三个主题平行复用**。

- **Track A · 历史脉络与设计**（5 章）—— 来自 PPT 的"4 问"叙事脊柱 + 1 章生态现状。**这是"补充章"模板**：将来在 JS/TS/React 主题里复用同一 4 问结构，写出各自的"为什么存在 / 它是什么 / 机器怎么跑 / 单线程怎么并发"。
- **Track B · ECMA-262 规范精读**（6 章）—— 教读者把 800 页规范读懂的"元能力"训练，覆盖 §6 数据类型、§7 抽象操作、§9 上下文、§10 内部槽等核心 clause，**也复述必要的语言特性以保持自洽**。
- **两轨之间**只通过显式 `延伸阅读` 互相链接，**不在任何章节正文里互相依赖**。读者可以只看 A 不看 B（适合产品工程师），或只看 B 不看 A（适合编译器/规范贡献者）。

### 与既有主题的边界 ——「短重述 + 链回」原则

**关键约定**（用户 2026-04-27 明确反馈）：当一个机制 / 概念在 `javascript/` 或 `typescript/` 已经讲透时，本主题章节里**不能直接略过**，而是：

> ✅ **短重述**：用 1-3 句话点出"它是什么 + 关键性质"，让读者不被打断
> ✅ **链回**：紧跟一句"详细的 X / Y / Z 请参考 [`javascript/{phase}/{chapter}`]"
> ❌ **不要**写"详见 X"就完事——读者还没理解就被甩到另一个主题
> ❌ **不要**完整抄一遍——那就违背了"轻量"

举例（在 A4 讲 Promise 时）：

> Promise 是一个状态机，状态从 `pending` 不可逆地迁移到 `fulfilled` 或 `rejected`。一旦 settled，状态永不再变。
>
> Promise 的运行时调度（HostEnqueuePromiseJob、microtask queue）和 then 链的传值规则在 [`javascript/03-async/02-promise.html`](../javascript/03-async/02-promise.html) 已详细展开，本章只在"规范如何描述这个状态机"层面继续。

这条约定适用于所有跨主题引用（包括将来 React → TS、TS → JS 等）。

---

### 内容覆盖原则 ——「PPT 是叙事，规范是知识」

**用户原话（2026-04-27）**："PPT 只参考讲解思路，说明了历史和核心特性，并没有太全面的知识点……我们要系统的学习，不能只看这些。"

落地为 3 条规则：

- **A 轨用 PPT 的 4 问做骨架**（为什么存在 → 它是什么 → 机器怎么跑 → 单线程怎么并发），但每章的内容**按权威来源系统化补全**，不局限于 PPT 涉及的点。
- **A 轨权威来源**：ECMA-262 §4 历史段、TC39 meeting notes、proposals 仓库、Eich 个人 blog、HTML 规范的 Event Loop / Job 部分。
- **B 轨权威来源**：ECMA-262 16th edition (ES2025) 全文，按 clause 顺序系统化覆盖核心章节，不挑内容只挑深度。

这意味着：**A2 设计原则**会讲 PPT 没提的"错误处理设计、迭代协议设计、模块系统设计"；**A4 异步**会讲 PPT 没提的"async iterator、AbortController、async 错误传播"；**B 轨**完整覆盖 §5-§10，而不是仅 PPT 涉及的部分。

---

## 整体节奏建议

- **连读组**：
  - A1 + A2 + A3 + A4（PPT 的 4 问是一条叙事弧，分开读会泄气）
  - B1 + B2 + B3（怎么读 → §6 数据类型 → §7 抽象操作 是规范阅读的"线性入门"）
  - B4 + B5（内部槽 → 执行上下文 是规范的"机器视角"双子章）
- **可独立跳读**：
  - A5 生态现状可以单独看，作为新人入职 onboarding
  - B6 提案旅程是一个独立 case study，不依赖前面任何 B 章
- **建议阅读顺序**：
  - 产品向工程师：A1 → A2 → A5（够用了）
  - 框架/底层向工程师：A1-A4 全读 → B1 → B4 → B5
  - TC39 兴趣 / 规范贡献者：A1 → B1-B6 全读

---

# Track A · 历史脉络与设计（5 章）

> 来自 PPT 的 4 问叙事脊柱，是"为什么 ECMAScript 长这样"的故事。也是 JS/TS/React 主题未来"补充章"的统一模板。

## A1 · 标准发展史 ——「为什么存在？」

- **定位**：PPT 第一章对应。讲清楚 ECMAScript 这个标准如何从"10 天写出的脚本"演化为今天 16 版的"通用编程语言标准"。
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
    - ES2016 → ES2025 共 10 个年度版本（详见 A5）
    - 2024-06：ES2024 第 15 版（RegExp v flag、Promise.withResolvers、ArrayBuffer transfer）
    - 2025-06：ES2025 第 16 版（最新）
- **底层逻辑要点**：
  - **ES4 失败是 TC39 流程的"创始创伤"**：因为试图一次发布过多激进特性，导致厂商无法实现/不愿实现。教训：**任何特性必须有"≥2 个引擎独立实现 + 充分 spec test 覆盖"才能进 Stage 4**。今天的 Records & Tuples（卡 Stage 2 三年）就是这个机制的体现。
  - **"标准滞后实现"是常态**：`Promise` 在 2012 jQuery thenable 已普及 → 2015 才进规范；`async/await` 2015 TypeScript 已实现 → 2017 才进规范。规范的角色是"事后追认社区共识"，不是"事先发明特性"。
  - **JS 没有"版本号"，只有"宿主支持的 ES 子集"**：你写的 `??` 运算符在 Node 14- 跑不起来，不是因为"代码是 ES2020 的"，而是因为运行时引擎没有这个语法/runtime 表。
- **应用场景**：
  - 老项目 polyfill 决策：搞清楚 corejs 和 babel-preset-env 的工作原理需要先理解"ES2015+ 是分散的特性集合，而不是一个版本"
  - 团队定 baseline：根据用户浏览器市场份额选 ES 版本（A5 详述）
  - 新人 onboarding：解释"为什么 JS 这么古怪"
- **陷阱**：
  - ⚠️ **不存在"ES4"**（编辑号空缺）；提到 ES4 必标"abandoned"
  - ⚠️ ES2015 ≠ ES6 是同一个东西（年份命名取代序号命名是 TC39 改革的一部分）
  - 把 "JavaScript" 和 "ECMAScript" 当同义词（前者是商标 + 实现 + DOM，后者只是核心语言规范）
- **关联章节**：A2（设计原则继承自 ES1）、A5（年度版本细节）、B1（规范怎么读）
- **预估字数**：5500-6500（含完整版本表）

## A2 · 设计原则与语言特性 ——「它是什么？」

- **定位**：PPT 第二章对应，但内容**系统化扩展到 PPT 未覆盖的核心设计**。讲 ECMAScript 的"基因"：三大灵感来源、原型对象模型、动态弱类型、词法作用域、错误处理、迭代协议、模块系统等"从 ES1 到 ES2025 的核心设计决策"。
- **与既有主题交叉的处理**：A2 涉及的所有具体机制（闭包、原型链、TDZ、Symbol 等）在 `javascript/` 都有详细章节。本章对每个机制做 **1-3 句话短重述 + 链回**，正文集中讲"为什么这样设计、当时有哪些选项、TC39 怎么选的"。
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
  - **类型系统**：
    - 8 个原始类型 + 引用类型
    - 装箱/拆箱（ToPrimitive / ToObject 的桥接）
    - 弱类型 = 任何类型转换都不报错（`+` 多义、`==` 抽象相等）
    - 动态类型 = 类型在运行时绑定到值，不绑定到变量
  - **作用域与闭包**：
    - 词法作用域（Lexical Scope）vs 动态作用域
    - 闭包形成的本质：函数对象记住了创建时的 `[[Environment]]`
    - **let/const 把"先声明后使用"从最佳实践变成语言强制约束**（PPT 标语）
    - TDZ 是怎么从规范层落到引擎实现的
  - **表达式优先**：JS 的 statement 极少，绝大部分构造都是 expression（如 IIFE、三元、逗号）
  - **错误处理设计**（PPT 未覆盖，规范层补全）：try/catch/finally 是 ES3 才加的（早期只有"出错就停"）；Error 类型层级；`throw` 任意值的容忍设计；ES2018 的 `try (error)` 可省略 binding；ES2022 的 Error.cause
  - **迭代协议设计**（PPT 未覆盖，规范层补全）：`Symbol.iterator`、`@@iterator`、Iterator vs Iterable、ES2015 引入迭代协议是为了统一 `for...of` / spread / 解构 / `Map` 构造等多个特性的"取下一个"
  - **模块系统设计**（PPT 未覆盖，规范层补全）：ES2015 ESM 的"静态结构"决策 vs CommonJS 的"运行时函数"——为什么 ESM 必须 top-level、为什么不能条件 import（除 dynamic import）、ES2022 Top-Level Await 的妥协
  - **Symbol 与扩展点设计**：ES2015 引入 Symbol 不只是"unique key"，更是为了让语言提供"可扩展协议钩子"（@@toPrimitive、@@hasInstance、@@iterator、@@asyncIterator 等 well-known symbols）
- **底层逻辑要点**：
  - **JS 不是"类的 Java"，是"原型的 Self"**——理解这一点能解释 90% 的"奇怪"行为：为什么 `[].constructor === Array` 而不是某个 class metadata；为什么 `instanceof` 检查的是原型链而不是名义类型；为什么修改 `Array.prototype` 会影响所有数组（monkey patch）
  - **ECMA-262 §4.3 自述**："originally designed to be used as a scripting language"——这句话解释了所有"宽容到出奇"的设计：自动分号插入、`==` 抽象相等、隐式转 string、对象自动装箱
  - **`let/const` 的 TDZ 是规范层主动加的"安全网"**：底层是 lexical environment 在 `let x` 上把 binding 标记为 uninitialized，访问时检查 → 这不是 V8 的实现技巧，而是规范要求
  - **闭包不是"高级特性"，是函数 + 词法作用域的必然产物**：JS 没有"闭包功能"，闭包是规范文本写出来的副作用
- **应用场景**：
  - 给 Java/C# 工程师讲 JS：从"原型 vs 类"切入最有效
  - 调试 `this` 丢失：理解词法作用域和动态 `this` 的差异
  - 老代码读懂"IIFE 模块模式"为什么这么写
- **陷阱**：
  - 把 `prototype` 和 `[[Prototype]]` 混为一谈
  - 以为 `class` 是新引入的东西（其实是原型链 + 构造器的语法糖）
  - 用 `==` 比较跨类型值
  - 在 var 时代踩 hoisting 坑后以为 let/const 也 hoist（其实 hoist 但 TDZ）
- **关联章节**：
  - JS 已有：`javascript/01-fundamentals/01-types`、`javascript/01-fundamentals/11-symbol`、`javascript/01-fundamentals/13-iterators`、`javascript/01-fundamentals/14-errors`、`javascript/02-advanced/02-closures`、`javascript/02-advanced/05-prototype`、`javascript/02-advanced/06-class`、`javascript/04-modules/01-esm`
  - 内部：A3（执行上下文是这套设计的"机器化"）、B2（数据类型规范精确定义）
- **预估字数**：6000-7000（系统化覆盖错误处理 / 迭代协议 / 模块系统 / Symbol 后增量）

## A3 · 执行模型 ——「机器怎么跑？」

- **定位**：PPT 第三章对应。把 A2 讲的"语言特性"翻译成"运行时机器结构"。**最难写的一章**——必须把 Realm / Agent / Job / ExecutionContext / EnvironmentRecord 这套规范术语讲透，否则后面 A4（异步）和 B5（spec 上下文章节）都没根。
- **与既有主题交叉的处理**：作用域/闭包/this/strict mode 在 `javascript/02-advanced/` 已详述。本章对这些机制做 **1-3 句话短重述 + 链回**，正文聚焦在"规范层怎么定义这个机器、Host 与 ECMA-262 的责任划分"。
- **关键知识点**：
  - **三层容器**：
    - **Agent**（≈ "线程"，主线程一个 Agent，每个 Worker 一个）：包含独立 Heap、Stack、Job Queue
    - **Agent Cluster**：能共享 SharedArrayBuffer 的一组 Agent
    - **Realm**（≈ "全局环境"）：每个 iframe / vm.createContext / Worker 一个 Realm，含独立的 `globalThis`、Intrinsics（`Array.prototype` 等）、global object
    - **Job**：宿主投递给 Agent 的执行单元（脚本、Promise reaction、async 函数 step）
  - **Execution Context**（执行上下文）：
    - 函数调用栈的最小单元
    - 内部槽：`[[Function]]` / `[[Realm]]` / `[[ScriptOrModule]]` / `LexicalEnvironment` / `VariableEnvironment` / `PrivateEnvironment` / `[[Generator]]`
    - "running execution context"（栈顶）和"execution context stack"
  - **Environment Record**（作用域链节点）：
    - Declarative / Object / Function / Module / Global EnvironmentRecord 五种
    - `[[OuterEnv]]` 链 = 词法作用域链
    - `ResolveBinding` 抽象操作沿链查找
  - **一次函数调用的完整生命周期**（PPT 精华页，章末小结）：
    1. Agent + Realm 建立
    2. 代码加载 + 全局执行（var hoisting / TDZ）
    3. 函数调用 → 创建 ExecutionContext + LexicalEnvironment
    4. 标识符解析（沿 OuterEnv 链）
    5. 闭包形成（函数对象捕获 Environment）
    6. 异步调度（Job Queue 投递）
    7. 多 Agent 协同（Worker + postMessage）
  - **strict mode 机制**（PPT 未覆盖，规范层补全）：`'use strict'` 不只是"严格模式"标志，规范层把 strict 信息存进 ExecutionContext 的 `[[Strict]]`、Reference Record 的 `[[Strict]]`，影响 `this` 默认值、`with`、`arguments` 同步、`delete` 行为、保留字。模块和 class body 自动 strict
  - **生成器与协程的暂停机制**（PPT 未覆盖）：`yield` 是怎么"暂停"函数的——规范用 `[[Generator]]` 内部槽 + GeneratorContext 把 ExecutionContext "挂起"，恢复时把它压回栈顶。这是 async/await 的底层
  - **模块加载与求值顺序**：`Source Text Module Record`、`[[CycleRoot]]`、async module 的 evaluation order（Top-Level Await 引入的复杂性）
  - **Host 与 ECMA-262 的责任划分**：哪些是规范定义的（如 Job 抽象）、哪些是宿主实现的（如 setTimeout、I/O、UI 渲染）；HostEnqueuePromiseJob、HostMakeJobCallback、HostFinalizeImportMeta、HostResolveImportedModule 等 hook 的存在意义
- **底层逻辑要点**：
  - **JS 不是"单线程"——是"单 Agent 默认"**：浏览器主线程是一个 Agent，每个 Worker 是另一个 Agent。共享 Heap 仅在 Agent Cluster + SharedArrayBuffer 才发生。
  - **闭包的实现 = 函数对象 + `[[Environment]]` 内部槽**：函数创建时把当前 LexicalEnvironment 存到 `[[Environment]]`；调用时这个 Env 成为新 Context 的 outer。这就是为什么内层函数能访问外层变量。
  - **var 的 hoisting 不是"编译时把声明搬到顶部"**：是函数调用时 `FunctionDeclarationInstantiation` 算法**在执行上下文创建阶段**把 var 名预先 bind 到 VariableEnvironment 上。规范层根本不存在"搬运"这个动作。
  - **Realm 隔离是 iframe / vm context 的本质**：跨 Realm 的 `Array` 不是同一个 `Array`，所以 `[] instanceof Array` 在跨 iframe 时会 false——这是"为什么 lodash 用 `Array.isArray`"的根因。
- **应用场景**：
  - 调试闭包内存泄漏：理解 `[[Environment]]` 引用为什么挂住整个外层 scope
  - Node `vm` 模块写沙箱：每个 vm context 是新 Realm
  - jsdom / happy-dom 测试环境：每个测试一个 Realm
- **陷阱**：
  - 以为函数有"this 作用域"（this 不在 LexicalEnvironment 里，在 ExecutionContext 上）
  - 以为闭包"复制"了变量（其实共享 Environment Record 的同一个 binding）
  - 跨 Realm 用 instanceof
  - 把"call stack"和"execution context stack"混为一谈（前者是 V8 实现术语，后者是规范术语）
- **关联章节**：
  - JS 已有：`javascript/02-advanced/01-scope-tdz`、`javascript/02-advanced/02-closures`、`javascript/02-advanced/03-this`、`javascript/01-fundamentals/13-iterators`（生成器）、`javascript/04-modules/01-esm`（模块求值）
  - 内部：A4（异步是 Job 在 Agent 上的调度）、B5（规范怎么写这套机器）
- **预估字数**：7000-8000（**最难章，含一次调用生命周期完整图 + strict mode + 生成器暂停 + Host hook 划分**）

## A4 · 异步演进 ——「单线程怎么并发？」

- **定位**：PPT 第四章对应。讲 ECMAScript 异步模型从"回调"到"Promise"到"async/await"再到"多线程"的演进路径。**与 `javascript/03-async/` 高度交叉**——本章对每个机制做 **1-3 句话短重述 + 链回**，正文聚焦"为什么这样演进、规范层怎么改、各 ES 版本的取舍"。
- **PPT 未覆盖、本章补全**：异步迭代器（`for await...of` + async generator）、AbortController 与可取消异步、async 函数的错误传播规则、Top-Level Await 的死锁检测、`Promise.try`（Stage 3 提案）、async dispose（ES2025 `await using`）。
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
  - **Promise 组合器**：`Promise.all`（短路失败）、`Promise.race`（短路任意 settle）、`Promise.any`（ES2021，短路成功）、`Promise.allSettled`（ES2020，全收集）、`Promise.withResolvers`（ES2024）
  - **async/await（ES2017）**：
    - Generator + Promise 的语法糖
    - 隐式 try/catch（await 表达式抛错变 reject）
    - Top-Level Await（ES2022 模块）
  - **多线程突破口**：
    - Worker（HTML 规范）→ 独立 Agent + 独立 Heap
    - SharedArrayBuffer（ES2017，Spectre 后被禁，2020 配合 COOP/COEP 重启）
    - Atomics（ES2017）
  - **异步迭代器与 async generator**（PPT 未覆盖）：`Symbol.asyncIterator`、`for await...of`、async function* —— 处理 SSE / 文件流 / 分页 API 的官方答案
  - **AbortController 与可取消异步**（PPT 未覆盖）：DOM 规范引入、ES 端通过 Promise reject 表达；为什么 ECMA-262 不直接定义"cancel"——与 Promise 不可逆性的设计张力
  - **async 错误传播规则**（PPT 未覆盖）：await 表达式抛错 → reject；finally 在 await 链中的语义；UnhandledPromiseRejection 的 host hook
  - **Top-Level Await 的死锁检测**（ES2022）：cycle + async module 组合时，规范如何检测并抛 SyntaxError / 运行时挂起
  - **资源管理：`using` / `await using`**（ES2025）：`Symbol.dispose` / `Symbol.asyncDispose`、栈式资源释放——异步资源的 RAII 答案
- **底层逻辑要点**：
  - **JS 单线程的根因不是 ECMA-262 规定，是 HTML/DOM 设计**：DOM 不是线程安全的；如果 JS 多线程，UI 就要锁。Worker 是"用 message passing 绕过共享状态"的折中。
  - **Promise 不是异步，是"延迟值"的容器**：你可以用 Promise 包同步值，then 仍然异步执行（HostEnqueuePromiseJob）——这才是 Promise 的核心抽象。
  - **微任务优先于宏任务的根因**：HTML 规范要求"每个宏任务执行完后清空 microtask queue 再继续"——这是为了让 Promise.then 在同一帧内连续调度，避免 UI 抖动。
  - **async/await 不是"暂停函数"，是 Generator 的状态机**：编译产物把每个 await 切成一个状态，await 后续代码作为 .then 回调注册。理解这点才能调试"为什么 async 函数 stack trace 不连续"。
  - **SharedArrayBuffer 是 JS 第一次真正引入"共享内存"**：Atomics 提供原子操作（Atomics.wait/notify），打开了多线程计算密集型应用的可能性（守护进程、计算密集）。
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
  - 内部：A3（Job 在 Agent 上的调度）、B5（HostEnqueuePromiseJob）
- **预估字数**：6500-7500（系统化补全 async iterator / AbortController / `using` / Top-Level Await 死锁后增量）

## A5 · 现代生态 ——「我今天该用什么版本？」

- **定位**：实战章。把 A1 的"年度版本表"翻译成"团队怎么定 baseline、打包器怎么配、polyfill 怎么选"。**不是 PPT 原内容**，是补充给现代工程师的实操章。
- **关键知识点**：
  - **TC39 Stage 流程详解**：
    - Stage 0 Strawperson（任何想法或讨论）
    - Stage 1 Proposal（正式提案，问题 + 方案）
    - Stage 2 Draft（首选方案，初始规范文本）
    - Stage 3 Candidate（推荐实现，充分测试）
    - Stage 4 Finished（≥2 引擎实现，纳入年度标准）
  - **ES2016-ES2025 全特性表**（按版本）
  - **打包器目标版本策略**（PPT slide 8）：
    - **客户端保守**：ES2020 baseline（可选链、空值合并、动态 import 已 99.9% 普及，面向公众 Web 应用）
    - **客户端激进 / Electron**：ES2024 — bundle 更小，用户环境可控，top-level await 可用
    - **服务端**：直接用 ES-Next 最新版（Node 22 LTS、Bun 全部支持，无需降级）
  - **runtime feature detection**：caniuse、kangax compat-table、MDN BCD
  - **polyfill vs transpile**：
    - Babel / SWC 降语法（target 控制）
    - core-js / regenerator-runtime 补 runtime API
    - 区别：`?.` 是语法（必须 transpile）；`Array.prototype.at` 是 API（必须 polyfill）
  - **Stage 3 提案当前快照（写作时点）**：
    - Records & Tuples（Stage 2，深 immutable，卡 3 年争议未决）
    - Pipeline Operator `|>`（Stage 2，争议大）
    - Decorator metadata（Stage 3，5.x 落地路径）
    - Iterator Helpers（Stage 4 ES2025，已落地）
    - Temporal（Stage 3，Date 替代品，浏览器 polyfill 中）
- **底层逻辑要点**：
  - **"目标版本"决策不是技术问题，是产品问题**：取决于用户群分布。To B SaaS 可以 ES2024；toC 大众产品保守 ES2020。
  - **Stage 3 不等于"可以用"**：Stage 3 才能用 polyfill 实验，但浏览器原生还没；Stage 4 才能假设原生有。
  - **Babel 的 `preset-env` + `core-js: 3` 是"按 browserslist 智能 polyfill"的事实标准**：理解 .browserslistrc 比改 Babel 配置重要。
- **应用场景**：
  - 团队 baseline 决策：根据 Sentry / Google Analytics 的浏览器分布数据
  - 老项目升级：从 ES5 + Webpack 4 到 ES2020 + Vite 的迁移路径
  - 写新库：决定 dist 的目标 ES 版本
- **陷阱**：
  - 把 polyfill 全打进主 bundle（没用 dynamic import）
  - target 设太高导致老用户白屏（没监控 SyntaxError）
  - 用 Stage 2 提案的语法（如 pipeline）—— 可能永远不进
- **关联章节**：
  - 内部：A1（版本历史）、B6（提案旅程 case study）
- **预估字数**：4500-5500

---

# Track B · ECMA-262 规范精读（6 章）

> 教读者把 800 页规范读懂的"元能力"。**不复述语言特性**——那是 `javascript/` 的工作。本轨只讲"规范的语法糖"。

## B1 · 怎么读规范 —— 元能力训练

- **定位**：规范阅读入门。读懂规范本身的"语法"。
- **关键知识点**：
  - **规范结构**：29 个 clause + 数个 Annex
  - **Normative vs Informative**：哪些段落是必须遵守的、哪些是给读者参考的
  - **Annex B 的特殊地位**：Web 兼容性遗留特性（HTML 注释 `<!-- -->`、字符串方法 like `.substr`、`__proto__` 访问器、正则 octal 转义）—— 浏览器必须实现，Node CLI 模式不必。**ECMA-262 标准内最违反"洁癖"的部分**。
  - **Editorial vs Normative**：编辑变更（不影响行为）vs 规范变更
  - **抽象操作（Abstract Operations）的命名约定**：CamelCase 是用户可见的（`Array.from`），无前缀的是规范内部（`ToObject`、`OrdinaryGet`）
  - **算法步骤记法**：
    - "1. Let _x_ be ..." → 局部变量
    - "If _x_ is ...,then ..." → 条件
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
- **延伸阅读**：[TC39 How We Work](https://tc39.es/process-document/)、[Spec Test 262](https://github.com/tc39/test262)
- **预估字数**：4000-5000

## B2 · 数据类型与值（§6）

- **定位**：覆盖 ECMA-262 §6.1（Language Types）+ §6.2（Specification Types）。
- **关键知识点**：
  - **Language Types**（用户可见）：Undefined、Null、Boolean、String、Symbol、Number、BigInt、Object（8 种）
  - **Specification Types**（规范内部，用户看不见）：
    - **Reference Record**（旧名 Reference Type）—— `obj.x` 表达式的中间结果，含 `[[Base]]`、`[[ReferencedName]]`、`[[Strict]]`
    - **Completion Record** —— 所有抽象操作的返回类型，含 `[[Type]]`(normal/break/continue/return/throw)、`[[Value]]`、`[[Target]]`
    - **Property Descriptor** —— `Object.getOwnPropertyDescriptor` 暴露的就是它
    - **Environment Record** —— 见 A3 / B5
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
- **关联章节**：A2、B3
- **预估字数**：4500-5500

## B3 · 抽象操作与算法记法（§5、§7）

- **定位**：把 §7 的核心抽象操作（type conversion、testing、object operations、operations on iterators）讲透。
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
- **关联章节**：A2、B2
- **预估字数**：4000-5000

## B4 · 内部槽与内部方法（§6.1.7、§10）

- **定位**：覆盖对象的 essential internal methods（`[[GetPrototypeOf]]` / `[[Get]]` / `[[Set]]` 等 11 个）+ ordinary vs exotic 区分。
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
- **关联章节**：A2、B5
- **预估字数**：4500-5500

## B5 · 可执行代码与执行上下文（§9）

- **定位**：覆盖 §9（Executable Code and Execution Contexts）的全部子章节。**与 A3 视角不同**：A3 是"语言机制"，B5 是"规范层数据结构"——讲 §9 怎么把这套机制写成 algorithm steps。
- **关键知识点**：
  - **§9.1 Environment Records** —— Declarative / Object / Function / Module / Global EnvironmentRecord 五种的方法签名
  - **§9.2 PrivateEnvironment Records** —— class private fields 的作用域链
  - **§9.3 Realms** —— `[[Intrinsics]]` 表（每个 Realm 一份 `Array.prototype`）、`[[GlobalObject]]`、`[[GlobalEnv]]`
  - **§9.4 Execution Contexts** —— stack 数据结构、running execution context
  - **§9.5 Agents** —— `[[CanBlock]]` / `[[Signifier]]` / `[[IsLockFree1]]` / `[[CandidateExecution]]`
  - **§9.6 Agent Clusters**
  - **§9.7 Forward Progress**
  - **§9.8 Jobs and Host Operations to Enqueue Jobs** —— HostEnqueuePromiseJob、HostEnqueueGenericJob、HostEnqueueTimeoutJob
  - **§9.9 InitializeHostDefinedRealm**
  - **§9.10 Source Text Module Records** —— ESM 的规范层（cycle handling、async module evaluation order）
- **底语逻辑要点**：
  - **§9 是规范里"机器视角"最浓的一章**：把 A3 讲的所有概念都翻成规范字段。
  - **Host Hooks 是规范层暴露给宿主（浏览器、Node）的扩展点**：`HostMakeJobCallback` / `HostPromiseRejectionTracker` / `HostFinalizeImportMeta` 等——这些 hook 决定了"为什么浏览器和 Node 行为不一样"。
  - **Module evaluation 是 ECMA-262 中最复杂的算法之一**：cycle 检测 + async module + top-level await 三者交织。
- **应用场景**：
  - 写 Node 内置模块 hook（`--experimental-loader`）需要懂 HostResolveImportedModule
  - 调试 Top-Level Await 死锁（cycle + async）
  - 给 jsdom / linkedom 等 DOM 实现写 polyfill
- **陷阱**：
  - 把 Job 等同于 microtask（其实 Job 包含很多种，microtask 是"PromiseJob + 类似物"的简称）
  - 以为 Realm 之间共享 Intrinsics（其实独立）
- **关联章节**：A3、A4
- **预估字数**：5500-6500（**最难章之一**）

## B6 · 提案 → 标准的旅程（Case Study）

- **定位**：综合实战章。**真实追踪一个特性从 Stage 0 到 §X 写入正文的完整路径**，让读者把 B1-B5 的"工具"用一遍。
- **候选 case**：
  - **Promise**（已 Stage 4，2015 进 §27.2）—— 历史价值高
  - **async/await**（已 Stage 4，2017 进 §15.8）—— 多步演化（Generator → async）
  - **Top-Level Await**（已 Stage 4，2022 进 §16.2.1.5）—— 跨 §9.10 + §27.2 多章节牵连，最能展示规范修改的复杂性
  - **Records & Tuples**（卡 Stage 2 三年）—— 反例，展示"为什么提案进不去"
  - **Iterator Helpers**（已 Stage 4，2025 进 §27.1）—— 最近案例
- **建议主线**：选 **Top-Level Await** 作为主 case（牵连 §9.10 + §27 + Module Records，内容丰富）+ **Records & Tuples** 作为反例（讲为什么卡）。
- **关键知识点**：
  - 提案仓库结构：README、explainer、polyfill、test262 case
  - Champion / Stage advancement requirements
  - Spec text 编写：`<emu-clause>` HTML、ecmarkup 工具
  - 跨章节修改：Top-Level Await 同时改了 §9.4、§9.10、§16、§27
  - 实施 timeline：V8 → SpiderMonkey → JSC → Node 集成
- **应用场景**：
  - 想给 TC39 提 PR 的工程师入门
  - 团队评估"要不要用 Stage 3 特性"时的决策框架
  - 解释"为什么这个 polyfill 这样写"
- **陷阱**：
  - 以为 Stage 4 = 所有引擎已实现（其实是"≥2 个引擎"）
  - 以为 polyfill 能 100% 还原原生行为（Top-Level Await 等无法 polyfill）
- **关联章节**：A1、A5、B1
- **预估字数**：5500-6500

---

## 写作约定

### Track A 章节强调"叙事"

- 用时间线、对比、人物、动机切入
- 每章末尾必须有"小结图"或"关键时间点表"
- 引用要找原始来源（Eich blog、TC39 meeting notes、proposal repo）

### Track B 章节强调"精确"

- 大量引用 §X.Y.Z 编号
- 抽象操作严格用规范名（`OrdinaryGet` 而非"属性查找"）
- 给出代码层和规范层的对照（"`obj.x` → `GetValue(Reference Record { ... })`"）

### 必须强调"独立性"的设计

- 每章 `延伸阅读` 末尾标 **Track A** 或 **Track B**
- A 章引用 B 章用"如果你也对规范层感兴趣 → B X"
- 严禁让读 A 必须先读 B（反之亦然）

### 必须明确标注 ⚠️ 的内容

- **ES4** 始终标 "abandoned 2008"
- **Annex B** 始终标 "web 兼容性遗留，非 web 环境可不实现"
- **Stage 0-2 提案** 始终标 "可能永远进不了标准"
- **SharedArrayBuffer** 始终标 "需 COOP/COEP 头才在浏览器可用"
- **`==`** 始终建议用 `===` 替代

---

## 风险提示

### 可能写不下去 / 容易翻车的章节

- **A3 执行模型**：Realm/Agent/Job/EnvironmentRecord 一旦讲不清，读者会迷路
- **B5 §9 上下文**：规范字段堆积如山，必须挑核心展开，不能全列
- **B6 case study**：选对 case 才能讲透；选错了变成"提案目录"

### 写作顺序建议（时间紧张）

- **第一批交付**：A1 + A2（读者立刻有完整 PPT 第一二章体验）
- **第二批**：A3 + A4 + A5（A 轨完整闭环）
- **第三批**：B1 + B2 + B3（规范阅读入门三件套）
- **第四批**：B4 + B5 + B6（高阶规范 + case study）

### 风险：A 轨复用到 JS / TS / React 时的坑

通用原则：**4 问骨架不变，但每个主题各自系统化补全**（不局限于 PPT 涉及的点）。每条交叉引用都按"短重述 + 链回"原则处理。

- **JS**：A 轨的 A2、A3、A4 与 `javascript/` 章节内容高度交叉 —— 复用 4 问模板时改成 V8/Engine 视角（Hidden Class、Inline Cache、TurboFan、Orinoco GC），机制细节链回 `javascript/` 对应章节，**正文聚焦"引擎为什么这样实现"**
- **TS**：A1 改成 TS 起源（2012 / Anders Hejlsberg / 微软 / structural typing 决策）；A2 讲设计哲学（gradual typing / 不引入运行时）；A3 改成 TS 编译流水线（parse → bind → check → emit）；**A4 改写为"类型层计算（type-level programming）"**——TS 的"并发"是类型推导的并行/递归
- **React**：A1 改成 React 起源（2013 / Facebook / 单向数据流 vs Angular 双向）；A2 讲 UI = f(state) 设计哲学；A3 改成 Fiber 架构（双缓冲、work loop、lane 模型）；A4 改成 Concurrent Mode + Suspense + Server Components

---

## 子代理报告

**最难写、最容易翻车**：A3 执行模型、B5 §9 上下文。建议把"一次函数调用的完整生命周期"画成文字版流程图（不依赖图片），读者能"逐行 trace"才算合格。

**可以快速产出**：A5 现代生态、B1 怎么读规范、B3 抽象操作。套路成熟、概念正交。

**最有价值的一章**：A1 标准发展史。这是 PPT 的精华，也是后续 JS/TS/React 复用模板的"母本"。**写好这一章 = 半个主题立起来了**。

**总规模估算**（考虑系统化补全后）：
- Track A：5500 + 6500 + 7500 + 7000 + 5000 ≈ **31,500 字**
- Track B：4500 + 5000 + 4500 + 5000 + 6000 + 6000 ≈ **31,000 字**
- 总计：**~62,500 字 / 11 章**，平均每章 5,700 字。比 TS（20 章 / 约 95,000 字）轻量 1/3，符合"轻量但系统"的设计目标。
