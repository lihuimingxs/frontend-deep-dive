# WebAssembly 深度学习 · 章节大纲

> 本文件是 WebAssembly 主题的写作蓝本。**7 阶段 · 13 章**：从项目史 + 同代人对照（P1）→ 机器模型与二进制/文本格式（P2）→ 与宿主互操作（P3）→ 跨语言编译路径（P4）→ 高级特性提案（P5）→ WASI + 服务端运行时（P6）→ Component Model + 应用（P7）。
> 编写日期：2026-05-06（首版）｜目标版本：WebAssembly 2.0 (W3C Recommendation 2025-03)；Component Model Preview 2 (2026)。

---

## 元信息

- **目标版本**：WebAssembly 2.0（W3C Recommendation, 2025-03）覆盖 SIMD / bulk memory / reference types / multi-value 等已正式化特性；Phase 4 / 5 提案（WasmGC 已 2023 正式 / Memory64 / Tail call / Exception handling / Threads / Component Model）按 2026-05 状态标注。
- **来源**：
  - [webassembly.org](https://webassembly.org/) · 官方主页 + 提案索引
  - [github.com/WebAssembly/spec](https://github.com/WebAssembly/spec) · W3C 规范源
  - [github.com/WebAssembly/proposals](https://github.com/WebAssembly/proposals) · 提案进度索引
  - [github.com/WebAssembly/component-model](https://github.com/WebAssembly/component-model) · Component Model + WIT
  - [bytecodealliance.org](https://bytecodealliance.org/) · wasmtime / WASI / Component Model 主导组织
  - [wasi.dev](https://wasi.dev/) · WASI 主页
  - [v8.dev/blog](https://v8.dev/blog) · V8 团队 wasm 文章（Liftoff / WasmGC / JSPI）
  - [hacks.mozilla.org](https://hacks.mozilla.org/) · Lin Clark 的 wasm 系列经典插画解释
  - [emscripten.org](https://emscripten.org/) + [rustwasm.github.io](https://rustwasm.github.io/) · 编译路径官方文档
- **目标读者**：已学完 `v8/` `javascript/` `ecma/` `browser-rendering/` 主题的工程师。理解 V8 怎么跑 JS、浏览器怎么渲染像素，现在想知道<strong>除 JS 之外</strong>的代码怎么以 near-native 性能跑在浏览器 + 服务端。
- **不是这个主题的读者**：把 wasm 当"加速 JS 的银弹"的人 —— 本主题会强调 wasm <strong>不是</strong>万能加速器，而是给"JS 不擅长的场景（计算密集 / 既有 C/C++/Rust 代码移植 / 沙箱化插件）"的工具。

---

## 整体设计：7 阶段 · 沿"WASM 平台演化"展开

WebAssembly 不只是"wasm32 ISA"，它有四层：(1) <strong>机器模型</strong>（栈机器 + 沙箱）、(2) <strong>与宿主接口</strong>（imports/exports/memory）、(3) <strong>语言生态</strong>（Rust/C++/Go/Java 等怎么编译过来）、(4) <strong>系统接口</strong>（WASI + Component Model = wasm 的"操作系统"）。我们按这四层 + 历史/同代人 + 高级特性铺开 7 阶段。

| 阶段 | 章数 | 核心问题 |
|---|---|---|
| **P1 · WASM 是谁** | 2 | wasm 30 年的前史（NaCl / asm.js）+ 2015 提案如何成为今天的事实标准 + 同代人对照 |
| **P2 · 机器模型与格式** | 2 | wasm32 栈机器 ISA + 二进制 module 结构 + wat 文本 + 类型系统（含引用类型） |
| **P3 · 与宿主互操作** | 2 | linear memory + Tables + Imports/Exports + JS-WASM 跨边界调用与数据交换 |
| **P4 · 跨语言编译路径** | 2 | Rust / C/C++ / Zig / Go / AssemblyScript / 托管语言（Java/Kotlin/Dart）→ wasm |
| **P5 · 高级特性提案** | 2 | Threads + SIMD + Atomics ｜ WasmGC + Tail call + Exception handling + JSPI |
| **P6 · WASI 与服务端运行时** | 2 | WASI Preview 1 / Preview 2 + capability-based 安全 + wasmtime/wasmer/wazero/WasmEdge |
| **P7 · Component Model 与应用** | 1 | Component Model + WIT + 跨语言互操作 + 典型应用（Figma/Photoshop Web/FFmpeg/SQLite/DuckDB） |

总计 **13 章 ≈ 80,000-90,000 字**，平均每章 6,500 字。

---

## 与既有主题的边界 ——「短重述 + 链回」原则

WASM 主题与 V8 / 浏览器渲染 / Node / Bun 都有显著重叠，必须明确划界：

> ✅ **短重述**：1-3 句话点出"它在底层是什么 + 关键性质"
> ✅ **链回**：紧跟一句"详细的 X / Y / Z 请参考 [`v8/{phase}/{chapter}`]"
> ❌ **不要**直接抄一遍其他主题的论述

**关键边界**：

| 概念 | 在哪讲透 | WASM 主题里怎么处理 |
|---|---|---|
| V8 的 Wasm 编译流水线（Liftoff / TurboFan tier-up） | `v8/06-wasm/01-wasm-pipeline.html` | 链回，仅在 P2.1 讲执行模型时短重述"V8 用 Liftoff 做 baseline" |
| WasmGC 的 V8 实现 | `v8/06-wasm/01-wasm-pipeline.html` | 链回，P5.2 讲 WasmGC 提案语义本身（struct/array 类型 + subtyping），但不展开 V8 内部如何把它放到 V8 cage |
| JSPI（JS Promise Integration）的 V8 实现 | `v8/06-wasm/01-wasm-pipeline.html` | 链回，P5.2 短提"让同步 wasm 调用异步 JS API" |
| Memory64 的 V8 实现 | `v8/06-wasm/01-wasm-pipeline.html` | 链回，P3.1 讲 linear memory 时短提 |
| Cross-Origin Isolated / SAB / COOP/COEP | `browser-rendering/02-multi-process/02-site-isolation.html` | 链回，P5.1 讲 wasm threads 时短重述"必须 cross-origin isolated" |
| ArrayBuffer / TypedArray | `javascript/06-network-storage/` + `ecma/04-types/` | 链回，P3.1 讲 linear memory 时点出"WASM.Memory.buffer 就是 ArrayBuffer" |
| Atomics / SharedArrayBuffer | `ecma/07-execution/05-memory-model.html` | 链回，P5.1 讲 wasm atomic ops 时点出"内存模型基础同 §24" |
| Bun 的 wasm 支持 | `bun/02-internals/` | 链回，P6 讲服务端运行时时对照"JS runtime（Bun/Node/Deno）+ wasm runtime（wasmtime/wasmer）是两种部署模型" |
| Node 对 wasm 的支持 | `node/` | 链回，P3.2 短提 `WebAssembly.instantiate` 在 Node 与浏览器一致 |
| Cloudflare Workers / Edge wasm | `v8/01-overview/02-engine-landscape.html` | 链回，P6 讲服务端 runtime 时短提 Cloudflare 用 V8 isolate 跑 wasm 而非 wasmtime |

---

## 内容覆盖原则 ——「webassembly.org spec 是源头，bytecodealliance + V8 团队博客做实现对照」

1. **优先 webassembly.org / W3C spec / bytecodealliance**：每个机制的"权威定义"必须来自 wasm 工作组规范文档。社区文章只用来佐证。
2. **每个特性都要标"提案 phase"**：Phase 0 → 1 → 2 → 3 → 4 → 5 (standardized)；Phase 4 才能在浏览器默认开启，Phase 5 才进入正式标准。每章涉及提案必标 phase + 主流引擎实现状态（V8 / SpiderMonkey / JSC / wasmtime / wasmer）。
3. **关注"机器模型 vs 实际运行"差距**：spec 定义抽象栈机器，但实际引擎用 register-based JIT 跑；这种差距对性能心智重要。涉及性能时同时引用 spec + V8 / wasmtime 实测。
4. **强调"为什么是 wasm 而不是 X"**：每个机制讲"如果没有 wasm 而用 asm.js / NaCl / WebGL compute 会怎样" —— 用历史对照说明设计动机。

---

## 节奏建议

- **连读组**：
  - P1.1 + P1.2（项目史 → 同代人对照，逻辑链最强）
  - P2.1 + P2.2（机器模型 → 类型系统，必须连读，否则空有 ISA 不知道怎么用）
  - P3.1 + P3.2（内存 → 跨边界调用，互操作完整）
  - P5.1 + P5.2（高级特性两章，可分开但建议连读）
  - P6.1 + P6.2 + P7.1（WASI → runtime → Component Model，"wasm 作为操作系统"完整链条）
- **可独立跳读**：
  - P4 跨语言编译路径相对独立，按需读自己用的语言
- **建议阅读路径**：
  - 浏览器前端工程师：P1 → P2 → P3 → P5（不读 P6/P7）
  - 服务端 / 平台工程师：P1 → P2 → P3 → P6 → P7（P4 按语言挑）
  - 想用 Rust / C++ 写 wasm：P1 → P2 → P3 → P4.1（其他章节按需）

---

## 文件结构

```
wasm/
  01-overview/                     (P1 · WASM 是谁 · 2 章)
    01-history.html                ← NaCl 2009 → asm.js 2013 → wasm 2015 提案 → 2017 MVP → 2025 W3C 2.0
    02-landscape.html              ← 同代人对照：NaCl/PNaCl/asm.js/WebGL2 compute/WebGPU 各自定位与失败/留存原因
  02-machine/                      (P2 · 机器模型与格式 · 2 章)
    01-binary-stack-machine.html   ← wasm32 栈机器 ISA + 二进制 module 结构 + sections + 验证
    02-wat-and-types.html          ← wat 文本格式 + 类型系统（数值/向量/引用类型）+ 类型检查
  03-host-interop/                 (P3 · 与宿主互操作 · 2 章)
    01-memory-tables.html          ← linear memory + Memory64 + Tables（间接调用）+ ArrayBuffer 共享
    02-imports-exports.html        ← Imports/Exports + JS-WASM 跨边界调用 + 数据交换"序列化税" + wasm-bindgen 模式
  04-toolchain/                    (P4 · 跨语言编译路径 · 2 章)
    01-systems-langs.html          ← Rust (wasm-pack/wasm-bindgen) + C/C++ (Emscripten) + Zig
    02-managed-and-others.html     ← Go (gc/tinygo) + AssemblyScript + 托管语言（Java/Kotlin/Dart/.NET → WasmGC）
  05-advanced/                     (P5 · 高级特性提案 · 2 章)
    01-threads-simd.html           ← Threads + SharedArrayBuffer + Atomics + SIMD (v128)
    02-gc-tail-eh-jspi.html        ← WasmGC + Tail call + Exception handling + JSPI（提案语义；V8 实现链回）
  06-wasi-runtime/                 (P6 · WASI 与服务端运行时 · 2 章)
    01-wasi.html                   ← WASI Preview 1 vs Preview 2 + capability-based 安全模型
    02-server-runtimes.html        ← wasmtime / wasmer / wazero / WasmEdge + wasm vs Docker + 冷启动模型
  07-component-model/              (P7 · Component Model 与应用 · 1 章)
    01-component-and-apps.html     ← Component Model + WIT + 跨语言互操作 + 典型应用（Figma/Photoshop/FFmpeg/SQLite/DuckDB）
  index.html
  outline.md
```

---

# P1 · WASM 是谁（2 章）

> 不讲技术细节，只解决两个问题：wasm 17 年（含前史）怎么走到今天、同代人（NaCl / asm.js / WebGL compute / WebGPU）现在的格局是什么。给后面所有"为什么这样设计"提供历史坐标。

## P1.1 · WASM 项目史（2009-2026）

- **定位**：把 wasm 17 年（含 NaCl / asm.js 前史）讲成一条主线 —— 不是按 spec 版本，而是按"每次范式转移及其根因"。
- **关键节点**：
  - **2009 · Google Native Client (NaCl)**：在浏览器里直接跑 x86/ARM native 代码 + 沙箱（基于 SFI 软件错误隔离）；只在 Chrome 内 work，跨平台困难
  - **2011 · PNaCl**：NaCl 的 portable 版本，用 LLVM bitcode；体积大、启动慢、生态差
  - **2013-03 · Mozilla asm.js**：Alon Zakai 在 Firefox 提出 "JS 的严格子集" 跑 native 性能 —— 不是新语言，是 JS engine 优化的 hint；Emscripten 编译 C/C++ → asm.js 让 Unreal Engine 4 跑在浏览器
  - **2015-04 · WebAssembly 提案**：Mozilla / Google / Microsoft / Apple 四大引擎团队<strong>罕见联合</strong>；目标是"asm.js 的二进制版 + 多语言 + 跨引擎"
  - **2017-03 · WebAssembly MVP**：四大浏览器同时启用；功能极小（只有 i32/i64/f32/f64 + 线性内存 + 基本控制流）
  - **2019-12 · W3C 推荐标准 1.0**：Wasm 1.0 成为正式 W3C Recommendation；与 HTML / CSS / DOM 同等地位
  - **2019-12 · Bytecode Alliance 成立**：Mozilla / Fastly / Intel / Red Hat 联合推动 wasm 走出浏览器（WASI / wasmtime）
  - **2020-04 · WASI Preview 1**：第一版 wasm 系统接口（POSIX 风格的 fd_read / fd_write / clock_time_get 等）
  - **2022-2023 · WasmGC 落地**：Java / Kotlin / Dart / Scala / OCaml 等托管语言能高效编译到 wasm；2023 V8 / SpiderMonkey 同时启用
  - **2023-04 · Component Model + WASI Preview 2 提案合并**：放弃 POSIX 风格，转向 capability-based + WIT 接口定义；wasm 成为"跨语言的二进制库格式"
  - **2025-03 · WebAssembly 2.0 W3C Recommendation**：SIMD / bulk memory / reference types / multi-value 全部正式化
  - **2026 · Component Model Preview 2**：跨语言互操作走向生产；Cloudflare / Fastly / Vercel 等 edge 平台押注
- **底层逻辑要点**：
  - **NaCl 失败、asm.js 部分成功、wasm 全面成功的根因**：NaCl 锁定 Chrome；asm.js 是 hack（标注的 JS）跨引擎但效率有上限；wasm 一开始就是<strong>四大引擎联合 + 独立二进制格式 + 多语言</strong>，每条都吸取了前面的教训
  - **2015 四大引擎联合的稀有性**：浏览器引擎团队历史上极少这种联合（HTML5 之后最大一次）；说明业界共识"JS 之外需要一条性能通道"
  - **wasm 走出浏览器（WASI）的时机**：2019 Cloudflare Workers / Fastly Compute@Edge 等 edge 平台需要"轻量沙箱 + 快速冷启动"，比 Docker 容器快两个数量级 —— 这是 wasm "服务端化"的真正驱动力
  - **Component Model 是 WASI 的"重启"**：Preview 1 复制 POSIX 失败（POSIX 假设单语言、可信进程，wasm 是多语言、不可信沙箱）；Preview 2 转向 capability-based + WIT 是承认这个差距
- **预估字数**：6,500-7,500

## P1.2 · 同代人对照：NaCl / asm.js / WebGL2 compute / WebGPU

- **定位**：横向对照章。讲清"想在浏览器跑性能代码"的所有方案各自做了什么不同选择，wasm 凭什么活下来。
- **关键知识点**：
  - **NaCl / PNaCl (2009-2017)**：x86/ARM native + SFI 沙箱；Chrome only；2017 随 Chrome 弃用而死
  - **asm.js (2013-2018)**：JS 的严格子集 + AOT 编译；跨引擎但<strong>不是真二进制</strong>，下载体积大；2018 后基本被 wasm 替代
  - **WebGL2 / GPU compute (2017+)**：用 GPU shader 跑通用计算；并行度高但限制极多（不能任意控制流 / 不能链接 C 库）
  - **WebGPU (2023+)**：现代 GPU API，比 WebGL 更灵活；但仍是"GPU 优先"，不能跑通用 CPU 代码
  - **WebAssembly (2017+)**：跨引擎二进制 + 多语言 + CPU 通用；唯一活到今天的"通用性能通道"
- **设计选择对比**：
  | 维度 | NaCl/PNaCl | asm.js | WebGL2/WebGPU compute | WebAssembly |
  |---|---|---|---|---|
  | 跨引擎 | ❌ Chrome only | ✅ 全引擎 | ✅ 全引擎 | ✅ 全引擎 |
  | 二进制格式 | ✅ ELF/PEXE | ❌ JS 文本 | ❌ shader 文本 | ✅ 紧凑二进制 |
  | 编译目标 | C/C++ | C/C++ | shader 语言 | 50+ 语言 |
  | 性能 | native | 50-80% native | GPU 并行强 | 80-95% native |
  | 生态 | 死 | 死 | 活但小众 | 蓬勃 |
  | 服务端 | ❌ | ❌ | ❌ | ✅ WASI |
- **底层逻辑要点**：
  - **跨引擎是底线**：NaCl 失败的核心原因不是技术烂，是 Apple/Mozilla 不接受 Chrome 单家方案；wasm 一开始就是 4 家联合
  - **二进制格式是"非可选"**：asm.js 跨引擎但下载体积大、parse 慢；wasm 紧凑二进制 + streaming compile 是"性能心智"基础
  - **CPU vs GPU 不是替代而是互补**：wasm 跑通用 CPU 代码（控制流复杂、串行也可），WebGPU 跑大规模并行（图像/AI 推理）；典型应用如 Figma 用 wasm 跑布局引擎 + WebGPU 跑 GPU 加速渲染
  - **wasm 走出浏览器是 NaCl 没做到的事**：NaCl 死了 → asm.js 死了 → wasm 不仅活了，还把战场扩到 edge / 嵌入式 / 区块链
- **关联章节**：[`v8/06-wasm/01-wasm-pipeline.html`]
- **预估字数**：6,000-7,000

---

# P2 · 机器模型与格式（2 章）

> wasm 不只是"另一种字节码"——它的<strong>栈机器 + 二进制 module + 强类型 + 流式验证</strong>每一项都和性能 / 安全设计紧密绑定。这一阶段把它讲透。

## P2.1 · 二进制格式与栈机器执行模型

- **定位**：讲清 wasm32 ISA 是什么 + module 二进制怎么组织 + 引擎怎么读它。
- **关键知识点**：
  - **wasm32 是栈机器（stack machine）**：所有指令在隐式操作数栈上 push/pop；如 `i32.const 5; i32.const 3; i32.add` 把 5/3 push 后弹出相加压回 8
  - **为什么栈机器（不是寄存器机器）**：(1) 二进制紧凑（不需要寄存器编号）、(2) 验证简单（typing 推导）、(3) 引擎自由 —— 实际 V8 / wasmtime 都把栈机器再编译成寄存器机器
  - **二进制 module 结构**：magic header `\0asm` + version + sections（Type/Import/Function/Table/Memory/Global/Export/Start/Element/Code/Data/DataCount/Custom）
  - **每个 section 是 LEB128 编码 + length prefix**：流式可读 —— 引擎能边下载边 parse 边验证（streaming compilation）
  - **Function 段是核心**：每个函数体是字节码序列，按局部变量声明 + 指令序列展开
  - **验证（validation）阶段**：load 时静态推导每条指令的栈类型 + 检查类型一致 + 检查内存/table 边界 —— wasm 的安全保证不是 runtime check 而是 load-time 验证
  - **执行模型**：解释器（参考实现）/ baseline JIT (Liftoff) / optimizing JIT (TurboFan)；本章讲抽象语义，V8 具体管线链回 v8/06-wasm
- **关键性能机制**：
  - **streaming compilation**：边下载边编译；浏览器优化关键
  - **AOT (Ahead-of-Time)**：wasmtime / wasmer 把 wasm 提前编译成 native 二进制缓存
  - **module caching**：浏览器缓存编译后的 wasm，下次 instantiate 不重编
- **底层逻辑要点**：
  - **栈机器抽象 + 寄存器机器实际执行的差距**：写 wat 看到的是栈，跑起来不是；性能心智不能基于"栈操作多慢"
  - **load-time validation 是 wasm 安全模型的核心**：与 JVM/CLR 不同，wasm 不允许"先 load 后逐渐发现错误"；要么 module 整个验证通过，要么直接拒绝。这让 wasm 沙箱成本极低
  - **module 二进制的可解析性**：每个 section 自描述 + 长度前缀，让 streaming + 增量编译成为可能
- **关联章节**：[`v8/06-wasm/01-wasm-pipeline.html`]、[`ecma/03-spec-reading/01-spec-grammar.html`]
- **预估字数**：7,000-8,000

## P2.2 · wat 文本格式 + 类型系统

- **定位**：wasm 的"汇编"。讲清 wat 怎么读 + 类型系统（值类型 / 引用类型）怎么工作。
- **关键知识点**：
  - **wat (WebAssembly Text format)**：S-expression 语法；与二进制 1:1 对应；调试 / 学习 / 手写小模块用
  - **wat 工具链**：`wat2wasm` / `wasm2wat`（wabt 提供）；`wasm-tools`（bytecodealliance）
  - **数值类型**：`i32` / `i64` / `f32` / `f64`（MVP）；`v128`（SIMD，2.0 正式）
  - **引用类型（reference types, 2.0 正式）**：`funcref`（函数引用）、`externref`（宿主对象引用，opaque）
  - **类型签名**：函数签名 = 参数类型列表 → 返回类型列表；multi-value 让多返回值成为一等公民
  - **局部变量 + 参数**：函数入口处声明 locals；参数也是 locals（按顺序）
  - **控制流指令**：`block` / `loop` / `if` / `br` / `br_if` / `return`；都用<strong>结构化控制流</strong>（不像汇编可以任意跳）
  - **结构化控制流的好处**：load-time 可验证 + 不会跳到指令中间 + 编译器易优化
  - **类型检查（validation）规则**：每条指令的栈类型变化是确定的；逐条推导即可验证整个函数
- **关键性能机制**：
  - **multi-value 返回**：避免栈分配返回 struct
  - **局部变量寄存器分配**：编译器把 wasm locals 映射到 native 寄存器；frequent locals 不会真的进栈
- **底层逻辑要点**：
  - **wat 是给人看的，不是给机器看的**：实际部署用二进制；wat 仅在调试 / 教学 / 手写极小模块时用
  - **结构化控制流 vs 任意 goto**：wasm 一开始就拒绝任意 goto，因为它让验证和优化都困难；这是 wasm 区别于 NaCl 的关键设计
  - **强类型 + load-time check 的安全保证**：不允许"运行到某条指令才发现类型错"；module 加载即验证完成。这种设计让 wasm 能放心进沙箱
  - **引用类型解决了 "wasm 能存 JS 对象吗" 的问题**：MVP 时 wasm 只能存数值，要存 JS 对象要绕道；2.0 reference types 让 `externref` 直接持有 JS 引用
- **预估字数**：6,500-7,500

---

# P3 · 与宿主互操作（2 章）

> wasm 是"嵌入式"语言，单独跑没意义 —— 必须和宿主（浏览器 / Node / wasmtime）交换数据。这一阶段两章讲清内存 + 接口。

## P3.1 · Linear Memory + Tables

- **定位**：wasm 怎么管理内存 + 怎么间接调用函数。
- **关键知识点**：
  - **Linear Memory**：连续 byte 数组；以 64KB 为页（page）单位；初始 N 页 + max 页声明
  - **`memory.grow` 指令**：动态扩容；返回旧 size 或 -1（失败）
  - **Memory 是 wasm module 的资源**：每模块默认 1 个 memory（multi-memory 提案 phase 4 让多个）
  - **JS 端访问**：`WebAssembly.Memory` 对象；`.buffer` 是 `ArrayBuffer`，可被 TypedArray view（`Uint8Array(memory.buffer)`）
  - **Memory64 提案（V8 11+ phase 4）**：64-bit 索引，让 SQLite-WASM / DuckDB-WASM 等大数据应用可用
  - **Tables**：另一种"内存"，但元素是<strong>函数引用</strong>（funcref）或 externref；用于间接调用（C/C++ 的函数指针、动态分发）
  - **`call_indirect`**：通过 table 索引 + 类型签名调用；动态调度的基础
  - **Element segments**：初始化 table 内容
  - **Data segments**：初始化 memory 内容
  - **Bulk memory ops（2.0 正式）**：`memory.copy` / `memory.fill` / `memory.init` / `memory.drop`
- **关键性能机制**：
  - **memory 的连续性 + bounds check**：每次访问需检查偏移；现代引擎用 mmap + guard pages 让 bounds check 几乎零成本
  - **Memory 是 SAB-able（Threads 提案）**：声明 `shared` 后多个 wasm 实例共享同一 memory（详见 P5.1）
  - **Memory64 的代价**：64-bit pointer 让代码体积变大；只在真需要 > 4GB 时启用
- **底层逻辑要点**：
  - **wasm 内存与 JS 堆完全隔离**：wasm linear memory 不在 V8 GC 堆里，是独立 ArrayBuffer；这让 wasm GC 不会触发 V8 GC，也让 JS 不能直接访问 wasm 对象
  - **Tables 是函数指针的替身**：因为 wasm 不暴露函数地址（安全），所以"动态调用"用 table 索引；C/C++ 的 vtable / 函数指针都编译成 table + call_indirect
  - **wasm 没有指针 / 引用 / 对象（在 MVP）**：所有"复杂数据结构"都要序列化到 linear memory；这是 P3.2 讲的"序列化税"根源
- **关联章节**：[`v8/06-wasm/01-wasm-pipeline.html`]、[`javascript/06-network-storage/`]（ArrayBuffer / TypedArray）
- **预估字数**：7,000-8,000

## P3.2 · Imports / Exports + 跨边界调用

- **定位**：wasm 模块怎么和宿主交换"代码 + 数据"。
- **关键知识点**：
  - **Imports**：声明从宿主导入的函数 / memory / table / global；模块 instantiate 时由宿主提供
  - **Exports**：声明导出的函数 / memory / table / global；让宿主可以调用 / 访问
  - **JS API：WebAssembly.instantiate(buffer, importObject)**：核心入口；返回 `{ module, instance }`
  - **WebAssembly.instantiateStreaming(fetch(url), importObject)**：流式编译 + 实例化
  - **跨边界调用 (cross-boundary calls)**：JS 调 wasm 导出函数 vs wasm 调导入的 JS 函数；两边性能不对称
  - **JS-to-WASM**：JS 调 wasm 导出函数；现代引擎几乎零开销（直接 native call）
  - **WASM-to-JS**：wasm 调导入的 JS 函数；需要从 wasm 寄存器搬到 JS 调用约定 + 处理 GC barrier；开销大
  - **数据交换的"序列化税"**：复杂数据（字符串 / 对象 / 数组）必须穿越 linear memory ↔ JS 堆；典型方案 wasm-bindgen / emscripten Embind 自动生成 glue
  - **wasm-bindgen 模式**：Rust → wasm 时，宏自动生成 JS glue：函数签名转换 + 字符串编码 + 对象引用计数
  - **Emscripten 的 Embind**：C++ 端类似机制
- **关键性能机制**：
  - **Tier-up + inline call**：JS-WASM 频繁调用时，V8 把 wasm 函数 inline 进 JS turbofan；几乎消除调用开销
  - **externref 直传**：2.0 后 JS 对象可作为 externref 直接传给 wasm，不必序列化
  - **JSPI（JS Promise Integration）**：让同步 wasm 调用异步 JS 而不阻塞事件循环（详见 P5.2，链回 v8）
- **底层逻辑要点**：
  - **跨边界调用不是"几乎免费"**：传基础类型 i32/i64 几乎免费；传字符串 / 对象需要 marshalling；高频跨边界调用是 wasm 性能反模式
  - **wasm-bindgen 自动生成 glue 是必要而非"hack"**：手写 marshalling 出错率极高，bindgen 把"调用约定 + 类型映射"标准化
  - **wasm 性能心智："在 wasm 内做大块 work，少跨边界"**：典型反模式是"在 JS 里循环调 wasm 单步"，每次调用 marshalling 开销吃掉性能
  - **WebAssembly.compile vs instantiate**：compile 只 parse + 验证 + 编译，可序列化缓存；instantiate 给定 imports 创建 instance；解耦让"编译一次、多处实例化"成为可能
- **关联章节**：[`javascript/03-async/`]、[`v8/06-wasm/01-wasm-pipeline.html`]
- **预估字数**：7,000-8,000

---

# P4 · 跨语言编译路径（2 章）

> wasm 的<strong>多语言</strong>是它最大的差异化。这一阶段两章覆盖系统语言（Rust/C++/Zig）+ 托管语言 / 其他语言（Go/AssemblyScript/Java/Kotlin/Dart/.NET）。

## P4.1 · 系统语言 → wasm：Rust / C/C++ / Zig

- **定位**：手动内存管理 + LLVM 后端语言怎么编译到 wasm。
- **关键知识点**：
  - **Rust → wasm**：`rustc --target wasm32-unknown-unknown` 直接产出；`wasm-pack` + `wasm-bindgen` 工具链生成 npm 包 + JS glue
  - **wasm-bindgen 宏体系**：`#[wasm_bindgen]` 标注函数 / struct / 字符串自动 marshalling；生成 `.wasm` + `.js` glue
  - **Rust 是 wasm 一等公民**：因为 LLVM 后端 + 无 runtime（不像 Go 带 GC）+ 包管理 cargo 完美 + Mozilla 推动；70%+ 生产 wasm 用 Rust
  - **C/C++ → wasm via Emscripten**：Emscripten = clang + 模拟 POSIX runtime（fopen/printf 等）+ JS glue 生成
  - **Emscripten 的 "兼容层" 哲学**：让 C/C++ 代码不改源就能跑，宏 `__EMSCRIPTEN__` 区分；代价是产物体积大（带 libc 模拟）
  - **Zig → wasm**：原生支持 wasm32 / wasm64 target；编译器内置，无需 emscripten；Zig 的"显式分配"哲学与 wasm 内存模型契合
  - **WASI 目标 vs no_std 目标**：`wasm32-wasi` 目标导入 WASI 函数（fs / env），`wasm32-unknown-unknown` 是裸 wasm（只能用 imports 自己提供）
- **关键性能机制**：
  - **wasm-opt (binaryen)**：post-link 优化器；compile 后再跑 -O3，体积 / 性能都改善
  - **wasm strip**：去 debug symbols，体积明显减小
  - **代码体积管理**：Rust + wasm 的 hello world 默认 ~150KB；用 `panic = "abort"` + `lto = "fat"` + `codegen-units = 1` + wasm-opt 能压到 ~10KB
- **底层逻辑要点**：
  - **Rust + wasm 成为黄金组合的根因**：(1) LLVM 后端、(2) 无 GC（不需要拖个运行时）、(3) wasm-bindgen 自动 glue、(4) Cargo 生态、(5) Mozilla 同时推 Rust 和 wasm
  - **Emscripten 的"模拟 POSIX"和 wasm 哲学冲突**：wasm 设计上"无环境假设"，Emscripten 偷偷塞了一个 libc 模拟；产物变重 + 启动慢；现代趋势是用 WASI 代替 Emscripten
  - **C/C++ 的内存安全问题在 wasm 里被沙箱隔离了**：C/C++ 的 buffer overflow 写不出 wasm sandbox 外；这是 wasm 给 C/C++ 的"额外保险"
- **关联章节**：[`bun/02-internals/`]（Zig 语言）
- **预估字数**：7,000-8,000

## P4.2 · 托管语言 + 其他：Go / AssemblyScript / Java / Kotlin / Dart / .NET

- **定位**：带 runtime / GC 的语言怎么编译到 wasm。
- **关键知识点**：
  - **Go → wasm 的两条路**：(1) 官方 `GOOS=js GOARCH=wasm` —— 带完整 GC runtime，体积大（~2MB），启动慢；(2) TinyGo —— 子集编译器，体积小（~50KB），但缺一些标准库
  - **AssemblyScript**：TypeScript 子集 → wasm；语法亲切（前端工程师无障碍）但有 GC + 性能不及 Rust
  - **WasmGC（2023 phase 5）的意义**：让<strong>托管语言</strong>不必带自己的 GC runtime，直接用宿主 GC；Java/Kotlin/Dart/.NET/OCaml 的官方 wasm target 都基于 WasmGC
  - **WasmGC 类型**：`struct`（字段集合）+ `array`（同构数组）+ subtyping；wasm 引擎实现 GC（V8 / SpiderMonkey 共用 JS GC）
  - **Java → wasm via TeaVM / CheerpJ**：早期方案是"带个 JVM 跑"，体积惊人；现在转 WasmGC
  - **Kotlin/Wasm**：JetBrains 官方 target；基于 WasmGC；让 Compose Multiplatform 跑在 Web
  - **Dart → wasm**：Flutter Web 转 wasm 部署；2024 起替代 dart2js
  - **.NET → wasm via Blazor**：早期 Blazor WebAssembly 带 mono runtime（慢）；2024+ 转 NativeAOT + WasmGC
  - **Python → wasm via Pyodide**：CPython 编译 wasm + 数值库；体积大（~10MB+），但生态完整
- **关键性能机制**：
  - **WasmGC 性能 ~2x 自带 GC**：因为引擎 GC 已优化、不需要重复扫描堆
  - **TinyGo 的子集策略**：放弃 `reflect` / 完整 `runtime` 换体积；适合嵌入式 / Edge
  - **代码体积 vs 启动时间 vs runtime 完整性**：托管语言三角；项目按场景选
- **底层逻辑要点**：
  - **WasmGC 是托管语言的转折点**：2023 之前 Java/Kotlin/Dart 编译 wasm 都是"工程奇迹"——带 runtime 太重；2023+ 这些语言变成"一等公民"
  - **Go 自带 GC + 不接受 WasmGC 的根因**：Go runtime 强耦合自己的 GC（写 barrier / GMP 调度）；WasmGC 不能直接接管。所以 Go 仍用 `GOOS=js`（自带 GC）+ TinyGo（精简版自带 GC）两条路
  - **Pyodide 不是"Python 编译 wasm"，是"CPython 解释器编译 wasm"**：在 wasm 里跑 Python 解释器，性能比原生 CPython 慢 2-5x；适合数值计算 + 教育，不适合 hot path
- **关联章节**：[`v8/04-memory/02-orinoco-gc.html`]（V8 GC，被 WasmGC 复用）
- **预估字数**：7,000-8,000

---

# P5 · 高级特性提案（2 章）

> Threads / SIMD / WasmGC / Tail call / Exception handling / JSPI 是 wasm 2.0+ 的关键演化。这一阶段两章覆盖。

## P5.1 · Threads + SIMD + Atomics

- **定位**：wasm 的并行能力。
- **关键知识点**：
  - **Threads 提案（phase 4）**：基于 Web Worker + SharedArrayBuffer；每个 worker 跑一个 wasm instance，共享 memory
  - **SharedArrayBuffer 限制**：必须 cross-origin isolated（COOP/COEP，链回 browser-rendering/02-multi-process/02-site-isolation.html）
  - **Atomic ops（atomic.wait / atomic.notify / atomic.rmw）**：在共享 memory 上做原子操作；与 ECMA §24 内存模型对接
  - **典型应用**：FFmpeg.wasm 多线程编解码、SQLite WASM 多线程、游戏物理引擎
  - **SIMD 提案（v128, 2.0 正式）**：128-bit 向量类型；x86 SSE / ARM NEON 都映射到这一抽象
  - **SIMD 指令集**：load/store/swizzle/shuffle/算术/比较/转换；约 200+ 指令
  - **autovectorization vs explicit SIMD**：编译器自动向量化（emscripten -msimd128）+ 手写 intrinsics（更精细）
  - **典型场景**：图像滤镜、音视频编解码、机器学习推理
  - **Wasm-to-Wasm threads 限制**：wasm threads 必须从同一 module 实例化的 worker；不能跨 module 直接共享
- **关键性能机制**：
  - **threads + SIMD 叠加**：现代 wasm 性能上限通常 = 单线程 SIMD 4x + 4 threads = 16x；接近 native
  - **memory64 + threads**：互斥（spec 限制；多 memory 提案部分解决）
- **底层逻辑要点**：
  - **threads 的部署门槛**：必须 cross-origin isolated；很多 SaaS 嵌入第三方资源（CDN / 广告 / 分析）的网站根本开不了；这是 wasm threads 在生产中"理论可用、实际罕见"的根因
  - **SIMD 跨 CPU 抽象的代价**：v128 是"最小公约数"——AVX-512 的精细向量在这里折衷；但跨 CPU 一致性 > 单 CPU 极致性能
  - **wasm 的"多线程不是免费"**：每个 worker 是 OS 线程；启动开销不小；适合大粒度任务，不适合细粒度并行
- **关联章节**：[`browser-rendering/02-multi-process/02-site-isolation.html`]、[`ecma/07-execution/05-memory-model.html`]、[`v8/06-wasm/01-wasm-pipeline.html`]
- **预估字数**：7,000-8,000

## P5.2 · WasmGC + Tail call + Exception handling + JSPI

- **定位**：让 wasm 适配更多语言场景的 4 个提案。
- **关键知识点**：
  - **WasmGC（phase 5, 2023 正式）**：引入 `struct` / `array` / `i31ref` 类型 + subtyping；引擎 GC 接管；详见 P4.2
  - **WasmGC 类型层级**：`anyref` ⊃ `eqref` ⊃ `i31ref` / `structref` / `arrayref`；类型 down-cast 用 `ref.cast`
  - **WasmGC 的开销**：引擎 GC 对 wasm 对象做扫描；写 barrier 开销；总体仍比"自带 GC runtime"快 ~2x
  - **Tail call 提案（phase 5, 2024 正式）**：`return_call` / `return_call_indirect`；让函数式语言（OCaml / Scala / Scheme）的尾递归可正确编译
  - **Exception handling 提案（phase 4）**：`try` / `catch` / `throw` / `rethrow`；让 C++ 异常 / Java throw / JS throw 在 wasm 内可表达
  - **EH 之前的"模拟"方案**：用 setjmp/longjmp（emscripten 早期方案）+ 全局 trampoline；性能差，已被 EH 替代
  - **JSPI (JS Promise Integration, phase 4)**：让<strong>同步 wasm 调用</strong>异步 JS API；典型场景：编译到 wasm 的代码用 `read_file()` 同步语义，wasm 在底层 await JS Promise
  - **JSPI 实现**：Stack switching —— wasm 栈被保存，主线程让出，promise 完成后栈恢复；详见 V8 实现链回
- **关键性能机制**：
  - **WasmGC 让 Java / Kotlin / Dart 启动时间从"秒级"变"毫秒级"**：之前要拖 JVM/runtime；现在直接复用宿主 GC
  - **Tail call 让函数式语言可生产部署**：之前 OCaml/Scala 编译 wasm 要用 trampoline 模拟（性能差），tail call 后 native 性能
  - **JSPI 解锁的场景**：把同步 IO 假设的代码（如 SQLite C 代码）原样跑在浏览器；之前要重写成异步
- **底层逻辑要点**：
  - **WasmGC 不是"通用 GC API"**：spec 不暴露 mark/sweep/compact 控制；引擎自由实现（V8 用现有 Orinoco，SpiderMonkey 用自己的）
  - **EH 的 "two-phase" 设计**：try/catch 的查找阶段 + unwind 阶段分离；和 C++ EH 模型一致；让现有 C++ EH 代码可直接编译
  - **JSPI 是"黑科技"但生产可用**：Chrome 137 默认开启；让 wasm 不用全面异步重构就能调 fetch / IndexedDB
- **关联章节**：[`v8/06-wasm/01-wasm-pipeline.html`]、[`v8/04-memory/02-orinoco-gc.html`]
- **预估字数**：7,000-8,000

---

# P6 · WASI 与服务端运行时（2 章）

> wasm 走出浏览器是它最大的"超出预期" —— 服务端运行时让 wasm 与 Docker 直接竞争。这一阶段两章把它讲透。

## P6.1 · WASI Preview 1 vs Preview 2 + Capability-based 安全

- **定位**：讲清 WASI 是什么、为什么 Preview 1 不够、Preview 2 怎么解决。
- **关键知识点**：
  - **WASI = WebAssembly System Interface**：让 wasm 在浏览器外（服务端 / Edge / 嵌入式）有"系统接口" —— 文件 / 网络 / 时钟 / 环境变量
  - **WASI Preview 1 (2020-2022)**：POSIX 风格 imports（`fd_read` / `fd_write` / `fd_open` / `clock_time_get` / `random_get`）；广泛实现但有缺陷
  - **Preview 1 的设计缺陷**：(1) 复制 POSIX 但 wasm 没有进程概念，fork/exec 怎么办？(2) 网络模型不完整（仅 socket fd 抽象，没 DNS / TLS）；(3) 不支持 async；(4) 没有"接口定义"标准
  - **Preview 2 (2024 正式 minor，2026 完善)**：转向<strong>Component Model</strong>+ <strong>WIT (WebAssembly Interface Types)</strong>；不再模仿 POSIX，而是用接口契约
  - **Capability-based 安全模型**：宿主显式授予 wasm 能力（如"只能读这个目录"、"只能连这个域名"）；与 Docker 的"全部 sandbox + Linux capabilities" 不同 —— 更细粒度
  - **wasi:io / wasi:filesystem / wasi:http / wasi:clocks / wasi:random**：Preview 2 的 worlds（接口集合）
  - **wasi:http** vs Cloudflare/Fastly fetch API：标准化进行中；2026 仍未完全统一
- **关键性能机制**：
  - **Preview 1 → Preview 2 迁移成本**：现有库（Rust wasi crate, Go wasi syscall）大量基于 Preview 1；Preview 2 重写中
  - **Component Model 让"WASI 兼容性"变成"WIT 接口兼容性"**：换 runtime 不需要重编 wasm
- **底层逻辑要点**：
  - **WASI 不是 POSIX 重新实现**：wasm 没有进程 / 信号 / 共享内存（除非 threads）；硬套 POSIX 注定失败。Preview 1 是过渡，Preview 2 才是"wasm 原生"系统接口
  - **Capability-based 是 wasm 沙箱的根本优势**：Docker 启动后能做的事由 Linux capabilities 决定（粗粒度），wasm 启动时只有宿主 explicitly 授予的 imports（细粒度）；这让 wasm 适合"运行不可信第三方代码"（plugin 平台、edge functions）
  - **wasi:http vs 浏览器 fetch**：浏览器 fetch 是 "事实标准"但绑死浏览器；wasi:http 想做"跨 runtime 的 fetch"，但 Cloudflare/Fastly 已自家实现，标准化推进慢
- **预估字数**：7,000-8,000

## P6.2 · 服务端 Runtime：wasmtime / wasmer / wazero / WasmEdge

- **定位**：浏览器外跑 wasm 的运行时家族 + wasm vs Docker 比较。
- **关键知识点**：
  - **wasmtime (Bytecode Alliance)**：Rust 实现；Cranelift 后端；事实标准；Fastly Compute@Edge 用它
  - **wasmer**：Rust 实现；多后端（Cranelift / LLVM / Singlepass）；商业公司；混合开源
  - **wazero (Tetrate)**：纯 Go 实现；零 C 依赖；适合 Go 项目嵌入 wasm 插件
  - **WasmEdge (CNCF)**：C++ 实现；针对 cloud-native + AI 推理优化；CNCF 项目
  - **V8/SpiderMonkey/JSC 在服务端**：Cloudflare Workers / Deno / Node 通过 V8 跑 wasm（不用 wasmtime）；优势是与 JS 共享 runtime，劣势是 wasm-specific 优化少
  - **wasm 部署模型对比 Docker**：
    | 维度 | Docker | wasm runtime |
    |---|---|---|
    | 冷启动 | 100ms-1s | < 1ms (AOT) |
    | 内存基线 | 50MB+ | < 1MB |
    | 安全 | Linux namespace / cgroup | capability-based + memory sandbox |
    | 跨平台 | 需 build per arch | 一次编译跑所有 |
    | 生态 | OCI 镜像、k8s、各种 service mesh | 起步 |
    | 系统能力 | 完整 Linux | WASI 子集 |
  - **典型应用**：Cloudflare Workers (V8 isolate) / Fastly Compute@Edge (wasmtime) / Vercel Edge / Shopify Functions / Envoy proxy 插件 / 区块链智能合约（Polkadot / Internet Computer）
- **关键性能机制**：
  - **AOT 编译 + 缓存**：wasmtime 把 wasm 提前编译成 native shared object 缓存；下次启动直接 mmap，毫秒级
  - **module instantiation pooling**：每请求 new instance（隔离）但复用编译产物
  - **fuel metering（gas counting）**：每条 wasm 指令计费；让 multi-tenant 平台限制单 module 占用
- **底层逻辑要点**：
  - **wasm 不会取代 Docker，而是补足"边缘 / 插件 / 多租户"场景**：Docker 适合长生命周期、整机系统镜像；wasm 适合短生命周期、按请求实例化、不可信代码
  - **Cloudflare 选 V8 isolate 不选 wasmtime 的根因**：他们已有 V8 平台（Workers），加 wasm 几乎零成本；wasmtime 适合"只跑 wasm"的纯 wasm 平台
  - **wazero 纯 Go 的特殊价值**：让 Go 应用嵌入 wasm 不需要 CGO；典型场景 Envoy 代理 / Hashicorp 工具链 / Tetrate Service Bridge
- **关联章节**：[`bun/02-internals/`]、[`v8/05-embedding/01-embedder-api.html`]
- **预估字数**：7,000-8,000

---

# P7 · Component Model 与典型应用（1 章）

> wasm 2026 的"未来"在 Component Model + WIT —— 让 wasm 真正成为"跨语言的二进制库格式"。本阶段一章把它和典型应用一起讲。

## P7.1 · Component Model + WIT + 典型应用

- **定位**：讲清 Component Model 是什么、WIT 怎么定义接口、为什么这是 wasm 终极形态 + 现今 wasm 的杀手级应用。
- **关键知识点**：
  - **Component Model**：wasm core module 之上的封装层 —— 加上"接口、类型、链接"概念
  - **Component vs Module 的区别**：core module 只有 i32/i64/f32/f64/v128 + memory + table + funcref/externref；component 有 string / list / record / variant / option / result 等高级类型
  - **WIT (WebAssembly Interface Types)**：IDL；定义函数签名 + 类型；类似 protobuf / thrift 但 wasm 原生
  - **WIT 的 world 概念**：一组 imports + exports = 一个 world；是 "wasm 想要的环境契约"
  - **跨语言互操作的黄金路径**：Rust 写组件 A → 编译 wasm component → 通过 WIT 接口被 Go 写的组件 B 调用；不需要 C ABI / FFI
  - **Wasm Components 工具链**：`wasm-tools` / `wit-bindgen`（生成各语言 binding）/ `cargo-component`（Rust）
  - **典型应用**：
    - **Figma**：核心布局引擎用 C++ 编译 wasm（2017+）；浏览器内跑接近 native 性能
    - **Photoshop Web (Adobe)**：完整 Photoshop C++ 代码库 → wasm + WebGPU；2023 上线
    - **Google Earth Web**：C++ 引擎 → wasm；浏览器内 3D 地球
    - **FFmpeg.wasm**：FFmpeg → wasm；浏览器内视频转码
    - **SQLite WASM (官方)**：SQLite → wasm + OPFS；让浏览器内有真正的 SQL 数据库
    - **DuckDB-WASM**：分析型数据库 → wasm；浏览器内做 OLAP
    - **Pyodide**：CPython → wasm；Jupyter / Streamlit 在浏览器
    - **Roblox Studio**：客户端 wasm + Lua VM
    - **Shopify Functions**：商家用 Rust/JS 写的 wasm 插件，在 Shopify 平台沙箱执行
    - **Envoy Wasm Plugins**：服务网格的扩展点
    - **区块链智能合约**：Polkadot (Substrate) / Internet Computer / NEAR 等用 wasm 作为智能合约 VM
- **关键性能机制**：
  - **canonical ABI**：Component Model 定义跨组件传字符串 / list 的标准 ABI；不同语言实现的组件能互通
  - **shared-nothing linking**：组件之间默认不共享 memory（隔离）；通过 ABI marshalling 传数据
- **底层逻辑要点**：
  - **Component Model 的野心**：让 wasm 成为"跨语言的二进制库格式" —— 一个 Rust 库可以被 Go / Java / Python 项目作为 wasm component 引用，不需要 FFI / CGO / JNI
  - **为什么 Component Model 推得慢**：(1) 工具链复杂、(2) 语言生态都在自己的 binding 上花精力、(3) 没有"必杀场景"逼大家迁移；Bytecode Alliance 在用 Cloudflare/Fastly 等大客户驱动
  - **wasm "杀手级应用"的特征**：(1) 既有 C/C++/Rust 大代码库（Figma/Photoshop/FFmpeg/SQLite）、(2) 性能敏感（无法用 JS 实现）、(3) 不需要深度 OS 集成（不调系统 API）；满足这三条 wasm 是降维打击
  - **wasm 不擅长的**：(1) 频繁调 DOM（跨边界税）、(2) 短小工具（启动开销 + glue 体积）、(3) 现有 JS 库已 mature 的场景（不要为了 wasm 而 wasm）
- **关联章节**：[`react/`]（与前端框架的协作）、[`v8/06-wasm/01-wasm-pipeline.html`]
- **预估字数**：8,000-9,000

---

## 附：参考资料汇总

**官方一手**：
- [webassembly.org](https://webassembly.org/) · 官方主页
- [github.com/WebAssembly/spec](https://github.com/WebAssembly/spec) · W3C 规范源
- [github.com/WebAssembly/proposals](https://github.com/WebAssembly/proposals) · 提案进度
- [github.com/WebAssembly/component-model](https://github.com/WebAssembly/component-model) · Component Model + WIT
- [bytecodealliance.org](https://bytecodealliance.org/) · Bytecode Alliance（wasmtime / WASI / Component Model）
- [wasi.dev](https://wasi.dev/) · WASI 主页
- [v8.dev/blog](https://v8.dev/blog) · V8 团队 wasm 文章

**关键文章与演讲**：
- Lin Clark, *A cartoon intro to WebAssembly* (2017) · hacks.mozilla.org · 经典 wasm 入门插画系列
- Lin Clark, *Standardizing WASI* (2019) · hacks.mozilla.org
- Lin Clark, *WebAssembly's road to 2024 + WIT* (2023) · 介绍 Component Model
- *V8: Liftoff* (2018) · v8.dev/blog/liftoff
- *V8: WasmGC* (2023) · v8.dev/blog/wasm-gc-porting
- *V8: JSPI* (2023) · v8.dev/blog/jspi

**编译工具链文档**：
- [emscripten.org](https://emscripten.org/) · C/C++
- [rustwasm.github.io](https://rustwasm.github.io/) · Rust（wasm-pack + wasm-bindgen）
- [tinygo.org](https://tinygo.org/) · TinyGo
- [assemblyscript.org](https://www.assemblyscript.org/) · AssemblyScript
- [kotlinlang.org/docs/wasm-overview.html](https://kotlinlang.org/docs/wasm-overview.html) · Kotlin/Wasm

**社区资源**：
- [wasmbyexample.dev](https://wasmbyexample.dev/) · 教程
- [madewithwebassembly.com](https://madewithwebassembly.com/) · 应用案例集
- [caniuse.com/wasm](https://caniuse.com/?search=wasm) · 浏览器特性查询

---

## 与 index.html 卡片的对应

WebAssembly 主题在站点首页的卡片描述是：
> WASM 二进制格式与 wat 文本格式、与 JS 互操作（imports / exports / 内存模型）、Rust / Go / AssemblyScript 编译路径、SIMD / threads / GC 提案、WASI（服务端 WASM）、WASM Component Model、典型应用（Figma / Photoshop Web / FFmpeg.wasm）。

本大纲全部覆盖 + 扩充：
- ✅ 二进制 + wat 格式 → P2 全覆盖
- ✅ 与 JS 互操作 + 内存模型 → P3 全覆盖
- ✅ Rust / Go / AssemblyScript → P4 全覆盖（+ C/C++ / Zig / 托管语言）
- ✅ SIMD / threads / GC 提案 → P5 全覆盖（+ Tail call / EH / JSPI）
- ✅ WASI → P6 全覆盖（+ 服务端 runtime 全谱）
- ✅ Component Model + 典型应用 → P7 全覆盖
- ➕ 扩充：项目史 + 同代人对照（P1）

写完后建议把 index.html 的卡片标题从 "⏳ 规划中" 改为 "✅ 13 章 / 7 阶段完成"。
