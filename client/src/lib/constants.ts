export const PHONE_NUMBER = "1-888-840-4490";
export const PHONE_TEL = "tel:1-888-840-4490";
export const S3_CARTS_URL = "https://s3.amazonaws.com/prod.docs.s3/carts/";
export const COMING_SOON_IMAGE =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="#0f1713"/><g fill="none" stroke="#16a34a" stroke-width="8"><rect x="300" y="230" width="200" height="120" rx="12"/><circle cx="345" cy="380" r="26"/><circle cx="455" cy="380" r="26"/></g><text x="400" y="470" font-family="Arial, sans-serif" font-size="34" font-weight="bold" fill="#16a34a" text-anchor="middle">Image Coming Soon</text></svg>`
  );
export const SITE_NAME = "Discounted Golf Carts";
export const SITE_DOMAIN = "discountedgolfcart.com";

export const STATE_ABBREVIATIONS: Record<string, string> = {
  "Pennsylvania": "PA",
  "New Jersey": "NJ",
  "Delaware": "DE",
  "North Carolina": "NC",
  "Indiana": "IN",
  "Virginia": "VA",
  "Maryland": "MD",
  "New York": "NY",
  "Connecticut": "CT",
  "Massachusetts": "MA",
  "Rhode Island": "RI",
  "Vermont": "VT",
  "New Hampshire": "NH",
  "Maine": "ME",
  "Florida": "FL",
  "Ohio": "OH",
  "Georgia": "GA",
  "South Carolina": "SC",
  "Tennessee": "TN",
  "Kentucky": "KY",
  "West Virginia": "WV",
  "Alabama": "AL",
  "Mississippi": "MS",
  "Louisiana": "LA",
  "Texas": "TX",
  "California": "CA",
  "Arizona": "AZ",
  "Colorado": "CO",
  "Michigan": "MI",
  "Illinois": "IL",
  "Wisconsin": "WI",
  "Minnesota": "MN",
  "Iowa": "IA",
  "Missouri": "MO",
  "Arkansas": "AR",
  "Oklahoma": "OK",
  "Kansas": "KS",
  "Nebraska": "NE",
};

export function formatPrice(price: number | null | undefined): string {
  if (!price) return "Call for Price";
  return "$" + price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function getCartImageUrl(imageUrls: string[] | null | undefined): string {
  if (imageUrls && imageUrls.length > 0) {
    return S3_CARTS_URL + imageUrls[0];
  }
  return COMING_SOON_IMAGE;
}

export function getAllCartImages(imageUrls: string[] | null | undefined): string[] {
  if (imageUrls && imageUrls.length > 0) {
    return imageUrls.map((url) => S3_CARTS_URL + url);
  }
  return [COMING_SOON_IMAGE];
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
