import { timingSafeEqual } from 'node:crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import { BLOG_TAG, CATALOG_TAG } from '../../utils/catalog';

// On-demand refresh, called by Django (app/revalidation.py) after staff save
// catalog or blog content. Pages and server fetches are cached for a day to
// stay inside Vercel's CPU allowance; this is what keeps CMS edits instant.
//
// Requires REVALIDATE_SECRET in this project's Vercel env, with the same value
// in the backend project. Without it the endpoint refuses every request.
export const dynamic = 'force-dynamic';

function secretMatches(given, expected) {
  const a = Buffer.from(given || '');
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) {
    return Response.json({ ok: false, error: 'revalidation not configured' }, { status: 503 });
  }
  if (!secretMatches(request.headers.get('x-revalidate-secret'), expected)) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  // The site is small (about 100 pages) and catalog data appears on blog pages
  // too, so refresh everything rather than tracking which page shows what.
  revalidateTag(CATALOG_TAG);
  revalidateTag(BLOG_TAG);
  revalidatePath('/', 'layout');

  return Response.json({ ok: true, revalidated: [CATALOG_TAG, BLOG_TAG, '/'], at: new Date().toISOString() });
}
