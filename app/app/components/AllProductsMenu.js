'use client';
import { useEffect, useState } from "react";
import { getProductsUrl, getCategoriesUrl, getProductDetailUrl } from '../config/api';
import apiCache from '../utils/cache';
import Link from "next/link";
import { FaArrowDown, FaArrowLeft, FaClock } from "react-icons/fa";
import styles from './home/Menu.module.css';
import MenuProductCard from './MenuProductCard';
import SectionHeading from './ui/SectionHeading';
import CategoryTabs from './ui/CategoryTabs';
import { getAnalyticsReference, trackStoreEvent } from '../utils/analytics';
import { fetchCatalogJson, catalogList } from '../utils/catalog';


export default function AllProductsMenu({ initialProducts = [], initialCategories = [], initialCatalogLoaded = false }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(!initialCatalogLoaded);
  const [apiError, setApiError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const pageSize = 12; // Number of products per page

  // Fetch products for a specific page
  const fetchProducts = async (page = 1, append = false) => {
    try {
      const productsData = await fetchCatalogJson(getProductsUrl(page, pageSize));
      
      // Handle the API response structure
      const productsItems = catalogList(productsData);
      
      // Update total products count
      if (productsData.count !== undefined) {
        setTotalProducts(productsData.count);
      }
      
      // Check if there are more pages
      const totalPages = Math.ceil((productsData.count || productsItems.length) / pageSize);
      setHasMorePages(
        Array.isArray(productsData.results) && page < totalPages
      );
      
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
      
      if (append) {
        setProducts(prev => [...prev, ...detailedProducts]);
      } else {
        setProducts(detailedProducts);
      }
      
      return detailedProducts;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const categoriesData = await fetchCatalogJson(getCategoriesUrl());
      const categoriesItems = catalogList(categoriesData);
      setCategories(categoriesItems);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (initialCatalogLoaded) return;
    const fetchInitialData = async () => {
      setLoading(true);
      setApiError(null);
      
      try {
        await Promise.all([
          fetchProducts(1, false),
          fetchCategories()
        ]);
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setApiError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
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

  // Group by name, so that each name has multiple variants (if any)
  // Unique cake names across all categories (count for the "All" tab).
  const groupedAll = {};
  products.forEach((item) => { groupedAll[item.name] = true; });

  const grouped = {};
  filteredProducts.forEach((item) => {
    if (!grouped[item.name]) grouped[item.name] = [];
    grouped[item.name].push(item);
  });

  // Category tabs only filter the products already loaded (the server sends the
  // whole catalog with weights and prices). They used to clear the list and
  // re-download every product plus 17 detail requests, so each tap showed
  // "0 products / No products available" for several seconds.
  const handleCategoryChange = (categoryKey) => {
    setActiveCategory(categoryKey);
  };

  // Handle load more
  const handleLoadMore = async () => {
    if (loadingMore || !hasMorePages) return;
    
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      await fetchProducts(nextPage, true); // Append new products
      setCurrentPage(nextPage);
    } catch (error) {
      console.error("Error loading more products:", error);
    } finally {
      setLoadingMore(false);
    }
  };

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
    <section style={{ background: "#fff", padding: "clamp(36px, 6vw, 72px) 0" }}>
      <div className="container">
        <SectionHeading
          align="center"
          eyebrow="Complete menu"
          title="All our homemade cakes"
          intro="Every cake with its sizes and prices. Tap Details for photos and options, or Order to send the details on WhatsApp."
        />
        <p className={styles.freshNote}><FaClock aria-hidden="true" /> Baked fresh after you order · please order at least 4 hours ahead</p>

        <CategoryTabs
          tabs={categoryTabs.map((tab) => ({
            ...tab,
            count: tab.key === 'all' ? Object.keys(groupedAll).length : products.filter((p) => p.category?.slug === tab.key).length,
          }))}
          active={activeCategory}
          onChange={handleCategoryChange}
        />

        <p className={styles.countLine} aria-live="polite">
          {loading ? "Loading cakes…" : `Showing ${Object.keys(grouped).length} ${Object.keys(grouped).length === 1 ? 'cake' : 'cakes'}`}
          {activeCategory !== "all" && ` in ${categories.find(c => c.slug === activeCategory)?.name || activeCategory}`}
        </p>

        {/* Products Grid */}
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
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-5">
            <h4 style={{ color: "#e4718a" }}>No cakes in this category yet</h4>
            <p className="text-muted">Try another category, or ask us on WhatsApp.</p>
          </div>
        ) : (
          <>
            <div className="menu-list">
              {Object.keys(grouped).length === 0 && (
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
              {Object.entries(grouped).map(([name, items], idx) => (
                <MenuProductCard
                  key={name + idx}
                  product={items[0]}
                  priority={idx === 0}
                  onOrder={(p, option) => handleWhatsAppEnquiry(name, option)}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMorePages && (
              <div className="text-center mt-5">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  style={{
                    background: "linear-gradient(135deg, #e4718a, #ff91a4)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50px",
                    padding: "15px 40px",
                    fontSize: "1.1rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 5px 20px rgba(228, 113, 138, 0.3)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    opacity: loadingMore ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!loadingMore) {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 8px 25px rgba(228, 113, 138, 0.4)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loadingMore) {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 5px 20px rgba(228, 113, 138, 0.3)";
                    }
                  }}
                >
                  {loadingMore ? (
                    <>
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <span>Load More Products (Page {currentPage + 1})</span>
                      <FaArrowDown aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Back to Home Menu */}
            <div className="text-center mt-4">
              <Link href="/" className={styles.backLink}>
                <FaArrowLeft aria-hidden="true" />
                Back to home
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
} 
