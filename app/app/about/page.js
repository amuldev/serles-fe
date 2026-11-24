import About from "../components/home/About";
import Milestones from "../components/home/milestone";
import Team from "../components/home/Team";
import Breadcrumb from "../components/Breadcrumb";
import Link from 'next/link';

const TITLE = "About Our Ilanji Bakery, Tenkasi | Serle's Bake";
const DESCRIPTION =
  "Find Serle's Bake in Ilanji, Tenkasi. Browse cakes and brownies, plan your design on WhatsApp and check delivery within 20 km by road.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // Without this the page inherits `canonical: '/'` from the root layout and
  // reports itself to Google as a duplicate of the homepage.
  alternates: {
    canonical: "https://www.serlesbake.in/about",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://www.serlesbake.in/about",
    siteName: "Serle's Bake",
    type: "website",
    images: "/img/hero/hero-1.jpg",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/img/hero/hero-1.jpg"],
  },
};
export default function AboutPage() {
  return (
    <>
      <Breadcrumb title="About Us" />
      <About />
      <section className="container pb-5">
        <h2>Ordering from our Ilanji bakery</h2>
        <p>Start with a cake in our <Link href="/menu">current menu</Link>. Each product shows its own weights and prices. Send the cake name, size, message and event date on WhatsApp. For a photo or themed cake, include a clear image or design reference so we can discuss the details.</p>
        <p>We accept Google Pay and online payments. Confirm the final amount and payment instructions with us before paying. A website enquiry starts the conversation; check that your cake details and order arrangements have been confirmed.</p>
        <p>Our bakery is on Tenkasi–Shencottai Main Road in Ilanji. Delivery is checked within 20 km by road from the bakery. Send your address or map pin, the cake-cutting time and any access details. See our <Link href="/cake-delivery">delivery guide</Link> or <Link href="/contact">contact page</Link> to plan your order.</p>
      </section>
      <Milestones />
      <Team />
    </>
  );
}
