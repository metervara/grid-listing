const Z = (s, c, e, M, n, a) => {
  const d = Math.max(1, Math.ceil((s + n) / (e * a + n))), I = Math.max(d, Math.floor((s + n) / (e / a + n))), p = Math.max(1, Math.ceil((c + n) / (M * a + n))), T = Math.max(p, Math.floor((c + n) / (M / a + n))), y = n > 0 ? Math.floor(s / n) + 1 : Number.POSITIVE_INFINITY, N = n > 0 ? Math.floor(c / n) + 1 : Number.POSITIVE_INFINITY, L = Math.max(1, Math.floor(s)), E = Math.max(1, Math.floor(c)), R = Math.min(I, y, L), f = Math.min(T, N, E);
  return { cMin: d, cMax: R, rMin: p, rMax: f };
}, W = (s, c, e, M, n, a = {}) => {
  const d = a.weightSize ?? 1, I = a.weightAR ?? 1, p = a.alpha ?? 1.5, T = e / M, y = Z(s, c, e, M, n, p), N = 1, L = 1, E = Math.min(y.cMax, a.maxCols ?? Number.POSITIVE_INFINITY), R = Math.min(y.rMax, a.maxRows ?? Number.POSITIVE_INFINITY);
  let f = null;
  const x = (o, u) => {
    if (o < N || u < L || o > E || u > R) return;
    const S = s - (o - 1) * n, g = c - (u - 1) * n;
    if (S <= 0 || g <= 0) return;
    const b = S / o, m = g / u;
    if (a.integerBlockSize && (!Number.isInteger(b) || !Number.isInteger(m)) || b < e / p || b > e * p || m < M / p || m > M * p) return;
    const k = Math.hypot((b - e) / e, (m - M) / M), P = Math.abs(b / m - T) / T, B = d * k + I * P;
    (!f || B < f.score) && (f = { width: b, height: m, cols: o, rows: u, score: B, sizeError: k, arError: P });
  };
  for (let o = y.cMin; o <= E; o++) {
    const u = s - (o - 1) * n;
    if (u <= 0) break;
    const S = u / o;
    if (S < e / p || S > e * p) continue;
    const g = (c + n) / (n + S / T), b = /* @__PURE__ */ new Set();
    for (let m = -2; m <= 2; m++) {
      const k = Math.round(g + m);
      k >= L && k <= R && b.add(k);
    }
    b.add(y.rMin), b.add(R);
    for (const m of b) x(o, m);
  }
  if (!f)
    for (let o = y.cMin; o <= E; o++)
      for (let u = y.rMin; u <= R; u++) x(o, u);
  if (!f)
    throw new Error("No feasible grid found with given settings/tolerance.");
  return f;
}, et = (s, c, e, M, n) => {
  const a = Math.max(1, Math.round(s / e)), d = Math.max(1, Math.round(c / M)), I = s - n * Math.max(0, a - 1), p = c - n * Math.max(0, d - 1), T = I / a, y = p / d;
  return { width: T, height: y, cols: a, rows: d };
};
function tt() {
  const s = /* @__PURE__ */ new Map();
  return { on: (n, a) => {
    let d = s.get(n);
    return d || s.set(n, d = /* @__PURE__ */ new Set()), d.add(a), () => d.delete(a);
  }, emit: (n, a) => {
    const d = s.get(n);
    d && [...d].forEach((I) => I(a));
  }, clear: () => s.clear() };
}
function ot(s) {
  const c = tt(), e = s.gridEl, M = s.measureViewportEl ?? null, n = s.desiredBlockSize ?? { width: 400, height: 300 }, a = s.gap ?? 10, d = s.fadeOutDurationMs ?? 200, I = s.staggerStepMs ?? 75, p = s.fadeStaggerStepMs ?? 50, T = s.initialResizeDelayFrames ?? 2, y = s.initialScrollDelayMs ?? 1750, N = s.additionalSpacerRows ?? !1;
  let L = [], E = !1, R = !1, f = null, x = null, o, u = 0, S, g = null, b = 100, m = !1;
  function k() {
    j(() => Y());
  }
  function P() {
    const t = document.documentElement.style;
    t.setProperty("--block-gap", `${a}px`), t.setProperty("--fade-out-duration", `${d}ms`);
    const r = Math.max(0, y - 250);
    t.setProperty("--header-fade-delay", `${r}ms`);
  }
  function B(t, i) {
    if (t <= 0) {
      i();
      return;
    }
    requestAnimationFrame(() => B(t - 1, i));
  }
  function D(t, i) {
    o = W(t, i, n.width, n.height, a), u = 1;
    const r = document.documentElement.style;
    r.setProperty("--block-width", `${o.width}px`), r.setProperty("--block-height", `${o.height}px`), r.setProperty("--cols", String(o.cols)), r.setProperty("--rows", String(o.rows)), r.setProperty("--block-gap", `${a}px`), r.setProperty("--header-row", `${u}`);
  }
  function C() {
    if (!o) return;
    e.innerHTML = "";
    const t = document.createElement("div");
    t.className = "row-spacer col-0", e.appendChild(t), L.forEach((r, l) => {
      const h = Math.floor(l / o.cols), v = l % o.cols, w = q(r);
      w.dataset.row = `${h}`, w.dataset.column = `${v}`, w.classList.add(`row-${h}`), w.classList.add(`col-${v}`);
      const z = (h % 2 === 0 ? v : o.cols - 1 - v) * I, X = l * p;
      w.style.transitionDelay = `${z}ms`, w.style.setProperty("--fade-delay", `${X}ms`), w.classList.add("fade-in"), e.appendChild(w);
    });
    let i = Math.ceil(L.length / o.cols) + 1;
    if (N) {
      const r = o.rows - (u + 1), l = Math.max(0, r - 1);
      for (let h = 0; h < l; h++) {
        const v = document.createElement("div");
        v.className = `row-spacer col-${h + i}`, e.appendChild(v);
      }
      i += l;
    }
    for (let r = 0; r < i; r++) {
      const l = document.createElement("div");
      l.className = "snap-block", l.dataset.row = `${r}`, l.style.top = `${r * (o.height + a)}px`, e.appendChild(l);
    }
  }
  function q(t) {
    const i = t.title, l = (Array.isArray(t.thumbnails) ? t.thumbnails : [])[0], h = (t.tags || []).sort((w, O) => w.localeCompare(O)), v = document.createElement("div");
    return v.className = "block", v.innerHTML = `
      ${l ? `<div class="media"><img class="thumb" src="${l}" alt="${i}"></div>` : ""}
      <div class="content block-border">
        <div class="info">
          <h3>${i}</h3>
          </div>
          <div class="tags">
            ${h.map((w) => `<div class="tag" data-tag="${w}">${w}</div>`).join("")}
          </div>
      </div>
      <svg class="checker-border" xmlns="http://www.w3.org/2000/svg">
        <rect class="dash black" />
        <rect class="dash white" />
      </svg>
    `, t.href && v.addEventListener("click", () => {
      window.location.href = t.href;
    }), v;
  }
  function A() {
    const t = o.height + a, i = Math.round(e.scrollTop / t), r = i + o.rows - 2, l = i + u;
    return {
      aboveHeader: l - 1 >= i && l - 1 <= r ? l - 1 : void 0,
      belowHeader: l >= i && l <= r ? l : void 0
      // belowHeader: headerAbsoluteRow, // + 1 // +1 omitted here since header row is not an actual row
    };
  }
  function U() {
    $(), E = !0, setTimeout(() => {
      const t = A();
      c.emit("initial:scroll:end", t);
    }, 500);
  }
  function V() {
    m || c.emit("scroll:start", void 0), m = !0, $();
  }
  function F() {
    if (m) {
      const t = A();
      c.emit("scroll:end", t);
    }
    m = !1;
  }
  function G() {
    g && window.clearTimeout(g), g = window.setTimeout(() => {
      F();
    }, b);
  }
  function Y() {
    const t = M?.getBoundingClientRect();
    if (!t) {
      console.warn("[grid] measureViewport element not found");
      return;
    }
    D(t.width, t.height), C(), E && $(), e && e.scrollHeight > e.clientHeight && (D(e.clientWidth, t.height), C(), E && $()), R || (R = !0, document.body.classList.add("layout-ready")), E && setTimeout(() => {
      c.emit("initial:scroll:end", A());
    }, 500);
  }
  function _() {
    const t = M?.getBoundingClientRect();
    if (!t) return;
    D(t.width, t.height), e.innerHTML = "";
    const i = document.createElement("div");
    i.className = "row-spacer col-0", e.appendChild(i), f !== null && window.clearTimeout(f), f = window.setTimeout(() => {
      C(), E && $(), e && e.scrollHeight > e.clientHeight && (D(e.clientWidth, t.height), C(), E && $()), f = null, E && setTimeout(() => {
        c.emit("initial:scroll:end", A());
      }, 500);
    }, 400);
  }
  function $() {
    if (!o) return;
    const t = o.height + a, r = Math.round(e.scrollTop / t) + u;
    e.querySelectorAll(".block").forEach((h) => {
      parseInt(h.dataset.row || "0", 10) < r ? h.classList.add("above-header") : h.classList.remove("above-header");
    });
  }
  function j(t) {
    const i = Array.from(e.querySelectorAll(".block"));
    if (i.length === 0) {
      t();
      return;
    }
    x !== null && (window.clearTimeout(x), x = null);
    let r = 0;
    i.forEach((h) => {
      const v = parseInt(h.dataset.row || "0", 10), w = parseInt(h.dataset.column || "0", 10), z = (v % 2 === 0 ? w : o.cols - 1 - w) * p;
      h.style.setProperty("--fade-delay", `${z}ms`), h.classList.add("fade-out"), z > r && (r = z);
    });
    const l = r + d + 20;
    x = window.setTimeout(() => {
      x = null, t();
    }, l);
  }
  function H() {
    P(), e.addEventListener("scroll", V, { passive: !0 }), window.addEventListener("resize", _), window.addEventListener("popstate", k), S = "onscrollend" in window, S ? e.addEventListener("scrollend", F) : e.addEventListener("scroll", G, { passive: !0 });
  }
  function J() {
    c.clear(), e.removeEventListener("scroll", V), window.removeEventListener("resize", _), window.removeEventListener("popstate", k), S ? e.removeEventListener("scrollend", F) : (g && window.clearTimeout(g), e.removeEventListener("scroll", G)), f !== null && (window.clearTimeout(f), f = null), x !== null && (window.clearTimeout(x), x = null);
  }
  function K(t) {
    L = t, B(T, () => Y()), window.setTimeout(U, y);
  }
  return { init: H, destroy: J, setItems: K, events: c };
}
export {
  ot as createGridList,
  W as findBestBlockSize,
  et as findNaiveBlockSize
};
