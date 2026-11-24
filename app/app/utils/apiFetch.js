// fetch() for storefront API URLs, usable from server and client modules.
//
// On the server it goes through lib/storefront/server.js, which answers from
// the database when STOREFRONT_DATABASE_URL is set (no Django needed). In the
// browser it is plain fetch: the URL builders in config/api.js point browser
// calls at this site's own /api routes.
//
// The literal `typeof window === 'undefined'` check matters: Next compiles it
// to a constant per bundle, so the database client never enters browser code.
export async function apiFetch(url, init) {
  // Database mode only: otherwise this is plain fetch (Django API, or test mocks).
  if (typeof window === 'undefined' && process.env.STOREFRONT_DATABASE_URL) {
    const { storefrontFetch } = await import('../lib/storefront/server.js');
    return storefrontFetch(url, init);
  }
  return fetch(url, init);
}
