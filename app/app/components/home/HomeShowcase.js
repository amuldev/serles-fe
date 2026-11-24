"use client";
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';
import ProductCard from '../ProductCard';
import SectionHeading from '../ui/SectionHeading';
import styles from './HomeShowcase.module.scss';

/**
 * Homepage "Top sellers" grid with tabs (24 Nov 2026 redesign). Replaces the
 * 17-row price list and the separate bestseller strip with one photo-first
 * grid: Bestsellers, then a tab per category. The full price list lives on /menu.
 */
export default function HomeShowcase({ products = [], categories = [] }) {
  const tabs = useMemo(() => {
    const list = [];
    if (products.some((p) => p.is_best_seller)) list.push({ key: 'best', label: 'Bestsellers' });
    for (const c of categories) {
      if (c?.slug && products.some((p) => p.category?.slug === c.slug)) list.push({ key: c.slug, label: c.name });
    }
    return list;
  }, [products, categories]);
  const [active, setActive] = useState(tabs[0]?.key || 'best');

  // Bestsellers first, then other cakes to fill two full rows.
  const shown = (active === 'best'
    ? [...products.filter((p) => p.is_best_seller), ...products.filter((p) => !p.is_best_seller)]
    : products.filter((p) => p.category?.slug === active)).slice(0, 8);
  const moreHref = active === 'best' ? '/cakes' : `/cakes/${active}`;

  if (products.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="showcase-heading">
      <div className="container">
        <SectionHeading id="showcase-heading" align="center" title="Our top sellers" />
        <div className={styles.tabs} role="tablist" aria-label="Choose a collection">
          {tabs.map((t) => (
            <button key={t.key} type="button" role="tab" aria-selected={active === t.key} aria-controls="showcase-panel"
              className={`${styles.tab} ${active === t.key ? styles.tabActive : ''}`} onClick={() => setActive(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
        <div id="showcase-panel" role="tabpanel" className="row">
          {shown.map((p, i) => <ProductCard key={p.id} product={p} headingLevel="h3" priority={i < 2} showBadge={active !== 'best'} />)}
        </div>
        <div className={styles.more}>
          <Link href={moreHref} className={styles.moreLink}>See all {active === 'best' ? 'cakes' : tabs.find((t) => t.key === active)?.label} <FaArrowRight aria-hidden="true" /></Link>
          <Link href="/menu" className={styles.menuLink}>Full menu &amp; prices</Link>
        </div>
      </div>
    </section>
  );
}
