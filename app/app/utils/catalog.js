import { apiFetch } from './apiFetch.js';

// ---------------------------------------------------------------------------
// Server-side data policy (Vercel Hobby CPU budget)
// ---------------------------------------------------------------------------
// The Vercel team was paused on 19 Nov 2026 for exceeding Hobby's Fluid Active
// CPU allowance. Pages rebuilt every 60 s and each rebuild called Django, so
// crawler traffic alone kept both functions busy (about 12 min CPU a day on a
// site with about 1 search click a day).
//
// Server fetches now live in Next's data cache for a day and are dropped
// immediately by POST /api/revalidate, which Django calls when staff save
// catalog or blog content. `ssr=1` makes Django answer these requests with
// `no-store`, so Vercel's CDN never hands a just-revalidated page a stale copy;
// browser requests (without the marker) stay CDN-cached as before.
export const SERVER_DATA_REVALIDATE = 86400;
export const CATALOG_TAG = 'catalog';
export const BLOG_TAG = 'blog';

export const isServer = () => typeof window === 'undefined';

export function serverApiUrl(url) {
  return `${url}${url.includes('?') ? '&' : '?'}ssr=1`;
}

export function serverFetchOptions(tags = [CATALOG_TAG], revalidate = SERVER_DATA_REVALIDATE) {
  return { next: { revalidate, tags } };
}

/** Fetch catalog data without converting transport failures into empty inventory. */
export async function fetchCatalogJson(url) {
  const headers = { Accept: 'application/json' };
  if (isServer()) {
    headers['User-Agent'] = 'SerlesBake-Frontend/1.0';
  }

  const response = await apiFetch(isServer() ? serverApiUrl(url) : url, {
    headers,
    ...(isServer() ? serverFetchOptions() : {}),
  });

  if (!response.ok) {
    // A 402 means the request went to the paused Django host. That only
    // happens when database mode is off, typically a local .env.local
    // without STOREFRONT_DATABASE_URL. Say so instead of a bare status code.
    const hint = response.status === 402 && isServer() && !process.env.STOREFRONT_DATABASE_URL
      ? ' - the Django API is paused; set STOREFRONT_DATABASE_URL (Supabase transaction pooler) in app/.env.local to read the database directly'
      : '';
    throw new Error(`Catalog request failed (${response.status})${hint}`);
  }

  return response.json();
}

export function catalogList(payload) {
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload)) return payload;
  throw new Error('Catalog response did not contain a product or category list');
}
