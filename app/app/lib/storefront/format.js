// Python/Django-compatible formatting for the storefront data layer.
//
// The storefront used to read every catalog and blog payload from the Django
// API. These helpers reproduce Django's output byte-for-byte so pages render
// exactly as before (verified by scripts/qa/parity.mjs against Django itself).
// Each function names the Python behaviour it mirrors.

/** Python `s[:n]`: slices by code point, not UTF-16 unit. */
export function pySlice(value, n) {
  return Array.from(value ?? '').slice(0, n).join('');
}

/** Python `round()` - round half to even (banker's rounding). */
export function pyRound(x) {
  const floor = Math.floor(x);
  const diff = x - floor;
  if (diff > 0.5) return floor + 1;
  if (diff < 0.5) return floor;
  return floor % 2 === 0 ? floor : floor + 1;
}

/** Python `'%.0f' % float(value)`, which also rounds half to even. */
export function pyFormat0f(value) {
  return String(pyRound(Number(value)));
}

// Media lives on Cloudflare R2 behind this domain (django-storages S3Storage with
// custom_domain). Override only if the bucket's public domain changes.
export const MEDIA_BASE_URL = (process.env.STOREFRONT_MEDIA_BASE_URL || 'https://cdn.serlesbake.in').replace(/\/+$/, '');

/**
 * FieldFile.url for a stored name: Django's filepath_to_uri, i.e.
 * quote(name, safe="/~!*()'"). encodeURIComponent leaves exactly that set
 * (plus alphanumerics and -_.) unescaped, apart from "/".
 */
export function mediaUrl(name) {
  if (!name) return null;
  const path = String(name).replace(/\\/g, '/');
  return `${MEDIA_BASE_URL}/${encodeURIComponent(path).replace(/%2F/g, '/')}`;
}

/**
 * DRF DateTimeField output: converted to TIME_ZONE (Asia/Kolkata) and
 * isoformat()-ed. Input is the SQL text produced by `istText()` in queries
 * ("YYYY-MM-DDTHH:MI:SS.US"); Python omits the fraction when it is zero.
 */
export function drfDateTime(istTextValue) {
  if (!istTextValue) return null;
  return `${istTextValue.replace(/\.000000$/, '')}+05:30`;
}

/** datetime.isoformat() of a UTC-aware value (model fields read straight from the DB). */
export function utcIso(utcTextValue) {
  if (!utcTextValue) return null;
  return `${utcTextValue.replace(/\.000000$/, '')}+00:00`;
}

/** Decimal comparison for DB numeric strings like "599.00". */
export function decimalCompare(a, b) {
  return Number(a) - Number(b);
}

/** DRF DecimalField(decimal_places=2) representation. */
export function decimal2(value) {
  if (value === null || value === undefined) return null;
  return Number(value).toFixed(2);
}

// Exactly the characters Python's str.isspace() accepts. JS `\s` differs: it
// lacks \x1c-\x1f and \x85, and wrongly (for us) includes U+FEFF.
const PY_WHITESPACE = new RegExp('[\t\n\x0b\x0c\r\x1c-\x1f \x85\xa0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+');

/** BlogPost.word_count: strip tags, then Python `str.split()`. */
export function pyWordCount(html) {
  const text = String(html ?? '').replace(/<[^>]+>/g, ' ');
  return text.split(PY_WHITESPACE).filter((w) => w.length > 0).length;
}

/** Python `str.isdigit()` for URL lookups (ASCII digits are all that matter here). */
export function isDigits(value) {
  return /^[0-9]+$/.test(String(value ?? ''));
}
