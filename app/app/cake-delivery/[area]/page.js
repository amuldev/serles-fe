import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumb from '../../components/Breadcrumb';
import JsonLd from '../../components/blog/JsonLd';
import { SITE_URL } from '../../utils/blog';
import { DELIVERY_COVERAGE, DELIVERY_LIMIT_KM, ORDER_LEAD_HOURS, estimateDeliveryCharge } from '../../utils/deliveryPolicy';
import { DELIVERY_AREA_PAGES, findDeliveryArea, deliveryAreaPath } from '../../utils/deliveryAreas';
import styles from '../page.module.scss';

export const dynamicParams = false;
export function generateStaticParams() { return DELIVERY_AREA_PAGES.map(area => ({ area: area.slug })); }
export async function generateMetadata({ params }) {
  const area = findDeliveryArea((await params).area);
  if (!area) return { title: 'Delivery area not found', robots: { index: false, follow: false } };
  const title = area.slug === 'pudur-sengottai'
    ? "Cake Delivery to Pudur, Sengottai | Serle's Bake"
    : `Cake Delivery to ${area.name} from Ilanji | Serle's Bake`;
  const description = `Yes, we deliver to ${area.name}: about ${Math.round(area.km)} km by road from our Ilanji bakery, delivery about ₹${estimateDeliveryCharge(area.km)}. Baked fresh after you order; order on WhatsApp.`;
  const url = `${SITE_URL}${deliveryAreaPath(area)}`;
  return { title, description, alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', locale: 'en_IN', images: ['/img/og/serles-bake-cakes.jpg'] },
    twitter: { card: 'summary_large_image', title, description, images: ['/img/og/serles-bake-cakes.jpg'] } };
}

/**
 * Area delivery page. Rewritten 24 Nov 2026 after a mobile review: the
 * answer comes first ("yes, we deliver", km, charge), one plain caveat, no raw
 * coordinates or repeated policy blocks, and a closing call-to-action card.
 */
export default async function DeliveryAreaPage({ params }) {
  const area = findDeliveryArea((await params).area);
  if (!area) notFound();
  const url = `${SITE_URL}${deliveryAreaPath(area)}`;
  const charge = estimateDeliveryCharge(area.km);
  const maps = `https://www.google.com/maps/dir/?api=1&origin=8.963562,77.281437&destination=${area.latitude},${area.longitude}&travelmode=driving`;
  const wa = `https://wa.me/916383070725?text=${encodeURIComponent(`Hi! I'd like a cake delivered to ${area.name}. My address/map pin: \nDate and time: \nCake and size: `)}`;
  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
      { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: `Cake delivery to ${area.name}`, mainEntity: { '@id': `${url}#service` }, isPartOf: { '@id': `${SITE_URL}/#website` } },
      { '@type': 'Service', '@id': `${url}#service`, url, name: `Cake delivery to ${area.name}`, provider: { '@id': `${SITE_URL}/#business` }, description: DELIVERY_COVERAGE, areaServed: { '@type': 'Place', name: area.name } },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Cake delivery', item: `${SITE_URL}/cake-delivery` },
        { '@type': 'ListItem', position: 3, name: area.name, item: url },
      ] },
    ] }} />
    <Breadcrumb title={`Cake delivery to ${area.name}`} items={[{ label: 'Cake delivery', href: '/cake-delivery' }, { label: area.name }]} />
    <article className={`container ${styles.delivery}`} data-contact-source={`delivery_${area.slug}`}>
      <section className={styles.intro}>
        <p className={styles.eyebrow}>{area.aliases}</p>
        <h2>Yes, we deliver to {area.name}</h2>
        <div className={styles.routeFacts}>
          <span><strong>{area.km.toFixed(1)} km</strong>by road from our bakery</span>
          <span><strong>about ₹{charge}</strong>delivery charge</span>
          <span><strong>{ORDER_LEAD_HOURS} hours</strong>order ahead, baked fresh</span>
        </div>
        <p>{area.intro} Your exact address may be a little nearer or further; we confirm the charge on WhatsApp before you pay.</p>
        <div className={styles.actions}>
          <a href={wa} className={styles.primary} target="_blank" rel="noopener noreferrer">Order on WhatsApp</a>
          <Link href="/menu" className={styles.secondary}>View cakes &amp; prices</Link>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{area.heading}</h2>
        {area.paragraphs.map(text => <p key={text}>{text}</p>)}
        <p><a href={maps} target="_blank" rel="noopener noreferrer">See the route on Google Maps</a></p>
      </section>

      <section className={styles.section}>
        <h2>How to order</h2>
        <ol className={styles.steps}>
          <li><strong>Choose a cake.</strong> Browse the <Link href="/menu">menu &amp; prices</Link>, or ask about <Link href="/cakes/custom-cake">custom and photo cakes</Link>.</li>
          <li><strong>Message us on WhatsApp</strong> with the cake, size, date, time and your map pin.</li>
          <li><strong>Confirm and pay</strong> by Google Pay or online payment. We bake it fresh and deliver.</li>
        </ol>
      </section>

      <section className={styles.section}>
        <h2>{area.question}</h2>
        <p>{area.answer}</p>
      </section>

      <nav className={styles.section} aria-label="Nearby delivery areas">
        <h2>Nearby areas we deliver to</h2>
        <ul>
          {area.related.map(slug => { const item = findDeliveryArea(slug); return <li key={slug}><Link href={deliveryAreaPath(item)}>Cake delivery to {item.name}</Link> — about {Math.round(item.km)} km</li>; })}
          {area.guide && <li><Link href={area.guide.href}>{area.guide.label}</Link></li>}
          <li><Link href="/cake-delivery">All delivery areas within {DELIVERY_LIMIT_KM} km</Link></li>
        </ul>
      </nav>

      <section className={styles.closing}>
        <h2>Planning a celebration in {area.name}?</h2>
        <p>Send the date, cake and your map pin; we confirm everything before you pay.</p>
        <div className={styles.actions}>
          <a href={wa} className={styles.primary} target="_blank" rel="noopener noreferrer">Order on WhatsApp</a>
          <a className={styles.secondary} href="tel:+916383070725">Call +91 63830 70725</a>
        </div>
      </section>
      <p className={styles.footnote}>Distances are driving routes from our bakery, using <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> data.</p>
    </article>
  </>;
}
