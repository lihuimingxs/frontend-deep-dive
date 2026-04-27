# TypeScript 深度学习 · 章节大纲

> 本文件是 20 章 TS 学习手册的写作蓝本。每个 HTML 章节按本文档"按图施工"。
> 编写日期：2026-04-25 | 目标 TS 版本：5.x

## 元信息

- **目标 TS 版本**：TypeScript 5.x（重点覆盖 5.0+ 的 const type parameter、Stage 3 decorators、`satisfies`、`--moduleResolution bundler`，5.4+ 的 `NoInfer`，5.5+ 的推断式类型谓词）
- **覆盖目录**：Handbook v2 全量 + Reference 精选 + 工程化（tsconfig / 项目引用 / 声明文件）
- **源文档**：typescriptlang.org/docs（28 篇主页面 + TS 5.0 release notes）

### 整体节奏建议

- **连读组**：
  - 02 + 03（Everyday Types 必须紧跟 Narrowing）
  - 09 + 10 + 11（Conditional + Mapped + Template Literal 是类型操作三剑客）
  - 11 + 12（写完工具类型立刻看 satisfies + 实战，最有冲击力）
  - 18 + 19（声明文件和 tsconfig 强相关）
- **可独立跳读**：04 / 05 / 06 各自完备
- **建议先放再回看**：13 Modules 和 17 Type Compatibility 初读时只需扫一遍，写到 19 工程化时再深入

---

## Part 1 · Handbook 基础（6 章）

### 01 · The Basics 与类型系统本质

- **定位**：搞清楚"TypeScript 不是新语言"。覆盖 `basic-types.html` + `variable-declarations.html` 部分。回答"为什么编译通过却线上还会爆炸"。
- **关键知识点**：
  - 静态类型 vs 动态类型的实际边界
  - 类型擦除（type erasure）：`.ts → .js` 编译产物里类型完全消失
  - `tsc` 三阶段：parse → check → emit；`noEmitOnError` 控制错误时是否仍输出 JS
  - Downleveling / `target` 与 polyfill 的区别（target 只降语法，不降运行时 API）
  - `let` / `const` / `var` 与块作用域、TDZ、循环捕获问题
  - 解构与展开的类型注解
  - Strictness 是一档档拨的：`strict`、`noImplicitAny`、`strictNullChecks`、`useUnknownInCatchVariables`
- **底层逻辑要点**：
  - **TypeScript 是 JavaScript 的"开发期约束"，不是"运行期保护"**：所有类型都不在运行时存在，意味着无法 `instanceof MyInterface`、无法 `typeof x === "Person"`、无法在生产代码里依赖类型做分支
  - **类型与值是两个独立命名空间**：同一个名字（如 `Foo`）可以同时是类型（编译期）和值（运行时），class 同时占两个，interface 只占类型，const 只占值——这是后续 `typeof` / `keyof` / 模块导入区分 `import type` 的根源
  - **编译通过 ≠ 安全**：`as` 强转、`any` 注入、外部 JSON、`!` 非空断言、第三方 `.d.ts` 错写都会让类型系统说谎
  - **strictness 是"还多少技术债"的开关**：关掉 `strictNullChecks` 就是放弃 90% 的 null 安全收益
- **应用场景**：
  - Express/Next.js handler 的请求体类型定义 + zod 兜底
  - 老 JS 项目渐进式迁移：`allowJs + checkJs + // @ts-check`
  - CI 中的 `tsc --noEmit` 作为类型守门员
- **陷阱**：
  - `any` 的传染性
  - `target: "ES5"` 配 `lib: ["ES2020"]` 时 polyfill 缺失
  - `var` 在 `for` 循环里捕获最终值
- **关联 JS 章节**：`02-advanced/01-scope-tdz`、`02-advanced/02-closures`
- **预估字数**：3500-4500

### 02 · Everyday Types（最常用的 80%）

- **定位**：覆盖 `everyday-types.html` + `variable-declarations.html`。
- **关键知识点**：
  - 三个原始类型 `string` / `number` / `boolean`（小写！）
  - `bigint` / `symbol` / `undefined` / `null` / `void` / `never` / `object` / `unknown` / `any`
  - 数组的两种语法：`T[]` vs `Array<T>`
  - 对象类型字面量、`?`、`readonly`
  - Union types `A | B` 与 narrowing 的契约
  - Type alias vs Interface 的差异
  - Type assertion 三种形式
  - Literal types + `as const` 的字面量推断
  - Non-null assertion `x!`
- **底层逻辑要点**：
  - **TS 类型系统是结构化（structural）的，不是名义化（nominal）的**：`interface Foo` 和 `interface Bar` 字段一样就互相赋值兼容。这是和 Java/C# 最大的认知差
  - **`type` 和 `interface` 不是风格选择，是能力选择**：interface 能 declaration merge + extends 链可读；type 能描述 union / 元组 / 映射 / 条件等任意形态。**默认对象用 interface，组合用 type**
  - **`unknown` 是 `any` 的安全替代品**：必须先 narrow 才能用。catch 块、JSON.parse 返回、跨边界数据 → `unknown`
  - **literal type 是"窄到只能取一个值"**，`as const` 触发 literal inference
- **应用场景**：
  - React Props：interface + variant union
  - API 响应：interface 方便扩展
  - 配置对象：`as const` 锁定 literal
- **陷阱**：
  - 写 `String` / `Number`（大写）误以为是原始类型
  - `let x = "hello"` 推断 `string`，`const x = "hello"` 才推断 `"hello"`
  - excess property check 只在对象字面量直接传入时触发
  - `as` 不是运行时转换
- **关联 JS 章节**：`01-fundamentals/01-types`、`02-advanced/05-prototype`
- **预估字数**：4000-5000

### 03 · Narrowing 与控制流分析

- **定位**：覆盖 `narrowing.html`。理解 TS 的"类型流动"。
- **关键知识点**：
  - 七大 narrowing 手段：`typeof`、truthiness、equality、`in`、`instanceof`、assignment、control flow analysis
  - User-defined type guard：`function isFish(x): x is Fish`
  - Assertion function：`function assertIsString(x): asserts x is string`
  - Discriminated union（tagged union）
  - `never` 类型与 exhaustiveness checking
  - **TS 5.5 推断式 type predicate**：filter 回调里 `(x): x is T` 自动推断
- **底层逻辑要点**：
  - **TS 在每个语句位置都维护一份"当前类型环境"**：control flow analysis 让 `if (x === null) return; x.foo()` 中第二行的 `x` 自动收窄。这不是"代码分析"，而是"在 AST 每个节点都有一张类型快照"
  - **discriminated union 是把"运行时分支判断"和"类型分支判断"合一的设计**：React useReducer action、Redux action、Result<T, E>、AST 节点都依赖这个模式
  - **`never` 是兜底哨兵**：新增一个 union 成员忘了处理时编译期就拦住——TS 静态保障最强的一招
  - **type predicate 是"我用运行时逻辑承诺一个类型"**：TS 信任开发者，承诺撒谎就是埋雷
- **应用场景**：
  - Result/Either：`type Result<T> = { ok: true; value: T } | { ok: false; error: string }`
  - Redux action：discriminated union + `never` 防漏处理
  - `xs.filter((x): x is string => x !== null)`
- **陷阱**：
  - `typeof null === "object"`
  - 闭包中的 narrowing 失效
  - 谓词撒谎
  - `strictNullChecks` 关闭时 narrow 系统几乎全废
- **关联 JS 章节**：`03-async/05-async-await`（异步回调中的闭包陷阱）
- **预估字数**：4500-5500

### 04 · Functions（函数类型的全部维度）

- **定位**：覆盖 `functions.html`。
- **关键知识点**：
  - Function type expression：`(a: string) => void`
  - Call signature & construct signature
  - 泛型函数 + 约束（`<T extends Foo>`）
  - Optional vs default parameter
  - Rest parameter / argument
  - Function overload：多 signature + 一个 implementation
  - `this` 参数：`function f(this: User, ...)`
  - 返回类型：`void` / `unknown` / `never` / `object` / `Function`
  - Parameter destructuring 的类型注解
- **底层逻辑要点**：
  - **`void` 不等于"返回 undefined"**：`void` 返回类型上下文允许函数返回任意值，是为了兼容 `xs.forEach(x => xs2.push(x))`
  - **`never` 是"永不返回"**：抛错、死循环、process.exit；`never` 是所有类型的子类型
  - **Overload signature 不参与实现**：调用方只看 overload，所以重载常会"实现签名宽松+对外签名精确"
  - **泛型在 TS 中是延迟绑定**：类型实参在使用点确定，不是定义点
  - **"如果一个类型参数只出现一次，几乎肯定不需要它"**（官方守则）
- **应用场景**：
  - Express middleware：`(req, res, next) => void` 的 `void` 让 handler 可 `return res.json()`
  - ORM 查询函数：`function find<T>(where: Partial<T>): Promise<T[]>`
  - React 事件 handler
- **陷阱**：
  - 把 `void` 当 `undefined` 用
  - Overload 顺序错误
  - 用泛型表达 union（不如直接 `string | number`）
  - `Function` 类型相当于半个 `any`，禁止使用
- **关联 JS 章节**：`02-advanced/03-this`、`03-async/05-async-await`
- **预估字数**：4500-5500

### 05 · Object Types（对象/数组/元组的细节）

- **定位**：覆盖 `objects.html`。
- **关键知识点**：
  - 属性修饰符：`?`、`readonly`
  - Index signature：`[key: string]: T`
  - Excess property check：何时触发、三种绕过方式
  - Type extension：`interface A extends B, C` vs `type A = B & C`
  - Generic object types：`Box<T>`
  - `Array<T>` / `ReadonlyArray<T>` / `readonly T[]`
  - Tuple：`[string, number]`、optional element、rest element、`readonly [...]`
  - `as const` 推断为 readonly tuple
- **底层逻辑要点**：
  - **`readonly` 是"作者意图标注"，不是运行时保护**
  - **Index signature 限制了所有显式属性必须兼容**：`[k: string]: number` 后再加 `name: string` 会报错
  - **Tuple 是"长度和位置都被锁住的数组"**：JS 运行时仍是普通数组。React `useState` 返回 `[T, Dispatch<SetStateAction<T>>]`
  - **interface extends vs type intersection**：extends 检查冲突立刻报错；`&` 静默把冲突属性变成 `never`
  - **excess property check 是给"立即字面量"的特别保护**：因为它最像拼写错误的场景
- **应用场景**：
  - React `useState<T>` readonly tuple
  - 配置对象 `as const` 深 readonly
  - ORM model + `Partial<User>` / `Pick<User>`
- **陷阱**：
  - `readonly Foo[]` 不能传给 `Foo[]`（变型方向）
  - `[k: string]: T` 让所有显式字段必须是 T 子类型
  - tuple `.push()` 仍能添加元素
  - intersection 冲突属性变 `never`
- **关联 JS 章节**：`02-advanced/05-prototype`
- **预估字数**：4000-5000

### 06 · Classes（类的所有 TS 增强）

- **定位**：覆盖 `classes.html`。
- **关键知识点**：
  - 字段、字段初始化、`readonly`
  - 构造器、`strictPropertyInitialization`、definite assignment `name!: string`
  - Getter / setter（4.3+ 可不同类型）
  - 继承：`extends`、`implements`、Liskov substitution
  - 可见性修饰符：`public` / `protected` / `private`（软隐私 vs ES `#field` 硬隐私）
  - Static 成员
  - Generic class
  - `this` 类型与 `this is X` type guard
  - Parameter properties：`constructor(public readonly x: number)` 简写
  - Abstract class、abstract construct signature
  - Class expression
- **底层逻辑要点**：
  - **TS 的 `private` 是编译期约定，运行时仍可访问；`#field` 是 ES 标准的硬隐私**
  - **`implements` 不创建结构关系，只验证已存在的结构**
  - **class 同时占据"类型"和"值"两个命名空间**：`typeof C` 拿 constructor type，`InstanceType<typeof C>` 拿 instance
  - **Liskov 在 TS 里是结构性的**：`strictFunctionTypes` 才严格
  - **abstract class 的 constructor type 不能 `new`**
- **应用场景**：
  - NestJS controller / service（装饰器 + DI + 类）
  - ORM Entity 类（TypeORM、MikroORM）
  - 状态机基类
- **陷阱**：
  - 字段初始化顺序：基类构造器调用了被子类 override 的方法
  - `private` field 在 JSON.stringify 仍输出
  - `this` method 取值赋值后丢失绑定
  - `strictPropertyInitialization` + 工厂方法初始化的折中
- **关联 JS 章节**：`02-advanced/06-class`、`02-advanced/03-this`
- **预估字数**：5000-6000

---

## Part 2 · 类型操作（6 章，核心）

> ⚠️ TS 真正的"高级"区域。从 07 开始难度陡升，建议读者先把 Part 1 完整消化。

### 07 · Generics（泛型的全谱）

- **定位**：覆盖 `generics.html`。后续所有类型操作的基础。
- **关键知识点**：
  - 基础语法 `function f<T>(x: T): T`
  - 类型推断 vs 显式实参 `f<string>("a")`
  - Generic interface / type / class
  - 约束 `T extends Foo`
  - 用类型参数约束另一个类型参数：`<T, K extends keyof T>`
  - Class type generic：`function create<T>(c: { new(): T }): T`
  - Generic parameter defaults：`<T = string>`
  - **Const type parameter（TS 5.0）**：`<const T>` 让传入对象自动按 readonly 字面量推断
  - **`NoInfer<T>`（TS 5.4）**：阻止某个位置参与推断
- **底层逻辑要点**：
  - **泛型不是"any 的代名词"，是"延迟绑定的具体类型"**：T 在调用处被某个具体类型替代，所有出现 T 的位置同步替换
  - **约束让类型参数获得能力**：`T extends { length: number }` 之后才能用 `arg.length`
  - **`keyof T` + 泛型是结构-类型双向桥**：把"取属性"这个运行时操作的类型也精确建模
  - **const type parameter 解决了"传入对象总被推断为可变 string"的痛点**
- **应用场景**：
  - Generic Repository：`Repo<T extends { id: string }>`
  - useQuery / fetchJson 等 wrapper：`fetch<T>(url): Promise<T>`
  - 类型安全的事件总线：`emit<K extends keyof Events>(name: K, payload: Events[K])`
- **陷阱**：
  - 把 T 当 `any` 用（如 JSON.parse(JSON.stringify(x))）
  - 过度泛型化（`<T extends string>` 然后只把 T 当 string 用）
  - 默认值与约束顺序：`<T extends Foo = Bar>` 中 Bar 必须满足 Foo
  - 推断失败时报"could not infer T"
- **关联 JS 章节**：无强相关
- **预估字数**：5000-6000

### 08 · keyof / typeof / Indexed Access（类型查询三件套）

- **定位**：合并 `keyof-types.html` + `typeof-types.html` + `indexed-access-types.html`。
- **关键知识点**：
  - `keyof T`：取所有属性名的 union
  - `typeof x`（type 上下文）：取出值的类型
  - `T[K]`：indexed access type
  - 联合 key：`T["a" | "b"]`
  - `T[keyof T]`：所有属性值的 union
  - 数组元素类型：`typeof arr[number]`
  - tuple 长度：`tuple["length"]`
- **底层逻辑要点**：
  - **`typeof` 是"值 → 类型"的桥**：把已存在的运行时常量"反向写"成类型，配合 `as const` 锁住字面量值
  - **`keyof` 配合泛型是"类型安全的反射"**：JS 里 `Object.keys(o).forEach(k => o[k])` 完全无类型；TS 用 `keyof` + `T[K]` 把 key 和 value 类型对齐
  - **indexed access 的 key 必须是类型**：值和类型不能跨界
  - **`keyof` 在 `[k: string]: T` 上返回 `string | number`**：JS 设计的妥协（对象 key 永远字符串化）
- **应用场景**：
  - 工具函数：`pick<T, K extends keyof T>(o: T, keys: K[]): Pick<T, K>`
  - 类型化的 i18n key：`type Key = keyof typeof messages`
  - Redux selector：`(s: State) => State["user"]["profile"]`
- **陷阱**：
  - `keyof` 一个 type alias 不能 declaration merge
  - `typeof` 不能用在表达式上
  - `T[keyof T]` 在 T 有 method 时会包括 method 类型
- **关联 JS 章节**：无
- **预估字数**：4000-5000

### 09 · Conditional Types 与 `infer`

- **定位**：覆盖 `conditional-types.html`。**TS 类型系统的"图灵完备"分水岭，最难章之一**。
- **关键知识点**：
  - 基础语法：`T extends U ? X : Y`
  - 在泛型函数返回类型中：`function f<T>(): T extends string ? "a" : "b"`
  - `infer` 关键字：`T extends Promise<infer R> ? R : T`
  - Distributive conditional types：union 输入会"分发"
  - 用 `[T] extends [U]` 阻止分发
  - 复杂 `infer`：从函数类型抽返回值、从数组抽元素、从字符串模板抽片段
- **底层逻辑要点**：
  - **conditional type 是 ternary 的类型版**，但 `extends` 不是"继承"而是"可赋值给"
  - **distributive 是默认开启的隐藏语义**：`T extends any ? T[] : never` 当 T = `string | number` 时分发为 `string[] | number[]`，不是 `(string | number)[]`。这是 90% "为什么我的 conditional type 不对"的根因
  - **`infer` 是"在条件位置打个洞"**：把模式匹配语法引入类型系统
  - **conditional type 有"tail recursion"上限**：递归 infer 字符串解析在 TS 4.5+ 才允许，仍有 ~1000 层栈限制
- **应用场景**：
  - 路由参数提取：`type Params<P> = P extends \`/${string}/:${infer K}\` ? K : never`
  - Promise 链解包：`Awaited<T>`
  - 函数柯里化的类型推导
- **陷阱**：
  - 分发性导致 `Exclude<T, U>` 的真正实现：`T extends U ? never : T`
  - `[T] extends [U]` 是显式关闭分发的常见 idiom
  - `infer` 不出现的位置始终落 false 分支
  - 太深的递归条件类型导致 `Type instantiation is excessively deep`
- **关联 JS 章节**：无
- **预估字数**：5500-6500（**最难章之一**）

### 10 · Mapped Types & Template Literal Types

- **定位**：合并 `mapped-types.html` + `template-literal-types.html`。
- **关键知识点**：
  - Mapped type 基础：`{ [K in keyof T]: T[K] }`
  - Modifier `+` / `-`：去除 `readonly`、去除 `?`
  - Key remapping `as`（TS 4.1+）
  - 用 `Exclude` / 条件类型在 mapping 中过滤 key
  - Template literal type：`\`${A}-${B}\``
  - Union 在插值位置 → 笛卡尔积
  - 内置字符串类型：`Uppercase` / `Lowercase` / `Capitalize` / `Uncapitalize`
- **底层逻辑要点**：
  - **Mapped type 是"对每个 key 做一次类型映射"的循环**：相当于类型层的 `Object.fromEntries`
  - **Key remapping `as` 改变了循环的输出 key**：配合 template literal 让 mapped type 变成"代码生成器"——`getXxx` setter 模式、`on${Event}` listener 全靠它
  - **Template literal type 在插值位置遇 union 自动分发笛卡尔积**：组合爆炸源头
  - **内置 `Uppercase` 等是 intrinsic**：编译器特殊实现
- **应用场景**：
  - `Partial<T>` / `Required<T>` / `Readonly<T>` 都是 mapped type
  - 自动生成 React form：`{ [K in keyof Form as `${K}Error`]: string }`
  - Tailwind 色板：`\`${Color}-${Shade}\``
  - 类型安全 i18n key
- **陷阱**：
  - mapped type 默认带过 `readonly`/`?`，加 `-readonly`/`-?` 才能去掉
  - key remapping 时要 `string & K`
  - 大 union 触发"组合爆炸"导致编译变慢
- **关联 JS 章节**：无
- **预估字数**：5000-6000

### 11 · Utility Types（标准库速查）

- **定位**：覆盖 `utility-types.html`。系统过一遍标准库，结合 09/10 看实现。
- **关键知识点**（按家族分组）：
  - **属性变换族**：`Partial` / `Required` / `Readonly` / `Pick` / `Omit` / `Record`
  - **union 操作族**：`Exclude` / `Extract` / `NonNullable`
  - **函数操作族**：`Parameters` / `ConstructorParameters` / `ReturnType` / `InstanceType` / `ThisParameterType` / `OmitThisParameter` / `ThisType`
  - **Promise**：`Awaited<T>`
  - **新增**：`NoInfer<T>`（TS 5.4）
  - **字符串**：`Uppercase` / `Lowercase` / `Capitalize` / `Uncapitalize`
- **底层逻辑要点**：
  - **每个 Utility 都能用前两章工具复现**：读 TS lib 源码（`lib.es5.d.ts`）是最好的练习
  - **`Awaited<T>` 是递归的**
  - **`NoInfer<T>` 防止"误推断"**：让另一个位置主导
  - **`ThisType<T>` 是少见的"上下文类型施加器"**：在对象字面量里影响 `this` 的推断
- **应用场景**：
  - DTO 转换：`type CreateUser = Omit<User, "id" | "createdAt">`
  - React Props 派生：`type ButtonProps = ComponentProps<"button"> & { variant: ... }`
  - Reducer 类型：`Parameters<typeof reducer>[1]`
- **陷阱**：
  - `Omit<T, K>` 不要求 K 是 keyof T
  - `Required<T>` 不会让 nested 字段也变 required
  - `Readonly<T>` 是浅 readonly
  - `Partial<T>` 与 `exactOptionalPropertyTypes: true` 时的微妙差异
- **关联 JS 章节**：无
- **预估字数**：4500-5500

### 12 · `satisfies` 操作符与组合艺术

- **定位**：综合实战章。`satisfies` 是 TS 4.9 引入的"赋值校验但不放宽推断"的关键工具。同时演示 09/10/11 的组合用法。
- **关键知识点**：
  - `satisfies` 的语义：约束 + 保留窄类型
  - `as const satisfies T` 模式
  - 类型注解 `: T` / 类型断言 `as T` / `satisfies T` 三者对比
  - Branded type / nominal type 模拟（intersection + unique symbol）
  - 类型谓词、assertion function 的高级模式
  - 用条件类型 + 模板字面量做 DSL
- **底层逻辑要点**：
  - **`x: T = value` 把 x 的类型变成 T**（推断被覆盖）；**`value as T` 强制断言**（安全性丧失）；**`value satisfies T` 校验形状但保留具体推断**——三者本质差异
  - **`satisfies` 是声明意图，不是改变类型**：`{ a: 1, b: 2 } satisfies Record<string, number>` 之后变量类型仍是 `{ a: 1; b: 2 }`，访问 `.a` 仍精确为 `1`
  - **branded type 是用结构系统模拟名义系统**：`type UserId = string & { __brand: "UserId" }`
- **应用场景**：
  - Tailwind 配置：`{ colors: {...} } as const satisfies Config`
  - 路由表：`{ "/users/:id": (req, ...) => ... } satisfies RouteMap`
  - 状态机定义
- **陷阱**：
  - 把 `satisfies` 当 `as` 用
  - 滥用 branded type 造成类型噪声
  - 组合 conditional + mapped + template literal 触发编译性能问题
- **关联 JS 章节**：无
- **预估字数**：4500-5500

---

## Part 3 · Reference（5 章）

### 13 · Modules（ES / CommonJS / Namespace 历史与现在）

- **定位**：覆盖 `modules.html` + variable-declarations 与模块相关部分。
- **关键知识点**：
  - 何时一个文件是模块：有 top-level `import` / `export` 之一
  - ES module 语法全谱：default、named、namespace import、re-export、side-effect import
  - `import type` / `export type` / inline `import { type X, fn }`（TS 4.5+）
  - CommonJS 互通：`import x = require("...")`、`module.exports = ...`
  - `esModuleInterop` / `allowSyntheticDefaultImports` 行为差异
  - `verbatimModuleSyntax`（TS 5.0）替代旧的 `importsNotUsedAsValues` / `preserveValueImports`
  - ⚠️ Namespace（旧名 internal module）—— **不推荐新代码使用**
  - ⚠️ Triple-slash directive `/// <reference path="..." />` —— 几乎只在 .d.ts 编写时偶用
- **底层逻辑要点**：
  - **ES module 是静态结构**：import/export 必须 top-level，所以 tree-shaking 才可能。CommonJS `require` 是运行时函数，无法静态分析
  - **`import type` 是"只在类型层引入"的语法**：编译产物里完全消失
  - **`esModuleInterop` 是修补 CJS/ESM 不兼容的运行时垫片**
  - **namespace 不是模块，是文件内/跨文件合并的命名空间**：在 ES module 时代是反模式
- **应用场景**：
  - Monorepo workspace alias（`@app/*` → `apps/app/src/*`）配 `paths`
  - 仅类型导入避免循环依赖
  - 兼容 CommonJS 库
- **陷阱**：
  - 没有 import/export 的 .ts 文件被当成全局脚本
  - 默认导出与命名导出混用导致 tree-shaking 失败
  - `esModuleInterop: true` 但库本身就是 ESM，反而出错
- **关联 JS 章节**：`04-modules/01-esm`、`04-modules/02-cjs-interop`
- **预估字数**：4500-5500

### 14 · Decorators（Stage 3 标准 vs Legacy）

- **定位**：覆盖 `decorators.html` + TS 5.0 release notes。**TS 改动最剧烈的一块**。
- **关键知识点**：
  - **TS 5.0 标准 decorator（Stage 3）**：默认启用、参数为 `(value, context)`、context 富含元数据、`addInitializer`、不再依赖 `reflect-metadata`
  - **Legacy decorator（`experimentalDecorators: true`）**：仍受支持，5 类（class / method / accessor / property / parameter）、参数 `(target, propertyKey, descriptor)`、配 `reflect-metadata` + `emitDecoratorMetadata`
  - 两种 decorator **不能混用**
  - Decorator factory（返回 decorator 的高阶函数）
  - 装饰器组合的求值顺序：工厂从上到下，装饰器从下到上
  - 标准 decorator 不支持 parameter decorator 和 metadata 反射（NestJS / TypeORM 仍依赖 legacy 的根本原因）
- **底层逻辑要点**：
  - **legacy decorator 设计早于 ES 标准化**，行为依赖 property descriptor
  - **Stage 3 standard decorator 把元数据从"装饰目标"换成"context 对象"**：更纯函数化、更适合 tree-shaking
  - **DI 框架短期内还会留在 legacy**，因为依赖 `emitDecoratorMetadata` 在运行时拿参数类型
  - **TC39 decorator metadata proposal 到位后 legacy 才能彻底淘汰**
- **应用场景**：
  - NestJS Controller / Service / DI（legacy）
  - TypeORM Entity / Column（legacy）
  - 业务横切日志/缓存/重试（Stage 3 即可）
- **陷阱**：
  - ⚠️ legacy 与 standard 混用 → 立即编译失败
  - ⚠️ Stage 3 不支持 parameter decorator
  - `reflect-metadata` 必须在入口 import
  - 装饰器执行顺序与读者直觉相反
- **关联 JS 章节**：`02-advanced/06-class`、`02-advanced/07-private-decorators`
- **预估字数**：5000-6000

### 15 · Declaration Merging / Mixins / Symbols

- **定位**：合并 `declaration-merging.html` + `mixins.html` + `symbols.html`。
- **关键知识点**：
  - **Declaration merging**：interface 多次声明合并、namespace 合并、namespace + class/function/enum 合并、module augmentation（`declare module`）、global augmentation（`declare global`）
  - **Mixin 模式**：`<TBase extends new (...args: any[]) => {}>(Base: TBase) => class extends Base { ... }`
  - **Symbol & unique symbol**：`Symbol()`、`unique symbol` 类型只能给 `const` / `readonly static`、well-known symbol
- **底层逻辑要点**：
  - **declaration merging 是 TS 给"全局类型扩展"和"第三方库 patch"留的逃生口**：增 Express Request 字段、加 jQuery 插件方法、扩 Window 全局都靠它
  - **mixin 是"组合优于继承"的 TS 实现**：返回类工厂避免菱形继承，类型上靠 intersection 累积
  - **`unique symbol` 把"运行时唯一性"提升到类型层**：每个 symbol 是独立的类型
- **应用场景**：
  - Express middleware 加 `req.user`：module augmentation
  - 给第三方库加方法/类型补丁
  - Mixin 用于游戏开发、装饰器替代场景
  - Symbol 做 action type、避免冲突的内部 key
- **陷阱**：
  - declaration merge 跨包时必须在同一 typeRoot 才生效
  - mixin 静态成员丢失类型信息
  - `Symbol("foo") === Symbol("foo")` 永远 false
  - `unique symbol` 必须 const
- **关联 JS 章节**：`01-fundamentals/11-symbol`、`02-advanced/05-prototype`
- **预估字数**：4500-5500

### 16 · Iterators / Generators / JSX

- **定位**：合并 `iterators-and-generators.html` + `jsx.html`。
- **关键知识点**：
  - `Iterable<T>` / `Iterator<T>`、`Symbol.iterator`、内置可迭代类型
  - `for...of` vs `for...in`
  - 生成器 `function* g(): Generator<T, TReturn, TNext>`、async generator
  - downlevel iteration（target ES5 时需 `--downlevelIteration`）
  - **JSX 部分**：`.tsx` 扩展名、`jsx` 配置（preserve / react / react-jsx / react-native / react-jsxdev）
  - `JSX.IntrinsicElements`、`JSX.Element`、`React.FC` / function component 类型
  - .tsx 文件中不能用 `<T>x` 断言，改用 `as T`
  - `jsxImportSource` 自定义 runtime
- **底层逻辑要点**：
  - **iterable protocol 是 ES 的运行时约定**，TS 用 `Iterable<T>` 类型化它
  - **JSX 不是 TS 特有，是把 XML 字面量编译为函数调用的语法糖**
  - **`react-jsx` mode（17+ 新 JSX runtime）减少了"必须 import React"的样板代码**
- **应用场景**：
  - 自定义可迭代对象（流式 API、分页迭代器）
  - async generator 处理 SSE 流
  - React 项目 jsx 配置
- **陷阱**：
  - `for...in` 在 array 上枚举字符串 key
  - `target: "ES5"` 不开 `downlevelIteration`
  - `.tsx` 中尖括号断言被理解为 JSX 标签
  - `JSX.IntrinsicElements` 自定义元素需要 module augmentation
- **关联 JS 章节**：`01-fundamentals/13-iterators`、`03-async/05-async-await`
- **预估字数**：4000-5000

### 17 · Type Compatibility & Type Inference（结构化类型的内部机制）

- **定位**：合并 `type-compatibility.html` + `type-inference.html`。**最难章之一，建议放在 Part 3 末尾**。
- **关键知识点**：
  - 结构化（structural）vs 名义化（nominal）
  - 对象兼容性：源至少要有目标所有 required 字段
  - Function 兼容性：参数 contravariant，返回值 covariant
  - Method bivariance（默认）vs `strictFunctionTypes` 下的严格模式
  - Class 兼容性：private/protected 影响兼容
  - Enum 兼容性
  - Generic 兼容性
  - 特殊类型互通：`any` / `unknown` / `never` / `void`
  - **Type inference**：best common type、contextual typing、推断顺序
- **底层逻辑要点**：
  - **协变/逆变/双变/不变是函数类型兼容的核心**。直觉法则：**输入位置变窄不安全（应逆变），输出位置变窄安全（可协变）**
  - **method bivariance 是 TS 故意留的不安全口子**：为了让 `Array<Dog>` 传给 `Array<Animal>` 通过。`strictFunctionTypes` 关掉这个口子，但只对函数类型生效，不对方法签名生效
  - **contextual typing 是"由位置决定参数类型"**：脱离上下文（赋给 `const handler = e => ...`）就退化成 `any`
  - **best common type 不会自动找父类**：`[new Rhino(), new Snake()]` 推断为 `(Rhino | Snake)[]` 而非 `Animal[]`
- **应用场景**：
  - 函数式工具库（lodash-style）的类型设计
  - 第三方库类型 patch 时理解为什么自己的类型"不兼容"
  - 写 react-hook-form / zod 等高泛型库的类型基础
- **陷阱**：
  - 把 `(x: Animal) => void` 当作 `(x: Dog) => void` 的子类型
  - 仅 private 字段命名相同但来源不同的两个类不兼容
  - inference 失败时报"could not infer T"
  - 数组字面量推断到 union 而非父类
- **关联 JS 章节**：`02-advanced/05-prototype`
- **预估字数**：5000-6000

---

## Part 4 · 工程化（3 章）

### 18 · Declaration Files（.d.ts 编写与消费）

- **定位**：覆盖 `declaration-files/introduction.html`（含 ambient module、global declaration 实战）。
- **关键知识点**：
  - 何为 `.d.ts`：只含类型、不含值实现、`tsc` 编译时不输出
  - 消费：`@types/*` 包、`types` / `typeRoots` 配置
  - 编写 module declaration：`declare module "lib-name"`
  - Ambient declaration：`declare global` / `declare const` / `declare function`
  - `declare module "*.svg"` 通配 module
  - 三斜线指令 `/// <reference types="..." />`（**遗留为主**）
  - 发布带类型的 npm 包：`types` 字段、`exports` 中的 types condition
- **底层逻辑要点**：
  - **`.d.ts` 是 TS 与"未类型化的 JS 世界"之间的桥**：`.d.ts` 写错时编译期一切正常，运行时炸
  - **ambient declaration 的"事实承诺"性质**：`declare const FOO: string` 告诉 TS"我担保这个变量运行时存在"
  - **module augmentation 是工程项目最高频用法**：给 Express Request、next-auth Session、styled-components Theme 加业务字段
- **应用场景**：
  - 为内部 JS 工具包写 `.d.ts` 渐进迁移
  - Webpack/Vite 资源 import 全局声明（svg、png、css module）
  - DefinePlugin 注入的环境变量类型
  - npm 包发布带类型
- **陷阱**：
  - `.d.ts` 中写运行时代码（被静默忽略）
  - `declare global` 必须在 module 内
  - `@types/foo` 与库实际版本不匹配
  - 全局类型污染
- **关联 JS 章节**：无
- **预估字数**：4500-5500

### 19 · 项目配置（tsconfig.json + Project References）

- **定位**：合并 `tsconfig-json.html` + `tsconfig` 全量参考 + `project-references.html`。**最贴近实战的一章**。
- **关键知识点**（按家族）：
  - **项目结构**：`extends`（5.0+ 多继承数组）、`files` / `include` / `exclude`
  - **strict 家族**：`strict`、`noImplicitAny`、`strictNullChecks`、`strictFunctionTypes`、`strictBindCallApply`、`strictPropertyInitialization`、`alwaysStrict`、`useUnknownInCatchVariables`、`noImplicitThis`、`noImplicitReturns`、`noFallthroughCasesInSwitch`、`exactOptionalPropertyTypes`、`noUncheckedIndexedAccess`
  - **module 家族**：`target` / `module` / `moduleResolution`（含 `bundler`，TS 5.0）、`paths` / `baseUrl`、`esModuleInterop`、`isolatedModules`、`verbatimModuleSyntax`
  - **output 家族**：`outDir` / `rootDir` / `declaration` / `declarationMap` / `sourceMap` / `incremental` / `composite` / `tsBuildInfoFile`
  - **JSX**：`jsx`（react-jsx 推荐）、`jsxImportSource`
  - **lib / types**
  - **Project References**：`references`、`composite: true`、`tsc -b` 构建模式
- **底层逻辑要点**：
  - **`strict` 是一组检查的总开关**：相当于把 8-9 个独立 flag 全部打开
  - **`module` 决定输出的模块格式**，**`moduleResolution` 决定 import 时如何找文件**——是两件事。`bundler` 是 TS 5.0 给 Vite/webpack/esbuild 用的
  - **`paths` 只影响 `tsc` 类型检查，不影响运行时**：webpack/Vite/Next.js 必须各自配 alias
  - **Project References 解决"大型 monorepo 的增量构建"**：每个子项目独立 build、缓存到 `.tsbuildinfo`
  - **`isolatedModules` 是 babel/swc/esbuild transpile 的前提条件**
- **应用场景**：
  - Next.js / Vite / Webpack 项目的 tsconfig 模板
  - bun monorepo 用 Project References + workspace
  - 严格度从 0 开始迁移
- **陷阱**：
  - `paths` 在运行时不被解析
  - `target: "ES5"` 时 `Map.iterator` 等需要 `downlevelIteration`
  - `composite: true` 强制 `declaration`
  - `noUncheckedIndexedAccess` 引入大量 `| undefined`
  - `verbatimModuleSyntax` 要求所有类型导入显式标 `type`
- **关联 JS 章节**：无
- **预估字数**：5500-6500

### 20 · Migration & Interop（落地与并行世界）

- **定位**：实战章。整合：JS → TS 渐进迁移 / CommonJS ↔ ESM 互通 / 类型与运行时安全的边界 / 与 zod-runtime 校验的协作。
- **关键知识点**：
  - JS → TS 迁移分级：`allowJs` + `checkJs` + `// @ts-check` → 整体改 .ts → 严格度逐步加码
  - `// @ts-expect-error` vs `// @ts-ignore`
  - `noEmit` + bundler 转译模式（Babel / SWC / esbuild）下的职责切分
  - CJS / ESM 互通：`esModuleInterop`、`module: "nodenext"` 强制 `.js` 后缀、`type: "module"` 包配置
  - 类型与运行时校验的"接缝"：fetch 响应、process.env、用户输入要 zod 兜底
  - TS 5.x 新增工程实用特性：`satisfies`、`const T`、Stage 3 decorator、`using` declaration（TS 5.2）
  - 工具链组合：tsc / vite-tsc / next build / bun / tsx / ts-node / nodenext
- **底层逻辑要点**：
  - **类型系统不是运行时验证器**：JSON.parse、外部 API、process.env 这些"信任边界"位置必须用 zod 等 runtime 验证
  - **bundler-only 模式（Vite + Next.js）下 tsc 只做 type check**，bundler 自己 transpile，于是 `isolatedModules` 必须开
  - **CJS/ESM 是 Node 生态最痛苦的双世界**：互通靠 `esModuleInterop` + dynamic `import()` + `nodenext` + 包的 `exports` 字段
  - **`// @ts-expect-error` 优于 `@ts-ignore`**：错误修复后会主动告警
- **应用场景**：
  - 老 React/Express 项目分阶段迁移
  - Monorepo 中部分包 ESM、部分 CJS 的互通
  - Next.js 16 / Bun / Node 22 + ESM 全栈
  - tRPC / Hono / Drizzle 这种"端到端类型安全"项目的接缝
- **陷阱**：
  - 升级到 ESM 后忘记 `.js` 后缀
  - `@ts-ignore` 满天飞
  - `process.env.FOO` 类型 `string | undefined`，不验证就用炸
  - `tsc` 编译过 + bundler 编译炸
  - 老库声明 `module.exports = function ...` 配 `esModuleInterop` 行为差异
- **关联 JS 章节**：`04-modules/01-esm`、`04-modules/02-cjs-interop`
- **预估字数**：5000-6000

---

## 写作约定与风险提示

### 必须强调"底层逻辑"的章节（写不深就废）

- **03 Narrowing**：control flow analysis 与 discriminated union 的内在机制
- **07 Generics**：延迟绑定、约束的本质
- **09 Conditional Types**：分布式行为、`infer` 的模式匹配性质——这章写不透读者就废
- **10 Mapped Types**：modifier 的二进制位语义、key remapping 是代码生成器
- **17 Type Compatibility**：协变/逆变/双变是写函数式库、第三方类型 patch 的元能力

### 可以偏向应用的章节

- **02 Everyday Types**、**05 Object Types**、**11 Utility Types**、**16 Iterators/JSX**

### 必须明确标注 ⚠️ 的内容

- **Legacy decorator**（`experimentalDecorators`）—— "NestJS / TypeORM 仍依赖，新代码尽量用 Stage 3"
- **Namespace / internal module** —— ES module 时代的反模式
- **Triple-slash directive** —— 仅 `.d.ts` 内偶用
- **`importsNotUsedAsValues` / `preserveValueImports`** —— 5.0 起被 `verbatimModuleSyntax` 替代
- **`prefix-style` type assertion `<T>x`** —— `.tsx` 不可用
- **Method bivariance** —— 设计上的不安全

### 必须提到的 TS 5.x 新特性

| 特性                          | 版本 | 章节 |
| ----------------------------- | ---- | ---- |
| `const` type parameter        | 5.0  | 07   |
| Stage 3 decorator             | 5.0  | 14   |
| 多 `extends`                  | 5.0  | 19   |
| `satisfies`                   | 4.9  | 12   |
| `--moduleResolution bundler`  | 5.0  | 19   |
| `NoInfer<T>`                  | 5.4  | 11   |
| 推断式 type predicate         | 5.5  | 03   |
| `using` / `Symbol.dispose`    | 5.2  | 20   |
| inline `import { type X }`    | 4.5  | 13   |

### 跨章节强依赖

- **12 Utility Types** 必须在 09 + 10 之后
- **17 Type Compatibility** 适合放在最后读
- **14 Decorators** 需要 06 Class 已学透
- **19 tsconfig** 需要 13 Modules + 18 Declaration Files 都过过
- **20 Migration** 是综合章，所有章节都是它的引用

---

## 子代理报告

**最难写、最容易翻车**：09 Conditional Types、10 Mapped Types、17 Type Compatibility。如果只罗列语法读者会感觉"看完了什么都没记住"，必须把"为什么这样设计 + 在标准库中的实证"讲透。

**可以快速产出**：02 Everyday Types、05 Object Types、11 Utility Types、16 Iterators/JSX、18 Declaration Files。套路成熟、官方文档密度高、概念正交性好。

**优先级建议（时间紧张）**：先交付 **01-03**（基础三章构成完整心智模型）+ **07-12**（类型操作六章是 TS 真正的差异化价值）+ **19**（tsconfig 立刻能用）。**14 / 15 / 16** 可先精简到 60% 篇幅。**17** 可作为"高级附录"放最后。
