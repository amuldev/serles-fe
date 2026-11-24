import Link from "next/link";
import Image from "next/image";
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

/** "₹450.00 - ₹900.00" -> "From ₹450" (single price -> "₹450"). */
export function formatFromPrice(range) {
  if (!range) return null;
  const nums = String(range).match(/[\d,]+(?:\.\d+)?/g);
  if (!nums) return null;
  const fmt = (n) => `₹${Number(n.replace(/,/g, '')).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  return nums.length > 1 && nums[1] !== nums[0] ? `From ${fmt(nums[0])}` : fmt(nums[0]);
}

/**
 * Product tile for /cakes, category, tag, related and bestseller grids.
 * Photo-first (24 Nov 2026 redesign, inspired by bakery shop sites): a large
 * square photo with a hairline frame, then just the name and "From ₹…".
 * No chips, labels or buttons competing with the cake.
 */
export default function ProductCard({ product, priority = false, headingLevel = 'h2', columns = 'col-lg-3 col-md-4 col-6', showBadge = true }) {
  const Heading = headingLevel === 'h3' ? 'h3' : 'h2';
  const href = product.category?.slug && product.slug ? `/cakes/${product.category.slug}/${product.slug}` : '/cakes';
  const price = formatFromPrice(product.price_range);
  return (
    <div className={`${columns} ${styles.col}`}>
      <Link href={href} className={styles.card}>
        <span className={styles.photo}>
          <Image
            src={product.featured_image?.url || "/img/placeholder.jpg"}
            alt={product.featured_image?.alt_text || product.name}
            width={480}
            height={480}
            priority={priority}
            fetchPriority={priority ? 'high' : 'auto'}
            sizes="(min-width: 992px) 25vw, (min-width: 768px) 33vw, 50vw"
          />
          {showBadge && product.is_best_seller && <span className={styles.badge}>Bestseller</span>}
        </span>
        <Heading className={styles.name}>{product.name}</Heading>
        <span className={styles.price}>{price || 'Ask for price'}</span>
      </Link>
    </div>
  );
}
