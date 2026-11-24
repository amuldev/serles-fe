import { Inter, Cormorant_Garamond } from "next/font/google";
import Script from "next/script";
import "./globals.scss";
import Header from './components/Header';
import Footer from './components/Footer';
import DebugInfo from './components/DebugInfo';
import MicrosoftClarity from './components/MicrosoftClarity';
import LocalBusinessJsonLd from './components/LocalBusinessJsonLd';
import ContactClickTracking from './components/ContactClickTracking';

const inter = Inter({ subsets: ["latin"] });
// Display face for headings (24 Nov 2026 redesign): an elegant, slightly
// handmade-looking serif instead of plain Georgia. Self-hosted by next/font.
const display = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display", display: "swap" });

// Site-wide defaults. Pages without their own openGraph inherit these, so the
// social title must equal the page title (it said "Cakes Near Me" while the
// homepage <title> said "Cake Shop & Bakery"). "Near me" in a title does not
// help: proximity comes from the Business Profile. The share image is a card
// of real catalog photos, not the logo.
const SITE_TITLE = "Cake Shop & Bakery in Tenkasi | Serle’s Bake";
const SITE_DESCRIPTION = "Cake shop & bakery in Tenkasi. Homemade cakes baked fresh after you order: birthday, photo & custom cakes. Order 4 hours ahead on WhatsApp for delivery.";
const SHARE_IMAGE = { url: '/img/og/serles-bake-cakes.jpg', width: 1200, height: 630, alt: "Homemade cakes from Serle's Bake, Ilanji, Tenkasi" };

export const metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  authors: [{ name: "Serle's Bake" }],
  creator: "Serle's Bake",
  publisher: "Serle's Bake",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.serlesbake.in'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: 'https://www.serlesbake.in',
    siteName: "Serle's Bake",
    images: [SHARE_IMAGE],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [SHARE_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={display.variable}>
      <head>
        {/* Icons come from app/favicon.ico, app/icon.png and app/apple-icon.png
            (Next adds the <link> tags). The old extra /serlesfavicon.ico link
            competed with the stock Next.js favicon, so Google showed a globe. */}
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="google-site-verification" content="WAogh12govTmEEog4Dqeoj5kzeCMJrW4pDF2s_cY14A" />
        <meta name="theme-color" content="#b61123" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Open Sans was being downloaded on every page load but is not referenced
            by any stylesheet - dropping it removes a whole family from the request. */}
        <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Pacifico&display=swap" rel="stylesheet" />

        {/* Template CSS Files */}
        <link rel="stylesheet" href="/css/style.css" />
        <link rel="stylesheet" href="/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/css/font-awesome.min.css" />
        {/* flaticon.css removed: no `flaticon-` class is referenced anywhere in
            the app, so it was a render-blocking request for an unused icon set.
            The file is still in public/css if it is ever needed. */}
        <link rel="stylesheet" href="/css/barfiller.css" />
        <link rel="stylesheet" href="/css/magnific-popup.css" />
        <link rel="stylesheet" href="/css/elegant-icons.css" />
        <link rel="stylesheet" href="/css/nice-select.css" />
        <link rel="stylesheet" href="/css/owl.carousel.min.css" />
        <link rel="stylesheet" href="/css/slicknav.min.css" />
      </head>
      <body className={inter.className}>
        {/* An image inside head/noscript prematurely closes the HTML head when
            scripting is disabled. Keep the tracking fallback in the body. */}
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1270870504177513&ev=PageView&noscript=1" alt="" />
        </noscript>
        {/* Sitewide Bakery/LocalBusiness + WebSite structured data. Static markup,
            so it costs nothing at runtime and is present for crawlers on every
            route. */}
        <LocalBusinessJsonLd />
        <ContactClickTracking />

        {/* Microsoft Clarity Analytics */}
        <MicrosoftClarity />

        {/* No full-screen preloader. The template's #preloder covered the
            already server-rendered page (black, purple spinner) until every
            image and tracking script loaded - about 2.5 s on every full page
            load (24 Nov 2026). Content now shows as soon as it arrives. */}

        <Header />

        <main>
          {children}
        </main>

        <Footer />

        {/* Analytics and the chat widget are third-party and not needed for first
            paint. next/script keeps them off the critical path: analytics load
            once the page is interactive, the chat widget only when the browser
            is idle. Previously all three blocked HTML parsing. */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-PXF11QPRMS"
          strategy="afterInteractive"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-PXF11QPRMS', {
              page_path: window.location.pathname,
              anonymize_ip: true,
              send_page_view: true,
              debug_mode: ${process.env.NEXT_PUBLIC_GA_DEBUG === 'true'}
            });
            gtag('get', 'G-PXF11QPRMS', 'client_id', function(clientId) {
              if (clientId) {
                try { window.localStorage.setItem('serles_ga4_client_id', clientId); } catch (e) {}
              }
            });
            gtag('get', 'G-PXF11QPRMS', 'session_id', function(sessionId) {
              if (sessionId) {
                try { window.localStorage.setItem('serles_ga4_session_id', String(sessionId)); } catch (e) {}
              }
            });
            (window.__serlesAnalyticsQueue || []).splice(0).forEach(([name, params]) => {
              gtag('event', name, params);
            });
          `}
        </Script>

        <Script id="fb-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            // autoConfig off: Meta's automatic page scanning misread the ₹
            // price text and logged "Invalid parameter format for currency"
            // on /menu and /blog. Our own events (analytics.js) still send.
            fbq('set', 'autoConfig', false, '1270870504177513');
            fbq('init', '1270870504177513');
            fbq('track', 'PageView');
          `}
        </Script>

        <Script
          src="https://www.noupe.com/embed/019947270aa97316ae2fc391b37f8cc91986.js"
          strategy="lazyOnload"
        />

        {/* Debug Info - Only in development */}
        <DebugInfo />

        {/* Template scripts (~307 KB of jQuery + plugins). `defer` stops them
            blocking HTML parsing while still guaranteeing execution order, so
            jQuery is always ready before the plugins and main.js that need it.
            They all finish before DOMContentLoaded. */}
        <script defer src="/js/jquery-3.3.1.min.js"></script>
        <script defer src="/js/bootstrap.min.js"></script>
        <script defer src="/js/jquery.magnific-popup.min.js"></script>
        <script defer src="/js/jquery.nice-select.min.js"></script>
        <script defer src="/js/jquery.slicknav.js"></script>
        <script defer src="/js/owl.carousel.min.js"></script>
        <script defer src="/js/jquery.barfiller.js"></script>
        <script defer src="/js/jquery.nicescroll.min.js"></script>
        <script defer src="/js/main.js?v=20261124b"></script>

        {/* Preloader Script */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // Prevent double execution
            if (window.preloaderInitialized) {
              // Already initialized, skip
            } else {
              window.preloaderInitialized = true;
              
              // Initialize the jQuery plugins once the page has loaded
              window.addEventListener('load', function() {
                setTimeout(function() {
                  if (typeof $ !== 'undefined') {
                    // Initialize slicknav if it exists
                    if (typeof $.fn.slicknav !== 'undefined') {
                      try {
                        $(".mobile-menu").slicknav({
                          prependTo: '#mobile-menu-wrap',
                          allowParentLinks: true
                        });
                      } catch (e) {
                        console.warn('Slicknav initialization failed:', e);
                      }
                    }
                    
                    if (typeof $.fn.magnificPopup !== 'undefined') {
                      $('.image-popup').magnificPopup({
                        type: 'image',
                        closeOnContentClick: true,
                        closeBtnInside: false,
                        fixedContentPos: true,
                        mainClass: 'mfp-no-margins mfp-with-zoom',
                        gallery: {
                          enabled: true,
                          navigateByImgClick: true,
                          preload: [0, 1]
                        },
                        image: {
                          verticalFit: true
                        },
                        callbacks: {
                          elementParse: function(item) {
                            item.el.attr('title', item.el.attr('title'));
                          }
                        }
                      });
                    }
                  }
                }, 0); // Deferred scripts all run before DOMContentLoaded, so by
                       // the time 'load' fires jQuery and its plugins are ready.
                       // This used to wait a further second before the mobile
                       // menu and selects became usable.
              });
              
              // Error handling for missing JS files
              window.addEventListener('error', function(e) {
                if (e.target.tagName === 'SCRIPT' && e.target.src.includes('/js/')) {
                  console.warn('Template JS file not found:', e.target.src);
                }
              });
            }
          `
        }} />
      </body>
    </html>
  );
}
