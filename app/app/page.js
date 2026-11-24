import styles from './page.module.css';
import Banner from './components/home/Banner';
import CelebrationPlanning from './components/CelebrationPlanning';
import Category from './components/home/category';
import About from './components/home/About';
import Promises from './components/home/Promises';
import HomeShowcase from './components/home/HomeShowcase';
import Team from './components/home/Team';
import Social from './components/home/Social';
import FeaturedCakeCTA from './components/home/cta';
import { getProductsUrl, getCategoriesUrl } from './config/api';
import { fetchCatalogJson, catalogList } from './utils/catalog';

export const revalidate = 86400; // 1 day; CMS saves refresh instantly via /api/revalidate

// The homepage grid needs only the catalog list (name, photo, price range,
// bestseller flag). The old menu list also fetched every product's detail.
async function getHomeMenuData() {
  try {
    const [productsPayload, categoriesPayload] = await Promise.all([
      fetchCatalogJson(getProductsUrl()),
      fetchCatalogJson(getCategoriesUrl()),
    ]);
    return { products: catalogList(productsPayload), categories: catalogList(categoriesPayload) };
  } catch (error) {
    console.error('Unable to server-render homepage products:', error);
    return { products: [], categories: [] };
  }
}
export const metadata = {
  // Title covers BOTH proven search clusters, because they are the same customers.
  //
  // Business Profile data (Mar-Oct 2026): "cake shop near me" 71, "bakery near me"
  // 48, "bakery" 35, plus two more bakery variants. The owner confirms that locally
  // "bakery" IS the word for where you buy a cake - there are no separate cake
  // shops here - so the bakery cluster is cake-buying intent, not mismatched
  // traffic. An earlier version of this title dropped "bakery" on the assumption
  // that it brought bread-and-buns searchers. That assumption was wrong.
  //
  // 44 chars.
  title: "Cake Shop & Bakery in Tenkasi | Serle’s Bake",
  description: "Cake shop & bakery in Tenkasi. Homemade cakes baked fresh after you order: birthday, photo & custom cakes. Order 4 hours ahead on WhatsApp for delivery.",
};
// Homepage flow (24 Nov 2026 redesign): occasions, banner, top sellers,
// featured cake, celebration planning, promises, about, team, social.
export default async function Home() {
  const { products, categories } = await getHomeMenuData();
  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <Category />
        <Banner />
        <HomeShowcase products={products} categories={categories} />
        <FeaturedCakeCTA />
        <CelebrationPlanning />
        <Promises />
        <About />
        <Team />
        <Social />
      </div>
    </div>
  );
}
