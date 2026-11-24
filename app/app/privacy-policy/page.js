import EmailLink from '../components/EmailLink';
import Breadcrumb from "../components/Breadcrumb";
import { buildMetadata } from '../utils/blog';
import styles from '../legal.module.scss';

export const metadata = buildMetadata({
  path: '/privacy-policy',
  title: "Privacy Policy | Serle’s Bake, Tenkasi",
  description: "Read how Serle's Bake handles your contact details and cake order information, including how to contact our Ilanji bakery about privacy.",
});

// A fixed date: the old page printed today's date, so "last updated" changed daily.
const LAST_UPDATED = '24 November 2026';

/**
 * Privacy policy rewritten 24 Nov 2026 to describe what the site actually does:
 * orders happen on WhatsApp/phone/email (no website checkout, accounts or
 * newsletter); analytics are Google Analytics, Meta Pixel and Microsoft
 * Clarity; the Noupe chat records conversations; WhatsApp order messages carry
 * a website analytics ID; orders are recorded in our order system.
 * Owner to review before relying on it legally.
 */
export default function PrivacyPolicyPage() {
  return (
    <>
      <Breadcrumb title="Privacy Policy" />

      <section className={styles.section}>
        <div className="container">
          <article className={styles.card}>
            <p className={styles.updated}>Last updated: {LAST_UPDATED}</p>

            <p>
              This policy explains what information Serle&apos;s Bake collects when you visit serlesbake.in or order a cake
              from us, and how we use it. We are a home bakery in Ilanji, Tenkasi. We take orders on WhatsApp, by phone
              and by email; there is no checkout, account or newsletter sign-up on this website.
            </p>

            <h2>1. Information you give us when you order</h2>
            <p>When you contact us about a cake, you may share:</p>
            <ul>
              <li>your name and phone number (and email, if you email us)</li>
              <li>the delivery address or map pin, and a contact for handover</li>
              <li>the event date and time, the cake, size and the message on the cake</li>
              <li>design references or photos, for example the picture for a photo cake</li>
              <li>payment confirmation details from Google Pay or online payment (we do not see or store your card or bank login details)</li>
            </ul>
            <p>
              We keep a record of orders in our order system: what was ordered, for when, the amount and payment status, and
              any occasion date you tell us about.
            </p>

            <h2>2. Information collected when you use the website</h2>
            <p>The website uses these services, which collect usage information through cookies and similar technologies:</p>
            <ul>
              <li><strong>Google Analytics</strong>: pages visited, device and approximate location, and actions such as tapping an order button.</li>
              <li><strong>Meta Pixel</strong>: page visits and order-button taps, which Meta uses to measure and show adverts on Facebook and Instagram.</li>
              <li><strong>Microsoft Clarity</strong>: how pages are used (clicks, scrolling), to find and fix problems with the site.</li>
              <li><strong>Website chat (Noupe)</strong>: if you use the chat box, the conversation is recorded by the chat provider.</li>
            </ul>
            <p>
              When you tap an order button, the WhatsApp message we prepare for you includes a website analytics reference ID.
              It lets us connect your order to how you found us. It does not contain your name or contact details, and you can
              delete it from the message before sending.
            </p>

            <h2>3. How we use your information</h2>
            <ul>
              <li>to confirm, bake and deliver your order, and to contact you about it</li>
              <li>to check your delivery address and the delivery charge</li>
              <li>to keep order and payment records</li>
              <li>to understand which pages and adverts help customers find us, and to improve the website</li>
            </ul>
            <p>We do not sell your personal information.</p>

            <h2>4. Who we share it with</h2>
            <ul>
              <li>the person delivering your cake, who receives the address, handover contact and time</li>
              <li>WhatsApp, Google, Meta and Microsoft, as the providers of the messaging and analytics services above</li>
              <li>the companies that host our website and order system</li>
              <li>authorities, where the law requires it</li>
            </ul>

            <h2>5. How long we keep it</h2>
            <p>
              We keep order records for as long as we need them to run the bakery, keep accounts and meet legal requirements.
              Analytics data is kept according to each provider&apos;s settings.
            </p>

            <h2>6. Your choices</h2>
            <ul>
              <li>Ask us what information we hold about you, or ask us to correct or delete it, using the contact details below.</li>
              <li>Block or delete cookies in your browser settings. The site still works, but we will not see analytics for your visit.</li>
              <li>Remove the analytics reference ID from a WhatsApp message before you send it.</li>
            </ul>

            <h2>7. Children</h2>
            <p>
              Orders are placed by adults. If you believe a child has sent us personal information, contact us and we will delete it.
            </p>

            <h2>8. Changes to this policy</h2>
            <p>If we change how we handle information, we will update this page and the date at the top.</p>

            <h2>9. Contact us</h2>
            <p>For any privacy question or request:</p>
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
