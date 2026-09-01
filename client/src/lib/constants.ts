import { getCartImageUrls, type AnyCart } from "@shared/cart-data";

export const PHONE_NUMBER = "1-888-840-4490";
export const PHONE_TEL = "tel:1-888-840-4490";
// Re-exported so there is one definition of the bucket URL in the codebase.
export { S3_CARTS_BASE as S3_CARTS_URL } from "@shared/cart-data";
export const COMING_SOON_IMAGE =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="#0f1713"/><g fill="none" stroke="#16a34a" stroke-width="8"><rect x="300" y="230" width="200" height="120" rx="12"/><circle cx="345" cy="380" r="26"/><circle cx="455" cy="380" r="26"/></g><text x="400" y="470" font-family="Arial, sans-serif" font-size="34" font-weight="bold" fill="#16a34a" text-anchor="middle">Image Coming Soon</text></svg>`
  );
export const SITE_NAME = "Alaska Golf Carts";
export const SITE_DOMAIN = "alaskagolfcarts.com";

export const STATE_ABBREVIATIONS: Record<string, string> = {
  "Alaska": "AK",
};

export function formatPrice(price: number | null | undefined): string {
  if (!price) return "Call for Price";
  return "$" + price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Photos for a cart, newest-dealer-photos-first.
 *
 * Takes the whole cart rather than one field on purpose: a cart carries photos
 * in either `internalCartImageUrls` (taken by the dealer — how most used stock
 * is pictured) or `imageUrls` (manufacturer stock shots, which used carts often
 * lack entirely). Reading only one of them hides a large slice of the
 * inventory behind a "Coming Soon" placeholder. `getCartImageUrls` also leaves
 * absolute URLs alone instead of prefixing the bucket onto them twice.
 */
export function getAllCartImages(cart: AnyCart | null | undefined): string[] {
  const images = cart ? getCartImageUrls(cart) : [];
  return images.length > 0 ? images : [COMING_SOON_IMAGE];
}

/** First photo for a cart, or the placeholder when it has none. */
export function getCartImageUrl(cart: AnyCart | null | undefined): string {
  return getAllCartImages(cart)[0];
}

export function buildCartTitle(
  make: string | null | undefined,
  model: string | null | undefined,
  color: string | null | undefined
): string {
  const parts: string[] = [];
  if (make && model) {
    parts.push(`${make} ${model}`);
  } else if (make) {
    parts.push(make);
  } else if (model) {
    parts.push(model);
  }
  if (color) {
    parts.push(color);
  }
  return parts.join(" ") || "Golf Cart";
}
