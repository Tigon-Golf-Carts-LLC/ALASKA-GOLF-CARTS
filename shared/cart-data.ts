/**
 * Pure, environment-agnostic helpers for working with DMS cart data.
 *
 * These run in three places, so they must not touch `process`, `window`, or the
 * network: the Express dev server, the static build scripts, and the browser
 * (static hosting mode, where filtering happens client-side against a prebuilt
 * JSON snapshot instead of the DMS API).
 */

import { SITE_URL } from "./seo-routes";

export const S3_CARTS_BASE = "https://s3.amazonaws.com/prod.docs.s3/carts/";

export type AnyCart = Record<string, any>;
export type AnyStore = Record<string, any>;

export interface CartFilters {
  searchText?: string;
  isNew?: boolean;
  isUsed?: boolean;
  isElectric?: boolean;
  isGas?: boolean;
  isStreetLegal?: boolean;
  isLifted?: boolean;
  makes?: string[];
  models?: string[];
  colors?: string[];
  seats?: string[];
  driveTrain?: string[];
  storeIds?: string[];
}

export interface BrandItem {
  key: string;
  label: string;
}

export interface SlugMap {
  slugToId: Record<string, string>;
  idToSlug: Record<string, string>;
}

export interface CartSummaryForSeo {
  slug: string;
  title: string;
  price: number | null;
  isUsed: boolean;
  isElectric: boolean;
  imageUrl: string | null;
}

export interface CartSeoMeta {
  title: string;
  description: string;
  schema: Record<string, unknown>;
  imageUrl: string | null;
}

/** DMS make keys are lowercase with every non-alphanumeric run collapsed to `_`. */
export function normalizeMakeKey(make: string): string {
  return make.toLowerCase().replace(/[^a-z0-9]/g, "_");
}

export function toSlugPart(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getCartImageUrls(cart: AnyCart): string[] {
  const files: string[] = cart?.internalCartImageUrls?.length
    ? cart.internalCartImageUrls
    : cart?.imageUrls || [];
  return files.map((f) => (f.startsWith("http") ? f : `${S3_CARTS_BASE}${f}`));
}

export function getPrimaryCartImage(cart: AnyCart): string | null {
  return getCartImageUrls(cart)[0] ?? null;
}

/**
 * New-with-photos first, then new, then used-with-photos, then used. Price sort
 * (when requested) only breaks ties inside a bucket, so listings never lead with
 * a photo-less cart.
 */
export function sortCarts(carts: AnyCart[], priceSortASC?: boolean): AnyCart[] {
  const score = (cart: AnyCart): number => {
    const isNew = cart.isUsed !== true;
    const hasImages = getCartImageUrls(cart).length > 0;
    if (isNew && hasImages) return 4;
    if (isNew) return 3;
    if (hasImages) return 2;
    return 1;
  };

  return [...carts].sort((a, b) => {
    const diff = score(b) - score(a);
    if (diff !== 0) return diff;

    if (priceSortASC === true) {
      return (a.retailPrice || 999999) - (b.retailPrice || 999999);
    }
    if (priceSortASC === false) {
      return (b.retailPrice || 0) - (a.retailPrice || 0);
    }
    return 0;
  });
}

function normalizeDriveTrain(value: string): string {
  const v = value.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (v.includes("4x4") || v.includes("4wd") || v.includes("awd")) return "4wd";
  if (v.includes("2x4") || v.includes("2wd")) return "2wd";
  return v;
}

function matchesSeats(cart: AnyCart, seats: string[]): boolean {
  const passengers = String(cart?.cartAttributes?.passengers ?? "").toLowerCase();
  if (!passengers) return false;
  const passengerCount = passengers.match(/\d+/)?.[0];

  return seats.some((seat) => {
    const wanted = seat.toLowerCase();
    if (wanted.includes("utility")) return passengers.includes("utility");
    const wantedCount = wanted.match(/\d+/)?.[0];
    return !!wantedCount && wantedCount === passengerCount;
  });
}

function cartSearchHaystack(cart: AnyCart): string {
  return [
    cart?.cartType?.make,
    cart?.cartType?.model,
    cart?.cartType?.year,
    cart?.cartAttributes?.cartColor,
    cart?.cartAttributes?.seatColor,
    cart?.vinNo,
    cart?.serialNo,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/**
 * Mirrors the filtering the DMS API applies server-side, so a statically hosted
 * build can filter the prebuilt snapshot in the browser and get the same result.
 */
export function matchesFilters(cart: AnyCart, filters: CartFilters): boolean {
  const isUsed = cart.isUsed === true;
  const isElectric = cart.isElectric === true;

  // Both boxes checked is the same as neither: it selects everything.
  if (filters.isNew && !filters.isUsed && isUsed) return false;
  if (filters.isUsed && !filters.isNew && !isUsed) return false;
  if (filters.isElectric && !filters.isGas && !isElectric) return false;
  if (filters.isGas && !filters.isElectric && isElectric) return false;

  if (filters.isStreetLegal && cart?.title?.isStreetLegal !== true) return false;
  if (filters.isLifted && cart?.cartAttributes?.isLifted !== true) return false;

  if (filters.makes?.length) {
    const make = cart?.cartType?.make;
    if (!make || !filters.makes.includes(normalizeMakeKey(make))) return false;
  }

  if (filters.models?.length) {
    const model = (cart?.cartType?.model || "").toLowerCase();
    if (!model) return false;
    const modelKey = normalizeMakeKey(model);
    const wanted = filters.models.map((m) => m.toLowerCase());
    if (!wanted.includes(model) && !wanted.map(normalizeMakeKey).includes(modelKey)) return false;
  }

  if (filters.colors?.length) {
    const color = (cart?.cartAttributes?.cartColor || "").toLowerCase();
    if (!color || !filters.colors.map((c) => c.toLowerCase()).includes(color)) return false;
  }

  if (filters.seats?.length && !matchesSeats(cart, filters.seats)) return false;

  if (filters.driveTrain?.length) {
    const driveTrain = cart?.cartAttributes?.driveTrain;
    if (!driveTrain) return false;
    const wanted = filters.driveTrain.map(normalizeDriveTrain);
    if (!wanted.includes(normalizeDriveTrain(driveTrain))) return false;
  }

  if (filters.storeIds?.length) {
    const storeId = cart?.cartLocation?.locationId || cart?.cartLocation?.latestStoreId;
    if (!storeId || !filters.storeIds.includes(storeId)) return false;
  }

  if (filters.searchText) {
    const needle = filters.searchText.toLowerCase().trim();
    if (needle && !cartSearchHaystack(cart).includes(needle)) return false;
  }

  return true;
}

export function filterCarts(carts: AnyCart[], filters: CartFilters): AnyCart[] {
  return carts.filter((cart) => matchesFilters(cart, filters));
}

/** Reads the filter set the inventory page encodes into the query string. */
export function parseCartFilters(params: URLSearchParams): CartFilters {
  const list = (key: string, transform: (v: string) => string): string[] | undefined => {
    const raw = params.get(key);
    if (!raw) return undefined;
    return raw.split(",").map(transform).filter(Boolean);
  };

  const filters: CartFilters = {};
  const searchText = params.get("searchText") || params.get("search");
  if (searchText) filters.searchText = searchText;

  const condition = params.get("condition")?.toLowerCase();
  if (params.get("isNew") === "true" || condition === "new") filters.isNew = true;
  if (params.get("isUsed") === "true" || condition === "used") filters.isUsed = true;
  if (params.get("isElectric") === "true") filters.isElectric = true;
  if (params.get("isGas") === "true") filters.isGas = true;
  if (params.get("isStreetLegal") === "true") filters.isStreetLegal = true;
  if (params.get("isLifted") === "true") filters.isLifted = true;

  const makes = params.get("makes") || params.get("make");
  if (makes) filters.makes = makes.split(",").map(normalizeMakeKey).filter(Boolean);

  const models = params.get("models") || params.get("model");
  if (models) filters.models = models.split(",").map((m) => m.toLowerCase()).filter(Boolean);

  const colors = params.get("colors") || params.get("color");
  if (colors) filters.colors = colors.split(",").map((c) => c.toLowerCase()).filter(Boolean);

  const seats = list("seats", (s) => s.toLowerCase());
  if (seats) filters.seats = seats;

  const driveTrain = list("driveTrain", (d) => d.toLowerCase());
  if (driveTrain) filters.driveTrain = driveTrain;

  const storeIds = list("storeIds", (s) => s);
  if (storeIds) filters.storeIds = storeIds;

  return filters;
}

export function parsePriceSort(params: URLSearchParams): boolean | undefined {
  const raw = params.get("priceSortASC");
  if (raw === null) return undefined;
  return raw === "true";
}

export function buildBrands(carts: AnyCart[]): BrandItem[] {
  const makeMap = new Map<string, string>();
  for (const cart of carts) {
    const make = cart?.cartType?.make;
    if (typeof make === "string" && make.trim()) {
      const key = normalizeMakeKey(make);
      if (!makeMap.has(key)) makeMap.set(key, make);
    }
  }
  return Array.from(makeMap.entries())
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Slugs are derived from make/model/color plus the cart's store city/state, with
 * a numeric suffix for collisions.
 *
 * A dealer stocks many identical carts, so collisions are the norm rather than
 * the exception and the suffix decides real URLs. Assignment therefore cannot
 * depend on the order the DMS happened to return carts in: if it did, a
 * reordered API response would hand "-01" to a different cart on the next
 * nightly rebuild and silently reshuffle live permalinks across the site and
 * the sitemap. Sorting by `_id` first makes the mapping a pure function of the
 * cart set, so a cart keeps its URL for as long as it is in inventory.
 */
export function buildSlugMap(carts: AnyCart[], stores: AnyStore[]): SlugMap {
  const storeMap = new Map<string, AnyStore>();
  for (const store of stores || []) {
    if (store?.storeId) storeMap.set(store.storeId, store);
  }

  const slugToId: Record<string, string> = {};
  const idToSlug: Record<string, string> = {};
  const slugCounts: Record<string, number> = {};

  const ordered = [...carts].sort((a, b) =>
    String(a?._id ?? "").localeCompare(String(b?._id ?? ""))
  );

  for (const cart of ordered) {
    const storeId = cart?.cartLocation?.locationId || cart?.cartLocation?.latestStoreId || "";
    const store = storeMap.get(storeId);

    const parts = [
      cart?.cartType?.make || "",
      cart?.cartType?.model || "",
      cart?.cartAttributes?.cartColor || "",
      store?.address?.city || "",
      store?.address?.state || "",
      store?.address?.country || "USA",
    ]
      .map(toSlugPart)
      .filter(Boolean);

    const baseSlug = parts.length > 0 ? parts.join("-") : `cart-${cart._id}`;

    let finalSlug: string;
    if (slugCounts[baseSlug] === undefined) {
      slugCounts[baseSlug] = 0;
      finalSlug = baseSlug;
    } else {
      slugCounts[baseSlug]++;
      finalSlug = `${baseSlug}-${String(slugCounts[baseSlug]).padStart(2, "0")}`;
    }

    slugToId[finalSlug] = cart._id;
    idToSlug[cart._id] = finalSlug;
  }

  return { slugToId, idToSlug };
}

export function buildCartName(cart: AnyCart): string {
  const parts = [
    cart?.cartType?.year,
    cart?.cartType?.make,
    cart?.cartType?.model,
    cart?.cartAttributes?.cartColor,
  ].filter(Boolean);
  return parts.join(" ") || "Golf Cart";
}

export function toCartSummaryForSeo(cart: AnyCart, slug: string): CartSummaryForSeo {
  const isUsed = cart.isUsed === true;
  return {
    slug,
    title: `${isUsed ? "Used" : "New"} ${buildCartName(cart)}`,
    price: (cart.retailPrice as number | null | undefined) ?? null,
    isUsed,
    isElectric: cart.isElectric === true,
    imageUrl: getPrimaryCartImage(cart),
  };
}

export function buildCartSeoMeta(cart: AnyCart, slug: string): CartSeoMeta {
  const make = (cart?.cartType?.make as string) || "";
  const model = (cart?.cartType?.model as string) || "";
  const color = (cart?.cartAttributes?.cartColor as string) || "";
  const year = (cart?.cartType?.year as string) || "";
  const isUsed = cart.isUsed === true;
  const isElectric = cart.isElectric === true;
  const price = cart.retailPrice as number | null | undefined;
  const vinNo = (cart.vinNo as string) || "";

  const cartName = buildCartName(cart);
  const conditionStr = isUsed ? "Used" : "New";
  const imageUrl = getPrimaryCartImage(cart);
  const url = `${SITE_URL}/golfcart/${slug}`;

  const title = `${conditionStr} ${cartName} Golf Cart for Sale | Alaska Golf Carts`;
  const description = `${conditionStr} ${cartName} golf cart for sale at Alaska Golf Carts.${
    price ? ` Priced at $${price.toLocaleString()}.` : ""
  } 0% APR financing available. Call 1-888-840-4490.`;

  const offersSchema: Record<string, unknown> = {
    "@type": "Offer",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url,
    seller: {
      "@type": "AutoDealer",
      name: "Alaska Golf Carts",
      url: SITE_URL,
      telephone: "1-888-840-4490",
    },
  };
  if (price) offersSchema.price = price;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: cartName,
    fuelType: isElectric ? "Electric" : "Gasoline",
    itemCondition: isUsed ? "https://schema.org/UsedCondition" : "https://schema.org/NewCondition",
    offers: offersSchema,
    url,
    description,
  };
  if (make) schema.brand = { "@type": "Brand", name: make };
  if (model) schema.model = model;
  if (year) schema.vehicleModelDate = year;
  if (color) schema.color = color;
  if (imageUrl) schema.image = imageUrl;
  if (vinNo) schema.vehicleIdentificationNumber = vinNo;

  return { title, description, schema, imageUrl };
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const SITEMAP_SEO_FILES = [
  "llms.txt",
  "ai.txt",
  "gpt.txt",
  "claude.txt",
  "training.txt",
  "schema.json",
  "seo.txt",
  "nlp.txt",
];

export function buildSitemapXml(carts: AnyCart[], slugMap: SlugMap, baseUrl: string = SITE_URL): string {
  const today = new Date().toISOString().split("T")[0];

  const cartById = new Map<string, AnyCart>();
  for (const cart of carts) {
    if (cart._id) cartById.set(cart._id, cart);
  }

  const makes = new Set<string>();
  const conditions = new Set<string>();
  for (const cart of carts) {
    const make = cart?.cartType?.make;
    if (make) makes.add(make);
    conditions.add(cart?.isUsed ? "used" : "new");
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n\n`;

  xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n\n`;
  xml += `  <url>\n    <loc>${baseUrl}/inventory</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n\n`;
  xml += `  <url>\n    <loc>${baseUrl}/financing</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n\n`;

  for (const make of Array.from(makes).sort()) {
    xml += `  <url>\n    <loc>${baseUrl}/inventory?make=${encodeURIComponent(make)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.85</priority>\n  </url>\n`;
  }
  xml += `\n`;

  // Only "condition" (new/used) and "make" are honored by the inventory page on
  // initial load, so those are the only filtered URLs advertised here.
  for (const condition of Array.from(conditions).sort()) {
    xml += `  <url>\n    <loc>${baseUrl}/inventory?condition=${encodeURIComponent(condition)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.85</priority>\n  </url>\n`;
  }
  xml += `\n`;

  for (const file of SITEMAP_SEO_FILES) {
    xml += `  <url>\n    <loc>${baseUrl}/${file}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.3</priority>\n  </url>\n`;
  }
  xml += `\n`;

  for (const [slug, cartId] of Object.entries(slugMap.slugToId)) {
    const cart = cartById.get(cartId);
    const titleParts = [
      cart?.isUsed ? "Used" : "New",
      cart?.cartType?.year,
      cart?.cartType?.make,
      cart?.cartType?.model,
    ].filter(Boolean);
    const cartTitle = titleParts.join(" ") || "Golf Cart";
    const color = cart?.cartAttributes?.cartColor || "";
    const images = cart ? getCartImageUrls(cart) : [];

    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/golfcart/${slug}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;

    for (let i = 0; i < Math.min(images.length, 10); i++) {
      const caption =
        i === 0
          ? `${cartTitle}${color ? ` in ${color}` : ""} - Alaska Golf Carts`
          : `${cartTitle} - Photo ${i + 1}`;
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(images[i])}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(cartTitle)}</image:title>\n`;
      xml += `      <image:caption>${escapeXml(caption)}</image:caption>\n`;
      xml += `    </image:image>\n`;
    }

    xml += `  </url>\n`;
  }

  xml += `\n</urlset>`;
  return xml;
}
