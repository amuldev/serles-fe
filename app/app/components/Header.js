'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaBars, FaTimes, FaWhatsapp, FaPhoneAlt, FaClock } from 'react-icons/fa';
import EmailLink from './EmailLink';
import Wabtn from './ui/wabtn';
import styles from './Header.module.scss';

const WHATSAPP = "https://wa.me/916383070725?text=Hi!%20I'm%20interested%20in%20ordering%20a%20cake";

const NAV = [
  { href: '/cakes', label: 'Cakes' },
  { href: '/menu', label: 'Menu & prices' },
  { href: '/cake-delivery', label: 'Delivery' },
  { href: '/blog', label: 'Guides' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

/**
 * Site header, rebuilt 24 Nov 2026. The template header was a pink logo block
 * over a dark menu bar with contact details in the corners, the biggest "this
 * is a template" signal on the site. Now: a slim announcement strip, a white
 * sticky bar (logo · menu · phone + WhatsApp), and a simple drawer on phones.
 * The logo is not a heading: each page owns its own <h1>.
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || '/';
  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <div className={styles.strip}>
        <FaClock aria-hidden="true" /> Baked fresh after you order · Delivery within 30 km of Ilanji, Tenkasi
      </div>

      <header className={styles.header}>
        <div className={`container ${styles.bar}`}>
          <Link href="/" className={styles.brand} aria-label="Serle's Bake home">
            <Image src="/img/serlesbakelogo.webp" alt="" width={48} height={48} priority />
            <span className={styles.brandName}>Serle&apos;s Bake</span>
          </Link>

          <nav className={styles.nav} aria-label="Main">
            <ul>
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={isActive(item.href) ? styles.active : undefined} aria-current={isActive(item.href) ? 'page' : undefined}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.actions}>
            <a href="tel:+916383070725" className={styles.phone}><FaPhoneAlt aria-hidden="true" /> +91 63830 70725</a>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className={styles.order}>
              <FaWhatsapp aria-hidden="true" /> <span>Order on WhatsApp</span>
            </a>
            <button type="button" className={styles.menuButton} aria-label="Open menu" aria-expanded={open} aria-controls="site-drawer" onClick={() => setOpen(true)}>
              <FaBars aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <div className={`${styles.overlay} ${open ? styles.overlayOpen : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <aside id="site-drawer" className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`} aria-label="Menu" aria-hidden={!open}>
        <div className={styles.drawerHead}>
          <span className={styles.brandName}>Serle&apos;s Bake</span>
          <button type="button" className={styles.menuButton} aria-label="Close menu" onClick={() => setOpen(false)}>
            <FaTimes aria-hidden="true" />
          </button>
        </div>
        <ul className={styles.drawerNav}>
          <li><Link href="/" aria-current={pathname === '/' ? 'page' : undefined}>Home</Link></li>
          {NAV.map((item) => (
            <li key={item.href}><Link href={item.href} aria-current={isActive(item.href) ? 'page' : undefined}>{item.label}</Link></li>
          ))}
          <li><Link href="/testimonial">Reviews</Link></li>
        </ul>
        <div className={styles.drawerContact}>
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className={styles.order}><FaWhatsapp aria-hidden="true" /> <span>Order on WhatsApp</span></a>
          <a href="tel:+916383070725" className={styles.drawerLink}><FaPhoneAlt aria-hidden="true" /> +91 63830 70725</a>
          <span className={styles.drawerLink}><EmailLink /></span>
        </div>
      </aside>

      <Wabtn />
    </>
  );
}
