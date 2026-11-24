import { FaBirthdayCake, FaTruck, FaWhatsapp } from 'react-icons/fa';
import styles from './Promises.module.scss';

const ITEMS = [
  { Icon: FaBirthdayCake, title: 'Baked fresh after you order', text: 'Nothing waits on a shelf. Order at least 4 hours ahead.' },
  { Icon: FaTruck, title: 'Delivered from Ilanji', text: 'Within 30 km by road. ₹50 for the first 5 km.' },
  { Icon: FaWhatsapp, title: 'Order on WhatsApp', text: 'Confirm the cake and pay by Google Pay or online.' },
];

/** Three quiet promises (24 Nov 2026 redesign; replaces the dark facts bar). */
export default function Promises() {
  return (
    <section className={styles.section} aria-label="Why order from us">
      <ul className={`container ${styles.grid}`}>
        {ITEMS.map(({ Icon, title, text }) => (
          <li key={title} className={styles.item}>
            <span className={styles.icon}><Icon aria-hidden="true" /></span>
            <strong>{title}</strong>
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
