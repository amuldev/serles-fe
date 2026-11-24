import postgres from 'postgres';

// Direct, read-only access to the shop database so the storefront no longer
// needs the Django API to render (Vercel team pause, Nov 2026).
//
// STOREFRONT_DATABASE_URL must be a SERVER-ONLY variable (never NEXT_PUBLIC_).
// On Vercel use Supabase's transaction pooler (port 6543) - serverless functions
// would otherwise exhaust the database's 60 direct connection slots - ideally
// with a read-only role. When it is unset the storefront keeps using the API.

let client = null;

export function storefrontDbConfigured() {
  return Boolean(process.env.STOREFRONT_DATABASE_URL);
}

export function db() {
  if (!storefrontDbConfigured()) {
    throw new Error('STOREFRONT_DATABASE_URL is not set');
  }
  if (!client) {
    const url = process.env.STOREFRONT_DATABASE_URL;
    const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
    client = postgres(url, {
      // Small on purpose: every build worker and function instance has its own pool.
      max: Number(process.env.STOREFRONT_DB_POOL_SIZE || 2),
      idle_timeout: 10,
      connect_timeout: 15,
      // The transaction pooler cannot hold prepared statements across clients.
      prepare: false,
      ssl: local ? false : 'require',
      // Django uses BigAutoField, so ids and counts arrive as int8. They are all
      // far below 2^53; parse to numbers so JSON matches DRF's integers.
      types: {
        bigint: { to: 20, from: [20], serialize: (x) => String(x), parse: (x) => Number(x) },
      },
      connection: { application_name: 'serles-storefront' },
    });
  }
  return client;
}

/** For scripts: let the process exit once work is done. */
export async function closeDb() {
  if (client) {
    const c = client;
    client = null;
    await c.end({ timeout: 5 });
  }
}
