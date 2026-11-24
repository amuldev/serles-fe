"use client";
import Image from 'next/image';
import Link from 'next/link';
import { FaWhatsapp, FaStar, FaBirthdayCake, FaArrowRight } from 'react-icons/fa';
import styles from './MenuProductCard.module.scss';

/** "500g - ₹499.00" (the API's display_name) -> "500g". */
export function weightLabel(option) {
  // display_name carries the owner's wording ("500g"); weight.name is "0.5kg".
  const name = option?.display_name || option?.name || option?.weight?.name || '';
  return String(name).split(/\s+[-–—]\s+/)[0].trim() || 'Size';
}

/** 499 / "499.00" -> "₹499"; keeps paise only when there are any. */
export function formatRupees(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
}

/**
 * One product row on the homepage menu and /menu. Replaces two copies of the
 * same inline-styled card (24 Nov 2026), which showed every price twice
 * ("500g - ₹499.00 ₹499.00") and Font Awesome 5 icons the site never loads
 * (rendered as empty squares). SVG icons, one price per size, 44px+ buttons.
 */
export default function MenuProductCard({ product, onOrder, priority = false }) {
  const href = product?.category?.slug && product?.slug ? `/cakes/${product.category.slug}/${product.slug}` : '/cakes';
  const options = (product?.weight_options || []).filter((o) => o && o.is_active !== false);
  const image = product?.featured_image?.url;

  return (
    <article className={styles.card}>
      <Link href={href} className={styles.thumb} tabIndex={-1} aria-hidden="true">
        {image ? (
          <Image
            src={image}
            alt=""
            width={112}
            height={112}
            sizes="(max-width: 575px) 88px, 112px"
            priority={priority}
          />
        ) : (
          <span className={styles.placeholder}><FaBirthdayCake /></span>
        )}
      </Link>

      <div className={styles.body}>
        <div className={styles.titleRow}>
          <h3 className={styles.name}><Link href={href}>{product.name}</Link></h3>
          {product?.is_best_seller && (
            <span className={styles.best}><FaStar aria-hidden="true" /> Bestseller</span>
          )}
        </div>
        {product?.category?.name && <p className={styles.category}>{product.category.name}</p>}

        <ul className={styles.sizes} aria-label={`${product.name} sizes and prices`}>
          {options.length > 0 ? options.map((option, i) => (
            <li key={option.id ?? i} className={styles.size}>
              <span className={styles.weight}>{weightLabel(option)}</span>
              <span className={styles.price}>{formatRupees(option.price) || 'Ask us'}</span>
            </li>
          )) : (
            <li className={styles.size}>
              <span className={styles.weight}>Price</span>
              <span className={styles.price}>{product?.price_range || 'Ask us'}</span>
            </li>
          )}
        </ul>
      </div>

      <div className={styles.actions}>
        <Link href={href} className={`${styles.button} ${styles.view}`}>
          Details <FaArrowRight aria-hidden="true" />
        </Link>
        <button type="button" className={`${styles.button} ${styles.order}`} onClick={() => onOrder?.(product, options[0] || null)}>
          <FaWhatsapp aria-hidden="true" /> Order
        </button>
      </div>
    </article>
  );
}
