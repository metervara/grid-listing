import { existsSync as u, watch as w, readFileSync as M, readdirSync as D } from "fs";
import { relative as $, basename as j, join as m, posix as F } from "path";
const A = [
  "thumbnail.png",
  "thumbnail.jpg",
  "thumbnail.jpeg",
  "thumbnail.webp",
  "thumbnail.gif",
  "thumbnail.mp4",
  "thumbnail.webm"
];
function v(t, e = t) {
  const n = [];
  if (!u(t)) return n;
  const i = D(t, { withFileTypes: !0 });
  for (const s of i) {
    if (!s.isDirectory()) continue;
    const r = m(t, s.name), o = m(r, "index.html");
    u(o) && n.push(r), n.push(...v(r, e));
  }
  return n;
}
function B(t) {
  const e = t.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return e ? e[1].trim() : void 0;
}
function E(t) {
  const e = t.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) || t.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
  return e ? e[1].trim() : void 0;
}
function N(t) {
  const e = t.match(/<meta[^>]*name=["']tags["'][^>]*content=["']([^"']*)["'][^>]*>/i) || t.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']tags["'][^>]*>/i);
  return e ? e[1].split(",").map((n) => n.trim()).filter(Boolean).sort((n, i) => n.localeCompare(i)) : [];
}
function R(t, e) {
  for (const n of e) {
    const i = m(t, n);
    if (u(i))
      return n;
  }
}
function _(t, e) {
  const {
    basePath: n = "/",
    includeHidden: i = !1,
    thumbnailPatterns: s = A
  } = e, r = v(t), o = [];
  for (const a of r) {
    const c = $(t, a), l = j(a), f = l.startsWith("_");
    if (f && !i) continue;
    const p = c.split(/[/\\]/), x = p.length > 1 ? p[0] : "misc", P = m(a, "index.html"), d = M(P, "utf-8"), y = B(d), T = E(d), g = N(d), b = R(a, s), h = c.split(/[/\\]/).join(F.sep), I = `${n}${h}/`.replace(/\/+/g, "/"), S = b ? `${h}/${b}`.replace(/\\/g, "/") : void 0;
    o.push({
      path: h,
      name: l,
      group: x,
      title: y,
      description: T,
      tags: g.length > 0 ? g : void 0,
      thumbnail: S,
      href: I,
      hidden: f
    });
  }
  return o.sort((a, c) => a.path.localeCompare(c.path)), o;
}
function H(t) {
  const e = t.moduleId || "virtual:grid-manifest", n = "\0" + e;
  let i = null, s = null;
  return {
    name: "grid-manifest",
    resolveId(r) {
      if (r === e)
        return n;
    },
    load(r) {
      if (r === n) {
        const o = _(t.dir, t);
        return `export default ${JSON.stringify({ items: o }, null, 2)};`;
      }
    },
    configureServer(r) {
      s = r, u(t.dir) && (i = w(t.dir, { recursive: !0 }, (o, a) => {
        if (!a) return;
        if (a.endsWith("index.html") || a.includes("thumbnail") || o === "rename") {
          const l = s?.moduleGraph.getModuleById(n);
          l && (s?.moduleGraph.invalidateModule(l), s?.ws.send({
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
