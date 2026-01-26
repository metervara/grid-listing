import { existsSync as T, watch as z, readFileSync as C, readdirSync as L } from "fs";
import { relative as P, basename as k, join as I, posix as $ } from "path";
const B = (n, t, e, s, i, a) => {
  const o = Math.max(1, Math.ceil((n + i) / (e * a + i))), r = Math.max(o, Math.floor((n + i) / (e / a + i))), l = Math.max(1, Math.ceil((t + i) / (s * a + i))), c = Math.max(l, Math.floor((t + i) / (s / a + i))), h = i > 0 ? Math.floor(n / i) + 1 : Number.POSITIVE_INFINITY, M = i > 0 ? Math.floor(t / i) + 1 : Number.POSITIVE_INFINITY, S = Math.max(1, Math.floor(n)), w = Math.max(1, Math.floor(t)), p = Math.min(r, h, S), g = Math.min(c, M, w);
  return { cMin: o, cMax: p, rMin: l, rMax: g };
}, F = (n, t, e, s, i, a = {}) => {
  const o = a.weightSize ?? 1, r = a.weightAR ?? 1, l = a.alpha ?? 1.5, c = e / s, h = B(n, t, e, s, i, l), M = 1, S = 1, w = Math.min(h.cMax, a.maxCols ?? Number.POSITIVE_INFINITY), p = Math.min(h.rMax, a.maxRows ?? Number.POSITIVE_INFINITY);
  let g = null;
  const v = (d, u) => {
    if (d < M || u < S || d > w || u > p) return;
    const y = n - (d - 1) * i, b = t - (u - 1) * i;
    if (y <= 0 || b <= 0) return;
    const m = y / d, f = b / u;
    if (a.integerBlockSize && (!Number.isInteger(m) || !Number.isInteger(f)) || m < e / l || m > e * l || f < s / l || f > s * l) return;
    const E = Math.hypot((m - e) / e, (f - s) / s), x = Math.abs(m / f - c) / c, D = o * E + r * x;
    (!g || D < g.score) && (g = { width: m, height: f, cols: d, rows: u, score: D, sizeError: E, arError: x });
  };
  for (let d = h.cMin; d <= w; d++) {
    const u = n - (d - 1) * i;
    if (u <= 0) break;
    const y = u / d;
    if (y < e / l || y > e * l) continue;
    const b = (t + i) / (i + y / c), m = /* @__PURE__ */ new Set();
    for (let f = -2; f <= 2; f++) {
      const E = Math.round(b + f);
      E >= S && E <= p && m.add(E);
    }
    m.add(h.rMin), m.add(p);
    for (const f of m) v(d, f);
  }
  if (!g)
    for (let d = h.cMin; d <= w; d++)
      for (let u = h.rMin; u <= p; u++) v(d, u);
  if (!g)
    throw new Error("No feasible grid found with given settings/tolerance.");
  return g;
}, j = (n, t, e, s, i) => {
  const a = Math.max(1, Math.round(n / e)), o = Math.max(1, Math.round(t / s)), r = n - i * Math.max(0, a - 1), l = t - i * Math.max(0, o - 1), c = r / a, h = l / o;
  return { width: c, height: h, cols: a, rows: o };
};
class q {
  gridEl;
  headerEl;
  measureViewportEl;
  desiredBlockSize = { width: 400, height: 300 };
  gap = 10;
  fadeOutDurationMs = 200;
  staggerStepMs = 75;
  fadeStaggerStepMs = 50;
  initialResizeDelayFrames = 2;
  initialScrollDelayMs = 1750;
  filterScrollDelayMs = 400;
  items = [];
  allTags = [];
  activeTags = /* @__PURE__ */ new Set();
  tagChipsEl = null;
  hasDoneInitialScrollUpdate = !1;
  hasDoneInitialResize = !1;
  resizeDebounceTimer = null;
  fadeOutTimer = null;
  headerZIndexRaised = !1;
  state;
  headerRowIndex = 0;
  constructor(t) {
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
    this.state = F(t, e, this.desiredBlockSize.width, this.desiredBlockSize.height, this.gap), this.headerRowIndex = 1;
    const s = document.documentElement.style;
    s.setProperty("--block-width", `${this.state.width}px`), s.setProperty("--block-height", `${this.state.height}px`), s.setProperty("--cols", String(this.state.cols)), s.setProperty("--rows", String(this.state.rows)), s.setProperty("--block-gap", `${this.gap}px`), s.setProperty("--header-row", `${this.headerRowIndex}`);
  }
  rebuildGrid() {
    if (!this.state) return;
    this.gridEl.innerHTML = "";
    const t = document.createElement("div");
    t.className = "row-spacer col-0", this.gridEl.appendChild(t), this.items.filter((s) => this.activeTags.size === 0 ? !0 : (s.tags || []).some((a) => this.activeTags.has(a))).forEach((s, i) => {
      const a = Math.floor(i / this.state.cols), o = i % this.state.cols, r = this.createCard(s);
      r.dataset.row = `${a}`, r.dataset.column = `${o}`, r.classList.add(`row-${a}`), r.classList.add(`col-${o}`);
      const h = (a % 2 === 0 ? o : this.state.cols - 1 - o) * this.staggerStepMs, M = i * this.fadeStaggerStepMs;
      r.style.transitionDelay = `${h}ms`, r.style.setProperty("--fade-delay", `${M}ms`), r.classList.add("fade-in"), this.gridEl.appendChild(r);
    });
  }
  createCard(t) {
    const e = t.title, i = (Array.isArray(t.thumbnails) ? t.thumbnails : [])[0], a = (t.tags || []).sort((r, l) => r.localeCompare(l)), o = document.createElement("div");
    return o.className = "block", o.innerHTML = `
      ${i ? `<div class="media"><img class="thumb" src="${i}" alt="${e}"></div>` : ""}
      <div class="content block-border">
        <div class="info">
          <h3>${e}</h3>
        </div>
        <div class="tags">
          ${a.map((r) => `<button class="tag${this.activeTags.has(r) ? " active" : ""}" data-tag="${r}">${r}</button>`).join("")}
        </div>
      </div>
      <svg class="checker-border" xmlns="http://www.w3.org/2000/svg">
        <rect class="dash black" />
        <rect class="dash white" />
      </svg>
    `, t.href && o.addEventListener("click", () => {
      window.location.href = t.href;
    }), o.querySelectorAll(".tag").forEach((r) => {
      r.addEventListener("click", (l) => {
        l.preventDefault(), l.stopPropagation();
        const c = r.getAttribute("data-tag");
        c && this.toggleTag(c);
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
    const t = this.measureViewportEl?.getBoundingClientRect();
    if (!t) {
      console.warn("[grid] measureViewport element not found");
      return;
    }
    this.setLayout(t.width, t.height), this.rebuildGrid(), this.hasDoneInitialScrollUpdate && this.updateAboveHeaderClasses(), this.gridEl && this.gridEl.scrollHeight > this.gridEl.clientHeight && (this.setLayout(this.gridEl.clientWidth, t.height), this.rebuildGrid(), this.hasDoneInitialScrollUpdate && this.updateAboveHeaderClasses()), this.hasDoneInitialResize || (this.hasDoneInitialResize = !0, document.body.classList.add("layout-ready"));
  }
  onWindowResize() {
    const t = this.measureViewportEl?.getBoundingClientRect();
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
      const i = getComputedStyle(s), a = i.transitionDelay.split(",").map((l) => e(l)), o = i.transitionDuration.split(",").map((l) => e(l)), r = Math.max(a.length, o.length);
      for (let l = 0; l < r; l++)
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
      const o = parseInt(a.dataset.row || "0", 10), r = parseInt(a.dataset.column || "0", 10), h = (o % 2 === 0 ? r : this.state.cols - 1 - r) * this.fadeStaggerStepMs;
      a.style.setProperty("--fade-delay", `${h}ms`), a.classList.add("fade-out"), h > s && (s = h);
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
const A = [
  "thumbnail.png",
  "thumbnail.jpg",
  "thumbnail.jpeg",
  "thumbnail.webp",
  "thumbnail.gif",
  "thumbnail.mp4",
  "thumbnail.webm"
];
function R(n, t = n) {
  const e = [];
  if (!T(n)) return e;
  const s = L(n, { withFileTypes: !0 });
  for (const i of s) {
    if (!i.isDirectory()) continue;
    const a = I(n, i.name), o = I(a, "index.html");
    T(o) && e.push(a), e.push(...R(a, t));
  }
  return e;
}
function N(n) {
  const t = n.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return t ? t[1].trim() : void 0;
}
function O(n) {
  const t = n.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) || n.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
  return t ? t[1].trim() : void 0;
}
function U(n) {
  const t = n.match(/<meta[^>]*name=["']tags["'][^>]*content=["']([^"']*)["'][^>]*>/i) || n.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']tags["'][^>]*>/i);
  return t ? t[1].split(",").map((e) => e.trim()).filter(Boolean).sort((e, s) => e.localeCompare(s)) : [];
}
function V(n, t) {
  for (const e of t) {
    const s = I(n, e);
    if (T(s))
      return e;
  }
}
function G(n, t) {
  const {
    basePath: e = "/",
    includeHidden: s = !1,
    thumbnailPatterns: i = A
  } = t, a = R(n), o = [];
  for (const r of a) {
    const l = P(n, r), c = k(r), h = c.startsWith("_");
    if (h && !s) continue;
    const M = l.split(/[/\\]/), S = M.length > 1 ? M[0] : "misc", w = I(r, "index.html"), p = C(w, "utf-8"), g = N(p), v = O(p), d = U(p), u = V(r, i), y = l.split(/[/\\]/).join($.sep), b = `${e}${y}/`.replace(/\/+/g, "/"), m = u ? `${y}/${u}`.replace(/\\/g, "/") : void 0;
    o.push({
      path: y,
      name: c,
      group: S,
      title: g,
      description: v,
      tags: d.length > 0 ? d : void 0,
      thumbnail: m,
      href: b,
      hidden: h
    });
  }
  return o.sort((r, l) => r.path.localeCompare(l.path)), o;
}
function Z(n) {
  const t = n.moduleId || "virtual:grid-manifest", e = "\0" + t;
  let s = null, i = null;
  return {
    name: "grid-manifest",
    resolveId(a) {
      if (a === t)
        return e;
    },
    load(a) {
      if (a === e) {
        const o = G(n.dir, n);
        return `export default ${JSON.stringify({ items: o }, null, 2)};`;
      }
    },
    configureServer(a) {
      i = a, T(n.dir) && (s = z(n.dir, { recursive: !0 }, (o, r) => {
        if (!r) return;
        if (r.endsWith("index.html") || r.includes("thumbnail") || o === "rename") {
          const c = i?.moduleGraph.getModuleById(e);
          c && (i?.moduleGraph.invalidateModule(c), i?.ws.send({
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
  q as GridList,
  F as findBestBlockSize,
  j as findNaiveBlockSize,
  Z as gridManifestPlugin
};
