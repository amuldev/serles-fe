import { storefrontApi } from '../../lib/storefront/server.js';
import { API_CONFIG } from '../../config/api.js';

// Same-origin copy of the storefront API for browser-side fallbacks (menus and
// catalog clients refetch only when server data is missing). Served from the
// database when STOREFRONT_DATABASE_URL is set, otherwise proxied to Django,
// so client code is identical in both modes. /api/revalidate is a separate,
// more specific route and is unaffected.
export const runtime = 'nodejs';

const CACHE_OK = 'public, max-age=0, s-maxage=600, stale-while-revalidate=3600';
const CACHE_MISS = 'public, max-age=0, s-maxage=60';

export async function GET(request) {
  const url = new URL(request.url);
  const result = await storefrontApi(url.pathname + url.search);

  if (result) {
    return Response.json(result.data, {
      status: result.status,
      headers: { 'Cache-Control': result.status === 200 ? CACHE_OK : CACHE_MISS },
    });
  }

  // Database mode off: proxy to Django (which expects the trailing slash).
  const upstream = await fetch(`${API_CONFIG.BASE_URL}${url.pathname.replace(/\/?$/, '/')}${url.search}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  return new Response(await upstream.text(), {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') || 'application/json',
      'Cache-Control': upstream.ok ? CACHE_OK : CACHE_MISS,
    },
  });
}
