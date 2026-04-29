# V8 Engine 深度学习 · 章节大纲

> 本文件是 V8 主题的写作蓝本。**6 阶段 · 12 章**：先把 V8 在 JS 引擎史与生态中的位置讲清（P1），再沿编译流水线一路下行（P2-P3），然后翻面看内存（P4）、嵌入（P5）与跨语言（P6）。
> 编写日期：2026-04-29（首版）｜目标版本：V8 12.x（Chrome 124+ / Node 22 LTS）；历史回溯至 2008-09 首版。

---

## 元信息

- **目标编辑**：V8 12.x（2026 年初稳定线）。覆盖 2008-09 至 2025 全部主要架构演进；**Crankshaft / Full-codegen（2017 已退役）单独讲为重大重构案例**。
- **来源**：
  - [v8.dev/docs](https://v8.dev/docs)（官方文档：构建、内部架构、Embedder API、调试）
  - [v8.dev/blog](https://v8.dev/blog)（V8 团队技术博客，权威一手设计说明）
  - [v8.dev/blog/10-years](https://v8.dev/blog/10-years)（团队自述 10 年演化时间线）
  - [thlorenz/v8-perf](https://github.com/thlorenz/v8-perf)（社区整理的性能与 GC 文档合集）
  - Wikipedia [V8 (JavaScript engine)](https://en.wikipedia.org/wiki/V8_(JavaScript_engine))（用于版本表交叉核对）
  - V8 团队在 ChromeDevSummit / JSConf / Google I/O 的演讲（用于关键决策的背景理解）
- **目标读者**：已学完 `javascript/` `ecma/` 的研发工程师；理解 ECMAScript 规范定义"语义"，现在想知道 V8 怎么把规范变成"机器真的跑"。
- **不是这个主题的读者**：第一次写 JS 的人 —— V8 内部机制对他们来说没有 actionable 价值。

---

## 整体设计：6 阶段 · 沿数据流向铺开

V8 的故事天然有方向：**源代码 → 字节码 → 优化机器码 → 在堆上分配对象 → 被嵌入到宿主里跑**。我们就按这个数据流向走；中间穿插"为什么这样设计"。

| 阶段 | 章数 | 核心问题 |
|---|---|---|
| **P1 · V8 是谁** | 2 | 它怎么来的、和别的 JS 引擎差在哪、谁在用它 |
| **P2 · 编译流水线** | 3 | 一段 JS 怎么从源码走到机器码（Ignition / Sparkplug / Maglev / TurboFan / 反优化） |
| **P3 · 让动态语言变快** | 2 | 隐藏类 + 内联缓存：把 JS 的"动态"伪造成"静态" |
| **P4 · 内存与 GC** | 2 | 对象在堆上长什么样、Orinoco 怎么不卡主线程 |
| **P5 · 嵌入与诊断** | 2 | Isolate / Context / HandleScope；--trace-deopt / d8；V8 Sandbox |
| **P6 · V8 与 WASM** | 1 | V8 的 Wasm 实现（Liftoff + TurboFan + WasmGC），衔接独立的 WASM 主题 |

总计 **12 章 ≈ 75,000 字**，平均每章 6,200 字。

---

## 与既有主题的边界 ——「短重述 + 链回」原则

V8 是 `ecma/` 之后的"机器实现"层。和上游有大量重叠，必须明确划界：

> ✅ **短重述**：1-3 句话点出"它在规范层是什么 + 关键性质"
> ✅ **链回**：紧跟一句"详细的 X / Y / Z 请参考 [`ecma/{phase}/{chapter}`]"
> ❌ **不要**直接抄一遍 ECMA 那边的论述

**关键边界**：

| 概念 | 在哪讲透 | V8 主题里怎么处理 |
|---|---|---|
| Realm / Agent / Job | `ecma/07-execution/01-execution-model.html` | **短重述**规范定义，重点讲 V8 把它实现成 Isolate / Context / Microtask Queue |
| Reference Record / Completion Record | `ecma/04-data-types/01-data-types.html` | 链回，仅在 P2.2 讲 bytecode 时点出"Ignition 在字节码层处理这些" |
| Internal Methods（[[Get]] / [[Set]] / [[OwnKeys]]）| `ecma/06-internal-slots/01-internal-slots.html` | 链回，P3.1 重点讲"V8 用 Hidden Class 让 11 个 essential method 跑得快" |
| Property Descriptor | `ecma/04-data-types/01-data-types.html` | 链回，P3.1 讲 V8 怎么把 descriptor 编入 DescriptorArray |
| Event Loop / Microtask | `javascript/03-async/02-event-loop.html` + `ecma/07-execution/03-event-loop-async.html` | **短重述**，强调 V8 不拥有 EL，只拥有 microtask queue 的 enqueue/drain 机制 |
| §24 Memory Model / SAB / Atomics | `ecma/07-execution/05-memory-model.html` | 链回，P4 讲 V8 的具体堆布局如何承载 SAB |
| V8 hidden class（PPT 级介绍） | `javascript/02-advanced/05-prototype-deep.html`（带过） | 这里**展开**到 transition tree、in-object slots、descriptor array、slack tracking |
| async / await 用户视角语义 | `javascript/03-async/03-async-await.html` | P2.2 Generator 一节讲它的 V8 状态机实现（含 zero-cost desugar） |
| 怎么读 ECMA 规范 | `ecma/03-spec-reading/01-how-to-read.html` | P2.3 链回——本主题是"读懂规范之后看 V8 怎么实现"的延伸 |
| ECMAScript 标准发展史 | `ecma/01-standards/01-history.html` | P1.1 链回——V8 史与标准史是平行线 |
| WASM 全景 | 独立的 WebAssembly 主题（待写） | P6.1 仅讲 V8 的 Wasm pipeline 实现细节，不讲 wasm32 ISA 或 Component Model |
| JavaScriptCore / SpiderMonkey | `javascript/` 略提 + Bun 主题（讲 JSC） | P1.2 作为"V8 的同代人"在叙事中带出，不做 widget 式横评 |

---

## 内容覆盖原则 ——「v8.dev 是源头，社区博客做对照」

V8 的特点是：**官方文档相对薄但博客极厚**。v8.dev/blog 是 V8 团队工程师自己写的设计说明（Benedikt Meurer / Mathias Bynens / Toon Verwaest 等），权威性高于任何二手资料。

**3 条规则**：

1. **优先 v8.dev 一手**：每个机制的"权威原文"必须是 v8.dev 博客或 v8.dev/docs。社区博客只用来佐证或补充实测数据。
2. **版本号必标**：V8 改动激烈，没有版本号的论述不可信。每个特性必标"V8 X.Y 引入 / V8 X.Y 移除"。
3. **机器码示例只用 d8**：所有 `--print-bytecode` `--trace-deopt` `--trace-ic` 输出都要用读者本地能跑出的 `d8` 命令复现，不依赖 Chrome/Node 内部。

---

## 节奏建议

- **连读组**：
  - P1.1 + P1.2（项目史 → 引擎横评，是一条故事弧）
  - P2.1 + P2.2 + P2.3（流水线全景 → Ignition → 优化编译器三件套，必须连读）
  - P3.1 + P3.2（Hidden Class → IC，互为前提）
  - P4.1 + P4.2（堆布局 → GC，互为前提）
- **可独立跳读**：
  - P5.2 性能诊断是工具章，独立性强
  - P6 V8 与 WASM 可作为独立 WASM 主题的"前置 5 分钟"
- **建议阅读路径**：
  - 性能调优工程师：P2.1 → P3.1 → P3.2 → P5.2（够用了）
  - Node / 嵌入式开发者：P1 全读 → P5 全读
  - 引擎贡献者 / 学习者：全部按顺序

---

## 文件结构

```
v8/
  01-overview/                   (P1 · V8 是谁 · 2 章)
    01-history.html              ← V8 项目史 2008-2025
    02-engine-landscape.html     ← V8 vs JSC vs SpiderMonkey + 嵌入生态
  02-pipeline/                   (P2 · 编译流水线 · 3 章)
    01-pipeline-overview.html    ← Pipeline 全景 + Tier-up 机制
    02-ignition.html             ← Ignition 解释器 + Bytecode
    03-optimizing-compilers.html ← Sparkplug / Maglev / TurboFan + 反优化
  03-speedup/                    (P3 · 让动态语言变快 · 2 章)
    01-hidden-class.html         ← Map / Transition Tree / Property Storage
    02-inline-cache.html         ← Mono → Poly → Mega + Feedback Vector
  04-memory/                     (P4 · 内存与 GC · 2 章)
    01-heap-and-objects.html     ← Heap Layout + SMI + Tagged Pointer + Pointer Compression
    02-orinoco-gc.html           ← Parallel Scavenger + Concurrent Marking + Mark-Compact
  05-embedding/                  (P5 · 嵌入与诊断 · 2 章)
    01-embedder-api.html         ← Isolate / Context / Handle / Embedding V8
    02-diagnostics-sandbox.html  ← --trace-deopt + d8 + V8 Sandbox
  06-wasm/                       (P6 · V8 与 WASM · 1 章)
    01-wasm-pipeline.html        ← Liftoff + TurboFan + WasmGC（衔接独立 WASM 主题）
  index.html
  outline.md
```

---

# P1 · V8 是谁（2 章）

> 这一阶段不讲技术细节，只解决两个问题：V8 怎么走到今天、它在 JS 引擎家族里站什么位置。给后面所有"为什么这样设计"提供历史坐标。

## P1.1 · V8 项目史（2008-2025）

- **定位**：把 V8 17 年技术演化讲成一条主线 —— 不是按版本号流水账，而是按"每次架构突变及其根因"来组织。
- **关键知识点**：
  - **史前史（2006-2008）**：Lars Bak 在丹麦农场写 V8；Google 收购；命名取自肌肉车引擎；目标"让 web app 像桌面程序一样快"。
  - **第一阶段 · 2008-2014 · 单层 JIT 时代**：
    - 2008-09：V8 + Chrome 同步开源，初版仅 ia32 + ARM；**直接 JIT 无解释器**（Full-codegen）
    - 2009：x64 支持；Irregexp 正则引擎；**Node.js 诞生并嵌入 V8** —— V8 第一次走出浏览器
    - 2010-12：**Crankshaft 优化编译器**问世（机器码翻倍 / 体积 -30%）—— V8 正式有了"baseline + optimizer"双层
    - 2011：增量 GC、**Isolates 概念引入**（多线程隔离的基础）
    - 2013：Octane 2.0 基准；**Handle API 重写**（"Handlepocalypse"，破坏性 API 变更）
    - 2014：后台并发编译减少卡顿；**TurboFan 初版落地**（替代 Crankshaft 的下一代优化器）
  - **第二阶段 · 2015-2017 · 重构为现代管道**：
    - 2015：代码缓存、脚本流式加载；**Ignition 解释器启动开发**（目标：减小 Android 内存）；strong mode（失败的实验）
    - 2016：ES2015/2016 全特性落地；**Orinoco GC 启动**（并行 + 并发 + 增量）；获 ACM SIGPLAN 软件奖
    - **2017 年 V8 5.9 · 大重构**：Ignition + TurboFan 成为默认管道，**移除 Crankshaft + Full-codegen**；WebAssembly 正式启用 —— 这是 V8 史上最大的一次架构换骨
  - **第三阶段 · 2018-2025 · 多层管道精细化**：
    - 2018：Spectre 防护补丁；**Liftoff** —— Wasm baseline 编译器；BigInt 原始类型
    - 2020：**Pointer Compression**（64-bit 系统堆 -43%）—— 从此 V8 堆上限受 4GB 区域限制
    - 2021：**Sparkplug** —— non-optimizing JIT，bytecode → 机器码 1:1，无 IR；填补 Ignition 与 TurboFan 之间空档（+5-15%）
    - 2023：**Maglev**（M117 全平台）—— 中层优化器，编译速度比 TurboFan 快 10x，性能 80%；**Turboshaft**（TurboFan 后端重写，Chrome 120 后端编译速度 2x）；**WasmGC** 正式发布
    - 2024：**V8 Sandbox**（Chrome 123 默认开启）—— pointer cage + heap sandbox 阻断从 V8 漏洞升级到进程级 RCE
    - 2025：管道层级稳定为 4 层 **Ignition → Sparkplug → Maglev → TurboFan**
- **底层逻辑要点**：
  - **每次架构突变都有具体压力源**：Crankshaft 退役不是因为"过时"，是因为"跟不上 ES2015+ 新语法的优化需求"（class、generator、let/const 域、TDZ）；Sparkplug 的存在不是"还想再快一点"，是因为**Speedometer 衡量的是页面加载时段，那时 TurboFan 还没来得及 tier-up，必须有更快的 baseline JIT**。
  - **"删代码"和"加代码"一样重要**：2017 删 Crankshaft + Full-codegen 让 V8 团队腾出 30% 的工程精力投入 TurboFan；2024 V8 Sandbox 是把"修每一个内存安全 bug"换成"假设 bug 一定有，但限制其影响半径"。
  - **嵌入式生态拉动 V8 设计**：Node.js（2009）、Cloudflare Workers（2017）、Deno（2018）、Electron 都各自给 V8 提需求 —— Isolates 设计就是被 Workers 这种"一个进程跑成千上万 isolate"的场景驱动的。
  - **V8 史与 ECMAScript 标准史是平行线**：2008 V8 推出 → 2009 ES5 救场（V8 抢先实现）；2015 ES2015 → V8 同年完成 90% 落地；今天 TC39 提案进 Stage 3 后通常 V8 是第一个引擎实现。两条线互为驱动。完整 ECMAScript 标准史详见 [`ecma/01-standards/01-history.html`]
- **应用场景**：
  - 解释为什么 Node 升级 V8 时性能曲线突变（如 Node 16 → 18 引入 Sparkplug，启动快但稳态相当）
  - 评估 V8 漏洞（CVE）对生产环境的影响：是否在 Sandbox 范围内
- **陷阱**：
  - ⚠️ "V8 引擎"和"Chrome JS 引擎"不完全等同 —— Chrome 还有 Blink、Skia 等；V8 只是 JS / Wasm 部分
  - ⚠️ Crankshaft / Full-codegen 在 2017 已删，2018+ 的资料里出现这两个名字基本是过时博客
  - ⚠️ "V8 没有解释器"是 2015 之前的事 —— 现在 Ignition 是默认入口
- **关联章节**：P1.2（V8 的同代人与分身）、P2.1（4 层管道现状）、P2.3（优化编译器演化）、[`ecma/01-standards/01-history.html`]（ECMAScript 标准发展史，与 V8 史互为对照）
- **预估字数**：6,000-7,000（含完整版本表 + 关键 commit 节点）

## P1.2 · V8 的同代人与分身

- **定位**：V8 不是独自演化的。同时代有 JavaScriptCore、SpiderMonkey 各自走不同路；自己又被嵌进 Chrome / Node / Deno / Workers / Electron 这些差异极大的宿主里，每次嵌入都要做不同妥协。这一章想让读者看完后能回答两件事：**V8 的设计选择放到 JS 引擎史里是激进的还是保守的、不同 JS 宿主里的 V8 实际上是不是同一个 V8**。
- **关键知识点**：
  - **同代人 · JavaScriptCore (Apple)**：
    - 4 层管道 LLInt → Baseline → DFG → FTL（V8 直到 2023 才补齐 4 层）
    - FTL 后端早期用过 LLVM，后来换成自家 B3 —— 因为 LLVM 编译开销在 web 场景太重
    - 内存敏感（iOS 设备约束），Riptide GC 比 Orinoco 更激进地避免暂停
    - 嵌入哲学：作为 WebKit 的一部分发布，向外提供 ObjC / C API（Apple 平台第一公民）
  - **同代人 · SpiderMonkey (Mozilla)**：
    - 老牌：1995 由 Eich 本人写出第一版（比 V8 早 13 年）
    - 当代管道：Baseline Interp → Baseline JIT → IonMonkey → Warp
    - "研究驱动"特征明显——很多论文级优化先在 SM 试（如 Inline Threading、Type Inference）
    - 与 Rust 集成深（Servo / Stylo 用 SM 互操作）
  - **同代人 · Hermes (Meta)**：
    - 2019 发布，专为 React Native 移动端设计
    - **AOT bytecode 而非 JIT**——iOS 禁止动态代码生成，且移动端冷启动占主要时长
    - 设计选择：bundle 时把 JS 编成 bytecode，运行时只解释；牺牲稳态性能换启动速度
    - 反向证明了一件事：**JIT 不是必需的**；如果场景对启动敏感、稳态不敏感，AOT 是更好的选择
  - **设计选择对比**（不是"哪个更好"而是"在哪个轴上偏哪边"）：
    | 维度 | V8 | JSC | SpiderMonkey | Hermes |
    |---|---|---|---|---|
    | 解释器 | Ignition (register) | LLInt (low-level) | Baseline Interp | 唯一执行引擎 |
    | JIT 层数 | 4 | 4 | 3-4 | 0 |
    | 顶级 IR | Sea of Nodes / Turboshaft | B3 (旧版 FTL=LLVM) | MIR/LIR (Warp) | — |
    | GC | Orinoco | Riptide | GenGC | Hades |
    | 指针压缩 | 是 (4GB cage) | 否 | 否 | 是 (32-bit) |
    | 偏好 | 长跑稳态 | 内存 + 启动平衡 | 研究新机制 | 极致启动 |
  - **V8 自己的"分身史"**——同一份 V8 源码被裁出多种形态：
    - **Chrome / Edge**：完整 V8 + Blink Bindings + Renderer 进程沙箱 + V8 Sandbox 双层
    - **Node.js**：完整 V8 + libuv（Event Loop）+ N-API；Worker Threads = 多 Isolate；详见独立的 Node.js Runtime 主题
    - **Deno**：完整 V8 + Tokio（Rust 异步运行时）+ Web 标准 API；TypeScript 通过 swc 即时转译
    - **Cloudflare Workers**：V8 Isolate-per-tenant；冷启动 < 5ms（不是容器级隔离而是 Isolate 级）；这是 V8 设计中最被推到极限的用法
    - **Electron**：Chrome + Node 同进程；contextIsolation 控制 Renderer 是否能看到 Node 全局
    - **Bun（不在此列）**：用 JSC 不用 V8——详见独立的 Bun 主题
- **底层逻辑要点**：
  - **V8 在历史上是"激进派"**：JIT 4 层、Sea of Nodes、Pointer Compression、Sandbox——每个都不是首创但 V8 把它们做到生产规模。同代人的设计往往更稳健（JSC 内存优先、SM 研究优先）。
  - **嵌入式生态拉动 V8 设计而不是反过来**：Isolate API 在 2011 稳定是因为 Node 需要、Snapshot 是因为 Chrome 启动需要、V8 Sandbox 是因为 Cloudflare Workers 需要。V8 长期被嵌入需求驱动比被 Chrome 自身驱动更明显。
  - **Hermes 是"反 V8"的设计实验**：完全不做 JIT、专注 AOT bytecode + 极致启动——把 V8 走的路径反过来走。它的成功（React Native 落地）证明 V8 的多层 JIT 设计**不是普适最优**而是**特定场景最优**。
- **应用场景**：
  - 评估某个 JS bug 是 V8 自身问题还是嵌入器问题（如 Node 的 GC 行为 ≠ Chrome 的 GC 行为，因为 Node 跑长服务、Chrome 跑短交互）
  - 看 V8 release notes 时知道哪些特性会传到 Node、哪些只在 Chrome 里有（如 Chrome 专属的 V8 flag）
  - 理解 V8 漏洞的影响半径：CVE 在 Chrome 是问题但在 Node 可能不是（攻击面不同）
- **陷阱**：
  - ⚠️ "V8 等于 Chrome 的 JS 引擎"这个简化在 2026 已经不准——V8 现在是独立项目，Chrome 只是最大的客户之一
  - ⚠️ Hermes 不是"V8 精简版"，是另起炉灶的独立实现；它和 V8 没有共享任何代码
  - ⚠️ Cloudflare Workers 和 Lambda 都是"serverless"但架构层差一个数量级——Workers 是 Isolate-per-tenant（毫秒）、Lambda 是 Container-per-tenant（秒级）；V8 的设计直接决定了这种隔离粒度的可行性
  - ⚠️ JSC 也叫 Nitro / SquirrelFish——历史命名混乱，看老资料注意
- **关联章节**：P1.1（V8 项目史）、P5.1（Embedder API 是分身的接口层）、跨主题：Bun（JSC 详解）、Node.js Runtime（libuv + N-API + Worker Threads）
- **预估字数**：5,500-6,500

---

# P2 · 编译流水线（3 章）

> 这一阶段沿一段 JS 代码的旅程铺开：源码 → AST → bytecode → 优化机器码。先讲全景图（P2.1），再各自展开 Ignition（P2.2）和优化编译器三件套（P2.3）。

## P2.1 · Pipeline 全景与 Tier-up 机制

- **定位**：用一段最小化的 JS 代码（如 `function add(a, b) { return a + b; }` 调用 10000 次）跟踪它在 V8 内部走过的全路径。
- **关键知识点**：
  - **完整 4 层 + Parser**：
    ```
    Source ──► Parser ──► AST ──► BytecodeGenerator ──► Bytecode
                                                         │
                              (call counter ≥ T1)        ▼
                                                       Ignition (interpreter)
                                                         │
                              (call counter ≥ T2)        ▼
                                                       Sparkplug (1:1 JIT, no IR)
                                                         │
                              (hot loop / call counter ≥ T3)
                                                         ▼
                                                       Maglev (mid-tier SSA)
                                                         │
                              (very hot / Maglev tier-up flag)
                                                         ▼
                                                       TurboFan (Sea of Nodes / Turboshaft)
    ```
  - **Parser 工作分两段**：
    - **Lazy Parsing**：默认对所有顶层函数 only pre-parse（只做语法检查 + 找作用域），**不生成 bytecode**；只有真正被调用时才完整解析
    - **触发完整 parse 的条件**：函数被调用 / 显式 IIFE
    - **Why**：典型网页 JS 中 ~50% 函数从未被调用 —— lazy parsing 直接省掉这部分工作
  - **Tier-up 触发器**：每个函数 / 循环都有 call counter；越过阈值后 V8 异步触发下一层编译；编译完后**On-Stack Replacement (OSR)** 替换栈帧
  - **Concurrent Compilation**（V8 3.x 后逐步加固）：
    - Maglev / TurboFan 编译开销大（10ms-100ms 量级）—— 同步在主线程跑会卡 JS 执行
    - V8 给每种 tier 都开了 helper thread（`v8::Platform` 接口由 Embedder 提供线程池）—— 主线程只负责"提交编译任务 + 安装结果"
    - **后果**：从 V8 3.x 到 12.x 编译期 jank 持续下降；今天大多数应用感受不到 JIT 编译卡顿
    - **嵌入器角色**：Node / Chrome 自己实现 `v8::Platform`；Workers 等轻量 Embedder 可以用 V8 自带的 default platform
  - **反优化 (Deoptimization) 触发条件**：
    - **类型反馈失败**：之前假设参数是 SMI，结果传了 string
    - **Hidden Class 不匹配**：之前内联了 fast property access，但运行时 object shape 变了
    - **Map deprecated**：transition tree 中某个 Map 被标记 deprecated
    - **Eager deopt** vs **Lazy deopt**：前者立即跳回 Ignition；后者标记函数下次入口时跳回
  - **OSR 与 deopt 的栈帧兼容性**：Sparkplug 故意保持与 Ignition 同样的栈帧布局，让调试器 / profiler / 异常处理器**透明**穿越 tier 边界
- **底层逻辑要点**：
  - **多层 JIT 不是冗余而是分工**：每层管不同的"时间窗口" —— Ignition 管启动期、Sparkplug 管页面加载期、Maglev 管轻度循环、TurboFan 管深度优化。
  - **"为什么不直接上 TurboFan"**：TurboFan 编译开销极大（一段函数可能编译几十毫秒），如果每段代码都走 TF，启动会慢 10x。**JIT 设计的核心权衡是"编译开销 vs 稳态收益"**。
  - **2021 前后的 Pipeline 对比**：2017-2021 只有 Ignition + TurboFan 两层 → 启动后期 / 稳态前期有性能空档；Sparkplug + Maglev 把这个空档填掉了。
- **应用场景**：
  - 用 `--trace-opt` `--trace-deopt` 看一段函数在哪一层被优化、什么时候掉回去
  - 评估"为什么我加了 try/catch 后函数变慢" —— V8 12 之前 try/catch 阻止 TurboFan 编译
  - 启动时间敏感的应用（CLI 工具）：理解为什么 Sparkplug + 代码缓存 + snapshot 是关键
- **陷阱**：
  - ⚠️ "JIT 一定快" —— 错。冷启动期 Ignition 比刚编译完的 TurboFan 还快（编译开销）
  - ⚠️ deopt 不一定坏 —— 偶尔的 lazy deopt 是 V8 在适应运行时类型变化，是设计的一部分；只有**反复 deopt**（"deopt loop"）才是性能 bug
  - ⚠️ Lazy parsing 让 stack trace 行号有时不准（不完整 AST 没对齐源码行号）
- **关联章节**：P2.2（Ignition 详解）、P2.3（优化编译器三件套）、P3.2（IC 是 tier-up 的"神经系统"）、[`javascript/02-advanced/05-prototype-deep.html`]（Hidden Class / Packed-Holey 的入门级介绍——本章把它展开到 transition tree 与多层 JIT）
- **预估字数**：5,500-6,500

## P2.2 · Ignition 解释器与字节码

- **定位**：Ignition 是 V8 的"嘴巴"——所有代码先变 bytecode 再说。这一章讲它的设计哲学和字节码格式。
- **关键知识点**：
  - **Register-based VM**（vs JSC LLInt 的 stack-based）：
    - 每个函数有 N 个虚拟寄存器（accumulator + locals + parameters）
    - bytecode 操作显式引用寄存器：`Add r0, r1, [feedback_slot_2]`
    - 优势：减少 dispatch 次数（一条指令做更多事）；劣势：bytecode 体积稍大
  - **bytecode handler 用 CodeStubAssembler (CSA) 写**：
    - CSA 是 V8 内部的 portable assembler DSL（C++）
    - 每个 opcode 对应一段 CSA 代码 → 编译时生成所有平台的机器码 handler → 运行时 dispatch 到对应 handler
    - **Why**：纯 C++ handler dispatch 慢；纯汇编 handler 不可移植；CSA 是中间路线
  - **典型 bytecode 示例**（用 d8 `--print-bytecode` 跑出来）：
    ```
    function sum(a, b) { return a + b; }
    sum(1, 2);
    
    // Bytecode:
    LdaSmi.Wide [1]            // Load SMI 1 to accumulator
    Star r0                    // Store to register r0
    LdaSmi.Wide [2]            
    Star r1                    
    LdaUndefined               
    CallUndefinedReceiver2 r2, r0, r1, [4]   // [4] is feedback slot
    Return
    ```
  - **关键 opcode 类别**：
    - **Lda* / Sta***：Load / Store accumulator
    - **Add / Sub / Mul / Div**：算术（每个都带 feedback slot）
    - **LdaNamedProperty / StaNamedProperty**：属性访问（带 feedback slot）
    - **Call*（多种特化形式）**：根据 receiver / arg count 不同走不同路径
    - **Jump / JumpIfTrue / Throw**：控制流
  - **Feedback Vector**：每个函数的"运行时画像簿"
    - 每个 IC 站点对应一个 slot
    - slot 内容：上次见到的 Map（hidden class）+ 状态机（Uninitialized / Mono / Poly / Mega）
    - **Sparkplug / Maglev / TurboFan 都从这里读取类型反馈**
  - **替代了什么**：2008-2015 是 Full-codegen（直接 source → 机器码，无 bytecode）；2017 完全切到 Ignition。**好处**：内存 -50%（bytecode 比机器码小 4-8x）、统一了所有 tier 的输入。
  - **Code Cache & Script Streaming**（启动期优化的两条腿）：
    - **Code Cache**（V8 4.2+，2015 起）：首次执行某段脚本时把 bytecode + 编译元数据序列化到磁盘；下次同源脚本直接 deserialize，跳过 parse + bytecode generation。Chrome 把它存在 HTTP 缓存旁；Node 把它放进 `compileFunction` API 暴露给嵌入器
    - **Script Streaming**（V8 4.6+）：网络下载 JS 时**边下载边解析**——不等整个脚本到达就开始 parsing，主线程下载完时 parsing 也基本完成
    - 两者配合的效果：典型大型 SPA 启动期 V8 工作量 -30%
    - **Cache 失效条件**：V8 版本变更、源码 hash 变更、flag 变更；命中失效时静默回退到完整 parse
  - **Generator / Async Function 怎么编**（状态机化）：
    - JS 规范里 `function* foo() { yield a; yield b; }` 是 suspend/resume 语义；V8 把它编译成**带状态字段的状态机**
    - bytecode 里出现 `SuspendGenerator` / `ResumeGenerator` 指令；每次 yield 把当前 register 状态存入 generator object，下次 resume 时还原
    - **Async function**：在规范层是"自动调用 await 的 generator"；V8 把它 desugar 成 generator + Promise hook 组合（V8 7.0+ 之前是 desugar，之后 V8 直接给 async 一组专门的字节码避免中间 Promise 分配）
    - **Async/Await Zero-cost**（V8 7.0，2018）：async 调用比同义 promise.then() 快约 11×、内存少 -2.5×
  - **Strict Mode / TDZ 在 bytecode 层**：
    - `'use strict'` 是 SourceTextModule 级别 flag，影响 bytecode 生成时哪些 helper 被调用（如 strict 下 `this` 不自动盒装）；不是单独 opcode
    - **Temporal Dead Zone**（let / const）：bytecode 用 `ThrowReferenceErrorIfHole` 做未初始化检查；这就是 let/const 比 var 慢一点点的根因
  - **内置函数（Builtins）不走这条路**：
    - `Array.prototype.map` / `Object.assign` / `String.prototype.split` / `Promise.then` 这些**不是 JS 写的**；是 V8 自己的代码，预编译成机器码嵌进 Snapshot
    - 写法分两代：早期用 **CodeStubAssembler (CSA)**——C++ 内嵌的汇编 DSL；现在用 **Torque**——TypeScript 风格的高级 DSL，编译器生成 CSA 调用
    - **Why Torque**：CSA 容易写错且无类型；Torque 强类型 + 结构化控制流 + 直接对应 ECMAScript 规范步骤号（如 `// 6.4.1.1 Step 3` 的写法）
    - **Snapshot Embedded**：Builtins 在 V8 编译期就生成机器码，启动时通过 mmap 进 Isolate；调用 builtins ≈ 调用 native function，没有 JIT 开销
    - **意义**：JS 程序里看着像"标准库函数调用"的东西，背后是 V8 的 C++ 团队精心写的、被几十亿台设备每天执行数万亿次的核心代码——所以 V8 团队对 builtins 性能近乎偏执
- **底层逻辑要点**：
  - **bytecode 是 V8 内部的"通用语言"**：Sparkplug 把 bytecode 1:1 翻译成机器码、Maglev 从 bytecode 构建 SSA、TurboFan 从 bytecode 构建 sea of nodes。**所有优化层共享一个起点**——这是 2017 大重构的核心收益。
  - **Feedback Vector 是 IC 与编译器之间的桥**：Ignition 在每次执行时更新它；编译器读它做 speculation；运行时不一致时触发 deopt。
  - **"为什么 V8 12 之前 try/catch 阻止 TF"**：早期 TF 不支持 bytecode 的 exception handler 表 —— 直接放弃整个函数。这是历史包袱，2024 已修复。
- **应用场景**：
  - 用 `node --print-bytecode-filter=sum --print-bytecode script.js` 看自己的函数被编译成什么
  - 优化建议：函数变小让 lazy parsing 更高效；避免不必要的闭包（每个闭包是独立 feedback vector）
- **陷阱**：
  - ⚠️ bytecode 在不同 V8 版本间**不兼容** —— 不要保存 bytecode 缓存到磁盘期望跨版本可用（V8 自己的 code cache 会校验版本）
  - ⚠️ Wide opcode（`.Wide` `.ExtraWide` 后缀）是 16/32-bit 操作数的扩展，不是不同语义
  - ⚠️ 看 bytecode dump 的时候 register 编号是相对函数开始的偏移，不是绝对位置
- **关联章节**：[`ecma/04-data-types/01-data-types.html`]（Reference Record / Completion Record）、[`javascript/03-async/03-async-await.html`]（async/await 用户视角语义——本节讲它的 V8 状态机实现）、P2.3（编译器从 bytecode 起步）、P3.2（Feedback Vector 与 IC）
- **预估字数**：6,500-7,500（已扩充：+ Code Cache + Generator 状态机 + Builtins/Torque）

## P2.3 · 优化编译器三件套：Sparkplug / Maglev / TurboFan

- **定位**：V8 现在有 3 层 JIT，每层都有不同的 IR、不同的优化目标、不同的编译速度 / 性能权衡。这一章讲清三者的边界。
- **关键知识点**：
  - **Sparkplug**（2021 引入）：
    - **零 IR 设计**：核心结构是 `for (each bytecode) switch (opcode) emit_machine_code()`，没有 IR、没有 SSA、没有寄存器分配
    - **栈帧与 Ignition 兼容**：profiler / debugger / OSR 不需要任何特殊处理就能穿越
    - **不做优化但也不慢**：因为消除了 bytecode dispatch + register decoding 开销，**5-15% 性能提升**
    - **Why 没有更早做**：因为只有等 Ignition 稳定后才有"忠实复刻"的对象 —— Crankshaft 时代没有 bytecode 中间层
  - **Maglev**（2023，Chrome M117 全平台）：
    - **SSA + CFG**（不是 sea of nodes）：所有变量唯一定义、控制流图明确
    - **单一 IR、最少 pass**：从 bytecode 一步构建 SSA，做轻量优化（escape analysis 简化版、constant folding、dead code）
    - **比 TurboFan 快 10x 编译，性能 80%**：填补 Sparkplug 与 TurboFan 之间空档
    - **Why SSA 而非 sea of nodes**：sea of nodes 优化能力强但调度复杂；Maglev 故意选简单 IR 换更快编译
  - **TurboFan**（2014 引入，2024 后端换成 Turboshaft）：
    - **Sea of Nodes IR**：节点表示值 + 控制流，依赖边显式 —— Cliff Click 1995 论文那个
    - **优化遍**：inlining → escape analysis → loop peeling → load elimination → instruction selection → register allocation → code emission
    - **type feedback 驱动 speculation**：从 Feedback Vector 读"这里 99% 是 SMI" → 内联 SMI fast path → 错了 deopt
    - **Turboshaft 后端**（2024+）：替换 sea of nodes 的后端阶段（指令选择 / 调度 / 寄存器分配），编译速度 2x，**前端仍是 sea of nodes**
  - **3 层对比表**：
    | 维度 | Sparkplug | Maglev | TurboFan |
    |---|---|---|---|
    | IR | 无 | SSA + CFG | Sea of Nodes |
    | 编译速度 | 极快（无优化） | 快（10x of TF） | 慢 |
    | 稳态性能 | baseline (~Ignition + 5-15%) | ~80% of TF | 100% baseline |
    | 反优化 | 不会（直接掉回 Ignition） | 可以 | 可以 |
    | 内存开销 | 中（机器码 ~3x bytecode） | 中-高 | 高 |
  - **反优化（Deoptimization）机制**：
    - **Eager deopt**：检查失败立即跳回 Ignition；用 deopt entry 表记录 bytecode offset
    - **Lazy deopt**：标记 code 失效，下次进入时跳回；多用于"假设别处的 code 不会改但实际改了"
    - **OSR (On-Stack Replacement)**：把当前 stack frame 从优化版本换成 Ignition 版本，逐 register 拷贝；反向也成立（Ignition → optimized）
- **底层逻辑要点**：
  - **3 层不是"备份"是"分工"**：Sparkplug 给所有代码用、Maglev 给中频代码用、TurboFan 给热点代码用。**总编译时间 ≈ (Sparkplug 编译 N% 函数) + (Maglev 编译 N/10 函数) + (TF 编译 N/100 函数)** —— 比单独跑 TF 快得多。
  - **Sea of Nodes 强大但难调试**：节点之间无显式顺序，scheduling 在最后做。Turboshaft 改回 CFG-based 后端就是为了"更易理解、更快编译、更易加新优化"。
  - **deopt 不是 bug 是设计**：JIT 编译器假设运行时类型固定，错了就退回。**关键是不要"反复 deopt-reopt"**（Maglev / TF 编译开销极大）。
- **应用场景**：
  - 用 `--trace-deopt` 找出反复 deopt 的函数 → 通常是某处 hidden class 漂移
  - 用 `--trace-opt-verbose` 看 TurboFan 的优化决策（inlining / escape analysis）
  - 性能调优范式：让函数走"monomorphic + 不引入 megamorphic IC + 不触发 deopt"
- **陷阱**：
  - ⚠️ Maglev / TurboFan 都不能保证某段代码"被编译" —— V8 自己根据 budget 决定。强行让 TF 编译某函数：`%PrepareFunctionForOptimization` + `%OptimizeFunctionOnNextCall`（仅 d8 / `--allow-natives-syntax`）
  - ⚠️ "deopt 多就一定慢" —— 错。**少量 lazy deopt 是正常的"类型适应"**；只有 deopt loop 才是问题
  - ⚠️ 不要混淆"编译"和"执行" —— TurboFan 编译花 50ms，但执行可能是几纳秒一次
- **关联章节**：P2.1（Tier-up 机制）、P3.2（Feedback Vector 与 IC 是编译器输入）、P5.2（--trace-deopt 工具）、[`ecma/03-spec-reading/01-how-to-read.html`]（学规范是为了能对照 V8 实现——本章是规范读懂之后看 V8 的延伸）
- **预估字数**：6,500-7,500

---

# P3 · 让动态语言变快（2 章）

> JavaScript 在规范层是动态的：对象可以随时加属性、函数可以随时被传给任何参数。V8 的核心魔法是**用 Hidden Class + Inline Cache 把"动态"伪造成"静态"** —— 让大多数代码享受 C 风格的属性访问速度。

## P3.1 · Hidden Class（Map / Transition Tree）

- **定位**：V8 实现 ECMAScript Object Internal Methods 的关键数据结构。讲清"为什么 JS 对象访问能跟 C 结构体一样快"。
- **关键知识点**：
  - **三件套数据结构**：
    - **Map**（即 hidden class）：每个 object 第一字段，标识"形状"
    - **DescriptorArray**：Map 共享，记录每个属性的名字 + storage location（in-object slot 或 backing store index）+ attributes
    - **TransitionArray**：Map 之间的边，记录"如果加属性 X 则转到 Map Y"
  - **Transition Tree**：
    ```
    {} (Map_0)
     │ +x
     ▼
    {x} (Map_1)
     │ +y
     ▼
    {x, y} (Map_2)
     │ +z
     ▼
    {x, y, z} (Map_3)
    ```
    所有 `{x, y, z}` 形状的 object **共享 Map_3** —— 内存占用极低且 Map 比较 = 指针比较
  - **属性存储 3 档**：
    - **In-object properties**（前 3 个）：直接存在 object 字段里，访问 = 一次 load
    - **Fast properties**（4+）：存在 backing store 数组，descriptor 给出 index
    - **Dictionary mode**：当属性数量超过阈值 / 频繁 delete / 名字奇怪时**降级成 hash table**
  - **从 ECMA Internal Method 到 V8 实现**：
    - `[[Get]] (P, Receiver)` 规范步骤一堆 → V8 把它编译成"Map check + offset load"两条指令
    - `[[Set]] (P, V, Receiver)` → "Map check + transition lookup + store"
    - `[[OwnPropertyKeys]] ()` → 遍历 DescriptorArray
  - **'const' 标注与编译时内联**：
    - 如果一个属性从未被改（V8 跟踪），DescriptorArray 把它标 `const`
    - TurboFan 看到 `const` 直接把值内联进机器码（如 `obj.foo` 编译成 `mov eax, 42`）
    - 后来如果属性变了 → Map deprecated → 触发 deopt
  - **属性添加顺序的代价**：
    ```js
    // 慢：两个 object 走不同 transition path
    const a = {}; a.x = 1; a.y = 2;
    const b = {}; b.y = 2; b.x = 1;
    // a 的 Map 和 b 的 Map 不同 —— IC 站点会 polymorphic
    
    // 快：相同顺序 → 相同 Map
    const a = {x: 1, y: 2};
    const b = {x: 1, y: 2};
    ```
  - **数组也有 Map**（"Elements Kind"）：
    - **PACKED_SMI** → **PACKED_DOUBLE** → **PACKED_ELEMENTS**（一旦混入 string / object 就回不去）
    - **HOLEY_*** vs **PACKED_***：稀疏数组（如 `[,1,,3]`）走 holey 慢路径
  - **Slack Tracking**（V8 处理"不知道最终多少属性"的妥协）：
    - **问题**：构造对象时 V8 不知道用户最终会加多少属性 —— 给少了后期要走 backing store 慢路径，给多了浪费内存
    - **方案**：初始 Map 上带一个 **construction counter**（默认 7），新对象**多预留 8 个 in-object slot**；每构造一次计数器递减
    - 计数归零后 V8 认为构造模式稳定，**填 filler 对象占住没用的 slot**，下次 GC 时这些 filler 被回收，Map 收缩到实际用量
    - 典型例子（v8.dev 给的）：`Peak` 对象初始 52 字节（10 slot），slack tracking 完成后缩到 20 字节（2 slot）
    - **意义**：Hidden Class 优化的代价之一是"如何在不知道未来的情况下做 layout 决策"——slack tracking 是 V8 给出的"先乐观给多、再观察实际、最后回收"的工程式答案
- **底层逻辑要点**：
  - **Hidden Class 是"动态语言静态化"的核心**：把 ECMAScript 规范允许的"任意属性 / 任意值"约束到运行时常见模式 —— **大多数对象的属性集合在创建后不变**。Map 共享让这件事既快又省内存。
  - **transition tree 是单向的且不可逆**：一旦走到一个 Map，就再也回不去（即使删了属性也不会回到旧 Map），所以 delete 是 V8 性能反模式。
  - **Dictionary mode 是 fallback**：性能比 fast 慢 5-10x；V8 18+ 加了 SwissNameDictionary 让降级后没那么惨。
- **应用场景**：
  - 类似 `class Point { constructor(x, y) { this.x = x; this.y = y; } }` 的工厂模式 —— 让所有实例走同一 transition path
  - **避免** `delete obj.foo` —— 用 `obj.foo = undefined` 替代
  - **避免**在构造函数里有条件赋值（`if (x) this.foo = x`）—— 让 transition tree 分叉
  - 数组优化：避免空洞（不用 `arr[1000] = x` 跳过 999 个 slot）；不要在 SMI 数组里塞 NaN
- **陷阱**：
  - ⚠️ 看到"V8 优化对象"博客时注意年代 —— 2017 之前可能讲 Crankshaft 的 hidden class 优化（与今天的 Map 系统差异不大但实现细节不同）
  - ⚠️ class 不是魔法 —— `class Foo { ... }` 和 `function Foo() { ... }` + prototype 在 V8 内部是同一套 Map 机制
  - ⚠️ `Object.assign({}, src)` 创建的对象走"normalized 路径"，性能不如直接 `{...src}`（V8 11+ 已优化但仍有差异）
- **关联章节**：[`ecma/06-internal-slots/01-internal-slots.html`]（Internal Methods 规范定义）、[`ecma/04-data-types/01-data-types.html`]（Property Descriptor）、[`javascript/02-advanced/05-prototype-deep.html`]（Hidden Class / Packed-Holey 入门——本节展开到 transition tree + slack tracking）、P3.2（IC 用 Map 做 key）
- **预估字数**：6,500-7,500（已扩充：+ Slack Tracking）

## P3.2 · Inline Cache：Mono → Poly → Mega

- **定位**：IC 是连接 Hidden Class 与编译器的桥。每个属性访问 / 函数调用站点都有一个 IC，在运行时积累"我见过哪些形状"，再喂给优化编译器做 speculation。
- **关键知识点**：
  - **IC 的 4 个状态**（按 Feedback Vector slot 中状态机）：
    - **Uninitialized**：从未执行过
    - **Monomorphic**：只见过 1 种 hidden class（**最快**：单次 Map check + 直接 offset load）
    - **Polymorphic**：见过 2-4 种 hidden class（**仍快**：链式 Map check）
    - **Megamorphic**：见过 5+ 种（**放弃 IC**：走全局 hash table 查询，**与未优化无异**）
  - **典型 IC 站点**：
    - **LoadIC**：`obj.foo`
    - **StoreIC**：`obj.foo = x`
    - **CallIC**：`f()`（区分 receiver 形状 + 函数指针）
    - **InstanceOfIC** / **InIC** / **TypeOfIC** / **CompareIC** 等
  - **从 Mono 升到 Poly 再到 Mega 的实例**：
    ```js
    function getX(obj) { return obj.x; }
    
    getX({x:1});       // IC: Mono (Map_A)
    getX({x:2});       // IC: Mono (Map_A) ← 同形状
    getX({x:1, y:2});  // IC: Poly (Map_A, Map_B) ← 加了 y，新 Map
    getX({x:1, z:3});  // IC: Poly (Map_A, Map_B, Map_C)
    getX({x:1, w:4});  // IC: Poly (4 maps)
    getX({x:1, q:5});  // IC: MEGA ← 5+ maps，放弃缓存
    ```
  - **Sparkplug / Maglev / TurboFan 各自的 IC 形态**：
    - **Ignition**：每条 IC 字节码运行时查 Feedback Vector
    - **Sparkplug**：内联 IC stub 调用，每次仍走 stub
    - **Maglev**：根据 Feedback Vector 内联 fast path（mono 时直接 inline，poly 时生成 switch）
    - **TurboFan**：完全内联到 sea of nodes 中，可能 inline 到调用方函数
  - **Feedback Vector 与编译触发**：
    - V8 用 IC 状态做 speculation：编译时看到 "100% mono on Map_A" → 内联 Map_A 的 fast path → 假设保持
    - 如果运行时见到 Map_B → trigger lazy deopt → 跳回 Ignition → 重新积累 feedback → 可能下次编译为 poly
  - **megamorphic 怎么救**（如果你必须支持多形状）：
    - **手动分离**：写多个特化函数（`getXForCircle` `getXForSquare`）让每个 IC mono
    - **统一 shape**：用 base class + 子类，但所有属性在 base 中初始化
    - **不可救场景**：通用 deserializer / 反射库 —— 接受 megamorphic 现实
- **底层逻辑要点**：
  - **IC 是 V8 的"神经系统"**：所有优化决策都依赖 IC 收集的运行时形状信息。
  - **mega 不是末日**：megamorphic IC 走 stub 查询仍比纯解释执行快 —— 只是没有了 Hidden Class 带来的 1-2 条指令神话。
  - **"先访问哪个属性"会让 IC 不同**：`obj.x; obj.y;` vs `obj.y; obj.x;` 如果两次的 obj shape 不同，会让两个 IC 的 polymorphic 状态不同。但这种差异通常微秒级，**只有在极热路径上才值得纠结**。
- **应用场景**：
  - **何时该担心 megamorphic IC**：每秒调用 100 万次 + IC 命中 mega → 累计影响 > 1ms
  - **DevTools Performance 找 megamorphic**：用 `--trace-ic` + grep "MEGAMORPHIC"
  - **库设计**：避免在公共 API 上接受任意 shape 对象 —— 强制用 class 或 typed object
  - **JSON 解析后的对象**：所有同源 JSON 走同 transition path → mono；混合 schema 的 JSON → poly/mega
- **陷阱**：
  - ⚠️ 不要为了 mono 把所有对象设计成同 shape —— 大多数代码热度不够，过度优化 = 复杂度
  - ⚠️ `Object.create(null)` 创建的 object 不走 prototype 链 IC，性能特征不同（但通常更快）
  - ⚠️ Symbol 属性走专门的 IC 路径，不和字符串属性共用 slot
  - ⚠️ Proxy 对象**完全跳过** IC —— 任何 Proxy 操作都是慢路径（Proxy 详细机制见 [`ecma/06-internal-slots/01-internal-slots.html`]）
- **关联章节**：P3.1（Hidden Class 是 IC 的 key）、P2.3（编译器读 Feedback Vector）、[`ecma/06-internal-slots/01-internal-slots.html`]（Proxy 与 IC 的关系）
- **预估字数**：5,500-6,500

---

# P4 · 内存与 GC（2 章）

> Hidden Class 让属性访问快，但**对象本身的内存表示**和**何时回收**是另一组独立问题。这一阶段讲 V8 的堆布局、对象编码、Pointer Compression、Orinoco GC。

## P4.1 · 堆布局与对象表示

- **定位**：V8 在堆上怎么放对象、怎么压缩指针、怎么把 SMI 塞进指针位。这一章讲清"V8 堆是什么样子"。
- **关键知识点**：
  - **Heap 分代结构**：
    - **Young Generation (NewSpace)**：小、新对象、Scavenger 频繁回收（默认 16MB-64MB）
      - 又分 **From-space** 和 **To-space**（Cheney 半空间复制）
    - **Old Generation**：大、长寿对象、Mark-Compact 偶尔回收
      - **Old Pointer Space**（含指针的对象）
      - **Old Data Space**（不含指针的对象，如长字符串）
    - **Code Space**：JIT 编译产物（机器码）
    - **Map Space**：Hidden Class（Map 对象）单独区域
    - **Large Object Space**：> 大于 spaces 的对象（典型 1MB+）
    - **Trusted Space** / **Trusted Code Space**（V8 Sandbox 引入）
  - **Tagged Pointer**（V8 表示一切的方式）：
    - 64-bit 系统：每个 V8 值是 64-bit 字
    - 最低位 = 0 → **SMI** (Small Integer)，剩 31 位整数（compressed pointer 模式下）
    - 最低位 = 1 → **HeapObject 指针**（实际指向堆，地址按 4 字节对齐所以低位为 0；运行时 -1 还原）
  - **SMI（Small Integer）的代价**：
    - 31-bit signed range：-2^30 到 2^30 - 1
    - 超出 → 升级成 **HeapNumber**（堆上 8 字节 IEEE 754 double）
    - 数组下标、循环计数器都希望落在 SMI 范围
  - **Pointer Compression**（V8 8.0+，2020）：
    - **问题**：64-bit 系统的指针字段占 8 字节，但 V8 堆 < 4GB → 高 32 位都一样
    - **方案**：在虚拟地址空间预留 4GB 区域（**isolate cage**），所有堆对象住在里面；对象内部指针字段用 **32-bit offset** 表示
    - **效果**：堆 -43%、指令 cache 命中率提升、SMI 改成 31-bit（与压缩指针一致）
    - **代价**：堆上限 4GB（之前可以无限）；进入 isolate 时要计算 base
  - **HeapObject 通用 layout**：
    ```
    [ Map pointer (4B) ]    ← Hidden Class（即 [[Class]]）
    [ Properties (4B)  ]    ← 指向 properties backing store 数组
    [ Elements (4B)    ]    ← 指向 elements backing store（数组元素）
    [ in-object slot 0 ]    ← 前 N 个属性直接存这里
    [ in-object slot 1 ]
    ...
    ```
  - **String 表示**（多种）：
    - **SeqOneByteString**：纯 ASCII 单字节
    - **SeqTwoByteString**：UTF-16
    - **ConsString**：a + b 字符串拼接的"延迟链表"（不立即合并）
    - **SlicedString**：另一字符串的子串（共享 backing）
    - **ExternalString**：指向 V8 外部内存（嵌入器分配）
    - **InternalizedString**：去重的字符串池（用于属性名）
  - **Mutable Heap Numbers**（V8 11+）：
    - **问题**：HeapNumber 不可变 → 每次浮点数变化都新分配
    - **方案**：当 V8 确定一个 HeapNumber 只被一个 object 引用时，让它 mutable，原地更新
  - **Conservative Stack Scanning**（V8 11.2+，2023）：
    - **背景**：V8 GC 一直是**精确式**——每个栈位置都要精确知道是否是指针。这要求编译器维护精确的 stack maps，复杂且慢
    - **做法**：GC 扫描栈时，**把所有"看起来像指针的字"都当作潜在 root**——可能多保留一些对象（保守），但允许编译器丢掉 stack maps
    - **为什么现在能这么做**：Pointer Compression 让指针只能落在 4GB cage 内，"看起来像指针"的判断准确率极高；误判保留的对象很少
    - **收益**：编译器代码简化、Maglev 编译速度可观提升；为 V8 与 Cppgc / Oilpan 互操作铺路
- **底层逻辑要点**：
  - **"V8 中的 number"是 SMI ⊎ HeapNumber 的 union**：算术热路径上 V8 会做 SMI fast path（无堆分配），溢出回 HeapNumber。
  - **Pointer Compression 为 V8 Sandbox 铺路**：当所有指针都是 32-bit offset 时，corruption 影响范围**天然限制在 4GB cage 内**。
  - **Large Object Space 不参与 compaction**：大于 ~1MB 的对象单独分配单独管理；但不能 promote 也不能 compact —— 大数组 / 大字符串导致碎片是常见问题。
- **应用场景**：
  - 内存敏感场景下避免 HeapNumber：保持整数运算（`Math.floor` / `| 0`）
  - 大字符串：知道 ConsString 是惰性合并 —— `for (s += chunk)` 在 V8 不会每次都拷贝（直到 access 时）
  - Buffer / TypedArray 用 `ArrayBuffer` —— 这个 backing 在 ArrayBuffer Allocator 那层（嵌入器决定）而非 V8 堆
- **陷阱**：
  - ⚠️ Pointer Compression 的 4GB 上限是 **per-isolate** 不是进程；多 isolate（Workers）互不影响
  - ⚠️ `--max-old-space-size=N` 设置的是 Old Gen 上限；总堆 ≈ Old + 1.5×Young + Code + ...
  - ⚠️ ConsString 内存延迟释放 —— 切片大文本可能让源字符串永不能 GC（用 SlicedString 也有类似问题，需要 `flatten`）
- **关联章节**：P4.2（GC 在这些 space 上工作）、[`ecma/04-data-types/01-data-types.html`]（Number Type / String Type 规范）、[`ecma/07-execution/05-memory-model.html`]（SAB / Atomics）
- **预估字数**：6,000-7,000

## P4.2 · Orinoco GC：Parallel + Concurrent + Incremental

- **定位**：Orinoco 是 V8 的 GC 项目代号（2016 启动，至今仍在演进）。把"stop-the-world 单线程 GC"重构成"主线程几乎不停"。
- **关键知识点**：
  - **分代假说**（Generational Hypothesis）：大多数对象死得早 → 把堆分代，短命的频繁回收，长命的偶尔回收。
  - **Minor GC（Young Gen）—— Parallel Scavenger**：
    - 算法：**Cheney 半空间复制**（From-space → To-space，活的对象拷过去，死的丢弃）
    - V8 6.2+：**Parallel Scavenger**，多线程 work stealing
    - 主线程暂停时间：**~1-3ms**（典型）
    - **Promotion**：在 young gen 里活过 N 次（默认 2）的对象升到 old gen
  - **Major GC（Old Gen）—— Concurrent Mark-Compact**：
    - **3 阶段**：Marking → Sweeping → Compacting
    - **Marking**（找活对象）：从根集合（栈、全局、handle）出发遍历指针图
      - **Concurrent Marking**（V8 6.4+，2018）：marking 在 helper thread 上做，主线程几乎不停
      - **Incremental Marking** 兜底：如果 concurrent 没赶上，主线程做小步增量
    - **Sweeping**（回收死对象空间）：
      - **Concurrent Sweeping**：helper thread 标记 free list，主线程不停
    - **Compacting**（消除碎片，可选）：
      - **Parallel Compaction**：多线程同时移动对象 + 更新指针
      - 不是每次都做（成本高）
  - **Write Barrier 与 Remembered Set**：
    - **问题**：Minor GC 只看 young gen，但 old gen 可能持有指向 young gen 的指针 —— 不能漏掉
    - **方案**：每次"old → young 写指针"时记录到 **Remembered Set**（实现为 card table 或精确 slot 集）
    - Minor GC 时把 Remembered Set 当作"额外 root"
  - **Incremental Marking 与 Tri-color Abstraction**：
    - White：未访问 / 死
    - Grey：已访问但子节点未访问
    - Black：已完全处理
    - 增量过程：每次只走一小段，主线程让出后下次接着；用 **Snapshot-At-The-Beginning (SATB)** 写屏障保证不漏。
  - **GC 调优旋钮**（Node 命令行）：
    - `--max-old-space-size=N`（MB）：old gen 上限
    - `--max-semi-space-size=N`（MB）：young gen 半空间大小
    - `--gc-interval=N`：每 N 次分配触发一次 GC（debug）
    - `--trace-gc` `--trace-gc-verbose`：打印每次 GC 详情
  - **Cppgc / Oilpan 与 V8 的"双堆协作"**：
    - **Oilpan** 是 Blink（DOM）用的 C++ GC；2020 后从 Blink 抽出，独立成 V8 的 **Cppgc** 库
    - **场景**：DOM 节点（C++ 对象）和 JS 包装对象（V8 堆对象）互相引用——光靠 V8 GC 看不到 C++ 端，光靠 Oilpan 看不到 JS 端，谁都不能独立判断对象是否可回收
    - **方案**：**Unified Heap** 跨堆引用追踪——V8 marking 阶段会回调进 Cppgc 让它继续标记 C++ 对象图；Cppgc 的 marker 同样会回调进 V8。两边并发运行，最后双方都达成"全图标记完成"
    - **TracedReference\<T\>**：Embedder 用这个 handle 类型表示"C++ 持有 V8 对象"——参与 unified marking
    - **Conservative Stack Scanning** 是 Unified Heap 的前置：因为 C++ 端栈本来就只能保守扫
    - **意义**：这是 V8 工程上最复杂的协作之一；Chrome 内存表现的好坏一半看 V8 一半看 Oilpan
- **底层逻辑要点**：
  - **"主线程几乎不停"是 Orinoco 的核心叙事**：传统 mark-sweep 在长串引用上能 stop world 几百毫秒；并发 + 并行 + 增量三件套把这个降到 ~10ms 内（heavy WebGL 游戏暂停 -50%）。
  - **GC 的代价分布**：年轻代 GC 极频繁（每秒数十次）但每次 1-3ms；老年代 GC 罕见（分钟级）但每次更长。**性能优化基本只关注年轻代频率**。
  - **Write Barrier 的隐藏开销**：每次"指针写"都有几条额外指令检查 Remembered Set —— 这是分代 GC 的固定税。
- **应用场景**：
  - 用 Chrome DevTools Memory Profiler 抓 heap snapshot → 找意外的 retainer
  - 用 `--trace-gc` 看 GC 频率、暂停时间、young/old 比例
  - 内存泄漏定位：不是"代码没释放"而是"代码无意持有了指针"（典型：闭包引用大对象）
  - 服务端 Node 应用：调大 max-old-space-size（默认 1.5GB-4GB 视 Node 版本）
- **陷阱**：
  - ⚠️ "强制 GC"的 `global.gc()` 只在 `--expose-gc` 标志下可用；生产**不要用** —— 你不比 V8 知道更多
  - ⚠️ 大数组 promote 到 old gen 后**不会被 promote 回 young** —— 意味着短暂的大数组也走重 GC 路径
  - ⚠️ FinalizationRegistry / WeakRef 不保证立即调用 finalizer（V8 把它放在 idle task 里），不要用作资源释放（详见 [`ecma/06-internal-slots/02-reflect-meta.html`]）
  - ⚠️ DevTools Memory Profiler 抓的是"逻辑 retain 图"，和 V8 实际堆布局不完全对应
- **关联章节**：P4.1（堆 layout 是 GC 工作对象）、[`ecma/06-internal-slots/02-reflect-meta.html`]（WeakRef / FinalizationRegistry 的规范定义）、Node.js Runtime 主题（讲 Node 的 GC 调优）
- **预估字数**：6,500-7,500

---

# P5 · 嵌入与诊断（2 章）

> V8 不是命令行工具，是个 C++ 库。它的真正用户是 Chrome / Node / Deno / Workers / Electron。这一阶段讲怎么把 V8 嵌入进 C++ 程序、怎么用工具诊断生产代码。

## P5.1 · Embedder API：Isolate / Context / Handle

- **定位**：从 C++ 视角看 V8。Embedder API 是 Node / Deno / Workers 通用的接入面 —— 理解它就理解了"为什么 Worker Threads = 多个 Isolate"。
- **关键知识点**：
  - **核心对象层级**：
    ```
    v8::Isolate            ← 一个独立的 V8 实例（自己的堆、GC、optimizer）
       │
       ├── v8::Context     ← JS 的全局执行环境（≈ Realm）
       │   ├── globalThis
       │   ├── built-ins (Object, Array, Promise, ...)
       │   └── 用户代码
       │
       ├── v8::HandleScope ← Local handles 的生命周期容器（栈分配）
       │
       └── v8::Persistent  ← 跨函数/跨 scope 持有的引用
    ```
  - **Isolate（≈ ECMAScript Agent）**：
    - 一个 thread 在任意时刻只能进入一个 Isolate（用 `Isolate::Scope`）
    - 多个 thread 想进同一 Isolate 必须用 `Locker` / `Unlocker`
    - **Workers 模型**：每个 Worker 一个 Isolate，相互完全隔离
  - **Snapshot · Isolate 启动加速的核心**：
    - **没有 Snapshot 时**：每次 Isolate 启动要从零执行所有 built-ins 的 JS / Torque 代码——构造 `Object.prototype`、`Array.prototype`、`Promise.prototype` 上几百个方法等等。冷启动 ~50-100ms
    - **Startup Snapshot**：V8 build 时把上述构造完的堆状态序列化成一段二进制；启动时直接 mmap 进新 Isolate，跳过所有 built-ins 初始化。冷启动降到 ~3-5ms
    - **Custom Snapshot / Embedder Snapshot**：嵌入器还能把"业务级别的初始化"（如 React framework 的初次模块加载）也烤进 snapshot；运行时启动直接得到一个"已加载好框架"的 Isolate
    - **Cloudflare Workers 的核心 trick**：每个 isolate 启动 < 5ms 就靠 Snapshot + Pointer Compression（cage 共享底层布局）
    - **Code Cache vs Snapshot**：Code Cache 缓存的是用户脚本 bytecode；Snapshot 缓存的是 V8 built-ins 堆状态。两者正交，Chrome 同时用两者
    - **跨版本不兼容**：Snapshot 格式与 V8 commit hash 强绑定；任何 V8 升级都要重新生成
  - **Promise / Microtask Hooks**：
    - Embedder 通过 `Isolate::SetPromiseHook` 注册 Promise 生命周期回调（init / resolve / before / after）—— Node 的 `async_hooks` 就是包这层
    - `Isolate::PerformMicrotaskCheckpoint` 由 Embedder 主动调用 —— 因为 V8 不拥有 Event Loop，**microtask drain 时机由宿主决定**（Node 在每个 task 结束时 drain；浏览器在 task + 渲染前 drain）
    - 详见 [`javascript/03-async/02-event-loop.html`] 与 [`ecma/07-execution/03-event-loop-async.html`] 的规范层论述
  - **Context（≈ ECMAScript Realm）**：
    - 一个 Isolate 内可以有多个 Context（如 iframe、Node vm 模块、Workers）
    - 每个 Context 有独立的 globalThis 和 built-ins，但**共享底层 Map / 函数**
    - 跨 Context 调用：Embedder 必须显式 `Context::Enter()` / `Context::Exit()`
    - 详细规范请参考 [`ecma/07-execution/01-execution-model.html`]
  - **Handle 系统**（GC 安全的指针）：
    - 直接持 raw pointer 不安全 —— GC 移动对象后 pointer 失效
    - **Local<T>**：栈上临时引用，归 HandleScope 管理（scope 销毁时全部释放）
    - **Persistent<T>**：堆上长期引用，必须显式 `.Reset()`；GC 移动对象时由 V8 更新这些指针
    - **Eternal<T>**：永不释放（如 hidden global）
    - **TracedReference<T>**：Cppgc / Oilpan 集成的 traced 引用
  - **HandleScope 生命周期**：
    ```cpp
    void DoWork(Isolate* isolate) {
      HandleScope scope(isolate);  // 创建栈上 scope
      Local<String> str = String::NewFromUtf8(...);  // 进入 scope
      // ... 使用 str ...
    }  // scope 销毁，str 失效
    ```
  - **嵌入 V8 的最小代码骨架**：
    ```cpp
    V8::InitializeExternalStartupData(...);
    Isolate::CreateParams create_params;
    create_params.array_buffer_allocator = ArrayBuffer::Allocator::NewDefaultAllocator();
    Isolate* isolate = Isolate::New(create_params);
    {
      Isolate::Scope isolate_scope(isolate);
      HandleScope handle_scope(isolate);
      Local<Context> context = Context::New(isolate);
      Context::Scope context_scope(context);
      Local<String> source = String::NewFromUtf8Literal(isolate, "1 + 1");
      Local<Script> script = Script::Compile(context, source).ToLocalChecked();
      Local<Value> result = script->Run(context).ToLocalChecked();
      // ...
    }
    isolate->Dispose();
    ```
  - **C++ ↔ JS 互调**：
    - **FunctionTemplate** / **ObjectTemplate**：定义 C++ 暴露给 JS 的对象 / 函数
    - **N-API**（Node.js 自家抽象）：在 V8 之上再封一层 ABI 稳定接口（V8 升级不破坏 native module）
    - **NAPI vs node-addon-api vs raw V8**：选择因素是"是否要绑定特定 Node 版本"
- **底层逻辑要点**：
  - **Isolate 是隔离的最强保证**：JS 代码绝无可能跨 Isolate 看到对方的对象 —— 这是 Workers / Cloudflare Workers / Lambda@Edge 的安全基础。
  - **Context 比 Realm 概念更"软"**：规范的 Realm 强调 built-ins 不共享，但 V8 的 Context 在 Map 层共享 —— 实际是"看似隔离实则部分共享"，攻击者用 prototype pollution 能跨 Context（详见 P5.2 sandbox 一节）
  - **Snapshot 是工程奇迹**：Chrome / Node 启动时如果每次都从 0 构造 built-ins 会慢几十毫秒；Snapshot 把构造结果序列化到磁盘，启动时直接 mmap 进堆，毫秒级。
- **应用场景**：
  - 写 N-API 原生模块（如 `node-sqlite3` / `bcrypt`）
  - 自己嵌入 V8（如 game engine / database stored procedure 引擎）
  - 理解 Worker Threads 的限制：postMessage 必须 structured clone 或 transfer，因为对方是另一个 Isolate
- **陷阱**：
  - ⚠️ 忘记 HandleScope → 内存泄漏（Local<T> 永不释放）
  - ⚠️ 跨 thread 直接传 Isolate → 崩溃；必须 Locker
  - ⚠️ Persistent 忘记 Reset → 永久 retain，对象永不被 GC
  - ⚠️ Snapshot 在不同 V8 版本间不兼容（每个 V8 版本要重新生成）
- **关联章节**：[`ecma/07-execution/01-execution-model.html`]（Realm / Agent 规范定义）、Node.js Runtime 主题（N-API + Worker Threads 详解）、P1.2（嵌入生态横向）
- **预估字数**：6,000-7,000

## P5.2 · 性能诊断与 V8 Sandbox

- **定位**：工具章。讲 V8 给开发者的诊断接口（命令行 flag、d8 工具、--trace-* 系列），以及 V8 Sandbox 这个 2024 重大安全里程碑。
- **关键知识点**：
  - **V8 命令行 flag 全景**（适用于 Node / d8 / Chrome 启动参数）：
    - **诊断字节码 / 编译产物**：
      - `--print-bytecode` `--print-bytecode-filter=funcName`
      - `--print-code` `--print-opt-code`
      - `--print-deopt-stress`
    - **追踪 IC / Tier-up**：
      - `--trace-ic`（Mono → Poly → Mega 转换）
      - `--trace-opt`（TurboFan/Maglev 编译事件）
      - `--trace-deopt`（反优化事件）
      - `--trace-turbo`（生成 turbo.json 用于 Turbolizer 可视化）
    - **GC 追踪**：
      - `--trace-gc` `--trace-gc-verbose` `--trace-gc-nvp`
    - **内存调整**：
      - `--max-old-space-size=N`（MB）
      - `--max-semi-space-size=N`（MB）
    - **危险用途**（仅 d8 / `--allow-natives-syntax`）：
      - `%PrepareFunctionForOptimization(f)` + `%OptimizeFunctionOnNextCall(f)` + `%CompileBaseline(f)`
      - `%HaveSameMap(a, b)`（确认两 object 同 hidden class）
      - `%DebugPrint(obj)`（dump V8 内部表示）
  - **d8 工具**：
    - V8 自带的 minimal shell（不含 Node API、不含 DOM）
    - 用法：`d8 --print-bytecode foo.js`
    - 何时用：测试 V8 行为而非 Node 行为；复现 V8 bug
  - **Turbolizer**（Web 工具）：
    - 输入：`--trace-turbo` 生成的 turbo.json
    - 输出：可视化 Sea of Nodes IR 各个 phase 的演化
    - 适用：调试 TurboFan 编译输出 / 学习编译器
  - **Linux perf + V8 perf integration**：
    - `--perf-prof` 让 V8 把 JIT 代码符号写到 `/tmp/perf-<pid>.map`
    - perf 调用栈能看到 JS 函数名（而非 `0x12345`）
  - **V8 Inspector Protocol**：
    - V8 暴露的调试 / profiling 协议（即 Chrome DevTools Protocol 的 V8 子集）
    - Node 的 `--inspect` flag 启动这个；DevTools / VSCode 通过 WebSocket 连接
    - 不要和 Node Inspector npm 包混淆（那是包装层）
  - **V8 Sandbox**（2024 默认开启）：
    - **威胁模型**：假设 V8 总会有内存安全 bug（OOB read/write、UAF）→ 不再追求"零 bug"，而是限制 bug 的影响半径
    - **机制**：
      - **Pointer Cage**：所有 V8 堆指针都是 4GB 区域内的 32-bit offset → 攻击者腐蚀指针只能在 cage 内乱窜
      - **External Pointer Table**：指向 cage 外的指针（如 ArrayBuffer backing、code pointer、function trampoline）通过 indirection table 访问，每个 entry 有 type tag → 防止 type confusion
      - **Code Pointer Table** + **Trusted Space**：JIT 代码地址通过特殊 table 间接调用，防 ROP
    - **效果**：从 V8 漏洞升级到 RCE 需要再绕过 Sandbox（额外漏洞）；Chrome 把 V8 Sandbox 加进 VRP 奖励范围
    - **代价**：~1% 性能开销；要求 64-bit 系统（cage 需 1TB 虚拟地址）
- **底层逻辑要点**：
  - **诊断工具的统一哲学**：V8 把所有内部状态都暴露成 `--trace-*` flag —— 因为 V8 团队自己也用这些 flag 调试。
  - **V8 Sandbox 反映的是工程现实**：60% 的 V8 漏洞是内存安全问题；与其把每个 bug 都修死（不可能），不如让 bug 不致命。这和 Chrome Site Isolation、iOS App Sandbox 是同一思路。
  - **生产环境与 d8 的差异**：Node 的 V8 嵌入有 N-API、libuv、worker threads 这一堆抽象；d8 是 minimal V8 —— 复现某些 perf 问题在 d8 里看不见。
- **应用场景**：
  - 性能调优工作流：
    1. `--trace-deopt` 找反复 deopt 的函数
    2. `--trace-ic` 找 megamorphic IC 站点
    3. `--trace-turbo` + Turbolizer 看 TurboFan 是否真的内联
    4. `--trace-gc` + Memory Profiler 看 GC 频率与 retainer
  - 安全审计：评估某 V8 CVE 是否在 Sandbox 范围内
  - 嵌入器开发：用 Inspector Protocol 给自己的运行时加 debug 支持
- **陷阱**：
  - ⚠️ `--trace-ic` 输出极大（每个 IC 站点每次状态变化都打）—— 用 grep 过滤
  - ⚠️ `--allow-natives-syntax` 只能用于测试 / 学习 —— `%XXX` 函数在生产环境不可用且会破坏其他优化
  - ⚠️ V8 Sandbox **不是**进程沙箱；不能替代 OS-level isolation。Chrome Renderer 进程沙箱仍存在，V8 Sandbox 是额外一层
  - ⚠️ Turbolizer 依赖于 V8 当前版本的 IR 格式 —— 跨版本可能跑不起来
- **关联章节**：P2.3（--trace-deopt 配合 deopt 机制）、P3.2（--trace-ic 配合 IC）、P4.2（--trace-gc 配合 Orinoco）、Browser Rendering 主题（Chrome Site Isolation）
- **预估字数**：6,000-7,000

---

# P6 · V8 与 WASM（1 章）

> 这一章是与独立的 WebAssembly 主题之间的"接口章"——只讲 V8 怎么实现 Wasm，不讲 wasm32 ISA / Component Model 等通用 Wasm 知识（那些在 WASM 主题）。

## P6.1 · V8 的 Wasm 编译流水线

- **定位**：把 V8 的 4 层 JS 管道和 2 层 Wasm 管道（Liftoff + TurboFan）放在一起对比。
- **关键知识点**：
  - **Wasm 双层管道**：
    - **Liftoff**（2018 引入）：baseline 编译器，wasm bytecode → 机器码 1:1，无 IR
      - 类似 JS 的 Sparkplug：极快编译换更慢稳态
      - 启动时**所有函数同步编译为 Liftoff** → 无解释器，所以"启动 = 编译完所有函数"
    - **TurboFan**（共享 JS 路径）：复用 sea of nodes，跑长期热点 wasm 函数
    - **Tier-up**：和 JS 一样，hot 函数从 Liftoff 提到 TurboFan
  - **WasmGC**（2023 正式）：
    - 让 Java / Kotlin / Dart / Scala 这些"托管语言"能高效编译到 wasm
    - V8 直接用 Orinoco 管理 wasm GC 对象（不再通过 JS 包装）
    - 性能：Java/Kotlin/Dart 编译版**约为 wasm 直接版的 2x**（vs 之前编译到 JS 慢几个数量级）
  - **V8 Wasm 与 JS 的互操作**：
    - **Imports / Exports**：wasm 模块通过 import 拿到 JS 函数 / 内存；export 暴露 wasm 函数给 JS
    - **JS Promise Integration (JSPI)**（2025 Stage 4）：让同步 wasm 调用异步 JS API（如 fetch）
    - **Reference Types**（externref / funcref）：让 wasm 持有不透明的 JS 对象引用
    - **跨边界调用开销**：early V8 是 ~100ns，今天 ~10ns；vs 普通 JS call ~1ns —— 仍有"边界税"
  - **Wasm 内存模型与 V8 堆**：
    - Wasm 线性内存是 ArrayBuffer（V8 外部内存，不在 cage 内）
    - WasmGC 对象在 V8 堆内（受 Pointer Compression / Sandbox 保护）
  - **Memory64**（提案 Stage 4，V8 11+ 实现）：
    - **背景**：原 wasm 线性内存用 32-bit index，上限 4GB；图像处理 / 大型应用 / 数据库引擎不够用
    - **方案**：扩展到 64-bit index，理论上限 16 EB（实际取决于宿主可分配地址）
    - **代价**：每次 memory access 多用一条指令做 64-bit bound check；V8 在 fast path 上做了优化但仍有 ~5-15% 性能损失
    - **意义**：让 SQLite-WASM、duckdb-wasm、ffmpeg.wasm 这些大数据应用真正能用 wasm 跑生产负载
  - **跨主题边界提示**：wasm32 ISA、wat 文本格式、WASI、Component Model、Rust/Go/AssemblyScript 编译路径等通用 Wasm 知识，详见独立的 WebAssembly 主题；这一章只覆盖"V8 怎么实现 Wasm"
  - **Spectre 防护对 Wasm 的影响**：
    - 2018 后 V8 给 wasm 加了 process isolation（Site Isolation）+ guard pages
    - SharedArrayBuffer 在 wasm threads 中需要 COOP/COEP（详见 [`ecma/07-execution/05-memory-model.html`]）
- **底层逻辑要点**：
  - **wasm 没解释器是因为它本身就是 bytecode**：JS 的 Ignition 把源码翻译成 bytecode；wasm 直接是 bytecode 形式 → V8 跳过翻译，直接 Liftoff 编译。
  - **WasmGC 的真正意义不是"快"，是"语言生态"**：在它之前 Kotlin/wasm 必须自带 GC（包体大、性能差）；现在直接复用 V8 GC。
  - **wasm 在 V8 内部"和 JS 共享一切"**：堆、GC、TurboFan、debugger、profiler —— 都是同一套，只是入口不同。
- **应用场景**：
  - 评估某段 wasm 应用的启动时间：所有函数编译完才能跑 vs JS 边解释边跑（lazy parsing）
  - 选择 wasm vs JS：极算术密集（图像/音频/物理）肯定 wasm；逻辑密集 / 调用密集（DOM 交互）JS 更优
  - WasmGC 落地：Kotlin Multiplatform、Dart Web、Scala.js 都在迁移
- **陷阱**：
  - ⚠️ wasm 启动 ≠ JS 启动 —— 一个 100MB wasm 模块要花数秒编译（即使 Liftoff），即使你只调用 1 个函数
  - ⚠️ wasm 不是"沙盒里的 JS" —— 是独立 ISA、独立内存模型、独立 spec
  - ⚠️ wasm-to-JS 调用比 JS-to-wasm 调用慢（V8 优化方向不对称）
- **关联章节**：[`ecma/07-execution/05-memory-model.html`]（SAB / Atomics / COOP-COEP）、独立的 WebAssembly 主题（wasm32 ISA / WASI / Component Model）、P2.3（Liftoff 与 Sparkplug 设计哲学相似）
- **预估字数**：5,500-6,500

---

## 附：参考资料汇总

**官方一手**：
- [v8.dev/docs](https://v8.dev/docs)
- [v8.dev/blog](https://v8.dev/blog)（按时间倒序排，每个特性都有团队博客）
- [v8.dev/blog/10-years](https://v8.dev/blog/10-years)（2018 团队自述）
- [v8.dev/blog/maglev](https://v8.dev/blog/maglev)
- [v8.dev/blog/sparkplug](https://v8.dev/blog/sparkplug)
- [v8.dev/blog/sandbox](https://v8.dev/blog/sandbox)
- [v8.dev/blog/holiday-season-2023](https://v8.dev/blog/holiday-season-2023)
- [v8.dev/blog/pointer-compression](https://v8.dev/blog/pointer-compression)
- [v8.dev/blog/trash-talk](https://v8.dev/blog/trash-talk)（Orinoco 总览）
- [v8.dev/blog/concurrent-marking](https://v8.dev/blog/concurrent-marking)
- [v8.dev/docs/hidden-classes](https://v8.dev/docs/hidden-classes)
- [v8.dev/docs/ignition](https://v8.dev/docs/ignition)

**社区整理**：
- [thlorenz/v8-perf](https://github.com/thlorenz/v8-perf)（V8 性能 / GC 文档合集）
- [mrale.ph](https://mrale.ph/)（前 V8 工程师 Vyacheslav Egorov 的博客，深度技术解读）
- Wikipedia [V8 (JavaScript engine)](https://en.wikipedia.org/wiki/V8_(JavaScript_engine))（版本表交叉核对）

**对比 / 横评**：
- [List of JavaScript engines (Wikipedia)](https://en.wikipedia.org/wiki/List_of_JavaScript_engines)
- JavaScriptCore / SpiderMonkey 各自官方 wiki

**安全 / Sandbox**：
- [The V8 Heap Sandbox (OffensiveCon 2024)](https://saelo.github.io/presentations/offensivecon_24_the_v8_heap_sandbox.pdf)（Samuel Groß）

---

## 与 index.html 卡片的对应

V8 主题在站点首页的卡片描述是：
> V8 编译流水线（Ignition / Sparkplug / Maglev / TurboFan）、隐藏类与内联缓存、垃圾回收（Orinoco）、JIT 反优化触发条件、性能调优实践。

本大纲全部覆盖 + 扩充：
- ✅ 编译流水线 → P2 全覆盖（4 层 + 反优化）
- ✅ 隐藏类与内联缓存 → P3 全覆盖
- ✅ 垃圾回收 Orinoco → P4.2 全覆盖
- ✅ 性能调优 → P5.2 全覆盖
- ➕ 扩充：项目史（P1.1）、引擎横评（P1.2）、Embedder API（P5.1）、V8 Sandbox（P5.2）、Wasm 管道（P6）

写完后建议把 index.html 的卡片标题从 "⏳ 规划中" 改为 "✅ 12 章 / 6 阶段完成"。
