# Node.js Runtime 深度学习 · 章节大纲

> 本文件是 Node.js 主题的写作蓝本。**6 阶段 · 12 章**：从 Node 项目史与同代人对照（P1）讲起，沿数据流向 / 关注点铺开 —— libuv + Event Loop（P2）→ 模块系统（P3）→ Streams + 网络（P4）→ 多核 + 原生扩展（P5）→ 现代 Node 工程（P6）。
> 编写日期：2026-04-29（首版）｜目标版本：Node 22 LTS（V8 12.4 / libuv 1.46+）；历史回溯至 2009-05 Ryan Dahl 首版。

---

## 元信息

- **目标编辑**：Node 22 LTS（2024-10 起为活跃 LTS，2026 年初稳定线）。覆盖 2009-05 至 2026 全部主要演进；**io.js 分裂（2014-2015）单独讲为治理失败案例**。
- **来源**：
  - [nodejs.org/api](https://nodejs.org/api/)（官方 API 文档，权威一手）
  - [docs.libuv.org](https://docs.libuv.org/en/v1.x/)（libuv 设计文档）
  - [github.com/nodejs/node](https://github.com/nodejs/node)（源码 + 历史 commit + RFC）
  - [github.com/nodejs/Release](https://github.com/nodejs/Release)（LTS 时间表）
  - Node.js Foundation / OpenJS Foundation 治理文档（用于讲项目史）
  - Ryan Dahl 2009 JSConf EU 演讲（Node 起源叙述）
- **目标读者**：已学完 `javascript/` `ecma/` `v8/` 的研发工程师；理解 V8 怎么跑 JS，现在想知道 Node 怎么把 V8 包装成"服务端运行时"。
- **不是这个主题的读者**：第一次写 JS 的人 / 只用 Node 跑 npm script 的前端 —— 主题里假设读者真的写过 Node 服务。

---

## 整体设计：6 阶段 · 沿"包装层级"铺开

Node.js 不是单一组件——它是 **V8 + libuv + 标准库 + 模块系统 + 进程模型 + 工程工具** 的组合。我们按这些组件的"包装层级"展开：从最底层（V8 / libuv）一直铺到最上层（工程实践）。

| 阶段 | 章数 | 核心问题 |
|---|---|---|
| **P1 · Node 是谁** | 2 | Ryan Dahl 怎么发明、io.js 分裂教训、与 Deno/Bun 同代人对照 |
| **P2 · libuv 与 Event Loop** | 2 | libuv 6 phase 如何工作、Node Event Loop 与 V8 microtask 怎么协作 |
| **P3 · 模块系统** | 2 | CJS / ESM 双系统设计、exports 字段、dual package hazard |
| **P4 · Streams 与网络栈** | 3 | Readable/Writable/Duplex/Transform、backpressure、http/undici/fetch、HTTP/2 |
| **P5 · 多核与原生扩展** | 2 | Worker Threads / Cluster / Child Process / N-API |
| **P6 · 现代 Node 工程** | 1 | 内置 test runner / Permission Model / SEA / async_hooks / AsyncLocalStorage |

总计 **12 章 ≈ 75,000 字**，平均每章 6,200 字。

---

## 与既有主题的边界 ——「短重述 + 链回」原则

Node 是 `v8/` `ecma/` `javascript/` 之上的应用层。和上游有大量重叠，必须明确划界：

> ✅ **短重述**：1-3 句话点出"它在底层是什么 + 关键性质"
> ✅ **链回**：紧跟一句"详细的 X / Y / Z 请参考 [`v8/{phase}/{chapter}`]"
> ❌ **不要**直接抄一遍 V8 / ECMA / JS 那边的论述

**关键边界**：

| 概念 | 在哪讲透 | Node 主题里怎么处理 |
|---|---|---|
| Event Loop（规范定义） | `ecma/07-execution/03-event-loop-async.html` | **短重述**规范定义，重点讲 Node 用 libuv 6 phase 实现 |
| Microtask Queue（V8 原语） | `v8/05-embedding/01-embedder-api.html` | 链回，P2.2 讲 Node 怎么决定 microtask drain 时机 |
| V8 Isolate / Context | `v8/05-embedding/01-embedder-api.html` | 链回，P5.1 讲 Worker Threads = 多 Isolate |
| V8 Pipeline / GC / IC | `v8/02-pipeline/` `v8/04-memory/` `v8/03-speedup/` | 链回，仅在 P5.1 讲 Worker 启动开销时点出 |
| Promise / async/await（用户视角）| `javascript/03-async/` | 链回，仅在 P2.2 讲 Event Loop 与 Promise 关系时短重述 |
| Module Records 规范 | `ecma/07-execution/04-modules-tla.html` | 链回，P3 讲 Node 如何实现 + CJS 兼容层 |
| N-API（C 接口） | `v8/05-embedding/01-embedder-api.html`（已带过） | 这里**展开**到 N-API ABI 稳定性 + node-addon-api 选择 |
| SAB / Atomics | `ecma/07-execution/05-memory-model.html` | 链回，P5.1 讲 Worker Threads 用 SAB 共享内存 |
| Bun 替代方案 | 独立的 Bun 主题（待写） | 仅在 P1.2 同代人段提及 + 必要时对比 |

---

## 内容覆盖原则 ——「nodejs.org 是源头，社区博客做对照」

Node.js 的特点是：**官方文档极厚但分散**——nodejs.org/api 几百页 API reference，但缺少"为什么这样设计"的叙事。这就给本主题留出空间——用历史 + 设计动机串起 API。

**3 条规则**：

1. **优先 nodejs.org 一手**：每个 API 的"权威定义"必须是 nodejs.org/api。社区博客只用来佐证或补充实测数据。
2. **版本号必标**：Node 改动也很快，没有版本号的论述不可信。每个特性必标"Node X 引入 / Node Y 稳定"。
3. **重视 RFC 与 Issue**：很多 Node 设计决策记录在 nodejs/node GitHub PR / Issue 里——这些是讲"为什么"最权威的资料。

---

## 节奏建议

- **连读组**：
  - P1.1 + P1.2（项目史 → 同代人对照）
  - P2.1 + P2.2（libuv 设计 → Node 视角 Event Loop，必须连读）
  - P3.1 + P3.2（CJS/ESM → dual package，互为前提）
  - P4.1 + P4.2 + P4.3（Streams → http → fetch/undici，建议顺序）
  - P5.1 + P5.2（Worker/Cluster → N-API，扩展模型完整闭环）
- **可独立跳读**：
  - P6 现代 Node 工程相对独立
- **建议阅读路径**：
  - 已写过 Node 服务的工程师：P2 → P3 → P4，补底层与模块
  - 性能调优 / 排障：P2.2 + P5.1 + P6 async_hooks
  - 写 native module：P5.2 + V8 P5.1（Embedder API）

---

## 文件结构

```
node/
  01-overview/                   (P1 · Node 是谁 · 2 章)
    01-history.html              ← Ryan Dahl 2009 → io.js 分裂 → OpenJS → Bun 挑战
    02-runtime-landscape.html    ← Node vs Deno vs Bun 同代人；服务端 JS 生态
  02-event-loop/                 (P2 · libuv 与 Event Loop · 2 章)
    01-libuv-design.html         ← handles vs requests、I/O 多路复用、worker pool
    02-node-event-loop.html      ← 6 phases + microtask + nextTick + setImmediate
  03-modules/                    (P3 · 模块系统 · 2 章)
    01-cjs-esm.html              ← 解析算法、package.json type / main / exports
    02-dual-package-hazard.html  ← 双系统并存的工程现实 + 现代库设计
  04-streams-network/            (P4 · Streams 与网络栈 · 3 章)
    01-streams.html              ← Readable / Writable / Duplex / Transform + backpressure
    02-http-server.html          ← http / https / HTTP/2 / TLS / undici
    03-fs-process.html           ← fs / Buffer / process / Worker pool I/O
  05-multicore-native/           (P5 · 多核与原生扩展 · 2 章)
    01-worker-cluster.html       ← Worker Threads / Cluster / Child Process 三件套
    02-n-api.html                ← Native module / N-API / node-addon-api
  06-modern/                     (P6 · 现代 Node 工程 · 1 章)
    01-modern-node.html          ← Test runner / Permission / SEA / async_hooks / AsyncLocalStorage
  index.html
  outline.md
```

---

# P1 · Node 是谁（2 章）

> 不讲技术细节，只解决两个问题：Node 怎么走到今天、它在服务端 JS 生态里站什么位置。给后面所有"为什么这样设计"提供历史坐标。

## P1.1 · Node 项目史（2009-2025）

- **定位**：把 Node 17 年的故事讲成一条主线 —— 不是按版本号，而是按"每次治理 / 架构突变及其根因"。
- **关键节点**：
  - **2009-05 · Ryan Dahl JSConf EU 演讲**：发布 Node 0.1.0；动机："Apache 处理高并发的方式（线程 per 请求）有问题，需要事件驱动"
  - **2009-2014 · 早期生态爆发**：npm 2010、Express 2010、Socket.IO 2010；node 0.x 系列；Joyent 主导
  - **2014-12 · io.js 分裂**：贡献者对 Joyent 治理不满 fork 出 io.js，独立社区；倒逼 Joyent 重新组织
  - **2015-09 · Node Foundation 成立 + Node 4.0**：io.js + Node 合并；正式启用语义版本号 + LTS 模型；Linux Foundation 托管
  - **2017-10 · OpenJS Foundation 取代 Node Foundation**：Node + JS Foundation 合并，治理拓宽到整个 JS 生态
  - **2018 · Ryan Dahl 公开"10 things I regret about Node.js"**：批评 Node 的模块系统、package.json 复杂性、不安全等 —— 启发了他后来做 Deno
  - **2019-2020 · ESM 落地**：Node 12-13 添加实验 ESM；Node 14 稳定；CJS/ESM 双系统时代开启
  - **2022 · Bun 发布**：Jarred Sumner 推出 JSC + Zig 的 Node 替代品；启动速度 + 工具链一体化挑战 Node
  - **2023 · Permission Model + 内置 test runner**：Node 20 加入实验性 Permission Model；node:test 模块稳定
  - **2024 · Node 22 LTS + Bun 1.0+**：Node 持续融合"内置工具"思路（fetch、test、watch mode）应对 Bun 竞争
- **底层逻辑要点**：
  - **io.js 分裂教训**：单一公司控制开源项目的治理风险——后续 Foundation 模式成为大型 OSS 的标配
  - **Ryan Dahl 自己批评是 Node 改进的隐性 driver**：很多 Node 后期的决策（更多内置工具、ESM、Permission）是对 Deno 设计选择的回应
  - **Bun 是"Node 替代品"vs "Node 补充"的张力**：Node 在 22.x 加入很多 Bun 启发的特性试图守住生态
- **预估字数**：5,500-6,500

## P1.2 · Node 与同代人

- **定位**：横向对照章。讲清 Node、Deno、Bun、浏览器（service worker、edge runtime）这些"服务端 / Edge 上跑 JS"的方案各自做了什么不同选择。
- **关键知识点**：
  - **Node**：V8 + libuv + 标准库 + npm 生态；治理：OpenJS Foundation；定位"通用服务端 JS 运行时"
  - **Deno**（Ryan Dahl 2018+）：V8 + Tokio（Rust 异步）+ Web 标准 API + 权限模型；TypeScript 内置；URL 导入；尝试解决 Ryan 自己批评的 Node 问题
  - **Bun**（2022+）：JSC + Zig + 内置工具链（runtime + bundler + package manager + test runner）；Node 兼容层；启动速度 + 工具一体化
  - **Cloudflare Workers / Vercel Edge / AWS Lambda@Edge**：V8 Isolate-per-tenant 或 V8 cold start 优化；只支持子集 API；详见 V8 P1.2
  - **Hermes（React Native 服务端不用，但作为对照）**：AOT bytecode、无 JIT；详见 V8 P1.2
- **设计选择对比**：
  | 维度 | Node | Deno | Bun | Edge Runtime |
  |---|---|---|---|---|
  | 引擎 | V8 | V8 | JSC | V8 |
  | 异步 | libuv | Tokio | Zig + uSockets | V8-only |
  | 包管理 | npm | URL imports | Bun own | npm 子集 |
  | TS 支持 | 外部 (tsc/swc) | 内置 | 内置 (transpile) | 多数靠预编译 |
  | 默认安全 | 无 | 权限白名单 | 无 | 沙箱隔离 |
  | 生态成熟度 | 极高 | 中 | 增长中 | N/A（API 限制） |
- **底层逻辑要点**：
  - **Node 的护城河是生态**：npm 2.5M+ 包，任何替代品要么兼容 Node API，要么放弃 80% 现成生态
  - **Bun 选择"兼容 + 加速"路径**：声明 Node-compatible，然后在 runtime / bundler / package manager 都做更快——比 Deno 的"另起炉灶"更务实
  - **Edge Runtime 是受限子集**：Cloudflare / Vercel / Deno Deploy 都只支持 Node API 的子集（有些没有 fs / 长连接），写代码要做"边缘可移植性"判断
- **预估字数**：5,500-6,500

---

# P2 · libuv 与 Event Loop（2 章）

> Node 的核心创新是"用单线程 + 事件驱动 + 异步 I/O 跑高并发服务端"——这套机制由 libuv 提供。这一阶段把它讲透。

## P2.1 · libuv 设计：事件循环的"底盘"

- **定位**：libuv 是 Node 用 C 写的跨平台异步 I/O 库——Node 异步行为 100% 由它定义。这一章独立于 Node 讲 libuv 自己。
- **关键知识点**：
  - **libuv 起源**：2011 年从 Node 内部 ev/eio 抽离；2013 年独立项目；Microsoft / Apple 等贡献者参与
  - **核心抽象 1 · Handle**：长寿对象，能反复触发回调（TCP server、定时器、文件 watcher）
  - **核心抽象 2 · Request**：短期一次性操作（写入、DNS 查询、文件读）；完成后自动清理
  - **跨平台 I/O 多路复用**：Linux <code>epoll</code>、macOS <code>kqueue</code>、Windows <code>IOCP</code> —— libuv 给 Node 一个统一抽象
  - **Worker Pool（默认 4 线程）**：处理"无原生异步"的操作（文件 I/O、DNS、用户 work）；可通过 <code>UV_THREADPOOL_SIZE</code> 调整
  - **6 个 Event Loop phase**：timers / pending callbacks / idle, prepare / poll / check / close
  - **Node 20 (libuv 1.45) 的变化**：timer 现在只在 poll 后跑，而非两次（更符合用户预期）
- **底层逻辑要点**：
  - **网络 I/O 与文件 I/O 走不同路**：网络用 epoll/kqueue 非阻塞 socket（OS 原生异步）；文件 I/O 没有跨平台异步原语，靠 Worker Pool 模拟
  - **Worker Pool 大小是隐藏限制**：默认 4 线程意味着 4 个并发文件读会"卡住"其他操作——大文件密集服务必须调大
- **预估字数**：5,500-6,500

## P2.2 · Node 视角的 Event Loop

- **定位**：libuv 提供机制，Node 在上面叠了 V8 microtask、process.nextTick、unhandled rejection 等运行时语义。这一章讲完整的 Node 异步模型。
- **关键知识点**：
  - **Node 的 6 phase 与 V8 microtask 协作**：每个 phase 之间 + nextTick queue + Promise.then 都要 drain microtask
  - **process.nextTick vs setImmediate vs Promise.then**：三者执行时机的精确差异
  - **process.nextTick 反模式**：递归 nextTick 会饿死后续 phase（因为 microtask 在每次 phase 切换前 drain，不让出 CPU）
  - **setTimeout vs setImmediate**：在 I/O 回调内部 setImmediate 一定先于 setTimeout(0)；其他场景顺序不定（这是非常坑的细节）
  - **AbortController / AbortSignal 集成**：Node 14+ 的取消机制；async API 普遍支持
  - **--unhandled-rejections=strict 行为**：从 Node 15 起 unhandled rejection 默认 crash；服务端调试时要注意
- **底层逻辑要点**：
  - **V8 不拥有 Event Loop（详见 v8 P5.1）**：V8 提供 microtask 原语，Node 决定每个 phase 之间调用 <code>PerformMicrotaskCheckpoint</code>
  - **nextTick 是 Node 特有，不是规范**：在 Deno / Bun 行为可能略有差异
- **关联章节**：[`v8/05-embedding/01-embedder-api.html`]、[`ecma/07-execution/03-event-loop-async.html`]、[`javascript/03-async/`]
- **预估字数**：6,000-7,000

---

# P3 · 模块系统（2 章）

> Node 是 JS 历史上第一个有"真模块系统"的运行时（2009 CommonJS）。15 年后这套系统与 ES Modules 标准并存，造就了 Node 工程最复杂的工程现实。

## P3.1 · CJS 与 ESM 双系统：解析算法与配置

- **定位**：把"为什么我的 import 跑不起来"这种典型问题的根因讲清楚。重点是解析算法 + package.json 字段。
- **关键知识点**：
  - **CommonJS 解析算法（Node 2009-）**：<code>require</code> 同步、Node 自己的算法（不是 ES 规范）；<code>node_modules</code> 向上查找
  - **ESM 解析（Node 12+）**：<code>import</code> 异步、按 ECMA Module Records 规范；HTTP / file URL；带扩展名
  - **package.json 字段全谱**：<code>type: "module"</code>、<code>main</code>、<code>module</code>、<code>exports</code>、<code>imports</code>、<code>types</code>
  - **Conditional Exports**：<code>{"import": "./esm.js", "require": "./cjs.js", "types": "./types.d.ts"}</code> + 优先级（key 顺序敏感）
  - **导入时的扩展名问题**：ESM 必须带 <code>.js</code>，CJS 不必；TypeScript 与 Node 的奇怪交互（写 <code>.ts</code> 但实际 import <code>.js</code>）
  - **<code>--experimental-vm-modules</code> / <code>--loader</code> hooks**：自定义模块加载（用于 ts-node、Jest ESM 等）
- **底层逻辑要点**：
  - **CJS 是"运行时模块"**：被 require 时执行；同步；可以条件 require
  - **ESM 是"静态模块"**：解析时 V8 已知所有依赖；异步；不能条件 import（除非用 <code>import()</code>）
  - **解析算法分歧**：CJS 用 Node 自家算法，ESM 用 spec 算法 —— 同一个路径可能解析成不同文件
- **预估字数**：6,000-7,000

## P3.2 · Dual Package Hazard 与现代库设计

- **定位**：实战章。当一个库要同时支持 CJS 和 ESM 用户时，会撞上"双实例"问题。讲清楚怎么避免 + 现代最佳实践。
- **关键知识点**：
  - **Dual Package Hazard 定义**：<code>require('pkg')</code> 和 <code>import 'pkg'</code> 加载的是<strong>两个独立实例</strong> —— 单例失效、<code>instanceof</code> 失败、状态不一致
  - **3 种规避策略**：(1) 库纯无状态（推荐）；(2) 把 CJS 设为 ESM wrapper；(3) 只发 ESM 让 CJS 用户用 <code>import()</code>
  - **现代库设计模板**：用 <code>tshy</code> / <code>tsup</code> / <code>unbuild</code> 构建，发双格式 + types
  - **import.meta.resolve / require.resolve**：在 ESM / CJS 各自如何获取模块路径
  - **Top-Level Await 限制**：仅 ESM 支持；让 ESM 模块"等待"才完成 evaluation；详见 [`ecma/07-execution/04-modules-tla.html`]
- **关联章节**：[`ecma/07-execution/04-modules-tla.html`]
- **预估字数**：6,000-7,000

---

# P4 · Streams 与网络栈（3 章）

> Node 标准库最强的部分。Streams 是 Node 数据处理的统一抽象；http / undici / fetch 是 Node 服务端编程的核心。

## P4.1 · Streams 全谱

- **定位**：把 4 类 stream + backpressure + pipe + async iterator 讲清楚。Streams 是 Node 用户最常误解的 API。
- **关键知识点**：
  - **4 类 stream**：Readable（数据源）/ Writable（数据汇）/ Duplex（双向，如 socket）/ Transform（过滤器）
  - **两种模式**：flowing（push）vs paused（pull）—— 理解这俩是 stream 心智模型的关键
  - **highWaterMark**：内部 buffer 阈值，默认 16KB（字节流）或 16（object mode）
  - **Backpressure**：write() 返回 false → 暂停 source → 等 'drain' event 恢复 —— 这套机制让 Node 不爆内存
  - **<code>stream.pipeline()</code> vs <code>.pipe()</code>**：现代写法用 pipeline，自动处理错误传播 + 资源释放
  - **Async iterator**：<code>for await (const chunk of readable)</code>—— 现代 stream 消费方式，Node 10+ 支持
  - **<code>stream/web</code>（WHATWG Streams）**：Node 16+ 新加的 web 标准 stream API（ReadableStream / WritableStream），与传统 Node Streams 不兼容但正在融合
- **预估字数**：6,500-7,500

## P4.2 · http / https / HTTP/2 / undici / fetch

- **定位**：Node 服务端的核心场景——HTTP server / client。讲清传统 http 模块、新一代 undici（用作 fetch 后端）、HTTP/2 支持。
- **关键知识点**：
  - **<code>http</code> 模块（2009-）**：<code>createServer(req, res)</code>、req 是 Readable、res 是 Writable —— 整个 API 是 Streams 的应用
  - **<code>https</code> 模块**：TLS 终止；证书管理；ALPN 协议协商
  - **<code>http2</code> 模块（Node 8.4+）**：HTTP/2 server / client；流多路复用；server push（已废弃）
  - **<code>undici</code>（Node 18+ 内置）**：Node 团队写的高性能 HTTP/1.1 client；显著快于旧 http.request；连接池 + Keep-Alive 自动管理
  - **<code>fetch</code> 内置（Node 18+）**：基于 undici 实现；API 与浏览器一致；不再需要 node-fetch
  - **TLS / SSL**：<code>tls</code> 模块；常见生产配置（HTTP/2 + TLS 1.3 + ALPN）
- **预估字数**：6,000-7,000

## P4.3 · fs / Buffer / process

- **定位**：另外三个核心 API 群。文件 I/O 走 Worker Pool（与网络不同）；Buffer 是 Node 的二进制基础；process 是运行时环境的 entry。
- **关键知识点**：
  - **<code>fs</code> Promise API（fs.promises / Node 10+）**：现代写法，避免 callback hell
  - **<code>fs.readFile</code> vs <code>fs.createReadStream</code>**：小文件用前者（一次性加载），大文件用后者（streaming）
  - **<code>fs.watch</code> 跨平台坑**：Linux inotify / macOS FSEvents / Windows ReadDirectoryChangesW —— 行为差异大
  - **<code>Buffer</code>**：固定长度的字节数组；不在 V8 堆内（用 ArrayBuffer Allocator 分配，详见 v8 P4.1）；自 Node 4 起本质是 Uint8Array
  - **<code>process.env</code> / <code>process.argv</code> / <code>process.exit</code>**：运行时环境基础
  - **<code>process.on('uncaughtException')</code>**：crashing 前最后机会做清理；不要用作错误恢复（进程已不可信）
- **关联章节**：[`v8/04-memory/01-heap-and-objects.html`]（Buffer 不在 V8 堆）
- **预估字数**：5,500-6,500

---

# P5 · 多核与原生扩展（2 章）

> Node 的"单线程"是 JS 层面的，但通过 Worker Threads / Cluster / Child Process 三件套和 N-API 原生扩展，可以充分利用多核 + 调用 native 库。

## P5.1 · Worker Threads / Cluster / Child Process

- **定位**：三种"多核 / 多进程"模型——什么时候用哪个。
- **关键知识点**：
  - **<code>worker_threads</code>（Node 10.5+）**：进程内多 V8 Isolate；postMessage 走 structured clone；SharedArrayBuffer 共享内存；适合 CPU 密集 JS
  - **<code>cluster</code> 模块**：fork 多进程跑同一段代码；共享 listening port（master 做负载均衡）；适合 I/O 密集 web server 多核扩展
  - **<code>child_process</code>**：spawn / fork / exec 子进程；可以跑非 JS 程序；进程间通信走 IPC
  - **三者对比与选型**：CPU 密集 → Worker Threads；多 web server 实例 → Cluster；调外部程序 → Child Process
  - **Worker Threads 与 V8 Isolate**：每个 Worker 一个 Isolate，互相完全隔离；postMessage 必须 structured clone
  - **SharedArrayBuffer + Atomics**：Workers 之间真正共享内存的唯一方式；详见 [`ecma/07-execution/05-memory-model.html`]
  - **MessageChannel / MessagePort**：双向通信原语；可以跨 worker 转移
- **关联章节**：[`v8/05-embedding/01-embedder-api.html`]、[`ecma/07-execution/05-memory-model.html`]
- **预估字数**：6,000-7,000

## P5.2 · N-API 与 Native Module

- **定位**：用 C++ 写性能关键代码 + 调外部 C 库。N-API 是 Node 给 native module 的稳定 ABI 接口。
- **关键知识点**：
  - **三种 native module 写法**：raw V8 / N-API（C 接口）/ node-addon-api（C++ 包装）；现代默认 node-addon-api
  - **N-API ABI 稳定性承诺**：用 N-API v8 写的二进制能在所有 Node 18+ 跑，不需重新编译
  - **典型 native module**：<code>better-sqlite3</code>（SQLite 绑定）/ <code>bcrypt</code>（密码哈希）/ <code>sharp</code>（图像处理）/ <code>better-call</code>（FFI）
  - **<code>node-gyp</code> 构建系统**：基于 GYP（Google）的 fork；写 binding.gyp 定义编译选项
  - **prebuild-install**：避免用户安装时编译，下载预编译二进制 —— 实际生产 native module 几乎都用这套
  - **WASM 替代方案**：越来越多 native 需求改用 wasm（如 esbuild）—— 部署简单、跨平台、无需 node-gyp
- **关联章节**：[`v8/05-embedding/01-embedder-api.html`]（V8 Embedder 视角）
- **预估字数**：5,500-6,500

---

# P6 · 现代 Node 工程（1 章）

> Node 22+ 引入了一系列"内置工具"，回应 Bun / Deno 的工具一体化趋势。这一章讲这些工具 + 老牌的 async_hooks / Inspector。

## P6.1 · Test Runner / Permission / SEA / async_hooks

- **定位**：Node 现代化的几个关键特性 + 可观测性。一章覆盖。
- **关键知识点**：
  - **<code>node:test</code>（Node 18+ 实验，20 稳定）**：内置测试 runner；TAP 输出；现代特性（mock、subtests、并行执行）；竞争 vitest / Jest
  - **<code>node:assert</code>**：内置断言库；strict mode 与 web 标准 deepEqual 对齐
  - **Permission Model（Node 20+ 实验，22+ 稳定化）**：<code>--permission --allow-fs-read=./data --allow-net=api.example.com</code>；模仿 Deno
  - **Single Executable Application (SEA)**：把 Node + 用户脚本打包成单文件可执行程序；类似 Bun bundle / Deno compile
  - **<code>async_hooks</code> + <code>AsyncLocalStorage</code>**：跨 async boundary 传递 context；OpenTelemetry / 分布式追踪基础
  - **Inspector Protocol**：<code>--inspect</code> 启动；DevTools / VSCode 调试；详见 [`v8/05-embedding/02-diagnostics-sandbox.html`]
  - **Watch mode（Node 18+）**：<code>node --watch app.js</code> 自动重启 —— 减少 nodemon 依赖
- **预估字数**：6,000-7,000

---

## 附：参考资料汇总

**官方一手**：
- [nodejs.org/api](https://nodejs.org/api/)
- [nodejs.org/learn](https://nodejs.org/learn)
- [docs.libuv.org](https://docs.libuv.org/en/v1.x/)
- [github.com/nodejs/node](https://github.com/nodejs/node)（PR、Issue、设计讨论）
- [github.com/nodejs/Release](https://github.com/nodejs/Release)（LTS 时间表）

**关键演讲与文档**：
- [Ryan Dahl 2009 JSConf EU](https://www.youtube.com/watch?v=ztspvPYybIY)（Node 起源）
- [Ryan Dahl 2018 JSConf EU "10 Things I Regret About Node.js"](https://www.youtube.com/watch?v=M3BM9TB-8yA)（Deno 起源）
- [Node.js Diagnostic 工作组文档](https://github.com/nodejs/diagnostics)

**社区整理**：
- [Node Cookbook](https://www.nodejscookbook.com/)
- [The Node Book](https://www.thenodebook.com/)（在写中）

---

## 与 index.html 卡片的对应

Node.js Runtime 主题在站点首页的卡片描述是：
> libuv Event Loop（与浏览器对比）、Streams（Readable / Writable / Transform）、Worker Threads、Cluster、模块解析（CJS / ESM / dual package hazard）、HTTP server 内部。

本大纲全部覆盖 + 扩充：
- ✅ libuv Event Loop → P2 全覆盖
- ✅ Streams → P4.1 全覆盖
- ✅ Worker Threads / Cluster → P5.1 全覆盖
- ✅ 模块解析 + dual package → P3 全覆盖
- ✅ HTTP server → P4.2 全覆盖
- ➕ 扩充：项目史 + 同代人对照（P1）、N-API（P5.2）、现代 Node 工程（P6）

写完后建议把 index.html 的卡片标题从 "⏳ 规划中" 改为 "✅ 12 章 / 6 阶段完成"。
