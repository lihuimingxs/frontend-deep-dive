# pnpm & monorepo 深度学习 · 章节大纲

> 本文件是 pnpm & monorepo 主题的写作蓝本。**7 阶段 · 12 章**：从 npm 30 年史 + 同代人横评（P1）→ node_modules 真相 + 幻影依赖（P2）→ pnpm 内部 CAS + 严格 peer（P3）→ Workspace 协议四家对比（P4）→ Turborepo / Nx 任务编排（P5）→ Changesets 版本发布（P6）→ 选型决策树 + 下一代（P7）。
> 编写日期：2026-05-06（首版）｜目标版本：pnpm 10 / npm 11 / Yarn 4 / Bun 1.2 / Turborepo 2 / Nx 20 / Changesets 2。

---

## 元信息

- **目标版本**：
  - **pnpm 10**（2025 主线，含 catalog、`packageManager` 字段强制、新 lockfile 格式）
  - **npm 11**（Node 22 LTS 自带；workspaces 稳定、provenance 默认）
  - **Yarn 4**（Berry 主线；PnP 默认 + workspace tools）
  - **Bun 1.2+**（含 catalog；`bun install` 与 `bun pm`）
  - **Turborepo 2**（Vercel 接管后大改；Rust 重写 + filter UI）
  - **Nx 20+**（含 plugin 生态 + Nx Cloud）
  - **Changesets 2.x**（`@changesets/cli`，含 prerelease + snapshot mode）
  - 历史回溯：npm 1（2010）→ npm 3 扁平化（2015）→ Yarn classic（2016）→ pnpm 早期（2017）→ Yarn Berry / PnP（2019）→ Lerna 退场（2022）→ Turborepo / Nx Cloud / Bun install（2022-2024）→ Catalog 标准化（2025）
- **来源**：
  - [pnpm.io](https://pnpm.io/)（pnpm 官方文档，权威一手）
  - [yarnpkg.com](https://yarnpkg.com/)（Yarn Berry）
  - [docs.npmjs.com](https://docs.npmjs.com/)（npm 官方）
  - [bun.com/docs/install](https://bun.com/docs/install)（Bun install / workspace）
  - [turbo.build/repo/docs](https://turbo.build/repo/docs)（Turborepo）
  - [nx.dev](https://nx.dev/)（Nx）
  - [github.com/changesets/changesets](https://github.com/changesets/changesets)（Changesets）
  - [rushstack.io](https://rushstack.io/)（Microsoft Rush，超大规模参考）
  - [bazel.build](https://bazel.build/)（Bazel，超大规模参考）
  - [jsr.io](https://jsr.io/)（Deno 主导的下一代 registry）
  - Zoltan Kochan（pnpm 作者）blog + GitHub discussions
  - Maël Nison（Yarn Berry maintainer）blog
  - Jared Palmer（Turborepo 创始人）演讲
  - Isaac Z. Schlueter（npm 创始人）早期 blog 文章 + npm v3 设计 RFC
- **目标读者**：写过中型前端 / 全栈项目的工程师；用过 npm/yarn 但没系统读过 lockfile；知道"pnpm 比 npm 省磁盘"但说不清原因；做过单 repo 项目，准备拆 monorepo 但不知道选 Turborepo 还是 Nx。
- **不是这个主题的读者**：还没用过 npm 的人（先学包管理基础再来）；只想抄一份 `pnpm-workspace.yaml` 配置（这里讲原理而非配方）。

---

## 整体设计：7 阶段 · 沿"包管理 + 多包协作"演化展开

包管理的核心问题：**如何让 1 个项目（甚至 N 个项目）正确、快速、确定性地拿到全部依赖，并能彼此协作**。这个问题 15 年来从 "npm install 嵌套地狱" 进化到 "pnpm CAS + workspace catalog + Turborepo remote cache"。我们按这条主线展开 7 阶段。

| 阶段 | 章数 | 核心问题 |
|---|---|---|
| **P1 · 包管理器是谁** | 2 | npm 30 年史 + 同代人横评（npm/Yarn classic/Yarn berry/pnpm/Bun install/Deno+JSR） |
| **P2 · node_modules 真相** | 2 | Node module resolution 算法 + 4 种 layout（嵌套/扁平/symlink/PnP）；幻影依赖 + doppelganger 问题 |
| **P3 · pnpm 内部** | 2 | 内容寻址存储 (CAS) + hardlink/symlink 拓扑；pnpm-lock.yaml + 严格 peer + `.pnpmfile.cjs` hooks |
| **P4 · Workspace 协议** | 2 | 四家 workspace 对比（npm/Yarn/pnpm/Bun）+ `workspace:*` + catalog；`--filter` / topological / 内部联调 |
| **P5 · 任务编排** | 2 | Turborepo task graph + remote cache；Nx 项目图 + affected + plugin |
| **P6 · 版本与发布** | 1 | Changesets 工作流 + 独立 vs 固定版本 + npm provenance + workspace publish |
| **P7 · 选型与下一代** | 1 | 决策树（小/中/大/超大规模）+ JSR / catalog 标准化 / Bazel/Rush 超大规模 / 未来 |

总计 **12 章 ≈ 75,000-85,000 字**，平均每章 6,500 字。**比重偏向 P2-P5**（resolution 真相 + pnpm 内部 + workspace + 编排），P1 / P6 / P7 写得紧凑。

---

## 与既有主题的边界 ——「短重述 + 链回」原则

本主题与 Bun / Vite / Node 主题有交集，必须明确划界，不重复早期论述：

> ✅ **短重述**：1-3 句话点出"它在底层是什么 + 关键性质"
> ✅ **链回**：紧跟一句"详细的 X / Y / Z 请参考 [`主题/{phase}/{chapter}`]"
> ❌ **不要**直接抄一遍其他主题的论述

**关键边界**：

| 概念 | 在哪讲透 | 本主题里怎么处理 |
|---|---|---|
| Bun install 二进制 lockfile + 速度 | `bun/04-toolchain/01-bun-install.html` | 短重述 + 链回，P1.2 同代人 + P3.1 CAS 对比 + P4.1 workspace 横评时点出 |
| Bun catalog 与 workspace | `bun/04-toolchain/01-bun-install.html` | 链回，P4.1 catalog 章节短重述 |
| Node module resolution 算法（CJS） | `node/03-modules/` | 短重述，P2.1 把 Node 的算法作为基础再展开 monorepo 视角 |
| Node ESM resolution + import attributes | `ecma/07-execution/04-modules-tla.html` 与 `node/03-modules/` | 链回，P2.1 区分 ESM/CJS 两种 resolution 时点出 |
| Vite dev server 如何利用 workspace | `vite/02-vite-architecture/01-dev-mode.html` | 链回，P4.2 讲内部包联调时点出 |
| 双 package hazard / interop | `vite/03-esm-cjs/02-interop.html` | 链回，P2.2 讲 phantom dependency 与 dual package 边界时点 |
| ECMA 模块语义（spec 层） | `ecma/07-execution/04-modules-tla.html` | 链回，P2.1 提及 import map / package exports 时点 |
| TypeScript path mapping vs workspace | `typescript/05-engineering/` | 链回，P4.2 讲 monorepo 内部类型解析时点出，本主题不讲 TS 语义 |
| Next.js / React Server Components 的 monorepo 模式 | 待写 Next.js 主题 | 链回（暂占位），P5.1 讲 Turborepo 典型应用时点 |
| 测试工具（Vitest / Jest）的 workspace 模式 | 待写测试工具主题 | 链回（暂占位），P5.1 讲 task graph 中的 test 节点时点 |

---

## 内容覆盖原则 ——「pnpm.io 是骨架，但要读 RFC」

包管理这个领域的特点：**每家官方文档都偏配置说明书，关键设计决策在 RFC / GitHub discussions / 作者演讲里**。

**4 条规则**：

1. **API / 配置定义优先官方文档**：表面 API 以 pnpm.io / yarnpkg.com / docs.npmjs.com / turbo.build/repo/docs 为准。
2. **设计决策以 RFC + 讨论为准**：例如 pnpm 严格 peer 模式、Yarn PnP、catalog 协议都有公开 RFC；写"为什么这么设计"必须引 RFC，不能臆测。
3. **历史以原始公告为准**：Yarn classic 2016 公告、npm v3 扁平化 RFC、pnpm 1.0 announcement、Lerna 项目交接给 Nx 的公告——这些是历史叙事的源头。
4. **性能数字必标条件**：包管理器宣传的"X 比 Y 快 N 倍"需要复现条件（项目规模、cache 状态、网络条件）；引用时必带 source + 复现说明，否则不写。

---

## 节奏建议

- **连读组**：
  - P1.1 + P1.2（项目史 → 同代人，理解今天的格局必须知道怎么演化来的）
  - P2.1 + P2.2（resolution 算法 → 幻影依赖，前者是机制后者是后果）
  - P3.1 + P3.2（CAS 存储 → lockfile + peer，pnpm 的两条腿）
  - P4.1 + P4.2（workspace 协议 → filter/topo 操作，理论 → 操作）
  - P5.1 + P5.2（Turborepo → Nx，连读才能横评）
- **可独立跳读**：
  - 已用 pnpm 的工程师：P3.2 + P4.1 + P4.2，看严格 peer + workspace 协议
  - 准备拆 monorepo 的：P4.1 + P5.1 + P5.2 + P7.1
  - 想知道为什么 npm install 这么慢/丑：P1.1 + P2.1 + P2.2
  - 准备发布 npm 包：P6.1 单读
- **建议阅读路径**：
  - 第一次系统学：P1 → P2 → P3 → P4 → P5 → P6 → P7 顺序
  - 已用 pnpm 想换 Bun：P1.2 + P3.1 + 链回 Bun 主题
  - 在做 monorepo 选型：P4.1 + P5.1 + P5.2 + P7.1

---

## 文件结构

```
pnpm-monorepo/
  index.html                            (主题入口卡片)
  outline.md                            (本文件)
  01-overview/                          (P1 · 包管理器是谁 · 2 章)
    01-history.html                     ← npm 30 年史：嵌套 → 扁平 → Yarn → PnP → pnpm → Bun → JSR
    02-landscape.html                   ← 同代人横评（npm/Yarn classic/Yarn berry/pnpm/Bun install/Deno+JSR），多维对比
  02-node-modules/                      (P2 · node_modules 真相 · 2 章)
    01-resolution.html                  ← Node module resolution 算法（CJS + ESM 两套）+ 4 种 layout（嵌套/扁平/symlink/PnP）
    02-phantom-deps.html                ← 幻影依赖 + doppelganger + 双 package hazard + 扁平化的代价
  03-pnpm-internals/                    (P3 · pnpm 内部 · 2 章)
    01-cas-storage.html                 ← 内容寻址存储 + hardlink/symlink 拓扑 + global store 维护 + 节省磁盘原理
    02-lockfile-peers-hooks.html        ← pnpm-lock.yaml 结构 + 严格 peer 解析 + `.pnpmfile.cjs` hooks + side-effects-cache
  04-workspaces/                        (P4 · Workspace 协议 · 2 章)
    01-workspace-protocol.html          ← 四家 workspace（npm/Yarn/pnpm/Bun）对比 + `workspace:*` 协议 + catalog 协议
    02-filter-topological.html          ← `--filter` / topological run / 内部包联调（hot reload）/ 部分构建
  05-orchestration/                     (P5 · 任务编排 · 2 章)
    01-turborepo.html                   ← Turborepo task graph + input/output hash + remote cache + Vercel 整合
    02-nx.html                          ← Nx 项目图 + affected + plugin 生态 + Nx Cloud + 与 Turborepo 横评
  06-versioning-publishing/             (P6 · 版本与发布 · 1 章)
    01-changesets-publish.html          ← Changesets 工作流 + 独立 vs 固定版本 + provenance + workspace publish + 私有 registry
  07-future/                            (P7 · 选型与下一代 · 1 章)
    01-decision-tree.html               ← 决策树（小/中/大/超大规模）+ JSR / catalog 标准化 / Bazel/Rush 超大规模 / 未来展望
```

---

## 各章详细大纲

### P1 · 包管理器是谁（2 章）

#### 1.1 npm 30 年史

- **2010 npm 1 诞生**：Isaac Z. Schlueter 在 Node.js 早期的设计；当时为什么是嵌套 `node_modules`（每个包独立解析自己的依赖，简单可靠但磁盘灾难）。
- **2015 npm 3 扁平化（hoisting）**：把传递依赖提到顶层，解决磁盘占用 + Windows 路径长度问题，但带来"幻影依赖"（详见 P2.2）。
- **2016 Yarn classic**：Facebook 出品；核心是 lockfile + 并行下载 + 离线 cache，npm 5 反向跟进 `package-lock.json`。
- **2017 pnpm 横空出世**：Zoltan Kochan 主张"扁平化是错的"，用 CAS + symlink 解决磁盘 + 严格性两个问题。
- **2019 Yarn Berry / PnP**：Maël Nison 主导；激进路线——不要 `node_modules`，用 `.pnp.cjs` 直接告诉 Node 包在哪里。生态接受度有限但思想前卫。
- **2022 Lerna 退场 + Turborepo 出生**：Lerna 维护停滞，被 Nx 团队接管；Turborepo 由 Jared Palmer 创建，Vercel 收购。Monorepo 工具链格局重塑。
- **2023 Bun install**：Jarred Sumner 用 Zig + 二进制 lockfile，把"快"做到极致（详见 `bun/04-toolchain/01-bun-install.html`）。
- **2025 Catalog 标准化**：pnpm 发起的 catalog 协议被 Bun / Yarn 跟进，开始走向"workspace 协议跨工具兼容"。
- **2025-2026 JSR**：Deno 主导的下一代 registry，原生 ESM + TS、scoped slugs（@scope/name 改 @scope/name），尝试推翻 npm 的历史包袱。
- **写作要点**：把"今天为什么有这么多包管理器"讲清楚——每一代都是回答前一代某个具体痛点的产物。**给一张时间轴 SVG**。

#### 1.2 同代人横评

- **横评维度**：
  - **安装速度**（cold / warm / lockfile-only 三档）
  - **磁盘占用**（同一项目放 5 份，每家落地多少 MB）
  - **严格性**（能不能用未声明的依赖）
  - **Workspace 支持**（有没有 catalog、`workspace:*` 协议）
  - **Lockfile 格式**（YAML / JSON / 二进制）
  - **生态兼容性**（是否要 patch / 能否跑遗留项目）
  - **Windows 支持**（symlink 行为差异）
- **横评对象**：
  - **npm 11**（基线，Node 自带，最大兼容性）
  - **Yarn classic（1.x）**（仍有大量遗留项目，但官方已停止主线开发）
  - **Yarn Berry（4.x）**（PnP 默认；激进路线代表）
  - **pnpm 10**（CAS + 严格 peer 的代表）
  - **Bun install**（详见 Bun 主题；这里只点关键差异 + 链回）
  - **Deno + JSR**（生态新人，对照传统 npm 模式）
- **写作要点**：每家给一段"它的世界观"——不只是"快多少"，而是"它认为包管理应该是什么样"。**给一张多维雷达图**。

---

### P2 · node_modules 真相（2 章）

#### 2.1 Node module resolution 算法 + 4 种 layout

- **CJS resolution 算法**：从 `require('foo')` 出发，逐级向上查 `node_modules/foo`；遇到 `package.json` 的 `main` / `exports` 字段如何分支。短重述（详见 `node/03-modules/`），重点放在 monorepo 视角。
- **ESM resolution 算法**：`import` 用什么不同？`exports` map / conditional exports / import attributes 如何工作。短重述 + 链回 ECMA / Node 主题。
- **4 种 layout**：
  - **嵌套（npm 1-2）**：每个包的 `node_modules` 独立。简单但磁盘爆炸。
  - **扁平 + hoisting（npm 3+, Yarn classic）**：所有依赖提到根 `node_modules`，冲突时回退到嵌套。**写一张 hoisting 决策图**。
  - **Symlink（pnpm）**：根 `node_modules/.pnpm` 是真实文件存放点（每个版本一个目录），项目顶层只有 symlink 指向它。**写一张 pnpm 拓扑图**。
  - **PnP（Yarn Berry）**：完全不用 `node_modules`；`.pnp.cjs` 是一个 Node loader，hijack `require` 直接告诉 Node 包在 cache 中的什么位置。讲它如何改写 resolution 算法。
- **写作要点**：每种 layout 给一个 5-10 个包的小例子，画出实际目录结构。**4 张拓扑对比图**。

#### 2.2 幻影依赖 + doppelganger + 双 package hazard

- **幻影依赖（phantom dependency）**：在 `package.json` 没声明 `lodash`，但因为某个传递依赖装了它，hoisting 后能 `require('lodash')`。后果：升级 / 切包管理器时突然崩溃。
- **doppelganger 问题**：扁平化解不开冲突时，同一个包的不同版本被装到不同子目录，导致 `instanceof` / 单例失效（典型例子：`react` 被装两次，Hook 报错）。
- **双 package hazard**：CJS + ESM 双产物的包，在不同条件下被加载两次，状态不共享。短重述（详见 `vite/03-esm-cjs/02-interop.html`），重点强调 monorepo 视角下何时会出现。
- **pnpm 的论点**：严格的 symlink 拓扑确保只有 `package.json` 声明过的包才能 `require` 到，从结构上消除幻影依赖。给出一段 npm vs pnpm 的对比代码。
- **PnP 的论点**：连 `node_modules` 都没有，`require` 必须经过 `.pnp.cjs` 仲裁，更彻底。
- **写作要点**：**用 3 个真实案例**展示幻影依赖造成的 production bug。让读者意识到这不是洁癖，是工程问题。

---

### P3 · pnpm 内部（2 章）

#### 3.1 内容寻址存储 (CAS) + hardlink/symlink 拓扑

- **全局 store 在哪里**：`~/.pnpm-store`（默认）；按 SHA-512 hash 切片存放；同一个 `lodash@4.17.21` 全机只有一份物理文件。
- **3 层链接拓扑**：
  - **Global store → 项目 `.pnpm` 目录**：用 hardlink（同分区）或 reflink（APFS / Btrfs）。零拷贝、零额外磁盘。
  - **`.pnpm/<name>@<ver>/node_modules/<name>` → `<name>` 自身的 transitive deps**：用 symlink，每个版本独立 sandbox。
  - **项目顶层 `node_modules/<name>` → `.pnpm/<name>@<ver>/node_modules/<name>`**：只 symlink 显式声明的依赖，强制严格性。
- **节省磁盘的真实数字**：3 个相同 React 项目并排存放，npm vs pnpm 磁盘占用对比。**给一张物理存储分布图**。
- **跨分区 / 跨文件系统的退路**：hardlink 不能跨设备时回落到 copy，pnpm 提供 `link-workspace-packages` / `node-linker` 选项。
- **side-effects-cache**：pnpm 缓存 `postinstall` 脚本副作用（例如 esbuild 下载二进制），加速 reinstall。
- **写作要点**：把 CAS + symlink 这套拓扑结构画清楚，让读者理解"为什么 pnpm 既省磁盘又严格"。**1-2 张拓扑图必备**。

#### 3.2 pnpm-lock.yaml + 严格 peer + `.pnpmfile.cjs` hooks

- **pnpm-lock.yaml 结构**：`importers` / `packages` / `snapshots` 三段；为什么用 YAML（人类可读 + diff 友好）；与 `package-lock.json` / `yarn.lock` / `bun.lockb` 对比。
- **严格 peer 模式**：pnpm 默认对 peer dependency 不自动满足；遇到缺失会 warn 并提供 "auto-install-peers" 选项。讲清楚"严格"如何防止潜在 bug 又如何让用户初次切 pnpm 痛苦。
- **resolution-mode**：`highest` / `time-based` / `lowest-direct`；介绍 2024-2025 引入的 time-based 解析（保护新项目不踩刚发布的烂包）。
- **`.pnpmfile.cjs` hooks**：
  - `readPackage(pkg)`：在解析时改写任意 package.json 字段（用于 patch 错误的 peer 范围 / 强制版本）
  - `afterAllResolved(lockfile)`：lockfile 生成后做最后一道整理
  - 真实场景：解决某个上游包错误的 peer range；强制 monorepo 内部所有 React 一致版本
- **patches 子系统**：`pnpm patch <pkg>` 创建 patch；与 `patch-package` 对比；patch 如何持久化到 lockfile。
- **catalog（详见 P4.1）**：在这里短点出 catalog 是 lockfile 的"版本字典"。
- **写作要点**：**给两个真实 hook 案例**——一个是修上游 peer，一个是统一 monorepo 内 React 版本。

---

### P4 · Workspace 协议（2 章）

#### 4.1 四家 workspace 对比 + `workspace:*` + catalog

- **四家 workspace 配置入口**：
  - npm：`package.json` 的 `workspaces` 字段（数组 / glob）
  - Yarn classic：同 npm
  - Yarn Berry：`package.json` 的 `workspaces` + 更丰富的 protocol
  - pnpm：单独 `pnpm-workspace.yaml` 文件
  - Bun：`package.json` 的 `workspaces`（详见 `bun/04-toolchain/01-bun-install.html`）
- **`workspace:*` 协议**：
  - 写法：`"@app/ui": "workspace:*"` / `"workspace:^"` / `"workspace:~"` / `"workspace:./packages/ui"`
  - 发布时如何被 publish 阶段重写为真实版本号（pnpm `publishConfig` / Yarn berry / Changesets）
  - 与 `link:` 协议的区别（link 不会被 publish 重写，是开发期）
- **catalog 协议（2025 共识）**：
  - 动机：monorepo 中 50 个包都用 React，每次升级要改 50 处。catalog 把版本号集中到顶层 `catalog:` 表。
  - pnpm 9 引入；Bun 1.2 跟进；Yarn 4 实验中。
  - 命名 catalog（`catalog:react18`）的用途——同一个 monorepo 内多个版本同时存在但互不串味。
  - 与"version range 强制对齐"的区别：catalog 是单一来源，版本对齐工具（如 syncpack）是 lint。
- **dev/prod 边界**：workspace 内部依赖一般用 `workspace:*` + dev；发布到外部时如何避免泄露 workspace 协议。
- **写作要点**：**给一张 4 家 workspace 配置对比表**。catalog 给一个完整 monorepo 例子。

#### 4.2 `--filter` / topological run / 内部联调

- **`--filter` 选择器**：
  - 按包名：`pnpm --filter @app/web build`
  - 按路径：`pnpm --filter './apps/**' build`
  - 按变更：`pnpm --filter '...{packages/ui}^...' build`（依赖图前后向选择）
  - 按 git 变更：`pnpm --filter '[main]' build`（自上次 main 以来变动的包）
- **topological run**：`pnpm -r run build` 自动按依赖顺序构建；并行度控制；失败行为（fail-fast vs continue）。与 Turborepo / Nx 的差别（Turborepo / Nx 还有 input/output 缓存）。
- **内部包联调**：
  - 修 `packages/ui` 的代码，`apps/web` 的 dev server 怎么自动 hot reload？短重述 + 链回 `vite/02-vite-architecture/01-dev-mode.html`。
  - TypeScript path mapping vs workspace symlink 的边界——为什么 monorepo 推荐前者用于编辑期、后者用于运行期。
  - **真实陷阱**：Vite 默认不监听 `node_modules` 内部变化，需要 `server.watch.ignored` 配置。
- **`pnpm dlx` / `bun x`**：临时执行远程脚本的新一代 `npx` 替代品。
- **`.npmrc` / `.pnpmrc`**：workspace 内的配置作用域 + 优先级。
- **写作要点**：filter 选择器给一张"短语 → 选中包"的映射表，读者能复制即用。

---

### P5 · 任务编排（2 章）

#### 5.1 Turborepo

- **Turborepo 是什么**：建立在已有包管理器（npm/Yarn/pnpm/Bun）之上的 task runner + cache layer，本身不管包管理。
- **`turbo.json` 核心字段**：
  - `tasks.<name>.dependsOn`（任务依赖图：`^build` 表示先依赖项的 build）
  - `tasks.<name>.inputs`（哪些文件影响这个任务的 hash）
  - `tasks.<name>.outputs`（产物路径，决定 cache 内容）
  - `tasks.<name>.cache`（false 表示不缓存，常见于 dev / start）
- **input/output hash**：把所有 input 文件 + 环境变量 + 工具版本 hash → cache key；命中即 replay output + log；未命中真正执行。
- **远程 cache**：
  - Vercel Remote Cache（默认，免费层）
  - 自建 S3 / Cloudflare Workers 兼容层
  - 与 Nx Cloud 的对比（一个文件级 cache，一个项目图级）
- **filter UI**（Turborepo 2 改进）：可视化哪些任务命中 cache、哪些重跑。
- **环境变量边界**：`globalEnv` vs `env` 字段；漏配会导致跨环境 cache 命中误判（典型 bug）。
- **真实场景**：CI 中 Turborepo 把 PR 构建从 8 分钟降到 1 分钟；什么情况下 cache 命中率会突然崩盘。
- **写作要点**：给一个完整的 `turbo.json` 例子 + 一段 cache 命中演示日志。

#### 5.2 Nx

- **Nx 是什么**：比 Turborepo 更"框架化"——不仅是 task runner，还有项目图、plugin 生态、code generator、迁移脚本（`nx migrate`）。
- **项目图（project graph）**：自动从 `package.json` / `tsconfig.json` / 源码 import 推断；可视化为 SVG / 交互图。
- **affected 命令**：`nx affected -t test` 只跑被改动影响的项目，用于 PR CI。底层是项目图差分。
- **plugin 生态**：`@nx/react` / `@nx/next` / `@nx/vite` / `@nx/jest`，每个 plugin 提供 generator + executor + migration。
- **`nx migrate`**：升级 Nx 版本时自动改 monorepo 内所有 plugin 配置 + 跑 codemods，是 Nx 与 Turborepo 的最大差异点。
- **Nx Cloud**：远程 cache + DTE（Distributed Task Execution，把任务分到多 CI 节点并行）。
- **何时选 Nx over Turborepo**：项目数 > 50 / 强需求"affected"模式 / 想用框架级 generator 模板 / 团队接受 Nx 的"一体化"思想。
- **何时选 Turborepo over Nx**：项目结构已稳定 / 不想被 plugin 锁定 / 只需要 cache 加速 CI / 偏向"组合工具"哲学。
- **超大规模选项**：短点出 Bazel（Google）/ Rush（Microsoft）/ Pants（Twitter）适用边界——通常需要 100+ 项目 + 多语言混合。
- **写作要点**：**Turborepo vs Nx 决策矩阵**——按"团队规模 / 项目数 / 框架需求 / cache 复杂度"4 个维度给推荐。

---

### P6 · 版本与发布（1 章）

#### 6.1 Changesets + npm provenance + workspace publish

- **Changesets 是什么**：Atlassian 出品；用 markdown 文件记录每次变更（patch/minor/major），CI 时聚合成 changelog + 自动发版 PR。
- **核心工作流**：
  - 开发者写代码 → `pnpm changeset` 生成一个 markdown 描述
  - PR 合并到 main → CI 跑 `changeset version` 把所有 pending changeset 聚合成 changelog + bump 版本
  - CI 创建 "Version Packages" PR → 人工 review 后合并
  - 合并触发 `changeset publish` 自动发到 npm
- **独立版本 vs 固定版本**：
  - 独立版本（默认）：每个包独立 semver，依赖关系自动联动
  - 固定版本（`fixed: ['@app/*']`）：一组包始终保持同版本
  - 何时选哪个：UI 库（独立）vs 紧耦合 SDK（固定）
- **prerelease 模式**：`changeset pre enter alpha` 进入预发布；自动给版本加 `-alpha.0` 后缀。
- **snapshot 模式**：CI 上每个 PR 发一个临时版本（如 `0.0.0-pr-123-abc`），让外部消费者验证 PR。
- **npm provenance**：2023+ 引入；CI 自动签名包来源（GitHub Actions OIDC），消费者能验证"这个 npm 包确实是从这个 git commit 在这个 CI 上构建的"，对抗供应链攻击。
- **`workspace:*` 在 publish 时的处理**：pnpm / Bun / Changesets 都会在 publish 时自动把 `workspace:*` 改写为真实版本号。
- **私有 registry**：Verdaccio（自建）/ npm Enterprise / GitHub Packages / JFrog Artifactory；scope mapping 配置。
- **真实场景**：开源 monorepo（typescript-eslint、Astro、Vite）都在用 Changesets；选它的理由 + 它的局限（不擅长跨 repo / 不直接管 deploy）。
- **写作要点**：给一份完整的 GitHub Actions 配置示例（changeset + publish + provenance 一条龙）。

---

### P7 · 选型与下一代（1 章）

#### 7.1 决策树 + 下一代

- **决策树**（按团队 / 项目规模分支）：
  - **个人项目 / 小团队（< 5 包）**：npm + 单 repo；不必上 monorepo
  - **中型项目（5-30 包）**：pnpm + workspace + Turborepo（最低门槛 monorepo）
  - **大型项目（30-100 包）**：pnpm 或 Bun + Turborepo / Nx 二选一（按是否需要 plugin / migration）
  - **超大规模（100+ 包，多语言）**：Bazel / Rush / Pants
- **生态趋势观察**（写作时点：2026-05）：
  - Catalog 走向标准化（pnpm 主导，Bun / Yarn 跟进）
  - 二进制 lockfile（Bun）vs 文本 lockfile（pnpm/Yarn/npm）的权衡
  - Vercel Remote Cache 与 Nx Cloud 的远程 cache 之争
  - Yarn Berry 的 PnP 路线 5 年来被市场拒绝，但 zero-installs 思想被 Bun / Deno 部分吸收
  - JSR（Deno）作为下一代 registry：原生 TS、scoped slugs、no-tarball；能否撼动 npm？
  - Workspace 协议跨工具兼容化（pnpm `workspace:*` → 已被 Bun 接受）
- **历史教训 / 反模式**：
  - Lerna 退场的教训：维护停滞 + 没有 cache，Turborepo / Nx 取而代之
  - 不要在生产 monorepo 上叠太多工具（pnpm + Turborepo + Nx + Lerna 同时存在的项目通常已积弊深重）
  - "全家桶"vs"组合工具"两条哲学路线没有对错，但混用最危险
- **5 年展望**：
  - 包管理器 + bundler + test runner 融合（Bun 已经在做；其他厂商会跟进吗？）
  - JSR 是否会像 ES Modules 取代 CJS 那样取代 npm registry？
  - 远程 cache 是否会成为 CI 标配？
- **写作要点**：保持中立——每条决策都给 trade-off，不当某家广告。**给一张决策树流程图**。

---

## 写作风格 ——「写文章人，不是建筑师」

> （遵循用户已有约定）

- **章节内部**：6 段模板（速览 → 底层逻辑 → 应用场景 → 典型代码 → 常见陷阱 → 延伸阅读）
- **跨章引用**：用"短重述 + 链回"，不抄不省
- **图示**：拓扑结构 + 时间轴 + 决策树用 SVG；具体实现细节用代码块
- **代码示例**：每章 3-5 段可复制运行（或可读懂结构）的代码 / 配置
- **避免**：
  - "架构师式"分类标签（X 系 / Y 派 / Z 流）
  - 中立到没观点（每章必须给"我推荐 X，因为 Y"）
  - PPT 抄页式（PPT 只是灵感，知识从 pnpm.io / RFC / 作者 blog 来）
- **观点强度**：
  - 强观点（"幻影依赖是真问题，建议直接用 pnpm 严格模式"）
  - 弱观点（"Turborepo vs Nx 是哲学差异，按团队偏好选"）
  - 不观点（"npm 11 也是好选择，如果不在意磁盘和严格性"）

---

## 不写的内容（明确划线）

- **不讲**：
  - npm CLI 入门用法（这不是配方书）
  - 私有 registry 自建运维（运维领域，超出本主题）
  - 具体 CI 平台的配置（GitHub Actions / GitLab / Jenkins，只在 P6 给一份示例）
  - 安全审计工具（npm audit / Snyk / Socket，独立的安全主题）
- **链回但不重复**：
  - Bun install 内部（链回 Bun 主题）
  - Vite 如何利用 workspace 加速 dev server（链回 Vite 主题）
  - Node module resolution spec 细节（链回 Node 主题）
- **暂占位（待写主题）**：
  - Next.js 在 monorepo 中的常见模式 → 待 Next.js 主题
  - Vitest / Jest 的 workspace 模式 → 待测试工具主题

---

## 路线图

- **Step 1**：本 outline.md 经用户审定 ✅
- **Step 2**：建 8 个文件骨架（`pnpm-monorepo/index.html` + 7 个 phase 目录的 `index.html`） ← **当前**
- **Step 3**：P1 章节正文（项目史 + 同代人横评，2 章）
- **Step 4**：P2 章节正文（resolution + 幻影依赖，2 章）
- **Step 5**：P3 章节正文（CAS + lockfile/peer/hooks，2 章）
- **Step 6**：P4 章节正文（workspace 协议 + filter，2 章）
- **Step 7**：P5 章节正文（Turborepo + Nx，2 章）
- **Step 8**：P6 章节正文（Changesets + publish，1 章）
- **Step 9**：P7 章节正文（决策树 + 下一代，1 章）+ 站点首页卡片改 done
