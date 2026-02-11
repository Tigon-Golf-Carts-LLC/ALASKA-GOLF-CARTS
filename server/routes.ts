import type { Express } from "express";
import { createServer, type Server } from "http";

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

function getMsUntilRefresh(): number {
  return Math.max(getNextRefreshTime() - Date.now(), 60_000);
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

async function fetchDMS(endpoint: string, body?: any): Promise<any> {
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

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/stores", async (_req, res) => {
    try {
      const cached = getCached("stores");
      if (cached) {
        return res.json(cached);
      }
      const data = await fetchDMS("/tigon-stores");
      setCache("stores", data);
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching stores:", error.message);
      res.status(500).json({ error: "Failed to fetch stores" });
    }
  });

  function sortCarts(carts: any[], priceSortASC?: boolean): any[] {
    return [...carts].sort((a: any, b: any) => {
      const aIsNew = a.isUsed !== true;
      const bIsNew = b.isUsed !== true;
      const aHasImages = a.imageUrls && a.imageUrls.length > 0;
      const bHasImages = b.imageUrls && b.imageUrls.length > 0;

      const aScore = (aIsNew && aHasImages ? 4 : 0)
        + (aIsNew && !aHasImages ? 3 : 0)
        + (!aIsNew && aHasImages ? 2 : 0)
        + (!aIsNew && !aHasImages ? 1 : 0);
      const bScore = (bIsNew && bHasImages ? 4 : 0)
        + (bIsNew && !bHasImages ? 3 : 0)
        + (!bIsNew && bHasImages ? 2 : 0)
        + (!bIsNew && !bHasImages ? 1 : 0);

      if (aScore !== bScore) return bScore - aScore;

      if (priceSortASC === true) {
        return (a.retailPrice || 999999) - (b.retailPrice || 999999);
      } else if (priceSortASC === false) {
        return (b.retailPrice || 0) - (a.retailPrice || 0);
      }

      return 0;
    });
  }

  async function fetchAllCarts(filters: any): Promise<any[]> {
    const filterKey = JSON.stringify(filters);
    const cacheKey = `allCarts:${filterKey}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const body: any = { ...filters, pageNumber: 0, pageSize: 500 };
    const data = await fetchDMS("/get-carts", body);
    const allCarts = data?.carts || [];
    setCache(cacheKey, allCarts);
    return allCarts;
  }

  app.get("/api/carts", async (req, res) => {
    try {
      const pageNumber = parseInt(req.query.pageNumber as string) || 0;
      const pageSize = Math.min(parseInt(req.query.pageSize as string) || 20, 100);

      const filters: any = {};
      if (req.query.searchText) filters.searchText = req.query.searchText;
      if (req.query.isNew === "true") filters.isNew = true;
      if (req.query.isUsed === "true") filters.isUsed = true;
      if (req.query.isElectric === "true") filters.isElectric = true;
      if (req.query.isGas === "true") filters.isGas = true;
      if (req.query.isStreetLegal === "true") filters.isStreetLegal = true;
      if (req.query.isLifted === "true") filters.isLifted = true;
      if (req.query.makes) filters.makes = (req.query.makes as string).split(",").map((m) => m.toLowerCase().replace(/[^a-z0-9]/g, "_"));
      if (req.query.models) filters.models = (req.query.models as string).split(",").map((m) => m.toLowerCase());
      if (req.query.colors) filters.colors = (req.query.colors as string).split(",").map((c) => c.toLowerCase());
      if (req.query.seats) filters.seats = (req.query.seats as string).split(",").map((s) => s.toLowerCase());
      if (req.query.driveTrain) filters.driveTrain = (req.query.driveTrain as string).split(",").map((d) => d.toLowerCase());
      if (req.query.storeIds) filters.storeIds = (req.query.storeIds as string).split(",");

      const priceSortASC = req.query.priceSortASC !== undefined ? req.query.priceSortASC === "true" : undefined;

      const cacheKey = `sortedCarts:${JSON.stringify(filters)}:${priceSortASC}:${pageNumber}:${pageSize}`;
      const cached = getCached(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const allCarts = await fetchAllCarts(filters);
      const sorted = sortCarts(allCarts, priceSortASC);

      const start = pageNumber * pageSize;
      const paged = sorted.slice(start, start + pageSize);

      const result = { carts: paged, totalCarts: sorted.length };
      setCache(cacheKey, result);
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching carts:", error.message);
      res.status(500).json({ error: "Failed to fetch carts" });
    }
  });

  app.get("/api/cart/:id", async (req, res) => {
    try {
      const cartId = req.params.id;
      const cacheKey = `cart:${cartId}`;
      const cached = getCached(cacheKey);
      if (cached) {
        return res.json(cached);
      }

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

      const cacheKey = `models:${makeKeys.sort().join(",")}`;
      const cached = getCached(cacheKey);
      if (cached) {
        return res.json(cached);
      }

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

      const cacheKey = `colors:${makeKeys.sort().join(",")}`;
      const cached = getCached(cacheKey);
      if (cached) {
        return res.json(cached);
      }

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
      const cached = getCached("brands");
      if (cached) {
        return res.json(cached);
      }

      const data = await fetchDMS("/get-carts", { pageNumber: 0, pageSize: 500 });
      const carts = data?.carts || [];
      const makeMap = new Map<string, string>();
      for (const cart of carts) {
        const make = cart?.cartType?.make;
        if (make && typeof make === "string" && make.trim()) {
          const key = make.toLowerCase().replace(/[^a-z0-9]/g, "_");
          if (!makeMap.has(key)) {
            makeMap.set(key, make);
          }
        }
      }
      const brands = Array.from(makeMap.entries())
        .map(([key, label]) => ({ key, label }))
        .sort((a, b) => a.label.localeCompare(b.label));

      setCache("brands", brands);
      res.json(brands);
    } catch (error: any) {
      console.error("Error fetching brands:", error.message);
      res.status(500).json({ error: "Failed to fetch brands" });
    }
  });

  app.get("/api/slug-map", async (_req, res) => {
    try {
      const result = await getSlugMap();
      res.json(result);
    } catch (error: any) {
      console.error("Error building slug map:", error.message);
      res.status(500).json({ error: "Failed to build slug map" });
    }
  });

  async function getSlugMap(): Promise<{ slugToId: Record<string, string>; idToSlug: Record<string, string> }> {
    const cached = getCached("slugMap");
    if (cached) return cached;

    const [cartsData, storesData] = await Promise.all([
      fetchDMS("/get-carts", { pageNumber: 0, pageSize: 500 }),
      fetchDMS("/tigon-stores"),
    ]);

    const carts = cartsData?.carts || [];
    const stores: any[] = storesData || [];
    const storeMap = new Map<string, any>();
    for (const store of stores) {
      if (store.storeId) storeMap.set(store.storeId, store);
    }

    const toSlugPart = (str: string): string => {
      return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    };

    const slugToId: Record<string, string> = {};
    const idToSlug: Record<string, string> = {};
    const slugCounts: Record<string, number> = {};

    for (const cart of carts) {
      const make = cart?.cartType?.make || "";
      const model = cart?.cartType?.model || "";
      const color = cart?.cartAttributes?.cartColor || "";
      const storeId = cart?.cartLocation?.locationId || cart?.cartLocation?.latestStoreId || "";
      const store = storeMap.get(storeId);
      const city = store?.address?.city || "";
      const state = store?.address?.state || "";
      const country = store?.address?.country || "USA";

      const parts = [make, model, color, city, state, country]
        .map(toSlugPart)
        .filter(Boolean);

      const baseSlug = parts.length > 0 ? parts.join("-") : `cart-${cart._id}`;

      let finalSlug: string;
      if (slugCounts[baseSlug] === undefined) {
        slugCounts[baseSlug] = 0;
        finalSlug = baseSlug;
      } else {
        slugCounts[baseSlug]++;
        const modifier = String(slugCounts[baseSlug]).padStart(2, "0");
        finalSlug = `${baseSlug}-${modifier}`;
      }

      slugToId[finalSlug] = cart._id;
      idToSlug[cart._id] = finalSlug;
    }

    const result = { slugToId, idToSlug };
    setCache("slugMap", result);
    return result;
  }

  app.get("/sitemap.xml", async (req, res) => {
    try {
      const slugMap = await getSlugMap();
      const baseUrl = "https://discountedgolfcart.com";
      const today = new Date().toISOString().split("T")[0];
      const slugs = Object.keys(slugMap.slugToId);

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
      xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

      xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
      xml += `  <url>\n    <loc>${baseUrl}/inventory</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
      xml += `  <url>\n    <loc>${baseUrl}/financing</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;

      for (const slug of slugs) {
        xml += `  <url>\n    <loc>${baseUrl}/golfcart/${slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
      }

      xml += `</urlset>`;

      res.set("Content-Type", "application/xml; charset=utf-8");
      res.send(xml);
    } catch (error: any) {
      console.error("Error generating sitemap:", error.message);
      res.status(500).send("Failed to generate sitemap");
    }
  });

  app.post("/api/featured-carts", async (req, res) => {
    try {
      const key = req.body.key || "national";
      const cacheKey = `featured:${key}`;
      const cached = getCached(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const data = await fetchDMS("/get-featured-carts", { key });
      setCache(cacheKey, data);
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching featured carts:", error.message);
      res.status(500).json({ error: "Failed to fetch featured carts" });
    }
  });

  return httpServer;
}
