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

/**
 * Parse a postgres connection string without WHATWG URL parsing.
 *
 * Supabase passwords often contain characters such as # / ? that break
 * `new URL()` ("TypeError: Invalid URL") unless percent-encoded, and dashboard
 * values sometimes arrive wrapped in quotes. The host is everything after the
 * LAST "@", so any password character works, encoded or not. Errors never
 * include the value.
 */
export function parseConnectionString(raw) {
  const fail = (why) => new Error(`STOREFRONT_DATABASE_URL is not a usable PostgreSQL connection string: ${why} (value hidden)`);
  const value = String(raw ?? '').trim().replace(/^(['"])(.*)\1$/s, '$2').trim();
  const scheme = value.match(/^postgres(?:ql)?:\/\//i);
  if (!scheme) throw fail('it must start with postgresql:// or postgres://');
  const rest = value.slice(scheme[0].length);
  const at = rest.lastIndexOf('@');
  if (at < 0) throw fail('missing user:password@host');
  const userInfo = rest.slice(0, at);
  const colon = userInfo.indexOf(':');
  const decode = (s) => { try { return decodeURIComponent(s); } catch { return s; } };
  const username = decode(colon < 0 ? userInfo : userInfo.slice(0, colon));
  const password = colon < 0 ? '' : decode(userInfo.slice(colon + 1));
  const [hostAndDb] = rest.slice(at + 1).split('?');
  const slash = hostAndDb.indexOf('/');
  const hostPort = slash < 0 ? hostAndDb : hostAndDb.slice(0, slash);
  const database = decode(slash < 0 ? '' : hostAndDb.slice(slash + 1)) || 'postgres';
  const portMatch = hostPort.match(/^(.*):(\d+)$/);
  const host = portMatch ? portMatch[1] : hostPort;
  const port = portMatch ? Number(portMatch[2]) : 5432;
  if (!username || !host) throw fail('missing user or host');
  if (password.includes('[YOUR-PASSWORD]')) throw fail('the [YOUR-PASSWORD] placeholder was not replaced');
  return { host, port, database, username, password };
}

export function db() {
  if (!storefrontDbConfigured()) {
    throw new Error('STOREFRONT_DATABASE_URL is not set');
  }
  if (!client) {
    const conn = parseConnectionString(process.env.STOREFRONT_DATABASE_URL);
    const local = ['localhost', '127.0.0.1'].includes(conn.host);
    client = postgres({
      ...conn,
      // Small on purpose: every build worker and function instance has its own pool.
      // 4 lets a snapshot's independent queries overlap (the database is ~100-200 ms away).
      max: Number(process.env.STOREFRONT_DB_POOL_SIZE || 4),
      // No pipelining. postgres.js pipelines parameterless queries (several
      // Parse/Bind/Execute on one connection before a reply); Supabase's
      // transaction pooler never answers such a batch, so the blog snapshot's
      // sort queries hung forever and Vercel builds hit the 45-minute limit
      // (reproduced 24 Nov 2026). 0 is the only value that disables it: with 1
      // the library still sends two queries before waiting.
      max_pipeline: 0,
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

/**
 * Drop a pool without waiting: its connections may be stuck. Next db() builds a
 * fresh one. Only the pool the failed attempt used: a newer pool may be serving
 * another load's retry right now.
 */
function abandonDb(used) {
  if (used && client === used) client = null;
  used?.end({ timeout: 0 }).catch(() => {});
}

/**
 * Run a read with a deadline, retrying on fresh connections.
 *
 * Supabase's transaction pooler intermittently stalls a connection: the query
 * never answers and never errors (reproduced locally on 24 Nov 2026 - the same
 * 20-query burst hung once, then passed in ~2 s). postgres.js has no query
 * timeout, so one stall held a Vercel build at "Building" until the 45-minute
 * limit killed it. Reads here are idempotent, so a stalled attempt is abandoned,
 * its pool dropped, and the load retried; if every attempt fails, the error says
 * so within ~1.5 minutes instead of hanging.
 */
export async function withDbDeadline(label, load, {
  timeoutMs = Number(process.env.STOREFRONT_DB_TIMEOUT_MS || 30000),
  attempts = 3,
} = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const started = Date.now();
    let timer;
    let used = null;
    try {
      const pending = load();
      used = client; // loaders call db() synchronously, so this is the pool they took
      const result = await Promise.race([
        pending,
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error(`${label}: no answer from the database after ${timeoutMs / 1000}s`)), timeoutMs);
        }),
      ]);
      if (attempt > 1 || process.env.NEXT_PHASE === 'phase-production-build') {
        console.log(`[storefront] ${label} loaded in ${Date.now() - started} ms (attempt ${attempt})`);
      }
      return result;
    } catch (error) {
      lastError = error;
      console.warn(`[storefront] ${label} attempt ${attempt}/${attempts} failed: ${error.message}`);
      abandonDb(used);
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error(`${label} failed after ${attempts} attempts: ${lastError?.message}`);
}
