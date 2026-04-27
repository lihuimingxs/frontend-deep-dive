/* ==========================================================================
 * Deep Dive 学习站点客户端脚本
 *   - 主题切换（light/dark/system）
 *   - 代码块语法高亮（纯前端 tokenizer，零依赖；JS/TS 双语言）
 *   - 复制代码按钮
 *   - On-page TOC 激活态（IntersectionObserver）
 *   - 侧边栏激活态
 * ========================================================================== */

(function () {
  "use strict";

  // --- 主题切换 ---------------------------------------------------------------
  const THEME_KEY = "deep-dive.theme";
  const LEGACY_THEME_KEY = "js-info.theme"; // 兼容老 key
  const root = document.documentElement;

  function applyTheme(theme) {
    if (theme === "light" || theme === "dark") {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme");
    }
  }

  try {
    const stored = localStorage.getItem(THEME_KEY) || localStorage.getItem(LEGACY_THEME_KEY);
    if (stored) applyTheme(stored);
  } catch (_) {
    /* localStorage 不可用 */
  }

  function setupThemeToggle() {
    const btn = document.querySelector(".theme-toggle");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const current =
        root.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (_) {}
    });
  }

  // --- 语法高亮 ---------------------------------------------------------------
  // 单次正则扫描；JS 与 TS 共享同一份注释/字符串/数字识别逻辑，在关键字与类型上分流。
  //
  // JS 关键字（ECMAScript 保留字 + 字面量）
  const JS_KEYWORDS =
    "await|async|break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|from|function|if|import|in|instanceof|let|new|null|of|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield|true|false";

  // TS 在 JS 之上额外保留的上下文关键字
  const TS_EXTRA_KEYWORDS =
    "abstract|accessor|as|asserts|declare|enum|implements|infer|interface|is|keyof|namespace|never|override|readonly|satisfies|type|unique|unknown|using";

  const TS_KEYWORDS = JS_KEYWORDS + "|" + TS_EXTRA_KEYWORDS;

  // TS 类型基元（仅在类型位置出现，与 JS 标识符不冲突）
  const TS_TYPE_PRIMITIVES = "string|number|boolean|symbol|bigint|object|any";

  // 标准库 / 全局对象（JS 共用）
  const BUILTINS_BASE =
    "console|Math|Object|Array|String|Number|Boolean|Symbol|BigInt|Map|Set|WeakMap|WeakSet|Promise|Proxy|Reflect|Date|RegExp|Error|TypeError|RangeError|SyntaxError|JSON|Intl|Infinity|NaN|globalThis|window|document|fetch|Response|Request|Headers|URL|URLSearchParams|FormData|Blob|File|FileReader|AbortController|AbortSignal|setTimeout|setInterval|clearTimeout|clearInterval|queueMicrotask|requestAnimationFrame|structuredClone";

  // TS 工具类型（与内置同色，因为它们也是来自标准库的"类型"）
  const TS_UTILITY_TYPES =
    "Partial|Required|Readonly|Pick|Omit|Record|Exclude|Extract|NonNullable|Parameters|ConstructorParameters|ReturnType|InstanceType|ThisParameterType|OmitThisParameter|ThisType|Awaited|NoInfer|Uppercase|Lowercase|Capitalize|Uncapitalize";

  const BUILTINS_TS = BUILTINS_BASE + "|" + TS_UTILITY_TYPES;

  /**
   * 构造一个分组数为 8（JS）或 9（TS，多一个类型基元组）的 token 正则。
   * 捕获组顺序（注意 TS 比 JS 多一组）：
   *   1 注释 / 2 字符串 / 3 数字 / 4 关键字 / [5 TS 类型基元] / 5|6 内置 / 6|7 类 / 7|8 函数调用 / 8|9 属性
   */
  function makeTokenRE(keywords, typePrimitives, builtins) {
    const groups = [
      "(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)", // 1 注释
      "(`(?:\\\\.|\\$\\{[^}]*\\}|[^`\\\\])*`|'(?:\\\\.|[^'\\\\\\n])*'|\"(?:\\\\.|[^\"\\\\\\n])*\")", // 2 字符串
      "(\\b0[xX][0-9a-fA-F]+n?\\b|\\b\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?n?\\b)", // 3 数字
      "(\\b(?:" + keywords + ")\\b)", // 4 关键字
    ];
    if (typePrimitives) {
      groups.push("(\\b(?:" + typePrimitives + ")\\b)"); // 5 TS 类型基元
    }
    groups.push("(\\b(?:" + builtins + ")\\b)"); // 内置
    groups.push("(\\b[A-Z][A-Za-z0-9_$]*\\b)"); // 类/构造函数（首字母大写）
    groups.push("(\\b[a-zA-Z_$][\\w$]*)(?=\\s*\\()"); // 函数调用
    groups.push("(?<=\\.)([a-zA-Z_$][\\w$]*)"); // 属性访问
    return new RegExp(groups.join("|"), "g");
  }

  const TOKEN_RE_JS = makeTokenRE(JS_KEYWORDS, null, BUILTINS_BASE);
  const TOKEN_RE_TS = makeTokenRE(TS_KEYWORDS, TS_TYPE_PRIMITIVES, BUILTINS_TS);

  function escapeHTML(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function highlightWith(re, hasTypePrimitives, code) {
    const escaped = escapeHTML(code);
    return escaped.replace(re, function () {
      // arguments: match, ...captures, offset, fullStr
      const captures = Array.prototype.slice.call(arguments, 1, hasTypePrimitives ? 10 : 9);
      let i = 0;
      const com = captures[i++];
      const str = captures[i++];
      const num = captures[i++];
      const kw = captures[i++];
      const tp = hasTypePrimitives ? captures[i++] : null;
      const bi = captures[i++];
      const cls = captures[i++];
      const fn = captures[i++];
      const prop = captures[i++];

      if (com) return '<span class="tk-c">' + com + "</span>";
      if (str) return '<span class="tk-s">' + str + "</span>";
      if (num) return '<span class="tk-n">' + num + "</span>";
      if (kw) return '<span class="tk-k">' + kw + "</span>";
      if (tp) return '<span class="tk-tp">' + tp + "</span>";
      if (bi) return '<span class="tk-b">' + bi + "</span>";
      if (cls) return '<span class="tk-cl">' + cls + "</span>";
      if (fn) return '<span class="tk-f">' + fn + "</span>";
      if (prop) return '<span class="tk-pr">' + prop + "</span>";
      return arguments[0];
    });
  }

  function highlightAll() {
    // TS 块
    document.querySelectorAll("pre.code > code.lang-ts, pre.code > code.lang-typescript, pre.code > code.lang-tsx").forEach((code) => {
      if (code.dataset.hl === "done") return;
      code.innerHTML = highlightWith(TOKEN_RE_TS, true, code.textContent);
      code.dataset.hl = "done";
    });
    // JS 块（含未指定语言的 fallback）
    document
      .querySelectorAll(
        "pre.code > code.lang-js, pre.code > code.lang-javascript, pre.code > code.lang-jsx, pre.code > code:not([class])",
      )
      .forEach((code) => {
        if (code.dataset.hl === "done") return;
        code.innerHTML = highlightWith(TOKEN_RE_JS, false, code.textContent);
        code.dataset.hl = "done";
      });
  }

  // --- 复制按钮 ---------------------------------------------------------------
  function setupCopyButtons() {
    const blocks = document.querySelectorAll(".code-block");
    blocks.forEach((block) => {
      if (block.querySelector(".copy-btn")) return;
      const pre = block.querySelector("pre.code");
      if (!pre) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-btn";
      btn.textContent = "复制";
      btn.setAttribute("aria-label", "复制代码");
      btn.addEventListener("click", async () => {
        const code = pre.querySelector("code");
        const text = code ? code.textContent : pre.textContent;
        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = "已复制";
          setTimeout(() => (btn.textContent = "复制"), 1500);
        } catch (_) {
          btn.textContent = "失败";
          setTimeout(() => (btn.textContent = "复制"), 1500);
        }
      });
      block.appendChild(btn);
    });
  }

  // --- 生成 on-page TOC -------------------------------------------------------
  function buildOnPageTOC() {
    const tocEl = document.querySelector(".on-page-toc ul");
    if (!tocEl) return;

    const article = document.querySelector(".chapter");
    if (!article) return;

    const headings = article.querySelectorAll("h2, h3");
    const fragment = document.createDocumentFragment();
    let currentH2Ul = null;

    headings.forEach((h) => {
      if (!h.id) {
        h.id = h.textContent
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w\-一-龥]/g, "");
      }
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#" + h.id;
      // 跳过 h-num 徽标的文本
      const hNum = h.querySelector(".h-num");
      a.textContent = hNum ? h.textContent.replace(hNum.textContent, "").trim() : h.textContent.trim();
      li.appendChild(a);

      if (h.tagName === "H2") {
        fragment.appendChild(li);
        const nestedUl = document.createElement("ul");
        li.appendChild(nestedUl);
        currentH2Ul = nestedUl;
      } else if (currentH2Ul) {
        currentH2Ul.appendChild(li);
      } else {
        fragment.appendChild(li);
      }
    });
    tocEl.appendChild(fragment);
  }

  // --- 滚动激活态 -------------------------------------------------------------
  function setupScrollSpy() {
    const tocLinks = document.querySelectorAll(".on-page-toc a");
    if (!tocLinks.length) return;

    const idToLink = new Map();
    tocLinks.forEach((a) => {
      const id = decodeURIComponent(a.getAttribute("href").slice(1));
      idToLink.set(id, a);
    });

    const headings = document.querySelectorAll(".chapter h2, .chapter h3");

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          const link = idToLink.get(id);
          if (!link) return;
          if (entry.isIntersecting) {
            tocLinks.forEach((l) => l.classList.remove("active"));
            link.classList.add("active");
          }
        });
      },
      {
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0,
      },
    );

    headings.forEach((h) => io.observe(h));
  }

  // --- 侧边栏激活态 -----------------------------------------------------------
  function setupSidebarActive() {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;
    const current = location.pathname.split("/").pop() || "index.html";
    sidebar.querySelectorAll("a").forEach((a) => {
      const href = a.getAttribute("href");
      if (!href) return;
      const target = href.split("/").pop();
      if (target === current) {
        a.classList.add("active");
        // 滚动到可视区域
        requestAnimationFrame(() => {
          a.scrollIntoView({ block: "nearest" });
        });
      }
    });
  }

  // --- 启动 -----------------------------------------------------------------
  function init() {
    setupThemeToggle();
    highlightAll();
    setupCopyButtons();
    buildOnPageTOC();
    setupScrollSpy();
    setupSidebarActive();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
