const W = (s, l, o, M, n, a) => {
  const u = Math.max(1, Math.ceil((s + n) / (o * a + n))), I = Math.max(u, Math.floor((s + n) / (o / a + n))), p = Math.max(1, Math.ceil((l + n) / (M * a + n))), T = Math.max(p, Math.floor((l + n) / (M / a + n))), y = n > 0 ? Math.floor(s / n) + 1 : Number.POSITIVE_INFINITY, N = n > 0 ? Math.floor(l / n) + 1 : Number.POSITIVE_INFINITY, k = Math.max(1, Math.floor(s)), E = Math.max(1, Math.floor(l)), R = Math.min(I, y, k), f = Math.min(T, N, E);
  return { cMin: u, cMax: R, rMin: p, rMax: f };
}, tt = (s, l, o, M, n, a = {}) => {
  const u = a.weightSize ?? 1, I = a.weightAR ?? 1, p = a.alpha ?? 1.5, T = o / M, y = W(s, l, o, M, n, p), N = 1, k = 1, E = Math.min(y.cMax, a.maxCols ?? Number.POSITIVE_INFINITY), R = Math.min(y.rMax, a.maxRows ?? Number.POSITIVE_INFINITY);
  let f = null;
  const b = (t, h) => {
    if (t < N || h < k || t > E || h > R) return;
    const x = s - (t - 1) * n, S = l - (h - 1) * n;
    if (x <= 0 || S <= 0) return;
    const g = x / t, m = S / h;
    if (a.integerBlockSize && (!Number.isInteger(g) || !Number.isInteger(m)) || g < o / p || g > o * p || m < M / p || m > M * p) return;
    const L = Math.hypot((g - o) / o, (m - M) / M), P = Math.abs(g / m - T) / T, z = u * L + I * P;
    (!f || z < f.score) && (f = { width: g, height: m, cols: t, rows: h, score: z, sizeError: L, arError: P });
  };
  for (let t = y.cMin; t <= E; t++) {
    const h = s - (t - 1) * n;
    if (h <= 0) break;
    const x = h / t;
    if (x < o / p || x > o * p) continue;
    const S = (l + n) / (n + x / T), g = /* @__PURE__ */ new Set();
    for (let m = -2; m <= 2; m++) {
      const L = Math.round(S + m);
      L >= k && L <= R && g.add(L);
    }
    g.add(y.rMin), g.add(R);
    for (const m of g) b(t, m);
  }
  if (!f)
    for (let t = y.cMin; t <= E; t++)
      for (let h = y.rMin; h <= R; h++) b(t, h);
  if (!f)
    throw new Error("No feasible grid found with given settings/tolerance.");
  return f;
}, ot = (s, l, o, M, n) => {
  const a = Math.max(1, Math.round(s / o)), u = Math.max(1, Math.round(l / M)), I = s - n * Math.max(0, a - 1), p = l - n * Math.max(0, u - 1), T = I / a, y = p / u;
  return { width: T, height: y, cols: a, rows: u };
};
function et() {
  const s = /* @__PURE__ */ new Map();
  return { on: (n, a) => {
    let u = s.get(n);
    return u || s.set(n, u = /* @__PURE__ */ new Set()), u.add(a), () => u.delete(a);
  }, emit: (n, a) => {
    const u = s.get(n);
    u && [...u].forEach((I) => I(a));
  }, clear: () => s.clear() };
}
function nt(s) {
  const l = et(), o = s.gridEl, M = s.measureViewportEl ?? null, n = s.desiredBlockSize ?? { width: 400, height: 300 }, a = s.gap ?? 10, u = s.fadeOutDurationMs ?? 200, I = s.staggerStepMs ?? 75, p = s.fadeStaggerStepMs ?? 50, T = s.initialResizeDelayFrames ?? 2, y = s.initialScrollDelayMs ?? 1750, N = s.additionalSpacerRows ?? !1;
  let k = [], E = !1, R = !1, f = null, b = null, t, h = 0, x, S = null, g = 100, m = !1;
  function L() {
    j(() => Y());
  }
  function P() {
    const e = document.documentElement.style;
    e.setProperty("--block-gap", `${a}px`), e.setProperty("--fade-out-duration", `${u}ms`);
    const c = Math.max(0, y - 250);
    e.setProperty("--header-fade-delay", `${c}ms`);
  }
  function z(e, d) {
    if (e <= 0) {
      d();
      return;
    }
    requestAnimationFrame(() => z(e - 1, d));
  }
  function C(e, d) {
    const c = t?.cols || -1, r = t?.rows || -1;
    t = tt(e, d, n.width, n.height, a), h = 1;
    const i = document.documentElement.style;
    i.setProperty("--block-width", `${t.width}px`), i.setProperty("--block-height", `${t.height}px`), i.setProperty("--cols", String(t.cols)), i.setProperty("--rows", String(t.rows)), i.setProperty("--block-gap", `${a}px`), i.setProperty("--header-row", `${h}`), (c !== t?.cols || r !== t?.rows) && l.emit("grid:layout:change", { cols: t.cols, rows: t.rows });
  }
  function D() {
    if (!t) return;
    o.innerHTML = "";
    const e = document.createElement("div");
    e.className = "row-spacer col-0", o.appendChild(e), k.forEach((c, r) => {
      const i = Math.floor(r / t.cols), v = r % t.cols, w = q(c);
      w.dataset.row = `${i}`, w.dataset.column = `${v}`, w.classList.add(`row-${i}`), w.classList.add(`col-${v}`);
      const B = (i % 2 === 0 ? v : t.cols - 1 - v) * I, Z = r * p;
      w.style.transitionDelay = `${B}ms`, w.style.setProperty("--fade-delay", `${Z}ms`), w.classList.add("fade-in"), o.appendChild(w);
    });
    let d = Math.ceil(k.length / t.cols) + 1;
    if (N) {
      const c = t.rows - (h + 1), r = Math.max(0, c - 1);
      for (let i = 0; i < r; i++) {
        const v = document.createElement("div");
        v.className = `row-spacer col-${i + d}`, o.appendChild(v);
      }
      d += r;
    }
    for (let c = 0; c < d; c++) {
      const r = document.createElement("div");
      r.className = "snap-block", r.dataset.row = `${c}`, r.style.top = `${c * (t.height + a)}px`, o.appendChild(r);
    }
    l.emit("grid:rebuild", t), m = !1;
  }
  function q(e) {
    const d = e.title, r = (Array.isArray(e.thumbnails) ? e.thumbnails : [])[0], i = (e.tags || []).sort((w, O) => w.localeCompare(O)), v = document.createElement("div");
    return v.className = "block", v.innerHTML = `
      ${r ? `<div class="media"><img class="thumb" src="${r}" alt="${d}"></div>` : ""}
      <div class="content block-border">
        <div class="info">
          <h3>${d}</h3>
          </div>
          <div class="tags">
            ${i.map((w) => `<div class="tag" data-tag="${w}">${w}</div>`).join("")}
          </div>
      </div>
      <svg class="checker-border" xmlns="http://www.w3.org/2000/svg">
        <rect class="dash black" />
        <rect class="dash white" />
      </svg>
    `, e.href && v.addEventListener("click", () => {
      window.location.href = e.href;
    }), v;
  }
  function A() {
    const e = t.height + a, d = Math.round(o.scrollTop / e), c = d + t.rows - 2, r = d + h;
    return {
      aboveHeader: r - 1 >= d && r - 1 <= c ? r - 1 : void 0,
      belowHeader: r >= d && r <= c ? r : void 0
      // belowHeader: headerAbsoluteRow, // + 1 // +1 omitted here since header row is not an actual row
    };
  }
  function U() {
    $(), E = !0, setTimeout(() => {
      const e = A();
      l.emit("initial:scroll:end", e);
    }, 500);
  }
  function V() {
    m || l.emit("scroll:start", void 0), m = !0, $();
  }
  function F() {
    if (m) {
      const e = A();
      l.emit("scroll:end", e);
    }
    m = !1;
  }
  function G() {
    S && window.clearTimeout(S), S = window.setTimeout(() => {
      F();
    }, g);
  }
  function Y() {
    const e = M?.getBoundingClientRect();
    if (!e) {
      console.warn("[grid] measureViewport element not found");
      return;
    }
    C(e.width, e.height), D(), E && $(), o && o.scrollHeight > o.clientHeight && (C(o.clientWidth, e.height), D(), E && $()), R || (R = !0, document.body.classList.add("layout-ready")), E && setTimeout(() => {
      l.emit("initial:scroll:end", A());
    }, 500);
  }
  function _() {
    const e = M?.getBoundingClientRect();
    e && (o.hasChildNodes() && (o.innerHTML = "", l.emit("grid:clear", void 0)), C(e.width, e.height), f !== null && window.clearTimeout(f), f = window.setTimeout(() => {
      D(), E && $(), o && o.scrollHeight > o.clientHeight && (C(o.clientWidth, e.height), D(), E && $()), f = null, E && setTimeout(() => {
        l.emit("initial:scroll:end", A());
      }, 500);
    }, 400));
  }
  function $() {
    if (!t) return;
    const e = t.height + a, c = Math.round(o.scrollTop / e) + h;
    o.querySelectorAll(".block").forEach((i) => {
      parseInt(i.dataset.row || "0", 10) < c ? i.classList.add("above-header") : i.classList.remove("above-header");
    });
  }
  function j(e) {
    const d = Array.from(o.querySelectorAll(".block"));
    if (d.length === 0) {
      e();
      return;
    }
    b !== null && (window.clearTimeout(b), b = null);
    let c = 0;
    d.forEach((i) => {
      const v = parseInt(i.dataset.row || "0", 10), w = parseInt(i.dataset.column || "0", 10), B = (v % 2 === 0 ? w : t.cols - 1 - w) * p;
      i.style.setProperty("--fade-delay", `${B}ms`), i.classList.add("fade-out"), B > c && (c = B);
    });
    const r = c + u + 20;
    b = window.setTimeout(() => {
      b = null, e();
    }, r);
  }
  function H() {
    P(), o.addEventListener("scroll", V, { passive: !0 }), window.addEventListener("resize", _), window.addEventListener("popstate", L), x = "onscrollend" in window, x ? o.addEventListener("scrollend", F) : o.addEventListener("scroll", G, { passive: !0 });
  }
  function J() {
    l.clear(), o.removeEventListener("scroll", V), window.removeEventListener("resize", _), window.removeEventListener("popstate", L), x ? o.removeEventListener("scrollend", F) : (S && window.clearTimeout(S), o.removeEventListener("scroll", G)), f !== null && (window.clearTimeout(f), f = null), b !== null && (window.clearTimeout(b), b = null);
  }
  function K(e) {
    k = e, z(T, () => Y()), window.setTimeout(U, y);
  }
  function Q() {
    return t;
  }
  return { init: H, destroy: J, setItems: K, events: l, getLayout: Q };
}
export {
  nt as createGridList,
  tt as findBestBlockSize,
  ot as findNaiveBlockSize
};
