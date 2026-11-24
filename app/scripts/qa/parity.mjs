#!/usr/bin/env node
// API contract parity: database-backed storefront data vs the Django API.
//
// For every endpoint and parameter variant the storefront calls - every
// product, category, tag, blog post, blog category and blog tag, plus 404 and
// filter cases - fetches Django's response and resolves the same URL from the
// database (app/lib/storefront), then requires status and JSON text to match
// exactly (key order included: JSON-LD is rendered from these objects).
//
// Usage (from serles-fe/app):
//   STOREFRONT_DATABASE_URL=... node scripts/qa/parity.mjs --django http://127.0.0.1:8765 [--out report.json]
// The Django instance must not increment views_count on reads, or post detail
// views_count will differ by the extra hits (see docs in the QA report).
import { writeFileSync } from 'node:fs';
import { db, closeDb } from '../../app/lib/storefront/db.js';
import { loadBlogSnapshot, loadCatalogSnapshot, loadPostListIds } from '../../app/lib/storefront/source.js';
import { postListParams, resolveApi } from '../../app/lib/storefront/api.js';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, v, i, all) => (v.startsWith('--') ? [...acc, [v.slice(2), all[i + 1]]] : acc), []));
const DJANGO = (args.django || '').replace(/\/+$/, '');
if (!DJANGO) {
  console.error('--django <base url> is required');
  process.exit(2);
}

async function django(path) {
  const res = await fetch(`${DJANGO}${path}`, { headers: { Accept: 'application/json' } });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { nonJson: text.slice(0, 200) }; }
  return { status: res.status, data };
}

function firstDiff(a, b, path = '$') {
  if (JSON.stringify(a) === JSON.stringify(b)) return null;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') {
    return { path, django: a, storefront: b };
  }
  if (Array.isArray(a) !== Array.isArray(b)) return { path, django: 'array?', storefront: 'array?' };
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (!Array.isArray(a) && ka.join('|') !== kb.join('|')) {
    return { path, issue: 'key order or key set', django: ka, storefront: kb };
  }
  if (Array.isArray(a) && a.length !== b.length) return { path, issue: 'length', django: a.length, storefront: b.length };
  for (const k of ka) {
    const d = firstDiff(a[k], b[k], `${path}.${k}`);
    if (d) return d;
  }
  return { path, issue: 'unknown' };
}

const sql = db();
const [catalog, blog] = await Promise.all([loadCatalogSnapshot(), loadBlogSnapshot()]);

// Enumerate every object the site can render, plus deliberate negatives.
const [inactiveProduct] = await sql`select id from app_product where not is_active order by id limit 1`;
const [maxProduct] = await sql`select coalesce(max(id), 0) + 1000 as id from app_product`;
const [draftPost] = await sql`select slug from blog_blogpost where status <> 'published' order by id limit 1`;
const [inactiveBlogCategory] = await sql`select slug from blog_blogcategory where not is_active limit 1`;
const [inactiveBlogTag] = await sql`select slug from blog_blogtag where not is_active limit 1`;

const productIds = catalog.products.filter((p) => p.is_active).map((p) => p.id);
const postSlugs = blog.posts.map((p) => p.slug);
const blogCategorySlugs = blog.categories.filter((c) => c.is_active).map((c) => c.slug);
const blogTagSlugs = blog.tags.filter((t) => t.is_active).map((t) => t.slug);
const searchTerms = ['chocolate', 'delivery', 'Tenkasi', 'BLACK FOREST', 'eggless', 'courtallam', 'zzz-no-match', '₹'];

const paths = [
  '/api/products/?format=json&page=1&page_size=100',
  '/api/categories/?format=json',
  '/api/tags/?format=json',
  ...productIds.map((id) => `/api/products/${id}/?format=json`),
  `/api/products/${maxProduct.id}/?format=json`,
  ...(inactiveProduct ? [`/api/products/${inactiveProduct.id}/?format=json`] : []),
  '/api/blog/posts/',
  '/api/blog/posts/?sort=date&order=desc',
  '/api/blog/posts/?sort=date&order=asc',
  '/api/blog/posts/?featured=true',
  '/api/blog/posts/?limit=3',
  ...searchTerms.map((q) => `/api/blog/posts/?search=${encodeURIComponent(q)}&sort=date&order=desc`),
  ...blogCategorySlugs.map((s) => `/api/blog/posts/?category=${s}&sort=date&order=desc`),
  ...blogTagSlugs.map((s) => `/api/blog/posts/?tag=${s}`),
  // Combined filters and LIKE-escaping edge cases (the /blog page's search box).
  ...blogCategorySlugs.map((s) => `/api/blog/posts/?search=cake&category=${s}&sort=date&order=desc`),
  ...blogTagSlugs.slice(0, 5).map((s) => `/api/blog/posts/?search=cake&tag=${s}`),
  `/api/blog/posts/?search=${encodeURIComponent('50%')}`,
  `/api/blog/posts/?search=${encodeURIComponent('a_b')}`,
  `/api/blog/posts/?search=${encodeURIComponent('back\slash')}`,
  '/api/blog/posts/?sort=title&order=asc',
  '/api/blog/posts/?sort=views&order=desc',
  '/api/blog/posts/?featured=true&limit=3',
  '/api/blog/posts/featured/',
  '/api/blog/posts/latest/',
  '/api/blog/posts/latest/?limit=4',
  '/api/blog/posts/popular/?limit=5',
  '/api/blog/posts/sitemap/',
  ...postSlugs.map((s) => `/api/blog/posts/${s}/`),
  ...postSlugs.map((s) => `/api/blog/posts/${s}/related/`),
  '/api/blog/posts/no-such-post-qa/',
  ...(draftPost ? [`/api/blog/posts/${draftPost.slug}/`] : []),
  '/api/blog/categories/',
  ...blogCategorySlugs.map((s) => `/api/blog/categories/${s}/`),
  ...blogCategorySlugs.map((s) => `/api/blog/categories/${s}/posts/`),
  '/api/blog/categories/no-such-category-qa/',
  ...(inactiveBlogCategory ? [`/api/blog/categories/${inactiveBlogCategory.slug}/`] : []),
  '/api/blog/tags/',
  ...blogTagSlugs.map((s) => `/api/blog/tags/${s}/`),
  ...blogTagSlugs.map((s) => `/api/blog/tags/${s}/posts/`),
  '/api/blog/tags/no-such-tag-qa/',
  ...(inactiveBlogTag ? [`/api/blog/tags/${inactiveBlogTag.slug}/`] : []),
];

// views_count ties make Django's popular order arbitrary (ORDER BY views_count only).
const tieTolerant = new Set(['/api/blog/posts/popular/?limit=5']);

const results = [];
for (const path of paths) {
  const ref = await django(path);
  const listParams = postListParams(path);
  const postListIds = listParams ? await loadPostListIds(listParams) : undefined;
  const got = resolveApi(path, { catalog, blog, postListIds });
  const statusOk = ref.status === got.status;
  // 404 bodies: only the status matters to the storefront.
  let bodyOk = ref.status === 404 ? true : JSON.stringify(ref.data) === JSON.stringify(got.data);
  let note;
  if (!bodyOk && tieTolerant.has(path) && Array.isArray(ref.data) && Array.isArray(got.data)) {
    const views = (rows) => rows.map((r) => r.views_count).join(',');
    if (views(ref.data) === views(got.data)) {
      bodyOk = true;
      note = 'same views_count sequence; order within ties is unspecified in Django too';
    }
  }
  results.push({ path, pass: statusOk && bodyOk, status: [ref.status, got.status], note, diff: statusOk && bodyOk ? undefined : firstDiff(ref.data, got.data) });
}

const failed = results.filter((r) => !r.pass);
const summary = {
  checkedAt: new Date().toISOString(),
  endpoints: results.length,
  passed: results.length - failed.length,
  failed: failed.length,
  coverage: {
    products: productIds.length, posts: postSlugs.length, blogCategories: blogCategorySlugs.length,
    blogTags: blogTagSlugs.length, searchTerms: searchTerms.length,
    negatives: { inactiveProduct: !!inactiveProduct, draftPost: !!draftPost, inactiveBlogCategory: !!inactiveBlogCategory, inactiveBlogTag: !!inactiveBlogTag },
  },
};
if (args.out) writeFileSync(args.out, JSON.stringify({ summary, results }, null, 1));
console.log(JSON.stringify(summary, null, 1));
for (const f of failed.slice(0, 20)) console.log('FAIL', f.path, JSON.stringify(f.status), JSON.stringify(f.diff).slice(0, 400));
for (const r of results.filter((x) => x.note)) console.log('NOTE', r.path, r.note);
await closeDb();
process.exit(failed.length ? 1 : 0);
