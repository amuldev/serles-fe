// Unit tests for the database-backed storefront API (app/lib/storefront).
// Fixture-based: no database or Django needed. Cases the live data does not
// currently contain (inactive products, retired weights, inactive blog
// categories/tags, untagged posts...) are covered here; scripts/qa/parity.mjs
// covers real data against Django itself.
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  drfDateTime, mediaUrl, pyFormat0f, pyRound, pySlice, pyWordCount, utcIso,
} from '../app/lib/storefront/format.js';
import { postListParams, resolveApi } from '../app/lib/storefront/api.js';

test('Python rounding and slicing semantics', () => {
  assert.deepEqual([0.5, 1.5, 2.5, 3.5, 2.4, 2.6].map(pyRound), [0, 2, 2, 4, 2, 3]);
  assert.equal(pyFormat0f('549.50'), '550');
  assert.equal(pyFormat0f('548.50'), '548');
  assert.equal(pySlice('🎂🎂🎂abc', 4), '🎂🎂🎂a');
});

test('media URLs match django-storages filepath_to_uri', () => {
  assert.equal(mediaUrl('products/a b/(1)!~*\'.jpg'), "https://cdn.serlesbake.in/products/a%20b/(1)!~*'.jpg");
  assert.equal(mediaUrl('blog/கேக்.png'), 'https://cdn.serlesbake.in/blog/%E0%AE%95%E0%AF%87%E0%AE%95%E0%AF%8D.png');
  assert.equal(mediaUrl(''), null);
  assert.equal(mediaUrl(null), null);
});

test('datetimes match DRF (IST) and isoformat (UTC)', () => {
  assert.equal(drfDateTime('2025-08-12T04:52:13.266000'), '2025-08-12T04:52:13.266000+05:30');
  assert.equal(drfDateTime('2025-08-12T04:52:13.000000'), '2025-08-12T04:52:13+05:30');
  assert.equal(utcIso('2026-11-15T06:00:00.123456'), '2026-11-15T06:00:00.123456+00:00');
  assert.equal(drfDateTime(null), null);
});

test('word count uses Python str.split() whitespace', () => {
  assert.equal(pyWordCount('<p>one two</p><p>three</p>'), 3);
  assert.equal(pyWordCount('a b c\x1cd﻿e'), 4); // U+FEFF is not whitespace in Python
  assert.equal(pyWordCount(''), 0);
});

// ---------------------------------------------------------------------------
const meta = (ct, id, extra = {}) => ({
  content_type_id: ct, object_id: id, meta_title: '', meta_description: '', og_title: '', og_description: '',
  og_image: '', twitter_title: '', twitter_description: '', twitter_image: '', schema_json: null, ...extra,
});

function fixtures() {
  const catalog = {
    contentTypes: [
      { id: 1, app_label: 'app', model: 'product' }, { id: 2, app_label: 'app', model: 'category' },
      { id: 3, app_label: 'app', model: 'tag' }, { id: 4, app_label: 'blog', model: 'blogpost' },
      { id: 5, app_label: 'blog', model: 'blogcategory' },
    ],
    categories: [{ id: 10, name: 'Brownie', slug: 'brownie', description: '', image: 'categories/b.png', sku_prefix: 'BR', products_count: 3 }],
    tags: [
      { id: 20, name: 'Chocolate', slug: 'chocolate', description: '', color: '#000', is_active: true, products_count: 1 },
      { id: 21, name: 'Old', slug: 'old', description: '', color: '#111', is_active: false, products_count: 1 },
    ],
    products: [
      { id: 1, category_id: 10, name: 'A Cake', slug: 'a-cake', sku: 'BR1', short_description: 's', description: 'd',
        base_price: '300.00', additional_information: '', featured_image: '', is_active: true, is_featured: false,
        is_new: false, is_best_seller: true, created_at: '2025-01-01T10:00:00.000000', updated_at: '2025-01-02T10:00:00.500000' },
      { id: 2, category_id: null, name: 'B Hidden', slug: 'b-hidden', sku: 'X', short_description: '', description: '',
        base_price: '100.00', additional_information: '', featured_image: 'p/b.jpg', is_active: false, is_featured: false,
        is_new: false, is_best_seller: false, created_at: '2025-01-01T10:00:00.000000', updated_at: '2025-01-01T10:00:00.000000' },
      { id: 3, category_id: 10, name: 'C Plain', slug: 'c-plain', sku: 'BR3', short_description: '', description: '',
        base_price: '250.00', additional_information: '', featured_image: '', is_active: true, is_featured: false,
        is_new: false, is_best_seller: false, created_at: '2025-01-01T10:00:00.000000', updated_at: '2025-01-01T10:00:00.000000' },
    ],
    productTags: [{ product_id: 1, tag_id: 21 }, { product_id: 1, tag_id: 20 }],
    images: [
      { id: 50, product_id: 1, image: 'p/first.jpg', alt_text: '', is_featured: false, order: 0 },
      { id: 51, product_id: 1, image: 'p/feat.jpg', alt_text: 'Featured alt', is_featured: true, order: 1 },
    ],
    weights: [
      { id: 60, product_id: 1, price: '549.00', is_active: true, order: 0, weight_id: 7, weight_name: '0.5kg', weight_in_grams: 500, weight_is_active: true, weight_order: 0 },
      { id: 61, product_id: 1, price: '999.00', is_active: true, order: 1, weight_id: 8, weight_name: '1kg', weight_in_grams: 1000, weight_is_active: true, weight_order: 1 },
      // Retired weight: hidden publicly, still counted by schema and blog cards (as Django does).
      { id: 62, product_id: 1, price: '1499.00', is_active: true, order: 2, weight_id: 9, weight_name: '1.5kg', weight_in_grams: 1500, weight_is_active: false, weight_order: 2 },
      { id: 63, product_id: 1, price: '50.00', is_active: false, order: 3, weight_id: 10, weight_name: '100g', weight_in_grams: 100, weight_is_active: true, weight_order: 3 },
    ],
    metadata: [meta(1, 3, { meta_title: 'Custom title' })],
  };
  const post = (id, slug, extra = {}) => ({
    id, title: `Post ${id}`, slug, excerpt: `Excerpt ${id}`, content: '<p>word </p>'.repeat(500), category_id: null,
    cover_image: '', cover_image_alt: '', author_name: "Serle's Bake", focus_keyword: '', canonical_url: '',
    status: 'published', is_featured: false, views_count: 0, published_at: '2026-01-0' + id + 'T10:00:00.000000',
    created_at: '2026-01-01T10:00:00.000000', updated_at: '2026-01-01T10:00:00.000000',
    published_at_utc: '2026-01-0' + id + 'T04:30:00.000000', updated_at_utc: '2026-01-01T04:30:00.000000', lastmod: '2026-01-01', ...extra,
  });
  const blog = {
    categories: [
      { id: 1, name: 'Guides', slug: 'guides', description: '', image: '', is_active: true, order: 0, posts_count: 2 },
      { id: 2, name: 'Hidden', slug: 'hidden', description: '', image: '', is_active: false, order: 1, posts_count: 1 },
    ],
    tags: [
      { id: 5, name: 'Cakes', slug: 'cakes', description: '', is_active: true, posts_count: 2 },
      { id: 6, name: 'Retired', slug: 'retired', description: '', is_active: false, posts_count: 1 },
    ],
    // Default ordering: -published_at.
    posts: [
      post(4, 'four', { category_id: 2 }),
      post(3, 'three', { category_id: 1, cover_image: 'blog/c.jpg' }),
      post(2, 'two', { category_id: 1, content: '<p>one two three</p>' }),
      post(1, 'one', { is_featured: true }),
    ],
    postTags: [{ blogpost_id: 1, blogtag_id: 6 }, { blogpost_id: 4, blogtag_id: 6 }, { blogpost_id: 3, blogtag_id: 5 }],
    relatedProducts: [{ blogpost_id: 3, product_id: 2 }, { blogpost_id: 3, product_id: 1 }],
    relatedCategories: [{ blogpost_id: 3, category_id: 10 }],
    orderings: { 'views_count desc': [4, 3, 2, 1] },
  };
  return { catalog, blog };
}

test('product list hides inactive products and keeps public weight rules', () => {
  const { catalog } = fixtures();
  const { status, data } = resolveApi('/api/products/?format=json&page=1&page_size=100', { catalog });
  assert.equal(status, 200);
  assert.deepEqual(data.map((p) => p.id), [1, 3]);
  const a = data[0];
  assert.equal(a.price_range, '₹549.00 - ₹999.00'); // retired weight and inactive option excluded
  assert.deepEqual(a.featured_image, { url: 'https://cdn.serlesbake.in/p/feat.jpg', alt_text: 'Featured alt' });
  assert.deepEqual(a.tags.map((t) => t.slug), ['chocolate', 'old']); // tag Meta.ordering = name
  assert.deepEqual(a.tags_list, ['Chocolate']); // inactive tags only dropped from tags_list
  assert.equal(data[1].price_range, '₹250.00'); // no weights -> base price
  assert.equal(data[1].featured_image, null);
});

test('product detail: 404s, decimals, weights and auto schema', () => {
  const { catalog } = fixtures();
  assert.equal(resolveApi('/api/products/2/', { catalog }).status, 404); // inactive
  assert.equal(resolveApi('/api/products/999/', { catalog }).status, 404);
  assert.equal(resolveApi('/api/products/abc/', { catalog }).status, 404);
  const { data } = resolveApi('https://shop.serlesbake.in/api/products/1/?format=json&ssr=1', { catalog });
  assert.deepEqual([data.base_price, data.min_price, data.max_price], ['300.00', '549.00', '999.00']);
  assert.deepEqual(data.weight_options.map((w) => w.display_name), ['500g - ₹549.00', '1kg - ₹999.00']);
  assert.equal(data.updated_at, '2025-01-02T10:00:00.500000+05:30');
  const schema = data.meta_data.schema_json;
  assert.equal(schema['@type'], 'Product');
  // weight_options.filter(is_active=True) includes the retired weight's price.
  assert.deepEqual([schema.offers['@type'], schema.offers.lowPrice, schema.offers.highPrice, schema.offers.offerCount],
    ['AggregateOffer', '549', '1499', 3]);
  assert.equal(schema.image, 'https://cdn.serlesbake.in/p/feat.jpg');
  assert.equal(data.meta_data.og_image_url, 'https://cdn.serlesbake.in/p/feat.jpg');
  assert.equal(data.meta_data.meta_title, 'A Cake - Serle\'s Bake | Homemade Cakes');
  const plain = resolveApi('/api/products/3/', { catalog }).data;
  assert.equal(plain.meta_data.meta_title, 'Custom title');
  assert.equal(plain.meta_data.og_title, 'Custom title');
  assert.match(plain.meta_data.meta_description, /^Premium C Plain/);
  assert.deepEqual(plain.meta_data.schema_json.offers, {
    '@type': 'Offer', price: '250', priceCurrency: 'INR', availability: 'https://schema.org/InStock',
    deliveryMethod: 'https://schema.org/OnSitePickup', areaServed: { '@type': 'City', name: 'Tenkasi, Tamil Nadu, India' },
  });
});

test('categories and tags: counts, auto CollectionPage schema, inactive tags hidden', () => {
  const { catalog } = fixtures();
  const [category] = resolveApi('/api/categories/', { catalog }).data;
  assert.deepEqual(Object.keys(category.meta_data.schema_json),
    ['@context', '@type', 'name', 'description', 'brand', 'areaServed', 'image', 'url', 'keywords', 'numberOfItems']);
  assert.equal(category.meta_data.schema_json.numberOfItems, 3);
  assert.match(category.meta_data.meta_description, /^Explore our Brownie collection/);
  const tags = resolveApi('/api/tags/', { catalog }).data;
  assert.deepEqual(tags.map((t) => t.slug), ['chocolate']);
  assert.equal(tags[0].meta_data.og_image_url, null);
  assert.equal(tags[0].meta_data.schema_json.url, '/cakes/tags/chocolate');
});

test('blog posts: detail, related rules, reading time, 404s', () => {
  const { catalog, blog } = fixtures();
  const snaps = { catalog, blog };
  const two = resolveApi('/api/blog/posts/two/', snaps).data;
  assert.equal(two.word_count, 3);
  assert.equal(two.reading_time, 1); // max(1, round(3/200))
  assert.equal(resolveApi('/api/blog/posts/four/', snaps).data.reading_time, 2); // round(500/200 = 2.5) -> 2
  assert.deepEqual(two.related_posts.map((p) => p.slug), ['three']); // same category first
  const one = resolveApi('/api/blog/posts/1/', snaps).data; // numeric lookup
  assert.deepEqual(one.related_posts.map((p) => p.slug), ['four']); // shared (inactive) tag
  assert.deepEqual(one.tags_list, []);
  const three = resolveApi('/api/blog/posts/three/', snaps).data;
  assert.deepEqual(three.related_products, [{
    id: 1, name: 'A Cake', slug: 'a-cake', price_range: '₹549.00 - ₹1499.00', // unfiltered prefetch keeps retired weight
    url: '/category/brownie/a-cake/', image_url: 'https://cdn.serlesbake.in/p/feat.jpg',
  }]); // inactive product 2 dropped
  assert.deepEqual(three.related_categories, [{ id: 10, name: 'Brownie', slug: 'brownie', url: '/category/brownie/' }]);
  assert.deepEqual(three.cover_image, { url: 'https://cdn.serlesbake.in/blog/c.jpg', alt_text: 'Post 3' });
  assert.equal(three.meta_data.schema_json['@type'], 'BlogPosting');
  assert.equal(three.meta_data.schema_json.datePublished, '2026-01-03T04:30:00+00:00');
  assert.equal(three.category.meta_data.schema_json['@type'], 'Organization');
  assert.equal(resolveApi('/api/blog/posts/missing/', snaps).status, 404);
  assert.equal(resolveApi('/api/blog/posts/two/nope/', snaps).status, 404);
});

test('blog lists, categories and tags', () => {
  const { catalog, blog } = fixtures();
  const snaps = { catalog, blog };
  assert.deepEqual(resolveApi('/api/blog/posts/latest/?limit=2', snaps).data.map((p) => p.id), [4, 3]);
  assert.equal(resolveApi('/api/blog/posts/latest/?limit=x', snaps).data.length, 4); // non-digit -> 5
  assert.deepEqual(resolveApi('/api/blog/posts/featured/', snaps).data.map((p) => p.id), [1]);
  assert.deepEqual(resolveApi('/api/blog/posts/popular/?limit=2', snaps).data.map((p) => p.id), [4, 3]);
  assert.deepEqual(resolveApi('/api/blog/posts/sitemap/', snaps).data[0],
    { slug: 'four', url: '/blog/four/', lastmod: '2026-01-01', changefreq: 'monthly', priority: '0.7' });
  // In-memory fallback filters (production uses Django's SQL via postListIds).
  assert.deepEqual(resolveApi('/api/blog/posts/?category=guides', snaps).data.map((p) => p.id), [3, 2]);
  assert.deepEqual(resolveApi('/api/blog/posts/?search=post%203', snaps).data.map((p) => p.id), [3]);
  assert.deepEqual(resolveApi('/api/blog/posts/', { ...snaps, postListIds: [2, 4] }).data.map((p) => p.id), [2, 4]);
  assert.deepEqual(resolveApi('/api/blog/categories/', snaps).data.map((c) => c.slug), ['guides']);
  assert.equal(resolveApi('/api/blog/categories/hidden/', snaps).status, 404);
  assert.deepEqual(resolveApi('/api/blog/categories/guides/posts/', snaps).data.map((p) => p.id), [3, 2]);
  assert.deepEqual(resolveApi('/api/blog/tags/', snaps).data, [{ id: 5, name: 'Cakes', slug: 'cakes', description: '', is_active: true, posts_count: 2 }]);
  assert.equal(resolveApi('/api/blog/tags/retired/posts/', snaps).status, 404);
  assert.deepEqual(resolveApi('/api/blog/tags/5/posts/', snaps).data.map((p) => p.id), [3]);
});

test('URL recognition', () => {
  assert.ok(postListParams('https://shop.serlesbake.in/api/blog/posts/?search=x&ssr=1'));
  assert.equal(postListParams('/api/blog/posts/latest/'), null);
  assert.equal(resolveApi('/api/banners/', fixtures()).status, 404);
  assert.equal(resolveApi('/not-api/', fixtures()).status, 404);
});
