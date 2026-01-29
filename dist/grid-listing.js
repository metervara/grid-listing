const tt = (s, o, u, v, n, r) => {
  const S = Math.max(1, Math.ceil((s + n) / (u * r + n))), N = Math.max(S, Math.floor((s + n) / (u / r + n))), w = Math.max(1, Math.ceil((o + n) / (v * r + n))), I = Math.max(w, Math.floor((o + n) / (v / r + n))), x = n > 0 ? Math.floor(s / n) + 1 : Number.POSITIVE_INFINITY, R = n > 0 ? Math.floor(o / n) + 1 : Number.POSITIVE_INFINITY, k = Math.max(1, Math.floor(s)), $ = Math.max(1, Math.floor(o)), h = Math.min(N, x, k), p = Math.min(I, R, $);
  return { cMin: S, cMax: h, rMin: w, rMax: p };
}, et = (s, o, u, v, n, r = {}) => {
  const S = r.weightSize ?? 1, N = r.weightAR ?? 1, w = r.alpha ?? 1.5, I = u / v, x = tt(s, o, u, v, n, w), R = 1, k = 1, $ = Math.min(x.cMax, r.maxCols ?? Number.POSITIVE_INFINITY), h = Math.min(x.rMax, r.maxRows ?? Number.POSITIVE_INFINITY);
  let p = null;
  const T = (d, l) => {
    if (d < R || l < k || d > $ || l > h) return;
    const M = s - (d - 1) * n, c = o - (l - 1) * n;
    if (M <= 0 || c <= 0) return;
    const y = M / d, g = c / l;
    if (r.integerBlockSize && (!Number.isInteger(y) || !Number.isInteger(g)) || y < u / w || y > u * w || g < v / w || g > v * w) return;
    const L = Math.hypot((y - u) / u, (g - v) / v), z = Math.abs(y / g - I) / I, D = S * L + N * z;
    (!p || D < p.score) && (p = { width: y, height: g, cols: d, rows: l, score: D, sizeError: L, arError: z });
  };
  for (let d = x.cMin; d <= $; d++) {
    const l = s - (d - 1) * n;
    if (l <= 0) break;
    const M = l / d;
    if (M < u / w || M > u * w) continue;
    const c = (o + n) / (n + M / I), y = /* @__PURE__ */ new Set();
    for (let g = -2; g <= 2; g++) {
      const L = Math.round(c + g);
      L >= k && L <= h && y.add(L);
    }
    y.add(x.rMin), y.add(h);
    for (const g of y) T(d, g);
  }
  if (!p)
    for (let d = x.cMin; d <= $; d++)
      for (let l = x.rMin; l <= h; l++) T(d, l);
  if (!p)
    throw new Error("No feasible grid found with given settings/tolerance.");
  return p;
}, ot = (s, o, u, v, n) => {
  const r = Math.max(1, Math.round(s / u)), S = Math.max(1, Math.round(o / v)), N = s - n * Math.max(0, r - 1), w = o - n * Math.max(0, S - 1), I = N / r, x = w / S;
  return { width: I, height: x, cols: r, rows: S };
};
function at(s) {
  const o = s.gridEl, u = s.headerEl ?? null, v = s.measureViewportEl ?? null, n = s.desiredBlockSize ?? { width: 400, height: 300 }, r = s.gap ?? 10, S = s.fadeOutDurationMs ?? 200, N = s.staggerStepMs ?? 75, w = s.fadeStaggerStepMs ?? 50, I = s.initialResizeDelayFrames ?? 2, x = s.initialScrollDelayMs ?? 1750, R = s.filterScrollDelayMs ?? 400;
  let k = [], $ = [];
  const h = /* @__PURE__ */ new Set();
  let p = null, T = !1, d = !1, l = null, M = null, c, y = 0;
  const g = () => O(), L = () => H(), z = () => {
    _(), q(), Y(() => V());
  };
  function D() {
    const t = document.documentElement.style;
    t.setProperty("--block-gap", `${r}px`), t.setProperty("--fade-out-duration", `${S}ms`);
    const a = Math.max(0, x - 250);
    t.setProperty("--header-fade-delay", `${a}ms`);
  }
  function U(t, e) {
    if (t <= 0) {
      e();
      return;
    }
    requestAnimationFrame(() => U(t - 1, e));
  }
  function B(t, e) {
    c = et(t, e, n.width, n.height, r), y = 1;
    const a = document.documentElement.style;
    a.setProperty("--block-width", `${c.width}px`), a.setProperty("--block-height", `${c.height}px`), a.setProperty("--cols", String(c.cols)), a.setProperty("--rows", String(c.rows)), a.setProperty("--block-gap", `${r}px`), a.setProperty("--header-row", `${y}`);
  }
  function C() {
    if (!c) return;
    o.innerHTML = "";
    const t = document.createElement("div");
    t.className = "row-spacer col-0", o.appendChild(t);
    const e = k.filter((f) => h.size === 0 ? !0 : (f.tags || []).some((E) => h.has(E)));
    e.forEach((f, i) => {
      const E = Math.floor(i / c.cols), m = i % c.cols, b = j(f);
      b.dataset.row = `${E}`, b.dataset.column = `${m}`, b.classList.add(`row-${E}`), b.classList.add(`col-${m}`);
      const Z = (E % 2 === 0 ? m : c.cols - 1 - m) * N, W = i * w;
      b.style.transitionDelay = `${Z}ms`, b.style.setProperty("--fade-delay", `${W}ms`), b.classList.add("fade-in"), o.appendChild(b);
    });
    const a = Math.ceil(e.length / c.cols) + 1;
    for (let f = 0; f < a; f++) {
      const i = document.createElement("div");
      i.className = "snap-block", i.dataset.row = `${f}`, i.style.top = `${f * (c.height + r)}px`, o.appendChild(i);
    }
  }
  function j(t) {
    const e = t.title, f = (Array.isArray(t.thumbnails) ? t.thumbnails : [])[0], i = (t.tags || []).sort((m, b) => m.localeCompare(b)), E = document.createElement("div");
    return E.className = "block", E.innerHTML = `
      ${f ? `<div class="media"><img class="thumb" src="${f}" alt="${e}"></div>` : ""}
      <div class="content block-border">
        <div class="info">
          <h3>${e}</h3>
        </div>
        <div class="tags">
          ${i.map((m) => `<button class="tag${h.has(m) ? " active" : ""}" data-tag="${m}">${m}</button>`).join("")}
        </div>
      </div>
      <svg class="checker-border" xmlns="http://www.w3.org/2000/svg">
        <rect class="dash black" />
        <rect class="dash white" />
      </svg>
    `, t.href && E.addEventListener("click", () => {
      window.location.href = t.href;
    }), E.querySelectorAll(".tag").forEach((m) => {
      m.addEventListener("click", (b) => {
        b.preventDefault(), b.stopPropagation();
        const A = m.getAttribute("data-tag");
        A && G(A);
      });
    }), E;
  }
  function O() {
    P(), T = !0;
  }
  function V() {
    const t = v?.getBoundingClientRect();
    if (!t) {
      console.warn("[grid] measureViewport element not found");
      return;
    }
    B(t.width, t.height), C(), T && P(), o && o.scrollHeight > o.clientHeight && (B(o.clientWidth, t.height), C(), T && P()), d || (d = !0, document.body.classList.add("layout-ready"));
  }
  function H() {
    const t = v?.getBoundingClientRect();
    if (!t) return;
    B(t.width, t.height), o.innerHTML = "";
    const e = document.createElement("div");
    e.className = "row-spacer col-0", o.appendChild(e), l !== null && window.clearTimeout(l), l = window.setTimeout(() => {
      C(), T && P(), o && o.scrollHeight > o.clientHeight && (B(o.clientWidth, t.height), C(), T && P()), l = null;
    }, 400);
  }
  function P() {
    if (!c) return;
    const t = c.height + r, a = Math.round(o.scrollTop / t) + y;
    o.querySelectorAll(".block").forEach((i) => {
      parseInt(i.dataset.row || "0", 10) < a ? i.classList.add("above-header") : i.classList.remove("above-header");
    });
  }
  function q() {
    p && (p.innerHTML = "", $.forEach((t) => {
      const e = document.createElement("button");
      e.type = "button", e.className = "tag", e.textContent = t, e.dataset.tag = t, h.has(t) && e.classList.add("active"), e.addEventListener("click", (a) => {
        a.preventDefault(), a.stopPropagation(), G(t);
      }), p.appendChild(e);
    }));
  }
  function G(t) {
    h.has(t) ? h.delete(t) : h.add(t), q(), T = !1, Y(() => V()), window.setTimeout(() => O(), R), J();
  }
  function Y(t) {
    const e = Array.from(o.querySelectorAll(".block"));
    if (e.length === 0) {
      t();
      return;
    }
    M !== null && (window.clearTimeout(M), M = null);
    let a = 0;
    e.forEach((i) => {
      const E = parseInt(i.dataset.row || "0", 10), m = parseInt(i.dataset.column || "0", 10), F = (E % 2 === 0 ? m : c.cols - 1 - m) * w;
      i.style.setProperty("--fade-delay", `${F}ms`), i.classList.add("fade-out"), F > a && (a = F);
    });
    const f = a + S + 20;
    M = window.setTimeout(() => {
      M = null, t();
    }, f);
  }
  function J() {
    const t = new URLSearchParams(location.search), e = Array.from(h);
    e.length ? t.set("tags", e.join(",")) : t.delete("tags");
    const a = t.toString(), f = a ? `${location.pathname}?${a}` : location.pathname;
    history.pushState(null, "", f);
  }
  function _() {
    h.clear();
    const e = new URLSearchParams(location.search).get("tags");
    e && e.split(",").filter(Boolean).forEach((a) => h.add(a));
  }
  function K() {
    u && (p = document.createElement("div"), p.className = "tags", u.appendChild(p)), D(), o.addEventListener("scroll", g, { passive: !0 }), window.addEventListener("resize", L), window.addEventListener("popstate", z);
  }
  function Q() {
    o.removeEventListener("scroll", g), window.removeEventListener("resize", L), window.removeEventListener("popstate", z), l !== null && (window.clearTimeout(l), l = null), M !== null && (window.clearTimeout(M), M = null);
  }
  function X(t) {
    k = t, $ = Array.from(new Set(k.flatMap((e) => e.tags || []))).sort((e, a) => e.localeCompare(a)), _(), q(), U(I, () => V()), window.setTimeout(() => O(), x);
  }
  return { init: K, destroy: Q, setItems: X };
}
export {
  at as createGridList,
  et as findBestBlockSize,
  ot as findNaiveBlockSize
};
