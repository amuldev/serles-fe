import { FaMapMarkerAlt, FaTruck, FaComments, FaWallet } from "react-icons/fa";
import styles from './milestone.module.scss';

const milestonesData = [
  { Icon: FaMapMarkerAlt, label: 'Our bakery', value: 'Ilanji, Tenkasi' },
  { Icon: FaTruck, label: 'Delivery by road', value: 'Up to 20 km' },
  { Icon: FaComments, label: 'Order and confirm on', value: 'WhatsApp' },
  { Icon: FaWallet, label: 'Pay with', value: 'Google Pay & online' },
];

/**
 * Key facts strip (restyled 24 Nov 2026, ui-ux-pro-max pass): burgundy instead
 * of near-black, sentence-case labels instead of shouting uppercase, and a
 * definition list so screen readers pair each label with its value.
 */
export default function MilestoneBar({ data = milestonesData }) {
  return (
    <section className={styles.bar} aria-label="Ordering at a glance">
      <div className="container">
        <dl className={styles.grid}>
          {data.map(({ Icon, label, value }) => (
            <div key={label} className={styles.item}>
              <span className={styles.icon}><Icon aria-hidden="true" /></span>
              <div>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
