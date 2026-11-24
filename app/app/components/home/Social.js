import Image from 'next/image';
import Link from 'next/link';
import { FaInstagram, FaGoogle, FaYoutube, FaQuoteLeft, FaArrowRight } from 'react-icons/fa';
import { getProductsUrl } from '../../config/api';
import { catalogList, fetchCatalogJson } from '../../utils/catalog';
import { GOOGLE_PROFILE_URL, INSTAGRAM_URL, YOUTUBE_URL } from '../../utils/siteLinks';
import styles from './Social.module.scss';


// The only customer review published on the site. Shown as a quote; there is
// deliberately no aggregate star rating here, because a "5.0" with no review
// count is not something the site can back up.
const REVIEW = {
  author: 'Esai Nandhini',
  text: 'The flavours were spot on and the cake was moist. The simple design was beautiful and looked exactly like the picture. Friendly, responsive service, and a reasonable price for the quality and quantity.',
};

// Photo cakes show customers' faces, so they are left out of this strip.
const EXCLUDED = new Set(['photo-cake']);

async function recentBakes() {
  try {
    const products = catalogList(await fetchCatalogJson(getProductsUrl()));
    return products
      .filter((p) => p.featured_image?.url && p.category?.slug && !EXCLUDED.has(p.slug))
      .slice(0, 6);
  } catch {
    return []; // the section still renders its links without photos
  }
}

/**
 * "Follow our bakes" section (homepage and /testimonial). Rebuilt 24 Nov 2026
 * with the ui-ux-pro-max rules: the old version had six identical gradient
 * tiles posing as Instagram posts, icon-font glyphs that never loaded, a "5.0"
 * rating with no count and an unverified "tutorials" claim. Photos here are the
 * real catalog photos and link to their product pages.
 */
export default async function Social() {
  const bakes = await recentBakes();

  return (
    <section className={styles.section} aria-labelledby="social-heading">
      <div className="container">
        <header className={styles.header}>
          <p className={styles.eyebrow}>From our kitchen</p>
          <h2 id="social-heading" className={styles.title}>Real cakes, real customers</h2>
          <p className={styles.intro}>
            Every cake here was baked to order in our Ilanji kitchen. Follow along for new bakes,
            or read what customers say on Google.
          </p>
        </header>

        <div className={styles.grid}>
          <article className={`${styles.card} ${styles.bakesCard}`}>
            <div className={styles.cardHead}>
              <span className={`${styles.badge} ${styles.instagram}`}><FaInstagram aria-hidden="true" /></span>
              <div>
                <h3 className={styles.cardTitle}>Recent bakes</h3>
                <p className={styles.cardMeta}>@serles_bake on Instagram</p>
              </div>
            </div>
            {bakes.length > 0 && (
              <ul className={styles.photos}>
                {bakes.map((p) => (
                  <li key={p.id}>
                    <Link href={`/cakes/${p.category.slug}/${p.slug}`} className={styles.photo}>
                      <Image
                        src={p.featured_image.url}
                        alt={p.featured_image.alt_text || p.name}
                        fill
                        sizes="(max-width: 575px) 30vw, (max-width: 991px) 20vw, 120px"
                      />
                      <span className={styles.photoLabel}>{p.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <a className={`${styles.button} ${styles.instagramButton}`} href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
              <FaInstagram aria-hidden="true" /> Follow on Instagram
            </a>
          </article>

          <article className={`${styles.card} ${styles.reviewCard}`}>
            <div className={styles.cardHead}>
              <span className={`${styles.badge} ${styles.google}`}><FaGoogle aria-hidden="true" /></span>
              <div>
                <h3 className={styles.cardTitle}>What customers say</h3>
                <p className={styles.cardMeta}>From our Google reviews</p>
              </div>
            </div>
            <figure className={styles.quote}>
              <FaQuoteLeft aria-hidden="true" className={styles.quoteMark} />
              <blockquote><p>{REVIEW.text}</p></blockquote>
              <figcaption>{REVIEW.author}</figcaption>
            </figure>
            <a className={`${styles.button} ${styles.primaryButton}`} href={GOOGLE_PROFILE_URL} target="_blank" rel="noopener noreferrer">
              Read all reviews on Google <FaArrowRight aria-hidden="true" />
            </a>
            <p className={styles.small}>Ordered from us? A short Google review helps other families find us.</p>
          </article>

          <article className={`${styles.card} ${styles.videoCard}`}>
            <div className={styles.cardHead}>
              <span className={`${styles.badge} ${styles.youtube}`}><FaYoutube aria-hidden="true" /></span>
              <div>
                <h3 className={styles.cardTitle}>Watch on YouTube</h3>
                <p className={styles.cardMeta}>@SerlesBake</p>
              </div>
            </div>
            <p className={styles.cardText}>
              Find Serle&apos;s Bake videos on our YouTube channel.
            </p>
            <a className={`${styles.button} ${styles.outlineButton}`} href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer">
              <FaYoutube aria-hidden="true" /> Visit our channel
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
