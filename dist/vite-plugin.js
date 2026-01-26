import { existsSync as m, watch as S, readFileSync as w, readdirSync as M } from "fs";
import { relative as D, basename as $, join as d, posix as j } from "path";
const F = [
  "thumbnail.png",
  "thumbnail.jpg",
  "thumbnail.jpeg",
  "thumbnail.webp",
  "thumbnail.gif",
  "thumbnail.mp4",
  "thumbnail.webm"
];
function v(t, n = t) {
  const e = [];
  if (!m(t)) return e;
  const i = M(t, { withFileTypes: !0 });
  for (const s of i) {
    if (!s.isDirectory()) continue;
    const r = d(t, s.name), o = d(r, "index.html");
    m(o) && e.push(r), e.push(...v(r, n));
  }
  return e;
}
function A(t) {
  const n = t.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return n ? n[1].trim() : void 0;
}
function B(t) {
  const n = t.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) || t.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
  return n ? n[1].trim() : void 0;
}
function E(t) {
  const n = t.match(/<meta[^>]*name=["']tags["'][^>]*content=["']([^"']*)["'][^>]*>/i) || t.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']tags["'][^>]*>/i);
  return n ? n[1].split(",").map((e) => e.trim()).filter(Boolean).sort((e, i) => e.localeCompare(i)) : [];
}
function R(t, n) {
  for (const e of n) {
    const i = d(t, e);
    if (m(i))
      return e;
  }
}
function _(t, n) {
  const {
    basePath: e = "/",
    includeHidden: i = !1,
    thumbnailPatterns: s = F
  } = n, r = v(t), o = [];
  for (const a of r) {
    const l = D(t, a), c = $(a), u = c.startsWith("_");
    if (u && !i) continue;
    const p = l.split(/[/\\]/), x = p.length > 1 ? p[0] : "misc", P = d(a, "index.html"), h = w(P, "utf-8"), y = A(h), I = B(h), g = E(h), b = R(a, s), f = l.split(/[/\\]/).join(j.sep), N = `${e}${f}/`.replace(/\/+/g, "/"), T = b ? `${f}/${b}`.replace(/\\/g, "/") : void 0;
    o.push({
      path: f,
      name: c,
      group: x,
      title: y,
      description: I,
      tags: g.length > 0 ? g : void 0,
      thumbnail: T,
      href: N,
      hidden: u
    });
  }
  return o.sort((a, l) => {
    const c = parseInt(a.name, 10), u = parseInt(l.name, 10);
    return !isNaN(c) && !isNaN(u) ? c - u : a.path.localeCompare(l.path);
  }), o;
}
function H(t) {
  const n = t.moduleId || "virtual:grid-manifest", e = "\0" + n;
  let i = null, s = null;
  return {
    name: "grid-manifest",
    resolveId(r) {
      if (r === n)
        return e;
    },
    load(r) {
      if (r === e) {
        const o = _(t.dir, t);
        return `export default ${JSON.stringify({ items: o }, null, 2)};`;
      }
    },
    configureServer(r) {
      s = r, m(t.dir) && (i = S(t.dir, { recursive: !0 }, (o, a) => {
        if (!a) return;
        if (a.endsWith("index.html") || a.includes("thumbnail") || o === "rename") {
          const c = s?.moduleGraph.getModuleById(e);
          c && (s?.moduleGraph.invalidateModule(c), s?.ws.send({
            type: "full-reload",
            path: "*"
          }));
        }
      }));
    },
    buildEnd() {
      i && (i.close(), i = null);
    }
  };
}
export {
  H as default,
  H as gridManifestPlugin
};
