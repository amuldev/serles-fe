"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductsUrl, getCategoriesUrl, getProductDetailUrl } from "../../../config/api";
import Breadcrumb from "../../../components/Breadcrumb";
import ProductCard from "../../../components/ProductCard";
import ProductFAQ from "../../../components/ProductFAQ";
import ProductOrderingDetails from '../../../components/ProductOrderingDetails';
import { DELIVERY_CHARGES, FRESH_BAKE_SHORT } from '../../../utils/deliveryPolicy';
import apiCache from "../../../utils/cache";
import { FaWhatsapp, FaMinus, FaPlus, FaClock } from 'react-icons/fa';
import { formatRupees, weightLabel } from '../../../components/MenuProductCard';
import panel from './ProductPurchasePanel.module.scss';
import { getAnalyticsReference, trackStoreEvent } from "../../../utils/analytics";

/** "black-forest" -> "Black Forest", for headings shown before the fetch resolves. */
const titleFromSlug = (slug = "") =>
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function onlyAvailableWeights(product) {
  if (!product) return product;
  return { ...product, weight_options: (product.weight_options || []).filter(option => option.is_active !== false && option.weight?.is_active !== false) };
}

export default function ProductDetailPageClient({
  params,
  initialProduct,
  initialCategories,
  initialRelatedProducts,
}) {
  const categorySlug = params.categorySlug ?? params["category-slug"];
  const productSlug = params.productSlug ?? params["product-slug"];
  const router = useRouter();

  // page.js fetches this on the server and passes it in, so the product name,
  // description, price and images are in the HTML crawlers receive. When the props
  // are present we never fetch; the useEffect below stays as a fallback for any
  // caller that renders this component without them.
  const hasServerData = Boolean(initialProduct);

  const availableProduct = onlyAvailableWeights(initialProduct);
  const [product, setProduct] = useState(availableProduct ?? null);
  const [categories, setCategories] = useState(initialCategories ?? []);
  const [relatedProducts, setRelatedProducts] = useState(initialRelatedProducts ?? []);
  const [loading, setLoading] = useState(!hasServerData);
  const [loadError, setLoadError] = useState(false);
  const [dataFetched, setDataFetched] = useState(hasServerData);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedWeight, setSelectedWeight] = useState(
    availableProduct?.weight_options?.[0] ?? null
  );
  const [activeAccordion, setActiveAccordion] = useState('description');
  const [customMessage, setCustomMessage] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const isPhotoCake = /photo.?cake/i.test(initialProduct?.name || product?.name || productSlug);
  const viewItemSentFor = useRef(null);

  useEffect(() => {
    if (product?.id && viewItemSentFor.current !== String(product.id)) {
      viewItemSentFor.current = String(product.id);
      const itemPrice = Number(selectedWeight?.price || product.min_price || product.base_price) || undefined;
      trackStoreEvent('view_item', {
        item_id: String(product.id),
        item_name: product.name,
        item_category: product.category?.name,
        items: [{
          item_id: String(product.id),
          item_name: product.name,
          item_category: product.category?.name,
          price: itemPrice,
          quantity: 1,
        }],
        currency: 'INR',
        value: itemPrice,
      });
    }
  }, [product?.id, product?.name, product?.category?.name, selectedWeight?.price]);

  // Fetch data only once with caching
  useEffect(() => {
    if (dataFetched) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Use cached API calls
        const [productsData, categoriesData] = await Promise.all([
          apiCache.fetchWithCache(getProductsUrl()),
          apiCache.fetchWithCache(getCategoriesUrl())
        ]);

        const allProducts = Array.isArray(productsData?.results) ? productsData.results : Array.isArray(productsData) ? productsData : [];
        const allCategories = Array.isArray(categoriesData?.results) ? categoriesData.results : Array.isArray(categoriesData) ? categoriesData : [];

        // Find the specific product from the list
        const foundProductFromList = allProducts.find(p => 
          p.slug === productSlug && p.category?.slug === categorySlug
        );

        if (!foundProductFromList) {
          notFound();
        }

        // Fetch individual product data to get weight_options (with caching)
        const individualProductData = onlyAvailableWeights(await apiCache.fetchWithCache(getProductDetailUrl(foundProductFromList.id)));

        // Get related products (same category, different products)
        const related = allProducts.filter(p => 
          p.category?.slug === categorySlug && p.id !== foundProductFromList.id
        ).slice(0, 4);

        setProduct(individualProductData);
        setCategories(allCategories);
        setRelatedProducts(related);
        
        // Set default selected weight (first available weight option)
        if (individualProductData.weight_options && individualProductData.weight_options.length > 0) {
          setSelectedWeight(individualProductData.weight_options[0]);
        }
        
        setDataFetched(true);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categorySlug, productSlug, dataFetched]);

  // Handle quantity changes
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  // Handle weight selection
  const handleWeightChange = (weightOption) => {
    setSelectedWeight(weightOption);
    trackStoreEvent('select_product_weight', {
      item_id: String(product?.id || ''),
      item_name: product?.name,
      weight: weightOption.display_name,
      price: Number(weightOption.price) || undefined,
    });
  };

  // Handle accordion changes
  const handleAccordionChange = (accordionId) => {
    setActiveAccordion(activeAccordion === accordionId ? null : accordionId);
  };

  // Handle WhatsApp enquiry
  const handleWhatsAppEnquiry = () => {
    const total = getTotalAmount();
    trackStoreEvent('whatsapp_enquiry_click', {
      item_id: String(product?.id || ''),
      item_name: product?.name,
      weight: selectedWeight?.display_name || 'Standard',
      quantity,
      value: total || undefined,
      currency: 'INR',
      items: [{
        item_id: String(product?.id || ''),
        item_name: product?.name,
        item_variant: selectedWeight?.display_name || 'Standard',
        price: getUnitPrice() || undefined,
        quantity,
      }],
    });
    const message = `Hi! I'm interested in ordering the ${product.name} cake.

Product Details:
- Name: ${product.name}
- Weight: ${selectedWeight?.display_name || 'Standard'}
- Quantity: ${quantity}
- Total: ${getTotalPrice()}

${customMessage.trim() ? `Message on the cake: ${customMessage.trim()}
` : ''}Product page: ${typeof window !== 'undefined' ? window.location.href.split('?')[0] : ''}

${isPhotoCake ? `I will send the photo in this WhatsApp chat. Photo: ${photoFile?.name || 'to follow'}` : ''}

Please contact me for more details. Thank you!${getAnalyticsReference()}`;

    const whatsappUrl = `https://wa.me/916383070725?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Get product images
  const getProductImages = () => {
    const images = [];
    const imageUrl = (image) => {
      if (typeof image === 'string') return image;
      return image?.url || image?.image || image?.image_url || image?.src || null;
    };
    const addImage = (image) => {
      const url = imageUrl(image);
      if (url && !images.some((entry) => entry.url === url)) {
        images.push({ url, alt: image?.alt_text || image?.alt || null });
      }
    };
    
    // Add featured image first
    addImage(product?.featured_image);
    
    // Add other images
    if (product?.images && Array.isArray(product.images)) {
      product.images.forEach(addImage);
    }
    
    // Fallback to placeholder
    if (images.length === 0) {
      images.push({ url: "/img/placeholder-product.jpg", alt: product?.name || "Cake" });
    }
    
    return images;
  };

  // Get current price based on selected weight
  const getCurrentPrice = () => {
    if (selectedWeight && selectedWeight.price) {
      return `₹${selectedWeight.price}`;
    }
    return product?.price_range?.replace(/\$/g, '₹') || "Price not available";
  };

  // Get unit price for quantity calculation
  const getUnitPrice = () => {
    if (selectedWeight && selectedWeight.price) {
      return parseFloat(selectedWeight.price);
    }
    return 0;
  };

  // Get total price based on quantity and selected weight
  const getTotalPrice = () => {
    return selectedWeight ? `₹${getTotalAmount().toFixed(2)}` : "Select a weight to see total";
  };

  const getTotalAmount = () => getUnitPrice() * quantity;

  if (loading) {
    // The breadcrumb carries the page's <h1>; without it the server HTML has no
    // heading at all, since this component fetches client-side.
    return (
      <>
        <Breadcrumb
          title={titleFromSlug(productSlug)}
          items={[
            { label: "Cakes", href: "/cakes" },
            { label: titleFromSlug(categorySlug), href: `/cakes/${categorySlug}` },
            { label: titleFromSlug(productSlug) },
          ]}
        />
        <section className="container text-center py-5" aria-live="polite">
          <p>
            {loadError
              ? "Product details are temporarily unavailable. Contact us to confirm the current price and availability."
              : "Checking product details and availability…"}
          </p>
          <a
            className="primary-btn"
            href={`https://wa.me/916383070725?text=${encodeURIComponent(`Hi! Please share details and availability for the ${titleFromSlug(productSlug)}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ask us on WhatsApp
          </a>
        </section>
      </>
    );
  }

  if (!product) {
    return <div className="text-center py-5">Product not found</div>;
  }

  const productImages = getProductImages();
  const currentCategory = categories.find(c => c.slug === categorySlug);

  return (
    <>

      <style jsx>{`
        .accordion-item {
          border: 1px solid #e8d3da;
          border-radius: 14px;
          margin-bottom: 12px;
          overflow: hidden;
          background: #fff;
        }

        .accordion-header {
          border: none;
          padding: 18px 25px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 700;
          color: #333;
          font-size: 16px;
          position: relative;
          background:  #ffffff;
          width: 100%;
        }

        .accordion-header::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: transparent;
          transition: background-color .2s ease;
        }

        .accordion-header:hover {
          background: #fff8fa;
          color: #671d32;
        }

        .accordion-header:focus-visible {
          outline: 3px solid #a95d76;
          outline-offset: -3px;
        }

        .accordion-header.active {
          background: #fff1f5;
          color: #671d32;
        }

        .accordion-header.active::before {
          background: #671d32;
        }

        .accordion-icon {
          transition: transform 0.3s ease;
          font-size: 20px;
          color: #671d32;
        }

        .accordion-header.active .accordion-icon {
          transform: rotate(180deg);
        }

        .accordion-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s ease;
          background: white;
        }

        .accordion-content.active {
          max-height: none; /* was 600px, which cut off long descriptions on phones */
          padding: 25px;
          border-top: 1px solid #f0f0f0;
        }

        .accordion-body {
          line-height: 1.8;
          color: #555;
        }

        .field-label {
          color: #333;
          font-weight: 700;
          margin-bottom: 10px;
          font-size: 16px;
        }

        .accordion-body h3 {
          color: #333;
          font-weight: 700;
          margin-bottom: 15px;
          font-size: 18px;
        }

        .accordion-body p {
          margin-bottom: 15px;
        }

        .accordion-body ul {
          padding-left: 20px;
        }

        .accordion-body li {
          margin-bottom: 8px;
          position: relative;
        }

        .accordion-body li::before {
          content: '•';
          color: #671d32;
          font-weight: bold;
          position: absolute;
          left: -15px;
        }

        .sticky-image-container {
          position: sticky;
          top: 20px;
          height: fit-content;
          z-index: 10;
          max-height: calc(100vh - 40px);
          overflow: hidden;
        }

        .product-details-container {
          position: relative;
          z-index: 1;
        }

        .related-products-section {
          position: relative;
          z-index: 5;
          margin-top: 80px;
          padding-top: 50px;
          border-top: 2px solid #f0f0f0;
          clear: both;
        }

        .product-details-row {
          position: relative;
          z-index: 1;
        }

        .mobile-sticky-whatsapp {
          display: none;
        }

        .mobile-sticky-cta-spacer {
          display: none;
        }

        @media (max-width: 991px) {
          .sticky-image-container {
            position: static;
            margin-bottom: 30px;
            max-height: none;
            overflow: visible;
          }
          
          .related-products-section {
            margin-top: 50px;
          }
        }

        @media (max-width: 767px) {
          /* Let the fixed CTA sit above related products instead of trapping
             it inside the product section's lower stacking context. */
          .product-details-container,
          .product-details-row {
            z-index: auto;
          }

          .mobile-sticky-whatsapp {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            min-height: 52px;
            position: fixed;
            z-index: 1000;
            left: 16px;
            right: 16px;
            bottom: calc(16px + env(safe-area-inset-bottom));
            width: calc(100% - 32px);
            border: 0;
            border-radius: 999px;
            padding: 14px 20px;
            color: #fff;
            background: #128c4a;
            box-shadow: 0 4px 18px rgba(0, 0, 0, .24);
            font-size: 16px;
            font-weight: 700;
          }

          .product-details-container {
            padding-bottom: 132px;
          }

          .mobile-sticky-cta-spacer {
            display: block;
            height: 132px;
          }
        }
      `}</style>

      {/* Breadcrumb Begin */}
      <Breadcrumb 
        title={product.name} 
        items={[
          { label: "Cakes", href: "/cakes" },
          { label: currentCategory?.name || "Category", href: `/cakes/${categorySlug}` },
          { label: product.name }
        ]} 
      />
      {/* Breadcrumb End */}

      {/* Shop Details Section Begin */}
      <section className="product-details spad product-details-container">
        <div className="container">
          <div className="row product-details-row">
            <div className="col-lg-6">
              <div className="product__details__img sticky-image-container">
                <div className="product__details__big__img">
                  <Image
                    src={productImages[selectedImage]?.url || "/img/placeholder.jpg"}
                    alt={productImages[selectedImage]?.alt || product.name}
                    title={productImages[selectedImage]?.alt || product.name}
                    width={500}
                    height={500}
                    priority
                    fetchPriority="high"
                    style={{ objectFit: "cover" }}
                    className="big_img"
                  />
                </div>
                <div className="product__details__thumb" role="group" aria-label={`${product.name} photo gallery`}>
                  {productImages.map((image, index) => (
                    <button
                      key={index} 
                      type="button"
                      className={`pt__item ${selectedImage === index ? 'active' : ''}`}
                      onClick={() => setSelectedImage(index)}
                      aria-label={`Show ${product.name}, photo ${index + 1}`}
                      aria-pressed={selectedImage === index}
                      style={{ cursor: 'pointer', border: 0, padding: 0, background: 'transparent' }}
                    >
                      <Image
                        src={image.url}
                        alt={image.alt || `${product.name} - Photo ${index + 1}`}
                        title={image.alt || `${product.name} - Photo ${index + 1}`}
                        width={100}
                        height={100}
                        loading="lazy"
                        style={{ objectFit: "cover" }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="product__details__text">
                {/* Purchase panel: rebuilt 24 Nov 2026 (ui-ux-pro-max pass). Real
                    labels, a radio group for sizes, 44px controls, SVG icons
                    (the Font Awesome 5 classes never loaded), no endless
                    "glitter" animation. Behaviour is unchanged. */}
                <h2 className={panel.name}>{product.name}</h2>
                <p className={panel.priceLine} aria-live="polite">
                  <span className={panel.price}>{selectedWeight ? formatRupees(getUnitPrice()) : '—'}</span>
                  {selectedWeight && <span className={panel.priceFor}>for {weightLabel(selectedWeight)}</span>}
                  {selectedWeight && quantity > 1 && (
                    <span className={panel.total}>Total {formatRupees(getTotalAmount())} for {quantity}</span>
                  )}
                </p>

                <p className={panel.summary}>{product.short_description || product.description}</p>

                {product.weight_options && product.weight_options.length > 0 && (
                  <div className={panel.field}>
                    <p className={panel.label} id="weight-label">Choose a size</p>
                    <div className={panel.sizes} role="radiogroup" aria-labelledby="weight-label">
                      {product.weight_options.map((weightOption, index) => {
                        const active = selectedWeight?.id === weightOption.id;
                        return (
                          <button
                            key={weightOption.id ?? index}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            className={`${panel.size} ${active ? panel.sizeActive : ''}`}
                            onClick={() => handleWeightChange(weightOption)}
                          >
                            <span className={panel.sizeWeight}>{weightLabel(weightOption)}</span>
                            <span className={panel.sizePrice}>{formatRupees(weightOption.price) || 'Ask us'}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {isPhotoCake && (
                  <div className={panel.photoNote}>
                    <p className={panel.label}>Sending your photo</p>
                    <p>After you tap Order on WhatsApp, attach a clear JPG, PNG or WebP photo in the chat. An original image at least 1200 px on its shortest side gives a sharp print.</p>
                  </div>
                )}

                <div className={panel.row}>
                  <div className={panel.field}>
                    <label className={panel.label} htmlFor="cake-quantity">Quantity</label>
                    <div className={panel.stepper}>
                      <button type="button" aria-label="Decrease quantity" onClick={() => handleQuantityChange(quantity - 1)} disabled={quantity <= 1}><FaMinus aria-hidden="true" /></button>
                      <input id="cake-quantity" type="number" inputMode="numeric" min="1" value={quantity}
                        onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10) || 1)} />
                      <button type="button" aria-label="Increase quantity" onClick={() => handleQuantityChange(quantity + 1)}><FaPlus aria-hidden="true" /></button>
                    </div>
                  </div>
                </div>

                <div className={panel.field}>
                  <label className={panel.label} htmlFor="cake-message">Message on the cake <span className={panel.optional}>(optional)</span></label>
                  <textarea
                    id="cake-message"
                    className={panel.textarea}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="e.g. Happy Birthday Priya"
                    rows={2}
                    maxLength={120}
                  />
                </div>

                <button type="button" className={panel.cta} onClick={handleWhatsAppEnquiry}>
                  <FaWhatsapp aria-hidden="true" /> Order on WhatsApp
                </button>
                <p className={panel.ctaNote}><FaClock aria-hidden="true" /> {FRESH_BAKE_SHORT}</p>
                <button type="button" className="mobile-sticky-whatsapp" onClick={handleWhatsAppEnquiry}>
                  <FaWhatsapp aria-hidden="true" /> Order on WhatsApp
                </button>

                <dl className={panel.meta}>
                  <div><dt>Category</dt><dd>{product.category?.name || 'Cake'}</dd></div>
                  {product.sku && <div><dt>SKU</dt><dd>{product.sku}</dd></div>}
                </dl>

                {/* Product Details Accordion */}
                <div className="product__details__accordion mt-5">
                  <h2 style={{
                    color: '#671d32',
                    fontFamily: "var(--font-display), Georgia, 'Times New Roman', serif",
                    fontSize: 'clamp(24px, 2.4vw, 30px)',
                    fontWeight: '700',
                    marginBottom: '16px',
                    borderBottom: '1px solid #eedde2',
                    paddingBottom: '12px'
                  }}>
                    Product Details
                  </h2>
                  {/* Description Accordion */}
                  <div className="accordion-item">
                    <button 
                      className={`accordion-header ${activeAccordion === 'description' ? 'active' : ''}`}
                      onClick={() => handleAccordionChange('description')}
                    >
                      <span>Product Description</span>
                      <i className={`fa fa-chevron-down accordion-icon ${activeAccordion === 'description' ? 'active' : ''}`}></i>
                    </button>
                    <div className={`accordion-content ${activeAccordion === 'description' ? 'active' : ''}`}>
                      <div className="accordion-body">
                        <h3>Product Information</h3>
                        <p>{product.description || product.short_description || 'No description available.'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information Accordion */}
                  <div className="accordion-item">
                    <button 
                      className={`accordion-header ${activeAccordion === 'additional' ? 'active' : ''}`}
                      onClick={() => handleAccordionChange('additional')}
                    >
                      <span>Additional Information</span>
                      <i className={`fa fa-chevron-down accordion-icon ${activeAccordion === 'additional' ? 'active' : ''}`}></i>
                    </button>
                    <div className={`accordion-content ${activeAccordion === 'additional' ? 'active' : ''}`}>
                      <div className="accordion-body">
                        <h3>Additional Information</h3>
                        {/* Product-specific facts instead of the same generic
                            list on every product (SEO audit, 24 Nov 2026). */}
                        <ul>
                          {product.weight_options?.length > 0 && (
                            <li><strong>Sizes:</strong> {product.weight_options.map((w) => (w.display_name || w.name || '').replace(/\s*[-–—]\s*₹.*$/, '').trim()).filter(Boolean).join(', ')}</li>
                          )}
                          <li><strong>Freshness:</strong> {FRESH_BAKE_SHORT}</li>
                          <li><strong>Eggless:</strong> ask us on WhatsApp whether this cake can be made eggless before you order.</li>
                          <li><strong>Delivery:</strong> {DELIVERY_CHARGES}</li>
                          <li><strong>Payment:</strong> Google Pay or online payment, confirmed with you on WhatsApp.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Reviews Accordion */}
                  {/* <div className="accordion-item">
                    <button 
                      className={`accordion-header ${activeAccordion === 'reviews' ? 'active' : ''}`}
                      onClick={() => handleAccordionChange('reviews')}
                    >
                      <span>Customer Reviews & Location</span>
                      <i className={`fa fa-chevron-down accordion-icon ${activeAccordion === 'reviews' ? 'active' : ''}`}></i>
                    </button>
                    <div className={`accordion-content ${activeAccordion === 'reviews' ? 'active' : ''}`}>
                      <div className="accordion-body">
                        <h3>Customer Reviews</h3>
                        <div className="row">
                          <div className="col-lg-12">
                            <iframe
                              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3930.1234567890123!2d77.12345678901234!3d8.12345678901234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOMKwMDcnMjAuMCJOIDc3wrAwNycwMC4wIkU!5e0!3m2!1sen!2sin!4v1234567890123"
                              width="100%"
                              height="300"
                              style={{ border: 0 }}
                              allowFullScreen=""
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                            <p className="mt-3">
                              <a 
                                href="https://www.google.com/maps/place/Serle's+Bake" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn btn-outline-primary"
                              >
                                View on Google Maps
                              </a>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Shop Details Section End */}

      {/* Product FAQ (SEO-friendly JSON-LD + visible FAQ) */}
      <section className="container">
        <div className="row">
          <div className="col-lg-12">
            <ProductOrderingDetails product={product} />
            <ProductFAQ product={product} phone="916383070725" whatsappNumber="916383070725" />
          </div>
        </div>
      </section>

      {/* Spacer to prevent overlap */}
      <div style={{ height: '50px', clear: 'both' }}></div>

      {/* Related Products Section Begin */}
      <section className="related spad related-products-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <h2 className="h3" style={{
                color: '#333', 
                fontWeight: '700', 
                marginBottom: '30px',
                textAlign: 'center',
                position: 'relative'
              }}>
                <span style={{ 
                  background: 'white', 
                  padding: '0 20px',
                  position: 'relative',
                  zIndex: '1'
                }}>
                  Related Products
                </span>
                <div style={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '0', 
                  right: '0', 
                  height: '2px', 
                  background: 'linear-gradient(90deg, transparent, #ff91a4, transparent)',
                  zIndex: '0'
                }}></div>
              </h2>
            </div>
          </div>
          <div className="row">
            {relatedProducts.length > 0 ? (
              relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} headingLevel="h3" />
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <h4>No related products found</h4>
                <p className="text-muted">Check back later for more products in this category.</p>
              </div>
            )}
          </div>
        </div>
      </section>
      {/* Related Products Section End */}
      <div className="mobile-sticky-cta-spacer" aria-hidden="true" />
    </>
  );
} 
