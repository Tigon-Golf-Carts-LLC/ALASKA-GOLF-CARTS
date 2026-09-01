/**
 * Serves the app's `/api/*` calls from the static inventory snapshot that
 * `scripts/build-data.ts` writes into `public/data/`.
 *
 * On a static host (GitHub Pages, Cloudflare Pages without Functions) there is
 * no Express proxy and the DMS API sends no CORS headers, so the browser can't
 * reach it. Filtering, sorting, and paging therefore run here against the
 * prebuilt catalogue, using the exact same helpers the server uses so results
 * match between `npm run dev` and a deployed build.
 */

import {
  buildBrands,
  filterCarts,
  parseCartFilters,
  parsePriceSort,
  sortCarts,
  type AnyCart,
  type AnyStore,
  type BrandItem,
  type SlugMap,
} from "@shared/cart-data";

export type DataMode = "static" | "proxy";

/**
 * "static" reads the prebuilt snapshot (the default, and what GitHub Pages
 * needs). "proxy" calls a live `/api/*` backend — the Express dev server or the
 * Cloudflare Pages Function.
 */
export const DATA_MODE: DataMode =
  (import.meta.env.VITE_DATA_MODE as DataMode | undefined) === "proxy" ? "proxy" : "static";

const DATA_BASE = `${import.meta.env.BASE_URL || "/"}data/`.replace(/\/{2,}/g, "/");

const inflight = new Map<string, Promise<unknown>>();

/** Snapshot files never change for the lifetime of a page load, so cache them. */
function loadJson<T>(name: string): Promise<T> {
  const existing = inflight.get(name);
  if (existing) return existing as Promise<T>;

  const promise = fetch(`${DATA_BASE}${name}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`${response.status}: could not load ${name}`);
      }
      return response.json() as Promise<T>;
    })
    .catch((error) => {
      inflight.delete(name);
      throw error;
    });

  inflight.set(name, promise);
  return promise;
}

const loadCarts = () => loadJson<AnyCart[]>("carts.json");
const loadStores = () => loadJson<AnyStore[]>("stores.json");
const loadSlugMap = () => loadJson<SlugMap>("slug-map.json");
const loadModels = () => loadJson<Record<string, any[]>>("models.json");
const loadColors = () => loadJson<Record<string, string[]>>("colors.json");

async function loadBrands(): Promise<BrandItem[]> {
  try {
    return await loadJson<BrandItem[]>("brands.json");
  } catch {
    // Older snapshots may predate brands.json — derive it from the catalogue.
    return buildBrands(await loadCarts());
  }
}

async function getCartById(cartId: string): Promise<AnyCart> {
  try {
    return await loadJson<AnyCart>(`carts/${encodeURIComponent(cartId)}.json`);
  } catch {
    const carts = await loadCarts();
    const cart = carts.find((c) => c._id === cartId);
    if (!cart) throw new Error(`404: cart ${cartId} not found`);
    return cart;
  }
}

async function getCartsPage(params: URLSearchParams) {
  const pageNumber = parseInt(params.get("pageNumber") || "0", 10) || 0;
  const pageSize = Math.min(parseInt(params.get("pageSize") || "20", 10) || 20, 100);

  const carts = await loadCarts();
  const sorted = sortCarts(filterCarts(carts, parseCartFilters(params)), parsePriceSort(params));

  const start = pageNumber * pageSize;
  return { carts: sorted.slice(start, start + pageSize), totalCarts: sorted.length };
}

function makeKeysFrom(body: unknown): string[] {
  const keys = (body as { makeKeys?: unknown })?.makeKeys;
  return Array.isArray(keys) ? keys.filter((k): k is string => typeof k === "string") : [];
}

/**
 * Resolves one `/api/...` request against the snapshot. Throws on an unknown
 * route or a missing record so callers see the same failure shape the HTTP
 * backend produces.
 */
export async function resolveStaticRequest(
  url: string,
  method: string = "GET",
  body?: unknown
): Promise<unknown> {
  const [rawPath, queryString = ""] = url.split("?");
  const pathname = rawPath.replace(/\/+$/, "") || "/";
  const params = new URLSearchParams(queryString);

  switch (pathname) {
    case "/api/stores":
      return loadStores();
    case "/api/brands":
      return loadBrands();
    case "/api/slug-map":
      return loadSlugMap();
    case "/api/carts":
      return getCartsPage(params);
    case "/api/cart-models": {
      const keys = makeKeysFrom(body);
      const models = await loadModels();
      return keys.flatMap((key) => models[key] || []);
    }
    case "/api/cart-colors": {
      const keys = makeKeysFrom(body);
      const colors = await loadColors();
      const unique = new Set(keys.flatMap((key) => colors[key] || []));
      return Array.from(unique).map((color) => ({ color }));
    }
    case "/api/featured-carts": {
      const carts = await loadCarts();
      return { carts: sortCarts(carts).slice(0, 12) };
    }
    default: {
      const cartMatch = pathname.match(/^\/api\/cart\/(.+)$/);
      if (cartMatch) return getCartById(decodeURIComponent(cartMatch[1]));
      throw new Error(`404: no static data for ${method} ${url}`);
    }
  }
}
