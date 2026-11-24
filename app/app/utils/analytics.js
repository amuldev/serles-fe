/** Send a small conversion event to the analytics tools already loaded globally. */
export function trackStoreEvent(eventName, params = {}) {
  if (typeof window === 'undefined') return;

  if (process.env.NEXT_PUBLIC_GA_DEBUG === 'true') params.debug_mode = true;

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  } else {
    // The afterInteractive GA config drains this queue after it is configured.
    window.__serlesAnalyticsQueue = window.__serlesAnalyticsQueue || [];
    window.__serlesAnalyticsQueue.push([eventName, params]);
  }

  if (typeof window.fbq === 'function') {
    window.fbq('trackCustom', eventName, metaPixelParams(params));
  }
}

/**
 * Meta Pixel rejects `currency` unless `value` is a number ("Invalid parameter
 * format for currency"), and some events have no price (value: undefined).
 * Drop empty fields, and currency when there is no value to go with it.
 */
function metaPixelParams(params) {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''));
  if (!Number.isFinite(clean.value)) {
    delete clean.value;
    delete clean.currency;
  }
  return clean;
}

/** Include the consenting visitor's GA client ID in WhatsApp so staff can link a later order. */
export function getAnalyticsReference() {
  if (typeof window === 'undefined') return '';
  try {
    const clientId = window.localStorage.getItem('serles_ga4_client_id');
    const sessionId = window.localStorage.getItem('serles_ga4_session_id');
    if (!clientId) return '';
    return `\nWebsite analytics client ID: ${clientId}${sessionId ? `\nWebsite analytics session ID: ${sessionId}` : ''}`;
  } catch {
    return '';
  }
}
