#!/usr/bin/env node
// Rendered-site parity: what users and crawlers see, page by page.
//
// 1) capture: crawl a running storefront (e.g. the Django-backed build) and
//    save an extract of every page:
//      node scripts/qa/render-parity.mjs capture --base http://127.0.0.1:3101 --save a.json
// 2) compare: crawl another build (e.g. database mode with Django switched off)
//    and require each extract to match:
//      node scripts/qa/render-parity.mjs compare --base http://127.0.0.1:3102 --against a.json --out report.json
//
// Pages come from the build's own sitemap.xml plus filtered/search pages,
// 404s and the browser-facing /api routes. Per page it compares HTTP status,
// <title>, every meta tag, canonical, headings, JSON-LD (parsed), visible text,
// link targets and image src/alt. Build-specific asset hashes are ignored.
import { readFileSync, writeFileSync } from 'node:fs';

const [mode, ...rest] = process.argv.slice(2);
const args = Object.fromEntries(rest.reduce((acc, v, i, all) => (v.startsWith('--') ? [...acc, [v.slice(2), all[i + 1]]] : acc), []));
const BASE = (args.base || '').replace(/\/+$/, '');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 SerlesQA';
if (!['capture', 'compare'].includes(mode) || !BASE) {
  console.error('usage: render-parity.mjs capture|compare --base <url> [--save f] [--against f --out f]');
  process.exit(2);
}

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&#x27;|&#39;/g, "'").replace(/&nbsp;/g, ' ');
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`, 'i'));
  return m ? decode(m[1]) : null;
};
const textOf = (html) => decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

function extract(html) {
  const head = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] || '';
  const meta = [...head.matchAll(/<meta\b[^>]*>/gi)]
    .map(([t]) => [attr(t, 'name') || attr(t, 'property') || attr(t, 'charset') || attr(t, 'http-equiv'), attr(t, 'content')])
    .filter(([k]) => k)
    .map(([k, v]) => `${k}=${v}`)
    .sort();
  const jsonLd = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map(([, j]) => {
    try { return JSON.stringify(JSON.parse(j)); } catch { return `INVALID:${j.slice(0, 80)}`; }
  });
  const body = (html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] || html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ');
  return {
    title: textOf(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || ''),
    meta,
    canonical: [...head.matchAll(/<link\b[^>]*rel="canonical"[^>]*>/gi)].map(([t]) => attr(t, 'href')),
    headings: [...body.matchAll(/<(h[1-3])\b[^>]*>([\s\S]*?)<\/\1>/gi)].map(([, h, t]) => `${h}:${textOf(t)}`),
    jsonLd,
    text: textOf(body),
    links: [...body.matchAll(/<a\b[^>]*>/gi)].map(([t]) => attr(t, 'href')).filter(Boolean),
    images: [...body.matchAll(/<img\b[^>]*>/gi)].map(([t]) => `${attr(t, 'src') || attr(t, 'data-src')}|${attr(t, 'alt')}`),
  };
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`, { headers: { 'User-Agent': UA }, redirect: 'manual' });
  const body = await res.text();
  return { status: res.status, location: res.headers.get('location'), contentType: res.headers.get('content-type') || '', body };
}

async function urlList() {
  const sitemap = await get('/sitemap.xml');
  const pages = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, u]) => new URL(u).pathname);
  const blogCategories = JSON.parse((await get('/api/blog/categories')).body).map((c) => c.slug);
  const products = JSON.parse((await get('/api/products?format=json&page=1&page_size=100')).body);
  return [
    ...pages,
    '/blog?search=chocolate', '/blog?search=delivery', '/blog?search=zzz-no-match',
    ...blogCategories.map((s) => `/blog?category=${s}`),
    '/blog?search=cake&category=' + blogCategories[0],
    '/cakes/premium-cake/no-such-cake-qa', '/cakes/no-such-category-qa', '/cakes/tags/no-such-tag-qa',
    '/blog/no-such-post-qa', '/blog/categories/no-such-category-qa', '/blog/tags/no-such-tag-qa',
    '/category/premium-cake/', '/home',
    // Browser-facing JSON (client fallbacks)
    '/api/products?format=json&page=1&page_size=100', '/api/categories?format=json', '/api/tags?format=json',
    ...products.map((p) => `/api/products/${p.id}?format=json`),
    '/api/blog/posts?limit=3', '/api/blog/posts/latest?limit=4', '/api/blog/categories', '/api/blog/tags',
    '/robots.txt',
  ];
}

async function crawl(paths) {
  const out = {};
  for (const path of [...new Set(paths)]) {
    const r = await get(path);
    if (r.contentType.includes('application/json')) {
      let data;
      try { data = JSON.stringify(JSON.parse(r.body)); } catch { data = r.body; }
      out[path] = { status: r.status, json: data };
    } else if (r.contentType.includes('text/html')) {
      out[path] = { status: r.status, ...extract(r.body) };
    } else {
      out[path] = { status: r.status, location: r.location, raw: r.body.slice(0, 5000) };
    }
  }
  return out;
}

function compareEntries(a, b) {
  const diffs = [];
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = JSON.stringify(a[key]);
    const y = JSON.stringify(b[key]);
    if (x !== y) diffs.push({ field: key, reference: (x || '').slice(0, 300), candidate: (y || '').slice(0, 300) });
  }
  return diffs;
}

if (mode === 'capture') {
  const paths = await urlList();
  const pages = await crawl(paths);
  writeFileSync(args.save, JSON.stringify({ base: BASE, capturedAt: new Date().toISOString(), paths, pages }, null, 1));
  const statuses = Object.values(pages).reduce((m, p) => ({ ...m, [p.status]: (m[p.status] || 0) + 1 }), {});
  console.log(JSON.stringify({ captured: Object.keys(pages).length, statuses }));
} else {
  const ref = JSON.parse(readFileSync(args.against, 'utf8'));
  const own = new Set(await urlList());
  const missingFromCandidateSitemap = ref.paths.filter((p) => !own.has(p));
  const extra = [...own].filter((p) => !ref.paths.includes(p));
  const pages = await crawl(ref.paths);
  const results = ref.paths.map((path) => {
    const diffs = compareEntries(ref.pages[path], pages[path]);
    return { path, pass: diffs.length === 0, diffs };
  });
  const failed = results.filter((r) => !r.pass);
  const summary = {
    comparedAt: new Date().toISOString(),
    pages: results.length,
    passed: results.length - failed.length,
    failed: failed.length,
    sitemapOnlyInReference: missingFromCandidateSitemap,
    sitemapOnlyInCandidate: extra,
    htmlPages: Object.values(pages).filter((p) => p.title !== undefined).length,
    jsonEndpoints: Object.values(pages).filter((p) => p.json !== undefined).length,
  };
  if (args.out) writeFileSync(args.out, JSON.stringify({ summary, results }, null, 1));
  console.log(JSON.stringify(summary, null, 1));
  for (const f of failed.slice(0, 15)) console.log('FAIL', f.path, JSON.stringify(f.diffs).slice(0, 600));
  process.exit(failed.length || missingFromCandidateSitemap.length || extra.length ? 1 : 0);
}
