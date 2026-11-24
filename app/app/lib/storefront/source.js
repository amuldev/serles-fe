import { db } from './db.js';

// Raw, JSON-serialisable snapshots of the shop database. The whole public
// catalog is 17 products and the blog 25 posts, so each snapshot is one small
// batch of queries; every API-shaped response is then derived in memory
// (api.js). server.js caches these snapshots for a day under the `catalog` /
// `blog` tags, which /api/revalidate clears when staff save content in Django.
//
// Ordering mirrors the Django querysets exactly, including where Django sets
// no ORDER BY (shop categories): the same unordered query returns rows in the
// same physical order.

const IST = (column) => `to_char(${column} AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD"T"HH24:MI:SS.US')`;
const UTC = (column) => `to_char(${column} AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US')`;

export async function loadCatalogSnapshot() {
  const sql = db();
  const [contentTypes, categories, tags, products, productTags, images, weights, metadata] = await Promise.all([
    sql`select id, app_label, model from django_content_type where app_label in ('app', 'blog')`,
    // CategoryViewSet: category_qs(), no ordering. Count includes inactive products.
    sql`select c.id, c.name, c.slug, c.description, c.image, c.sku_prefix,
               (select count(*) from app_product p where p.category_id = c.id)::int as products_count
          from app_category c`,
    // Tag Meta.ordering = ['name']. Count includes inactive products.
    sql`select t.id, t.name, t.slug, t.description, t.color, t.is_active,
               (select count(*) from app_product_tags pt where pt.tag_id = t.id)::int as products_count
          from app_tag t
         order by t.name`,
    // ProductViewSet default sort: order_by('name'). All products are loaded;
    // inactive ones are still needed for blog related-product checks.
    sql.unsafe(`select id, category_id, name, slug, sku, short_description, description,
                       base_price::text as base_price, additional_information, featured_image,
                       is_active, is_featured, is_new, is_best_seller,
                       ${IST('created_at')} as created_at, ${IST('updated_at')} as updated_at
                  from app_product
                 order by name`),
    sql`select product_id, tag_id from app_product_tags`,
    // ProductImage Meta.ordering = ['order', 'created_at'].
    sql`select id, product_id, image, alt_text, is_featured, "order"
          from app_productimage
         order by "order", created_at`,
    // ProductWeight Meta.ordering = ['order', 'weight__weight_in_grams'].
    sql`select pw.id, pw.product_id, pw.price::text as price, pw.is_active, pw."order",
               w.id as weight_id, w.name as weight_name, w.weight_in_grams,
               w.is_active as weight_is_active, w."order" as weight_order
          from app_productweight pw
          join app_weight w on w.id = pw.weight_id
         order by pw."order", w.weight_in_grams`,
    sql`select content_type_id, object_id, meta_title, meta_description, og_title, og_description,
               og_image, twitter_title, twitter_description, twitter_image, schema_json
          from app_metadata`,
  ]);

  return {
    contentTypes: [...contentTypes],
    categories: [...categories],
    tags: [...tags],
    products: [...products],
    productTags: [...productTags],
    images: [...images],
    weights: [...weights],
    metadata: [...metadata],
  };
}

const POST_COLUMNS = ['id', 'title', 'slug', 'excerpt', 'content', 'category_id', 'cover_image', 'cover_image_alt',
  'author_name', 'focus_keyword', 'canonical_url', 'status', 'is_featured', 'published_at', 'views_count',
  'created_at', 'updated_at'].map((c) => `"blog_blogpost"."${c}"`).join(', ');

/** Django's icontains escaping (backslash is Postgres LIKE's default escape). */
function likeContains(value) {
  return `%${value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')}%`;
}

/**
 * Post ids for the /api/blog/posts/ list endpoint, from the same SQL that
 * BlogPostViewSet.get_queryset() generates (joins, DISTINCT, single-column
 * ORDER BY, LIMIT). Running Django's exact query keeps the order of posts that
 * tie on the sort column identical, which a re-sort in JS cannot guarantee.
 */
export async function loadPostListIds(searchParams) {
  const params = searchParams instanceof URLSearchParams ? searchParams : new URLSearchParams(searchParams);
  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const tag = params.get('tag') || '';
  const featured = ['1', 'true', 'yes'].includes((params.get('featured') || '').toLowerCase());
  const field = { date: 'published_at', title: 'title', views: 'views_count' }[params.get('sort') || 'date'] || 'published_at';
  const direction = (params.get('order') || 'desc').toLowerCase() !== 'asc' ? 'DESC' : 'ASC';
  const limit = params.get('limit');

  const values = [];
  const bind = (v) => { values.push(v); return `$${values.length}`; };
  const joins = [];
  const where = [`"blog_blogpost"."status" = 'published'`];

  if (search) {
    joins.push('LEFT OUTER JOIN "blog_blogpost_tags" ON ("blog_blogpost"."id" = "blog_blogpost_tags"."blogpost_id")');
    joins.push('LEFT OUTER JOIN "blog_blogtag" ON ("blog_blogpost_tags"."blogtag_id" = "blog_blogtag"."id")');
  }
  if (search || category) {
    // Shared join: promoted to INNER when the category filter needs it.
    joins.push(`${category ? 'INNER' : 'LEFT OUTER'} JOIN "blog_blogcategory" ON ("blog_blogpost"."category_id" = "blog_blogcategory"."id")`);
  }
  if (search) {
    const p = bind(likeContains(search));
    where.push(`(${['"blog_blogpost"."title"', '"blog_blogpost"."excerpt"', '"blog_blogpost"."content"',
      '"blog_blogpost"."focus_keyword"', '"blog_blogtag"."name"', '"blog_blogcategory"."name"']
      .map((col) => `UPPER(${col}::text) LIKE UPPER(${p})`).join(' OR ')})`);
  }
  if (category) where.push(`"blog_blogcategory"."slug" = ${bind(category)}`);
  if (tag) {
    // A separate filter() on a multi-valued relation gets its own join, which
    // Django aliases when the search filter already joined the same tables.
    const [t, g] = search ? ['T5', 'T6'] : ['"blog_blogpost_tags"', '"blog_blogtag"'];
    joins.push(`INNER JOIN "blog_blogpost_tags"${search ? ' T5' : ''} ON ("blog_blogpost"."id" = ${t}."blogpost_id")`);
    joins.push(`INNER JOIN "blog_blogtag"${search ? ' T6' : ''} ON (${t}."blogtag_id" = ${g}."id")`);
    where.push(`${g}."slug" = ${bind(tag)}`);
  }
  if (featured) where.push('"blog_blogpost"."is_featured"');

  let query = `SELECT ${search ? 'DISTINCT ' : ''}${POST_COLUMNS} FROM "blog_blogpost" ${joins.join(' ')} `
    + `WHERE (${where.join(' AND ')}) ORDER BY "blog_blogpost"."${field}" ${direction}`;
  if (limit && /^[0-9]+$/.test(limit)) query += ` LIMIT ${Number(limit)}`;

  const rows = await db().unsafe(query, values);
  return rows.map((r) => r.id);
}

export async function loadBlogSnapshot() {
  const sql = db();
  const [categories, tags, posts, postTags] = await Promise.all([
    // BlogCategory Meta.ordering = ['order', 'name']; counts published posts only.
    sql`select c.id, c.name, c.slug, c.description, c.image, c.is_active, c."order",
               (select count(*) from blog_blogpost p
                 where p.category_id = c.id and p.status = 'published')::int as posts_count
          from blog_blogcategory c
         order by c."order", c.name`,
    sql`select t.id, t.name, t.slug, t.description, t.is_active,
               (select count(*) from blog_blogpost_tags bt
                  join blog_blogpost p on p.id = bt.blogpost_id
                 where bt.blogtag_id = t.id and p.status = 'published')::int as posts_count
          from blog_blogtag t
         order by t.name`,
    // BlogPost Meta.ordering = ['-published_at', '-created_at'] (NULLS FIRST on
    // DESC, as in Django's SQL). Only published posts are ever public.
    sql.unsafe(`select id, title, slug, excerpt, content, category_id, cover_image, cover_image_alt,
                       author_name, focus_keyword, canonical_url, status, is_featured, views_count,
                       ${IST('published_at')} as published_at, ${IST('created_at')} as created_at,
                       ${IST('updated_at')} as updated_at,
                       ${UTC('published_at')} as published_at_utc, ${UTC('updated_at')} as updated_at_utc,
                       to_char(coalesce(updated_at, published_at) AT TIME ZONE 'UTC', 'YYYY-MM-DD') as lastmod
                  from blog_blogpost
                 where status = 'published'
                 order by published_at desc, created_at desc`),
    sql`select blogpost_id, blogtag_id from blog_blogpost_tags order by id`,
  ]);

  // Related products/categories have no ORDER BY in Django: the join plan
  // decides. Running Django's exact prefetch query shape, one post at a time
  // as its detail view does, returns them in the order Django would.
  // Issued concurrently (the pool caps parallelism); each is still Django's
  // exact single-post query, so ordering is unchanged.
  const perPost = await Promise.all(posts.map((post) => Promise.all([
    sql`select r.blogpost_id, p.id as product_id
          from app_product p
         inner join blog_blogpost_related_products r on (p.id = r.product_id)
          left outer join app_category c on (p.category_id = c.id)
         where r.blogpost_id in (${post.id})`,
    sql`select r.blogpost_id, c.id as category_id
          from app_category c
         inner join blog_blogpost_related_categories r on (c.id = r.category_id)
         where r.blogpost_id in (${post.id})`,
  ])));
  const relatedProducts = perPost.flatMap(([productRows]) => [...productRows]);
  const relatedCategories = perPost.flatMap(([, categoryRows]) => [...categoryRows]);

  // List sorting is ORDER BY one column, so ties (two posts published in the
  // same batch) come back in whatever order Postgres returns. Capture that
  // order with Django's exact queries instead of re-sorting in JS - this also
  // keeps the database collation for title sorting.
  const sortQuery = (column, direction) => sql.unsafe(
    `select id from blog_blogpost where status = 'published' order by "${column}" ${direction}`,
  );
  const sortKeys = [['published_at', 'desc'], ['published_at', 'asc'], ['title', 'desc'], ['title', 'asc'],
    ['views_count', 'desc'], ['views_count', 'asc']];
  const sortResults = await Promise.all(sortKeys.map(([c, d]) => sortQuery(c, d)));
  const orderings = Object.fromEntries(sortKeys.map(([c, d], i) => [`${c} ${d}`, sortResults[i].map((r) => r.id)]));

  return {
    categories: [...categories],
    tags: [...tags],
    posts: [...posts],
    postTags: [...postTags],
    relatedProducts,
    relatedCategories,
    orderings,
  };
}
