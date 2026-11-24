import Image from 'next/image';
import Link from 'next/link';
import { FaWhatsapp, FaClock, FaTruck, FaWallet, FaArrowRight, FaQuoteLeft, FaMapMarkerAlt } from 'react-icons/fa';
import Team from '../components/home/Team';
import Breadcrumb from '../components/Breadcrumb';
import { getCategoriesUrl, getProductsUrl } from '../config/api';
import { catalogList, fetchCatalogJson } from '../utils/catalog';
import { DELIVERY_CHARGES, FRESH_BAKE_DETAIL } from '../utils/deliveryPolicy';
import { GOOGLE_PROFILE_URL } from '../utils/siteLinks';
import styles from './about.module.scss';

const TITLE = "About Our Ilanji Bakery, Tenkasi | Serle's Bake";
const DESCRIPTION =
  "Find Serle's Bake in Ilanji, Tenkasi. Browse cakes and brownies, plan your design on WhatsApp and check delivery within 20 km by road.";

export const revalidate = 86400; // 1 day; CMS saves refresh instantly via /api/revalidate

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // Without this the page inherits `canonical: '/'` from the root layout and
  // reports itself to Google as a duplicate of the homepage.
  alternates: { canonical: 'https://www.serlesbake.in/about' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://www.serlesbake.in/about',
    siteName: "Serle's Bake",
    type: 'website',
    locale: 'en_IN',
    images: [{ url: '/img/og/serles-bake-cakes.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: ['/img/og/serles-bake-cakes.jpg'] },
};

const STEPS = [
  { Icon: FaWhatsapp, title: 'Message us', text: 'Send the cake, size, date and cake-cutting time on WhatsApp. Add a design reference or photo if you have one.' },
  { Icon: FaClock, title: 'We bake it fresh', text: 'Nothing is baked in advance. Please order at least 4 hours before you need the cake; detailed designs may need longer.' },
  { Icon: FaWallet, title: 'Confirm and pay', text: 'We confirm the design, final amount and payment instructions. We accept Google Pay and online payments.' },
  { Icon: FaTruck, title: 'Home delivery', text: 'We deliver within 20 km by road from Ilanji. Send your map pin and we check the route and the charge first.' },
];

async function loadCategories() {
  try {
    const [cats, products] = await Promise.all([fetchCatalogJson(getCategoriesUrl()), fetchCatalogJson(getProductsUrl())]);
    const productList = catalogList(products);
    return catalogList(cats).filter((c) => c?.slug).map((c) => {
      const own = typeof c.image === 'string' ? c.image : c.image?.url;
      const fallback = productList.find((p) => p.category?.slug === c.slug && p.featured_image?.url)?.featured_image?.url;
      const count = productList.filter((p) => p.category?.slug === c.slug && p.is_active !== false).length;
      return { slug: c.slug, name: c.name, image: own || fallback || null, count };
    });
  } catch {
    return [];
  }
}

/**
 * About page, rebuilt 24 Nov 2026 (ui-ux-pro-max pass). It used to repeat the
 * homepage About block plus three paragraphs. Every statement here is an
 * existing, confirmed fact (location, ordering, freshness, payment, delivery,
 * catalog); the founding story, year and FSSAI number wait for the owner.
 */
export default async function AboutPage() {
  const categories = await loadCategories();

  return (
    <>
      <Breadcrumb title="About Us" />

      <section className={styles.intro}>
        <div className={`container ${styles.introGrid}`}>
          <div className={styles.introPhoto}>
            <Image src="/img/home/cakeinhand.jpg" alt="A homemade chocolate cake held in one hand" width={560} height={420}
              sizes="(max-width: 991px) 100vw, 50vw" priority />
          </div>
          <div>
            <p className={styles.eyebrow}>Our bakery</p>
            <h2 className={styles.title}>A homemade cake bakery in Ilanji, Tenkasi</h2>
            <p className={styles.lead}>
              Serle&apos;s Bake is a home bakery on Tenkasi–Shencottai Main Road in Ilanji.
              Santhiya Thangaraj leads the baking, and every cake is made to order for the date you need it.
            </p>
            <p className={styles.text}>{FRESH_BAKE_DETAIL}</p>
            <ul className={styles.facts}>
              <li><FaMapMarkerAlt aria-hidden="true" /> Ilanji, Tenkasi, Tamil Nadu 627805</li>
              <li><FaClock aria-hidden="true" /> Open every day, 7:00 am – 11:00 pm</li>
              <li><FaTruck aria-hidden="true" /> Delivery within 20 km by road</li>
            </ul>
            <div className={styles.ctas}>
              <Link href="/menu" className={`${styles.button} ${styles.primary}`}>See cakes &amp; prices <FaArrowRight aria-hidden="true" /></Link>
              <Link href="/contact" className={`${styles.button} ${styles.outline}`}>Contact us</Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.steps} aria-labelledby="how-heading">
        <div className="container">
          <h2 id="how-heading" className={styles.sectionTitle}>How ordering works</h2>
          <ol className={styles.stepGrid}>
            {STEPS.map(({ Icon, title, text }, i) => (
              <li key={title} className={styles.step}>
                <span className={styles.stepIcon}><Icon aria-hidden="true" /></span>
                <span className={styles.stepNo}>Step {i + 1}</span>
                <h3 className={styles.stepTitle}>{title}</h3>
                <p className={styles.stepText}>{text}</p>
              </li>
            ))}
          </ol>
          <p className={styles.note}>{DELIVERY_CHARGES} <Link href="/cake-delivery">Delivery details</Link></p>
        </div>
      </section>

      {categories.length > 0 && (
        <section className={styles.bake} aria-labelledby="bake-heading">
          <div className="container">
            <h2 id="bake-heading" className={styles.sectionTitle}>What we bake</h2>
            <ul className={styles.catGrid}>
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/cakes/${c.slug}`} className={styles.cat}>
                    <span className={styles.catPhoto}>
                      {c.image && <Image src={c.image} alt="" fill sizes="(max-width: 575px) 50vw, (max-width: 991px) 33vw, 200px" />}
                    </span>
                    <span className={styles.catName}>{c.name}</span>
                    {c.count > 0 && <span className={styles.catCount}>{c.count} {c.count === 1 ? 'cake' : 'cakes'}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className={styles.review} aria-label="Customer review">
        <div className="container">
          <figure className={styles.quote}>
            <FaQuoteLeft aria-hidden="true" className={styles.quoteMark} />
            <blockquote>
              <p>The flavours were spot on and the cake was moist. The simple design was beautiful and looked exactly like the picture.</p>
            </blockquote>
            <figcaption>Esai Nandhini, Google review</figcaption>
          </figure>
          <a href={GOOGLE_PROFILE_URL} target="_blank" rel="noopener noreferrer" className={`${styles.button} ${styles.outline}`}>
            Read our Google reviews <FaArrowRight aria-hidden="true" />
          </a>
        </div>
      </section>

      <Team />
    </>
  );
}
