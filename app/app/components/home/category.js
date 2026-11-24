import Link from 'next/link';
import Image from 'next/image';
import { getCategoriesUrl, getProductsUrl } from '../../config/api';
import { serverApiUrl, serverFetchOptions, catalogList, fetchCatalogJson } from '../../utils/catalog';
import { apiFetch } from '../../utils/apiFetch';
import SectionHeading from '../ui/SectionHeading';
import './productgrid.scss';

async function fetchCategories() {
  const res = await apiFetch(serverApiUrl(getCategoriesUrl()), serverFetchOptions());
  if (!res.ok) {
    throw new Error('Failed to fetch categories');
  }
  return res.json();
}

/** A real photo for categories without their own image (Themed Cake showed the template's stock cupcake). */
async function productPhotoByCategory() {
  try {
    const products = catalogList(await fetchCatalogJson(getProductsUrl()));
    const map = {};
    for (const p of products) {
      if (p.category?.slug && p.featured_image?.url && !map[p.category.slug]) map[p.category.slug] = p.featured_image.url;
    }
    return map;
  } catch {
    return {};
  }
}

export default async function Category() {
  const [categoriesData, fallbackPhotos] = await Promise.all([fetchCategories(), productPhotoByCategory()]);
  const categories = catalogList(categoriesData);
  return (
    <section className="container pt-5 pb-2">
      {/* The homepage's <h1>: the first heading on the page, matching the
          title's primary keyword. This component is homepage-only. */}
      <SectionHeading
        as="h1"
        align="center"
        title="Homemade Cakes in Tenkasi"
        intro="Baked fresh after you order in Ilanji, for every celebration."
      />
      <ul className="product_grid">
        {categories.map((category, index) => {
          const image = (typeof category.image === 'string' ? category.image : category.image?.url) || fallbackPhotos[category.slug];
          return (
            <li className="product_grid_item" key={category.id}>
              <Link href={`/cakes/${category.slug}`} className="product_grid_link">
                <span className="product_grid_photo">
                  {image && (
                    <Image
                      src={image}
                      alt=""
                      width={240}
                      height={240}
                      sizes="(max-width: 768px) 30vw, 180px"
                      priority={index < 3}
                      fetchPriority={index === 0 ? 'high' : 'auto'}
                    />
                  )}
                </span>
                <span className="product_grid_name">{category.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
