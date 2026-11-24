import Link from 'next/link';
import { FaClock, FaMapMarkerAlt, FaWhatsapp, FaArrowRight } from 'react-icons/fa';
import { DELIVERY_CHARGES, FRESH_BAKE_HEADLINE, FRESH_BAKE_NOTICE } from '../../utils/deliveryPolicy';
import styles from './MenuPromo.module.scss';

const WHATSAPP = `https://wa.me/916383070725?text=${encodeURIComponent('Hi! I would like to order a cake. My delivery address/map pin is: ')}`;

/**
 * Flavours + delivery cards under the homepage menu (24 Nov 2026 redesign).
 * The old block listed Vanilla, Pineapple and Strawberry, none of which is in
 * the catalog; the flavour chips are now the actual flavoured/premium cakes.
 */
export default function MenuPromo({ products = [] }) {
  const flavours = [...new Set(products
    .filter((p) => ['flavoured-cakes', 'premium-cake'].includes(p?.category?.slug))
    .map((p) => p.name.replace(/\s+cake$/i, '')))]
    .sort((a, b) => a.localeCompare(b));

  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        <section className={styles.card} aria-labelledby="promo-flavours">
          <p className={styles.eyebrow}>Flavours</p>
          <h3 id="promo-flavours" className={styles.title}>Flavours we bake</h3>
          <p className={styles.text}>
            Pick a flavour and size for birthdays, anniversaries or any celebration. We can add your message
            and check design changes with you on WhatsApp.
          </p>
          {flavours.length > 0 && (
            <ul className={styles.chips}>
              {flavours.map((name) => <li key={name}>{name}</li>)}
            </ul>
          )}
          <Link href="/cakes/flavoured-cakes" className={`${styles.button} ${styles.outline}`}>
            See flavoured cakes <FaArrowRight aria-hidden="true" />
          </Link>
        </section>

        <section className={`${styles.card} ${styles.delivery}`} aria-labelledby="promo-delivery">
          <p className={styles.badge}><FaClock aria-hidden="true" /> {FRESH_BAKE_HEADLINE}</p>
          <h3 id="promo-delivery" className={styles.title}>Home delivery from Ilanji</h3>
          <p className={styles.text}>{FRESH_BAKE_NOTICE} {DELIVERY_CHARGES}</p>
          <p className={styles.note}><FaMapMarkerAlt aria-hidden="true" /> Within 20 km by road. Send your map pin and we confirm the route and charge.</p>
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className={`${styles.button} ${styles.whatsapp}`}>
            <FaWhatsapp aria-hidden="true" /> Order on WhatsApp
          </a>
        </section>
      </div>
    </div>
  );
}
