import type { Express } from "express";
import { createServer, type Server } from "http";

const DMS_BASE_URL = "https://api.tigondms.com/wp-website";

const cache = new Map<string, { data: any; expiry: number }>();

function getCached(key: string): any | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiry) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any, ttlMs: number) {
  cache.set(key, { data, expiry: Date.now() + ttlMs });
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
      setCache("stores", data, 3600_000);
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching stores:", error.message);
      res.status(500).json({ error: "Failed to fetch stores" });
    }
  });

  app.get("/api/carts", async (req, res) => {
    try {
      const body: any = {};

      const pageNumber = parseInt(req.query.pageNumber as string) || 0;
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      body.pageNumber = pageNumber;
      body.pageSize = Math.min(pageSize, 100);

      if (req.query.searchText) body.searchText = req.query.searchText;
      if (req.query.priceSortASC !== undefined) body.priceSortASC = req.query.priceSortASC === "true";
      if (req.query.isNew === "true") body.isNew = true;
      if (req.query.isUsed === "true") body.isUsed = true;
      if (req.query.isElectric === "true") body.isElectric = true;
      if (req.query.isGas === "true") body.isGas = true;
      if (req.query.isStreetLegal === "true") body.isStreetLegal = true;
      if (req.query.isLifted === "true") body.isLifted = true;

      if (req.query.makes) body.makes = (req.query.makes as string).split(",").map((m) => m.toLowerCase().replace(/[^a-z0-9]/g, "_"));
      if (req.query.models) body.models = (req.query.models as string).split(",").map((m) => m.toLowerCase());
      if (req.query.colors) body.colors = (req.query.colors as string).split(",").map((c) => c.toLowerCase());
      if (req.query.seats) body.seats = (req.query.seats as string).split(",").map((s) => s.toLowerCase());
      if (req.query.driveTrain) body.driveTrain = (req.query.driveTrain as string).split(",").map((d) => d.toLowerCase());
      if (req.query.storeIds) body.storeIds = (req.query.storeIds as string).split(",");

      const cacheKey = `carts:${JSON.stringify(body)}`;
      const cached = getCached(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const data = await fetchDMS("/get-carts", body);
      setCache(cacheKey, data, 120_000);
      res.json(data);
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
      setCache(cacheKey, data, 300_000);
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
      setCache(cacheKey, data, 600_000);
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
      setCache(cacheKey, data, 600_000);
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

      setCache("brands", brands, 600_000);
      res.json(brands);
    } catch (error: any) {
      console.error("Error fetching brands:", error.message);
      res.status(500).json({ error: "Failed to fetch brands" });
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
      setCache(cacheKey, data, 300_000);
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching featured carts:", error.message);
      res.status(500).json({ error: "Failed to fetch featured carts" });
    }
  });

  return httpServer;
}
