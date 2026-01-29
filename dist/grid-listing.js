const lt = (a, h, e, p, n, l) => {
  const i = Math.max(1, Math.ceil((a + n) / (e * l + n))), x = Math.max(i, Math.floor((a + n) / (e / l + n))), y = Math.max(1, Math.ceil((h + n) / (p * l + n))), I = Math.max(y, Math.floor((h + n) / (p / l + n))), S = n > 0 ? Math.floor(a / n) + 1 : Number.POSITIVE_INFINITY, N = n > 0 ? Math.floor(h / n) + 1 : Number.POSITIVE_INFINITY, P = Math.max(1, Math.floor(a)), L = Math.max(1, Math.floor(h)), R = Math.min(x, S, P), u = Math.min(I, N, L);
  return { cMin: i, cMax: R, rMin: y, rMax: u };
}, it = (a, h, e, p, n, l = {}) => {
  const i = l.weightSize ?? 1, x = l.weightAR ?? 1, y = l.alpha ?? 1.5, I = e / p, S = lt(a, h, e, p, n, y), N = 1, P = 1, L = Math.min(S.cMax, l.maxCols ?? Number.POSITIVE_INFINITY), R = Math.min(S.rMax, l.maxRows ?? Number.POSITIVE_INFINITY);
  let u = null;
  const k = (c, M) => {
    if (c < N || M < P || c > L || M > R) return;
    const g = a - (c - 1) * n, b = h - (M - 1) * n;
    if (g <= 0 || b <= 0) return;
    const r = g / c, f = b / M;
    if (l.integerBlockSize && (!Number.isInteger(r) || !Number.isInteger(f)) || r < e / y || r > e * y || f < p / y || f > p * y) return;
    const T = Math.hypot((r - e) / e, (f - p) / p), $ = Math.abs(r / f - I) / I, D = i * T + x * $;
    (!u || D < u.score) && (u = { width: r, height: f, cols: c, rows: M, score: D, sizeError: T, arError: $ });
  };
  for (let c = S.cMin; c <= L; c++) {
    const M = a - (c - 1) * n;
    if (M <= 0) break;
    const g = M / c;
    if (g < e / y || g > e * y) continue;
    const b = (h + n) / (n + g / I), r = /* @__PURE__ */ new Set();
    for (let f = -2; f <= 2; f++) {
      const T = Math.round(b + f);
      T >= P && T <= R && r.add(T);
    }
    r.add(S.rMin), r.add(R);
    for (const f of r) k(c, f);
  }
  if (!u)
    for (let c = S.cMin; c <= L; c++)
      for (let M = S.rMin; M <= R; M++) k(c, M);
  if (!u)
    throw new Error("No feasible grid found with given settings/tolerance.");
  return u;
}, dt = (a, h, e, p, n) => {
  const l = Math.max(1, Math.round(a / e)), i = Math.max(1, Math.round(h / p)), x = a - n * Math.max(0, l - 1), y = h - n * Math.max(0, i - 1), I = x / l, S = y / i;
  return { width: I, height: S, cols: l, rows: i };
};
function ct() {
  const a = /* @__PURE__ */ new Map();
  return { on: (n, l) => {
    let i = a.get(n);
    return i || a.set(n, i = /* @__PURE__ */ new Set()), i.add(l), () => i.delete(l);
  }, emit: (n, l) => {
    const i = a.get(n);
    i && [...i].forEach((x) => x(l));
  }, clear: () => a.clear() };
}
function ut(a) {
  const h = ct(), e = a.gridEl, p = a.headerEl ?? null, n = a.measureViewportEl ?? null, l = a.desiredBlockSize ?? { width: 400, height: 300 }, i = a.gap ?? 10, x = a.fadeOutDurationMs ?? 200, y = a.staggerStepMs ?? 75, I = a.fadeStaggerStepMs ?? 50, S = a.initialResizeDelayFrames ?? 2, N = a.initialScrollDelayMs ?? 1750, P = a.filterScrollDelayMs ?? 400;
  let L = [], R = [];
  const u = /* @__PURE__ */ new Set();
  let k = null, c = !1, M = !1, g = null, b = null, r, f = 0, T, $ = null, D = 100, B = !1;
  function G() {
    Z(), q(), X(() => U());
  }
  function W() {
    const t = document.documentElement.style;
    t.setProperty("--block-gap", `${i}px`), t.setProperty("--fade-out-duration", `${x}ms`);
    const s = Math.max(0, N - 250);
    t.setProperty("--header-fade-delay", `${s}ms`);
  }
  function Y(t, o) {
    if (t <= 0) {
      o();
      return;
    }
    requestAnimationFrame(() => Y(t - 1, o));
  }
  function C(t, o) {
    r = it(t, o, l.width, l.height, i), f = 1;
    const s = document.documentElement.style;
    s.setProperty("--block-width", `${r.width}px`), s.setProperty("--block-height", `${r.height}px`), s.setProperty("--cols", String(r.cols)), s.setProperty("--rows", String(r.rows)), s.setProperty("--block-gap", `${i}px`), s.setProperty("--header-row", `${f}`);
  }
  function A() {
    if (!r) return;
    e.innerHTML = "";
    const t = document.createElement("div");
    t.className = "row-spacer col-0", e.appendChild(t);
    const o = L.filter((m) => u.size === 0 ? !0 : (m.tags || []).some((v) => u.has(v)));
    o.forEach((m, d) => {
      const v = Math.floor(d / r.cols), w = d % r.cols, E = tt(m);
      E.dataset.row = `${v}`, E.dataset.column = `${w}`, E.classList.add(`row-${v}`), E.classList.add(`col-${w}`);
      const at = (v % 2 === 0 ? w : r.cols - 1 - w) * y, rt = d * I;
      E.style.transitionDelay = `${at}ms`, E.style.setProperty("--fade-delay", `${rt}ms`), E.classList.add("fade-in"), e.appendChild(E);
    });
    const s = Math.ceil(o.length / r.cols) + 1;
    for (let m = 0; m < s; m++) {
      const d = document.createElement("div");
      d.className = "snap-block", d.dataset.row = `${m}`, d.style.top = `${m * (r.height + i)}px`, e.appendChild(d);
    }
  }
  function tt(t) {
    const o = t.title, m = (Array.isArray(t.thumbnails) ? t.thumbnails : [])[0], d = (t.tags || []).sort((w, E) => w.localeCompare(E)), v = document.createElement("div");
    return v.className = "block", v.innerHTML = `
      ${m ? `<div class="media"><img class="thumb" src="${m}" alt="${o}"></div>` : ""}
      <div class="content block-border">
        <div class="info">
          <h3>${o}</h3>
        </div>
        <div class="tags">
          ${d.map((w) => `<button class="tag${u.has(w) ? " active" : ""}" data-tag="${w}">${w}</button>`).join("")}
        </div>
      </div>
      <svg class="checker-border" xmlns="http://www.w3.org/2000/svg">
        <rect class="dash black" />
        <rect class="dash white" />
      </svg>
    `, t.href && v.addEventListener("click", () => {
      window.location.href = t.href;
    }), v.querySelectorAll(".tag").forEach((w) => {
      w.addEventListener("click", (E) => {
        E.preventDefault(), E.stopPropagation();
        const F = w.getAttribute("data-tag");
        F && Q(F);
      });
    }), v;
  }
  function _() {
    const t = r.height + i, s = Math.round(e.scrollTop / t) + f;
    return {
      aboveHeader: s - 1,
      belowHeader: s + 1
    };
  }
  function j() {
    z(), c = !0, setTimeout(() => {
      const t = _();
      h.emit("initial:scroll:end", t);
    }, 500);
  }
  function H() {
    B || h.emit("scroll:start", void 0), B = !0, z();
  }
  function V() {
    if (B) {
      const t = _();
      h.emit("scroll:end", t);
    }
    B = !1;
  }
  function J() {
    $ && window.clearTimeout($), $ = window.setTimeout(() => {
      V();
    }, D);
  }
  function U() {
    const t = n?.getBoundingClientRect();
    if (!t) {
      console.warn("[grid] measureViewport element not found");
      return;
    }
    C(t.width, t.height), A(), c && z(), e && e.scrollHeight > e.clientHeight && (C(e.clientWidth, t.height), A(), c && z()), M || (M = !0, document.body.classList.add("layout-ready"));
  }
  function K() {
    const t = n?.getBoundingClientRect();
    if (!t) return;
    C(t.width, t.height), e.innerHTML = "";
    const o = document.createElement("div");
    o.className = "row-spacer col-0", e.appendChild(o), g !== null && window.clearTimeout(g), g = window.setTimeout(() => {
      A(), c && z(), e && e.scrollHeight > e.clientHeight && (C(e.clientWidth, t.height), A(), c && z()), g = null;
    }, 400);
  }
  function z() {
    if (!r) return;
    const t = r.height + i, s = Math.round(e.scrollTop / t) + f;
    e.querySelectorAll(".block").forEach((d) => {
      parseInt(d.dataset.row || "0", 10) < s ? d.classList.add("above-header") : d.classList.remove("above-header");
    });
  }
  function q() {
    k && (k.innerHTML = "", R.forEach((t) => {
      const o = document.createElement("button");
      o.type = "button", o.className = "tag", o.textContent = t, o.dataset.tag = t, u.has(t) && o.classList.add("active"), o.addEventListener("click", (s) => {
        s.preventDefault(), s.stopPropagation(), Q(t);
      }), k.appendChild(o);
    }));
  }
  function Q(t) {
    u.has(t) ? u.delete(t) : u.add(t), q(), c = !1, X(() => U()), window.setTimeout(j, P), et();
  }
  function X(t) {
    const o = Array.from(e.querySelectorAll(".block"));
    if (o.length === 0) {
      t();
      return;
    }
    b !== null && (window.clearTimeout(b), b = null);
    let s = 0;
    o.forEach((d) => {
      const v = parseInt(d.dataset.row || "0", 10), w = parseInt(d.dataset.column || "0", 10), O = (v % 2 === 0 ? w : r.cols - 1 - w) * I;
      d.style.setProperty("--fade-delay", `${O}ms`), d.classList.add("fade-out"), O > s && (s = O);
    });
    const m = s + x + 20;
    b = window.setTimeout(() => {
      b = null, t();
    }, m);
  }
  function et() {
    const t = new URLSearchParams(location.search), o = Array.from(u);
    o.length ? t.set("tags", o.join(",")) : t.delete("tags");
    const s = t.toString(), m = s ? `${location.pathname}?${s}` : location.pathname;
    history.pushState(null, "", m);
  }
  function Z() {
    u.clear();
    const o = new URLSearchParams(location.search).get("tags");
    o && o.split(",").filter(Boolean).forEach((s) => u.add(s));
  }
  function ot() {
    p && (k = document.createElement("div"), k.className = "tags", p.appendChild(k)), W(), e.addEventListener("scroll", H, { passive: !0 }), window.addEventListener("resize", K), window.addEventListener("popstate", G), T = "onscrollend" in window, T ? e.addEventListener("scrollend", V) : e.addEventListener("scroll", J, { passive: !0 });
  }
  function nt() {
    h.clear(), e.removeEventListener("scroll", H), window.removeEventListener("resize", K), window.removeEventListener("popstate", G), T ? e.removeEventListener("scrollend", V) : ($ && window.clearTimeout($), e.removeEventListener("scroll", J)), g !== null && (window.clearTimeout(g), g = null), b !== null && (window.clearTimeout(b), b = null);
  }
  function st(t) {
    L = t, R = Array.from(new Set(L.flatMap((o) => o.tags || []))).sort((o, s) => o.localeCompare(s)), Z(), q(), Y(S, () => U()), window.setTimeout(j, N);
  }
  return { init: ot, destroy: nt, setItems: st, events: h };
}
export {
  ut as createGridList,
  it as findBestBlockSize,
  dt as findNaiveBlockSize
};
