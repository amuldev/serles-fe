import Link from 'next/link';
import { FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaInstagram, FaFacebook, FaWhatsapp, FaYoutube, FaClock, FaTruck, FaArrowRight } from 'react-icons/fa';
import Breadcrumb from '../components/Breadcrumb';
import EmailLink from '../components/EmailLink';
import { DELIVERY_CHARGES, DELIVERY_COVERAGE, FRESH_BAKE_SHORT } from '../utils/deliveryPolicy';
import { GOOGLE_PROFILE_URL, INSTAGRAM_URL, YOUTUBE_URL } from '../utils/siteLinks';
import styles from './contact.module.scss';

const ADDRESS_LINES = ['Tenkasi – Shencottai Main Road', 'Ilanji, Tenkasi', 'Tamil Nadu 627805'];
const WHATSAPP = `https://wa.me/916383070725?text=${encodeURIComponent('Hi! I would like to order a cake. Date and time: \nCake and size: \nDelivery address or map pin: ')}`;

/**
 * Contact page, rebuilt 24 Nov 2026 (ui-ux-pro-max pass). Replaces rainbow
 * gradient cards (white text on light gradients, off-brand), an address
 * without the PIN code, and "WhatsApp Community" / "Special Offers" cards for
 * things that do not exist. Server-rendered: nothing here needs client JS.
 */
export default function ContactPageClient() {
  return (
    <>
      <Breadcrumb title="Contact Us" headingLevel="h2" />

      <section className={styles.hero}>
        <div className="container">
          <p className={styles.eyebrow}>Serle&apos;s Bake · Ilanji, Tenkasi</p>
          <h1 className={styles.title}>Get in touch</h1>
          <p className={styles.lead}>
            The quickest way to order is WhatsApp: send the cake, size, date and your address or map pin.
            {' '}{FRESH_BAKE_SHORT}
          </p>

          <div className={styles.actions}>
            <a className={`${styles.action} ${styles.whatsapp}`} href={WHATSAPP} target="_blank" rel="noopener noreferrer">
              <span className={styles.actionIcon}><FaWhatsapp aria-hidden="true" /></span>
              <span><strong>Order on WhatsApp</strong><small>Send the cake, date and address</small></span>
            </a>
            <a className={styles.action} href="tel:+916383070725">
              <span className={styles.actionIcon}><FaPhoneAlt aria-hidden="true" /></span>
              <span><strong>Call us</strong><small>+91 63830 70725</small></span>
            </a>
            <div className={styles.action}>
              <span className={styles.actionIcon}><FaEnvelope aria-hidden="true" /></span>
              <span><strong>Email</strong><small><EmailLink className={styles.emailLink} /></small></span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.details}>
        <div className={`container ${styles.grid}`}>
          <article className={styles.card} aria-labelledby="visit-heading">
            <h2 id="visit-heading" className={styles.cardTitle}><FaMapMarkerAlt aria-hidden="true" /> Our bakery</h2>
            <address className={styles.address}>
              <strong>Serle&apos;s Bake</strong>
              {ADDRESS_LINES.map((line) => <span key={line}>{line}</span>)}
            </address>
            <a className={`${styles.button} ${styles.primary}`} href={GOOGLE_PROFILE_URL} target="_blank" rel="noopener noreferrer">
              Open on Google <FaArrowRight aria-hidden="true" />
            </a>
          </article>

          <article className={styles.card} aria-labelledby="hours-heading">
            <h2 id="hours-heading" className={styles.cardTitle}><FaClock aria-hidden="true" /> Hours</h2>
            <dl className={styles.hours}>
              <div><dt>Every day</dt><dd>7:00 am – 11:00 pm</dd></div>
            </dl>
            <p className={styles.text}>{FRESH_BAKE_SHORT}</p>
          </article>

          <article className={styles.card} aria-labelledby="delivery-heading">
            <h2 id="delivery-heading" className={styles.cardTitle}><FaTruck aria-hidden="true" /> Delivery</h2>
            <p className={styles.text}>{DELIVERY_COVERAGE}</p>
            <p className={styles.text}>{DELIVERY_CHARGES}</p>
            <Link className={`${styles.button} ${styles.outline}`} href="/cake-delivery">
              Delivery details <FaArrowRight aria-hidden="true" />
            </Link>
          </article>
        </div>
      </section>

      <section className={styles.follow} aria-labelledby="follow-heading">
        <div className="container">
          <h2 id="follow-heading" className={styles.followTitle}>Follow our bakes</h2>
          <ul className={styles.socials}>
            <li><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"><FaInstagram aria-hidden="true" /> Instagram <span>@serles_bake</span></a></li>
            <li><a href="https://www.facebook.com/serlesbake" target="_blank" rel="noopener noreferrer"><FaFacebook aria-hidden="true" /> Facebook <span>Serle&apos;s Bake</span></a></li>
            <li><a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer"><FaYoutube aria-hidden="true" /> YouTube <span>@SerlesBake</span></a></li>
          </ul>
        </div>
      </section>
    </>
  );
}
