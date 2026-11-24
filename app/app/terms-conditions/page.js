import EmailLink from '../components/EmailLink';
import Breadcrumb from "../components/Breadcrumb";
import { buildMetadata } from '../utils/blog';
import { DELIVERY_CHARGES, DELIVERY_COVERAGE } from '../utils/deliveryPolicy';
import styles from '../legal.module.scss';

// A fixed date: the old page printed today's date, so "last updated" changed daily.
const LAST_UPDATED = '24 November 2026';

export const metadata = buildMetadata({
  path: '/terms-conditions',
  title: "Terms & Conditions | Serle’s Bake, Tenkasi",
  description: "Read the ordering, payment and delivery terms for cakes from Serle’s Bake in Ilanji, Tenkasi. Confirm your address and order details on WhatsApp.",
});

export default function TermsConditionsPage() {
  return (
    <>
      <Breadcrumb title="Terms & Conditions" />
      
      <section className={styles.section}>
        <div className="container">
          <article className={styles.card}>
            <p className={styles.updated}>Last updated: {LAST_UPDATED}</p>

                  <h2>1. Acceptance of Terms</h2>
                  <p>
                    By accessing and using serlesbake.in ("the Website"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                  </p>

                  <h2>2. Use License</h2>
                  <p>
                    Permission is granted to temporarily download one copy of the materials (information or software) on Serle&apos;s Bake's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                  </p>
                  <ul>
                    <li>Modify or copy the materials</li>
                    <li>Use the materials for any commercial purpose or for any public display</li>
                    <li>Attempt to reverse engineer any software contained on the website</li>
                    <li>Remove any copyright or other proprietary notations from the materials</li>
                  </ul>

                  <h2>3. Ordering & Payment</h2>
                  <p>
                    All orders are subject to acceptance and availability. Every cake is baked fresh after the order is placed, so orders need at least 4 hours&apos; notice before the time you need the cake; detailed tier and custom designs may need longer. Prices are subject to change without notice. We accept Google Pay and online payments. Contact us on WhatsApp to confirm your cake details, delivery arrangements, final total and payment instructions. Please check your order confirmation with us in the chat.
                  </p>

                  <h2>4. Delivery Terms</h2>
                  <p>
                    {DELIVERY_COVERAGE} {DELIVERY_CHARGES} Delivery times are estimates and may vary based on location and order volume. We are not responsible for delays due to circumstances beyond our control.
                  </p>

                  <h2>5. Cancellation Policy</h2>
                  <p>
                    Orders can be cancelled up to 24 hours before the scheduled delivery time. Cancellations made within 24 hours may incur a cancellation fee. Custom orders may have different cancellation terms.
                  </p>

                  <h2>6. Refund Policy</h2>
                  <p>
                    Refunds are provided in case of quality issues or if the product is significantly different from what was ordered. Refund requests must be made within 24 hours of delivery. Refunds will be processed within 5-7 business days.
                  </p>

                  <h2>7. Allergen Information</h2>
                  <p>
                    While we take care to avoid cross-contamination, our products may contain allergens including gluten, dairy, eggs, and nuts. Customers with allergies should inform us before placing orders.
                  </p>

                  <h2>8. Intellectual Property</h2>
                  <p>
                    All content on this website, including text, graphics, logos, images, and software, is the property of Serle&apos;s Bake and is protected by copyright laws.
                  </p>

                  <h2>9. Limitation of Liability</h2>
                  <p>
                    Serle&apos;s Bake shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service or any products purchased.
                  </p>

                  <h2>10. Governing Law</h2>
                  <p>
                    These terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
                  </p>

                  <h2>11. Changes to Terms</h2>
                  <p>
                    We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on the website. Your continued use of the website constitutes acceptance of the modified terms.
                  </p>

                  <h2>12. Contact Information</h2>
                  <p>
                    For questions about these Terms & Conditions, please contact us at:
                  </p>

            <address className={styles.contact}>
              <strong>Serle&apos;s Bake</strong>
              <span>Tenkasi – Shencottai Main Road, Ilanji, Tenkasi, Tamil Nadu 627805</span>
              <span>Phone / WhatsApp: <a href="tel:+916383070725">+91 63830 70725</a></span>
              <span>Email: <EmailLink /></span>
            </address>
          </article>
        </div>
      </section>
    </>
  );
}
