import Link from 'next/link';
import Breadcrumb from '../components/Breadcrumb';
import JsonLd from '../components/blog/JsonLd';
import { SITE_URL } from '../utils/blog';
import { DELIVERY_COVERAGE, DELIVERY_CHARGES, FRESH_BAKE_DETAIL, FRESH_BAKE_HEADLINE, ORDER_LEAD_HOURS } from '../utils/deliveryPolicy';
import styles from './page.module.scss';
import { DELIVERY_AREA_PAGES, deliveryAreaPath } from '../utils/deliveryAreas';

// Targets the searches Search Console shows for ordering intent ("tenkasi cake
// home delivery", "cake order online"). Ordering is online via WhatsApp with
// Google Pay/online payment - there is no web checkout, so copy never implies one.
const title = "Online Cake Order & Home Delivery in Tenkasi | Serle's Bake";
const description = 'Order cakes online from Serle’s Bake, Tenkasi: baked fresh after you order (4 hours’ notice), confirmed on WhatsApp, delivered within 20 km of Ilanji.';
const url = `${SITE_URL}/cake-delivery`;
const whatsapp = `https://wa.me/916383070725?text=${encodeURIComponent('Hi! I would like to check cake delivery from Ilanji. My delivery address/map pin is: \nEvent date and time: \nCake/design and size: ')}`;

export const metadata = {
  title, description, alternates: { canonical: url },
  openGraph: { title, description, url, type: 'website', images: ['/img/og/serles-bake-cakes.jpg'] },
  twitter: { card: 'summary_large_image', title, description, images: ['/img/og/serles-bake-cakes.jpg'] },
};
const questions = [
  ['Can I order a cake online in Tenkasi?', 'Yes. Choose a cake and size from our menu, then send the cake, date, cake-cutting time and delivery address or map pin on WhatsApp. We confirm availability, design, the final amount and payment (Google Pay or online payment) in the chat before you proceed. There is no checkout on this website.'],
  ['How far do you deliver?', DELIVERY_COVERAGE],
  ['What does delivery cost?', DELIVERY_CHARGES],
  ['Can I order for today?', `Yes, if you order at least ${ORDER_LEAD_HOURS} hours before you need the cake: every cake is baked fresh after the order, so we need that time to bake and finish it. Detailed tier and custom designs may need longer. Message us with the cake, design and delivery time; sending a message does not reserve a slot until we confirm.`],
  ['Why do you need 4 hours’ notice?', FRESH_BAKE_DETAIL],
  ['How do I pay and confirm my order?', 'We accept Google Pay and online payments. Confirm the cake, date, address, final amount and payment instructions with us on WhatsApp, and check your order confirmation in the chat.'],
  ['Can I order for family while I am away?', 'Share the recipient’s delivery address, event date and a contact for handover privately on WhatsApp. We will check the route and available arrangements with you.'],
];

export default function CakeDeliveryPage() {
  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
      { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: title, description,
        isPartOf: { '@id': `${SITE_URL}/#website` }, mainEntity: { '@id': `${url}#service` } },
      { '@type': 'Service', '@id': `${url}#service`, name: 'Cake delivery from Ilanji',
        serviceType: 'Cake delivery', url, description: DELIVERY_COVERAGE,
        provider: { '@id': `${SITE_URL}/#business` } },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Online cake order & delivery', item: url },
      ] },
    ] }} />
    <Breadcrumb title="Online cake order & home delivery in Tenkasi" />
    <div className={`container ${styles.delivery}`} data-contact-source="delivery_hub">
      <section className={styles.intro} aria-labelledby="delivery-intro">
        <p className={styles.eyebrow}>Serle&apos;s Bake · Ilanji, Tenkasi</p>
        <h2 id="delivery-intro">A cake for your celebration, with the delivery details agreed first</h2>
        <p>{DELIVERY_COVERAGE}</p>
        <p><strong>{FRESH_BAKE_HEADLINE}.</strong> We start baking after you order, never in advance, so please order at least {ORDER_LEAD_HOURS} hours before you need the cake.</p>
        <div className={styles.actions}>
          <a className={styles.primary} href={whatsapp} target="_blank" rel="noopener noreferrer">Check delivery on WhatsApp</a>
          <Link className={styles.secondary} href="/menu">Browse cakes &amp; prices</Link>
        </div>
      </section>
      <section className={styles.section} aria-labelledby="coverage-heading">
        <h2 id="coverage-heading">Checking your delivery address</h2>
        <p>Our bakery is on Tenkasi–Shencottai Main Road in Ilanji. For addresses in Ilanji, Tenkasi, Sengottai (Shencottai), Courtallam and surrounding villages, please send a map pin. Coverage depends on the road route to that address, within our 20 km limit, and the arrangements available for your order.</p>
        <p>For nearby places such as Kottakulam, Vallam, Piranoor, Panpoli or Pudur near Sengottai, ask us to check your exact destination. A nearby town name alone does not establish delivery eligibility. We confirm the destination individually before accepting an order.</p>
        <p>We bake from Ilanji; the delivery destinations are served from this bakery. <Link href="/contact">Find our bakery and contact details</Link>.</p>
      </section>
      <section className={styles.section} aria-labelledby="area-guides-heading">
        <h2 id="area-guides-heading">Local delivery guides</h2>
        <p>These guides include driving estimates to mapped village points. Your actual address and order availability are checked separately.</p>
        <ul>{DELIVERY_AREA_PAGES.map(area => <li key={area.slug}><Link href={deliveryAreaPath(area)}>Cake enquiries for {area.name}</Link> — village-point road estimate about {area.km.toFixed(1)} km</li>)}</ul>
        <p>Established guides: <Link href="/blog/cake-delivery-in-tenkasi-timings-and-ordering">Tenkasi</Link>, <Link href="/blog/cake-delivery-in-shencottai">Sengottai / Shencottai</Link> and <Link href="/blog/cake-delivery-in-courtallam">Courtallam</Link>.</p>
      </section>
      <div className={styles.grid}>
        <section className={styles.card} aria-labelledby="charges-heading">
          <h2 id="charges-heading">Delivery charges</h2><p>{DELIVERY_CHARGES}</p>
          <p>The cake price, any agreed design changes and delivery are confirmed together before you proceed. Check current cake weights and prices in our <Link href="/menu">menu</Link>.</p>
        </section>
        <section className={styles.card} aria-labelledby="timing-heading">
          <h2 id="timing-heading">Plan around the cake-cutting time</h2>
          <p>Every cake is baked fresh after you order, so allow at least {ORDER_LEAD_HOURS} hours between ordering and the time you need it. Tell us when you need the cake, including time for the handover and any setup. For photo, themed or tiered cakes, send your design request early so we can check feasibility, preparation and transport.</p>
          <p>For a hotel, hall or another venue, include its name and entrance details. Let us know if refrigeration will be available before serving.</p>
        </section>
      </div>
      <section className={styles.section} aria-labelledby="order-heading">
        <h2 id="order-heading">How to order a cake online in Tenkasi</h2>
        <ol className={styles.steps}>
          <li><strong>Choose a cake.</strong> Browse our <Link href="/cakes">cake collection</Link> and note the design and weight you would like.</li>
          <li><strong>Send the essentials privately.</strong> Message your address or map pin, date, cake-cutting time, design request and preferred size on WhatsApp, at least {ORDER_LEAD_HOURS} hours before you need the cake.</li>
          <li><strong>Check the details with us.</strong> We confirm coverage, availability, customization, the final amount and payment instructions.</li>
          <li><strong>Check your confirmation.</strong> Review the agreed cake, message, delivery address and timing in the chat. A website enquiry is the start of the conversation.</li>
        </ol>
        <p>We accept Google Pay and online payments. For a photo cake, attach a clear original photo in the chat after checking that the design can be made.</p>
        <p>Ordering from another city? Read our <Link href="/blog/order-cake-for-family-in-tenkasi-from-another-city">guide to arranging a cake for family in Tenkasi</Link>. For a hall, hotel or other event space, use the <Link href="/blog/cake-delivery-venue-handover-checklist">venue handover checklist</Link>.</p>
      </section>
      <section className={styles.section} aria-labelledby="questions-heading">
        <h2 id="questions-heading">Online ordering and delivery questions</h2>
        {questions.map(([question, answer]) => <details className={styles.question} key={question}>
          <summary>{question}</summary><p>{answer}</p>
        </details>)}
      </section>
      <section className={styles.closing} aria-labelledby="delivery-contact-heading">
        <h2 id="delivery-contact-heading">Share your address and celebration date</h2>
        <p>We will check the details before you commit to the order.</p>
        <div className={styles.actions}>
          <a className={styles.primary} href={whatsapp} target="_blank" rel="noopener noreferrer">Ask about cake delivery</a>
          <a className={styles.secondary} href="tel:+916383070725">Call +91 63830 70725</a>
        </div>
      </section>
    </div>
  </>;
}
