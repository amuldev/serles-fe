// Django REST API, reimplemented over the database snapshots (source.js).
//
// resolveApi(url, snapshots) returns { status, data } exactly as the Django
// endpoint the storefront used to call would have. Field order, ordering,
// filtering, number/date formatting and the MetaData auto-generation follow
// serlesbackend/serles/{app,blog}/{models,serializers,api_views}.py; comments
// name the Python they mirror. scripts/qa/parity.mjs diffs every endpoint the
// site uses against Django itself.
//
// Deliberate difference: Django's post detail added 1 to views_count on every
// cache miss ("noise", per serlesbackend/CLAUDE.md). Reads here never write.

import {
  decimal2, decimalCompare, drfDateTime, isDigits, mediaUrl, pyFormat0f, pyRound, pySlice, pyWordCount, utcIso,
} from './format.js';

const BRAND = "Serle's Bake";

// ---------------------------------------------------------------------------
// Indexes (built once per snapshot object)
// ---------------------------------------------------------------------------
const catalogIndexes = new WeakMap();
const blogIndexes = new WeakMap();

function groupBy(rows, key) {
  const map = new Map();
  for (const row of rows) {
    const k = row[key];
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(row);
  }
  return map;
}

function catalogIndex(catalog) {
  let ix = catalogIndexes.get(catalog);
  if (ix) return ix;
  const tagOrder = new Map(catalog.tags.map((t, i) => [t.id, i]));
  const ct = (app, model) => catalog.contentTypes.find((c) => c.app_label === app && c.model === model)?.id;
  const metaByKey = new Map(catalog.metadata.map((m) => [`${m.content_type_id}:${m.object_id}`, m]));
  const productTagIds = new Map();
  for (const { product_id, tag_id } of catalog.productTags) {
    if (!productTagIds.has(product_id)) productTagIds.set(product_id, []);
    productTagIds.get(product_id).push(tag_id);
  }
  for (const ids of productTagIds.values()) ids.sort((a, b) => tagOrder.get(a) - tagOrder.get(b));
  ix = {
    categoriesById: new Map(catalog.categories.map((c) => [c.id, c])),
    tagsById: new Map(catalog.tags.map((t) => [t.id, t])),
    productsById: new Map(catalog.products.map((p) => [p.id, p])),
    productTagIds,
    imagesByProduct: groupBy(catalog.images, 'product_id'),
    weightsByProduct: groupBy(catalog.weights, 'product_id'),
    meta: (app, model, id) => metaByKey.get(`${ct(app, model)}:${id}`) || null,
  };
  catalogIndexes.set(catalog, ix);
  return ix;
}

function blogIndex(blog) {
  let ix = blogIndexes.get(blog);
  if (ix) return ix;
  const tagOrder = new Map(blog.tags.map((t, i) => [t.id, i]));
  const postTagIds = new Map();
  for (const { blogpost_id, blogtag_id } of blog.postTags) {
    if (!postTagIds.has(blogpost_id)) postTagIds.set(blogpost_id, []);
    postTagIds.get(blogpost_id).push(blogtag_id);
  }
  // BlogTag Meta.ordering = ['name'] applies to the prefetched tags.
  for (const ids of postTagIds.values()) ids.sort((a, b) => tagOrder.get(a) - tagOrder.get(b));
  ix = {
    categoriesById: new Map(blog.categories.map((c) => [c.id, c])),
    tagsById: new Map(blog.tags.map((t) => [t.id, t])),
    postTagIds,
    relatedProducts: groupBy(blog.relatedProducts, 'blogpost_id'),
    relatedCategories: groupBy(blog.relatedCategories, 'blogpost_id'),
  };
  blogIndexes.set(blog, ix);
  return ix;
}

// ---------------------------------------------------------------------------
// MetaData (app/models.py MetaData.get_* and _auto_generate_*)
// ---------------------------------------------------------------------------
function pyTruthyJson(value) {
  if (value === null || value === undefined || value === '' || value === 0 || value === false) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

function autoTitle(model, o) {
  if (model === 'blogpost') return pySlice(`${o.title} | ${BRAND} Blog`, 60);
  return `${o.name} - ${BRAND} | Homemade Cakes`;
}

function autoDescription(model, o) {
  if (o.description) return pySlice(o.description, 160);
  if (model === 'product' && o.short_description) return pySlice(o.short_description, 160);
  if (model === 'category') {
    return `Explore our ${o.name} collection. Handcrafted with love and passion. Fresh ingredients, beautiful designs, and the unmatched taste of home. Order now for same-day delivery in Tenkasi.`;
  }
  if (model === 'tag') {
    return `Discover ${o.name} tagged products. Homemade cakes crafted with care and passion. Perfect for birthdays, weddings, and special celebrations. Fresh delivery in Tenkasi.`;
  }
  if (model === 'product') {
    return `Premium ${o.name} from ${BRAND}. Handcrafted with fresh ingredients and beautiful designs. Perfect for celebrations. Home delivery available in Tenkasi.`;
  }
  if (model === 'blogpost') {
    return pySlice(`${o.title} - tips and ideas from ${BRAND}, homemade cake bakers in Tenkasi. Fresh cakes, custom designs and same-day delivery.`, 160);
  }
  return `${BRAND} - Homemade cakes crafted with love and passion. From our oven to your heart. Fresh delivery in Tenkasi.`;
}

function autoSchema(model, o) {
  const schemaType = { product: 'Product', category: 'CollectionPage', tag: 'CollectionPage', blogpost: 'BlogPosting' }[model] || 'Organization';
  const areaServed = { '@type': 'City', name: 'Tenkasi, Tamil Nadu, India' };
  const schema = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: o.name,
    description: o.description,
    brand: { '@type': 'Brand', name: BRAND },
    areaServed: { ...areaServed },
  };
  if (o.autoImageUrl) schema.image = o.autoImageUrl;

  if (model === 'product') {
    // weight_options.filter(is_active=True): a fresh query, so it ignores the
    // prefetch's weight__is_active filter. Prices of 0 are skipped (`if pw.price`).
    const prices = o.schemaPrices.map(Number).filter((p) => p).sort((a, b) => a - b);
    if (prices.length > 1) {
      schema.offers = {
        '@type': 'AggregateOffer',
        lowPrice: pyFormat0f(prices[0]),
        highPrice: pyFormat0f(prices[prices.length - 1]),
        offerCount: prices.length,
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        areaServed: { ...areaServed },
      };
    } else {
      schema.offers = {
        '@type': 'Offer',
        price: pyFormat0f(prices.length ? prices[0] : o.minPrice),
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        deliveryMethod: 'https://schema.org/OnSitePickup',
        areaServed: { ...areaServed },
      };
    }
    schema.category = 'Homemade Cakes';
    schema.keywords = 'homemade cakes, birthday cakes, wedding cakes, custom cakes, fresh delivery, Tenkasi';
  } else if (model === 'category') {
    schema.url = `/cakes/${o.slug}`;
    schema.keywords = `${o.name}, homemade cakes, birthday cakes, custom cakes, Tenkasi delivery`;
    if (o.products_count) schema.numberOfItems = o.products_count;
  } else if (model === 'blogpost') {
    schema.headline = pySlice(o.title, 110);
    schema.url = `/blog/${o.slug}/`;
    schema.datePublished = utcIso(o.published_at_utc);
    schema.dateModified = utcIso(o.updated_at_utc);
    schema.author = { '@type': 'Organization', name: o.author_name || BRAND };
    schema.publisher = {
      '@type': 'Bakery',
      name: BRAND,
      address: { '@type': 'PostalAddress', addressLocality: 'Tenkasi', addressRegion: 'Tamil Nadu', addressCountry: 'IN' },
    };
    schema.mainEntityOfPage = { '@type': 'WebPage', '@id': `/blog/${o.slug}/` };
    if (o.focus_keyword) schema.keywords = o.focus_keyword;
    schema.wordCount = o.word_count;
  } else if (model === 'tag') {
    schema.url = `/cakes/tags/${o.slug}`;
    schema.keywords = `${o.name}, homemade cakes, fresh ingredients, Tenkasi delivery`;
    if (o.products_count) schema.numberOfItems = o.products_count;
  }
  return schema;
}

/** app/serializers.py build_meta_payload */
function metaPayload(model, o, row) {
  const m = row || {};
  const metaTitle = m.meta_title || autoTitle(model, o);
  const metaDescription = m.meta_description || autoDescription(model, o);
  const ogTitle = m.og_title || metaTitle;
  const ogDescription = m.og_description || metaDescription;
  const ogImage = m.og_image ? mediaUrl(m.og_image) : (o.autoImageUrl || null);
  return {
    meta_title: metaTitle,
    meta_description: metaDescription,
    og_title: ogTitle,
    og_description: ogDescription,
    og_image_url: ogImage,
    twitter_title: m.twitter_title || ogTitle,
    twitter_description: m.twitter_description || ogDescription,
    twitter_image_url: m.twitter_image ? mediaUrl(m.twitter_image) : ogImage,
    schema_json: pyTruthyJson(m.schema_json) ? m.schema_json : autoSchema(model, o),
  };
}

// ---------------------------------------------------------------------------
// Catalog (app/serializers.py)
// ---------------------------------------------------------------------------
function serializeCategory(catalog, c) {
  const ix = catalogIndex(catalog);
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: mediaUrl(c.image),
    sku_prefix: c.sku_prefix,
    meta_data: metaPayload('category', {
      name: c.name, description: c.description, slug: c.slug,
      products_count: c.products_count, autoImageUrl: mediaUrl(c.image),
    }, ix.meta('app', 'category', c.id)),
  };
}

function serializeTag(catalog, t) {
  const ix = catalogIndex(catalog);
  return {
    id: t.id,
    name: t.name,
    slug: t.slug,
    description: t.description,
    color: t.color,
    is_active: t.is_active,
    products_count: t.products_count,
    // Tag has no image attribute, so no auto image.
    meta_data: metaPayload('tag', {
      name: t.name, description: t.description, slug: t.slug, products_count: t.products_count, autoImageUrl: null,
    }, ix.meta('app', 'tag', t.id)),
  };
}

/** Product.get_featured_image_with_alt() */
function featuredImageWithAlt(catalog, p) {
  if (p.featured_image) return { image: p.featured_image, alt_text: p.name };
  const images = catalogIndex(catalog).imagesByProduct.get(p.id) || [];
  const featured = images.find((i) => i.is_featured);
  if (featured) return { image: featured.image, alt_text: featured.alt_text || p.name };
  if (images.length) return { image: images[0].image, alt_text: images[0].alt_text || p.name };
  return null;
}

/** Product.get_featured_image (property) - used for the auto OG image. */
function featuredImageName(catalog, p) {
  if (p.featured_image) return p.featured_image;
  const images = catalogIndex(catalog).imagesByProduct.get(p.id) || [];
  const featured = images.find((i) => i.is_featured);
  if (featured) return featured.image;
  return images.length ? images[0].image : null;
}

/**
 * Product.min_price / max_price / price_range over a weight-option set.
 * `publicOnly` mirrors product_qs()'s Prefetch (is_active AND weight.is_active);
 * without it, the unfiltered prefetch used by blog related products, where
 * active_weight_options only checks pw.is_active.
 */
function priceInfo(catalog, p, publicOnly) {
  const all = catalogIndex(catalog).weightsByProduct.get(p.id) || [];
  const active = all.filter((w) => w.is_active && (!publicOnly || w.weight_is_active));
  if (!active.length) {
    return { min: p.base_price, max: p.base_price, range: `₹${p.base_price}`, active };
  }
  let min = active[0].price;
  let max = active[0].price;
  for (const w of active) {
    if (decimalCompare(w.price, min) < 0) min = w.price;
    if (decimalCompare(w.price, max) > 0) max = w.price;
  }
  const range = decimalCompare(min, max) === 0 ? `₹${min}` : `₹${min} - ₹${max}`;
  return { min, max, range, active };
}

function weightDisplay(grams) {
  if (grams >= 1000 && grams % 1000 === 0) return `${grams / 1000}kg`;
  return `${grams}g`;
}

function weightDetailedDisplay(grams) {
  if (grams >= 1000) {
    const kg = Math.floor(grams / 1000);
    const g = grams % 1000;
    return g === 0 ? `${kg}kg` : `${kg}kg ${g}g`;
  }
  return `${grams}g`;
}

function serializeFeatured(catalog, p) {
  const f = featuredImageWithAlt(catalog, p);
  return f ? { url: mediaUrl(f.image), alt_text: f.alt_text } : null;
}

function productTags(catalog, p) {
  const ix = catalogIndex(catalog);
  return (ix.productTagIds.get(p.id) || []).map((id) => ix.tagsById.get(id)).filter(Boolean);
}

function categoryOf(catalog, p) {
  return p.category_id ? catalogIndex(catalog).categoriesById.get(p.category_id) || null : null;
}

/** ProductListSerializer */
function serializeProductListItem(catalog, p) {
  const category = categoryOf(catalog, p);
  const tags = productTags(catalog, p);
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    category: category ? serializeCategory(catalog, category) : null,
    short_description: p.short_description,
    description: p.description,
    additional_information: p.additional_information,
    price_range: priceInfo(catalog, p, true).range,
    featured_image: serializeFeatured(catalog, p),
    tags: tags.map((t) => serializeTag(catalog, t)),
    tags_list: tags.filter((t) => t.is_active).map((t) => t.name),
    is_active: p.is_active,
    is_featured: p.is_featured,
    is_new: p.is_new,
    is_best_seller: p.is_best_seller,
  };
}

/** ProductSerializer (detail) */
function serializeProductDetail(catalog, p) {
  const ix = catalogIndex(catalog);
  const category = categoryOf(catalog, p);
  const tags = productTags(catalog, p);
  const price = priceInfo(catalog, p, true);
  const allWeights = ix.weightsByProduct.get(p.id) || [];
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    category: category ? serializeCategory(catalog, category) : null,
    short_description: p.short_description,
    description: p.description,
    base_price: decimal2(p.base_price),
    price_range: price.range,
    min_price: decimal2(price.min),
    max_price: decimal2(price.max),
    additional_information: p.additional_information,
    featured_image: serializeFeatured(catalog, p),
    tags: tags.map((t) => serializeTag(catalog, t)),
    tags_list: tags.filter((t) => t.is_active).map((t) => t.name),
    weight_options: price.active.map((w) => ({
      id: w.id,
      weight: {
        id: w.weight_id,
        name: w.weight_name,
        weight_in_grams: w.weight_in_grams,
        display_name: weightDisplay(w.weight_in_grams),
        detailed_display_name: weightDetailedDisplay(w.weight_in_grams),
        is_active: w.weight_is_active,
        order: w.weight_order,
      },
      price: decimal2(w.price),
      is_active: w.is_active,
      order: w.order,
      display_name: `${weightDisplay(w.weight_in_grams)} - ₹${w.price}`,
      detailed_display_name: `${weightDetailedDisplay(w.weight_in_grams)} - ₹${w.price}`,
    })),
    images: (ix.imagesByProduct.get(p.id) || []).map((i) => ({
      id: i.id, image: mediaUrl(i.image), alt_text: i.alt_text, is_featured: i.is_featured, order: i.order,
    })),
    meta_data: metaPayload('product', {
      name: p.name, description: p.description, short_description: p.short_description,
      autoImageUrl: mediaUrl(featuredImageName(catalog, p)),
      schemaPrices: allWeights.filter((w) => w.is_active).map((w) => w.price),
      minPrice: price.min,
    }, ix.meta('app', 'product', p.id)),
    is_active: p.is_active,
    is_featured: p.is_featured,
    is_new: p.is_new,
    is_best_seller: p.is_best_seller,
    created_at: drfDateTime(p.created_at),
    updated_at: drfDateTime(p.updated_at),
  };
}

// ---------------------------------------------------------------------------
// Blog (blog/serializers.py, blog/models.py)
// ---------------------------------------------------------------------------
function serializeBlogCategory(catalog, c) {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: mediaUrl(c.image),
    image_url: mediaUrl(c.image),
    is_active: c.is_active,
    order: c.order,
    posts_count: c.posts_count,
    meta_data: metaPayload('blogcategory', {
      name: c.name, description: c.description, autoImageUrl: mediaUrl(c.image),
    }, catalogIndex(catalog).meta('blog', 'blogcategory', c.id)),
  };
}

function serializeBlogTag(t) {
  return {
    id: t.id, name: t.name, slug: t.slug, description: t.description, is_active: t.is_active, posts_count: t.posts_count,
  };
}

function postTags(blog, post) {
  const ix = blogIndex(blog);
  return (ix.postTagIds.get(post.id) || []).map((id) => ix.tagsById.get(id)).filter(Boolean);
}

function wordCount(post) {
  if (post._wordCount === undefined) {
    Object.defineProperty(post, '_wordCount', { value: pyWordCount(post.content), enumerable: false });
  }
  return post._wordCount;
}

/** BlogPostListSerializer */
function serializePostListItem(catalog, blog, post) {
  const ix = blogIndex(blog);
  const category = post.category_id ? ix.categoriesById.get(post.category_id) : null;
  const tags = postTags(blog, post);
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    category: category ? serializeBlogCategory(catalog, category) : null,
    tags: tags.map(serializeBlogTag),
    tags_list: tags.filter((t) => t.is_active).map((t) => t.name),
    cover_image: post.cover_image ? { url: mediaUrl(post.cover_image), alt_text: post.cover_image_alt || post.title } : null,
    author_name: post.author_name,
    focus_keyword: post.focus_keyword,
    reading_time: Math.max(1, pyRound(wordCount(post) / 200)),
    url: `/blog/${post.slug}/`,
    status: post.status,
    is_featured: post.is_featured,
    published_at: drfDateTime(post.published_at),
    views_count: post.views_count,
    created_at: drfDateTime(post.created_at),
    updated_at: drfDateTime(post.updated_at),
  };
}

/** BlogPost.get_related_posts(limit=3) */
function relatedPosts(blog, post, limit = 3) {
  const others = blog.posts.filter((p) => p.id !== post.id);
  if (post.category_id) {
    const sameCategory = others.filter((p) => p.category_id === post.category_id);
    if (sameCategory.length) return sameCategory.slice(0, limit);
  }
  // self.tags.values_list('id') covers every tag on the post, active or not.
  const tagIds = new Set(blogIndex(blog).postTagIds.get(post.id) || []);
  if (tagIds.size) {
    return others.filter((p) => (blogIndex(blog).postTagIds.get(p.id) || []).some((id) => tagIds.has(id))).slice(0, limit);
  }
  return others.slice(0, limit);
}

/** BlogPostSerializer (detail) */
function serializePostDetail(catalog, blog, post) {
  const cix = catalogIndex(catalog);
  const bix = blogIndex(blog);
  const words = wordCount(post);
  const relatedProducts = (bix.relatedProducts.get(post.id) || [])
    .map((r) => cix.productsById.get(r.product_id))
    .filter((p) => p && p.is_active)
    .map((p) => {
      const category = categoryOf(catalog, p);
      const featured = featuredImageWithAlt(catalog, p);
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price_range: priceInfo(catalog, p, false).range,
        url: category ? `/category/${category.slug}/${p.slug}/` : `/product/${p.slug}/`,
        image_url: featured ? mediaUrl(featured.image) : null,
      };
    });
  const relatedCategories = (bix.relatedCategories.get(post.id) || [])
    .map((r) => cix.categoriesById.get(r.category_id))
    .filter(Boolean)
    .map((c) => ({ id: c.id, name: c.name, slug: c.slug, url: `/category/${c.slug}/` }));

  return {
    ...serializePostListItem(catalog, blog, post),
    content: post.content,
    canonical_url: post.canonical_url,
    word_count: words,
    meta_data: metaPayload('blogpost', {
      name: post.title, title: post.title, description: post.excerpt, slug: post.slug,
      published_at_utc: post.published_at_utc, updated_at_utc: post.updated_at_utc,
      author_name: post.author_name, focus_keyword: post.focus_keyword, word_count: words,
      autoImageUrl: mediaUrl(post.cover_image),
    }, cix.meta('blog', 'blogpost', post.id)),
    related_products: relatedProducts,
    related_categories: relatedCategories,
    related_posts: relatedPosts(blog, post).map((p) => serializePostListItem(catalog, blog, p)),
  };
}

function icontains(value, q) {
  return String(value ?? '').toUpperCase().includes(q.toUpperCase());
}

/**
 * BlogPostViewSet.get_queryset (list endpoint). With `postListIds` (from
 * source.loadPostListIds - Django's exact SQL) the database decides membership
 * and order; the in-memory filter below is the fallback used by unit tests.
 */
function filterPosts(catalog, blog, params, postListIds) {
  if (postListIds) {
    const byId = new Map(blog.posts.map((p) => [p.id, p]));
    return postListIds.map((id) => byId.get(id)).filter(Boolean).map((p) => serializePostListItem(catalog, blog, p));
  }
  const ix = blogIndex(blog);
  let posts = blog.posts.slice();
  const search = params.get('search') || '';
  if (search) {
    posts = posts.filter((p) => {
      const category = p.category_id ? ix.categoriesById.get(p.category_id) : null;
      return icontains(p.title, search) || icontains(p.excerpt, search) || icontains(p.content, search)
        || icontains(p.focus_keyword, search)
        || postTags(blog, p).some((t) => icontains(t.name, search))
        || (category && icontains(category.name, search));
    });
  }
  const categorySlug = params.get('category') || '';
  if (categorySlug) posts = posts.filter((p) => p.category_id && ix.categoriesById.get(p.category_id)?.slug === categorySlug);
  const tagSlug = params.get('tag') || '';
  if (tagSlug) posts = posts.filter((p) => postTags(blog, p).some((t) => t.slug === tagSlug));
  if (['1', 'true', 'yes'].includes((params.get('featured') || '').toLowerCase())) posts = posts.filter((p) => p.is_featured);

  const sortField = { date: 'published_at', title: 'title', views: 'views_count' }[params.get('sort') || 'date'] || 'published_at';
  const descending = (params.get('order') || 'desc').toLowerCase() !== 'asc';
  posts = orderLike(blog, posts, `${sortField} ${descending ? 'desc' : 'asc'}`);

  const limit = params.get('limit');
  if (limit && isDigits(limit)) posts = posts.slice(0, Number(limit));
  return posts.map((p) => serializePostListItem(catalog, blog, p));
}

/** Order rows as the database returned `ORDER BY <key>` (captured in source.js). */
function orderLike(blog, rows, key) {
  const position = new Map((blog.orderings[key] || []).map((id, i) => [id, i]));
  return rows
    .map((row, i) => ({ row, i }))
    .sort((a, b) => (position.get(a.row.id) ?? Infinity) - (position.get(b.row.id) ?? Infinity) || a.i - b.i)
    .map(({ row }) => row);
}

function limitParam(params) {
  const raw = params.get('limit') ?? '5';
  return isDigits(raw) ? Number(raw) : 5;
}

function lookup(rows, value) {
  return isDigits(value) ? rows.find((r) => r.id === Number(value)) : rows.find((r) => r.slug === value);
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
const notFound = (model) => ({ status: 404, data: { detail: model ? `No ${model} matches the given query.` : 'Not found.' } });
const ok = (data) => ({ status: 200, data });

/** Which snapshots a URL needs, or null if it is not a storefront API URL. */
export function apiSnapshotNeeds(url) {
  const path = apiPath(url);
  if (!path) return null;
  if (path[0] === 'blog') return { catalog: true, blog: true };
  if (['products', 'categories', 'tags'].includes(path[0])) return { catalog: true, blog: false };
  return null;
}

function apiPath(url) {
  let parsed;
  try {
    parsed = new URL(url, 'http://storefront.local');
  } catch {
    return null;
  }
  const parts = parsed.pathname.split('/').filter(Boolean);
  if (parts[0] !== 'api') return null;
  return parts.slice(1).map(decodeURIComponent);
}

/**
 * Resolve a storefront API URL (absolute or relative, trailing slash optional).
 * `snapshots` = { catalog, blog } from source.js (blog may be omitted for catalog URLs).
 */
export function resolveApi(url, { catalog, blog, postListIds }) {
  const path = apiPath(url);
  if (!path) return notFound();
  const params = new URL(url, 'http://storefront.local').searchParams;
  const [resource, a, b, ...rest] = path;
  // Catalog URLs have at most two segments after /api; blog URLs up to four.
  if (resource !== 'blog' && rest.length) return notFound();
  if (resource === 'blog' && rest.length > 1) return notFound();

  if (resource === 'products') {
    if (!a) return ok(catalog.products.filter((p) => p.is_active).map((p) => serializeProductListItem(catalog, p)));
    if (b) return notFound();
    const product = isDigits(a) ? catalog.products.find((p) => p.id === Number(a) && p.is_active) : null;
    return product ? ok(serializeProductDetail(catalog, product)) : notFound('Product');
  }
  if (resource === 'categories' && !a) return ok(catalog.categories.map((c) => serializeCategory(catalog, c)));
  if (resource === 'tags' && !a) return ok(catalog.tags.filter((t) => t.is_active).map((t) => serializeTag(catalog, t)));

  if (resource !== 'blog' || !blog) return notFound();
  const [section, slug, action] = [a, b, rest[0]];
  const list = (posts) => posts.map((p) => serializePostListItem(catalog, blog, p));

  if (section === 'posts') {
    if (!slug) return ok(filterPosts(catalog, blog, params, postListIds));
    if (!action) {
      if (slug === 'featured') return ok(list(blog.posts.filter((p) => p.is_featured)));
      if (slug === 'latest') return ok(list(blog.posts.slice(0, limitParam(params))));
      if (slug === 'popular') return ok(list(orderLike(blog, blog.posts, 'views_count desc').slice(0, limitParam(params))));
      if (slug === 'sitemap') {
        return ok(blog.posts.map((p) => ({
          slug: p.slug, url: `/blog/${p.slug}/`, lastmod: p.lastmod, changefreq: 'monthly', priority: '0.7',
        })));
      }
    }
    const post = lookup(blog.posts, slug);
    if (!post) return notFound('BlogPost');
    if (!action) return ok(serializePostDetail(catalog, blog, post));
    if (action === 'related') return ok(list(relatedPosts(blog, post)));
    return notFound();
  }

  if (section === 'categories' || section === 'tags') {
    const isCategory = section === 'categories';
    const active = (isCategory ? blog.categories : blog.tags).filter((r) => r.is_active);
    if (!slug) return ok(active.map((r) => (isCategory ? serializeBlogCategory(catalog, r) : serializeBlogTag(r))));
    const row = lookup(active, slug);
    if (!row) return notFound(isCategory ? 'BlogCategory' : 'BlogTag');
    if (!action) return ok(isCategory ? serializeBlogCategory(catalog, row) : serializeBlogTag(row));
    if (action === 'posts') {
      return ok(list(blog.posts.filter((p) => (isCategory
        ? p.category_id === row.id
        : (blogIndex(blog).postTagIds.get(p.id) || []).includes(row.id)))));
    }
    return notFound();
  }
  return notFound();
}

/** Query params when `url` is the filterable /api/blog/posts/ list, else null. */
export function postListParams(url) {
  const path = apiPath(url);
  if (!path || path.length !== 2 || path[0] !== 'blog' || path[1] !== 'posts') return null;
  return new URL(url, 'http://storefront.local').searchParams;
}
