import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';
import ProductCard from '../ProductCard';
import SectionHeading from '../ui/SectionHeading';
import styles from './Bestselling.module.css';

/**
 * Homepage bestseller strip. BestsellingWrapper fetches on the server and
 * passes `initialProducts`, so the products are in the server HTML. Since
 * 24 Nov 2026 it reuses the shared ProductCard (it had its own copy) and the
 * shared section heading, and no longer needs to be a client component.
 */
export default function Bestselling({ initialProducts = [] }) {
  const products = initialProducts || [];
  const viewAll = (
    <Link href="/cakes" className={styles.viewAll}>View all cakes <FaArrowRight aria-hidden="true" /></Link>
  );

  return (
    <section className={styles.section}>
      <div className="container">
        <SectionHeading eyebrow="Customer favourites" title="Bestselling cakes" action={viewAll} />
        {products.length === 0 ? (
          // Empty results from a failed/slow catalog fetch are not proof that
          // inventory is empty. Keep the section calm until products load.
          <p className={styles.loadingMessage}>Explore our cake collection while we refresh today&apos;s bestsellers.</p>
        ) : (
          <div className="row">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} headingLevel="h3" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
