import { unstable_cache } from 'next/cache';
import { storefrontDbConfigured } from './db.js';
import { loadBlogSnapshot, loadCatalogSnapshot, loadPostListIds } from './source.js';
import { apiSnapshotNeeds, postListParams, resolveApi } from './api.js';

// Server-only glue between the storefront's API calls and the database.
//
// Snapshots are cached for a day under the same tags the pages use; Django's
// save signal calls /api/revalidate, which drops them along with the pages.
// Bump the key suffix if a snapshot's shape changes.
const DAY = 86400;
const cachedCatalog = unstable_cache(loadCatalogSnapshot, ['storefront-catalog-v1'], { revalidate: DAY, tags: ['catalog'] });
const cachedBlog = unstable_cache(loadBlogSnapshot, ['storefront-blog-v1'], { revalidate: DAY, tags: ['blog'] });
// The /blog page's search/category filters: Django's exact list SQL, cached per query string.
const cachedPostListIds = unstable_cache((query) => loadPostListIds(new URLSearchParams(query)),
  ['storefront-post-list-v1'], { revalidate: DAY, tags: ['blog'] });

export function storefrontDataSource() {
  return storefrontDbConfigured() ? 'database' : 'django-api';
}

/** { status, data } for a storefront API URL, or null when it is not one / DB is off. */
export async function storefrontApi(url) {
  const needs = storefrontDbConfigured() ? apiSnapshotNeeds(url) : null;
  if (!needs) return null;
  const listParams = postListParams(url);
  const [catalog, blog, postListIds] = await Promise.all([
    cachedCatalog(),
    needs.blog ? cachedBlog() : null,
    listParams ? cachedPostListIds(listParams.toString()) : undefined,
  ]);
  return resolveApi(url, { catalog, blog, postListIds });
}

/**
 * Drop-in for fetch(url, init) on the server: storefront API URLs are answered
 * from the database when STOREFRONT_DATABASE_URL is set; anything else (or DB
 * mode off) goes to the network as before.
 */
export async function storefrontFetch(url, init) {
  const result = await storefrontApi(String(url));
  if (!result) return fetch(url, init);
  return new Response(JSON.stringify(result.data), {
    status: result.status,
    headers: { 'content-type': 'application/json' },
  });
}
