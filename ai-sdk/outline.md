# AI SDK（Vercel + Claude Agent）深度学习 · 章节大纲

> 本文件是「AI SDK 集成」主题的写作蓝本。**7 阶段 · 12 章**：以 Vercel AI SDK v6（current latest）为主线深度展开，把 Claude Agent SDK（同一个 agent loop 驱动 Claude Code 的官方库）作为另一种 agent 范式做横评。回答 2026 年前端 / 全栈工程师把 LLM 接入应用时绕不开的「v5/v6/v7 怎么选」「Stream Protocol 从自定义 NDJSON 切换到 SSE 之后心智变了什么」「Agent abstraction 与裸 streamText 的边界」「Vercel AI SDK 的 useChat 和 Claude Agent SDK 的 agent loop 是不是同一类东西」「MCP 在两边各占什么位置」一系列具体问题。
> 编写日期：2026-05-08（首版）｜目标版本：Vercel AI SDK v6（latest, 2026-02 释出）+ v5 在历史段（2025-08 释出）+ v7 canary 在展望段；Claude Agent SDK 2026-05 主线（Python + TypeScript 双语言）

---

## 元信息

- **目标版本与规范基线**：
  - **Vercel AI SDK v6**（current latest，2026-02 释出，0.14.x 至今主线）—— 引入 **Agent abstraction**（一次定义模型 + 系统提示 + 工具 = 可复用 agent）+ **ToolLoopAgent**（agent loop 一等公民）+ **Human-in-the-loop tool approval**（敏感工具人审）+ **AI Gateway**（统一访问 OpenAI / Anthropic / Google / Mistral / Bedrock，zero markup pricing + $5/月免费额度）+ stable structured outputs with tool calling + DevTools。从 v5 升级文档少（"specification 改进，不是 SDK 重做"）。
  - **Vercel AI SDK v5**（2025-08 释出，至 2026-02 是稳定主线）—— 关键转折：流式协议从自家 Data Stream Protocol 切换到 **SSE 标准**；useChat redesigned 引入 **UIMessage（应用状态 source of truth）vs ModelMessage（发给 LLM 的精简表示）二分法**；tool-invocations 改成 **type-specific parts**（<code>tool-TOOLNAME</code>）；tool call inputs 默认流式；Vue/Svelte/Angular feature parity（不再只 React 一等公民）。
  - **Vercel AI SDK v7 canary**（2026 内释出）—— 引入 **WorkflowAgent**（durable execution，与 Vercel 新发布的 durable execution 编程模型对齐）+ **loop control**（<code>stopWhen</code> / <code>prepareStep</code> 让 agent loop 可显式控制）。本主题在 P7 展望段提及，正文不锁定 v7。
  - **Claude Agent SDK 2026-05 主线**（Python + TypeScript 双语言）—— Anthropic 官方库，<strong>同一个 agent loop 驱动 Claude Code</strong>。包含 built-in tools / hooks / **subagents**（每个 subagent 独立 context window + 独立 prompt + 独立 tool 权限）/ **MCP**（Model Context Protocol，连接外部工具数据源的开放标准）/ sessions。2026-05 改进：PostToolUse hooks 可通过 <code>hookSpecificOutput.updatedToolOutput</code> 替换工具输出；<code>CLAUDE_CODE_FORK_SUBAGENT=1</code> 在非交互 session 也工作；MCP server 启动 transient error 自动重试 3 次；自定义工具作为 **in-process MCP servers** 直接在 Python / TS 进程内运行（不再需要单独进程）。
  - **MCP（Model Context Protocol）**——Anthropic 主导的开放标准（2024 起）；2026 年事实上成为 LLM 与外部工具 / 数据源连接的统一协议（Cursor / Claude Code / Cloudflare AI / VS Code 等都已实现）。本主题把 MCP 当成 agent 与外部世界的接口层讲。
  - **历史回溯**：OpenAI raw API（2020）→ LangChain JS（2023-01，第一波 LLM orchestration）→ Vercel AI SDK v3（2024-04，<code>useChat</code> 起步）→ OpenAI Functions / Tool Calling（2023-06）→ Anthropic Tool Use（2024）→ Vercel AI SDK v4（2024-12，多 provider）→ Vercel AI SDK v5（2025-08，UIMessage/ModelMessage + SSE）→ Anthropic Claude Agent SDK 公开（2025）→ Vercel AI SDK v6（2026-02，Agent 抽象）→ MCP 普及（2025-2026）→ v7 canary（2026 内）。
- **来源**：
  - [ai-sdk.dev/docs](https://ai-sdk.dev/docs)（Vercel AI SDK 官方文档全量）+ [ai-sdk.dev/v7/docs](https://ai-sdk.dev/v7/docs)（v7 canary）
  - [github.com/vercel/ai](https://github.com/vercel/ai)（核心源码 + release notes）
  - [vercel.com/blog/ai-sdk-5](https://vercel.com/blog/ai-sdk-5) + [vercel.com/blog/ai-sdk-6](https://vercel.com/blog/ai-sdk-6)（Vercel 团队对各大版本的设计动机）
  - [code.claude.com/docs/en/agent-sdk](https://code.claude.com/docs/en/agent-sdk)（Claude Agent SDK 官方文档）
  - [github.com/anthropics/claude-agent-sdk-python](https://github.com/anthropics/claude-agent-sdk-python) + [github.com/anthropics/claude-agent-sdk-typescript](https://github.com/anthropics/claude-agent-sdk-typescript)
  - [modelcontextprotocol.io](https://modelcontextprotocol.io)（MCP 协议规范）
  - [Anthropic Tool Use docs](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview)（Claude API 一手 tool calling）
  - [OpenAI Function Calling / Tools docs](https://platform.openai.com/docs/guides/function-calling)
  - Vercel AI SDK 的 GitHub Discussions / changelog（v5 / v6 升级讨论一手）
  - Anthropic engineering blog（Claude Code / Agent SDK 内部设计）
- **目标读者**：
  - 写过 React / Next.js，想把 LLM 接进应用但被 v5 / v6 的 breaking change 搞迷糊的工程师
  - 用过 LangChain JS 但觉得它"太重"想转 Vercel AI SDK 的人
  - 在前端工程里做 chat / generative UI / agent / tool calling，但说不清"streamText vs Agent vs Claude Agent SDK 各自该用在哪"的工程师
  - 选型 / 架构岗负责 AI 集成基础设施的 tech lead（包括"我们要不要走 MCP / 要不要用 Vercel AI Gateway"这类问题）
- **不是这个主题的读者**：
  - 没写过任何前端代码的（先读 react / next 主题）
  - 想做 RAG / vector DB / embedding 调优的（本主题不深入，仅在 P5/P6 提一句，引一手 docs）
  - 关心 LLM 训练 / fine-tuning / 模型结构的（本主题只讲"如何调用 LLM"，不讲"如何训 LLM"）
  - Python 后端为主、不写 TS / JS 的（Claude Agent SDK Python 版本提及但不深入）
  - 关心特定 provider 细节（OpenAI o1 reasoning / Claude extended thinking 等）的（仅在 P4 / P5 提及，引官方 docs）

---

## 整体设计：7 阶段 · Vercel AI SDK v6 主线 + Claude Agent SDK 横评

「AI SDK 集成」在 2026 不是单一主题。Vercel AI SDK 是<strong>前端 / 全栈工程师把 LLM 接进 Web 应用</strong>的事实主力库（占 React/Next.js 生态 LLM 集成 ~80%）；Claude Agent SDK 是 Anthropic 给<strong>构建生产 AI agents（含 CLI / 后端 orchestration）</strong>的官方库，与 Claude Code 共享 agent loop 实现。两者在<strong>"agent 应该是什么"</strong>这个问题上有不同视角，<strong>但 2026 起在 MCP / Tool use / streaming 等接口上正在收敛</strong>。

我们按"主线深度 + 横评对比"展开。

| 阶段 | 章数 | 核心问题 |
|---|---|---|
| **P1 · 是谁 / 为什么** | 2 | LLM 应用集成 5 年史 + 同代人横评（raw API / LangChain / Vercel AI SDK / Claude Agent SDK / Mastra / CopilotKit 等）+ 设计哲学（"包 LLM API"→"agent abstraction"的范式演化 + Vercel 与 Anthropic 两种视角对比） |
| **P2 · Vercel AI SDK 心智** | 2 | 三层架构（Core / UI / RSC）+ generateText / streamText / generateObject 四件套；Stream Protocol 演化（v4 自定义 NDJSON → v5 SSE → v6 维持 SSE） |
| **P3 · UI hooks 与 Generative UI** | 2 | useChat / useCompletion / useObject 全谱（v5+ UIMessage / ModelMessage 分裂）；streamUI + RSC 集成 + 与 React 19 use API 协作 |
| **P4 · Agent 抽象（v6 主线）** ⭐ | 2 | Agent + ToolLoopAgent + structured output with tool calling；Tool use 全谱（定义 / 流式 input / Human-in-the-loop 审批 / 错误处理） |
| **P5 · Claude Agent SDK 横评 + MCP** | 2 | Claude Agent SDK 设计哲学（agent loop + subagents + MCP + hooks）+ 与 Vercel 的两种范式对比；MCP 协议在两边的位置 |
| **P6 · 工程化与生产** | 1 | 测试（streaming mocks / tool call testing）+ 部署（Edge runtime / Node）+ 监控（OTel / DevTools）+ caching + cost 控制 + AI Gateway |
| **P7 · 决策与陷阱 + v7 展望** | 1 | 选型决策树 + 陷阱清单 + v7 展望（WorkflowAgent / durable execution / loop control） |

总计 **12 章 ≈ 75,000-85,000 字**，平均每章约 6,500 字。**比重偏向 P3-P5**（UI hooks + Agent 抽象 + Claude Agent SDK 横评是日常主战场），P1 / P2 / P6 / P7 写得紧凑。

---

## 与既有主题的边界 ——「短重述 + 链回」原则

> ✅ **短重述**：1-3 句话点出"它在底层是什么 + 关键性质"
> ✅ **链回**：紧跟一句"详细的 X / Y / Z 请参考 [`主题/{phase}/{chapter}`]"
> ❌ **不要**直接抄一遍其他主题的论述

**关键边界**：

| 概念 | 在哪讲透 | 本主题里怎么处理 |
|---|---|---|
| RSC / Server Components / 流式渲染 | `react/06-modern/01-server-components.html` + `next/03-rsc-streaming/` | 链回，P3.2 短重述 RSC 是怎么和 streamUI / generative UI 协作的 |
| React 19 `use(promise)` API | `react/06-modern/02-actions.html` | 链回，P3.2 / P4.1 提 useChat 怎么和 use API 协作 |
| Server Actions | `next/04-server-actions/` | 链回，P3.1 / P4.2 讲 useChat 调 server action 的姿势 |
| Suspense / Error Boundary | `react/05-concurrent/02-suspense.html` | 链回，P3.2 streamUI / generative UI 用 Suspense 处理 loading |
| TanStack Query streamedQuery | `tanstack-query/04-advanced-patterns/02-suspense-streaming.html` | 双向链，P2.2 / P3.1 提"流式数据库查询和 useChat 是同一个底"，TQ 主题反过来引本主题 |
| HTTP 流式协议层（chunked / SSE / fetch streams） | `http/06-streaming/01-streaming.html` | 双向链，P2.2 短重述底层走的就是 HTTP 主题讲的 SSE / fetch + ReadableStream，详细协议层根因引 HTTP 主题 |
| Server-Sent Events (SSE) 标准 | `http/06-streaming/01-streaming.html` | 链回 + 短重述，本主题侧重 v5+ 用 SSE 的工程含义 |
| TypeScript 泛型 / type inference | `typescript/` 主题 | 链回，P2.1 讲 generateObject 的 schema → output type 推导时短重述 |
| Zod schema 验证 | 不另开主题 | 必要时短解（structured output 必读），引 Zod docs，不展开 Zod 教程 |
| Bun / Node runtime 边界 | `bun/` + `node/` 主题 | 链回，P6.1 部署章讲 Edge / Node / Bun 各自的流式响应限制 |
| 测试（mock fetch / MSW / 流式 testing） | `testing/06-msw/` | 链回，P6.1 测试 streaming response 用 MSW 而不是手写 mock |
| OpenAI Functions / Tool Calling 协议 | 不另开主题 | 必要时短解（每个 provider 自己 tool calling 协议略不同），引 OpenAI / Anthropic docs |
| Vercel Edge runtime | `next/06-runtime-deployment/` | 链回，P6.1 讲 Edge runtime 跑 streamText 的限制 |
| Cloudflare Workers / Bun.serve | 各自主题 | 链回，P6.1 讲流式响应在不同 runtime 的差异 |

---

## 内容覆盖原则 ——「Vercel 主线 + Anthropic 横评 + MCP 中立」

AI SDK 主题的特殊处：<strong>两个生态有相似但不同的设计哲学，且都是该领域官方主导的项目</strong>。所以写作时严格分两层来源：

**4 条规则**：

1. **Vercel AI SDK 文档以官方为准**：API 定义、breaking changes、useChat 心智都以 ai-sdk.dev/docs（v6 主线）+ vercel.com/blog 的设计文章为准；引 GitHub release notes 验证版本号。
2. **Claude Agent SDK 文档以 Anthropic 官方为准**：subagents / MCP / hooks / sessions 等概念以 code.claude.com/docs/en/agent-sdk + github.com/anthropics/claude-agent-sdk-{python,typescript} 为准。Claude Code 内部实现细节作为参考但不引为规范。
3. **MCP 协议以 modelcontextprotocol.io 为准**：MCP 是开放标准，不专属任一家。讲 MCP 时不站队 Vercel 或 Anthropic 的实现选择。
4. **跨范式对比要双向引用**：P5 讨论"Vercel Agent abstraction vs Claude Agent SDK agent loop"时，每一段都要交叉引用两边官方说法（避免"我猜他们想这样"）。

---

## 节奏建议

- **连读组**：
  - P1.1 + P1.2（5 年史 → 设计哲学，理解两种 agent 视角的来源）
  - P2.1 + P2.2（三层架构 → Stream Protocol，必须连读才能建立 Vercel AI SDK 心智）
  - P3.1 + P3.2（useChat → streamUI / generative UI，前者是 chat、后者是 UI 流式）
  - P4.1 + P4.2（Agent → Tool use，v6 主线最重要的两章）
  - P5.1 + P5.2（Claude Agent SDK + MCP，必须连读才有完整跨范式视角）
- **可独立跳读**：
  - P6.1 工程化、P7.1 决策树
- **建议阅读顺序**：
  - **写 useChat 业务的工程师**：P2 → P3（重点）→ P4
  - **从 LangChain 迁过来的人**：P1.1 → P1.2 → P2 → P4
  - **做 generative UI / RSC 集成的人**：P2 → P3.2（重点）→ P4.1
  - **建 agent / orchestration 后端的人**：P4 → P5（重点）→ P7
  - **tech lead / 选型者**：P1.2 → P5 → P6 → P7

---

## 章节简述

> 下面每章列出**核心问题 + 关键内容 + 写作要点**。每章按 6 段模板（速览 → 底层逻辑 → 应用场景 → 典型代码 → 常见陷阱 → 延伸阅读）。

### P1 · 是谁 / 为什么（2 章）

#### 1.1 LLM 应用集成 5 年史 + 同代人横评

- **核心问题**：从 OpenAI raw API 到 Vercel AI SDK v6 + Claude Agent SDK，5 年踩过哪些坑？为什么"包一下 LLM API"这件事会演化出 Vercel / LangChain / Anthropic 三套不同的 SDK 范式？
- **关键节点**：
  - **2020-11** OpenAI GPT-3 公开 API：raw HTTP，没有任何 SDK
  - **2022-11** ChatGPT 发布 → LLM 应用爆炸 → SDK 需求出现
  - **2023-01** LangChain JS 发布：第一波 LLM orchestration 框架（chains / prompts / agents）；快速火爆但被认为"过度抽象"
  - **2023-06** OpenAI Function Calling 公开：第一个标准化 tool calling 协议
  - **2023-09** Vercel AI SDK 早期版本（v2.x）：定位"前端 chat 库"
  - **2024-03** Vercel AI SDK v3：<code>useChat</code> 进入主线 + Generative UI 实验
  - **2024-04** Anthropic Tool Use 公开（Claude API tool calling）
  - **2024-12** Vercel AI SDK v4：多 provider 抽象成熟（OpenAI / Anthropic / Google / Mistral / Bedrock）
  - **2024-11** MCP（Model Context Protocol）公开（Anthropic 主导）
  - **2025-08** Vercel AI SDK v5：UIMessage / ModelMessage 二分；流式协议切换到 SSE 标准；Vue/Svelte/Angular feature parity
  - **2025** Anthropic Claude Agent SDK 公开（同一个 agent loop 驱动 Claude Code）
  - **2026-02** Vercel AI SDK v6：Agent abstraction + ToolLoopAgent + AI Gateway + Human-in-the-loop
  - **2026 内** Vercel AI SDK v7 canary：WorkflowAgent + durable execution + loop control
- **同代人横评**：
  - **OpenAI raw API / Anthropic raw API**：能用但 boilerplate 多；流式响应需要手写 SSE / NDJSON 解析；多 provider 切换零支持
  - **LangChain JS**：第一代 LLM 编排框架；abstractions 多（chain / agent / memory / tool）；2024 后被很多人转走，被认为"过度抽象 + bundle size 大 + breaking changes 频"
  - **Vercel AI SDK**：2026 React/Next.js 生态事实主力（占 LLM 集成 ~80%）；vendor-neutral（不绑定任一 provider）；UI hooks 一等公民
  - **Claude Agent SDK**：Anthropic 出品；Python + TS；同一个 loop 驱动 Claude Code 即"工程级 dogfooding"；subagents + MCP + hooks 完整工具链
  - **Mastra**：2024-2025 兴起的"agent + workflow + RAG"全栈框架；TypeScript only；与 Vercel AI SDK 在 agent 层有重叠，2026 仍小众
  - **CopilotKit**：专门做"copilot UI 组件"，包 ChatGPT-like 体验；通常和 Vercel AI SDK 配合用
  - **Inkeep / Inngest agent kit / OpenAI Agents SDK / Mastra 等**：2026 各自占小生态位，主线仍是 Vercel + Claude Agent SDK 两家
- **写作要点**：用一张时间线 SVG 串起来；每个节点配一句"它解决了什么前一版的痛点"。**强调**「LangChain JS 衰落 → Vercel AI SDK 接班」这一现实矛盾。**避免**纯版本号罗列。

#### 1.2 设计哲学：从"包 LLM API"到"agent abstraction"的范式演化

- **核心问题**：Vercel AI SDK 和 Claude Agent SDK 都在做"LLM 集成 SDK"，但底层心智完全不同。两种视角各自解决什么问题？
- **三阶段范式演化**：
  - **第一代 · "包 LLM API"**（2023-2024）：抽象掉各 provider 差异；提供 streamText / generateText 等单次调用 API；UI 层提供 useChat 等 hooks。<strong>关键洞察</strong>：开发者要的是"我有一个 prompt + 一组 tools，给我个流式响应"，不是 LLM 的 raw protocol。Vercel AI SDK v3-v5 是这一代代表。
  - **第二代 · "agent loop 一等公民"**（2025-2026）：把"LLM 调一次 → 看 tool call → 调 tool → 把结果再喂回 LLM → 直到 stop"这个循环抽象成 Agent 类。Vercel v6 的 Agent / ToolLoopAgent + Claude Agent SDK 都是这一代。<strong>关键洞察</strong>：业务里 99% 的 agent 长得一样（system prompt + tools + loop until done），不应该让每个项目重写一遍。
  - **第三代 · "durable execution"**（2026 起，v7 canary）：agent 跑几小时几天怎么办？Vercel WorkflowAgent + Vercel durable execution programming model 在尝试。<strong>关键洞察</strong>：现实里很多 agent task 是"持续多天"的（深度研究、批处理），不能让 process 死了 agent 就丢。本主题在 P7 展望段提及，正文不锁定。
- **Vercel 视角**："我们是 React/Next.js 生态的 SDK"：
  - 优先解决<strong>前端 / 全栈 web app 集成 LLM</strong>的痛点
  - useChat / useObject / streamUI 等 UI hooks 是一等公民
  - 多 provider 抽象（vendor-neutral）+ AI Gateway（统一计费）
  - 与 RSC / Server Actions / Server Components 深度集成
- **Anthropic 视角**："我们是 agent 的官方库"：
  - 优先解决<strong>构建生产 AI agents</strong>的痛点（包括 CLI 工具如 Claude Code）
  - agent loop / subagents / tool permissions 是一等公民
  - 与 MCP 深度耦合（外部工具接口标准）
  - hooks 系统让 agent 行为可观察、可拦截、可改写
  - <strong>同一个 SDK 驱动 Claude Code 自身</strong>（dogfooding）
- **共同点（2026 起的收敛）**：
  - 都支持 MCP（外部工具接口标准）
  - 都支持 streaming（Vercel 走 SSE，Claude Agent SDK 走 SDK 内部 stream）
  - 都支持 multi-provider（Vercel 完全 provider-neutral；Claude Agent SDK 锁定 Claude 但可通过 Bedrock / Vertex AI）
  - 都有 hooks / interception 机制
- **不同点（核心分歧）**：
  - <strong>UI 层</strong>：Vercel 提供 useChat / useObject 等 hooks；Claude Agent SDK 没有（它假设你自己做 UI 或不需要 UI）
  - <strong>状态管理</strong>：Vercel 的 UIMessage 是前端 state；Claude Agent SDK 的 session 是 SDK 自己管的
  - <strong>子任务分解</strong>：Claude Agent SDK 的 subagents 是一等公民；Vercel v6 用 ToolLoopAgent + 嵌套 agent 实现，没有"subagent"专属概念
  - <strong>Provider</strong>：Vercel 全 neutral；Claude Agent SDK 默认 Anthropic
- **写作要点**：本章是**整个主题的灵魂**——读者读完应该能从本质上回答"我用 Vercel AI SDK 还是 Claude Agent SDK"。强观点收尾："2026 起前端 chat / generative UI 选 Vercel；后端 / CLI / 复杂 orchestration 选 Claude Agent SDK；前后端混合用 Vercel 跑前端 + Claude Agent SDK 跑后端 agent loop"。

---

### P2 · Vercel AI SDK 心智（2 章）

#### 2.1 三层架构（Core / UI / RSC）+ generateText / streamText / generateObject 四件套

- **核心问题**：Vercel AI SDK 是怎么分层的？generateText / streamText / generateObject / streamObject 这四个 API 是同一类还是不同类？什么时候用哪个？
- **三层架构（v3 起的根设计）**：
  - **AI SDK Core**（<code>ai</code> 包）：与 LLM 交互的核心 API；provider-neutral；Node.js / Bun / Edge runtime 都能跑。包含 generateText / streamText / generateObject / streamObject 四个一等公民 + Agent / ToolLoopAgent（v6 起）
  - **AI SDK UI**（<code>ai/react</code> / <code>ai/vue</code> / <code>ai/svelte</code> / <code>ai/angular</code> 等）：UI 框架专用 hooks。useChat / useCompletion / useObject 等。<strong>v5 起 Vue/Svelte/Angular feature parity</strong>。
  - **AI SDK RSC**（<code>ai/rsc</code>）：React Server Components 专用；streamUI / generative UI 等。<strong>2026 仍是较新的实验区</strong>。
  - 三层独立可用：可以只用 Core 不用 UI；也可以用 UI 不用 RSC。<strong>不必全用</strong>。
- **Core 四件套**：

| API | 用途 | 返回 | 何时用 |
|---|---|---|---|
| <code>generateText</code> | 单次文本生成 | <code>{ text, usage, finishReason, toolCalls? }</code> | 后端非流式调用；批量任务 |
| <code>streamText</code> | 流式文本 | <code>{ textStream, fullStream, ... }</code> | UI 流式响应 |
| <code>generateObject</code> | 单次结构化输出（按 schema） | <code>{ object, usage }</code> | 提取结构化数据 |
| <code>streamObject</code> | 流式结构化输出 | <code>{ partialObjectStream, ... }</code> | 流式生成 form / 表格 |

- **关键代码示例方向**：
  - 一个简单的 streamText 端点（Express / Hono / Next.js Route Handler）
  - 一个 generateObject + Zod schema 提取邮件信息
  - generateText vs streamText 的取舍：批处理用 generate，UI 用 stream
- **provider 抽象**：

```ts
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';

// 同一份代码，换 model 即可：
await streamText({ model: openai('gpt-4o') });
await streamText({ model: anthropic('claude-sonnet-4-6') });
await streamText({ model: google('gemini-2.5-flash') });
```

- **AI Gateway**（v6 起）：
  - <code>@ai-sdk/gateway</code> 包，统一访问几百个 model
  - zero markup pricing（用户只付 provider token 价格）
  - $5/月免费额度（Vercel 团队赠）
  - 包含 prompt caching / observability / budget controls
  - <strong>极大降低多 provider 切换成本</strong>
- **写作要点**：本章是 Vercel AI SDK 入门最大门槛；**强调** Core 是"provider-neutral 的薄抽象层"，不是"agent framework"；用三层架构 SVG 帮助记忆。

#### 2.2 Stream Protocol 演化：v4 自定义 NDJSON → v5 SSE → v6 维持 SSE

- **核心问题**：useChat 流式响应底下是什么协议？为什么 v5 把流式协议从自家 Data Stream Protocol 改成 SSE？这次切换前端工程师感知到了什么变化？
- **三代协议**：
  - **v4 之前 · Vercel Data Stream Protocol**（自家 NDJSON-like，每行 <code>&lt;type&gt;:&lt;json&gt;\n</code>）：
    - 类型符：<code>0:</code> = text delta / <code>2:</code> = data / <code>3:</code> = error / <code>9:</code> = tool call / <code>a:</code> = tool result / <code>e:</code> = finish reason / 等
    - 通过 fetch + ReadableStream 解析
    - 优点：自定义灵活；缺点：非标准，与 LangChain / Anthropic / OpenAI 各自的流式协议不互通
  - **v5 起 · SSE 标准**：
    - 切换到 W3C Server-Sent Events 标准（<code>data: ...\n\n</code>）
    - <strong>但 SSE 数据 payload 仍是 Vercel 自家的 JSON 结构</strong>（含 type / id / 等字段）—— 不是 OpenAI / Anthropic 原生 streaming
    - 优点：标准协议，浏览器原生 EventSource 可解析；与生态其他 SSE 工具互通；中间盒兼容性好（详见 <a href="../http/06-streaming/01-streaming.html">HTTP 主题 P6.1</a>）
    - 缺点：仍需要前端 SDK 解析 Vercel JSON payload；不是 SSE 即可即用
  - **v6 维持 v5 的 SSE 协议**，少量字段调整（spec 改进）
- **流式响应的底层 wire**（链回 HTTP 主题 P6.1 给协议层根因）：
  - 协议层：HTTP/1.1 chunked 或 HTTP/2/3 DATA frame
  - 应用层：SSE format（v5+）or NDJSON（v4）
  - 浏览器侧：fetch + ReadableStream（不是 EventSource API，因为需要 POST + 自定义 headers + cancel 控制）
- **v5 切换 SSE 的工程影响**：
  - <strong>useChat 等 hooks 内部已切换</strong>，前端用户感知小（只要升级 SDK）
  - <strong>自定义 server</strong>（FastAPI / 自建 backend）需要适配新协议 → v5 升级最大的迁移点
  - GitHub Issues 中大量"我的 FastAPI / Python backend 用 v5 useChat 出问题"是这类
- **UIMessage vs ModelMessage 二分法**（v5 起最大概念变更）：
  - <strong>UIMessage</strong>：前端应用 state 的 source of truth。包含完整消息历史、metadata、tool 结果、各种附件 part。
  - <strong>ModelMessage</strong>：发给 LLM 的精简表示。把 UIMessage 转成 OpenAI / Anthropic 各自能理解的格式。
  - <strong>关键洞察</strong>：以前一份 message 同时承担"前端展示"和"LLM context"两个角色，导致 metadata（比如 toast / debug 信息）也喂给 LLM；v5 把它们解耦。
- **tool-invocations 改成 type-specific parts**：
  - v4：<code>parts: [{ type: 'tool-invocation', toolName: 'getWeather', ... }]</code>
  - v5+：<code>parts: [{ type: 'tool-getWeather', ... }]</code>
  - <strong>好处</strong>：TypeScript 能精确推断每个 tool 的输入输出类型
- **典型代码示例方向**：
  - 一个 v4 → v5 升级的 useChat handler（前后端各一段）
  - 自定义 server 解析 SSE wire（用 fetch + ReadableStream）
  - UIMessage / ModelMessage 转换函数
- **写作要点**：本章是 v5 升级文档最容易踩坑的章；**强调** v5 不只是 API 改名，是<strong>协议层 + state 模型的双重重做</strong>。链回 HTTP 主题 P6.1 给协议层根因。

---

### P3 · UI hooks 与 Generative UI（2 章）

#### 3.1 useChat / useCompletion / useObject 全谱（v5+ UIMessage / ModelMessage 分裂）

- **核心问题**：useChat 是 Vercel AI SDK 最重要的 hook；它在 v5 redesigned 后心智变了什么？useCompletion / useObject 各自补什么场景？
- **useChat 核心**：
  - **签名**：<code>const { messages, input, handleInputChange, handleSubmit, isLoading, ... } = useChat({ api: '/api/chat' })</code>
  - **发送消息**：用户输入 → <code>handleSubmit</code> → POST 到 <code>/api/chat</code> → SDK 把 input + 历史消息序列化成请求 → server 调 LLM 流式返回 → SDK 边收边拼接进 messages state → 触发组件 re-render
  - **核心 state**：<code>messages: UIMessage[]</code>，包含 <code>{ id, role, parts: Part[] }</code>
  - **part 类型**：text / tool-{name} / data / source / step-start / step-end / 等
- **v5 UIMessage / ModelMessage 二分**：

```ts
// UIMessage (前端)
type UIMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  parts: Array<
    | { type: 'text'; text: string }
    | { type: 'tool-getWeather'; toolCallId: string; state: 'call' | 'result'; input?: ...; output?: ... }
    | { type: 'data-customMetric'; data: ... }    // 应用自定义 data part
    | ...
  >;
  metadata?: any;  // 不发给 LLM
};

// ModelMessage (server-side, 发给 LLM)
type ModelMessage = {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string | Array<...>;  // OpenAI / Anthropic 格式
};

// 转换：在 Route Handler 里
const modelMessages = convertToModelMessages(messages);
const result = await streamText({ model, messages: modelMessages, tools });
return result.toUIMessageStreamResponse();
```

- **useCompletion**：单次补全（不是 chat）；<code>useChat</code> 是多轮对话，<code>useCompletion</code> 是"一次输入 → 一次流式输出"。
- **useObject**：流式生成结构化对象（按 Zod schema）。比 useChat 更结构化的 UI（生成 form / 表格 / 卡片）。
- **关键代码示例方向**：
  - 一个完整的 useChat 端到端（client + server）
  - 自定义 data part：在响应里推 progress / debug 信息
  - useCompletion 实现"一次性提示词改写"
  - useObject 实现"流式生成订单确认 UI"
- **写作要点**：本章是 Vercel AI SDK 用户最常用的 hook；**强调** UIMessage / ModelMessage 二分是 v5 心智的根；用真实 ChatGPT-like UI 示例驱动。链回 react / next 主题 hooks 章节。

#### 3.2 Generative UI: streamUI + RSC 集成 + 与 React 19 use API 协作

- **核心问题**：Generative UI 是 Vercel 提的概念 —— LLM 不只生成文本，<strong>生成 React 组件树</strong>。这怎么实现？和 useChat 的关系是？2026 年它的位置如何？
- **Generative UI 核心思路**：
  - LLM 输出"该渲染什么 UI"（不是 HTML，是 component invocation 决策）
  - SDK 根据 LLM 决策<strong>在 server-side 直接渲染 React 组件</strong>（RSC）
  - 客户端通过 RSC payload 边收边渲染
- **streamUI API**（<code>ai/rsc</code>）：

```tsx
// app/action.tsx (Server Action)
'use server';
import { streamUI } from 'ai/rsc';
import { openai } from '@ai-sdk/openai';

export async function chat(message: string) {
  const result = await streamUI({
    model: openai('gpt-4o'),
    prompt: message,
    text: ({ content }) => <div>{content}</div>,
    tools: {
      showWeatherCard: {
        description: '...',
        parameters: z.object({ city: z.string() }),
        generate: async function* ({ city }) {
          yield <Loading />;
          const weather = await getWeather(city);
          return <WeatherCard data={weather} />;
        },
      },
    },
  });
  return result.value;
}
```

- **生成的不是文本，是 React 元素**：返回值 <code>result.value</code> 是 React Node（可在 RSC 中直接渲染）
- **2026 状态**：
  - <code>ai/rsc</code> 仍是较新且演进中的 API
  - 与 useChat（client-side state）有重叠 → 选哪个看场景
  - Vercel 的官方推荐："简单 chat 用 useChat；需要丰富 UI 渲染（卡片 / 表单 / 嵌入式可视化）用 streamUI"
- **与 React 19 use API 协作**：
  - <code>streamUI</code> 返回值是 React Node，本身已经能在 RSC 渲染
  - 与 <code>use(promise)</code> 配合：在 server 创建 promise + 传给 client component + client 用 use 消费 → 流式 UI
  - 详见 <a href="../react/06-modern/01-server-components.html">React 主题 P6.1</a> + <a href="../next/03-rsc-streaming/index.html">Next.js 主题 P3</a>
- **典型场景**：
  - 用户问"我下周怎么穿"→ LLM 决定调 getWeather + 生成 outfit 推荐 → server 直接渲染 OutfitCard 组件 → 客户端流式收
  - "帮我建一个订餐表单"→ LLM 生成 form schema → server 渲染 Form 组件
- **关键代码示例方向**：
  - 完整的 streamUI demo（Server Action + RSC component）
  - 与 useChat 共存：useChat 管 chat history，streamUI 渲染 inline tool result UI
  - 错误处理：Suspense + Error Boundary 包裹流式 UI
- **写作要点**：本章给**完整的 generative UI 示例**；**强调** streamUI 是"LLM 决定渲染什么 + server 直接渲染"，不是"LLM 输出 HTML"。链回 react/next 主题 RSC 章。

---

### P4 · Agent 抽象（v6 主线）⭐（2 章）

#### 4.1 Agent + ToolLoopAgent + structured output with tool calling

- **核心问题**：Vercel AI SDK v6 引入了 Agent abstraction —— 这和直接用 streamText + tools 有什么不一样？什么时候应该升级到 Agent？
- **裸 streamText + tools 的局限**：
  - 你需要自己写"调 LLM → 看 tool calls → 调 tool → 把结果再喂回 LLM → 直到没 tool call"的 loop
  - 多步骤推理（"先搜索 → 然后总结 → 然后再搜"）需要手写
  - 多个组件想复用同一个 agent（同一组 tools + 同一个 system prompt）需要自己抽象
- **v6 Agent abstraction**：

```ts
import { Agent } from 'ai';

const weatherAgent = new Agent({
  model: openai('gpt-4o'),
  system: 'You are a weather assistant.',
  tools: {
    getWeather: { ... },
    getForecast: { ... },
  },
});

// 调用 agent
const result = await weatherAgent.generate({ prompt: 'What is the weather in NYC?' });
// 或流式
const result = await weatherAgent.stream({ prompt: '...' });
```

- **关键设计**：
  - <strong>定义一次，多处复用</strong>：weatherAgent 可以在不同 Route Handler / Server Action / Client useChat 里复用
  - <strong>自动 tool loop</strong>：内置"调 LLM → 看 tool calls → 调 tool → 喂回 LLM"循环
  - <strong>类型安全</strong>：tools 的输入输出类型自动推导
  - <strong>与 UI 集成</strong>：返回的 stream 兼容 useChat / UIMessageStreamResponse
- **ToolLoopAgent**：
  - Agent 的子类，内置 tool loop
  - <code>maxSteps</code>：最多调用 tool 几次（防 infinite loop）
  - <code>stopWhen</code>：自定义停止条件（v7 canary 引入更精细的 loop control）
  - <code>onStep</code>：每步回调（observability / debugging）
- **structured output with tool calling**（v6 stable）：
  - 之前 generateObject 和 tool calling 不能同时用（"我希望 LLM 调几个 tool 然后返回结构化对象"）
  - v6 起两者可以协作

```ts
const { object } = await generateObject({
  model: openai('gpt-4o'),
  tools: { getWeather: { ... } },
  schema: z.object({
    city: z.string(),
    temperature: z.number(),
    summary: z.string(),
  }),
  prompt: 'What is the weather in NYC?',
});
// LLM 会先调 getWeather，再返回符合 schema 的 object
```

- **关键代码示例方向**：
  - 一个完整的 weather agent，含两个 tools + 在 Server Action / Route Handler / Client 中分别复用
  - ToolLoopAgent + maxSteps 实现"研究 agent"（多次搜索 + 总结）
  - structured output with tool calling 提取数据
- **写作要点**：本章是 v6 主线最重要的一章；**强调** Agent 是"高层抽象"，但不是"必须用"——简单单次调用仍用 streamText。链回 P5 给 Claude Agent SDK 视角对比。

#### 4.2 Tool use 全谱：定义、流式 input、Human-in-the-loop 审批、错误处理

- **核心问题**：Tool use 是 LLM 应用最关键的能力。Vercel AI SDK 的 tool 怎么定义？流式 input 怎么用？Human-in-the-loop 审批 v6 怎么做？tool 出错怎么处理？
- **Tool 定义**：

```ts
import { tool } from 'ai';
import { z } from 'zod';

const getWeather = tool({
  description: 'Get the weather for a city',
  parameters: z.object({
    city: z.string().describe('The city name'),
  }),
  execute: async ({ city }) => {
    const data = await fetchWeather(city);
    return data;
  },
});

await streamText({
  model: openai('gpt-4o'),
  tools: { getWeather },
  prompt: 'What is the weather in Tokyo?',
});
```

- **流式 input**（v5 起默认）：
  - LLM 边生成 tool input 边发送（不等整个 input 生成完）
  - useChat 端通过 part state 看到 <code>state: 'partial-call'</code>（部分输入）→ <code>'call'</code>（输入完整）→ <code>'result'</code>（已执行）
  - <strong>UI 可以边收边显示 spinner / "正在准备调用 X"</strong>
- **Human-in-the-loop tool approval**（v6 stable）：
  - 给 tool 加 <code>requiresApproval</code> 字段
  - useChat 中收到 pending approval 的 tool call 时不立即执行
  - UI 渲染 approval prompt（"是否允许调用 X 工具？"）
  - 用户批准后通过 SDK API 继续执行

```ts
const deleteFile = tool({
  description: 'Delete a file',
  parameters: z.object({ path: z.string() }),
  requiresApproval: true,
  execute: async ({ path }) => { ... },
});
```

- **错误处理**：
  - tool execute 抛错 → SDK 捕获 → 把错误信息作为 tool result 喂回 LLM → LLM 可以决定 retry / 用其他 tool / 告诉用户
  - 可配置 onError 回调
  - 区分 tool execution error（business logic）vs LLM error（model 问题）
- **2026 多 provider 的 tool calling 协议差异**：
  - OpenAI Function Calling / Tool Calling：JSON schema 驱动
  - Anthropic Tool Use：类似但 schema 格式略不同；流式协议不同
  - Vercel AI SDK 抽象掉这些差异 → 一份 tool 定义所有 provider 都能用
- **典型代码示例方向**：
  - 一个完整的 multi-tool agent（getWeather + getForecast + sendNotification）
  - 流式 input UI 实现（边收 partial-call 边显示）
  - Human-in-the-loop 审批 UI（敏感操作需用户确认）
  - tool 出错时 LLM 自动 retry 一次
- **写作要点**：本章是 P4 双子章另一半；**强调** Human-in-the-loop 是 v6 的关键新能力，对生产 agent 很重要（特别是涉及"删除"/"发送"/"付款"等操作）。链回 typescript 主题（Zod schema）。

---

### P5 · Claude Agent SDK 横评 + MCP（2 章）

#### 5.1 Claude Agent SDK 设计哲学（agent loop + subagents + MCP + hooks）+ 与 Vercel 的两种范式对比

- **核心问题**：Claude Agent SDK 是 Anthropic 给"构建生产 AI agents"的官方库，与 Claude Code 共享 agent loop 实现。它的设计和 Vercel AI SDK 有什么本质不同？什么场景该选 Claude Agent SDK 而不是 Vercel？
- **Claude Agent SDK 核心组件**：
  - **Agent Loop**：和 Claude Code 共用同一个 loop —— 加载 system prompt + tools → 调 Claude → 看 tool calls → 调 tools（含 in-process MCP servers）→ 喂回 → 直到 stop
  - **Subagents**：每个 subagent 有独立 <strong>context window + 独立 prompt + 独立 tool 权限</strong>。主 agent 负责规划和整合，subagents 处理 bounded tasks（code review / test running / frontend QA / security check）
  - **MCP（Model Context Protocol）**：开放标准；外部工具 / 数据源接入；2026 已是事实标准（Cursor / Claude Code / Cloudflare 等都支持）
  - **Hooks**：PreToolUse / PostToolUse / UserPromptSubmit / Stop / 等。可以拦截、修改、阻止 agent 行为；2026-05 起 PostToolUse 可通过 <code>hookSpecificOutput.updatedToolOutput</code> 替换工具输出
  - **Sessions**：SDK 自己管理对话 + 状态 + tool 执行历史
- **subagent 关键能力**：
  - <code>parent_tool_use_id</code> 字段让消息追踪到哪个 subagent 执行
  - <code>CLAUDE_CODE_FORK_SUBAGENT=1</code> 让 subagent 在独立进程跑（2026-05 起非交互 session 也支持）
  - 主 agent 通过特殊 tool 调用 subagent
- **In-process MCP servers**（2026-05 改进）：
  - 自定义工具不再需要单独进程跑 MCP server
  - 直接在 Python / TS 进程内实现，性能 + 部署都更简单
- **设计哲学对比 Vercel**：

| 维度 | Vercel AI SDK v6 | Claude Agent SDK |
|---|---|---|
| 主战场 | React/Next.js web 应用 | CLI / 后端 / 任何 agent 场景 |
| UI 层 | useChat / useObject / streamUI 一等公民 | 没有内置 UI 层 |
| Agent 抽象 | Agent / ToolLoopAgent | Agent loop + Subagents（更细粒度） |
| 多 provider | 完全 vendor-neutral（含 AI Gateway） | 默认 Anthropic（可经 Bedrock / Vertex） |
| MCP | 支持但非中心 | 中心地位 |
| Hooks | 简单（onStep / onFinish 等） | 完整 hook 生命周期 |
| 状态管理 | UIMessage（前端 state） | Session（SDK 内部） |
| Dogfooding | Vercel.com / v0 内部使用 | Claude Code 自己驱动 |

- **2026 选型决策**：
  - 前端 / web app 集成 LLM → <strong>Vercel AI SDK</strong>（不要选 Claude Agent SDK，它没 UI 层）
  - CLI 工具 / 终端 agent → <strong>Claude Agent SDK</strong>（与 Claude Code 共生态）
  - 后端复杂 agent orchestration（多 subagent / 长任务 / 严格 tool 权限） → <strong>Claude Agent SDK</strong>
  - 简单后端 agent → 都行，看团队技术栈
  - 前端 + 后端混合：Vercel 跑前端 chat，Claude Agent SDK 跑后端复杂 orchestration
- **写作要点**：本章是跨范式对比的灵魂；**必须**给"我推荐 X，因为 Y"的强决策。链回 Anthropic engineering blog。

#### 5.2 MCP 协议在两边的位置 + Vercel 里用 MCP 的姿势

- **核心问题**：MCP 是 Anthropic 主导的开放标准，2026 已成事实工具接口标准。在 Vercel AI SDK 和 Claude Agent SDK 里 MCP 各自怎么用？
- **MCP 协议核心**：
  - 客户端 / 服务端架构：<strong>MCP server</strong> 暴露 tools / resources / prompts；<strong>MCP client</strong> 调用
  - 通信：JSON-RPC over stdio / HTTP / WebSocket
  - 标准化的工具描述（schema + description）+ 资源（数据源）+ prompt 模板
  - <strong>跨实现互通</strong>：Claude Code / Cursor / VS Code / Cloudflare AI / 等都能消费同一个 MCP server
- **生态现状（2026-05）**：
  - Anthropic 主导 + IETF / 多家协作维护
  - 上千个 MCP server 公开（GitHub / Slack / Linear / Notion / 数据库 / 浏览器自动化 / 等）
  - 已是 LLM 应用接外部工具的事实标准
- **Claude Agent SDK 里的 MCP**（中心地位）：
  - SDK 内置 MCP client；声明 MCP server 即可用其 tools
  - in-process MCP server：自定义工具直接在进程内（不需要单独进程）
  - 与 subagents / sessions 深度集成
- **Vercel AI SDK 里的 MCP**：
  - <code>experimental_createMCPClient</code>（仍 experimental，2026 状态）
  - 把 MCP tools 转成 Vercel AI SDK tool 定义，喂给 streamText / Agent
  - <strong>不是中心地位</strong>，但能用
- **典型代码示例方向**：
  - 在 Claude Agent SDK Python 里接 GitHub MCP server
  - 在 Vercel AI SDK 里接同一个 GitHub MCP server，对比代码量
  - 自建 in-process MCP server（Claude Agent SDK 风格）
- **2026 vs 2027 展望**：
  - 2026：MCP 已是 de facto 标准，但 Vercel 集成仍 experimental
  - 2027（推测）：Vercel AI SDK 把 MCP 提升到一等公民
  - <strong>MCP 不会消失，反而会扩大</strong>
- **写作要点**：本章把 MCP 讲清；**强调** MCP 是中立标准（不站队 Anthropic 或 Vercel），两家都在用。链回 Anthropic engineering blog + MCP 官网。

---

### P6 · 工程化与生产（1 章）

#### 6.1 测试 + 部署 + 监控 + caching + cost 控制 + AI Gateway

- **核心问题**：把 AI SDK 上生产之前要解决：测试（怎么 mock LLM 流式响应）、部署（Edge / Node / Bun runtime 限制）、监控（OTel / DevTools）、caching（不每次都打 LLM）、cost（token 烧钱）。这些 2026 标准做法是什么？
- **测试**：
  - <strong>不要 mock useChat / streamText 的内部</strong>，mock fetch / network 层（用 MSW，链回 testing 主题 P6）
  - SDK 的 <code>MockLanguageModelV2</code>（v5+）让 streamText 在测试里返回固定响应
  - tool execution 测试：直接 unit test 你的 tool execute 函数（不需要跑 LLM）
- **部署 runtime 边界**：
  - <strong>Vercel Edge runtime</strong>：长流式响应 OK；25s 默认 timeout（可调）；某些 Node API 不支持
  - <strong>Node.js runtime</strong>：完整支持；常用于复杂 agent / long-running
  - <strong>Bun</strong>（链回 bun 主题）：完整 Web Streams 支持；<code>Bun.serve</code> 流式响应
  - <strong>Cloudflare Workers</strong>：Streams 完整支持；CPU time limits 注意
- **DevTools**（v6 引入）：
  - 浏览器扩展看 useChat 内部 state / message parts / tool calls
  - 可视化 agent step / tool execution timeline
  - 类似 React DevTools 但专门给 AI SDK
- **OTel observability**：
  - v6 起内置 OpenTelemetry instrumentation
  - 默认导出 spans：streamText / generateText / tool execution / agent step
  - 接 Datadog / New Relic / Honeycomb / Langfuse 等
- **caching**：
  - <strong>Anthropic Prompt Caching</strong>（链回 Claude API docs）：长 system prompt / context cache 化，重复请求只付 cache 价
  - <strong>Vercel AI Gateway caching</strong>：v6 引入；统一 cache 层
  - <strong>应用层 cache</strong>：自己用 Redis / KV cache 整个 LLM 响应（适合相同输入完全一致输出）
- **cost 控制**：
  - 监控 <code>usage</code>（每次返回都包含 token 数）
  - AI Gateway 的 budget controls
  - 选小 model（Haiku / Mini）跑 routing / 简单任务，大 model 只在关键
  - prompt caching（系统 prompt 不变时重复请求只付 cache 价）
- **AI Gateway 工程实战**（v6 重点）：
  - 单一 endpoint 切 100+ provider model
  - 内置 fallback（一个 provider 挂了自动切另一个）
  - observability + budget + caching 一站
  - 适合多 provider 切换 + 不想自己集成多个 SDK 的项目
- **典型代码示例方向**：
  - 一个完整的 streamText 测试（用 MockLanguageModelV2）
  - Edge runtime 部署 + 长 agent 任务边界（25s timeout 怎么处理）
  - OTel 导出 + 在 Honeycomb 看 trace
  - Anthropic prompt caching 实战（system prompt 100k token cache）
- **写作要点**：本章是实战章；**强调** AI Gateway 在 v6 是 Vercel 的"商业差异化点"，但不强制（仍可不用 Gateway 直接打 provider）。链回 testing / bun / next 主题。

---

### P7 · 决策与陷阱 + v7 展望（1 章）

#### 7.1 选型决策树 + 陷阱清单 + v7 (WorkflowAgent / durable execution / loop control)

- **核心问题**：拿到一个新项目，从「选 Vercel AI SDK 还是 Claude Agent SDK」到「v5 / v6 升级时机」到「具体 hook / API 怎么调」一条决策链是什么？
- **3 层决策树**：
  - **第一层：选 Vercel AI SDK 还是 Claude Agent SDK？**
    - React / Next.js web app + 主要前端 chat / generative UI → Vercel AI SDK
    - CLI 工具 / 终端 agent → Claude Agent SDK
    - 后端复杂 agent orchestration（多 subagent / 长任务 / 严格 tool 权限） → Claude Agent SDK
    - 简单后端 agent → 都行；如果团队是 TS + 已经用 Vercel 生态 → Vercel AI SDK；如果是 Python 或要与 Claude Code 共生态 → Claude Agent SDK
    - 前后端混合 → Vercel 跑前端 + Claude Agent SDK 跑后端 agent
  - **第二层：Vercel AI SDK 内部 API 怎么选？**
    - 简单单次调用 → <code>generateText</code> / <code>generateObject</code>
    - UI 流式响应 → <code>streamText</code> / <code>streamObject</code>
    - chat 应用 → <code>useChat</code>
    - 单次补全 → <code>useCompletion</code>
    - 流式结构化 UI → <code>useObject</code>
    - 复杂 agent + 多 tool + 复用 → <code>Agent</code> / <code>ToolLoopAgent</code>（v6+）
    - generative UI（LLM 决定渲染什么 React 组件） → <code>streamUI</code>（<code>ai/rsc</code>）
  - **第三层：v5 → v6 升级与 v7 展望**
    - 已在 v5 → 升 v6 较平滑（spec 改进，不是 SDK 重做）
    - 仍在 v4 → 必须先升 v5（协议层 + state 模型双重重做）
    - v7 canary 不要在生产用（仍 unstable）
- **常见陷阱清单（一节一陷阱配修复）**：
  1. v5 useChat 端到端 SSE 协议没适配 → 修：参考 SDK 文档 update server endpoint
  2. UIMessage 里塞 LLM 不需要的 metadata → LLM context 膨胀；修：用 metadata 字段（不进 ModelMessage）
  3. tool 抛错没处理 → 整个 chat 死；修：在 tool execute 内 try/catch，把 error 作为 result 返回
  4. streamUI 在 client component 里调 → 报错；修：streamUI 必须在 Server Action / Route Handler
  5. Edge runtime 跑长 agent 任务 → 25s timeout；修：用 Node runtime 或拆任务
  6. tool 输入 schema 用 z.any() → LLM 不知道传什么；修：精确 schema + describe
  7. 混用 v4 旧 hooks 和 v5 新 API → 类型不兼容；修：全升 v5
  8. AI Gateway $5 免费额度后没限额 → 月底惊喜账单；修：dashboard 设 budget
  9. 没用 prompt caching 长系统 prompt 重复付 → token 账单贵 5x；修：开 prompt caching
  10. tool 没 requiresApproval 标记敏感操作 → 用户没确认就执行；修：v6+ 加 requiresApproval
  11. useChat 初始 messages 没设 → 每次 mount 都从空开始；修：从 server 注入或 localStorage
  12. 在 useChat handler 里直接用 messages 不用 convertToModelMessages → 协议错；修：用 SDK helper
- **v7 展望（canary）**：
  - <strong>WorkflowAgent</strong>：与 Vercel 新发布的 durable execution programming model 对齐 —— agent task 可持久化、跨 process 重启、跨小时几天运行
  - <strong>Loop control</strong>：<code>stopWhen</code> / <code>prepareStep</code> 让 agent loop 可显式控制（"看到这个状态就停"/"每步前预处理"）
  - <strong>2027 推测</strong>：MCP 在 Vercel AI SDK 提到一等公民；durable execution 进 stable；多 agent orchestration 标准化
- **2026 强观点收尾**：
  - "前端 chat / generative UI 选 Vercel AI SDK 没争议"
  - "复杂后端 agent + 与 Claude Code 共生态选 Claude Agent SDK"
  - "v6 是 2026 主线，新项目直接 v6（v5 不要新启）"
  - "MCP 是工具接口的事实标准，不要再自定义了"
  - "AI Gateway 不是必须，但简化多 provider 切换 + observability 一站"
- **写作要点**：本章是**实战决策章**；给"看场景选什么 + 看症状改什么"的双向决策；最后给"我推荐 X，因为 Y"的强观点收尾。链回 react / next / typescript / testing 主题。

---

## 写作风格 ——「写文章人，不是建筑师」

> （遵循已有约定）

- **章节内部**：6 段模板（速览 → 底层逻辑 → 应用场景 → 典型代码 → 常见陷阱 → 延伸阅读）
- **跨章引用**：用「短重述 + 链回」，不抄不省
- **图示**：LLM 集成 5 年时间线 / Vercel 三层架构 / Stream Protocol 演化 / UIMessage vs ModelMessage / Agent loop / Claude Agent SDK subagent 树 / MCP 协议层 / 决策树 全用 SVG
- **代码示例**：每章 5-10 段可运行的真实代码（基于 Vercel AI SDK v6 主线 + Claude Agent SDK 主线）
- **加粗（克制）**：每章 ≤ 25 个 `<strong>`；每段不超过 1-2 个；不要靠加粗散点高亮"我觉得重要"的描述句
- **避免**：
  - 罗列 API 文档（链回官方）
  - "架构师式"分类标签（X 派 / Y 流）
  - 中立到没观点（每章必须给"我推荐 X，因为 Y"）
  - 抄 v5 / v6 changelog（设计动机要回到 vercel.com/blog 一手）
- **观点强度**：
  - 强观点（"前端 chat 选 Vercel AI SDK 没争议"，"v4 → v5 是协议层重做不只是 API 改名"，"MCP 是 2026 工具接口事实标准"）
  - 弱观点（"Vercel AI SDK 还是 Claude Agent SDK 看场景"）
  - 不观点（"Mastra / CopilotKit 等 niche 框架看团队偏好"）

---

## 不写的内容（明确划线）

- **不讲**：
  - 各 LLM provider 的 raw API 细节（OpenAI / Anthropic / Google / Mistral 各自 endpoints）
  - Prompt engineering / chain-of-thought / few-shot 等 prompt 技巧
  - LLM 训练 / fine-tuning / RLHF / 模型结构
  - Vector DB / embedding / RAG 完整方案（仅在 P5 / P6 提一句）
  - LangChain JS 完整教程（仅 P1 横评提到）
  - 特定 provider feature（OpenAI o1 reasoning / Claude extended thinking / Gemini multimodal） —— 仅 P4 / P5 提及，引官方 docs
  - Mastra / CopilotKit / Inkeep / OpenAI Agents SDK 完整教程（仅 P1 横评提到）
- **链回但不重复**：
  - RSC / Server Components → 链回 react / next 主题
  - React 19 use API / useOptimistic → 链回 react 主题 P6
  - Server Actions → 链回 next 主题 P4
  - Suspense / Error Boundary → 链回 react 主题 P5
  - HTTP 流式协议层（SSE / chunked / fetch streams） → 链回 http 主题 P6（双向链）
  - TanStack Query streamedQuery → 链回 tanstack-query 主题 P4.2（双向链）
  - 测试栈（MSW + Testing Library） → 链回 testing 主题
  - TypeScript 泛型 / utility types → 链回 typescript 主题
  - Bun / Node runtime 边界 → 链回 bun + node 主题
  - Edge runtime → 链回 next 主题 P6

---

## 路线图

- **Step 1**：本 outline.md 经用户审定 ← **当前**
- **Step 2**：建 8 个文件骨架（`ai-sdk/index.html` + 7 个 phase 目录的 `index.html`）
- **Step 3**：P1 章节正文（5 年史 + 设计哲学，2 章）
- **Step 4**：P2 章节正文（三层架构 + Stream Protocol 演化，2 章）
- **Step 5**：P3 章节正文（useChat / useObject + streamUI / Generative UI，2 章）
- **Step 6**：P4 章节正文（Agent + Tool use，2 章 ⭐ v6 主线）
- **Step 7**：P5 章节正文（Claude Agent SDK 横评 + MCP，2 章）
- **Step 8**：P6 章节正文（工程化与生产，1 章）
- **Step 9**：P7 章节正文（决策树 + v7 展望，1 章）+ 站点首页卡片改 done

---

## 与 index.html 卡片的对应

AI SDK 主题在站点首页的卡片描述（草拟，落定后会替换 index.html 中"⏳ 规划中"的 placeholder）：
> 7 阶段 / 12 章：LLM 应用集成 5 年史 + 同代人横评（raw API / LangChain / Vercel AI SDK / Claude Agent SDK / Mastra）+ 设计哲学（"包 LLM API"→"agent abstraction"范式演化）+ Vercel AI SDK v6 主线（三层架构 / Stream Protocol 演化 / UIMessage vs ModelMessage / Agent + ToolLoopAgent / Tool use + Human-in-the-loop / streamUI generative UI / RSC 集成）+ Claude Agent SDK 横评（agent loop / subagents / MCP / hooks / 与 Vercel 两种范式对比）+ MCP 协议在两边的位置 + 工程化（测试 / Edge runtime / OTel / caching / AI Gateway）+ 决策树 + v7 展望（WorkflowAgent / durable execution）。锁定 Vercel AI SDK v6 + Claude Agent SDK 2026-05 主线。

按 ecosystem 主题约定（见 README 设计原则 + memory `convention_weight_center_crossref`）：
- **center of gravity**：⑧ AI 集成
- **不创建 crossref 卡片**：next / react / tanstack-query / http 卡片描述里如需提"也覆盖 LLM 集成 / 流式协议"，在描述文字内自然提及，不开独立卡片
- **横向对照（LangChain / Mastra / CopilotKit / OpenAI Agents SDK 等）**：在 P1 / P5 / P7 章内部完成，不开独立主题
