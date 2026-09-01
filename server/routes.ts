import type { Express } from "express";
import { type Server } from "http";
import {
  buildBrands,
  buildCartSeoMeta,
  buildSitemapXml,
  buildSlugMap,
  filterCarts,
  isListable,
  parseCartFilters,
  parsePriceSort,
  sortCarts,
  toCartSummaryForSeo,
  type AnyCart,
  type AnyStore,
  type CartSummaryForSeo,
  type SlugMap,
} from "../shared/cart-data";
import type { SeoDeps } from "../shared/seo-inject";

const DMS_BASE_URL = "https://api.tigondms.com/wp-website";

const cache = new Map<string, { data: any; expiry: number }>();

function getNextRefreshTime(): number {
  const now = new Date();
  const etFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });
  const parts = etFormatter.formatToParts(now);
  const etHour = parseInt(parts.find(p => p.type === "hour")?.value || "0");
  const etMinute = parseInt(parts.find(p => p.type === "minute")?.value || "0");

  const etDateFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const dateParts = etDateFormatter.formatToParts(now);
  const etYear = parseInt(dateParts.find(p => p.type === "year")?.value || "2025");
  const etMonth = parseInt(dateParts.find(p => p.type === "month")?.value || "1") - 1;
  const etDay = parseInt(dateParts.find(p => p.type === "day")?.value || "1");

  const pastToday = etHour > 22 || (etHour === 22 && etMinute >= 55);

  const dayToUse = pastToday ? etDay + 1 : etDay;

  const targetET = new Date(
    Date.UTC(etYear, etMonth, dayToUse, 22 + 5, 55, 0, 0)
  );

  const testFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });
  const testParts = testFormatter.formatToParts(targetET);
  const actualHour = parseInt(testParts.find(p => p.type === "hour")?.value || "0");

  if (actualHour !== 22) {
    const diff = (22 - actualHour) * 3600000;
    targetET.setTime(targetET.getTime() + diff);
  }

  if (targetET.getTime() <= now.getTime()) {
    targetET.setTime(targetET.getTime() + 86400000);
  }

  return targetET.getTime();
}

function getCached(key: string): any | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiry) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, expiry: getNextRefreshTime() });
}

export async function fetchDMS(endpoint: string, body?: any): Promise<any> {
  const url = `${DMS_BASE_URL}${endpoint}`;
  const options: RequestInit = {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  };

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`DMS API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/**
 * Pulls every page of the DMS inventory. The whole catalogue is small enough to
 * hold in memory, and holding it lets filtering, sorting, and slugging run
 * through the same shared code the static build uses.
 */
export async function fetchAllCartsFromDMS(): Promise<AnyCart[]> {
  const pageSize = 500;
  let allCarts: AnyCart[] = [];
  let pageNumber = 0;

  while (true) {
    const data = await fetchDMS("/get-carts", { pageNumber, pageSize });
    const carts = data?.carts || [];
    allCarts = allCarts.concat(carts);
    if (carts.length < pageSize) break;
    pageNumber++;
    if (pageNumber > 10) break;
  }

  return allCarts;
}

async function getAllCarts(): Promise<AnyCart[]> {
  const cached = getCached("allCarts");
  if (cached) return cached;
  // Carts held back by the DMS or without a published photo never reach the
  // site, the same rule the static build applies.
  const carts = (await fetchAllCartsFromDMS()).filter(isListable);
  setCache("allCarts", carts);
  return carts;
}

async function getStores(): Promise<AnyStore[]> {
  const cached = getCached("stores");
  if (cached) return cached;
  const stores = (await fetchDMS("/tigon-stores")) || [];
  setCache("stores", stores);
  return stores;
}

async function getSlugMap(): Promise<SlugMap> {
  const cached = getCached("slugMap");
  if (cached) return cached;
  const [carts, stores] = await Promise.all([getAllCarts(), getStores()]);
  const slugMap = buildSlugMap(carts, stores);
  setCache("slugMap", slugMap);
  return slugMap;
}

function queryToParams(url: string): URLSearchParams {
  const qIndex = url.indexOf("?");
  return new URLSearchParams(qIndex >= 0 ? url.slice(qIndex + 1) : "");
}

export const getCartMetaForSeo: SeoDeps["getCartMetaForSeo"] = async (slug) => {
  try {
    const slugMap = await getSlugMap();
    const cartId = slugMap.slugToId[slug];
    if (!cartId) return null;
    const carts = await getAllCarts();
    const cart = carts.find((c) => c._id === cartId);
    if (!cart) return null;
    return buildCartSeoMeta(cart, slug);
  } catch {
    return null;
  }
};

export const getHomeSnapshotForSeo: SeoDeps["getHomeSnapshotForSeo"] = async () => {
  try {
    const [carts, slugMap] = await Promise.all([getAllCarts(), getSlugMap()]);
    const withSlug = sortCarts(carts)
      .map((cart) => ({ cart, slug: slugMap.idToSlug[cart._id] }))
      .filter((entry) => !!entry.slug);

    const pick = (used: boolean): CartSummaryForSeo[] =>
      withSlug
        .filter((entry) => (entry.cart.isUsed === true) === used)
        .slice(0, 8)
        .map((entry) => toCartSummaryForSeo(entry.cart, entry.slug));

    return { newCarts: pick(false), usedCarts: pick(true), totalCarts: carts.length };
  } catch {
    return { newCarts: [], usedCarts: [], totalCarts: 0 };
  }
};

export const getInventorySnapshotForSeo: SeoDeps["getInventorySnapshotForSeo"] = async (url) => {
  try {
    const params = queryToParams(url);
    const [allCarts, slugMap] = await Promise.all([getAllCarts(), getSlugMap()]);
    const sorted = sortCarts(filterCarts(allCarts, parseCartFilters(params)), parsePriceSort(params));
    const carts = sorted
      .map((cart) => ({ cart, slug: slugMap.idToSlug[cart._id] }))
      .filter((entry) => !!entry.slug)
      .slice(0, 24)
      .map((entry) => toCartSummaryForSeo(entry.cart, entry.slug));
    return { carts, totalCarts: sorted.length };
  } catch {
    return { carts: [], totalCarts: 0 };
  }
};

export const isValidCartSlugForSeo: SeoDeps["isValidCartSlugForSeo"] = async (slug) => {
  try {
    const slugMap = await getSlugMap();
    return !!slugMap.slugToId[slug];
  } catch {
    return false;
  }
};

export const seoDeps: SeoDeps = {
  getCartMetaForSeo,
  getHomeSnapshotForSeo,
  getInventorySnapshotForSeo,
  isValidCartSlugForSeo,
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/stores", async (_req, res) => {
    try {
      res.json(await getStores());
    } catch (error: any) {
      console.error("Error fetching stores:", error.message);
      res.status(500).json({ error: "Failed to fetch stores" });
    }
  });

  app.get("/api/carts", async (req, res) => {
    try {
      const pageNumber = parseInt(req.query.pageNumber as string) || 0;
      const pageSize = Math.min(parseInt(req.query.pageSize as string) || 20, 100);
      const params = queryToParams(req.originalUrl);

      const allCarts = await getAllCarts();
      const sorted = sortCarts(filterCarts(allCarts, parseCartFilters(params)), parsePriceSort(params));

      const start = pageNumber * pageSize;
      res.json({ carts: sorted.slice(start, start + pageSize), totalCarts: sorted.length });
    } catch (error: any) {
      console.error("Error fetching carts:", error.message);
      res.status(500).json({ error: "Failed to fetch carts" });
    }
  });

  app.get("/api/cart/:id", async (req, res) => {
    try {
      const cartId = req.params.id;
      const carts = await getAllCarts();
      const cart = carts.find((c) => c._id === cartId);
      if (cart) return res.json(cart);

      // Not in the cached catalogue (brand new listing, or an ID from an older
      // snapshot) — ask the DMS directly before giving up.
      const cacheKey = `cart:${cartId}`;
      const cached = getCached(cacheKey);
      if (cached) return res.json(cached);
      const data = await fetchDMS("/get-cart-by-id", { cartId });
      setCache(cacheKey, data);
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching cart:", error.message);
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart-models", async (req, res) => {
    try {
      const { makeKeys } = req.body;
      if (!makeKeys || !Array.isArray(makeKeys)) {
        return res.status(400).json({ error: "makeKeys array required" });
      }

      const cacheKey = `models:${[...makeKeys].sort().join(",")}`;
      const cached = getCached(cacheKey);
      if (cached) return res.json(cached);

      const data = await fetchDMS("/get-cart-models", { makeKeys });
      setCache(cacheKey, data);
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching cart models:", error.message);
      res.status(500).json({ error: "Failed to fetch cart models" });
    }
  });

  app.post("/api/cart-colors", async (req, res) => {
    try {
      const { makeKeys } = req.body;
      if (!makeKeys || !Array.isArray(makeKeys)) {
        return res.status(400).json({ error: "makeKeys array required" });
      }

      const cacheKey = `colors:${[...makeKeys].sort().join(",")}`;
      const cached = getCached(cacheKey);
      if (cached) return res.json(cached);

      const data = await fetchDMS("/get-cart-colors", { makeKeys });
      setCache(cacheKey, data);
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching cart colors:", error.message);
      res.status(500).json({ error: "Failed to fetch cart colors" });
    }
  });

  app.get("/api/brands", async (_req, res) => {
    try {
      res.json(buildBrands(await getAllCarts()));
    } catch (error: any) {
      console.error("Error fetching brands:", error.message);
      res.status(500).json({ error: "Failed to fetch brands" });
    }
  });

  app.get("/api/slug-map", async (_req, res) => {
    try {
      res.json(await getSlugMap());
    } catch (error: any) {
      console.error("Error building slug map:", error.message);
      res.status(500).json({ error: "Failed to build slug map" });
    }
  });

  app.post("/api/featured-carts", async (req, res) => {
    try {
      const key = req.body.key || "national";
      const cacheKey = `featured:${key}`;
      const cached = getCached(cacheKey);
      if (cached) return res.json(cached);

      const data = await fetchDMS("/get-featured-carts", { key });
      setCache(cacheKey, data);
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching featured carts:", error.message);
      res.status(500).json({ error: "Failed to fetch featured carts" });
    }
  });

  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const cached = getCached("sitemapXml");
      if (cached) {
        res.set("Content-Type", "application/xml; charset=utf-8");
        return res.send(cached);
      }

      const [carts, slugMap] = await Promise.all([getAllCarts(), getSlugMap()]);
      const xml = buildSitemapXml(carts, slugMap);

      setCache("sitemapXml", xml);
      res.set("Content-Type", "application/xml; charset=utf-8");
      res.send(xml);
    } catch (error: any) {
      console.error("Error generating sitemap:", error.message);
      res.status(500).send("Failed to generate sitemap");
    }
  });

  return httpServer;
}
