const tt = (r, i, e, w, s, a) => {
  const d = Math.max(1, Math.ceil((r + s) / (e * a + s))), R = Math.max(d, Math.floor((r + s) / (e / a + s))), M = Math.max(1, Math.ceil((i + s) / (w * a + s))), T = Math.max(M, Math.floor((i + s) / (w / a + s))), v = s > 0 ? Math.floor(r / s) + 1 : Number.POSITIVE_INFINITY, z = s > 0 ? Math.floor(i / s) + 1 : Number.POSITIVE_INFINITY, $ = Math.max(1, Math.floor(r)), y = Math.max(1, Math.floor(i)), L = Math.min(R, v, $), f = Math.min(T, z, y);
  return { cMin: d, cMax: L, rMin: M, rMax: f };
}, et = (r, i, e, w, s, a = {}) => {
  const d = a.weightSize ?? 1, R = a.weightAR ?? 1, M = a.alpha ?? 1.5, T = e / w, v = tt(r, i, e, w, s, M), z = 1, $ = 1, y = Math.min(v.cMax, a.maxCols ?? Number.POSITIVE_INFINITY), L = Math.min(v.rMax, a.maxRows ?? Number.POSITIVE_INFINITY);
  let f = null;
  const b = (t, h) => {
    if (t < z || h < $ || t > y || h > L) return;
    const S = r - (t - 1) * s, I = i - (h - 1) * s;
    if (S <= 0 || I <= 0) return;
    const E = S / t, m = I / h;
    if (a.integerBlockSize && (!Number.isInteger(E) || !Number.isInteger(m)) || E < e / M || E > e * M || m < w / M || m > w * M) return;
    const k = Math.hypot((E - e) / e, (m - w) / w), C = Math.abs(E / m - T) / T, B = d * k + R * C;
    (!f || B < f.score) && (f = { width: E, height: m, cols: t, rows: h, score: B, sizeError: k, arError: C });
  };
  for (let t = v.cMin; t <= y; t++) {
    const h = r - (t - 1) * s;
    if (h <= 0) break;
    const S = h / t;
    if (S < e / M || S > e * M) continue;
    const I = (i + s) / (s + S / T), E = /* @__PURE__ */ new Set();
    for (let m = -2; m <= 2; m++) {
      const k = Math.round(I + m);
      k >= $ && k <= L && E.add(k);
    }
    E.add(v.rMin), E.add(L);
    for (const m of E) b(t, m);
  }
  if (!f)
    for (let t = v.cMin; t <= y; t++)
      for (let h = v.rMin; h <= L; h++) b(t, h);
  if (!f)
    throw new Error("No feasible grid found with given settings/tolerance.");
  return f;
}, nt = (r, i, e, w, s) => {
  const a = Math.max(1, Math.round(r / e)), d = Math.max(1, Math.round(i / w)), R = r - s * Math.max(0, a - 1), M = i - s * Math.max(0, d - 1), T = R / a, v = M / d;
  return { width: T, height: v, cols: a, rows: d };
};
function ot() {
  const r = /* @__PURE__ */ new Map();
  return { on: (s, a) => {
    let d = r.get(s);
    return d || r.set(s, d = /* @__PURE__ */ new Set()), d.add(a), () => d.delete(a);
  }, emit: (s, a) => {
    const d = r.get(s);
    d && [...d].forEach((R) => R(a));
  }, clear: () => r.clear() };
}
function st(r) {
  const i = ot(), e = r.gridEl, w = r.measureViewportEl ?? null, s = r.desiredBlockSize ?? { width: 400, height: 300 }, a = r.gap ?? 10, d = r.fadeOutDurationMs ?? 200, R = r.staggerStepMs ?? 75, M = r.fadeStaggerStepMs ?? 50, T = r.initialResizeDelayFrames ?? 2, v = r.initialScrollDelayMs ?? 1750, z = r.additionalSpacerRows ?? !1;
  let $ = [], y = !1, L = !1, f = null, b = null, t, h = 0, S, I = null, E = 100, m = !1;
  function k() {
    U(() => Y());
  }
  function C() {
    const o = document.documentElement.style;
    o.setProperty("--block-gap", `${a}px`), o.setProperty("--fade-out-duration", `${d}ms`);
    const u = Math.max(0, v - 250);
    o.setProperty("--header-fade-delay", `${u}ms`);
  }
  function B(o, c) {
    if (o <= 0) {
      c();
      return;
    }
    requestAnimationFrame(() => B(o - 1, c));
  }
  function P(o, c) {
    const u = t?.cols || -1, l = t?.rows || -1;
    t = et(o, c, s.width, s.height, a), h = 1;
    const n = document.documentElement.style;
    n.setProperty("--block-width", `${t.width}px`), n.setProperty("--block-height", `${t.height}px`), n.setProperty("--cols", String(t.cols)), n.setProperty("--rows", String(t.rows)), n.setProperty("--block-gap", `${a}px`), n.setProperty("--header-row", `${h}`), (u !== t?.cols || l !== t?.rows) && i.emit("grid:layout:change", { cols: t.cols, rows: t.rows });
  }
  function D() {
    if (!t) return;
    e.innerHTML = "";
    const o = document.createElement("div");
    o.className = "row-spacer col-0", e.appendChild(o);
    const c = r.renderCard ?? q;
    $.forEach((l, n) => {
      const g = Math.floor(n / t.cols), p = n % t.cols, x = c(l);
      x.dataset.row = `${g}`, x.dataset.column = `${p}`, x.classList.add(`row-${g}`), x.classList.add(`col-${p}`);
      const Z = (g % 2 === 0 ? p : t.cols - 1 - p) * R, W = n * M;
      x.style.transitionDelay = `${Z}ms`, x.style.setProperty("--fade-delay", `${W}ms`), x.classList.add("fade-in"), e.appendChild(x);
    });
    let u = Math.ceil($.length / t.cols) + 1;
    if (z) {
      const l = t.rows - (h + 1), n = Math.max(0, l - 1);
      for (let g = 0; g < n; g++) {
        const p = document.createElement("div");
        p.className = `row-spacer col-${g + u}`, e.appendChild(p);
      }
      u += n;
    }
    for (let l = 0; l < u; l++) {
      const n = document.createElement("div");
      n.className = "snap-block", n.dataset.row = `${l}`, n.style.top = `${l * (t.height + a)}px`, e.appendChild(n);
    }
    i.emit("grid:rebuild", t), m = !1;
  }
  function q(o) {
    const c = o.title ?? "", u = o.thumbnail, l = (o.tags || []).sort((p, x) => p.localeCompare(x)), n = document.createElement("div");
    n.className = "block";
    const g = c ? `<div class="info"><h3>${c}</h3></div>` : "";
    return n.innerHTML = `
      ${u ? `<div class="media"><img class="thumb" src="${u}" alt="${c}"></div>` : ""}
      <div class="content block-border">
        ${g}
        <div class="tags">
          ${l.map((p) => `<div class="tag" data-tag="${p}">${p}</div>`).join("")}
        </div>
      </div>
      <svg class="checker-border" xmlns="http://www.w3.org/2000/svg">
        <rect class="dash black" />
        <rect class="dash white" />
      </svg>
    `, o.href && n.addEventListener("click", () => {
      window.location.href = o.href;
    }), n;
  }
  function F() {
    const o = t.height + a, c = Math.round(e.scrollTop / o), u = c + t.rows - 2, l = c + h;
    return {
      aboveHeader: l - 1 >= c && l - 1 <= u ? l - 1 : void 0,
      belowHeader: l >= c && l <= u ? l : void 0
      // belowHeader: headerAbsoluteRow, // + 1 // +1 omitted here since header row is not an actual row
    };
  }
  function H() {
    N(), y = !0, setTimeout(() => {
      const o = F();
      i.emit("initial:scroll:end", o);
    }, 500);
  }
  function V() {
    m || i.emit("scroll:start", void 0), m = !0, N();
  }
  function O() {
    if (m) {
      const o = F();
      i.emit("scroll:end", o);
    }
    m = !1;
  }
  function G() {
    I && window.clearTimeout(I), I = window.setTimeout(() => {
      O();
    }, E);
  }
  function Y() {
    const o = w?.getBoundingClientRect();
    if (!o) {
      console.warn("[grid] measureViewport element not found");
      return;
    }
    P(o.width, o.height), D(), y && N(), e && e.scrollHeight > e.clientHeight && (P(e.clientWidth, o.height), D(), y && N()), L || (L = !0, document.body.classList.add("layout-ready")), y && setTimeout(() => {
      i.emit("initial:scroll:end", F());
    }, 500);
  }
  function _() {
    const o = w?.getBoundingClientRect();
    o && (e.hasChildNodes() && (e.innerHTML = "", i.emit("grid:clear", void 0)), P(o.width, o.height), f !== null && window.clearTimeout(f), f = window.setTimeout(() => {
      D(), y && N(), e && e.scrollHeight > e.clientHeight && (P(e.clientWidth, o.height), D(), y && N()), f = null, y && setTimeout(() => {
        i.emit("initial:scroll:end", F());
      }, 500);
    }, 400));
  }
  function N() {
    if (!t) return;
    const o = t.height + a, u = Math.round(e.scrollTop / o) + h;
    e.querySelectorAll(".block").forEach((n) => {
      parseInt(n.dataset.row || "0", 10) < u ? n.classList.add("above-header") : n.classList.remove("above-header");
    });
  }
  function U(o) {
    const c = Array.from(e.querySelectorAll(".block"));
    if (c.length === 0) {
      o();
      return;
    }
    b !== null && (window.clearTimeout(b), b = null);
    let u = 0;
    c.forEach((n) => {
      const g = parseInt(n.dataset.row || "0", 10), p = parseInt(n.dataset.column || "0", 10), A = (g % 2 === 0 ? p : t.cols - 1 - p) * M;
      n.style.setProperty("--fade-delay", `${A}ms`), n.classList.add("fade-out"), A > u && (u = A);
    });
    const l = u + d + 20;
    b = window.setTimeout(() => {
      b = null, o();
    }, l);
  }
  function j() {
    C(), e.addEventListener("scroll", V, { passive: !0 }), window.addEventListener("resize", _), window.addEventListener("popstate", k), S = "onscrollend" in window, S ? e.addEventListener("scrollend", O) : e.addEventListener("scroll", G, { passive: !0 });
  }
  function J() {
    i.clear(), e.removeEventListener("scroll", V), window.removeEventListener("resize", _), window.removeEventListener("popstate", k), S ? e.removeEventListener("scrollend", O) : (I && window.clearTimeout(I), e.removeEventListener("scroll", G)), f !== null && (window.clearTimeout(f), f = null), b !== null && (window.clearTimeout(b), b = null);
  }
  function K(o) {
    $ = o, B(T, () => Y()), window.setTimeout(H, v);
  }
  function Q() {
    return t;
  }
  return { init: j, destroy: J, setItems: K, events: i, getLayout: Q };
}
export {
  st as createGridList,
  et as findBestBlockSize,
  nt as findNaiveBlockSize
};
