import Image from 'next/image';
import Link from 'next/link';
import EmailLink from './EmailLink';
import { FaFacebook, FaInstagram, FaWhatsapp, FaGoogle, FaYoutube, FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaClock } from 'react-icons/fa';
import { GOOGLE_PROFILE_URL, INSTAGRAM_URL, YOUTUBE_URL } from '../utils/siteLinks';
import { FRESH_BAKE_SHORT } from '../utils/deliveryPolicy';
import styles from './Footer.module.scss';

// One address, written the same way as the Bakery schema and the Contact page.
const ADDRESS = 'Tenkasi – Shencottai Main Road, Ilanji, Tenkasi, Tamil Nadu 627805';
const WHATSAPP = "https://wa.me/916383070725?text=Hi!%20I'm%20interested%20in%20ordering%20the%20cakes";

const shopLinks = [
  { label: 'All cakes', href: '/cakes' },
  { label: 'Menu & prices', href: '/menu' },
  { label: 'Cake delivery', href: '/cake-delivery' },
  { label: 'Cake guides', href: '/blog' },
  { label: 'About us', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const socials = [
  { name: "Serle's Bake on Facebook", href: 'https://www.facebook.com/serlesbake', Icon: FaFacebook },
  { name: "Serle's Bake on Instagram", href: INSTAGRAM_URL, Icon: FaInstagram },
  { name: "Serle's Bake on YouTube", href: YOUTUBE_URL, Icon: FaYoutube },
  { name: "Chat with Serle's Bake on WhatsApp", href: WHATSAPP, Icon: FaWhatsapp },
];

/**
 * Site footer, rebuilt 24 Nov 2026 (ui-ux-pro-max pass): the old one was white
 * text on light pink (~1.7:1), three cards at different heights, icon-font
 * glyphs and "Google Reviews" pointing at a plus code. Now: a 4-column grid
 * (stacked on phones), SVG icons, 44px targets and the Business Profile link.
 */
export default function Footer() {
  return (
    <>
      <footer className={styles.footer}>
        <div className={`container ${styles.grid}`}>
          <section className={styles.brand} aria-label="About Serle's Bake">
            <Image src="/img/serlesbakelogo.webp" alt="Serle's Bake logo" width={84} height={84} className={styles.logo} />
            <p className={styles.brandName}>Serle&apos;s Bake</p>
            <p className={styles.brandText}>
              Homemade cakes from our kitchen in Ilanji, Tenkasi. {FRESH_BAKE_SHORT}
            </p>
            <a href={GOOGLE_PROFILE_URL} target="_blank" rel="noopener noreferrer" className={styles.reviews}>
              <FaGoogle aria-hidden="true" /> Read our Google reviews
            </a>
          </section>

          <nav className={styles.col} aria-label="Footer">
            <h2 className={styles.heading}>Shop</h2>
            <ul className={styles.links}>
              {shopLinks.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}
            </ul>
          </nav>

          <section className={styles.col} aria-labelledby="footer-hours">
            <h2 id="footer-hours" className={styles.heading}>Hours</h2>
            <p className={styles.line}><FaClock aria-hidden="true" /> <span>Every day<br />7:00 am – 11:00 pm</span></p>
            <p className={styles.small}>Home delivery within 20 km by road. Address and availability are confirmed before you order.</p>
          </section>

          <section className={styles.col} aria-labelledby="footer-contact">
            <h2 id="footer-contact" className={styles.heading}>Get in touch</h2>
            <p className={styles.line}><FaMapMarkerAlt aria-hidden="true" /> <a href={GOOGLE_PROFILE_URL} target="_blank" rel="noopener noreferrer">{ADDRESS}</a></p>
            <p className={styles.line}><FaPhoneAlt aria-hidden="true" /> <a href="tel:+916383070725">+91 63830 70725</a></p>
            <p className={styles.line}><FaEnvelope aria-hidden="true" /> <EmailLink className={styles.email} /></p>
            <ul className={styles.socials}>
              {socials.map(({ name, href, Icon }) => (
                <li key={href}><a href={href} target="_blank" rel="noopener noreferrer" aria-label={name}><Icon aria-hidden="true" /></a></li>
              ))}
            </ul>
          </section>
        </div>

        <div className={styles.bottom}>
          <div className={`container ${styles.bottomRow}`}>
            <p>&copy; {new Date().getFullYear()} Serle&apos;s Bake, Ilanji, Tenkasi</p>
            <ul>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/terms-conditions">Terms &amp; Conditions</Link></li>
              <li><Link href="/site-map">Site Map</Link></li>
            </ul>
          </div>
        </div>
      </footer>
      {/* Search overlay markup the template's main.js expects. */}
      <div className="search-model">
        <div className="h-100 d-flex align-items-center justify-content-center">
          <div className="search-close-switch">+</div>
          <form className="search-model-form">
            <input type="text" id="search-input" placeholder="Search here....." aria-label="Search" />
          </form>
        </div>
      </div>
    </>
  );
}
