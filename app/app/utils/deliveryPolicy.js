// Road distance from the actual Ilanji bakery. Owner raised the limit from
// 20 km to 30 km on 24 November 2026; charges unchanged.
export const DELIVERY_LIMIT_KM = 30;
export const DELIVERY_COVERAGE = `Delivery is available to eligible addresses within ${DELIVERY_LIMIT_KM} km by road from our bakery in Ilanji. Share your exact address or map pin on WhatsApp so we can check the route and availability before confirming your order.`;
export const DELIVERY_CHARGES = 'Delivery is ₹50 within the first 5 km, then ₹10 per additional kilometre within our delivery area. We confirm the route distance and final delivery charge on WhatsApp.';
export const DELIVERY_AREAS = ['Ilanji', 'Tenkasi', 'Shencottai', 'Courtallam'];

/**
 * Rough delivery charge for a road distance, from the published rule
 * (₹50 for the first 5 km, then ₹10 per km), rounded to the nearest ₹10.
 * An estimate for a mapped point only; the real charge is quoted on WhatsApp.
 */
export function estimateDeliveryCharge(km) {
  const raw = 50 + Math.max(0, km - 5) * 10;
  return Math.round(raw / 10) * 10;
}

// Owner confirmed 24 November 2026: nothing is pre-baked. Every cake is baked
// fresh after the order, so orders need at least 4 hours' notice. It is a
// minimum, not a promised slot: detailed tier/custom designs are still checked
// individually, and every order is confirmed on WhatsApp.
export const ORDER_LEAD_HOURS = 4;
export const FRESH_BAKE_HEADLINE = 'Baked fresh after you order';
export const FRESH_BAKE_NOTICE = `Please order at least ${ORDER_LEAD_HOURS} hours before you need it.`;
export const FRESH_BAKE_SHORT = `Every cake is baked fresh after you order. ${FRESH_BAKE_NOTICE}`;
export const FRESH_BAKE_DETAIL = 'Nothing is baked in advance or kept on a shelf: we start baking your cake after you place the order, so it reaches you fresh. Please order at least 4 hours before you need the cake. Detailed tier and custom designs may need longer; we confirm the timing on WhatsApp.';
