"use client";
import { useState, useMemo } from "react";
import { DELIVERY_COVERAGE, DELIVERY_CHARGES } from '../utils/deliveryPolicy';

function formatPrice(value) {
  if (value == null) return '';
  const num = parseFloat(value);
  if (Number.isNaN(num)) return String(value);
  return `₹${num.toFixed(2)}`;
}

export default function ProductFAQ({ product = {}, phone = "916383070725", whatsappNumber = "916383070725" }) {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = useMemo(() => {
    const items = [];

    // Weights
    if (product.weight_options && product.weight_options.length > 0) {
      const cleanName = (w) => {
        const dn = (w.display_name || w.name || '').trim();
        // remove trailing price-like fragments such as "- ₹399" or "- $10"
        return dn.replace(/\s*[-–—]\s*[₹$]?\s*[\d,\.]+.*$/g, '').trim();
      };

      const weightList = product.weight_options.map(w => {
        const name = cleanName(w);
        const price = w.price ? formatPrice(w.price) : '';
        return `${name}${price ? ` — ${price}` : ''}`.trim();
      }).join('; ');

      items.push({
        question: 'What weights are available for this cake?',
        answer: `Available weight options: ${weightList}.`,
        type: 'call',
        phoneLink: `tel:${phone}`
      });

      // Starting price
      const prices = product.weight_options.map(w => parseFloat(w.price || 0)).filter(p => !Number.isNaN(p));
      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        items.push({
          question: 'What is the starting price for this cake?',
          answer: `Prices start from ${formatPrice(minPrice)} for the smallest available weight.`
        });
      }
    } else if (product.price_range) {
      items.push({
        question: 'What is the price for this cake?',
        answer: `Price: ${product.price_range.replace(/\$/g, '₹')}. Contact us for exact quotes on custom orders.`
      });
    }

    // Delivery
    items.push({
      question: 'What are the delivery options and charges?',
      answer: `${DELIVERY_COVERAGE} ${DELIVERY_CHARGES}`
    });

    // WhatsApp
    const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi! I am interested in the ${product.name || 'cake'}.`)}`;
    items.push({
      question: 'How can I order via WhatsApp?',
      answer: 'Tap the WhatsApp button to ask about this cake. Share your preferred weight, cake message, event date and delivery address so we can confirm the details.',
      type: 'whatsapp',
      waLink
    });

    // Call
    items.push({
      question: 'Can I call to place an order?',
      answer: `Yes — call us at ${phone}.`,
      type: 'call',
      phoneLink: `tel:${phone}`
    });

    // Payment / Amount
    items.push({
      question: 'How is the amount calculated and how do I pay?',
      answer: 'The amount shown is for the selected weight and quantity. We accept Google Pay and online payments. Message us on WhatsApp to confirm the final total, including delivery and any customization charges, and receive payment instructions. Please check your order confirmation with us in the chat.'
    });

    // Cake customizations
    items.push({
      question: 'Can I customize the cake (message, photo, flavour)?',
      answer: 'Share your cake message and design reference before ordering. We check which changes are feasible for the specific cake and confirm any additional charge. A photo print, flavour change or pictured decoration is not automatically included in every listing.'
    });

    items.push({
      question: 'How far ahead should I order this cake?',
      answer: 'Send your event date and cake-cutting time when you enquire. We check availability for the chosen cake, weight and design before confirming. The website does not reserve a preparation slot or guarantee same-day delivery.'
    });
    items.push({
      question: 'How many portions will this weight provide?',
      answer: 'Tell us the guest count and whether the cake is for a small cake-cutting portion or the main dessert. We can discuss a suitable weight; tier count or weight alone does not guarantee a fixed number of servings.'
    });
    items.push({
      question: 'What should I check about storage and transport?',
      answer: 'Tell us when the cake will be served, how long it will travel and where it will be kept. Ask for handling and storage instructions for the cake you choose. Do not assume a brownie or ganache cake can stay unrefrigerated for an unlimited time.'
    });
    if (product.slug === 'photo-cake') {
      items.push({
        question: 'How do I send the photo for a Photo Cake?',
        answer: 'Have a clear original image ready. Attach it in WhatsApp after we check the design; the website enquiry does not upload an image. Confirm the crop, layout and cake message before the order is finalized.'
      });
    }
    if (product.category?.slug === 'tier-cake') {
      items.push({
        question: 'What venue details do you need for a tiered cake?',
        answer: 'Share the venue address, guest count, cutting time and design reference. Discuss access, the person receiving the cake and any setup or storage arrangements before confirming the order.'
      });
    }

    return items;
  }, [product, phone, whatsappNumber]);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(f => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer
      }
    }))
  }), [faqs]);


  return (
    <div className="product-faq mt-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\u003c'),
        }}
      />

      <h2 style={{ color: '#333', fontWeight: 700, marginBottom: 16, fontSize: '1.5rem' }}>Frequently Asked Questions</h2>

      <style jsx>{`
        .accordion-item {
          border: 2px solid #f0f0f0;
          border-radius: 12px;
          margin-bottom: 15px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .accordion-header {
          border: none;
          padding: 14px 18px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 700;
          color: #333;
          background: #ffffff;
          width: 100%;
        }

        .accordion-header.active {
          background: linear-gradient(135deg, #ff91a4, #ffb3c1);
          color: white;
        }

        .accordion-icon {
          transition: transform 0.3s ease;
          font-size: 18px;
          color: #ff91a4;
        }

        .accordion-header.active .accordion-icon {
          transform: rotate(180deg);
          color: white;
        }

        .accordion-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s ease;
          background: white;
        }

        .accordion-content.active {
          max-height: 600px;
          padding: 16px 18px;
          border-top: 1px solid #f0f0f0;
        }

        .accordion-body {
          line-height: 1.8;
          color: #555;
        }
      `}</style>

      {faqs.map((f, idx) => (
        <div key={idx} className={`accordion-item`} style={{ marginBottom: 12 }}>
          <button
            type="button"
            id={`product-faq-question-${idx}`}
            aria-expanded={openIndex === idx}
            aria-controls={`product-faq-answer-${idx}`}
            className={`accordion-header ${openIndex === idx ? 'active' : ''}`}
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            style={{ width: '100%', textAlign: 'left' }}
          >
            <span>{f.question}</span>
            <i aria-hidden="true" className={`fa fa-chevron-down accordion-icon ${openIndex === idx ? 'active' : ''}`} />
          </button>
          <div id={`product-faq-answer-${idx}`} aria-labelledby={`product-faq-question-${idx}`} hidden={openIndex !== idx} className={`accordion-content ${openIndex === idx ? 'active' : ''}`}>
            <div className="accordion-body">
              {f.type === 'whatsapp' ? (
                <>
                  <p>{f.answer}</p>
                  <a
                    href={f.waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-success"
                    style={{ marginTop: 8, color: 'white' }}
                  >
                    <i className="fa fa-whatsapp me-2" aria-hidden="true"></i>
                    Ask about this cake on WhatsApp
                  </a>
                </>
              ) : f.type === 'call' ? (
                <>
                  <p>{f.answer}</p>
                  <a
                    href={f.phoneLink}
                    className="btn btn-outline-primary"
                    style={{ marginTop: 8 }}
                  >
                    <i className="fa fa-phone me-2"></i>
                    Call Us
                  </a>
                </>
              ) : (
                <p>{f.answer}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
