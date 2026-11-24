import Link from "next/link";
import Image from "next/image";
import { FaArrowRight } from "react-icons/fa";
import styles from './ProductCard.module.scss';

/** "₹450.00 - ₹900.00" -> "₹450 – ₹900"; a single price stays single. */
export function formatPriceRange(range) {
  if (!range) return null;
  const nums = String(range).replace(/\$/g, '₹').match(/[\d,]+(?:\.\d+)?/g);
  if (!nums) return String(range).replace(/\$/g, '₹');
  const fmt = (n) => `₹${Number(n.replace(/,/g, '')).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  const [lo, hi] = nums;
  return hi && hi !== lo ? `${fmt(lo)} – ${fmt(hi)}` : fmt(lo);
}

/**
 * Product tile for /cakes, category, tag, related and bestseller grids.
 * Restyled 24 Nov 2026 (ui-ux-pro-max pass): a card with the photo, a category
 * chip, the name in brand ink and a tidy price range. Keeps the Bootstrap
 * column wrapper the grids expect.
 */
export default function ProductCard({ product, priority = false, headingLevel = 'h2', columns = 'col-lg-3 col-md-6 col-6' }) {
  const Heading = headingLevel === 'h3' ? 'h3' : 'h2';
  const href = product.category?.slug && product.slug ? `/cakes/${product.category.slug}/${product.slug}` : '/cakes';
  const price = formatPriceRange(product.price_range);
  return (
    <div className={`${columns} ${styles.col}`}>
      <Link href={href} className={styles.card}>
        <span className={styles.photo}>
          <Image
            src={product.featured_image?.url || "/img/placeholder.jpg"}
            alt={product.featured_image?.alt_text || product.name}
            width={400}
            height={400}
            priority={priority}
            fetchPriority={priority ? 'high' : 'auto'}
            sizes="(min-width: 992px) 25vw, 50vw"
          />
          {product.category?.name && <span className={styles.chip}>{product.category.name}</span>}
        </span>
        <span className={styles.body}>
          <Heading className={styles.name}>{product.name}</Heading>
          <span className={styles.price}>{price || 'Ask for price'}</span>
          <span className={styles.more} aria-hidden="true">View details <FaArrowRight /></span>
        </span>
      </Link>
    </div>
  );
}
