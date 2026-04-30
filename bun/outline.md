# Bun（Runtime + Toolchain）深度学习 · 章节大纲

> 本文件是 Bun 主题的写作蓝本。**5 阶段 · 12 章**：从 Bun 项目史（P1）到 JavaScriptCore + Zig 的内核选择（P2）→ "内置一等公民"API 哲学（P3）→ install / run / build / test 一体化工具链（P4）→ 高级特性与生产决策（P5）。
> 编写日期：2026-04-30（首版）｜目标版本：Bun 1.2.x；历史回溯至 2021-07 Jarred Sumner 首版。

---

## 元信息

- **目标版本**：Bun 1.2.x（2025-2026 主线，已含 Windows 一级支持、Catalogs、HTTP/2 server、Bun.sql 等关键特性）。覆盖 2021-07 至 2026-04 全部主要演进。
- **来源**：
  - [bun.com/docs](https://bun.com/docs)（官方文档，权威一手）
  - [bun.com/blog](https://bun.com/blog)（每个版本发布博客，含设计动机）
  - [github.com/oven-sh/bun](https://github.com/oven-sh/bun)（源码 + Issues + RFC）
  - [github.com/oven-sh/bun/issues](https://github.com/oven-sh/bun/issues)（兼容性边界的最权威记录）
  - JavaScriptCore docs（[webkit.org/blog](https://webkit.org/blog/category/javascriptcore/)）
  - Zig 官方文档（[ziglang.org](https://ziglang.org/)）
  - Jarred Sumner 公开演讲与 Twitter / blog 文章
- **目标读者**：已学完 `node/`（先决条件）的工程师；理解 Node 怎么把 V8 包装成 runtime，现在想知道 Bun 如何用 JSC + Zig 重做这件事，以及生产中何时该切。
- **不是这个主题的读者**：未写过 Node 服务的人——Bun 章节通篇用 Node 当对照，前置缺失会读不懂。

---

## 整体设计：5 阶段 · 一个产品的内部解剖

Bun 不是几个独立工具拼起来的——它是 **JavaScriptCore（引擎）+ Zig（系统层）+ 内置一等公民 API + 一体化工具链** 作为<strong>同一个产品的 4 个面</strong>。Node 主题按"包装层级"展开（V8 → libuv → 标准库 → 工程），Bun 主题改按"产品决策轴"展开。

| 阶段 | 章数 | 核心问题 |
|---|---|---|
| **P1 · Bun 是谁** | 2 | Jarred Sumner 怎么启动这个项目、为什么 2021 年挑战 Node 是合理的、与 Node/Deno/Edge 同代人的差异 |
| **P2 · JavaScriptCore + Zig** | 2 | 为什么选 JSC 不是 V8、Zig 解决了什么 Rust 不能解决的问题 |
| **P3 · "内置一等公民" 哲学** | 2 | Bun.serve / Bun.file / Bun.sql 为什么是一等公民、Node 兼容层做到哪一步了 |
| **P4 · 一体化工具链** | 4 | install / run / build / test 各自为什么比独立工具快 + 共享 parser 的红利 |
| **P5 · 高级与生产决策** | 2 | FFI / Macros / 内置 DB；何时切 Bun / 何时仍 Node 的决策树 |

总计 **12 章 ≈ 75,000-85,000 字**，平均每章 6,500 字。**比重偏向 P3-P5**（产品形态 + 工具链 + 决策），P1 / P2 写得紧凑。

---

## 与既有主题的边界 ——「短重述 + 链回」原则

Bun 章节大量调用 V8 / Node / ECMA / JS 的概念，必须严格"链回"，否则会重复早期主题。

> ✅ **短重述**：1-3 句话点出"在底层是什么"
> ✅ **链回**：紧跟一句"详细 X / Y / Z 见 [`v8/{phase}/{chapter}`]"
> ❌ **不要**直接抄 V8 / Node 论述

**关键边界**：

| 概念 | 在哪讲透 | Bun 主题里怎么处理 |
|---|---|---|
| V8 编译流水线 | `v8/02-pipeline/` | 链回，仅在 P2.1 对比 JSC 流水线时短重述 |
| V8 Hidden Class / IC | `v8/03-speedup/` | 链回，仅在 P2.1 讲 JSC Structure 时点对比 |
| libuv Event Loop | `node/02-event-loop/01-libuv-design.html` | 链回，P2.2 讲 Zig + uSockets 替代 libuv 时短重述 |
| Node Event Loop 语义 | `node/02-event-loop/02-node-event-loop.html` | 链回，P3.2 讲 Bun 实现 nextTick / setImmediate 时短重述 |
| Streams（Node） | `node/04-streams-network/01-streams.html` | 链回，P3.1 讲 Bun.file 的 ReadableStream 时短重述 |
| HTTP / undici / fetch | `node/04-streams-network/02-http-server.html` | 链回，P3.1 讲 Bun.serve 时点出"和 fetch API 共字面" |
| Worker Threads / SharedArrayBuffer | `node/05-multicore-native/01-worker-cluster.html` | 链回，P3.2 提及 Bun Workers 的 Node 兼容程度 |
| N-API | `node/05-multicore-native/02-n-api.html` | 链回，P3.2 讲 Bun 的 N-API 兼容层 |
| ECMA Module Records | `ecma/07-execution/04-modules-tla.html` | 链回，P4.3 讲 bun build 的 ESM 处理 |
| pnpm / phantom dep | 待写的 pnpm 主题（**不存在则在 P4.1 自洽讲**）| P4.1 主战场，与 pnpm 的 lockfile / 软链对比 |
| Vite / Rolldown / Turbopack | 待写的 Vite 主题（**不存在则在 P4.3 自洽讲**）| P4.3 主战场，bundler 横评 |
| Vitest / Jest | 待写的测试工具主题（**不存在则在 P4.4 自洽讲**）| P4.4 主战场，test runner 横评 |
| Node 内置 test runner / SEA / Permission | `node/06-modern/01-modern-node.html` | 链回，P3.1 / P4.4 / P5.1 各自对比时点出 |

---

## 内容覆盖原则 ——「bun.com/docs 是源头，但要读 Issues」

Bun 的特点：**官方文档美观但简略**——很多兼容性边界、性能 benchmark、设计决策根因不在 docs，而在 GitHub Issues / blog 文章 / Jarred 的 Twitter。

**3 条规则**：

1. **API 定义优先 bun.com/docs**：API 表面定义以官方为准。
2. **兼容性以 Issues 为准**：`compat:nodejs` label 下的 issue 列表是 Bun 实现 Node API 的最权威进度表（哪些已支持、哪些故意不实现、哪些是 upstream V8 / JSC 限制）。
3. **版本号必标**：Bun 迭代极快，每个特性必标"Bun X.Y 引入 / Z 稳定"。
4. **性能数字要可复现**：Bun 经常宣传 benchmark，写作时不引用未注明硬件 / 负载的数字；引用时必带 source + 复现说明。

---

## 节奏建议

- **连读组**：
  - P1.1 + P1.2（项目史 → 同代人对照）
  - P2.1 + P2.2（JSC → Zig，引擎+系统层不可分割）
  - P3.1 + P3.2（一等公民 API → Node 兼容层，互为前提）
  - P4.1 + P4.2 + P4.3 + P4.4（install / run / build / test 四件套，建议顺序）
  - P5.1 + P5.2（高级特性 → 生产决策，决策建立在能力之上）
- **可独立跳读**：
  - 已用 Bun 的工程师：P3.2 + P5.2，看兼容性边界 + 生产决策
  - 关心性能：P2 + P4.1（benchmark 真实根因）
  - 决定要不要切 Bun：P5.2 单读
- **建议阅读路径**：
  - 第一次接触：P1 → P2 → P3 → P4 → P5 顺序
  - 已用 pnpm 想换：P4.1 → P5.2
  - 在做 build tool 选型：P2 + P4.3

---

## 文件结构

```
bun/
  01-overview/                   (P1 · Bun 是谁 · 2 章)
    01-history.html              ← 2021 Jarred Sumner → Oven 公司化 → Bun 1.0 → Bun 1.2
    02-runtime-landscape.html    ← Bun vs Node vs Deno vs Edge runtime（从 Bun 视角）
  02-internals/                  (P2 · JavaScriptCore + Zig · 2 章)
    01-javascriptcore.html       ← JSC 设计、LLInt → Baseline → DFG → FTL、与 V8 流水线对比
    02-zig-system-layer.html     ← Zig 语言、内存模型、uSockets、为什么不是 Rust
  03-runtime/                    (P3 · "内置一等公民"哲学 · 2 章)
    01-builtin-apis.html         ← Bun.serve / Bun.file / Bun.sql / Bun.password 等
    02-node-compat.html          ← Node API 兼容层、兼容性边界、何时 fallback
  04-toolchain/                  (P4 · 一体化工具链 · 4 章)
    01-bun-install.html          ← lockfile 二进制、workspaces、与 pnpm/npm/yarn 横评
    02-bun-run.html              ← --hot / --watch / 直跑 TS / 环境变量 / glob import
    03-bun-build.html            ← bundler 共享 parser、--compile（SEA 替代）、与 Vite/Rolldown 横评
    04-bun-test.html             ← Jest 兼容、snapshot、mock、与 Vitest/Jest/node:test 横评
  05-advanced/                   (P5 · 高级与生产决策 · 2 章)
    01-ffi-macros-db.html        ← FFI / Macros / 内置 SQLite / Redis
    02-when-to-bun.html          ← 决策树 + CI / 生产 / dev / Lambda 各场景 verdict
  index.html
  outline.md
```

---

# P1 · Bun 是谁（2 章）

> 不讲技术细节，只解决两个问题：Bun 怎么走到今天、它在 JS 服务端生态里站什么位置。给后面所有"为什么这样设计"提供历史坐标。

## P1.1 · Bun 项目史（2021-2026）

- **定位**：Bun 5 年的故事讲成一条主线 —— 不是按版本号，而是按"每次设计决策及其根因"。
- **关键节点**：
  - **2021-07 · Jarred Sumner 个人项目首次推 demo**：在 Twitter 演示"Node 启动 50ms vs Bun 启动 5ms"，引爆讨论
  - **2021-2022 · 私下开发**：Jarred 全职做、用 Zig 重写、确立 JSC + uSockets 技术路线
  - **2022-07 · Bun 0.1 公开 Beta**：runtime + bundler + package manager + test runner 一次到位
  - **2022 · Oven 公司成立**：Y Combinator + a16z 投资；Jarred 招团队
  - **2023-09 · Bun 1.0 发布**：声明 "production-ready"；Linux + macOS 一级支持；Windows 仍是 WIP
  - **2024-04 · Bun 1.1 + Windows 一级支持**：Windows 用户终于能跑 native Bun（之前要 WSL）
  - **2024-2025 · Bun 1.1.x → 1.2.x**：HTTP/2 server、Bun.sql（一等公民 Postgres 客户端）、binary lockfile、改进 Node 兼容层
  - **2025-2026 · Bun.sh → bun.com**：域名迁移；商业化重心：Bun Cloud / Bun for Enterprises 探索
- **底层逻辑要点**：
  - **2021 年挑战 Node 为什么合理**：(1) Node CJS/ESM 二元状态拖了 5 年没解决；(2) 工具链碎片化（npm + Vite + Vitest + Rollup + tsc 五件套）每加一层 dev 体验更糟；(3) JSC 在 Safari 上证明了"启动快"是产品体验差异化卖点（详见 `v8/01-history/02-engine-landscape.html` 横向对比）
  - **Jarred 单人项目 → Oven 公司化的张力**：Bun 至今很多 PR 是 Jarred 自己写的——这是优势（决策快、技术品味统一），也是隐忧（bus factor）
  - **Bun 与 Deno 的"路线分歧"**：Deno (2018) 选"另起炉灶+TS 内置+URL 导入+权限模型"，结果生态拉不起来；Bun (2021) 选"兼容 Node 80%+ 加速"，绕开生态护城河——务实路线 vs 理想路线
- **预估字数**：4,500-5,500（比 Node P1.1 略短，因为 Bun 历史短）

## P1.2 · Bun 在 JS 服务端生态的位置

- **定位**：横向对照章。从 **Bun 视角**讲 Node / Deno / Edge runtime 各自的设计选择（Node P1.2 是从 Node 视角讲，本章角度互补）。
- **关键知识点**：
  - **Bun**：JSC + Zig + uSockets + 一体化工具链；定位"Node 加速版 + 工具链一站式"
  - **Node**：V8 + libuv + 标准库 + npm 生态；定位"通用服务端 JS 运行时"；2024+ 跟进很多 Bun 启发的特性（fetch / test / watch）
  - **Deno**（Ryan Dahl 2018+）：V8 + Tokio + Web 标准 + 权限模型；TS 内置；2024 后路线调整（npm 兼容、Deno 2.0）
  - **Edge runtime**（Cloudflare Workers / Vercel Edge / Deno Deploy）：V8 Isolate-per-tenant；Bun 暂时不能跑边缘（无 Isolate 多租户模型）
- **设计选择对比**：
  | 维度 | Bun | Node | Deno | Edge runtime |
  |---|---|---|---|---|
  | 引擎 | JSC | V8 | V8 | V8 |
  | 异步 | uSockets + Zig | libuv | Tokio | V8-only |
  | 包管理 | bun install（npm 兼容）| npm | URL imports + npm | npm 子集 |
  | TS 支持 | 内置 (transpile) | 外部 (tsc/swc) | 内置 (tsc) | 多数预编译 |
  | 默认安全 | 无 | 无 | 权限白名单 | 沙箱隔离 |
  | 工具链 | 一体化 | 分散（外部工具） | 部分一体化 | N/A |
  | 启动时间 | ~10ms | ~30-50ms | ~30ms | ~5ms |
  | 生态成熟度 | 增长中 | 极高 | 中 | N/A |
- **底层逻辑要点**：
  - **Bun 的护城河是"工具链一体化"**：单文件二进制、共享 parser 让 install/run/build/test 互相加速。Node 想追也难（要打散 npm/V8/各 CLI 的边界）
  - **Bun 的弱点是边缘场景**：Cloudflare / Vercel Edge 都跑 V8 Isolate，Bun 暂时不能填这个生态位
  - **Deno 路线为什么受挫**：URL imports + 默认无 Node 兼容 → 生态太薄；Deno 2.0 后转向"npm 默认兼容"——和 Bun 殊途同归
- **关联章节**：[`node/01-overview/02-runtime-landscape.html`]（互补视角）、[`v8/01-history/02-engine-landscape.html`]（引擎视角）
- **预估字数**：5,500-6,500

---

# P2 · JavaScriptCore + Zig（2 章）

> Bun 的两个最关键技术决策。这一阶段讲透"为什么不是 V8、为什么不是 Rust"。

## P2.1 · JavaScriptCore：为什么不是 V8

- **定位**：JSC 视角。讲清 JSC 的设计选择、与 V8 的差异、对 Bun 启动速度 / 内存的影响。
- **关键知识点**：
  - **JSC 起源**：KJS（KDE）→ Apple 接管（2002）→ Safari/WebKit 内置 → iOS（2007）→ macOS Big Sur 起 OS 内置组件
  - **JSC 4 层编译**：LLInt（解释器，bytecode 直接执行）→ Baseline（线性 JIT）→ DFG（Data Flow Graph 优化 JIT）→ FTL（基于 LLVM 的 top-tier JIT，后改为 B3 自家后端）
  - **与 V8 流水线的差异**：V8 是 Ignition → Sparkplug → Maglev → TurboFan（4 层）；JSC 4 层但 Sparkplug 等价物（Baseline）更轻；详见 [`v8/02-pipeline/`]
  - **JSC Structure vs V8 Hidden Class**：本质都是 Hidden Class，但 JSC 有"Polymorphic Inline Cache"差异点；详见 [`v8/03-speedup/01-hidden-class.html`]
  - **JSC GC**：Riptide（增量 + 并发）；Bun 大对象用自家分配器（不走 JSC 堆）
  - **启动快的真正原因**：JSC 的 LLInt（用 LLVM 写的解释器）比 Ignition（V8 用 C++）启动开销更低；JSC 自己也优化过（mmap bytecode 跳过 parse）
  - **JSC 在 Apple 之外的尴尬**：除 Bun 外没有其他大型 embedder；社区基础不如 V8 深；嵌入文档少（详见 P5.1 FFI 章节）
- **底层逻辑要点**：
  - **Bun 选 JSC 不是因为"全方面优于 V8"**：V8 在长期跑 hot 代码上 TurboFan 比 JSC FTL 略好；JSC 优势是**冷启动 + 内存占用 + 嵌入开销**——这正是服务端 / CLI / 边缘场景的核心
  - **Apple 的政治限制**：iOS 上第三方浏览器必须用 JSC（直到 2024 EU DMA 后才解禁）——这个历史让 JSC 在 mobile 优化方向积累深，恰好契合"启动快"
  - **B3 后端自研**：JSC 早年用 LLVM 做 FTL，2016 后改自家 B3——LLVM 编译时间太长，不适合"边跑边编译"
- **关联章节**：[`v8/02-pipeline/`]、[`v8/03-speedup/`]、[`v8/01-history/02-engine-landscape.html`]
- **预估字数**：6,500-7,500

## P2.2 · Zig 系统层：为什么不是 Rust

- **定位**：Zig 视角。讲清 Zig 在 Bun 里扮演什么角色、为什么不是 Rust / C++、Zig 与 uSockets 怎么替代 libuv。
- **关键知识点**：
  - **Zig 是什么**：2016 年 Andrew Kelley 启动的系统语言；目标"better C"——不是替代 Rust，是替代 C；编译期代码执行（`comptime`）；显式内存管理（无 GC、无所有权）；2024 仍是 0.x 版本（still pre-1.0）
  - **Zig 对 Bun 的核心价值**：(1) `comptime` 让 hot path 完全内联（如 HTTP parser）；(2) 显式内存管理避免 Rust 借用检查的 ergonomic 开销；(3) C ABI 兼容好——Zig 直接调 JSC 的 C++ 接口不用 wrapper
  - **uSockets**（Bun 不直接用 libuv）：Alex Hultman 写的 C++ 异步 I/O 库，原本用于 uWebSockets.js；Bun 把它和 Zig glue 起来跑事件循环
  - **Zig 编译期反射**：Bun 内部的"高速路径"（如 fast-path JSON parser）用 comptime 在编译期生成专用代码——Rust 用宏，C++ 用模板，Zig 用 comptime 是"零成本元编程"
  - **Zig vs Rust 对比**：Rust 的安全性是借用检查器+生命周期，开发慢、编译慢但 runtime 安全；Zig 不强制安全，让程序员自己管内存——Bun 选 Zig 是因为"性能压榨 > 编译期安全"，且 Jarred 个人偏好
  - **Zig 风险**：未到 1.0；语法 / 标准库还在变；社区比 Rust 小一两个数量级——Bun 实质是"赌 Zig 能跟上"
- **底层逻辑要点**：
  - **uSockets 替代 libuv 节省什么**：libuv 跨平台抽象层有 overhead；uSockets 在 Linux 上直接用 io_uring（新 syscall），跳过 epoll 包装——单连接吞吐能高 20-30%（具体看场景）
  - **Zig 的 ABI 兼容是关键**：Bun 用 JSC C++ API，Zig glue 直接 cast——若用 Rust 要 wrapper（增加间接层 + 编译复杂度）
  - **comptime 让"硬编码"不再是反模式**：Bun 内部 JSON parser 对每个字段类型都生成专用代码——传统语言里这叫 over-engineering，Zig 里 comptime 让它免费
- **关联章节**：[`node/02-event-loop/01-libuv-design.html`]（libuv 对照）、[`node/04-streams-network/02-http-server.html`]（HTTP parser 对照）
- **预估字数**：6,500-7,500

---

# P3 · "内置一等公民" 哲学（2 章）

> Bun 与 Node 设计哲学的最大分歧：Bun.serve / Bun.file / Bun.sql 是一等公民 API（runtime 自带），Node 的 http / fs / pg 是 npm 包或标准库。这一阶段讲清这个哲学差异 + Node 兼容层的边界。

## P3.1 · Bun.serve / Bun.file / Bun.sql：内置一等公民

- **定位**：把 Bun 的"内置 API 套"系统讲一遍——它们的设计共性是什么、为什么比 Node + npm 等价物快。
- **关键知识点**：
  - **`Bun.serve()`**：HTTP/HTTPS/HTTP2 server 一等公民；fetch-style handler（`{ fetch(req) { return new Response(...) } }`）；显著快于 `http.createServer`（大约 2-3x，benchmark 看 Bun docs）
  - **`Bun.file(path)`**：返回 `BunFile` 对象——lazy、可作为 `fetch()` body、可 `.text()` / `.json()` / `.arrayBuffer()`；底层是 `mmap` + zero-copy
  - **`Bun.write(dest, src)`**：写文件；可以是 path / BunFile / Response / Blob；自动选 `sendfile()` / `splice()` / `mmap`——绕过 Node Streams 的 backpressure 开销
  - **`Bun.password.hash() / verify()`**：bcrypt / argon2 内置；Node 要装 `bcrypt`（native 编译） / `argon2`（同上）
  - **`Bun.sql`**（Bun 1.2+）：Postgres 客户端一等公民；语法类似 `postgres.js`；连接池 / prepared statements 内置
  - **`Bun.spawn() / Bun.spawnSync()`**：进程 API；与 Node `child_process` 类似但更人体工学
  - **`Bun.env`**：自动加载 `.env` 文件（不需要 `dotenv` 包）
  - **`Bun.glob()`**：内置 glob；不需要 `glob` / `fast-glob`
  - **HTTP routes**（Bun 1.2+）：`Bun.serve({ routes: { "/api/users/:id": handler } })`——内置路由，不需要 Express / Hono
- **底层逻辑要点**：
  - **一等公民 vs npm 包的性能差**：Bun 内置 API 不走 `require()` 解析、不走 V8 binding 层、用 Zig 直接实现热路径——比对应 npm 包能快 2-10x
  - **零拷贝设计**：`Bun.file` + `Bun.write` 是为了"文件→网络"场景做的；`Bun.serve()` 直接接受 `Bun.file()` 作为 body 时走 `sendfile` 系统调用——内核态直传，绕过用户态 buffer
  - **API 设计哲学**：跟 Web 标准对齐（`Request` / `Response` / `Blob` / `ReadableStream`），尽量避免发明新 API——这让 Bun 代码可以部分跑在 Cloudflare Workers / Edge runtime
  - **设计代价**：内置太多导致 Bun 二进制大（~50MB）；很多场景用不到；但 Jarred 选择"用户便利 > 二进制大小"
- **关联章节**：[`node/04-streams-network/02-http-server.html`]（HTTP 对照）、[`node/04-streams-network/03-fs-process.html`]（fs 对照）
- **预估字数**：6,500-7,500

## P3.2 · Node 兼容层：边界与 fallback

- **定位**：Bun 的"Node 兼容"是它最大卖点，但兼容到哪一步是 production 决策的关键。这一章讲清 2026 年的兼容现状 + 何时仍需 fallback。
- **关键知识点**：
  - **完全兼容**（2025-2026 状态）：`fs` / `path` / `url` / `crypto` / `stream` / `events` / `buffer` / `http` / `https` / `net` / `tls` / `dns` / `os` / `process` / `child_process` / `cluster`（部分）/ `worker_threads`（部分）
  - **部分兼容**：`worker_threads`（Bun 用自家 Worker 实现，API 表面兼容但底层不同）；`vm` 模块（Bun 实现部分）；`async_hooks`（部分支持，AsyncLocalStorage 已稳定）；`inspector`（debugger 接入支持，但 Inspector Protocol 部分）
  - **不兼容 / 不打算实现**：`v8` 模块（Bun 用 JSC 不是 V8）；某些 N-API 场景；某些 unstable Node API
  - **N-API 兼容**：Bun 实现了 N-API，所以大部分 native module（`better-sqlite3` / `sharp` / `bcrypt`）能跑——但有兼容性 corner case，Issues 上能查到
  - **process.nextTick / setImmediate**：Bun 实现了，但与 Node 的微妙顺序差异（之前是 Bun bug，1.1 后基本对齐）
  - **CommonJS / ESM 双系统**：Bun 完全支持；解析算法对齐 Node；但 Bun 默认 ESM-friendly（`type: "module"` 不是必须，Bun 看代码自动判断）
  - **Bun-only 优化**：在 ESM 文件里直接 `require()` 也能用（Node 不允许）——这是 Bun 的扩展，写 lib 时别依赖
- **底层逻辑要点**：
  - **兼容层不是"copy Node 实现"**：Bun 用 Zig 重写了 fs/http/crypto——表面 API 一样、行为对齐、性能更好；但角落 case（`fs.watch` 平台行为、TLS 证书边界）可能有差异
  - **Issues 上的 `compat:nodejs` label** 是兼容性的最权威进度表——做 production 决策前先 grep 你用的 npm 包 / Node API
  - **何时 fallback 第三方包**：(1) Bun 内置等价物有边界 case 你踩中（如 `Bun.sql` vs `pg` 的 prepared statements 行为）；(2) 用了 Bun 不支持的 Node 内部 API（极少见但有）
- **关联章节**：[`node/03-modules/01-cjs-esm.html`]（模块系统对照）、[`node/05-multicore-native/01-worker-cluster.html`]（Worker 对照）、[`node/05-multicore-native/02-n-api.html`]（N-API 对照）
- **预估字数**：6,500-7,500

---

# P4 · 一体化工具链（4 章）

> Bun 的另一个核心卖点：install / run / build / test 是同一个 CLI。这一阶段每个工具一章，讲清各自的设计 + 比独立工具快的真正原因 + 横评。

## P4.1 · `bun install`：替代 pnpm / npm / yarn

- **定位**：包管理器章。Bun 主题里**最容易让用户切换**的工具——通常工程师从 `bun install` 开始用 Bun，再考虑 runtime / build。
- **关键知识点**：
  - **lockfile 设计**：Bun 1.2+ 用 binary lockfile（`bun.lock` 文本格式 + 内部 binary cache）；早期 `bun.lockb`（纯二进制）用户难审核，1.2 改回文本+二进制并存
  - **解析算法**：与 npm/yarn/pnpm 解析算法兼容；扁平 + 必要时嵌套；与 npm 的 `package-lock.json` 输出一致
  - **store / hard link**：Bun 全局 cache 在 `~/.bun/install/cache`；项目 `node_modules` 用 hard link 链回 store——和 pnpm 软链不同，hard link 让 phantom dep 检测变难（见陷阱）
  - **workspaces**：原生支持 monorepo；`workspaces: ["packages/*"]`；与 pnpm workspaces 对等
  - **Catalogs**（Bun 1.2+）：版本统一管理；声明 `[catalog.react]`，所有 workspace package 引用相同版本
  - **比 pnpm 快的原因**：(1) Zig 实现，启动开销小；(2) 网络请求并发更激进（默认 256 并发 vs npm 16）；(3) 解压缩用 Zig 的 zlib bindings；(4) hard link 比 symlink 创建快
  - **`bun install --frozen-lockfile`**：CI 用，与 `npm ci` / `pnpm install --frozen-lockfile` 等价
  - **`bun update` / `bun outdated`**：交互式升级；与 `npm update` 类似
- **底层逻辑要点**：
  - **hard link vs symlink 取舍**：pnpm 用 symlink 链回 store——好处：phantom dep 检测严格；坏处：某些工具（IDE indexer）不跟随软链。Bun 用 hard link：好处：兼容性好；坏处：phantom dep 不严格（要 `--strict-peer-dependencies` 才检测）
  - **binary lockfile 的争议**：1.0 用纯二进制 → 用户抱怨 PR review 看不见 → 1.2 改回文本格式但仍然解析快——用 columnar binary cache 加速 `install` 命令本身
  - **生产用的真实节省**：在大 monorepo（>500 包）里，Bun install 比 pnpm 快 2-4x，比 npm 快 5-10x；小项目（<50 包）差距小（都是 1-2s 内）
  - **何时仍用 pnpm**：(1) 已用 pnpm patch / `.pnpmfile.cjs` 做深度定制；(2) 严格 phantom dep 防御；(3) 团队协作工具链限制
- **关联章节**：（pnpm 主题待写时链回；不存在则本章自洽）
- **预估字数**：6,500-7,500

## P4.2 · `bun run` 与 runtime：直跑 TS、watch、glob import

- **定位**：bun 作为脚本 runner / 开发时 runtime 的章节。`bun run` 不只是"跑 package.json scripts"——它是 Bun runtime 的入口。
- **关键知识点**：
  - **`bun run script.ts`**：直接跑 TypeScript / TSX；不需要 ts-node / tsx；底层是 Bun 内置的 transpiler（共享 bun build 的 parser）
  - **`bun run` vs `bun script.ts`**：前者跑 package.json scripts（类似 npm run），后者直接跑文件；区别在 PATH 处理
  - **`--hot` vs `--watch`**：`--watch` 整个进程重启（类似 nodemon / Node `--watch`）；`--hot` 保持进程 + 热替换模块（保留 in-memory 状态）—— hot reload 是 Bun 独有
  - **环境变量自动加载**：`.env` / `.env.local` / `.env.production` 自动解析；不需要 `dotenv`
  - **glob import**：`import * as routes from "./routes/*.ts"` —— Bun 1.2+ 支持；Vite-style；批量加载文件
  - **TS / JSX 配置**：自动读 `tsconfig.json`；`paths` / `baseUrl` 支持；JSX `factory` / `runtime` 自动选择
  - **`bun --inspect`**：JSC Inspector Protocol；与 V8 Inspector 不完全兼容但 Safari Web Inspector / WebStorm 通过 Bun 的 adapter 支持
  - **`bun --print` / `bun --eval`**：交互式表达式求值；REPL 也用 JSC
- **底层逻辑要点**：
  - **TS 直跑的真实成本**：Bun 用 transpile（不做类型检查）；类型错误不阻断运行——production 仍然要 `tsc --noEmit` 在 CI 跑；这点和 Node 22+ 的 `--experimental-strip-types` 路线一致
  - **`--hot` 实现**：Bun 维护一个 module graph + 改动时只重新 evaluate 该模块 + 通知依赖者；不像 Vite HMR 那么深（Vite 还有 React Refresh 等框架级 HMR），但够用
  - **与 Node `--watch` 的差异**：Node `--watch` 整个进程重启（cold restart）；Bun `--hot` 保留状态——开发服务器场景差异显著
  - **Glob import 的争议**：违反静态可分析原则（bundler 难处理）；好处是快速 prototype；production 不建议大规模用
- **关联章节**：[`node/06-modern/01-modern-node.html`]（Node Watch mode 对比）
- **预估字数**：6,000-7,000

## P4.3 · `bun build`：bundler + `--compile` SEA 替代

- **定位**：bundler 章。bun build 的设计目标：在 Vite / Rolldown / esbuild / Turbopack 这个高度内卷的赛道里，靠"和 runtime / install 共享 parser"差异化。
- **关键知识点**：
  - **核心架构**：Zig 实现的 parser + transformer + bundler；与 Bun runtime / `bun test` / `bun install` 共享同一套 parser
  - **支持的输入**：JS / TS / JSX / TSX / JSON / CSS / TXT / WASM / WAT / 各类 asset；插件机制（与 esbuild 类似）
  - **输出格式**：ESM / CJS / IIFE；Browser / Node / Bun 三种 target
  - **Tree shaking**：基于 ES Module 静态分析；与 esbuild / Rolldown 等价
  - **Source map**：内置；linked / inline / external 三种模式
  - **Code splitting**：动态 import 自动分块
  - **`--compile`**：把入口脚本 + Bun runtime 打包成<strong>单文件可执行程序</strong>（替代 Node SEA）；产物 ~50MB；支持交叉编译（`--target=bun-linux-x64` 等）
  - **CSS 处理**：Bun 1.2+ 内置 CSS bundler（before 是 stub）；@import / url() 解析；CSS modules 实验
  - **Bytecode caching**：Bun 1.2+ 把 JSC bytecode 缓存到 `.bun-cache`，第二次跑时跳过 parse；启动时间额外节省 30%
- **底层逻辑要点**：
  - **共享 parser 的红利**：`bun install` 解析 package.json 的 exports / imports 字段；`bun run` transpile TS 跑代码；`bun build` 同样 parse 同样的代码——三者复用 Zig 写的 parser，每个工具的启动都摊薄了 parser 加载成本
  - **bun build 的对手是谁**：esbuild（Go）—— 启动稍快但插件生态弱；Rolldown（Rust + napi）—— 与 Vite 共生；Turbopack（Rust）—— 仅 Next.js 用。Bun 的差异化是"一体化"，单看 bundler 速度差距不大
  - **`--compile` 与 Node SEA 的差距**：Bun `--compile` 几乎是 Node SEA 的"完成版"——支持 ESM / 交叉编译 / 体积合理；Node SEA 仍在追赶
  - **何时选 bun build**：(1) 项目已用 Bun runtime（一体化最大化）；(2) 需要 `--compile` 单文件分发。否则 Vite + Rolldown 在前端仍主流
- **关联章节**：[`node/06-modern/01-modern-node.html`]（Node SEA 对比）
- **预估字数**：7,000-8,000

## P4.4 · `bun test`：替代 Vitest / Jest / node:test

- **定位**：测试 runner 章。bun test 是 Jest 兼容 + 启动快的方案——和 Vitest / node:test 三方混战。
- **关键知识点**：
  - **API 兼容**：与 Jest 大量兼容（`describe` / `test` / `expect` / `beforeEach` / `mock` / `spy`）；导入路径 `bun:test`（不是 npm 包）
  - **`expect()` 的 matcher**：覆盖 Jest 90%+ matcher（`.toBe` / `.toEqual` / `.toContain` / `.toHaveBeenCalled` 等）；少数高级 matcher（如 `.toMatchSnapshot`）实现可能不完全
  - **Snapshot testing**：`expect(x).toMatchSnapshot()`；与 Jest 行为对齐；snapshot 文件 `__snapshots__/`
  - **Mock**：`mock()` / `spyOn()`；模块 mock（`mock.module()`）；定时器 mock（`useFakeTimers`）；fetch mock（内置）
  - **Coverage**：`bun test --coverage`；基于 V8/JSC coverage；输出 LCOV / text；不需要 c8 / nyc
  - **Watch mode**：`bun test --watch`
  - **DOM 测试**：通过 `happy-dom` 或 `jsdom`（npm 包）；Bun 不内置 DOM
  - **比 Vitest / Jest 快的原因**：(1) 启动快（Bun runtime 自身启动快）；(2) 跳过 Vite 的 transform 步骤；(3) 共享 parser；(4) 并行执行更激进
- **底层逻辑要点**：
  - **bun test 的定位**：Jest 兼容 + 速度——目标用户是"已用 Jest 想加速"。Vitest 的护城河是 DOM 测试 + UI 报告；node:test 的护城河是零依赖 + 与 Node 同生命周期
  - **Jest 兼容的真实程度**：基础 API 兼容；高级特性（自定义 reporter / 复杂 setup / Jest plugin 生态）不完全；迁移大型 Jest suite 不是无痛
  - **何时选 bun test**：(1) 已用 Bun runtime（一体化）；(2) 测试不依赖 DOM；(3) 想要快速 CI。前端组件测试仍用 Vitest（DOM 是关键）
  - **何时仍用 Vitest**：(1) Vue / React 组件测试 + jsdom；(2) 已深度使用 Vitest 的 `vi.mock` 高级特性；(3) 用 Vitest UI dashboard
- **关联章节**：[`node/06-modern/01-modern-node.html`]（node:test 对比）
- **预估字数**：6,500-7,500

---

# P5 · 高级特性与生产决策（2 章）

> Bun 不只是"runtime + 工具链"——FFI / Macros / 内置 DB 是"系统化"卖点。最后用一章讲清生产决策树。

## P5.1 · FFI / Macros / 内置 SQLite + Redis

- **定位**：高级特性章。这些不是入门必须，但 Bun 能在某些"超 Node 范畴"的场景胜出靠这些。
- **关键知识点**：
  - **`bun:ffi`**：调用 native 共享库（`.so` / `.dylib` / `.dll`）；用 `dlopen()` 风格 API；声明类型自动 marshal——比 Node N-API 写法简单（不用编 native 模块），但比 N-API 慢（每次调用有 marshal 开销）
  - **使用场景**：调系统库（OpenSSL / sqlite3 / libcurl）；调 Rust / Zig / C 写的高性能函数；快速试验 native 集成
  - **Macros**（Bun 1.0+）：编译期代码执行；`with { type: "macro" }` import attribute 标记；类似 Zig comptime，但是 JS 表达力有限——主要用于 build 时生成数据
  - **`bun:sqlite`**：内置 SQLite 客户端；底层是 SQLite C 库 + Zig binding；与 `better-sqlite3` 同等速度但不需要 native 编译
  - **`Bun.sql`**（Bun 1.2+）：内置 Postgres 客户端；连接池 / prepared statements；与 `postgres.js` 类似 API
  - **`Bun.redis`**（Bun 1.2+，实验）：Redis 客户端；二进制协议 + connection pooling
  - **HTML imports**：`import index from "./index.html"`——Bun 1.2+ 把 HTML 当模块，集成 Bun.serve 的 fullstack 路径
- **底层逻辑要点**：
  - **FFI vs N-API 取舍**：FFI 灵活、不需要编译，适合"调系统库"；N-API 兼容性好（Node 也能跑），适合"复用 npm 生态"。Bun 同时支持两者
  - **Macros 的局限**：JS 不像 Zig，编译期没法做反射 / 类型检查——Macros 主要做"build 时把外部数据嵌入"（如 SVG → component），不是真元编程
  - **内置 DB 客户端的争议**：`bun:sqlite` / `Bun.sql` 锁死了"标准 API"；如果未来需求超出（如想换成 Drizzle ORM）要 fallback npm 包——但这种 fallback 路径完整，所以风险低
- **关联章节**：[`node/05-multicore-native/02-n-api.html`]（N-API 对照）
- **预估字数**：6,000-7,000

## P5.2 · 何时切 Bun / 何时仍用 Node

- **定位**：决策章。把前面所有内容收束到一张决策树——production 中怎么判断该不该切 Bun。
- **关键知识点**：
  - **决策维度 1 · 启动速度敏感性**：Lambda / Serverless / CLI 工具 → Bun（启动 5-10ms vs Node 30-50ms）；长跑服务（一次启动用几天） → Node 速度差异不重要
  - **决策维度 2 · npm 生态依赖**：用了 `node-gyp` 编译的 native module 多 → 验证 Bun N-API 兼容性后再切；纯 JS 依赖 → 切 Bun 风险低
  - **决策维度 3 · 工具链一体化收益**：单一服务 / 库 → 一体化收益小；大 monorepo（install / build / test 都频繁） → 收益最大
  - **决策维度 4 · 团队工程化能力**：Bun 兼容性边界需要时不时排查 → 团队要有 Bun 经验；保守团队选 Node
  - **决策维度 5 · 部署目标**：Cloudflare Workers / Vercel Edge → 仍 V8 Isolate（Bun 不行）；Lambda / 自建服务器 / Docker → Bun 可以
  - **典型场景 verdict**：
    - **CI 加速**：✅ 切 Bun（install + test 显著快）
    - **monorepo dev**：✅ 切 Bun（install + run + build 一体化）
    - **生产 Web API（自建服务器/Docker）**：✅ 切 Bun（启动快 + Bun.serve 快）
    - **生产 Lambda**：✅ 切 Bun（冷启动差异决定性）
    - **生产 Edge runtime**：❌ 仍 Node 兼容（Bun 不能跑）
    - **大型遗留 Node 项目**：⚠️ 渐进切换（先 install，再 test，runtime 最后）
    - **写 npm 库**：⚠️ 用 Bun dev / test，但发布用 tsup 输出 ESM+CJS 兼容 Node 用户
  - **风险评估**：
    - bus factor（Jarred 单点）→ Bun 1.0+ 后已减弱
    - bug 率（vs Node 的成熟度）→ 高频 release 修复快，但 corner case 仍多于 Node
    - 长期维护风险 → Oven 商业化进展决定项目可持续性
- **底层逻辑要点**：
  - **Bun 不是 Node 替代品，是 Node 加速器**：从 Bun 1.0+ 团队的定位看，Bun 不期望"颠覆 Node"，而是"在 Node 兼容前提下提供更好工具体验"——这种务实路线让"切 Bun"成本可控
  - **作者本人的生产决策**：（用户已切 Bun 替代 pnpm）这是 install 维度的最低风险切换；runtime / build / test 可以分阶段评估
  - **2026 年的稳定基线**：Bun 1.2+ Windows + macOS + Linux 一级支持；Node 兼容覆盖 90%+ 主流 npm 包；可以认为是"通用生产 ready"
- **预估字数**：7,000-8,000（最长章，决策树需要充分展开）

---

## 附：参考资料汇总

**官方一手**：
- [bun.com/docs](https://bun.com/docs)
- [bun.com/blog](https://bun.com/blog)（每个版本 release notes）
- [github.com/oven-sh/bun](https://github.com/oven-sh/bun)（源码 / Issues / PR）
- [github.com/oven-sh/bun/issues?q=label:compat:nodejs](https://github.com/oven-sh/bun/issues?q=label%3Acompat%3Anodejs)（Node 兼容性进度）

**关键演讲与文章**：
- [Bun 1.0 launch keynote (Sep 2023)](https://bun.com/blog/bun-v1.0)
- [Bun 1.1 with Windows support](https://bun.com/blog/bun-v1.1)
- [JavaScriptCore docs (WebKit)](https://webkit.org/blog/category/javascriptcore/)
- [Zig docs](https://ziglang.org/documentation/master/)
- Jarred Sumner Twitter: design rationale 经常在 thread 里发

**社区资源**：
- [awesome-bun](https://github.com/apvarun/awesome-bun)（生态导航）
- [bunbun blog](https://bun.sh/blog)（旧域名仍可访问）

---

## 与 index.html 卡片的对应

Bun 主题在站点首页的卡片描述是：
> JavaScriptCore + Zig 构成的一体化 JS 平台。把运行时、包管理、bundler、测试 runner 当作同一产品的 4 个面讲：为什么 Zig 的内存模型让 bun install 比 pnpm 快一个量级、为什么共享 parser 让 bun build 不需要 Rollup、为什么 Bun.serve / Bun.sql 是一等公民而不是库。和 Node + pnpm + Vite + Vitest 各自的取舍判据、Node API 兼容边界、何时切 / 何时仍用旧栈。

本大纲全部覆盖：
- ✅ JSC + Zig → P2 全覆盖
- ✅ runtime / install / build / test "同一产品的 4 个面" → P3 + P4 全覆盖
- ✅ Bun.serve / Bun.sql 一等公民 → P3.1 主战场
- ✅ Node API 兼容边界 → P3.2 主战场
- ✅ 何时切 / 何时仍用旧栈 → P5.2 主战场
- ➕ 扩充：项目史 + 同代人对照（P1）、FFI / Macros / 内置 DB（P5.1）

写完后建议把 index.html 的卡片标题从 "⏳ 规划中 · ecosystem" 改为 "✅ 12 章 / 5 阶段完成"。
