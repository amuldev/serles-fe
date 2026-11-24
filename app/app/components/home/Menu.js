'use client';
import { useEffect, useState } from "react";
import { getProductsUrl, getCategoriesUrl, getProductDetailUrl } from '../../config/api';
import apiCache from '../../utils/cache';
import Link from "next/link";
import { FaUtensils } from "react-icons/fa";
import styles from './Menu.module.css';
import MenuProductCard from '../MenuProductCard';
import MenuPromo from './MenuPromo';
import { getAnalyticsReference, trackStoreEvent } from '../../utils/analytics';
import { fetchCatalogJson, catalogList } from '../../utils/catalog';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Helper: normalize category key from API category name/slug
function getCategoryKeyFromProduct(product) {
  // Try slug first, fallback to name
  if (product.category) {
    if (product.category.slug) {
      // Our tabs use "flavored", "brownie", etc.
      // API slug is e.g. "flavored-cakes" or "brownie"
      if (product.category.slug.includes("flavored")) return "flavored";
      if (product.category.slug.includes("premium")) return "premium";
      if (product.category.slug.includes("custom")) return "custom";
      if (product.category.slug.includes("brownie")) return "brownie";
    }
    if (product.category.name) {
      const name = product.category.name.toLowerCase();
      if (name.includes("flavored")) return "flavored";
      if (name.includes("premium")) return "premium";
      if (name.includes("custom")) return "custom";
      if (name.includes("brownie")) return "brownie";
    }
  }
  return "";
}

export default function Menu({ initialProducts = [], initialCategories = [], initialCatalogLoaded = false }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(!initialCatalogLoaded);
  const [apiError, setApiError] = useState(null);
  const [displayLimit, setDisplayLimit] = useState(6); // Show only 6 products initially

  useEffect(() => {
    if (initialCatalogLoaded) return;
    const fetchData = async () => {
      setLoading(true);
      setApiError(null);
      
      try {
        // Fetch both products and categories in parallel
        const [productsData, categoriesData] = await Promise.all([
          fetchCatalogJson(getProductsUrl()),
          fetchCatalogJson(getCategoriesUrl())
        ]);
        
        // Handle the API response structure
        const productsItems = catalogList(productsData);
        const categoriesItems = catalogList(categoriesData);
        
        // Fetch detailed product data with weight options
        const detailedProducts = await Promise.all(
          productsItems.map(async (product) => {
            try {
              const detailedProduct = await apiCache.fetchWithCache(
                getProductDetailUrl(product.id)
              );
              return detailedProduct;
            } catch (error) {
              console.error(`Error fetching details for product ${product.id}:`, error);
              return product; // Return original product if detailed fetch fails
            }
          })
        );
        
        setProducts(detailedProducts);
        setCategories(categoriesItems);
      } catch (err) {
        console.error("Error fetching data:", err);
        setApiError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [initialCatalogLoaded]);

  // Generate category tabs from API data
  const generateCategoryTabs = () => {
    const tabs = [
      { key: "all", label: "All Products" }
    ];

    // Add categories from API
    categories.forEach(category => {
      if (category.name && category.slug) {
        tabs.push({
          key: category.slug,
          label: category.name,
          category: category
        });
      }
    });

    return tabs;
  };

  const categoryTabs = generateCategoryTabs();

  // Filter products by active category
  const filteredProducts = activeCategory === "all" 
    ? products 
    : products.filter((p) => p.category?.slug === activeCategory);

  // Get limited products for display (no grouping - each product is separate)
  const displayProducts = filteredProducts.slice(0, displayLimit);
  const hasMoreProducts = filteredProducts.length > displayLimit;

  // Handle WhatsApp enquiry
  const handleWhatsAppEnquiry = (productName, weightOption = null) => {
    trackStoreEvent('whatsapp_enquiry_click', {
      item_name: productName,
      weight: weightOption?.display_name || 'Standard',
      value: Number(weightOption?.price) || undefined,
      currency: 'INR',
    });
    const message = `Hi! I'm interested in ordering the ${productName} cake.${weightOption ? `\n\nWeight: ${weightOption.display_name}\nPrice: ₹${weightOption.price}` : ''}\n\nPlease contact me for more details. Thank you!${getAnalyticsReference()}`;
    const whatsappUrl = `https://wa.me/916383070725?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };


  return (
    <section style={{ background: "#fff", padding: "60px 0" }}>
      <div className="container">
        <div className="text-center mb-4">
          <div style={{ color: "#e4718a", fontWeight: 700, fontSize: "1.5rem" }} className="cursive mb-2">
            Menu &amp; Pricing
          </div>
          <h2 style={{ fontWeight: 800, fontSize: "2.2rem", margin: "0 0 10px 0", letterSpacing: "1px" }} className="h1 text-gray">
            EXPLORE OUR HOMEMADE <br /> CAKE COLLECTION
          </h2>
          <div style={{ width: 80, height: 4, background: "#e4718a", margin: "16px auto 0 auto", borderRadius: 2 }} />
        </div>
        
        {/* Category Tabs */}
        <div className="d-flex flex-wrap justify-content-center mb-5">
          <div style={{
            background: "#231f20",
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
          }}>
            {categoryTabs.map(tab => (
              <button
                key={tab.key}
                className={classNames(
                  "px-4 py-2 border-0 fw-bold",
                  activeCategory === tab.key
                    ? "bg-pink text-white"
                    : "bg-transparent text-white-50"
                )}
                style={{
                  background: activeCategory === tab.key ? "#e4718a" : "transparent",
                  color: activeCategory === tab.key ? "#fff" : "#e0e0e0",
                  border: "none",
                  outline: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  transition: "background 0.2s"
                }}
                onClick={() => setActiveCategory(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Simple Menu List */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : apiError ? (
          <div className="text-center py-5">
            <div className="alert alert-danger" role="alert">
              Error: {apiError}
            </div>
          </div>
        ) : !loading && !apiError && products.length === 0 ? (
          <div className="text-center py-5">
            <div style={{
              background: "linear-gradient(135deg, #fff5f7 0%, #ffeef2 100%)",
              padding: "40px",
              borderRadius: "20px",
              border: "2px dashed #e4718a"
            }}>
              <h4 style={{ color: "#e4718a" }}>No products available</h4>
              <p className="text-muted">Check back later for our delicious cakes!</p>
            </div>
          </div>
        ) : (
          <>
            <div className="menu-list">
              {displayProducts.length === 0 && (
                <div className="text-center py-5">
                  <div style={{
                    background: "linear-gradient(135deg, #fff5f7 0%, #ffeef2 100%)",
                    padding: "40px",
                    borderRadius: "20px",
                    border: "2px dashed #e4718a"
                  }}>
                    <h4 style={{ color: "#e4718a" }}>No items found in this category</h4>
                    <p className="text-muted">Try selecting a different category or check back later!</p>
                  </div>
                </div>
              )}
              {displayProducts.map((product, idx) => (
                <MenuProductCard
                  key={product.id || product.name + idx}
                  product={product}
                  priority={idx === 0}
                  onOrder={(p, option) => handleWhatsAppEnquiry(p.name, option)}
                />
              ))}
            </div>

           

            {/* Always show View All Products button if there are products */}
            {displayProducts.length > 0 && (
              <div className="text-center mt-4">
                <Link
                  href="/menu"
                  style={{
                    background: "linear-gradient(135deg, #e4718a, #ff91a4)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50px",
                    padding: "12px 30px",
                    fontSize: "1rem",
                    fontWeight: "600",
                    textDecoration: "none",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 15px rgba(228, 113, 138, 0.3)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow = "0 6px 20px rgba(228, 113, 138, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 4px 15px rgba(228, 113, 138, 0.3)";
                  }}
                >
                  <span>Browse Complete Menu</span>
                  <FaUtensils aria-hidden="true" />
                </Link>
              </div>
            )}
          </>
        )}

        <MenuPromo products={products} />
        </div>
      </section>
  );
}
