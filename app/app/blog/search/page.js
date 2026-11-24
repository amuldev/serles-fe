import { redirect } from 'next/navigation';
import BlogListing, { BLOG_PAGE_DESCRIPTION } from '../../components/blog/BlogListing';
import { buildMetadata, SITE_NAME } from '../../utils/blog';

// Blog search results: rendered per request (the query is free text), so they
// live apart from /blog, which stays cached. Thin, near-duplicate pages, so
// noindex while still letting crawlers follow through to the posts.
export async function generateMetadata({ searchParams }) {
  const params = (await searchParams) || {};
  const search = typeof params.search === 'string' ? params.search.trim() : '';
  return {
    ...buildMetadata({
      title: `Search results for “${search}” | ${SITE_NAME} Blog`,
      description: BLOG_PAGE_DESCRIPTION,
      path: '/blog',
    }),
    robots: { index: false, follow: true },
  };
}

export default async function BlogSearchPage({ searchParams }) {
  const params = (await searchParams) || {};
  const search = typeof params.search === 'string' ? params.search.trim() : '';
  if (!search) redirect('/blog');
  return <BlogListing search={search} />;
}
