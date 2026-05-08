# HTTP/2 + HTTP/3 + QUIC 深度学习 · 章节大纲

> 本文件是「现代 HTTP 协议层 + 前端工程实战」主题的写作蓝本。**7 阶段 · 12 章**：协议机制（HTTP/1.1 → /2 → /3 + QUIC）与工程实战（资源加载 / 流式 / 双向通信 / Edge / 测量 / 决策）双线齐重，回答前端工程师在 2026 年绕不开的「为什么 HTTP/3 不只是更快的 HTTP/2」「Server Push 为什么死了 / 替代是什么」「fetch streams / SSE / WebTransport / WebSocket 各自该用在哪」这一系列协议+工程问题。
> 编写日期：2026-05-08（首版）｜目标版本：RFC 9000-9002（QUIC v1）/ RFC 9110-9112（HTTP semantics + caching + HTTP/1.1）/ RFC 9113（HTTP/2）/ RFC 9114（HTTP/3）/ RFC 9204（QPACK）/ RFC 9218（HTTP priority signaling）/ RFC 8297（103 Early Hints）

---

## 元信息

- **目标版本与规范基线**：
  - **HTTP semantics**：**RFC 9110**（2022-06，统一 HTTP 语义层，HTTP/1.1/2/3 共用一份语义定义）—— 这是 2022 年规范大重构的根。
  - **HTTP caching**：**RFC 9111**（2022-06）—— `Cache-Control` / `ETag` / `Vary` 等含 `stale-while-revalidate`（RFC 5861 的归并）。
  - **HTTP/1.1 wire format**：**RFC 9112**（2022-06，替代 RFC 7230）—— ASCII 文本协议、chunked、keep-alive 等仍是 fallback 基线。
  - **HTTP/2**：**RFC 9113**（2022-06，替代 RFC 7540 + 7541 的 errata）—— 二进制帧、streams、多路复用、HPACK。本规范明确**移除 prioritization tree**（指向 RFC 9218 重做优先级），**不再推荐 Server Push**（多数浏览器 2022 起已停止实现）。
  - **HTTP/3**：**RFC 9114**（2022-06）—— HTTP-over-QUIC，frame 复用 HTTP/2 思路但去掉 stream 复用层（streams 移到 QUIC）。
  - **QUIC v1**：**RFC 9000** core / **RFC 9001** TLS 1.3 集成 / **RFC 9002** loss detection + congestion control（2021-05）。
  - **QPACK**：**RFC 9204**（2022-06）—— HTTP/3 的头压缩，HPACK 在乱序传输下不可用，所以 HTTP/3 重新设计了头压缩。
  - **HTTP priority signaling**：**RFC 9218**（2022-07）—— `Priority` 头 + `priority` 参数，替代 HTTP/2 prioritization tree。
  - **103 Early Hints**：**RFC 8297**（2017-12）—— 2026 在 Cloudflare / Vercel / Fastly 已是 production-ready 替代 Server Push 的工程方案。
  - **WebTransport over HTTP/3**：W3C / IETF draft 仍在 WD（2026-05 主流浏览器实现状态：Chrome/Edge stable，Firefox 实验，Safari 未实现），按"draft 主线 + 标 unstable"处理。
  - **TLS 1.3**：**RFC 8446**（2018-08）—— QUIC 强制 TLS 1.3；HTTP/2 过 TLS 1.2/1.3 都行，但生产几乎全 1.3。
  - **历史回溯**：HTTP/0.9（1991, Tim Berners-Lee）→ HTTP/1.0（RFC 1945, 1996）→ HTTP/1.1（RFC 2068, 1997 → 2616, 1999 → 7230, 2014 → 9112, 2022）→ SPDY（Google, 2009）→ HTTP/2（RFC 7540, 2015 → 9113, 2022）→ QUIC 草案（Google QUIC, 2012）→ IETF QUIC（2016-2021）→ HTTP/3 RFC（2022-06）→ Server Push 移除推荐（2022）。
- **来源**：
  - [datatracker.ietf.org RFC 9110-9114 / 9000-9002 / 9204 / 9218 / 8297](https://datatracker.ietf.org)（一手规范）
  - [HTTP Working Group / QUIC WG charter + 工作记录](https://httpwg.org/)
  - [web.dev 关于 HTTP/3、Early Hints、Resource Hints 的工程指南](https://web.dev/)
  - [MDN HTTP / Web APIs 参考](https://developer.mozilla.org/)
  - [Cloudflare blog（QUIC / HTTP/3 落地最详细的工程视角）](https://blog.cloudflare.com/)
  - [Fastly engineering blog（同步 IETF 标准 + 边缘运维）](https://www.fastly.com/blog)
  - [Daniel Stenberg（curl 作者）的 "HTTP/3 Explained" 在线书](https://http3-explained.haxx.se/)
  - [Akamai / Google research 论文（BBR 拥塞控制原文 + 0-RTT 安全分析）](https://research.google/)
  - [Robin Marx（QUIC / HTTP/3 学界视角）的论文与博客](https://github.com/rmarx/holblocking-blogpost)
  - Chrome / Firefox 网络团队的工程博客（Chrome `network-stack-team` / Mozilla Networking）
- **目标读者**：
  - 写过前端 / 全栈，会用 fetch / SSE / WebSocket，但说不清「为什么 HTTP/2 不能完全替代 1.1」「QUIC 是不是只是更快的 TCP」的工程师
  - 在 Cloudflare / Vercel / Fastly / 自建 CDN 部署服务，但 ALPN / 0-RTT / Early Hints / fetchpriority 心智模糊的工程师
  - 想理解 React 19 RSC 流式渲染、TanStack Query streamedQuery、Vercel AI SDK 流式响应**底下的 HTTP 协议机制**的人
  - 在 SRE / 架构岗负责协议层选型、CDN 配置、性能调优的 tech lead
- **不是这个主题的读者**：
  - 没写过任何网络代码、连 Promise / fetch 都没用过的（先读 javascript 主题 P6 网络章）
  - 想要「30 分钟接入 HTTP/3」教程的（这里讲机制 + 工程权衡，不讲配方）
  - 只关心 HTTP 应用层（headers / methods / status codes）的（链回 MDN，本主题假设这部分已掌握）
  - 关心 OSI 全栈或 TCP 实现细节的（本主题在 TCP 上只点到必要的程度，深入请看《TCP/IP 详解》或 RFC 9293）

---

## 整体设计：7 阶段 · 双线齐重 · 协议层与工程层 6+5+1 拉开

「HTTP/2 + HTTP/3 + QUIC」不是一个能拿单一线索讲透的主题。它有两条根本不同的轴：

- **协议层（why this byte-on-the-wire format）**：HTTP/1.1 → /2 → /3 是三代抽象：消息 → 帧+流 → 用户态传输层。每代都为了解决前一代的天花板。
- **工程层（how to use it in 2026）**：preload / Early Hints / Server Push 兴衰、SSE vs WebSocket vs WebTransport、Edge / CDN 部署、Web Vitals 与协议层的真实关联。前端工程师每天踩的坑都在这一层。

只讲协议会变成 RFC 复述；只讲工程会变成 cookbook。所以**协议机制 6 章 + 工程实战 5 章 + 决策 1 章**，齐重铺开。

| 阶段 | 章数 | 核心问题 | 偏向 |
|---|---|---|---|
| **P1 · 是谁 / 为什么** | 2 | HTTP 35 年项目史 + 同代人横评（SPDY / HTTP/2 / QUIC / HTTP/3）；从消息 → 帧 → 流 → 用户态传输层的四代抽象升级 | 协议+工程 总览 |
| **P2 · HTTP/1.1 基线** | 1 | HTTP/1.1 至今的真相（RFC 9110-9112 修订视角）+ 它的天花板：HOL blocking / 6 connection / 头大小 | 协议层 |
| **P3 · HTTP/2 协议层** | 2 | 二进制帧 + streams + 多路复用 + flow control；HPACK 头压缩 + Server Push 兴衰 + HTTP/2 的 TCP HOL 限制 | 协议层 |
| **P4 · QUIC + HTTP/3 协议层** ⭐ | 2 | QUIC 在 UDP 上重建传输层（streams / 0-RTT / 连接迁移 / TLS 1.3 集成）；HTTP/3 over QUIC + QPACK + 拥塞控制（BBR / Cubic） | 协议层（最难） |
| **P5 · 资源加载工程** | 2 | 资源提示家族（preload / preconnect / fetchpriority + RFC 9218 priority）；Server Push 之死 + 103 Early Hints + 现代替代方案 | 工程层 |
| **P6 · 流式 + 实时通信** | 2 | 单向流（fetch streams / chunked / SSE / 与 RSC streaming + TanStack Query streamedQuery 协作）；双向（WebSocket / WebTransport / WebRTC 数据通道横评） | 工程层 |
| **P7 · 决策与陷阱** | 1 | 测量工具（curl --http3 / nghttp / Wireshark / Chrome DevTools / RUM）+ ALPN / TLS 1.3 / HTTPS DNS / ECH + CDN/Edge 部署 + 选型决策树 + 陷阱清单 | 工程层 决策 |

总计 **12 章 ≈ 75,000-85,000 字**，平均每章约 6,500 字。**比重偏向 P3-P6**（协议机制 4 章 + 工程实战 4 章是日常主战场），P1 / P2 / P7 写得紧凑。

---

## 与既有主题的边界 ——「短重述 + 链回」原则

> ✅ **短重述**：1-3 句话点出"它在底层是什么 + 关键性质"
> ✅ **链回**：紧跟一句"详细的 X / Y / Z 请参考 [`主题/{phase}/{chapter}`]"
> ❌ **不要**直接抄一遍其他主题的论述

**关键边界**：

| 概念 | 在哪讲透 | 本主题里怎么处理 |
|---|---|---|
| fetch / Streams API / AbortController | `javascript/` 主题（网络与流） | 链回，P6.1 短重述 ReadableStream 是怎么和 chunked / SSE 对接的 |
| Service Worker / Cache API | `javascript/` 主题（Service Worker 章） | 链回，P5.1 + P7.1 资源加载与缓存交叉处提一句 |
| RSC 流式渲染 / 流式 payload | `react/06-modern/01-server-components.html` + `next/03-rsc-streaming/` | 链回，P6.1 讲 RSC payload 在 chunked transfer 上的工程含义 |
| Server Actions 与 fetch | `next/04-server-actions/` | 链回，P6.1 + P7.1 提一句 Server Actions 走 POST + 重定向的协议含义 |
| TanStack Query streamedQuery | `tanstack-query/04-advanced-patterns/02-suspense-streaming.html` | 双向链，P6.1 + P7.1 互引，本主题给协议层根因 |
| Vercel AI SDK 流式响应 | 待写 AI SDK 主题 | 链回（暂占位），P6.1 提 SSE / chunked + AI SDK Data Stream Protocol；AI SDK 主题反过来引本主题 |
| TLS 1.3 内部机制 | 不另开主题（不在 deep-dive 当前 18 主题计划内） | 必要时短解（QUIC 内嵌 TLS 1.3 是必讲点），不展开 record layer / handshake state machine |
| TCP 拥塞控制（Reno / Cubic / BBR） | 不另开主题 | 必要时短解（QUIC 在用户态可换算法是关键卖点），引 Google BBR 论文，不深入排队论 |
| DNS / HTTPS RR / ECH | 不另开主题 | P7.1 短重述 + 链 IETF 草案，不展开 DNSSEC / DoT / DoH 全谱 |
| Web Vitals（LCP / INP / CLS） | `browser-rendering/` 主题 | 链回，P5.1 + P7.1 讲资源加载策略与 LCP 的关系 |
| Critical Rendering Path | `browser-rendering/` 主题 | 链回，P5.1 讲 preload + 关键 CSS 和 CRP 的关系 |
| HTTP 缓存语义（Cache-Control / ETag） | 主题内**不重讲**，假设已掌握 | 仅 P5.2 + P7.1 在与 Early Hints / CDN 边缘缓存交叉时短重述，引 RFC 9111 |
| WebRTC（信令 / NAT 穿透 / DTLS-SRTP） | 不另开主题 | P6.2 仅讲 WebRTC DataChannel 与 WebTransport 的横评，不深入 ICE / STUN / TURN |
| Cloudflare Workers / Vercel Edge runtime | `next/06-runtime-deployment/` 等 | 链回，P7.1 讲 Edge 部署对协议层的影响，不重讲 isolate / runtime |

---

## 内容覆盖原则 ——「RFC 一手 + 工程二手」

HTTP/2/3/QUIC 的特殊处：**协议层有非常严谨的 RFC，而工程层完全靠头部厂商（Google / Cloudflare / Fastly / Akamai）的 production 数据驱动**。所以写作时严格分两层来源：

**4 条规则**：

1. **协议机制以 RFC 为准**：HPACK 哈夫曼表、QUIC 帧格式、QPACK encoder/decoder stream、congestion control 算法都必须引 RFC 章节号；不引 blog / 不引知乎。
2. **工程实战以头部厂商 production 文章为准**：Server Push 之死、Early Hints 实测增益、BBR vs Cubic 在中国移动网络的差异 —— 必须有 Cloudflare / Fastly / Akamai 的实测数据，不靠"我觉得"。
3. **历史回溯以 SPDY / Google QUIC 原始资料为准**：SPDY whitepaper、Google QUIC 早期 RFC 提案、Jim Roskind 的演讲是一手；不要二手转述。
4. **2026 当前状态以浏览器 / 服务端实测为准**：HTTP/3 浏览器支持率、QUIC 部署率、Server Push 实际启用率，必须引可验证的来源（caniuse / Web Almanac / Cloudflare radar），不靠估计。

---

## 节奏建议

- **连读组**：
  - P1.1 + P1.2（35 年史 → 设计哲学，理解三代协议为什么必要）
  - P3.1 + P3.2（HTTP/2 帧 → HPACK + Server Push，必须连读才知道 HTTP/2 兴衰）
  - P4.1 + P4.2（QUIC → HTTP/3，QUIC 是 HTTP/3 的根，分开读会断片）
  - P5.1 + P5.2（资源提示 → Early Hints，前者是基础后者是替代 Server Push 的工程实践）
- **可独立跳读**：
  - P2.1 HTTP/1.1 基线、P6.2 WebSocket / WebTransport、P7.1 决策树
- **建议阅读顺序**：
  - **想理解 HTTP/3 为什么"不只是更快"的工程师**：P1.2 → P3 → P4（重点）
  - **做资源加载性能优化的工程师**：P5（重点）→ P3.2 → P7.1
  - **做实时 / 流式 / AI 应用的工程师**：P6（重点）→ P4.1 → P7.1
  - **CDN / SRE / 架构选型者**：P1.2 → P4 → P7（重点）

---

## 章节简述

> 下面每章列出**核心问题 + 关键内容 + 写作要点**。每章按 6 段模板（速览 → 底层逻辑 → 应用场景 → 典型代码 → 常见陷阱 → 延伸阅读）。

### P1 · 是谁 / 为什么（2 章）

#### 1.1 HTTP 35 年项目史 + 同代人横评

- **核心问题**：从 HTTP/0.9（1991）到 HTTP/3 + QUIC（2022 RFC），35 年踩了哪些坑？为什么每隔 7-10 年就要换一代协议？SPDY / HTTP/2 / QUIC / HTTP/3 这条线是必然还是偶然？
- **关键节点**：
  - **1991** HTTP/0.9：Tim Berners-Lee 一行 GET，连 status code 都没有
  - **1996** HTTP/1.0（RFC 1945）：加入 headers / status codes / Content-Type
  - **1997-1999** HTTP/1.1（RFC 2068 → 2616）：keep-alive、Host header、chunked、cache control —— 主导 web 20 年
  - **2009** SPDY（Google）：最早提出多路复用、头压缩、Server Push 的实验协议；驱动了后来 HTTP/2 的标准化
  - **2014** HTTP/1.1 重订（RFC 7230-7235）：把 1999 年的混乱定义重切成 6 个 RFC
  - **2015** HTTP/2 RFC 7540：基于 SPDY，IETF 标准化；二进制帧 / 多路复用 / HPACK / Server Push
  - **2012-2013** Google QUIC（gQUIC）：Jim Roskind 团队在 UDP 上重建传输层；Google.com / YouTube 实验
  - **2016** IETF QUIC WG 成立：从 gQUIC 抽象出标准化版本
  - **2021-05** RFC 9000-9002：QUIC v1 标准化
  - **2022-06** RFC 9110-9114：HTTP semantics 大重构 + HTTP/2 erratum 集成 + HTTP/3 标准化 + Server Push 移除推荐
  - **2022-07** RFC 9218：HTTP priority signaling（替代 HTTP/2 prioritization tree 失败的尝试）
  - **2024-2026** HTTP/3 在 Cloudflare / Fastly / Akamai 全面默认；浏览器 stable 全开（Chrome/Firefox/Safari/Edge）
- **同代人横评**：
  - **HTTP/1.1**：仍是 fallback 基线；老系统、内网工具链、curl 一行调试都靠它；2026 仍占 web 流量约 25-30%
  - **HTTP/2**：2018-2022 黄金期，2022 后被 HTTP/3 蚕食；Server Push 实质上是失败实验
  - **HTTP/3 + QUIC**：2026 主流 CDN 默认开启；浏览器到 CDN 这一段普及率 ~70%；CDN 到 origin 这一段仍多用 HTTP/2 或 1.1
  - **WebSocket**：1.1 升级而来，独立协议（RFC 6455）；HTTP/2 上有 RFC 8441（基本无人用）；HTTP/3 上有 RFC 9220（2026 落地缓慢）
  - **WebTransport over HTTP/3**：QUIC 时代为多路双向流而生的新 API；W3C draft；2026 浏览器实现仅 Chromium 系
  - **gRPC over HTTP/2 / gRPC-Web**：HTTP/2 的事实主力流式 RPC；2026 仍被广泛使用；服务端到服务端选型常胜
- **写作要点**：用一张时间线 SVG 串起来；每个节点配一句"它解决了什么前一版的痛点"。**强调**「Server Push 在 IETF 里就被认为是错的、HTTP/2 标准里很多设计被 HTTP/3 推翻」这一现实矛盾。**避免**纯版本号罗列。

#### 1.2 设计哲学：从消息 → 帧 → 流 → 用户态传输层的四代抽象升级

- **核心问题**：为什么 HTTP/2 要走二进制帧？为什么 HTTP/3 又要把传输层从内核搬到用户态？这四代抽象升级（消息 → 帧 → 流 → 用户态传输层）是被什么逼出来的？
- **第一代（HTTP/1.x）：消息抽象**：
  - 一个 TCP 连接里串行发请求 + 响应；keep-alive 让连接复用，但不能并发
  - HOL blocking（队头阻塞）出现在应用层：一个慢请求堵后面所有请求
  - 浏览器拼命开连接（每个域名 6 个）绕过这一限制
- **第二代（HTTP/2）：帧 + 流抽象**：
  - 引入"frame"（数据 / headers / settings 等帧类型）+ "stream"（虚拟逻辑流）
  - 一个 TCP 连接里多路复用多个 stream，不需要再多开连接
  - 解决了**应用层** HOL blocking
  - 但 TCP 本身仍是字节流：丢一个包，整条 TCP 流都要等重传 → **传输层** HOL blocking 仍在
- **第三代（QUIC）：用户态传输层**：
  - 把 TCP 替换为 UDP + 用户态可演化的传输层
  - QUIC streams 变成第一等公民：每条 stream 有自己的丢包恢复，互不干扰 → 真正消灭 HOL blocking
  - TLS 1.3 内嵌进 QUIC 握手：从"TCP 三次握手 + TLS 二次握手"压成"QUIC 一次握手"；0-RTT 让重连不耗 RTT
  - 连接 ID 解耦于 IP+port：手机切 wifi → 4G 不断连
- **第四代（HTTP/3）：去掉 HTTP/2 在 TCP 上的补丁**：
  - HTTP/3 frame 只剩"data / headers"少数几种；stream 全部交给 QUIC
  - HPACK 在 QUIC 乱序传输上不工作 → 重新设计 QPACK
  - prioritization tree（HTTP/2 失败实验）扔掉 → 改用 RFC 9218 简单的 urgency / incremental 信号
- **设计哲学三个关键决策**：
  1. **传输层应该可演化**：TCP 在内核固化 30 年，每次改算法（cubic → BBR）要等 OS 升级；QUIC 跑在用户态，浏览器更新即可换算法
  2. **加密是默认**：QUIC 强制 TLS 1.3，HTTP/3 不存在明文模式 —— 隐式承认中间盒（middlebox）会破坏可演化性，加密是防御
  3. **每个 stream 独立**：放弃"在一个有序字节流上多路复用"的幻觉，承认网络是丢包的现实
- **为什么不直接改 TCP**：
  - TCP 是 OS 内核态：升级需要换 OS
  - 中间盒（NAT / 防火墙 / 透明代理）已经"理解"TCP 字节序号；改 TCP 字节序意味着中间盒挂掉
  - QUIC 走 UDP + 加密 → 中间盒看不见内部，破坏不了
- **写作要点**：本章是**整个主题的灵魂**——读者读完应该能从本质上回答"为什么 HTTP/3 不只是 HTTP/2 升级版"。强观点收尾："2026 起，新协议的设计原则是『加密 + 用户态 + 可演化』，TCP 时代的协议设计哲学已经被推翻"。

---

### P2 · HTTP/1.1 基线（1 章）

#### 2.1 HTTP/1.1 真相与天花板（RFC 9110-9112 修订视角）

- **核心问题**：2026 年 HTTP/1.1 仍占 25-30% 流量，每个工程师都该知道它的真相 —— keep-alive、pipelining、chunked、Range 请求都怎么工作？为什么浏览器不再支持 pipelining？6 connection limit 从哪来？
- **HTTP/1.1 协议要点（RFC 9110 + 9112 视角）**：
  - **请求行 + headers + 空行 + body**：ASCII 文本协议，可直接 telnet 调试
  - **Host header**：1.0 → 1.1 最大改动，让一台服务器能 vhost 多个站点
  - **Connection: keep-alive**：默认开（1.1 起），TCP 连接发完一个请求不关，下一个请求复用
  - **Transfer-Encoding: chunked**：动态长度响应；每 chunk 是 `<size hex>\r\n<data>\r\n`，0 size 表示结束 —— 这是 SSE / 流式 RSC 的 wire 基础
  - **Range / 206 Partial Content**：断点续传、视频拖动 —— 静态 CDN 必备
  - **Pipelining**（理论上可以连发多个请求不等响应）：实际上**所有现代浏览器都禁用**，因为中间盒兼容性问题 + HOL blocking 仍在
- **HTTP/1.1 天花板（被 HTTP/2 攻击的痛点）**：
  - **应用层 HOL blocking**：一个连接同时只能跑一个请求；前一个慢全堵
  - **6 connection limit**：浏览器对每个 origin 默认开 6 个连接（不同浏览器 6-13）→ 早期 web 性能优化"sharding"（拆 CDN 子域名绕过限制）就是这么来的
  - **headers 重复发送**：每个请求都重发 Cookie / User-Agent，没压缩 → cookie 大的网站头开销吃掉带宽
  - **明文（无加密）**：HTTPS 是 TLS 在 1.1 之上 wrap，不是协议本身的事
- **HTTP/1.1 至今为什么仍活着（2026 视角）**：
  - 内网工具 / 调试工具 / curl 一行链 —— 用 1.1 简单
  - 旧后端 / proxy 没升级 —— CDN 到 origin 这段大量仍用 1.1
  - HTTP/2 本质上仍兼容 1.1 语义（RFC 9110 共用）—— 切换不是颠覆
- **典型陷阱**：
  - 写测试 / 调试代码用 telnet 调 HTTPS → 没用，TLS 包了一层
  - 误以为 HTTP/1.1 pipelining "可以用"→ 浏览器全禁，服务端开了也没意义
  - 用 chunked 实现 SSE 但忘了禁用 nginx buffering → 流式失效
  - cookie 压到 4KB+ → 每个请求重发 → 移动网络带宽爆炸
- **关键代码示例方向**：
  - 用 curl `-v` 看一个 1.1 请求的完整 wire
  - 用 Node.js `net.Socket` 手写一个 1.1 请求 + chunked 解析
  - 一个 chunked SSE 服务端 + 客户端 fetch + ReadableStream 消费
- **写作要点**：本章是协议层"基线"，写得紧凑但**必须把 HOL blocking 讲清楚**，因为后面 HTTP/2 / HTTP/3 的所有动机都来自于此。链回 javascript 主题的 fetch / streams 章节。

---

### P3 · HTTP/2 协议层（2 章）

#### 3.1 HTTP/2 二进制帧 + streams + 多路复用 + flow control

- **核心问题**：HTTP/2 把 HTTP 从文本协议变成二进制帧 + streams，到底解决了什么？多路复用具体怎么做？flow control 是不是和 TCP 重复了？
- **HTTP/2 帧格式（RFC 9113 §4）**：
  - 9-byte 帧头：length(24) / type(8) / flags(8) / R(1) + stream id(31)
  - 10 种帧类型：DATA / HEADERS / PRIORITY (deprecated) / RST_STREAM / SETTINGS / PUSH_PROMISE (deprecated) / PING / GOAWAY / WINDOW_UPDATE / CONTINUATION
  - 一个 TCP 连接里所有帧无序穿插发送；按 stream id 区分归属
- **stream 抽象**：
  - stream id 是奇数（client 发起）/ 偶数（server 发起，仅 Server Push 用）
  - stream 有状态机：idle / open / half-closed / closed
  - 一个 HTTP 请求 + 响应 = 一个 stream（HEADERS → DATA → HEADERS trailers）
- **多路复用核心机制**：
  - 一个 TCP 连接可承载几百到几千个 stream 并发
  - 解决浏览器"6 connection limit"和"sharding"workaround
  - 同 origin 不再需要拆子域名 → CDN 配置简化
- **flow control（流量控制）**：
  - HTTP/2 在每个 stream 和整个连接两个层级有 window
  - WINDOW_UPDATE 帧扩窗；初始窗口 64KB（连接级），可调
  - **为什么不重复**：TCP 流控是 sender → receiver，HTTP/2 流控是 producer → consumer（应用层）；HTTP/2 流控可以让 client 的 stream A 暂停而 stream B 继续，TCP 做不到
- **prioritization tree（已废弃）**：
  - HTTP/2 RFC 7540 设计了 priority dependency tree（让 client 告诉 server 哪些 stream 重要）
  - 实际上**几乎没有 server 实现得对**；浏览器实现也常年有 bug
  - RFC 9113 正式废弃；改用 RFC 9218 的简单 `Priority` 头（urgency 0-7 + incremental）
- **典型陷阱**：
  - HTTP/2 上仍受 TCP HOL blocking：一个 packet 丢，所有 stream 都要等（这是 HTTP/3 出现的根本原因）
  - 误以为多路复用消除了所有阻塞 → 弱网下 HTTP/2 反而比 HTTP/1.1 慢的真实案例
  - HTTP/2 over TLS 1.2（生产几乎全 1.3）+ ALPN（"h2"）协商；不是 Upgrade header
  - 调试 HTTP/2 不能用 telnet / curl -v 看 wire（二进制）；要用 nghttp / Wireshark
- **关键代码示例方向**：
  - Node.js `http2` 模块跑一个 server + 用 nghttp / curl --http2 看帧
  - 用 Chrome DevTools Network 看 HTTP/2 stream 时间线
  - 一个 weak network 模拟 + HTTP/1.1 vs HTTP/2 对照（HOL blocking 真实演示）
- **写作要点**：用一张帧格式 SVG + 一张 streams 时间线 SVG。**强调**"多路复用解决应用层 HOL，但 TCP HOL 仍在" —— 这是 HTTP/3 必要性的根。链回 P2.1（HTTP/1.1 HOL blocking 的来源）。

#### 3.2 HPACK 头压缩 + Server Push 兴衰 + HTTP/2 的 TCP HOL 限制

- **核心问题**：HPACK 怎么压头？为什么 HTTP/3 不能用 HPACK 必须重做 QPACK？Server Push 为什么从"HTTP/2 杀手锏"变成"被 RFC 9113 移除推荐"？
- **HPACK（RFC 7541，被 9113 引用）**：
  - 静态表 61 项：常见 header（`:method GET` / `content-type: text/html` 等）→ 单字节索引
  - 动态表：连接生命周期内累积的 header 缓存；client 和 server 各维护一份
  - Huffman 编码：动态表里仍是字符串的 header 用预定义 Huffman 表压缩
  - 压缩比：典型场景下 header 体积压到 10-20%
- **HPACK 的核心缺陷（必须用顺序更新的动态表）**：
  - 动态表的更新必须按 header block 的发送顺序解码；HTTP/2 在 TCP 上是有序的，所以没问题
  - 在 QUIC 上 streams 乱序到达：如果一个晚到的 stream 引用了一个动态表索引，但定义那个索引的 stream 还没到 → 解码不出来
  - 这就是 HTTP/3 必须重做 QPACK 的根
- **Server Push（PUSH_PROMISE 帧）**：
  - 设计动机：server 知道 client 要 `index.html` 必然要 `style.css`，与其等 client 解析 HTML 再请求，不如主动 push
  - 实际表现：浏览器 cache 难协调（server 不知道 client 已有 cache）/ 经常重复 push 已有资源 / 浏览器实现 bug 多
  - 2017-2020 年实测：Chrome 团队数据显示 Server Push 在大部分场景里**伤性能**而不是帮性能
  - **2022 Chrome 移除支持** / **RFC 9113 不再推荐** / **几乎所有 server 已停用**
  - 替代方案：**103 Early Hints + preload**（详见 P5.2）
- **HTTP/2 的 TCP HOL blocking 限制**：
  - 多路复用解决应用层 HOL，但 TCP 字节流仍有序
  - 任何一个 IP packet 丢失 → 整条 TCP 连接 stall → 所有 streams 都等
  - 弱网（3% 丢包）下 HTTP/2 性能可能比 HTTP/1.1 拆 6 个连接还差
  - **结论**：HTTP/2 是过渡协议；终点是 HTTP/3 over QUIC
- **典型陷阱**：
  - 仍在配置 Server Push → 浪费时间，2026 已是反模式
  - 误以为 HPACK 压缩省的是 body → 不是，省的是 header
  - 在弱网 / 跨国连接（高 RTT 高丢包）默认开 HTTP/2 → 反而慢
  - HPACK 动态表大小没设上限 → 攻击面（HEADERs 滥用 / CRIME-like 攻击）
- **关键代码示例方向**：
  - 用 nghttp / Wireshark 看 HPACK 压缩前后的 header 体积
  - 一个真实丢包模拟（Linux tc / Chrome DevTools throttling）下的 HTTP/2 vs 1.1 对照
  - 历史代码片段：H2 server push 配置（marked as deprecated）
- **写作要点**：本章是 **"HTTP/2 不是终点"** 的论证章。**必须**给"Server Push 实测伤性能"的具体数据来源。链回 P4 讲 HTTP/3 怎么解决这些问题。

---

### P4 · QUIC + HTTP/3 协议层（2 章 ⭐ 最难）

#### 4.1 QUIC 在 UDP 上重建传输层：streams / 0-RTT / 连接迁移 / TLS 1.3 集成

- **核心问题**：QUIC 是怎么在 UDP 上重建一个完整传输层的？streams 怎么独立？0-RTT 是不是不安全？连接迁移到底怎么不断连？为什么 TLS 1.3 必须内嵌进 QUIC 握手？
- **QUIC 的 5 个核心创新（RFC 9000）**：
  1. **每条 stream 独立的丢包恢复**：QUIC 在 UDP datagram 上自己实现"可靠 + 有序"，但每个 stream 的有序保证是独立的 → 一条 stream 丢包不影响别的
  2. **TLS 1.3 内嵌（RFC 9001）**：握手 = TLS 1.3 + QUIC transport 参数交换合并成 1 个 RTT；HTTP/2 上是 TCP 握手 (1 RTT) + TLS 握手 (1-2 RTT)
  3. **0-RTT**：第二次连接同一 server 时，client 用上次的 PSK 直接发 application data → 0 RTT 启动
  4. **连接 ID 解耦于 4-tuple**：QUIC 用独立的 Connection ID 标识连接；切 wifi / 4G / 漫游 → IP 变了连接照旧（连接迁移）
  5. **用户态可演化**：拥塞控制算法、流控、丢包恢复全在用户态 → 浏览器 / CDN 升级即可换算法（vs TCP 在内核）
- **QUIC 帧（在 UDP datagram 内）**：
  - STREAM / CRYPTO / ACK / PADDING / PING / RESET_STREAM / STOP_SENDING / MAX_DATA / MAX_STREAM_DATA / NEW_CONNECTION_ID / RETIRE_CONNECTION_ID / PATH_CHALLENGE / PATH_RESPONSE / NEW_TOKEN / 等几十种
  - 一个 UDP datagram 可以塞多个帧（甚至跨 stream）
- **0-RTT 的安全权衡**：
  - 0-RTT 数据没有 forward secrecy（用上次握手的 PSK 加密）
  - 0-RTT 数据可以被回放（replay attack）→ 只能用于幂等请求（GET）
  - **HTTP/3 over QUIC 的工程姿势**：浏览器 / CDN 默认只对 GET 启用 0-RTT，POST 走 1-RTT
- **连接迁移的工程现实**：
  - 理论上：手机切 wifi → 4G，QUIC 连接 ID 不变，连接照旧
  - 实际上：很多 NAT / firewall / load balancer 仍按 4-tuple 分流 → 切网络仍可能导致包打到错的后端 / 直接被 drop
  - **2026 真实情况**：Cloudflare / Google 后端做了 LB 端的连接 ID-aware 路由；自建 LB 大多还没做
- **TLS 1.3 与 QUIC 的边界（RFC 9001）**：
  - TLS 1.3 record layer **不在** QUIC 里 —— TLS 只贡献握手 + 密钥派生
  - 数据加密直接由 QUIC 的 packet protection 完成（AEAD，密钥来自 TLS）
  - **不能用 TLS 1.2** —— QUIC 对加密元素的 API 要求只有 TLS 1.3 提供
- **typical 陷阱**：
  - 部署 HTTP/3 但忘了 UDP 中间路径会丢 / 限速 → fallback 到 HTTP/2 频繁
  - 自建 LB 不识别 QUIC connection ID → 连接迁移失败
  - 0-RTT 用在 POST → 重放风险（CSRF-like）
  - 仅在 origin 开 HTTP/3，CDN 没开 → 客户端实际仍走 HTTP/2
- **关键代码示例方向**：
  - 用 curl --http3（quiche / ngtcp2 build）看一个 HTTP/3 请求
  - Wireshark 抓 QUIC（需要 SSLKEYLOGFILE 解密）
  - 一个连接迁移真实演示：手机切 wifi 视频不卡断
- **写作要点**：本章是**整个主题最难的两章之一**；**必须**讲清"QUIC ≠ UDP" —— QUIC 是在 UDP 上重新实现了一个完整传输层。链回 P3.2（HTTP/2 的 TCP HOL 限制是 QUIC 必要性的根）。

#### 4.2 HTTP/3 over QUIC + QPACK + 拥塞控制（BBR / Cubic）

- **核心问题**：HTTP/3 比 HTTP/2 少了什么？QPACK 怎么解决 HPACK 的乱序问题？拥塞控制（BBR / Cubic）在 QUIC 上为什么是大事？
- **HTTP/3 帧（RFC 9114）**：
  - **HTTP/3 frame 类型大幅简化**：DATA / HEADERS / CANCEL_PUSH / SETTINGS / PUSH_PROMISE / GOAWAY / MAX_PUSH_ID
  - **不再有 STREAM / WINDOW_UPDATE / PING / RST_STREAM** —— streams 和这些机制全部由 QUIC 提供
  - **简化哲学**：HTTP/3 只管"消息怎么放进 stream"，不管"stream 怎么实现"
- **QPACK（RFC 9204）**：
  - 静态表 99 项（比 HPACK 的 61 项扩展）
  - 动态表更新走专门的 **encoder stream**（unidirectional）
  - 解码走专门的 **decoder stream**（unidirectional）
  - 关键：动态表 reference 可以"等" —— 解码器看到一个未知索引，可以暂存这条 header block 直到 encoder stream 上对应更新到达
  - **代价**：实现复杂度 ↑；需要小心管理 encoder/decoder 状态
- **HTTP/3 的优先级（RFC 9218）**：
  - HTTP/2 的 prioritization tree 设计被工程现实证明失败
  - RFC 9218 给一个简单方案：`Priority: u=3, i` 头（urgency 0-7 + incremental flag）
  - HTTP/3 实现这个新方案；HTTP/2 也补充支持
  - **2026 浏览器现状**：Chrome / Firefox / Safari 都已实现 fetchpriority API → Priority 头映射
- **拥塞控制：为什么 QUIC 改算法的能力很重要**：
  - **TCP 时代**：cubic（Linux 默认 2006-至今）/ BBR（Google 2016）→ 改算法要内核升级
  - **QUIC 时代**：拥塞控制在用户态（RFC 9002）→ 浏览器 / CDN 想换 BBRv2 / BBRv3 / 自家算法只需 release 新版本
  - **BBR 的核心思想**：测量带宽 + RTT，不用丢包作为拥塞信号（cubic 的根本假设）
  - **BBRv2 (2019) / BBRv3 (2023)**：解决 BBRv1 在共享链路上对 cubic 不公平的问题
  - **2026 状态**：Google / Cloudflare 已大量部署 BBRv3；自建服务多用 cubic 默认
- **HTTP/3 浏览器到 origin 的真实路径**：
  - 浏览器 → CDN：HTTP/3 over QUIC（2026 普及率高）
  - CDN → origin：通常 HTTP/2 over TCP（经典 keep-alive 复用即可，没必要 QUIC）
  - **结论**：HTTP/3 主要解决"最后一公里（浏览器 ↔ CDN）"，不是端到端
- **典型陷阱**：
  - 误以为 HTTP/3 处处都比 HTTP/2 快 → 在低延迟、低丢包的内网/数据中心场景，HTTP/2 over TCP 仍可能更快
  - QPACK 配置错误 → header 处理 stall（encoder stream 阻塞）
  - 部署 HTTP/3 没监控 fallback 率 → 网络限制 UDP 时大量降级 HTTP/2 但运维不知道
  - 用 BBR 但不监控其他流量 → BBR 可能"挤"cubic 流（公平性问题）
- **关键代码示例方向**：
  - Cloudflare / Fastly 的 HTTP/3 启用 + Alt-Svc 头配置
  - 用 quiche / ngtcp2 库跑自定义 QUIC server
  - Linux `ss -ti` 看 TCP cubic vs BBR 的拥塞窗口曲线对照（QUIC 类比）
- **写作要点**：本章和 4.1 一起是 P4 双子章；**必须**给 QPACK encoder/decoder stream 状态机 SVG。强调"HTTP/3 是减法 + QUIC 是加法"。链回 P3.2（HPACK 缺陷）。

---

### P5 · 资源加载工程（2 章）

#### 5.1 资源提示家族 + HTTP/2 优先级 + fetchpriority + RFC 9218

- **核心问题**：preload / preconnect / prefetch / modulepreload / dns-prefetch 这一堆"提示"到底有什么差别？fetchpriority 是 2024 起新加的，它和 HTTP priority signaling（RFC 9218）什么关系？怎么把它们组合起来用？
- **资源提示家族（按"激进程度"排序）**：
  - **`<link rel="dns-prefetch">`**：只做 DNS 解析，不建连；最便宜，几乎免费
  - **`<link rel="preconnect">`**：DNS + TCP 握手 + TLS 握手（不发请求）；适合提前打开第三方 origin 的连接（Google Fonts / 分析）
  - **`<link rel="prefetch">`**：低优先级下载资源到 cache，下次导航用；浏览器实现差异大（Chrome 实现质量最高）
  - **`<link rel="preload">`**：高优先级强制立刻下载；必须指定 `as="..."`；最容易被滥用
  - **`<link rel="modulepreload">`**：preload 的 JS module 专用变种；浏览器会顺带解析依赖图
  - **`<link rel="prerender"> / Speculation Rules API`**：预渲染整个页面（2024 起 Speculation Rules 替代）
- **fetchpriority API（HTML 标准 2023）**：
  - `<img fetchpriority="high">` / `<link fetchpriority="low">` / `fetch(url, { priority: 'high' })`
  - 浏览器把它转成 RFC 9218 的 `Priority` 头发给服务器
  - **重要场景**：LCP 图片（首屏关键 hero image）→ `fetchpriority="high"`，浏览器知道要优先下
- **RFC 9218 priority signaling**：
  - HTTP header `Priority: u=3, i`：urgency 0（最高）-7（最低）+ incremental（是否可增量利用，比如 progressive image）
  - 浏览器自动设置：CSS = u=2, JS = u=3, image = u=4-5
  - 服务器可以用这个信号决定多路复用时谁先发
  - **2026 实现状态**：Chromium 系完整支持；Firefox / Safari 部分支持；CDN（Cloudflare / Akamai）已支持转发
- **资源加载与 HTTP/2 / HTTP/3 的真实交互**：
  - HTTP/2：所有资源在一个连接里多路复用 → priority 信号决定谁先发
  - HTTP/3：每条 stream 独立 → priority 仍重要（CDN 决定服务顺序）
  - HTTP/1.1：浏览器开 6 个连接，自己排队 → priority 只能在客户端层
- **典型陷阱**：
  - preload 滥用：所有资源 preload → 浏览器不能合理排序，反而拖慢 LCP
  - preload 没指定 `as` → 浏览器 fetch 两次（preload 不知类型 + 实际请求）
  - prefetch 跨 origin 没考虑 cookie → 浏览器策略各异，可能完全无效
  - dns-prefetch 写了但 preconnect 没写 → 大部分时间被节省，但 TLS 握手仍要等
  - fetchpriority 误用：标 high 的资源太多 → 等于没标
- **关键代码示例方向**：
  - 一个 LCP 优化案例：hero image 加 `fetchpriority="high"` + preload + preconnect 第三方 CDN
  - 一个 prefetch 案例：路由 hover 时 prefetch 下一页 chunk
  - Speculation Rules API：高置信度 prerender + 中置信度 prefetch
- **写作要点**：本章是**前端性能优化的 RFC 视角**；用一张"激进度阶梯"SVG。**强调** fetchpriority 是 2024 起新加的"杀器"，和 LCP 强相关。链回 browser-rendering 主题（CRP / Web Vitals）。

#### 5.2 Server Push 之死 + 103 Early Hints + 现代替代方案

- **核心问题**：Server Push 为什么死了？103 Early Hints 是怎么"接班"的？在 Cloudflare / Vercel 用 Early Hints 实测增益是多少？
- **Server Push 之死（重写自 P3.2）**：
  - 2015-2020 试用期：缓存协调失败 + 重复推送 + 浏览器实现 bug → 实测伤性能
  - 2022 Chrome 移除 / RFC 9113 不再推荐 / 几乎所有 server 停用
  - **根本错误**：server 不知道 client 的 cache 状态，盲目 push 浪费带宽
- **103 Early Hints（RFC 8297）**：
  - **原理**：服务器在还没准备好最终 200 响应前，先发一个 103 状态码 + 一些 `Link: ...; rel=preload` 头
  - **浏览器响应**：立刻开始 preload 这些资源（DNS / TCP / TLS / 资源下载），不等最终响应
  - **关键差异 vs Server Push**：浏览器主动决定要不要下；如果 cache 已有就不下 → 不会浪费带宽
  - **关键差异 vs 普通 preload**：可以在 server 开始处理 backend / 数据库的同时已经把 preload 信号发出去了 → 节省 server 处理时间这一段
- **103 Early Hints 工程实战**：
  - **Cloudflare 实测（2022 数据）**：LCP 减少 20-30%（在 backend 慢的场景下）
  - **Vercel / Next.js 16 集成**：Server Component 渲染时可以发 Early Hints 头
  - **Express / Fastify 等支持**：node 18+ `response.writeEarlyHints`
  - **HTTP/2 / HTTP/3 都支持**；HTTP/1.1 在 cli proxies 上有兼容性问题
- **现代替代 Server Push 的完整方案**：
  - **首屏关键资源** → `<link rel="preload">` 内联在 HTML head + `fetchpriority="high"`
  - **backend 慢** → 103 Early Hints 在 backend 处理前发出 preload 信号
  - **路由切换预热** → Speculation Rules API（prerender / prefetch）
  - **第三方域名提前连** → `<link rel="preconnect">`
  - **不再用 Server Push**
- **CDN / Edge 上的 103 Early Hints**：
  - Cloudflare：自动从 HTML 头提取 `<link rel="preload">` 转成 103
  - Vercel：通过 `Link` header API 显式发送
  - Fastly：VCL 配置发 103
  - **典型工程姿势**：origin 慢 → CDN 缓存 103 头 → 命中时立刻发 103 + 同时回源拿正文
- **典型陷阱**：
  - 仍在配置 Server Push → 浪费时间
  - Early Hints 在 HTTP/1.1 上有 proxy 兼容问题（某些老代理直接吞 1xx 响应）
  - Early Hints 头资源跟最终响应的 preload 头不一致 → 浏览器可能下重复
  - 把 Early Hints 当成"魔法加速" → backend 快的场景下增益极小（甚至为负，因为多发一个响应）
- **关键代码示例方向**：
  - Node.js Express 跑 Early Hints + curl `-v` 看 wire
  - Next.js 16 Server Component + Early Hints（如果稳定 API 已有）
  - Cloudflare Workers 配置 Early Hints
  - HTTP/1.1 经过老 proxy 的 fallback 处理
- **写作要点**：本章核心是"Server Push 死了，Early Hints 是成功的接班"。**必须**给 Cloudflare / Vercel 实测数据。链回 P3.2（Server Push 死因复盘）。

---

### P6 · 流式 + 实时通信（2 章）

#### 6.1 单向流：fetch streams / chunked / SSE / 与 RSC / TanStack streamedQuery / AI SDK 协作

- **核心问题**：浏览器里"server 一直推数据"的协议层有 fetch streams、chunked、SSE 几条路；RSC 流式渲染、TanStack Query streamedQuery、Vercel AI SDK 的流式响应底下走的是哪条？为什么不用 WebSocket？
- **单向流的协议层 3 个层次**：
  - **HTTP/1.1 chunked transfer encoding**：基础；body 分块发，每块带 size header；客户端在 ReadableStream 上消费
  - **fetch + ReadableStream（Streams API）**：浏览器侧消费 chunked / HTTP/2 DATA / HTTP/3 DATA 流的统一抽象
  - **Server-Sent Events（SSE，EventSource API）**：在 chunked 之上加一层"text/event-stream"格式约定（`data: ...\n\n`）+ 自动重连 + last-event-id 续传
- **SSE 的设计哲学**：
  - **基于 HTTP**：不用单独 WebSocket 握手；通过 CDN / proxy / firewall 都没问题
  - **单向（server → client）**：客户端要发只能开新请求
  - **格式简单**：纯文本 + 字段约定；调试方便
  - **自动重连**：`EventSource` 内置 retry 逻辑 + Last-Event-ID 续传
- **何时用 SSE / 何时用 fetch + ReadableStream**：
  - **SSE**：想要"自动重连 + Last-Event-ID 续传 + 默认 cross-origin EventSource"开箱
  - **fetch + ReadableStream**：想要更灵活（自定义 parsing / 二进制 / 不需要重连逻辑）；2024 起 RSC / AI SDK 都走这条
  - **2026 现状**：新项目流式响应几乎全用 fetch + ReadableStream + 自定义协议（NDJSON / Vercel AI SDK Data Stream Protocol）；SSE 主要在监控 / 通知场景
- **RSC payload 流式（链回 react/06-modern + next/03-rsc-streaming）**：
  - 协议层：HTTP/1.1 chunked or HTTP/2/3 DATA 帧
  - 应用层：React Flight serialization format（每行一个 `0:[...]\n` JSON 块）
  - 工程意义：浏览器在收完整页面前已开始渲染部分组件 → 改善 TTFB / FCP
- **TanStack Query streamedQuery（链回 tanstack-query/04-advanced-patterns/02）**：
  - 协议层：fetch + ReadableStream
  - 应用层：边收边累加进 cache + 触发组件重渲
  - 与 RSC 异同：streamedQuery 是 client side；RSC 是 server side
- **Vercel AI SDK Data Stream Protocol（链回待写 AI SDK 主题）**：
  - 协议层：fetch + ReadableStream（不是 SSE）
  - 应用层：自定义 NDJSON-like 格式，每行 `<type>:<value>\n`，支持 text-delta / tool-call / annotation 等
  - 工程意义：与 useChat / useCompletion hooks 配合
- **HTTP/2 / HTTP/3 上的流式与 1.1 的差别**：
  - HTTP/2：流式数据走 DATA 帧 multiplexed；不阻塞别的 stream
  - HTTP/3：每条 stream 独立丢包恢复 → 流式响应在丢包下表现最好
  - HTTP/1.1：流式独占连接（不能并发）→ 老浏览器 6 connection limit 是真实约束
- **典型陷阱**：
  - 流式响应被 nginx / CDN buffering 吞掉 → 客户端"等很久才一次性收到全部"
  - SSE 跨 origin 没正确处理 CORS preflight
  - HTTP/1.1 上多个 SSE 在同一 origin → 6 connection limit 满；HTTP/2/3 没这问题
  - 用 SSE 但实际数据是二进制 → 不可行（SSE 只支持 UTF-8 文本）
  - fetch streams 在某些 Service Worker 场景下被 buffer
- **关键代码示例方向**：
  - 一个 chunked 流式 + ReadableStream 解析（NDJSON）的完整 demo
  - 一个 SSE 服务端（Express / Hono）+ 客户端 EventSource + 重连演示
  - RSC payload wire 真实抓包（curl 看 chunked + flight 格式）
  - Vercel AI SDK 流式聊天的协议层抓包对照
- **写作要点**：本章是协议层 + 工程层的交叉点；**必须**给"chunked / fetch streams / SSE / RSC payload / AI SDK 各自对应协议层"对照表。链回 react / next / tanstack-query / 待写 AI SDK 主题。

#### 6.2 双向通信：WebSocket / WebTransport / WebRTC 数据通道横评

- **核心问题**：要双向、要低延迟、要二进制 —— WebSocket / WebTransport / WebRTC DataChannel 这三条路怎么选？WebTransport 真的会替代 WebSocket 吗？
- **WebSocket（RFC 6455，2011）**：
  - **协议层**：HTTP/1.1 Upgrade 握手 → 切换到 WebSocket 帧协议
  - **HTTP/2（RFC 8441）**：基本无人实现；浏览器、服务端支持都很差
  - **HTTP/3（RFC 9220）**：2022 标准化，2026 仍很少落地
  - **实质**：WebSocket 在 2026 仍是"HTTP/1.1 升级 + 自己的二进制 / 文本帧"
  - **优点**：成熟 / 库丰富 / 跨浏览器无差别 / proxy 兼容性好
  - **缺点**：HTTP/1.1 上一个连接一条 stream（不能多路复用）；TCP HOL blocking 仍在
- **WebTransport over HTTP/3（W3C draft / IETF draft）**：
  - **协议层**：HTTP/3 上的扩展；同一 QUIC 连接里跑多个 stream + datagram
  - **API**：`new WebTransport(url)` → `.createBidirectionalStream()` / `.createUnidirectionalStream()` / `.datagrams.writable`
  - **优点**：QUIC 的所有好处（多路复用 / 0-RTT / 连接迁移 / 用户态拥塞）
  - **缺点（2026）**：仅 Chromium 实现；Firefox 实验；Safari 完全不支持；服务端实现稀少
  - **典型场景**：低延迟游戏 / WebRTC 信令替代 / 大规模流式
- **WebRTC DataChannel**：
  - **协议层**：DTLS over UDP，不经过 HTTP server
  - **API**：通过 `RTCPeerConnection.createDataChannel`
  - **优点**：P2P 直连（NAT 穿透成功后）/ 极低延迟 / 二进制原生
  - **缺点**：需要信令服务器 + ICE + TURN（中转）；NAT 穿透失败率不可忽略
  - **典型场景**：视频会议、实时协作 编辑（cursor 同步）、游戏
- **三者横评**：

| 维度 | WebSocket | WebTransport | WebRTC DataChannel |
|---|---|---|---|
| 浏览器支持（2026） | 全 ✅ | Chromium ✅ / 其他 ❌ | 全 ✅（API 复杂） |
| 协议层 | HTTP/1.1 升级 | HTTP/3 扩展 | DTLS/UDP，独立 |
| 多路复用 | 单 stream | 多 stream + datagram | 多 channel |
| 低延迟 | 中 | 高 | 最高（P2P） |
| 二进制 | ✅ | ✅ | ✅ |
| 服务端实现 | 极成熟 | 较少（msquic / aioquic） | TURN / SFU 复杂 |
| 适用场景 | 通用双向 | 游戏 / 大规模流 | 视频会议 / P2P |

- **2026 选型建议**：
  - **大部分双向场景** → 仍用 WebSocket（成熟 + 兼容性最好）
  - **明确知道用户在 Chromium + 需要低延迟多 stream** → WebTransport
  - **P2P / 视频会议 / 实时协作** → WebRTC DataChannel
- **典型陷阱**：
  - 用 WebSocket 实现"server 推 client"（单向）→ 完全过度，SSE 就够
  - WebSocket 通过老 proxy 失败（某些 corporate proxy 吞 Upgrade header）
  - WebTransport 没 fallback → 非 Chromium 用户全挂
  - WebRTC 没 TURN 服务器 → NAT 穿透失败率 5-15%
- **关键代码示例方向**：
  - WebSocket 心跳 + reconnect 完整实现
  - WebTransport 双向 stream + datagram 双模 demo
  - WebRTC DataChannel 信令 + 文件传输示例
- **写作要点**：本章是"双向通信选型字典"；**必须**给清晰决策矩阵。**强调**"WebSocket 在 2026 仍是默认选择，WebTransport 还在等浏览器全支持"。

---

### P7 · 决策与陷阱（1 章）

#### 7.1 测量工具 + ALPN/TLS 1.3/HTTPS DNS/ECH + CDN/Edge + 选型决策树 + 陷阱清单

- **核心问题**：拿到一个项目，从「该不该开 HTTP/3」到「fetchpriority 怎么用」「Early Hints 在我的 CDN 上行不行」一条决策链是什么？怎么测自己的协议层是否最优？
- **测量工具（必须会用 3 件套）**：
  - **`curl --http3 -v`**：单请求看协议层（需要 quiche / ngtcp2 build curl）
  - **`nghttp` / `nghttpx`**：HTTP/2 调试瑞士军刀；可看帧序、HPACK、stream 状态
  - **Wireshark + SSLKEYLOGFILE**：抓 QUIC / HTTP/2 / TLS 1.3 完整 wire（必须导出 keys 才能解 QUIC）
  - **Chrome DevTools Network**：可视化协议层 / 资源优先级 / Early Hints；2024 起明确显示 H3 / H2 / H1
  - **Chrome `chrome://net-internals/#http2` & `#quic`**：底层连接信息
  - **CDN dashboard**：Cloudflare / Vercel / Fastly 都有 HTTP/3 命中率、QUIC fallback 率仪表
- **协议升级辅助：ALPN / Alt-Svc / HTTPS DNS RR / ECH**：
  - **ALPN（RFC 7301）**：TLS 握手时协商应用层协议（"h2" / "http/1.1" / "h3"）
  - **`Alt-Svc` 头**：server 通过 HTTP/2 响应告诉 client "你下次也可以用 h3 走 :443/UDP"
  - **HTTPS DNS RR（RFC 9460，2023）**：DNS 直接返回 ALPN + IP + ECH 配置 → 第一次连就能直接 HTTP/3，不用先 HTTP/2 收 Alt-Svc
  - **ECH（Encrypted Client Hello，draft）**：TLS 1.3 SNI 加密；2026 Cloudflare / Mozilla 正在推；浏览器实验阶段
- **CDN / Edge 部署对协议层的影响**：
  - **HTTP/3 启用**：Cloudflare / Vercel / Fastly 都已默认开（用户侧不用配）
  - **回源协议**：CDN 到 origin 默认 HTTP/2 over TLS；HTTP/3 回源仍稀少
  - **Anycast / Edge POP**：HTTP/3 在地理上对长 RTT 改善最大；本地短 RTT 可能没差
  - **Edge runtime（Vercel / Cloudflare Workers）**：可在 edge 直接发 Early Hints / Server Action 减少 origin 等待
- **选型决策树**：
  - **协议层升级**：
    - 用了主流 CDN（Cloudflare / Vercel / Fastly）→ HTTP/3 默认开，监控 fallback 率
    - 自建 / 老 CDN → 评估 LB / NAT / firewall 是否准备好 UDP；不准备好继续 HTTP/2
    - 内网 / 数据中心 → HTTP/2 over TLS 即可，HTTP/3 优势小
  - **资源加载**：
    - LCP 关键资源 → `fetchpriority="high"` + preload
    - 第三方 origin → preconnect + dns-prefetch
    - backend 慢 + CDN 支持 → 103 Early Hints
    - 路由切换预热 → Speculation Rules API
    - **不用 Server Push**
  - **流式响应**：
    - RSC / AI 应用 → fetch + ReadableStream（自定义协议）
    - 监控 / 通知 → SSE
    - 双向 / 高频 → WebSocket
    - P2P / 视频 → WebRTC
    - Chromium-only 低延迟多 stream → WebTransport
- **陷阱清单（一节一坑，每条配修复）**：
  1. 配 Server Push → 已废弃，删掉用 Early Hints
  2. preload 滥用 → 只 preload LCP 关键资源
  3. preload 没 `as` → 加 `as`
  4. fetchpriority 标 high 太多 → 抑制到 1-2 个
  5. SSE 被 nginx buffer → 配 `proxy_buffering off`
  6. HTTP/3 部署但没监控 fallback → 加 CDN dashboard
  7. 自建 LB 不识别 QUIC connection ID → 切换 LB 或用云 LB
  8. 0-RTT 用在 POST → 限制只对幂等
  9. cookie 太大 → 按需精简或迁 token
  10. WebSocket 通过老 proxy 失败 → fallback 到 SSE / long polling
  11. fetch streams 被 Service Worker buffer → 检查 SW 是否拦截
  12. HTTPS DNS RR 没配但 Alt-Svc 也没 → 第一次连接慢
- **2027 展望**：
  - HTTP/3 普及率到 80%+（CDN 端基本全开）
  - WebTransport 在 Firefox / Safari 落地（开始替代部分 WebSocket）
  - ECH 在更多浏览器默认开
  - Web Vitals 与协议层关联工具进一步成熟
  - QUIC 服务端实现进一步标准化（msquic / picoquic / aioquic / quiche 仍多元）
- **写作要点**：本章是**实战决策章**；给"看场景选什么 + 看症状改什么"的双向决策；最后给"我推荐 X，因为 Y"的强观点收尾。链回 react / next / tanstack-query / browser-rendering 主题。

---

## 写作风格 ——「写文章人，不是建筑师」

> （遵循已有约定）

- **章节内部**：6 段模板（速览 → 底层逻辑 → 应用场景 → 典型代码 → 常见陷阱 → 延伸阅读）
- **跨章引用**：用「短重述 + 链回」，不抄不省
- **图示**：HTTP 35 年时间线 / 三代协议抽象升级 / HTTP/2 帧格式 / HPACK 编码 / QUIC 包结构 / QPACK 双 stream / 0-RTT 握手 / 资源提示阶梯 / 流式协议对照表 / 决策树 全用 SVG
- **代码示例**：每章 5-10 段可运行的真实代码（curl / Wireshark 抓包指令 / Node.js demo）
- **加粗（克制）**：每章 ≤ 25 个 `<strong>`；每段不超过 1-2 个；不要靠加粗散点高亮"我觉得重要"的描述句
- **避免**：
  - RFC 复述（引章节号即可）
  - "架构师式"分类标签（X 派 / Y 流）
  - 中立到没观点（每章必须给"我推荐 X，因为 Y"）
  - 抄 web.dev / blog 文章（设计动机要回到 RFC + 头部厂商一手数据）
- **观点强度**：
  - 强观点（"Server Push 是失败实验，不要再配"，"2026 起 HTTP/3 是默认协议"）
  - 弱观点（"WebTransport 看浏览器支持再决定"）
  - 不观点（"WebSocket vs WebTransport 看场景"）

---

## 不写的内容（明确划线）

- **不讲**：
  - HTTP 应用层基础（headers / methods / status codes 全谱）—— 假设已掌握，引 MDN
  - HTTP 缓存语义（Cache-Control / ETag / Vary 等）—— 假设已掌握，引 RFC 9111
  - TLS 1.3 record layer / handshake state machine 详细 —— 引 RFC 8446 但不展开
  - TCP 内部（Reno / Cubic 排队论 / Nagle / TIME_WAIT）—— 引 RFC 9293 + Google BBR 论文，不展开
  - WebRTC 信令 / NAT / ICE / STUN / TURN 详细 —— P6.2 仅讲 DataChannel 选型
  - DNSSEC / DoT / DoH 全谱 —— P7.1 仅提 HTTPS DNS RR
  - HTTP/0.9 / HTTP/1.0 详细历史 —— P1.1 仅时间线点到
  - Service Worker / Cache API —— 链回 javascript 主题
  - gRPC 完整教程 —— P1.1 横评提一句
- **链回但不重复**：
  - fetch / ReadableStream → 链回 javascript 主题（网络与流）
  - RSC payload + 流式 → 链回 react / next 主题
  - TanStack Query streamedQuery → 链回 tanstack-query 主题（双向链）
  - Web Vitals / CRP → 链回 browser-rendering 主题
- **暂占位（待写主题）**：
  - Vercel AI SDK 流式 / Claude Agent SDK → 待 AI 主题（与本主题 P6.1 强相关，会双向链）

---

## 路线图

- **Step 1**：本 outline.md 经用户审定 ← **当前**
- **Step 2**：建 8 个文件骨架（`http/index.html` + 7 个 phase 目录的 `index.html`）
- **Step 3**：P1 章节正文（35 年史 + 设计哲学，2 章）
- **Step 4**：P2 章节正文（HTTP/1.1 基线，1 章）
- **Step 5**：P3 章节正文（HTTP/2 帧 + HPACK + Server Push，2 章）
- **Step 6**：P4 章节正文（QUIC + HTTP/3 + QPACK + 拥塞控制，2 章 ⭐ 最难）
- **Step 7**：P5 章节正文（资源提示 + Early Hints，2 章）
- **Step 8**：P6 章节正文（流式 + 双向通信，2 章）
- **Step 9**：P7 章节正文（决策树 + 陷阱清单，1 章）+ 站点首页卡片改 done

---

## 与 index.html 卡片的对应

HTTP 主题在站点首页的卡片描述（草拟，落定后会替换 index.html 中"⏳ 规划中"的 placeholder）：
> 7 阶段 / 12 章：HTTP 35 年项目史 + 三代抽象升级（消息 → 帧 → 流 → 用户态传输层）+ HTTP/1.1 基线天花板 + HTTP/2 二进制帧 / HPACK / Server Push 兴衰 + QUIC 在 UDP 上重建传输层（streams / 0-RTT / 连接迁移 / TLS 1.3 集成）+ HTTP/3 + QPACK + 拥塞控制（BBR / Cubic）+ 资源提示家族 + 103 Early Hints + 流式 / SSE / WebSocket / WebTransport / WebRTC 横评 + CDN/Edge 部署 + 选型决策树。锁定 RFC 9000-9114 + RFC 9204/9218。

按 ecosystem 主题约定（见 README 设计原则 + memory `convention_weight_center_crossref`）：
- **center of gravity**：⑦ 数据 & 网络
- **不创建 crossref 卡片**：tanstack-query / next / react / browser-rendering 卡片描述里如需提"也覆盖协议层场景"，在描述文字内自然提及，不开独立卡片
- **横向对照（HTTP/1.1 / WebSocket / WebTransport / WebRTC / SSE / gRPC）**：在 P1 / P6 / P7 章内部完成，不开独立主题
