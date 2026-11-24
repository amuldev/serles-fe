'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaWhatsapp, FaArrowRight, FaTruck, FaPencilAlt } from 'react-icons/fa';
import styles from './Banner.module.scss';

const WA = 'https://wa.me/916383070725?text=';

// Two matching panels: primary (burgundy) and alternate (sand). Copy and the
// "free customization above 1 kg" offer come from the previous banners; the
// old second panel was a flat image (pink, Oswald, purple stripes) with its
// text baked into the picture.
const BANNERS = [
  {
    id: 'delivery',
    tone: 'primary',
    Icon: FaTruck,
    kicker: 'Home delivery',
    title: <>A little joy,<br />delivered.</>,
    text: 'From our Ilanji kitchen to your door, within 30 km by road.',
    figure: <><strong>₹50</strong><span>for the first 5 km<br />then ₹10 per km</span></>,
    cta: 'Check delivery on WhatsApp',
    href: `${WA}${encodeURIComponent('Hi! I would like to check cake delivery from Ilanji. My address/map pin is: ')}`,
    image: 'https://cdn.serlesbake.in/products/premium-cake/white-forest/20250811_230051.jpg',
    imageAlt: 'White Forest cake from Serle\'s Bake',
  },
  {
    id: 'custom',
    tone: 'alt',
    Icon: FaPencilAlt,
    kicker: 'Made your way',
    title: <>Free<br />customization</>,
    text: 'On all cakes above 1 kg. Send your theme, name or photo and we will plan it with you.',
    figure: <><strong>1 kg+</strong><span>name, theme or<br />photo designs</span></>,
    cta: 'Plan my cake on WhatsApp',
    href: `${WA}${encodeURIComponent('Hi! I would like a customised cake. Occasion, date and design idea: ')}`,
    image: 'https://cdn.serlesbake.in/products/tier-cake/two-tier-cake/20250811_230318.jpg',
    imageAlt: 'A two-tier custom theme cake from Serle\'s Bake',
  },
];

/**
 * Homepage banner pair (redesigned 24 Nov 2026). Side by side on desktop, a
 * swipe-free auto carousel with dots on phones (pauses on hover/focus and
 * for reduced motion).
 */
export default function Banner() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const id = setInterval(() => setCurrent((i) => (i + 1) % BANNERS.length), 7000);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <section className={`container ${styles.section}`} data-contact-source="home_banner" aria-label="Delivery and custom cakes"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false); }}>
      <div className={styles.track}>
        {BANNERS.map(({ id, tone, Icon, kicker, title, text, figure, cta, href, image, imageAlt }, index) => (
          <a key={id} href={href} target="_blank" rel="noopener noreferrer"
            className={`${styles.panel} ${styles[tone]} ${index === current ? styles.current : ''}`}>
            <div className={styles.copy}>
              <p className={styles.kicker}><Icon aria-hidden="true" /> {kicker}</p>
              <p className={styles.title}>{title}</p>
              <p className={styles.text}>{text}</p>
              <p className={styles.figure}>{figure}</p>
              <span className={styles.cta}><FaWhatsapp aria-hidden="true" /> {cta} <FaArrowRight aria-hidden="true" className={styles.arrow} /></span>
            </div>
            <div className={styles.art}>
              <span className={styles.photo}>
                <Image src={image} alt={imageAlt} fill sizes="(max-width: 767px) 40vw, 220px" priority={index === 0} />
              </span>
              <span className={styles.seal} aria-hidden="true">baked<br /><em>with love</em></span>
            </div>
          </a>
        ))}
      </div>
      <div className={styles.dots}>
        {BANNERS.map((b, index) => (
          <button key={b.id} type="button" className={`${styles.dot} ${index === current ? styles.dotActive : ''}`}
            aria-label={`Show ${b.kicker}`} aria-pressed={index === current} onClick={() => setCurrent(index)} />
        ))}
      </div>
    </section>
  );
}
