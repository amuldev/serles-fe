import Image from "next/image";
import Link from 'next/link';
import { FaBirthdayCake, FaPencilAlt, FaArrowRight } from "react-icons/fa";
import SectionHeading from '../ui/SectionHeading';
import styles from './About.module.scss';

/** Homepage "About" block (restyled 24 Nov 2026; copy unchanged in substance). */
export default function About() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.photo}>
          <Image
            src="/img/home/cakeinhand.jpg"
            alt="A homemade chocolate cake held in one hand"
            width={560}
            height={420}
            sizes="(max-width: 991px) 100vw, 50vw"
          />
        </div>
        <div>
          <SectionHeading eyebrow="About us" title="Welcome to Serle's Bake" />
          <p className={styles.lead}>
            Serle&apos;s Bake is a homemade cake bakery on Tenkasi–Shencottai Main Road in Ilanji, Tenkasi.
          </p>
          <p className={styles.text}>
            Browse our birthday cakes, photo and custom designs, tiered cakes and brownies. Every cake is baked fresh after
            you order, never in advance, so please order at least 4 hours before you need it. Share your occasion, preferred
            size and date on WhatsApp so we can check availability, design details and the final amount. Delivery is checked
            by road distance from our Ilanji bakery, within 20 km: see <Link href="/cake-delivery">online cake order and home
            delivery in Tenkasi</Link>. <Link href="/contact">Find our location and contact details</Link>.
          </p>
          <ul className={styles.features}>
            <li>
              <span className={styles.icon}><FaBirthdayCake aria-hidden="true" /></span>
              <span>
                <strong>Homemade cakes</strong>
                Browse the current cakes and brownies, then confirm your preferred weight, date and design with us.
              </span>
            </li>
            <li>
              <span className={styles.icon}><FaPencilAlt aria-hidden="true" /></span>
              <span>
                <strong>Plan your design</strong>
                Share a cake message or design reference so we can check the details and final price before confirming.
              </span>
            </li>
          </ul>
          <Link href="/about" className={styles.more}>More about us <FaArrowRight aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}
