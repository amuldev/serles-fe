import Image from 'next/image';
import Link from 'next/link';
import { FaWhatsapp, FaArrowRight, FaTag } from 'react-icons/fa';
import { getProductsUrl } from '../../config/api';
import { catalogList, fetchCatalogJson } from '../../utils/catalog';
import { formatPriceRange } from '../ProductCard';
import styles from './cta.module.scss';

const SLUG = 'black-forest';
const WHATSAPP = `https://wa.me/916383070725?text=${encodeURIComponent('Hi! I want to order the Black Forest cake.')}`;

async function featured() {
  try {
    return catalogList(await fetchCatalogJson(getProductsUrl())).find((p) => p.slug === SLUG) || null;
  } catch {
    return null;
  }
}

/**
 * Featured cake banner (rebuilt 24 Nov 2026, ui-ux-pro-max pass). It used a
 * template stock photo under a grey overlay; it now shows the real Black Forest
 * photo and its live price. The first-order offer text is unchanged pending
 * the owner's terms.
 */
export default async function FeaturedCakeCTA() {
  const product = await featured();
  const href = product?.category?.slug ? `/cakes/${product.category.slug}/${SLUG}` : '/cakes';
  const price = formatPriceRange(product?.price_range);

  return (
    <section className={styles.section} aria-labelledby="featured-heading">
      <div className={`container ${styles.grid}`}>
        <div className={styles.photo}>
          {product?.featured_image?.url && (
            <Image src={product.featured_image.url} alt={product.featured_image.alt_text || 'Black Forest cake'} fill sizes="(max-width: 991px) 100vw, 45vw" />
          )}
        </div>
        <div className={styles.text}>
          <p className={styles.eyebrow}>Our featured cake</p>
          <h2 id="featured-heading" className={styles.title}>Black Forest</h2>
          <p className={styles.copy}>
            Our signature Black Forest: layers of chocolate sponge and whipped cream, topped with cherries.
            A favourite for birthdays and every celebration.
          </p>
          {price && (
            <p className={styles.price}>
              {product?.price_weights?.min && product?.price_weights?.max
                ? <>{formatPriceRange(product.price_range).split(' – ')[0]}<sub>{product.price_weights.min}</sub>
                    {product.price_weights.min !== product.price_weights.max && <> – {formatPriceRange(product.price_range).split(' – ')[1]}<sub>{product.price_weights.max}</sub></>}</>
                : price}
            </p>
          )}
          <p className={styles.offer}><FaTag aria-hidden="true" /> 10% OFF on First Order</p>
          <div className={styles.ctas}>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className={`${styles.button} ${styles.whatsapp}`}>
              <FaWhatsapp aria-hidden="true" /> Order on WhatsApp
            </a>
            <Link href={href} className={`${styles.button} ${styles.light}`}>
              See sizes <FaArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
