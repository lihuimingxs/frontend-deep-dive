# shadcn/ui + Radix UI 深度学习 · 章节大纲

> 本文件是 shadcn/ui + Radix UI 主题的写作蓝本。**7 阶段 · 12 章**：从项目史 + 同代人横评（P1）→ Radix 哲学（headless + a11y + asChild）（P2）→ 浮层组件深度（P3）→ 表单组件深度（P4）→ shadcn CLI + Registry（P5）→ 工程实践（Form + Theme）（P6）→ 高级模式 + 决策（P7）。
> 编写日期：2026-05-08（首版）｜目标版本：shadcn/cli v4（2026-03）/ Radix UI 统一包（2026-02）

---

## 元信息

- **目标版本**：
  - **shadcn/ui CLI v4**（2026-03 发布）—— 多框架 scaffold（Next.js / Vite / Laravel / React Router / Astro / TanStack Start）+ Visual Project Builder（ui.shadcn.com/create）+ 改进的 registry 系统
  - **shadcn 双引擎**（2026-02 起）—— 可选 **Radix UI**（默认，feature-rich）或 **Base UI**（MUI 出品的 unstyled，更轻量）。CLI 根据 components.json 拉对应变体
  - **Radix UI Primitives 统一包 `radix-ui`**（2026-02）—— 单一 npm 包暴露所有 primitives + tree-shakable，替代过去的 @radix-ui/react-* 多包
  - **新 Primitives**：PasswordToggleField（密码可见 toggle）/ OneTimePasswordField（OTP 输入框分离）
  - 历史回溯：2018 Radix 起步 → 2020 Radix Primitives v1 → 2023-03 shadcn 公开 → 2024 现象级（Vercel / Linear / Resend 公开使用）→ 2025 多框架扩张（Vue / Svelte 第三方移植）→ 2026 双引擎 + Visual Builder + 1300+ blocks
- **来源**：
  - [ui.shadcn.com/docs](https://ui.shadcn.com/docs)（shadcn/ui 官方）
  - [ui.shadcn.com/docs/changelog](https://ui.shadcn.com/docs/changelog)（changelog 是设计动机最权威来源）
  - [radix-ui.com/primitives](https://www.radix-ui.com/primitives)（Radix Primitives 官方）
  - [github.com/shadcn-ui/ui](https://github.com/shadcn-ui/ui)（shadcn 源码）
  - [github.com/radix-ui/primitives](https://github.com/radix-ui/primitives)（Radix 源码）
  - [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)（a11y 模式权威标准）
  - shadcn（Hassan El Mghari）+ Pedro Duarte / Vlad Moroz（Radix 核心）公开访谈 / Twitter
- **目标读者**：用过 shadcn/ui 但停留在"copy-paste 组件"层面的工程师；想懂 Radix headless 哲学和 a11y 标准的人；要建私有 registry / 设计系统的 tech lead；评估 shadcn vs Mantine vs MUI vs Ark UI 的人。
- **不是这个主题的读者**：
  - 完全没用过 shadcn/ui 的（先读 <a href="../tailwind/07-ecosystem-decision/01-ui-libraries.html">Tailwind P7.1 UI 库横评</a> 建立基本认知）
  - 想要"30 个 shadcn 组件 API 速查"的（链回官方 docs，不重复）
  - 不写 React 的（shadcn / Radix 是 React-only）

---

## 整体设计：7 阶段 · 沿"从用一个组件到搭设计系统"展开

shadcn/ui + Radix 的核心问题：**让 React 工程师能搭出 a11y 完整 + 设计可控 + 可定制的 UI 系统**。这套生态 8 年来从"Radix Primitives 一个 headless 库"演化到"shadcn copy-paste 模式 + 双引擎 + 1300+ blocks 的事实标准"。我们按"用户从用一个 Button 到搭团队 design system"的链路展开 7 阶段。

| 阶段 | 章数 | 核心问题 |
|---|---|---|
| **P1 · shadcn/ui + Radix 是谁** | 2 | 项目史 2018-2026 + 同代人横评（Mantine / NextUI / MUI / Headless UI / Ark UI / Park UI）+ 4 个核心设计赌注 |
| **P2 · Radix 哲学** | 2 | Headless + WAI-ARIA a11y 标准；受控/非受控 + asChild/Slot + Compound Components 模式 |
| **P3 · 浮层组件深度** | 1 | Dialog / Popover / Dropdown / Tooltip / HoverCard：Floating UI 定位、Portal、focus trap、scroll lock、ESC 关闭 |
| **P4 · 表单组件深度** | 1 | Combobox / Select / RadioGroup / Checkbox / Switch / Slider / Form：复杂状态、autocomplete、a11y 表单 |
| **P5 · shadcn CLI + Registry** | 2 | CLI v4 + Visual Builder + components.json；Registry 系统 + 自建私有 registry + monorepo 共享 |
| **P6 · 工程实践** | 2 | Form 完整工作流（react-hook-form + Zod + shadcn Form）；Theme + 暗色 + 多品牌 + Tailwind v4 集成 |
| **P7 · 高级模式 + 决策** | 2 | 高级模式（TanStack Table / Sonner / 虚拟列表 / cmdk 命令面板）；决策树（Base UI vs Radix / 何时不用 / 2027 展望） |

总计 **12 章 ≈ 75,000-85,000 字**，平均每章 6,500 字。**比重偏向 P2-P5**（Radix 哲学 + 核心组件 + Registry 是日常主战场），P6-P7 写得紧凑。

---

## 与既有主题的边界 ——「短重述 + 链回」原则

shadcn/ui + Radix 与几个已写主题大量交叉，必须明确划界：

> ✅ **短重述**：1-3 句话点出"它在底层是什么 + 关键性质"
> ✅ **链回**：紧跟一句"详细的 X / Y / Z 请参考 [`主题/{phase}/{chapter}`]"
> ❌ **不要**直接抄一遍其他主题的论述

**关键边界**：

| 概念 | 在哪讲透 | 本主题里怎么处理 |
|---|---|---|
| Tailwind utility-first 心智 / @theme 配置 | `tailwind/02-mindset/` 与 `tailwind/03-engine-config/` | 链回，P6.2 讲 Theme 集成时短重述 |
| CVA + cn() + tailwind-merge 工具链 | `tailwind/06-component-patterns/01-cva-cn-merge.html` | 链回，P2.2 讲 asChild 时点；shadcn 组件源码内部模式 |
| UI 库横评（Mantine / MUI / DaisyUI） | `tailwind/07-ecosystem-decision/01-ui-libraries.html` | 链回，P1.2 短重述（重点放 Radix vs Base UI vs Ark UI 三个 headless 阵营） |
| React 19 RSC / 'use client' 边界 | `react/06-modern/01-server-components.html` 与 `next/02-app-router/02-server-client-boundary.html` | 链回，P7.1 讲 Server Components 兼容性时点 |
| React Hooks（useState / useReducer / useRef） | `react/03-hooks/` | 链回，P2 讲 Radix 内部 hooks 实现时短重述 |
| Server Actions / useActionState | `next/04-server-actions/01-server-actions.html` | 链回，P6.1 讲 Form + Server Actions 工作流时点 |
| TypeScript 泛型 / discriminated union | `typescript/02-type-manipulation/` | 链回，P2 讲 asChild 类型推导 + P5 讲 registry schema 时点 |
| Vite plugin / Next.js 集成 | `vite/` 与 `next/` 主题 | 链回，P5.1 讲 CLI 多框架 scaffold 时短重述 |
| 浏览器 DOM API（focus / portal / popover API） | `browser-rendering/` 主题 | 链回，P3.1 讲 Floating UI + Portal 时点 |
| WAI-ARIA / 无障碍标准 | （之前主题未深入） | 本主题 P2.1 详细讲（仅本节专属） |

---

## 内容覆盖原则 ——「Radix WAI-ARIA + shadcn changelog 一手」

shadcn / Radix 领域的特点：**两位主作者（shadcn 和 Pedro Duarte）通过 Twitter / 访谈持续输出设计动机**；Radix Primitives 严格遵循 WAI-ARIA Authoring Practices（a11y 权威标准）。所以写作时严格遵守：

**4 条规则**：

1. **API 定义优先官方 docs**：表面 API 以 ui.shadcn.com/docs + radix-ui.com/primitives 为准。
2. **设计动机以 changelog + 作者访谈为准**：例如"为什么 copy-paste 模式"原文是 shadcn 多次访谈；写"为什么这么设计"必须回到一手出处。
3. **a11y 行为以 WAI-ARIA APG 为准**：例如 Dialog 的 focus trap / ESC 关闭 / aria-labelledby 等都是 W3C 标准；不是 Radix 自创。本主题点出"Radix 实现的是标准、不是发明"。
4. **历史 / 退场以官方公告为准**：copy-paste 模式起源、Base UI 加入、registry 系统演化都有公开 changelog。

---

## 节奏建议

- **连读组**：
  - P1.1 + P1.2（项目史 → 同代人，理解格局）
  - P2.1 + P2.2（headless 哲学 → 组件 API 模式，必须连读建立 Radix 心智）
  - P3.1 + P4.1（浮层 + 表单组件，对应日常 95% 需求）
  - P5.1 + P5.2（CLI + Registry，搭团队 design system 的工具链）
  - P6.1 + P6.2（Form 工作流 + Theme，工程实践双子星）
- **可独立跳读**：
  - P3.1 浮层、P4.1 表单、P7.1 高级、P7.2 决策（需要时单读）
- **建议阅读顺序**：
  - **写业务的工程师**：P3 + P4 + P6.1（直接用组件 + 写 Form）
  - **建团队 design system**：P2 + P5 + P6.2（哲学 + Registry + Theme）
  - **想深入 Radix 内部**：P2 + P3.1 + P4.1（哲学 + 实现）

---

## 章节简述

> 下面每章列出**核心问题 + 关键内容 + 写作要点**。每章按 6 段模板（速览 → 底层逻辑 → 应用场景 → 典型代码 → 常见陷阱 → 延伸阅读）。

### P1 · shadcn/ui + Radix 是谁（2 章）

#### 1.1 项目史 2018-2026

- **核心问题**：Radix 怎么从 2018 年的小众 headless 库走到 shadcn 推广 + 2026 双引擎事实标准？
- **关键节点**：
  - **2018-2020 Radix 起步**：Pedro Duarte / Vlad Moroz 在 Modulz 公司启动；目标是"a11y-first headless 组件"
  - **2020-12 Radix Primitives v1**：Dialog / Popover / Dropdown 等核心 primitives 开源
  - **2022 Radix Themes**：Modulz 团队额外推出 pre-styled 组件库（与 Primitives 并行产品线）
  - **2023-03 shadcn 公开**：Hassan El Mghari 把"Radix + Tailwind + CVA 模板"公开为 CLI 工具
  - **2024 shadcn 现象级**：Vercel / Linear / Resend 等公开使用；GitHub stars 50k+
  - **2024-09 Radix 加入 WorkOS**：Modulz 团队整体加入 WorkOS（保证长期维护）
  - **2025 第三方移植**：shadcn-vue / shadcn-svelte / NativeWind 适配（仅本主题点到，详细各自社区）
  - **2026-02 双引擎**：shadcn/ui 加入 Base UI 支持（与 Radix UI 并行选择）；Radix Primitives 出统一包 `radix-ui` + tree-shaking
  - **2026-02 1300+ blocks**：Registry 扩展，含 dashboard / form / login / sidebar 全套；同时支持 Radix 和 Base UI 变体
  - **2026-03 CLI v4**：Visual Project Builder + 多框架 scaffold（Next.js / Vite / Laravel / React Router / Astro / TanStack Start）
- **关键转折点**：
  - **2023 copy-paste 模式诞生**：shadcn 跳出"npm install + 黑盒 API"，让组件源码进项目。这是 React 组件库分发模式的根本变革
  - **2024 一年内事实标准**：从开源到 Vercel / Linear 主流采用只用了 18 个月
  - **2026 双引擎**：shadcn 不再绑死 Radix；用户可选 Base UI（MUI 出品的 unstyled）。这反映"shadcn 是模板而不是 Radix wrapper"的本质
- **写作要点**：用一张时间线 SVG 串起来；强调 copy-paste 模式是 React 组件库分发革命；强调 Radix 是先驱、shadcn 是放大器。

#### 1.2 同代人横评 + 设计哲学

- **核心问题**：shadcn/ui + Radix 在 React UI 生态站哪？同代 headless / styled / hybrid 三阵营各自定位？
- **同代人**（按定位分）：
  - **Headless 阵营**（Radix 同类）：
    - **Headless UI**（Tailwind Labs）：Radix 的直接竞争者，但生态被 Radix 反超；Vue 生态仍有份额
    - **Ark UI**（Chakra 团队）：基于 Zag.js 状态机；React + Vue + Solid 多框架
    - **Park UI**（Cawa 团队）：Ark UI + Panda CSS 的 styled wrapper
    - **Reach UI**（Chance Strickland）：早期项目，已停止维护
  - **Styled 阵营**（与 Radix Themes 同类）：
    - **Mantine**：自有 styling 系统，组件丰富 100+，与 Tailwind 不冲突可共存
    - **NextUI**（HeroUI）：基于 Tailwind v3 但 v4 兼容滞后
    - **MUI**（Material UI）：Material Design 在 React 实现；企业大量存量
    - **Chakra UI**：v3 改造为 styled-system 派；与 Tailwind 心智冲突
  - **Hybrid 阵营**（shadcn / Catalyst 同类）：
    - **shadcn/ui**：copy-paste + Radix + Tailwind + CVA（事实标准）
    - **Catalyst**（Tailwind UI 一部分）：商业 React kit
    - **Tailwind UI**：HTML 模板（不是组件库）
- **横评维度**：
  - 分发模式（npm package / copy-paste / template）
  - 样式策略（headless / pre-styled / opinionated）
  - 框架支持（React-only / 多框架）
  - a11y 完整度
  - design system 友好度
  - 2026 实际市场份额
- **shadcn/ui + Radix 的 4 个核心设计赌注**：
  1. **Headless + 标准 a11y**（Radix）：Radix 实现 WAI-ARIA APG 标准；不发明 a11y 行为，而是把 W3C 标准做到位。这让任何用 Radix 的项目自动获得 a11y 一等公民
  2. **Copy-paste 不 npm install**（shadcn）：组件源码进项目而不是黑盒 npm 依赖。优势：可任意修改、不被升级破坏；代价：要手动 sync upstream
  3. **CVA + cn 标准模式**（shadcn）：用 class-variance-authority 管理变体、用 cn 解决 className 冲突。这套模式被广泛复制到非 shadcn 项目
  4. **双引擎可选**（shadcn 2026）：Radix 还是 Base UI 用户选；shadcn 本质是"模板"而不是"特定 primitive 的 wrapper"
- **2026 现状**：
  - 新 React 项目里约 60% 用 shadcn/ui
  - 15% 用 MUI / Mantine / Chakra（自有 design system）
  - 10% 用 NextUI / Ark UI / 其他 headless
  - 15% 自建组件库（基于 Radix 或自己写）
- **何时不选 shadcn/ui**：
  - 已有 Mantine / MUI 项目（迁移成本高）
  - 不接受 copy-paste 模式（要 npm 升级路径）
  - 不写 Tailwind（shadcn 默认 Tailwind 集成）
  - 设计系统已有内部规范不需要 shadcn 默认 token
- **写作要点**：横评要有具体决策矩阵；强调 shadcn 不是发明、是工程整合（Radix + Tailwind + CVA）；最后给"我推荐 X，因为 Y"的强观点。

---

### P2 · Radix 哲学（2 章）

#### 2.1 Headless + WAI-ARIA a11y 标准

- **核心问题**：headless 是什么意思？Radix 怎么实现 WAI-ARIA APG 标准？为什么 a11y 这么难手写？
- **headless 定义**：
  - 提供"行为 + 状态 + a11y"，不提供样式
  - 用户自己加 className（用 Tailwind / CSS 写样式）
  - 与 styled 库（Mantine / MUI）反义
- **WAI-ARIA APG（Authoring Practices Guide）**：
  - W3C 维护的"组件 a11y 标准"权威文档
  - 定义每种 widget（Dialog / Combobox / Tab / Menu）的<strong>键盘交互 / aria-* 属性 / focus 管理</strong>规范
  - Radix 严格按 APG 实现，不发明
- **Dialog 的 a11y 标准**（举例）：
  - 打开时：focus 移到 Dialog 内部第一个可 focus 元素（或显式指定的）
  - 关闭时：focus 回到触发元素
  - 按 ESC 关闭
  - 按 Tab 在 Dialog 内 focus 循环（focus trap）
  - aria-modal="true"、aria-labelledby、aria-describedby
  - 屏幕阅读器读出"dialog [title]"
- **Combobox 的 a11y 标准**（举例）：
  - 输入触发 listbox 显示
  - ↓ ↑ 键导航选项
  - Enter 选中
  - aria-expanded / aria-controls / aria-activedescendant
  - 屏幕阅读器实时读出可用选项数 + 当前选中
- **a11y 为什么难手写**：
  - 标准复杂（每种 widget 几十条规则）
  - 不同浏览器 / screen reader 行为差异
  - 边角情况多（嵌套 dialog / modal 之上的 popover / 表单中的 combobox）
  - 测试难（需要 NVDA / JAWS / VoiceOver 验证）
- **Radix 怎么把这些做到位**：
  - 每个 primitive 有专门的 a11y test suite
  - 与 a11y 专家咨询（Pedro Duarte 自己也是 a11y 专家）
  - 跟踪 WAI-ARIA spec 更新
- **写作要点**：本章建立"Radix 不是发明 a11y、是把 W3C 标准做到位"的心智；用 Dialog / Combobox 两个具体例子展示 a11y 标准复杂度；让读者看到为什么自己手写组件几乎一定漏 a11y。

#### 2.2 受控/非受控 + asChild/Slot + Compound Components

- **核心问题**：Radix 组件的 API 怎么设计？为什么有 open / defaultOpen 两套？asChild 是什么？Compound Components 怎么用？
- **受控 vs 非受控**：
  - 非受控（默认）：组件自己管 state，用户传 defaultOpen / defaultValue
  - 受控：用户管 state，传 open + onOpenChange / value + onValueChange
  - 选择：简单场景非受控（少代码）；需要外部控制 / 与 form 联动用受控
  - Radix 几乎所有 primitive 都同时支持两种模式
- **asChild + Slot**：
  - Radix Slot 是核心实用组件 —— "把当前组件的 props / className / ref 转给传入的 children"
  - <code>&lt;Dialog.Trigger asChild&gt;&lt;Button&gt;Open&lt;/Button&gt;&lt;/Dialog.Trigger&gt;</code>：Trigger 不渲染自己的 button，把行为（onClick / aria-* / data-state）合并到子 Button 上
  - 让 Radix 能与任意自定义组件无缝集成
- **Compound Components（复合组件）**：
  - 组件由多个子组件组成，<strong>共享 context</strong>（不需要 props 传递）
  - <code>&lt;Dialog.Root&gt;&lt;Dialog.Trigger&gt;...&lt;/Dialog.Trigger&gt;&lt;Dialog.Content&gt;...&lt;/Dialog.Content&gt;&lt;/Dialog.Root&gt;</code>
  - Trigger 和 Content 通过 React context 自动通信（开关状态、a11y id）
  - 用户不需要手动传 props 在子组件之间
- **API 设计的 4 条原则**：
  1. **Mirror 原生 HTML**：尽可能用 button/input 等原生元素；asChild 让组件成为"行为容器"
  2. **Forward refs**：所有 primitive 用 React.forwardRef，让用户能 .focus() / .scrollIntoView()
  3. **Pass through props**：不消耗的 props 全部 spread 给底层 DOM
  4. **Type safe**：完整 TypeScript 推导，asChild + 子组件类型自动推导
- **写作要点**：本章建立"Radix 的 API 设计是 React 工程精华"的心智；与 P6 CVA + cn 配合，让读者理解 shadcn 组件源码每一行的设计意图。

---

### P3 · 浮层组件深度（1 章）

#### 3.1 Dialog / Popover / Dropdown / Tooltip / HoverCard

- **核心问题**：浮层组件需要解决哪些复杂问题？Floating UI / Portal / focus trap / scroll lock 各做什么？
- **浮层组件家族**：
  - **Dialog**（Modal）：阻塞式、需 focus trap、ESC 关闭、scroll lock
  - **Popover**：非阻塞、点外面关闭、智能定位
  - **DropdownMenu**：菜单语义、键盘导航（↓ ↑ Enter ESC）
  - **Tooltip**：hover/focus 触发、有延迟、屏幕阅读器读 aria-label
  - **HoverCard**：类似 Tooltip 但内容更丰富、有 enter/exit 动画
  - **ContextMenu**：右键触发
- **核心技术 1 · Floating UI**：
  - 浮层定位库（前身 popper.js）
  - 处理：自动避开视口边缘 / 翻转方向 / collision detection / arrow 定位
  - Radix 内部用 Floating UI（@floating-ui/react）
  - 用户用 Radix 不需要直接接触 Floating UI，但定制时要懂
- **核心技术 2 · Portal**：
  - 把浮层 DOM 渲染到 document.body 末尾（不是组件树原位置）
  - 解决 z-index 战争（浮层不被父级 overflow / transform 影响）
  - Radix 默认用 Portal；可关闭（特殊场景）
- **核心技术 3 · Focus Trap**：
  - Dialog 打开时 Tab 在 Dialog 内循环，不跑到背景
  - 关闭时 focus 回到触发元素
  - 用 react-focus-lock 或类似库实现
- **核心技术 4 · Scroll Lock**：
  - Dialog 打开时禁止 body scroll（防止背景滚动）
  - 处理 iOS Safari 的"橡皮筋"问题
  - 处理 scrollbar gutter（防止 layout shift）
- **核心技术 5 · ESC 关闭 + 点外关闭**：
  - 全局 keydown 监听 ESC
  - 全局 click 监听判断是否点击在浮层外
  - 嵌套时只关最上层（Radix 自动处理）
- **核心技术 6 · 浏览器原生 popover API（2024+）**：
  - HTML &lt;dialog&gt; / popover attribute
  - Radix 暂不全切原生（兼容性 + 行为差异）；2026-2027 可能切
- **关键代码示例方向**：
  - Dialog 完整 a11y + 动画
  - Popover 智能定位（不被视口裁切）
  - DropdownMenu 嵌套子菜单
  - Tooltip 与 disabled button 配合（disabled button 不触发 hover，要包 div）
  - HoverCard + Server Component 内容
- **写作要点**：本章是 Radix 内部最复杂的部分；用具体 a11y 例子 + 实际代码展示。强调"浮层组件不是 'CSS position: fixed' 这么简单"。

---

### P4 · 表单组件深度（1 章）

#### 4.1 Combobox / Select / RadioGroup / Checkbox / Switch / Slider / Form 控件

- **核心问题**：表单 widget 比浮层更难（状态多、a11y 严格、与表单系统集成）。Radix 怎么做？
- **简单控件**：
  - **Checkbox**：受控/非受控、indeterminate state、aria-checked
  - **RadioGroup + Radio**：单选互斥、键盘导航 ← →
  - **Switch**：与 Checkbox 类似但视觉是 toggle、role="switch"
  - **Slider**：单值 / 范围、键盘 ← → ↑ ↓ Home End、aria-valuemin/max/now
  - **Toggle / ToggleGroup**：button 风格的 checkbox / radio
- **复杂控件**：
  - **Select**：下拉选择、单选、键盘导航、与 native &lt;select&gt; 类似 a11y
  - **Combobox**（v4 新名）：输入 + 自动完成 + 选项列表；最复杂的 widget
  - **Listbox**（隐藏在 Combobox / Select 内部）：选项列表本身的 a11y
  - **Form**：与 react-hook-form 集成的 wrapper（详见 P6.1）
- **Combobox 的复杂度**（详细）：
  - 输入框 + 选项列表 + 选中标签（可清除）
  - 异步加载选项（debounce）
  - 多选 vs 单选
  - 键盘导航：↓ ↑ Enter ESC Tab
  - aria-activedescendant 而不是真 focus（避免输入框失焦）
  - 屏幕阅读器实时读出可用选项数
  - 选中后 input 内容显示 / 清空策略
- **shadcn 的 Combobox 实现**：
  - 不是 Radix Combobox 直接 wrap（Radix 没有 Combobox primitive）
  - 用 cmdk（Pkmn / Linear 团队开源）作为 command palette + Combobox 基础
  - cmdk 提供 a11y 完整的 listbox
  - shadcn 在 cmdk 上加 Tailwind 样式
- **Form 控件 + react-hook-form 集成**（详见 P6.1）
- **关键代码示例方向**：
  - Combobox 异步加载（防抖 / 缓存）
  - Multi-select Combobox
  - RadioGroup 与 react-hook-form
  - Slider 范围选择
  - Checkbox indeterminate（"全选"按钮逻辑）
- **写作要点**：表单控件 a11y 比浮层更严格；强调 Combobox 是最难的 widget；shadcn Combobox 用 cmdk 是工程权衡（Radix 没自带）。

---

### P5 · shadcn CLI + Registry（2 章）

#### 5.1 CLI v4 + Visual Builder + components.json

- **核心问题**：shadcn CLI 内部怎么工作？components.json 是什么？v4 多框架 scaffold + Visual Builder 怎么用？
- **CLI v4 命令**：
  - <code>shadcn init</code>：起新项目（多框架 scaffold）
  - <code>shadcn add &lt;component&gt;</code>：加单个组件
  - <code>shadcn add @blocks/&lt;block&gt;</code>：加 block（组合组件）
  - <code>shadcn diff &lt;component&gt;</code>：看 upstream 改动
  - <code>shadcn build</code>：build 私有 registry
  - <code>shadcn create</code>：Visual Builder（开浏览器）
- **components.json 配置**：
  - 项目根的配置文件，shadcn CLI 读取
  - 决定 style（default / new-york）/ engine（radix / base-ui）/ path 别名 / Tailwind 配置位置
  - registry 自定义 URL（用私有 registry 时）
- **多框架 scaffold（v4 新）**：
  - Next.js / Vite / Laravel / React Router / Astro / TanStack Start
  - 每个框架自己模板（router 集成 / styling 配置 / dark mode 集成）
  - <code>shadcn init</code> 自动检测框架或问用户
- **Visual Project Builder**：
  - <code>shadcn create</code> 命令开浏览器到 ui.shadcn.com/create
  - 在浏览器配置：framework / style / base color / components / theme
  - 配完生成 zip 或 GitHub 仓库
  - 适合"起新项目快速 scaffold"场景
- **CLI 内部工作流**：
  - 读 components.json 配置
  - 从 registry（默认 ui.shadcn.com 或自定义）拉组件 source
  - 处理 import path（@/ vs ~/ 别名）
  - 处理依赖（auto npm install 缺失依赖）
  - 写文件到 components/ui/
- **关键代码示例方向**：
  - 完整 components.json 配置
  - 多框架 scaffold 对比（Next.js vs Vite vs TanStack Start）
  - Visual Builder 工作流
  - shadcn diff 用法 + 同步 upstream 改进
- **写作要点**：CLI 是 shadcn 模式的核心工具，详细讲；强调 components.json 是"项目级配置"。

#### 5.2 Registry 系统 + 自建私有 registry + monorepo 共享

- **核心问题**：Registry 是什么？怎么搭团队私有 registry？monorepo 里怎么共享 design system？
- **Registry 概念**：
  - Registry = "组件源码 + 元数据"的远程仓库
  - 默认 registry：ui.shadcn.com（含 50+ 组件 + 1300+ blocks）
  - 私有 registry：自建仓库 / GitHub raw / Vercel / S3 etc
- **Registry 数据格式**：
  - JSON schema（registry-item.json）
  - 字段：name / type / files（文件列表）/ dependencies（npm 包）/ devDependencies / registryDependencies（其他 shadcn 组件）/ tailwind / cssVars / docs
  - 完整 design system 可作为单 JSON 分发
- **Blocks（v4 新）**：
  - 比组件大、比 page 小
  - 例如 dashboard sidebar / login form / multi-step form / pricing table
  - 1300+ blocks（2026-02 起）
  - 同时有 Radix 和 Base UI 两个变体
- **自建私有 registry**：
  - <code>shadcn build</code> 把本地 components/registry/ 编译为 JSON
  - 部署到任何静态文件 server（Vercel / Cloudflare Pages / GitHub Pages）
  - 用户在 components.json 设 registry URL
  - 团队私有组件库分发新模式（替代 npm pack）
- **monorepo 共享**：
  - design-system 包：含 components/ui + Tailwind theme + tokens
  - 其他 app import：<code>@myorg/design-system/button</code>
  - 或 publish 私有 registry，每个 app shadcn add（自己复制源码）
  - 两种模式取舍：包模式（一处升级）vs 复制模式（独立演化）
- **关键代码示例方向**：
  - 自建 registry 的目录结构
  - registry-item.json 完整 schema
  - 部署私有 registry 到 Vercel
  - monorepo 包模式 vs 复制模式选型
- **写作要点**：本章是"团队级 design system 工具链"的核心；强调 registry 是 shadcn 模式的<strong>真正护城河</strong>（不是组件本身）；与 Tailwind P7.2 design system 工作流配合。

---

### P6 · 工程实践（2 章）

#### 6.1 Form 完整工作流（react-hook-form + Zod + shadcn Form）

- **核心问题**：怎么搭 React 表单？react-hook-form + Zod + shadcn Form 三方协同怎么用？
- **三方角色**：
  - **react-hook-form**：表单状态库（uncontrolled-first、性能极好、validate 集成）
  - **Zod**：TypeScript schema 校验库（type-first、与 RHF 通过 zodResolver 集成）
  - **shadcn Form**：把 RHF + Radix 控件 + a11y 包成 wrapper
- **shadcn Form 组件链**：
  - <code>&lt;Form&gt;</code>：FormProvider wrapper
  - <code>&lt;FormField&gt;</code>：单字段 controller + a11y id
  - <code>&lt;FormItem&gt;</code>：单字段容器
  - <code>&lt;FormLabel&gt;</code>：label，自动绑 input
  - <code>&lt;FormControl&gt;</code>：input 容器，传 a11y props 给 child
  - <code>&lt;FormDescription&gt;</code>：辅助说明
  - <code>&lt;FormMessage&gt;</code>：错误消息
- **典型 flow**：
  1. 定义 Zod schema（含校验规则）
  2. 用 z.infer 推导 TypeScript 类型
  3. RHF useForm + zodResolver
  4. shadcn Form 组件 render
  5. onSubmit 处理（含 Server Action 集成）
- **进阶：与 Server Actions 配合**：
  - useFormStatus / useActionState（详见 next P4.1）
  - 客户端 Zod 校验 + 服务端 Zod 再校验（双层防御）
  - 错误消息流回 client
- **进阶：动态字段 + useFieldArray**：
  - 数组字段（动态添加/删除 todo）
  - useFieldArray hook
  - 与 shadcn 组件配合
- **进阶：File upload + Multi-step form**：
  - FormData 处理
  - 多步表单状态保留
- **关键代码示例方向**：
  - 登录表单完整实现
  - 复杂表单（多 field + array + file upload）
  - Server Action 集成（含错误处理）
  - 表单 a11y 验证（NVDA / VoiceOver）
- **写作要点**：本章是 shadcn 项目最常踩坑的部分；强调 RHF + Zod + shadcn Form 是 2026 React 表单的事实标准。

#### 6.2 Theme + 暗色 + 多品牌 + Tailwind v4 集成

- **核心问题**：shadcn 默认 token 系统怎么设计？暗色 + 多品牌怎么做？Tailwind v4 @theme 集成？
- **shadcn 默认 token**：
  - CSS variables 定义在 globals.css（生成自 components.json 的 base color）
  - --background / --foreground / --primary / --secondary / --muted / --accent / --destructive 等
  - 每个 token 对应亮色 / 暗色两套值
  - 这套 token 与 Tailwind @theme 集成，自动生成 utility（bg-primary / text-foreground 等）
- **暗色模式**（与 Tailwind P5.1 配合）：
  - next-themes 控制 .dark class
  - shadcn 默认 .dark 选择器策略
  - shadcn theme builder（ui.shadcn.com/themes）：可视化选色生成 CSS variables
- **多品牌（white-label）**：
  - 每个品牌一套 .theme-x class（详见 Tailwind P7.2）
  - shadcn theme builder 生成多套 token
- **Tailwind v4 集成**：
  - shadcn v4 CLI 自动识别 Tailwind 版本
  - v4 项目用 CSS-first @theme（详见 Tailwind P3.2）
  - 老 v3 项目用 tailwind.config.js（兼容模式）
- **CVA + 设计 token 联动**：
  - shadcn 组件用 <code>bg-primary</code>（不是 <code>bg-blue-500</code>）
  - 切换 theme 自动跟随
  - 大型项目可在 cva variants 里用 token utility
- **关键代码示例方向**：
  - 完整 globals.css（所有 token + 暗色覆盖）
  - 多品牌切换（在 layout.tsx 加 .theme-x）
  - shadcn theme builder 生成的 CSS
  - 如何修改默认 base color（zinc → slate）
- **写作要点**：本章与 Tailwind P5.1 + P7.2 + P3.2 多次链回；强调 shadcn token 系统是<strong>Tailwind 时代 design system 的具体实现</strong>。

---

### P7 · 高级模式 + 决策（2 章）

#### 7.1 高级模式 · TanStack Table / Sonner / 虚拟列表 / cmdk

- **核心问题**：超出基础组件的场景怎么做？大表 / Toast / 虚拟列表 / 命令面板？
- **TanStack Table**（v8）：
  - Tanner Linsley 表格库
  - headless（与 Radix 哲学一致）
  - 与 shadcn 配合：用 shadcn Table（DOM 结构 + 样式）+ TanStack Table（headless 状态）
  - 支持：分页、排序、过滤、列调整、虚拟化、列固定
  - shadcn 提供完整 DataTable 模板（registry block）
- **Sonner**（Toast）：
  - emil_kowalski 出品
  - 替代 Radix Toast（shadcn 默认推荐 Sonner）
  - API 简单：<code>toast.success("Saved!")</code>
  - 多 toast 堆叠 / 进度 / promise（loading + success / error）
- **虚拟列表**：
  - **TanStack Virtual**：headless 虚拟化
  - **react-virtuoso**：组件式虚拟化
  - 大列表（10k+ 项）必备
  - 与 Radix Combobox / shadcn Table 配合
- **cmdk · 命令面板**：
  - Pkmn / Linear 团队开源
  - 命令面板（⌘K 弹窗 + 搜索 + 选项）
  - shadcn Command 组件基于 cmdk
  - 也可作为 Combobox 基础
- **其他高级**：
  - **Vaul**（Drawer，emil_kowalski 出品）：移动端 bottom sheet
  - **react-resizable-panels**：可调大小面板
  - **embla-carousel**：carousel
  - shadcn 都有对应封装
- **关键代码示例方向**：
  - DataTable 完整实现（含分页 + 排序）
  - Sonner 进阶（promise toast + 多 toast）
  - 虚拟化 Combobox（10k 选项）
  - cmdk 命令面板（搜索 + 嵌套）
- **写作要点**：本章是"shadcn 不止基础组件"的展示；选 4-5 个最常用高级模式；不是 catalog 罗列。

#### 7.2 决策树 + Base UI vs Radix + 何时不用 + 2027 展望

- **核心问题**：什么时候用 shadcn/ui 是对的？Base UI 还是 Radix？何时不用？2027 展望？
- **何时用 shadcn/ui**：
  - 起新 React 项目（首选）
  - 已用 Tailwind 想要 UI 库
  - 需要完整可定制（不能被 npm 升级破坏）
  - 团队接受 copy-paste 模式
- **何时不用**：
  - 已有 Mantine / MUI / Chakra 项目（迁移成本高）
  - 不写 React（shadcn React-only）
  - 不写 Tailwind（shadcn 默认 Tailwind 集成）
  - 严格反 utility-first 文化（用 Mantine）
- **Base UI vs Radix UI 选哪个**：
  - **Radix**（默认）：feature-rich、社区成熟、a11y 完整；大多数项目选
  - **Base UI**（MUI 出品）：bundle 更轻、API 略有差异；性能极致 / 与 MUI 生态共存的团队选
  - 用 components.json 切换：<code>"engine": "radix"</code> 或 <code>"engine": "base-ui"</code>
  - 大多数情况差异不大；2026 选 Radix 更稳
- **shadcn vs Catalyst（Tailwind UI 一部分）**：
  - shadcn：免费 + 开源 + 社区驱动
  - Catalyst：299$ + 商业 + Tailwind Labs 出品
  - 选 shadcn 大多数情况；商业项目能买可补 Catalyst 作设计参考
- **shadcn vs 自建组件库**：
  - 团队规模 5-20 人：用 shadcn（不重新发明）
  - 50+ 人 / 大型企业：自建（基于 Radix）以适应特殊设计系统
  - 极小团队 (1-2 人)：直接用 Mantine（少一层心智）
- **2027 展望**：
  - **shadcn 多框架完整**：shadcn-vue / shadcn-svelte / shadcn-solid 等成熟
  - **Visual Builder 进化**：从 init 扩展到组件级编辑（拖拽改样式）
  - **Registry 标准化**：成为 React 组件库分发新事实标准
  - **AI 辅助 component 生成**：从 Figma → shadcn 代码（已有 v0.dev）
  - **Radix 加更多 primitives**：v2 路线图含 Calendar / Toolbar 等
  - **Base UI 成熟**：性能优势让一部分团队切换
- **写作要点**：本章是<strong>实战决策章</strong>；给"看场景选什么"的决策矩阵；最后给"我推荐 X，因为 Y"的强观点。链回 Tailwind / Next.js / React / 测试 / pnpm-monorepo 主题。

---

## 写作风格 ——「写文章人，不是建筑师」

> （遵循已有约定）

- **章节内部**：6 段模板（速览 → 底层逻辑 → 应用场景 → 典型代码 → 常见陷阱 → 延伸阅读）
- **跨章引用**：用「短重述 + 链回」，不抄不省
- **图示**：组件树 / WAI-ARIA flow / Floating UI 定位 / Registry 数据流 全用 SVG
- **代码示例**：每章 5-10 段可运行的真实代码（基于 shadcn v4 + Radix 统一包）
- **加粗（克制）**：每章 ≤ 25 个 `<strong>`；每段不超过 1-2 个；不要靠加粗散点高亮
- **避免**：
  - 罗列所有 shadcn 组件 catalog（链回官方）
  - "架构师式"分类标签
  - 中立到没观点（每章必须给"我推荐 X，因为 Y"）
  - 抄 release notes（设计动机要回到 changelog 一手 + 作者访谈）
- **观点强度**：
  - 强观点（"copy-paste 模式是 React UI 库分发革命"，"自己手写 Dialog 几乎一定漏 a11y"）
  - 弱观点（"Base UI vs Radix 看场景"）
  - 不观点（"Mantine 也是好选择，存量项目继续"）
- **避免之前 Next 主题踩过的坑**：phase-card 内不要嵌套 `<a>` 标签（已存到 memory）。
- **shadcn 主题在 phase-card 描述里只用纯文本 + `<strong>` + `<code>`**。

---

## 不写的内容（明确划线）

- **不讲**：
  - 完整 shadcn 组件 catalog（链回官方）
  - 完整 Radix Primitives API 参考（链回官方）
  - 完整 react-hook-form / Zod 文档（仅讲与 shadcn 集成）
  - shadcn-vue / shadcn-svelte 等第三方移植（不在主题范围）
  - 完整 NVDA / VoiceOver 操作教程（a11y 章节点到为止）
- **链回但不重复**：
  - Tailwind utility / @theme（链回 tailwind 主题）
  - CVA + cn（链回 tailwind P6.1）
  - React Hooks / Server Components（链回 react / next 主题）
  - Server Actions（链回 next 主题）
  - 浏览器 DOM API（链回 browser-rendering 主题）
- **暂占位（待写主题）**：
  - 完整 a11y 测试工作流（NVDA / VoiceOver / axe-core）→ 待写测试主题扩展或独立 a11y 主题

---

## 路线图

- **Step 1**：本 outline.md 经用户审定 ← **当前**
- **Step 2**：建 8 个文件骨架（`shadcn/index.html` + 7 个 phase 目录的 `index.html`）
- **Step 3**：P1 章节正文（项目史 + 同代人横评，2 章）
- **Step 4**：P2 章节正文（Headless 哲学 + 受控/asChild，2 章）
- **Step 5**：P3 章节正文（浮层组件深度，1 章）
- **Step 6**：P4 章节正文（表单组件深度，1 章）
- **Step 7**：P5 章节正文（CLI + Registry，2 章）
- **Step 8**：P6 章节正文（Form 工作流 + Theme 集成，2 章）
- **Step 9**：P7 章节正文（高级模式 + 决策，2 章）+ 站点首页卡片改 done

---

## 与 index.html 卡片的对应

shadcn/ui + Radix 主题在站点首页的卡片描述（草拟）：
> 7 阶段 / 12 章：项目史 + 同代人横评（Headless / Styled / Hybrid 三阵营）+ Radix Headless 哲学 + WAI-ARIA a11y 标准 + 受控/asChild/Compound + 浮层组件深度（Floating UI / focus trap / scroll lock）+ 表单组件深度（Combobox / cmdk）+ CLI v4 多框架 scaffold + Registry 系统 + Form 工作流（react-hook-form + Zod）+ Theme + 暗色 + 多品牌 + 高级模式（TanStack Table / Sonner / 虚拟列表）+ 决策树。锁定 shadcn/cli v4 + Radix 统一包 + 双引擎（Radix / Base UI）。
