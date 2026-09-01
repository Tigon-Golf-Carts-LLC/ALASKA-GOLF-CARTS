/**
 * Cloudflare Pages Function: a live `/api/*` proxy to the Tigon DMS API.
 *
 * This is optional. The site is fully static by default — it reads the snapshot
 * that `scripts/build-data.ts` bakes in — and that is what GitHub Pages serves.
 * Deploying to Cloudflare Pages *with* this function and building the client
 * with `VITE_DATA_MODE=proxy` swaps the snapshot for live inventory instead.
 *
 * The DMS API sends no CORS headers, so the browser can't call it directly; the
 * request has to be relayed server-side, which is what this does.
 */

import {
  buildBrands,
  buildSlugMap,
  filterCarts,
  isListable,
  parseCartFilters,
  parsePriceSort,
  sortCarts,
  type AnyCart,
  type AnyStore,
  type SlugMap,
} from "../../shared/cart-data";

const DMS_BASE_URL = "https://api.tigondms.com/wp-website";
const PAGE_SIZE = 500;
const MAX_PAGES = 20;

/** Seconds a response stays fresh in Cloudflare's edge cache and the browser. */
const CACHE_SECONDS = 1800;

interface PagesContext {
  request: Request;
  /** Falls through to the next handler, ultimately the static asset. */
  next: () => Promise<Response>;
}

/**
 * Per-isolate memo. Cloudflare recycles isolates freely, so this is a bonus,
 * not a guarantee — the Cache-Control headers below do the real work.
 */
const memo = new Map<string, { value: unknown; expires: number }>();

async function memoized<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = memo.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as T;
  const value = await load();
  memo.set(key, { value, expires: Date.now() + CACHE_SECONDS * 1000 });
  return value;
}

async function fetchDMS(endpoint: string, body?: unknown): Promise<any> {
  const response = await fetch(`${DMS_BASE_URL}${endpoint}`, {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    throw new Error(`DMS API ${endpoint} responded ${response.status}`);
  }
  return response.json();
}

function getAllCarts(): Promise<AnyCart[]> {
  return memoized("carts", async () => {
    const all: AnyCart[] = [];
    for (let pageNumber = 0; pageNumber < MAX_PAGES; pageNumber++) {
      const data = await fetchDMS("/get-carts", { pageNumber, pageSize: PAGE_SIZE });
      const carts: AnyCart[] = data?.carts || [];
      all.push(...carts);
      if (carts.length < PAGE_SIZE) break;
    }
    // Same rule as the static build: no unlisted or photo-less carts.
    return all.filter(isListable);
  });
}

function getStores(): Promise<AnyStore[]> {
  return memoized("stores", async () => (await fetchDMS("/tigon-stores")) || []);
}

async function getSlugMap(): Promise<SlugMap> {
  const [carts, stores] = await Promise.all([getAllCarts(), getStores()]);
  return memoized("slugMap", async () => buildSlugMap(carts, stores));
}

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}`,
    },
  });
}

async function readBody(request: Request): Promise<any> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function makeKeysFrom(body: any): string[] {
  return Array.isArray(body?.makeKeys)
    ? body.makeKeys.filter((k: unknown): k is string => typeof k === "string")
    : [];
}

export const onRequest = async (context: PagesContext): Promise<Response> => {
  const { request } = context;
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";

  try {
    switch (pathname) {
      case "/api/stores":
        return json(await getStores());

      case "/api/brands":
        return json(buildBrands(await getAllCarts()));

      case "/api/slug-map":
        return json(await getSlugMap());

      case "/api/carts": {
        const params = url.searchParams;
        const pageNumber = parseInt(params.get("pageNumber") || "0", 10) || 0;
        const pageSize = Math.min(parseInt(params.get("pageSize") || "20", 10) || 20, 100);
        const sorted = sortCarts(
          filterCarts(await getAllCarts(), parseCartFilters(params)),
          parsePriceSort(params)
        );
        const start = pageNumber * pageSize;
        return json({ carts: sorted.slice(start, start + pageSize), totalCarts: sorted.length });
      }

      case "/api/cart-models": {
        const makeKeys = makeKeysFrom(await readBody(request));
        if (!makeKeys.length) return json({ error: "makeKeys array required" }, 400);
        return json(await fetchDMS("/get-cart-models", { makeKeys }));
      }

      case "/api/cart-colors": {
        const makeKeys = makeKeysFrom(await readBody(request));
        if (!makeKeys.length) return json({ error: "makeKeys array required" }, 400);
        return json(await fetchDMS("/get-cart-colors", { makeKeys }));
      }

      case "/api/featured-carts": {
        const key = (await readBody(request))?.key || "national";
        return json(await fetchDMS("/get-featured-carts", { key }));
      }

      default: {
        const cartMatch = pathname.match(/^\/api\/cart\/(.+)$/);
        if (cartMatch) {
          const cartId = decodeURIComponent(cartMatch[1]);
          const cart = (await getAllCarts()).find((c) => c._id === cartId);
          if (cart) return json(cart);
          return json(await fetchDMS("/get-cart-by-id", { cartId }));
        }
        // Not an API route we own (e.g. the static /api/site-info.json) — let
        // the static asset handler answer it.
        return context.next();
      }
    }
  } catch (error) {
    console.error(`api error on ${pathname}:`, error);
    return json({ error: "Upstream inventory request failed" }, 502);
  }
};
