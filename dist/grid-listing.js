var C = Object.defineProperty;
var L = (r, t, e) => t in r ? C(r, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : r[t] = e;
var h = (r, t, e) => L(r, typeof t != "symbol" ? t + "" : t, e);
import { existsSync as I, watch as P, readFileSync as k, readdirSync as $ } from "fs";
import { relative as B, basename as F, join as x, posix as A } from "path";
const N = (r, t, e, s, i, a) => {
  const o = Math.max(1, Math.ceil((r + i) / (e * a + i))), n = Math.max(o, Math.floor((r + i) / (e / a + i))), l = Math.max(1, Math.ceil((t + i) / (s * a + i))), d = Math.max(l, Math.floor((t + i) / (s / a + i))), c = i > 0 ? Math.floor(r / i) + 1 : Number.POSITIVE_INFINITY, w = i > 0 ? Math.floor(t / i) + 1 : Number.POSITIVE_INFINITY, b = Math.max(1, Math.floor(r)), S = Math.max(1, Math.floor(t)), g = Math.min(n, c, b), y = Math.min(d, w, S);
  return { cMin: o, cMax: g, rMin: l, rMax: y };
}, O = (r, t, e, s, i, a = {}) => {
  const o = a.weightSize ?? 1, n = a.weightAR ?? 1, l = a.alpha ?? 1.5, d = e / s, c = N(r, t, e, s, i, l), w = 1, b = 1, S = Math.min(c.cMax, a.maxCols ?? Number.POSITIVE_INFINITY), g = Math.min(c.rMax, a.maxRows ?? Number.POSITIVE_INFINITY);
  let y = null;
  const T = (u, m) => {
    if (u < w || m < b || u > S || m > g) return;
    const M = r - (u - 1) * i, E = t - (m - 1) * i;
    if (M <= 0 || E <= 0) return;
    const f = M / u, p = E / m;
    if (a.integerBlockSize && (!Number.isInteger(f) || !Number.isInteger(p)) || f < e / l || f > e * l || p < s / l || p > s * l) return;
    const v = Math.hypot((f - e) / e, (p - s) / s), D = Math.abs(f / p - d) / d, R = o * v + n * D;
    (!y || R < y.score) && (y = { width: f, height: p, cols: u, rows: m, score: R, sizeError: v, arError: D });
  };
  for (let u = c.cMin; u <= S; u++) {
    const m = r - (u - 1) * i;
    if (m <= 0) break;
    const M = m / u;
    if (M < e / l || M > e * l) continue;
    const E = (t + i) / (i + M / d), f = /* @__PURE__ */ new Set();
    for (let p = -2; p <= 2; p++) {
      const v = Math.round(E + p);
      v >= b && v <= g && f.add(v);
    }
    f.add(c.rMin), f.add(g);
    for (const p of f) T(u, p);
  }
  if (!y)
    for (let u = c.cMin; u <= S; u++)
      for (let m = c.rMin; m <= g; m++) T(u, m);
  if (!y)
    throw new Error("No feasible grid found with given settings/tolerance.");
  return y;
}, J = (r, t, e, s, i) => {
  const a = Math.max(1, Math.round(r / e)), o = Math.max(1, Math.round(t / s)), n = r - i * Math.max(0, a - 1), l = t - i * Math.max(0, o - 1), d = n / a, c = l / o;
  return { width: d, height: c, cols: a, rows: o };
};
class K {
  constructor(t) {
    h(this, "gridEl");
    h(this, "headerEl");
    h(this, "measureViewportEl");
    h(this, "desiredBlockSize", { width: 400, height: 300 });
    h(this, "gap", 10);
    h(this, "fadeOutDurationMs", 200);
    h(this, "staggerStepMs", 75);
    h(this, "fadeStaggerStepMs", 50);
    h(this, "initialResizeDelayFrames", 2);
    h(this, "initialScrollDelayMs", 1750);
    h(this, "filterScrollDelayMs", 400);
    h(this, "items", []);
    h(this, "allTags", []);
    h(this, "activeTags", /* @__PURE__ */ new Set());
    h(this, "tagChipsEl", null);
    h(this, "hasDoneInitialScrollUpdate", !1);
    h(this, "hasDoneInitialResize", !1);
    h(this, "resizeDebounceTimer", null);
    h(this, "fadeOutTimer", null);
    h(this, "headerZIndexRaised", !1);
    h(this, "state");
    h(this, "headerRowIndex", 0);
    this.gridEl = t.gridEl, this.headerEl = t.headerEl ?? null, this.measureViewportEl = t.measureViewportEl ?? null, t.desiredBlockSize && (this.desiredBlockSize = t.desiredBlockSize), typeof t.gap == "number" && (this.gap = t.gap), typeof t.fadeOutDurationMs == "number" && (this.fadeOutDurationMs = t.fadeOutDurationMs), typeof t.staggerStepMs == "number" && (this.staggerStepMs = t.staggerStepMs), typeof t.fadeStaggerStepMs == "number" && (this.fadeStaggerStepMs = t.fadeStaggerStepMs), typeof t.initialResizeDelayFrames == "number" && (this.initialResizeDelayFrames = t.initialResizeDelayFrames), typeof t.initialScrollDelayMs == "number" && (this.initialScrollDelayMs = t.initialScrollDelayMs), typeof t.filterScrollDelayMs == "number" && (this.filterScrollDelayMs = t.filterScrollDelayMs);
  }
  setItems(t) {
    this.items = t, this.allTags = Array.from(new Set(this.items.flatMap((e) => e.tags || []))).sort((e, s) => e.localeCompare(s)), this.initFromUrl(), this.renderTagChips(), this.delayFrames(this.initialResizeDelayFrames, () => this.onResizeImmediate()), window.setTimeout(() => this.onScroll(), this.initialScrollDelayMs);
  }
  init() {
    this.headerEl && (this.tagChipsEl = document.createElement("div"), this.tagChipsEl.className = "tags", this.headerEl.appendChild(this.tagChipsEl)), this.syncCssVars(), this.gridEl.addEventListener("scroll", () => this.onScroll(), { passive: !0 }), window.addEventListener("resize", () => this.onWindowResize());
  }
  destroy() {
    this.gridEl.removeEventListener("scroll", () => this.onScroll()), window.removeEventListener("resize", () => this.onWindowResize());
  }
  // -------------------------
  // Internals
  // -------------------------
  syncCssVars() {
    const t = document.documentElement.style;
    t.setProperty("--block-gap", `${this.gap}px`), t.setProperty("--fade-out-duration", `${this.fadeOutDurationMs}ms`);
    const s = Math.max(0, this.initialScrollDelayMs - 250);
    t.setProperty("--header-fade-delay", `${s}ms`);
  }
  delayFrames(t, e) {
    if (t <= 0) {
      e();
      return;
    }
    requestAnimationFrame(() => this.delayFrames(t - 1, e));
  }
  setLayout(t, e) {
    this.state = O(t, e, this.desiredBlockSize.width, this.desiredBlockSize.height, this.gap), this.headerRowIndex = 1;
    const s = document.documentElement.style;
    s.setProperty("--block-width", `${this.state.width}px`), s.setProperty("--block-height", `${this.state.height}px`), s.setProperty("--cols", String(this.state.cols)), s.setProperty("--rows", String(this.state.rows)), s.setProperty("--block-gap", `${this.gap}px`), s.setProperty("--header-row", `${this.headerRowIndex}`);
  }
  rebuildGrid() {
    if (!this.state) return;
    this.gridEl.innerHTML = "";
    const t = document.createElement("div");
    t.className = "row-spacer col-0", this.gridEl.appendChild(t), this.items.filter((s) => this.activeTags.size === 0 ? !0 : (s.tags || []).some((a) => this.activeTags.has(a))).forEach((s, i) => {
      const a = Math.floor(i / this.state.cols), o = i % this.state.cols, n = this.createCard(s);
      n.dataset.row = `${a}`, n.dataset.column = `${o}`, n.classList.add(`row-${a}`), n.classList.add(`col-${o}`);
      const c = (a % 2 === 0 ? o : this.state.cols - 1 - o) * this.staggerStepMs, w = i * this.fadeStaggerStepMs;
      n.style.transitionDelay = `${c}ms`, n.style.setProperty("--fade-delay", `${w}ms`), n.classList.add("fade-in"), this.gridEl.appendChild(n);
    });
  }
  createCard(t) {
    const e = t.title, i = (Array.isArray(t.thumbnails) ? t.thumbnails : [])[0], a = (t.tags || []).sort((n, l) => n.localeCompare(l)), o = document.createElement("div");
    return o.className = "block", o.innerHTML = `
      ${i ? `<div class="media"><img class="thumb" src="${i}" alt="${e}"></div>` : ""}
      <div class="content block-border">
        <div class="info">
          <h3>${e}</h3>
        </div>
        <div class="tags">
          ${a.map((n) => `<button class="tag${this.activeTags.has(n) ? " active" : ""}" data-tag="${n}">${n}</button>`).join("")}
        </div>
      </div>
      <svg class="checker-border" xmlns="http://www.w3.org/2000/svg">
        <rect class="dash black" />
        <rect class="dash white" />
      </svg>
    `, t.href && o.addEventListener("click", () => {
      window.location.href = t.href;
    }), o.querySelectorAll(".tag").forEach((n) => {
      n.addEventListener("click", (l) => {
        l.preventDefault(), l.stopPropagation();
        const d = n.getAttribute("data-tag");
        d && this.toggleTag(d);
      });
    }), o;
  }
  // -------------------------
  // Event handlers
  // -------------------------
  onScroll() {
    this.updateAboveHeaderClasses(), this.hasDoneInitialScrollUpdate || this.scheduleRaiseHeaderZIndexAfterStagger(), this.hasDoneInitialScrollUpdate = !0;
  }
  onResizeImmediate() {
    var e;
    const t = (e = this.measureViewportEl) == null ? void 0 : e.getBoundingClientRect();
    if (!t) {
      console.warn("[grid] measureViewport element not found");
      return;
    }
    this.setLayout(t.width, t.height), this.rebuildGrid(), this.hasDoneInitialScrollUpdate && this.updateAboveHeaderClasses(), this.gridEl && this.gridEl.scrollHeight > this.gridEl.clientHeight && (this.setLayout(this.gridEl.clientWidth, t.height), this.rebuildGrid(), this.hasDoneInitialScrollUpdate && this.updateAboveHeaderClasses()), this.hasDoneInitialResize || (this.hasDoneInitialResize = !0, document.body.classList.add("layout-ready"));
  }
  onWindowResize() {
    var s;
    const t = (s = this.measureViewportEl) == null ? void 0 : s.getBoundingClientRect();
    if (!t) return;
    this.setLayout(t.width, t.height), this.gridEl.innerHTML = "";
    const e = document.createElement("div");
    e.className = "row-spacer col-0", this.gridEl.appendChild(e), this.resizeDebounceTimer !== null && window.clearTimeout(this.resizeDebounceTimer), this.resizeDebounceTimer = window.setTimeout(() => {
      this.rebuildGrid(), this.hasDoneInitialScrollUpdate && this.updateAboveHeaderClasses(), this.gridEl && this.gridEl.scrollHeight > this.gridEl.clientHeight && (this.setLayout(this.gridEl.clientWidth, t.height), this.rebuildGrid(), this.hasDoneInitialScrollUpdate && this.updateAboveHeaderClasses()), this.resizeDebounceTimer = null;
    }, 400);
  }
  updateAboveHeaderClasses() {
    if (!this.state) return;
    const t = this.state.height + this.gap, s = Math.round(this.gridEl.scrollTop / t) + this.headerRowIndex;
    this.gridEl.querySelectorAll(".block").forEach((a) => {
      parseInt(a.dataset.row || "0", 10) < s ? a.classList.add("above-header") : a.classList.remove("above-header");
    });
  }
  scheduleRaiseHeaderZIndexAfterStagger() {
    if (!this.headerEl || !this.state || this.headerZIndexRaised) return;
    const t = Array.from(this.gridEl.querySelectorAll(".row-0"));
    if (t.length === 0) {
      this.headerEl.style.zIndex = "10", this.headerZIndexRaised = !0;
      return;
    }
    const e = (s) => {
      const i = s.trim();
      if (i.endsWith("ms")) return parseFloat(i);
      if (i.endsWith("s")) return parseFloat(i) * 1e3;
      const a = parseFloat(i);
      return Number.isFinite(a) ? a : 0;
    };
    t.forEach((s) => {
      const i = getComputedStyle(s), a = i.transitionDelay.split(",").map((l) => e(l)), o = i.transitionDuration.split(",").map((l) => e(l)), n = Math.max(a.length, o.length);
      for (let l = 0; l < n; l++)
        a[l % a.length], o[l % o.length];
    });
  }
  // -------------------------
  // Tags & URL
  // -------------------------
  renderTagChips() {
    this.tagChipsEl && (this.tagChipsEl.innerHTML = "", this.allTags.forEach((t) => {
      const e = document.createElement("button");
      e.type = "button", e.className = "tag", e.textContent = t, e.dataset.tag = t, this.activeTags.has(t) && e.classList.add("active"), e.addEventListener("click", (s) => {
        s.preventDefault(), s.stopPropagation(), this.toggleTag(t);
      }), this.tagChipsEl.appendChild(e);
    }));
  }
  toggleTag(t) {
    this.activeTags.has(t) ? this.activeTags.delete(t) : this.activeTags.add(t), this.renderTagChips(), this.hasDoneInitialScrollUpdate = !1, this.fadeOutBlocksThen(() => this.onResizeImmediate()), window.setTimeout(() => this.onScroll(), this.filterScrollDelayMs), this.syncUrl();
  }
  fadeOutBlocksThen(t) {
    const e = Array.from(this.gridEl.querySelectorAll(".block"));
    if (e.length === 0) {
      t();
      return;
    }
    this.fadeOutTimer !== null && (window.clearTimeout(this.fadeOutTimer), this.fadeOutTimer = null);
    let s = 0;
    e.forEach((a) => {
      const o = parseInt(a.dataset.row || "0", 10), n = parseInt(a.dataset.column || "0", 10), c = (o % 2 === 0 ? n : this.state.cols - 1 - n) * this.fadeStaggerStepMs;
      a.style.setProperty("--fade-delay", `${c}ms`), a.classList.add("fade-out"), c > s && (s = c);
    });
    const i = s + this.fadeOutDurationMs + 20;
    this.fadeOutTimer = window.setTimeout(() => {
      this.fadeOutTimer = null, t();
    }, i);
  }
  syncUrl() {
    const t = new URLSearchParams(location.search), e = Array.from(this.activeTags);
    e.length ? t.set("tags", e.join(",")) : t.delete("tags");
    const s = t.toString(), i = s ? `${location.pathname}?${s}` : location.pathname;
    history.pushState(null, "", i);
  }
  initFromUrl() {
    this.activeTags.clear();
    const e = new URLSearchParams(location.search).get("tags");
    e && e.split(",").filter(Boolean).forEach((s) => this.activeTags.add(s)), window.addEventListener("popstate", () => {
      this.initFromUrl(), this.renderTagChips(), this.fadeOutBlocksThen(() => this.onResizeImmediate());
    });
  }
}
const U = [
  "thumbnail.png",
  "thumbnail.jpg",
  "thumbnail.jpeg",
  "thumbnail.webp",
  "thumbnail.gif",
  "thumbnail.mp4",
  "thumbnail.webm"
];
function z(r, t = r) {
  const e = [];
  if (!I(r)) return e;
  const s = $(r, { withFileTypes: !0 });
  for (const i of s) {
    if (!i.isDirectory()) continue;
    const a = x(r, i.name), o = x(a, "index.html");
    I(o) && e.push(a), e.push(...z(a, t));
  }
  return e;
}
function V(r) {
  const t = r.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return t ? t[1].trim() : void 0;
}
function G(r) {
  const t = r.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) || r.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
  return t ? t[1].trim() : void 0;
}
function H(r) {
  const t = r.match(/<meta[^>]*name=["']tags["'][^>]*content=["']([^"']*)["'][^>]*>/i) || r.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']tags["'][^>]*>/i);
  return t ? t[1].split(",").map((e) => e.trim()).filter(Boolean).sort((e, s) => e.localeCompare(s)) : [];
}
function _(r, t) {
  for (const e of t) {
    const s = x(r, e);
    if (I(s))
      return e;
  }
}
function j(r, t) {
  const {
    basePath: e = "/",
    includeHidden: s = !1,
    thumbnailPatterns: i = U
  } = t, a = z(r), o = [];
  for (const n of a) {
    const l = B(r, n), d = F(n), c = d.startsWith("_");
    if (c && !s) continue;
    const w = l.split(/[/\\]/), b = w.length > 1 ? w[0] : "misc", S = x(n, "index.html"), g = k(S, "utf-8"), y = V(g), T = G(g), u = H(g), m = _(n, i), M = l.split(/[/\\]/).join(A.sep), E = `${e}${M}/`.replace(/\/+/g, "/"), f = m ? `${M}/${m}`.replace(/\\/g, "/") : void 0;
    o.push({
      path: M,
      name: d,
      group: b,
      title: y,
      description: T,
      tags: u.length > 0 ? u : void 0,
      thumbnail: f,
      href: E,
      hidden: c
    });
  }
  return o.sort((n, l) => n.path.localeCompare(l.path)), o;
}
function Q(r) {
  const t = r.moduleId || "virtual:grid-manifest", e = "\0" + t;
  let s = null, i = null;
  return {
    name: "grid-manifest",
    resolveId(a) {
      if (a === t)
        return e;
    },
    load(a) {
      if (a === e) {
        const o = j(r.dir, r);
        return `export default ${JSON.stringify({ items: o }, null, 2)};`;
      }
    },
    configureServer(a) {
      i = a, I(r.dir) && (s = P(r.dir, { recursive: !0 }, (o, n) => {
        if (!n) return;
        if (n.endsWith("index.html") || n.includes("thumbnail") || o === "rename") {
          const d = i == null ? void 0 : i.moduleGraph.getModuleById(e);
          d && (i == null || i.moduleGraph.invalidateModule(d), i == null || i.ws.send({
            type: "full-reload",
            path: "*"
          }));
        }
      }));
    },
    buildEnd() {
      s && (s.close(), s = null);
    }
  };
}
export {
  K as GridList,
  O as findBestBlockSize,
  J as findNaiveBlockSize,
  Q as gridManifestPlugin
};
