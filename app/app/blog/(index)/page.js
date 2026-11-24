import BlogListing, { BLOG_PAGE_DESCRIPTION } from '../../components/blog/BlogListing';
import { buildMetadata, SITE_NAME } from '../../utils/blog';

// Next requires a literal here; mirrors BLOG_LIST_REVALIDATE in utils/blog.js.
export const revalidate = 86400; // 1 day; CMS saves refresh instantly via /api/revalidate

// No searchParams here: reading them made /blog render on every visit (7 s,
// Vercel CPU each time). Search lives at /blog/search; old /blog?search= and
// /blog?category= links are redirected in next.config.mjs.
export const metadata = buildMetadata({
  title: `Cake Guides & Baking Stories | ${SITE_NAME}`,
  description: BLOG_PAGE_DESCRIPTION,
  path: '/blog',
});

export default function BlogIndexPage() {
  return <BlogListing />;
}
