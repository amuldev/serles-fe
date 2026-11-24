import Image from "next/image";
import Link from 'next/link';
import { FaArrowRight } from "react-icons/fa";
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
          <SectionHeading title="Welcome to Serle's Bake" />
          <p className={styles.lead}>
            Serle&apos;s Bake is a homemade cake bakery on Tenkasi–Shencottai Main Road in Ilanji, Tenkasi.
          </p>
          <p className={styles.text}>
            Birthday, photo, custom and tiered cakes and brownies, each one baked after you order. Tell us the occasion
            on WhatsApp and we&apos;ll plan the cake with you. We deliver within 20 km of Ilanji:
            see <Link href="/cake-delivery">online cake order and home delivery in Tenkasi</Link>.
          </p>
          <Link href="/about" className={styles.more}>More about us <FaArrowRight aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}
