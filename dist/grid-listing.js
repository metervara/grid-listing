const X = (s, u, e, M, o, n) => {
  const c = Math.max(1, Math.ceil((s + o) / (e * n + o))), S = Math.max(c, Math.floor((s + o) / (e / n + o))), p = Math.max(1, Math.ceil((u + o) / (M * n + o))), T = Math.max(p, Math.floor((u + o) / (M / n + o))), b = o > 0 ? Math.floor(s / o) + 1 : Number.POSITIVE_INFINITY, L = o > 0 ? Math.floor(u / o) + 1 : Number.POSITIVE_INFINITY, I = Math.max(1, Math.floor(s)), R = Math.max(1, Math.floor(u)), y = Math.min(S, b, I), h = Math.min(T, L, R);
  return { cMin: c, cMax: y, rMin: p, rMax: h };
}, Z = (s, u, e, M, o, n = {}) => {
  const c = n.weightSize ?? 1, S = n.weightAR ?? 1, p = n.alpha ?? 1.5, T = e / M, b = X(s, u, e, M, o, p), L = 1, I = 1, R = Math.min(b.cMax, n.maxCols ?? Number.POSITIVE_INFINITY), y = Math.min(b.rMax, n.maxRows ?? Number.POSITIVE_INFINITY);
  let h = null;
  const d = (l, m) => {
    if (l < L || m < I || l > R || m > y) return;
    const g = s - (l - 1) * o, N = u - (m - 1) * o;
    if (g <= 0 || N <= 0) return;
    const f = g / l, v = N / m;
    if (n.integerBlockSize && (!Number.isInteger(f) || !Number.isInteger(v)) || f < e / p || f > e * p || v < M / p || v > M * p) return;
    const k = Math.hypot((f - e) / e, (v - M) / M), B = Math.abs(f / v - T) / T, $ = c * k + S * B;
    (!h || $ < h.score) && (h = { width: f, height: v, cols: l, rows: m, score: $, sizeError: k, arError: B });
  };
  for (let l = b.cMin; l <= R; l++) {
    const m = s - (l - 1) * o;
    if (m <= 0) break;
    const g = m / l;
    if (g < e / p || g > e * p) continue;
    const N = (u + o) / (o + g / T), f = /* @__PURE__ */ new Set();
    for (let v = -2; v <= 2; v++) {
      const k = Math.round(N + v);
      k >= I && k <= y && f.add(k);
    }
    f.add(b.rMin), f.add(y);
    for (const v of f) d(l, v);
  }
  if (!h)
    for (let l = b.cMin; l <= R; l++)
      for (let m = b.rMin; m <= y; m++) d(l, m);
  if (!h)
    throw new Error("No feasible grid found with given settings/tolerance.");
  return h;
}, tt = (s, u, e, M, o) => {
  const n = Math.max(1, Math.round(s / e)), c = Math.max(1, Math.round(u / M)), S = s - o * Math.max(0, n - 1), p = u - o * Math.max(0, c - 1), T = S / n, b = p / c;
  return { width: T, height: b, cols: n, rows: c };
};
function W() {
  const s = /* @__PURE__ */ new Map();
  return { on: (o, n) => {
    let c = s.get(o);
    return c || s.set(o, c = /* @__PURE__ */ new Set()), c.add(n), () => c.delete(n);
  }, emit: (o, n) => {
    const c = s.get(o);
    c && [...c].forEach((S) => S(n));
  }, clear: () => s.clear() };
}
function et(s) {
  const u = W(), e = s.gridEl, M = s.measureViewportEl ?? null, o = s.desiredBlockSize ?? { width: 400, height: 300 }, n = s.gap ?? 10, c = s.fadeOutDurationMs ?? 200, S = s.staggerStepMs ?? 75, p = s.fadeStaggerStepMs ?? 50, T = s.initialResizeDelayFrames ?? 2, b = s.initialScrollDelayMs ?? 1750;
  let L = [], I = !1, R = !1, y = null, h = null, d, l = 0, m, g = null, N = 100, f = !1;
  function v() {
    U(() => G());
  }
  function k() {
    const t = document.documentElement.style;
    t.setProperty("--block-gap", `${n}px`), t.setProperty("--fade-out-duration", `${c}ms`);
    const a = Math.max(0, b - 250);
    t.setProperty("--header-fade-delay", `${a}ms`);
  }
  function B(t, r) {
    if (t <= 0) {
      r();
      return;
    }
    requestAnimationFrame(() => B(t - 1, r));
  }
  function $(t, r) {
    d = Z(t, r, o.width, o.height, n), l = 1;
    const a = document.documentElement.style;
    a.setProperty("--block-width", `${d.width}px`), a.setProperty("--block-height", `${d.height}px`), a.setProperty("--cols", String(d.cols)), a.setProperty("--rows", String(d.rows)), a.setProperty("--block-gap", `${n}px`), a.setProperty("--header-row", `${l}`);
  }
  function D() {
    if (!d) return;
    e.innerHTML = "";
    const t = document.createElement("div");
    t.className = "row-spacer col-0", e.appendChild(t), L.forEach((a, i) => {
      const E = Math.floor(i / d.cols), x = i % d.cols, w = _(a);
      w.dataset.row = `${E}`, w.dataset.column = `${x}`, w.classList.add(`row-${E}`), w.classList.add(`col-${x}`);
      const P = (E % 2 === 0 ? x : d.cols - 1 - x) * S, Q = i * p;
      w.style.transitionDelay = `${P}ms`, w.style.setProperty("--fade-delay", `${Q}ms`), w.classList.add("fade-in"), e.appendChild(w);
    });
    const r = Math.ceil(L.length / d.cols) + 1;
    for (let a = 0; a < r; a++) {
      const i = document.createElement("div");
      i.className = "snap-block", i.dataset.row = `${a}`, i.style.top = `${a * (d.height + n)}px`, e.appendChild(i);
    }
  }
  function _(t) {
    const r = t.title, i = (Array.isArray(t.thumbnails) ? t.thumbnails : [])[0], E = (t.tags || []).sort((w, C) => w.localeCompare(C)), x = document.createElement("div");
    return x.className = "block", x.innerHTML = `
      ${i ? `<div class="media"><img class="thumb" src="${i}" alt="${r}"></div>` : ""}
      <div class="content block-border">
        <div class="info">
          <h3>${r}</h3>
          </div>
          <div class="tags">
            ${E.map((w) => `<div class="tag" data-tag="${w}">${w}</div>`).join("")}
          </div>
      </div>
      <svg class="checker-border" xmlns="http://www.w3.org/2000/svg">
        <rect class="dash black" />
        <rect class="dash white" />
      </svg>
    `, t.href && x.addEventListener("click", () => {
      window.location.href = t.href;
    }), x;
  }
  function F() {
    const t = d.height + n, r = Math.round(e.scrollTop / t), a = r + d.rows - 2, i = r + l;
    return {
      aboveHeader: i - 1 >= r && i - 1 <= a ? i - 1 : void 0,
      belowHeader: i >= r && i <= a ? i : void 0
      // belowHeader: headerAbsoluteRow, // + 1 // +1 omitted here since header row is not an actual row
    };
  }
  function q() {
    z(), I = !0, setTimeout(() => {
      const t = F();
      u.emit("initial:scroll:end", t);
    }, 500);
  }
  function O() {
    f || u.emit("scroll:start", void 0), f = !0, z();
  }
  function A() {
    if (f) {
      const t = F();
      u.emit("scroll:end", t);
    }
    f = !1;
  }
  function V() {
    g && window.clearTimeout(g), g = window.setTimeout(() => {
      A();
    }, N);
  }
  function G() {
    const t = M?.getBoundingClientRect();
    if (!t) {
      console.warn("[grid] measureViewport element not found");
      return;
    }
    $(t.width, t.height), D(), I && z(), e && e.scrollHeight > e.clientHeight && ($(e.clientWidth, t.height), D(), I && z()), R || (R = !0, document.body.classList.add("layout-ready"));
  }
  function Y() {
    const t = M?.getBoundingClientRect();
    if (!t) return;
    $(t.width, t.height), e.innerHTML = "";
    const r = document.createElement("div");
    r.className = "row-spacer col-0", e.appendChild(r), y !== null && window.clearTimeout(y), y = window.setTimeout(() => {
      D(), I && z(), e && e.scrollHeight > e.clientHeight && ($(e.clientWidth, t.height), D(), I && z()), y = null;
    }, 400);
  }
  function z() {
    if (!d) return;
    const t = d.height + n, a = Math.round(e.scrollTop / t) + l;
    e.querySelectorAll(".block").forEach((E) => {
      parseInt(E.dataset.row || "0", 10) < a ? E.classList.add("above-header") : E.classList.remove("above-header");
    });
  }
  function U(t) {
    const r = Array.from(e.querySelectorAll(".block"));
    if (r.length === 0) {
      t();
      return;
    }
    h !== null && (window.clearTimeout(h), h = null);
    let a = 0;
    r.forEach((E) => {
      const x = parseInt(E.dataset.row || "0", 10), w = parseInt(E.dataset.column || "0", 10), P = (x % 2 === 0 ? w : d.cols - 1 - w) * p;
      E.style.setProperty("--fade-delay", `${P}ms`), E.classList.add("fade-out"), P > a && (a = P);
    });
    const i = a + c + 20;
    h = window.setTimeout(() => {
      h = null, t();
    }, i);
  }
  function j() {
    k(), e.addEventListener("scroll", O, { passive: !0 }), window.addEventListener("resize", Y), window.addEventListener("popstate", v), m = "onscrollend" in window, m ? e.addEventListener("scrollend", A) : e.addEventListener("scroll", V, { passive: !0 });
  }
  function H() {
    u.clear(), e.removeEventListener("scroll", O), window.removeEventListener("resize", Y), window.removeEventListener("popstate", v), m ? e.removeEventListener("scrollend", A) : (g && window.clearTimeout(g), e.removeEventListener("scroll", V)), y !== null && (window.clearTimeout(y), y = null), h !== null && (window.clearTimeout(h), h = null);
  }
  function J(t) {
    L = t, B(T, () => G()), window.setTimeout(q, b);
  }
  return { init: j, destroy: H, setItems: J, events: u };
}
export {
  et as createGridList,
  Z as findBestBlockSize,
  tt as findNaiveBlockSize
};
