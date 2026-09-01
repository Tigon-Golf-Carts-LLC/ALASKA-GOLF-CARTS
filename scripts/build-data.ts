/**
 * Snapshots the DMS inventory into static JSON under `client/public/data/`.
 *
 * Static hosts (GitHub Pages) have no server to proxy the DMS API and the API
 * sends no CORS headers, so the browser can't call it directly. Instead the
 * whole catalogue is pulled once at build time and shipped as plain files; the
 * client filters, sorts, and pages that snapshot itself. A scheduled rebuild
 * keeps it in step with the nightly DMS refresh.
 *
 * The snapshot IS the deployed inventory, so a degenerate response is worse
 * than a failed one: a 200 carrying an empty list would publish a site with no
 * carts and an empty sitemap. Everything here therefore fails loudly rather
 * than writing a snapshot it cannot vouch for, which leaves the previous
 * deployment in place.
 *
 * Usage:
 *   tsx scripts/build-data.ts              # fetch from the DMS API
 *   tsx scripts/build-data.ts --offline    # write an empty snapshot (no network)
 *   tsx scripts/build-data.ts --allow-empty  # accept a genuinely empty catalogue
 */

import { mkdir, rm, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
  buildBrands,
  buildSlugMap,
  getCartImageUrls,
  hasOnlyUnpublishedPhotos,
  normalizeMakeKey,
  type AnyCart,
  type AnyStore,
} from "../shared/cart-data";

const DMS_BASE_URL = process.env.DMS_BASE_URL || "https://api.tigondms.com/wp-website";
const PAGE_SIZE = 500;
const MAX_PAGES = 20;
const MAX_ATTEMPTS = 4;

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = process.env.DATA_OUT_DIR
  ? path.resolve(process.env.DATA_OUT_DIR)
  : path.join(rootDir, "client", "public", "data");

const offline = process.argv.includes("--offline") || process.env.DMS_OFFLINE === "1";
const allowEmpty =
  offline ||
  process.argv.includes("--allow-empty") ||
  process.env.ALLOW_EMPTY_INVENTORY === "1";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchDMS(endpoint: string, body?: unknown): Promise<any> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(`${DMS_BASE_URL}${endpoint}`, {
        method: body ? "POST" : "GET",
        headers: body ? { "Content-Type": "application/json" } : {},
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(60_000),
      });
      if (!response.ok) {
        throw new Error(`DMS API ${endpoint} responded ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) {
        const delay = 2000 * 2 ** (attempt - 1);
        console.warn(`  retry ${attempt}/${MAX_ATTEMPTS - 1} for ${endpoint} in ${delay}ms`);
        await sleep(delay);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

/**
 * Walks every page of `/get-carts`.
 *
 * Guards against the two ways paging goes wrong in practice: a server that
 * ignores `pageNumber` and keeps returning page 0 (which would loop until
 * MAX_PAGES, duplicating everything), and a catalogue larger than MAX_PAGES can
 * hold (which would silently truncate the site).
 */
async function fetchAllCarts(): Promise<AnyCart[]> {
  const all: AnyCart[] = [];
  const seenIds = new Set<string>();
  let reportedTotal: number | null = null;
  let complete = false;

  for (let pageNumber = 0; pageNumber < MAX_PAGES; pageNumber++) {
    const data = await fetchDMS("/get-carts", { pageNumber, pageSize: PAGE_SIZE });

    if (!data || !Array.isArray(data.carts)) {
      throw new Error(
        `/get-carts returned no "carts" array on page ${pageNumber} — ` +
          `got ${JSON.stringify(data).slice(0, 200)}`
      );
    }

    const carts: AnyCart[] = data.carts;
    if (pageNumber === 0 && typeof data.totalCarts === "number") {
      reportedTotal = data.totalCarts;
    }

    let added = 0;
    for (const cart of carts) {
      const id = typeof cart?._id === "string" ? cart._id : null;
      if (!id) {
        console.warn("  skipping a cart with no _id — it has no detail page or slug");
        continue;
      }
      if (seenIds.has(id)) continue;
      seenIds.add(id);
      all.push(cart);
      added++;
    }

    console.log(`  page ${pageNumber}: ${carts.length} carts, ${added} new (${all.length} total)`);

    if (carts.length < PAGE_SIZE) {
      complete = true;
      break;
    }
    if (added === 0) {
      // A full page with nothing new means paging is not advancing.
      console.warn(`  page ${pageNumber} repeated earlier carts — treating the catalogue as complete`);
      complete = true;
      break;
    }
  }

  if (!complete) {
    throw new Error(
      `the catalogue is larger than ${MAX_PAGES * PAGE_SIZE} carts — raise MAX_PAGES, ` +
        `otherwise the deployed site would be missing inventory`
    );
  }

  if (reportedTotal !== null && all.length < reportedTotal) {
    console.warn(
      `  warning: the API reported ${reportedTotal} carts but ${all.length} were collected`
    );
  }

  return all;
}

async function writeJson(relativePath: string, value: unknown): Promise<void> {
  const target = path.join(outDir, relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, JSON.stringify(value));
}

/** Models and colors are keyed by make, and only the DMS knows the full lists. */
async function fetchMakeFacets(makeKeys: string[]): Promise<{
  models: Record<string, unknown[]>;
  colors: Record<string, string[]>;
}> {
  const models: Record<string, unknown[]> = {};
  const colors: Record<string, string[]> = {};

  for (const makeKey of makeKeys) {
    try {
      const modelList = await fetchDMS("/get-cart-models", { makeKeys: [makeKey] });
      models[makeKey] = Array.isArray(modelList) ? modelList : [];
    } catch (error) {
      console.warn(`  could not fetch models for ${makeKey}: ${(error as Error).message}`);
      models[makeKey] = [];
    }

    try {
      const colorList = await fetchDMS("/get-cart-colors", { makeKeys: [makeKey] });
      colors[makeKey] = Array.isArray(colorList)
        ? colorList.map((c: any) => c?.color).filter((c: unknown): c is string => typeof c === "string")
        : [];
    } catch (error) {
      console.warn(`  could not fetch colors for ${makeKey}: ${(error as Error).message}`);
      colors[makeKey] = [];
    }
  }

  return { models, colors };
}

/**
 * Rejects a snapshot that would deploy a broken site.
 *
 * Store addresses feed the cart slugs (make-model-color-city-state-country), so
 * losing the store list doesn't just drop location text — it silently rewrites
 * every cart URL in the site and the sitemap, orphaning everything already
 * indexed. That has to fail the build, not sail through.
 */
function validateSnapshot(carts: AnyCart[], stores: AnyStore[]): void {
  if (carts.length === 0) {
    if (!allowEmpty) {
      throw new Error(
        "the DMS API returned an empty catalogue. Deploying this would publish a site " +
          "with no inventory and an empty sitemap. Pass --allow-empty if the catalogue " +
          "really is empty."
      );
    }
    console.warn("warning: the catalogue is empty and --allow-empty was set");
    return;
  }

  if (stores.length === 0 && !allowEmpty) {
    throw new Error(
      "the DMS API returned no stores. Cart slugs are built from store city/state, so " +
        "every cart URL would change and every indexed URL would break. Refusing to " +
        "build; pass --allow-empty to override."
    );
  }

  const located = carts.filter(
    (cart) => cart?.cartLocation?.locationId || cart?.cartLocation?.latestStoreId
  ).length;
  if (located === 0 && stores.length > 0) {
    console.warn("warning: no cart references a store — slugs will omit city and state");
  }

  // A cart pointing at an unknown store still gets a unique slug, but without
  // city/state in it — worth naming so the gap can be chased upstream.
  const storeIds = new Set(stores.map((store) => store?.storeId).filter(Boolean));
  const unmatched = new Map<string, number>();
  for (const cart of carts) {
    const id = cart?.cartLocation?.locationId || cart?.cartLocation?.latestStoreId;
    if (id && !storeIds.has(id)) unmatched.set(id, (unmatched.get(id) ?? 0) + 1);
  }
  if (unmatched.size > 0) {
    const total = Array.from(unmatched.values()).reduce((sum, n) => sum + n, 0);
    const detail = Array.from(unmatched.entries()).map(([id, n]) => `${id} (${n})`).join(", ");
    console.warn(
      `warning: ${total} cart(s) reference a store missing from /tigon-stores — ` +
        `their slugs omit city and state. Store IDs: ${detail}`
    );
  }
}

/**
 * Reports how much of the catalogue has a photo the site can actually show.
 *
 * Only `imageUrls` is publicly hosted, so a cart pictured solely by in-house
 * photos renders a placeholder even though pictures of it exist in the DMS.
 * That gap is fixable by publishing them to the website image set, so it is
 * counted separately from carts that have no photos at all.
 */
function reportImageCoverage(carts: AnyCart[]): void {
  const describe = (label: string, subset: AnyCart[]): number => {
    if (subset.length === 0) return 0;
    const withPhotos = subset.filter((cart) => getCartImageUrls(cart).length > 0);
    const unpublished = subset.filter(hasOnlyUnpublishedPhotos).length;
    const photos = withPhotos.reduce((sum, cart) => sum + getCartImageUrls(cart).length, 0);
    const pct = Math.round((withPhotos.length / subset.length) * 100);
    console.log(
      `  ${label}: ${withPhotos.length}/${subset.length} carts show a photo (${pct}%), ` +
        `${photos} images, ${unpublished} have photos that were never published`
    );
    return unpublished;
  };

  console.log("image coverage (photos published to the website):");
  const unpublishedNew = describe("new ", carts.filter((cart) => cart.isUsed !== true));
  const unpublishedUsed = describe("used", carts.filter((cart) => cart.isUsed === true));

  const total = unpublishedNew + unpublishedUsed;
  if (total > 0) {
    console.log(
      `  ${total} cart(s) (${unpublishedNew} new, ${unpublishedUsed} used) have in-house photos ` +
        `in the DMS that are not in the website image set — publishing those there is what ` +
        `puts them on the site.`
    );
  }
}

async function main(): Promise<void> {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  let carts: AnyCart[] = [];
  let stores: AnyStore[] = [];
  let models: Record<string, unknown[]> = {};
  let colors: Record<string, string[]> = {};

  if (offline) {
    console.log("offline mode — writing an empty inventory snapshot");
  } else {
    console.log(`fetching inventory from ${DMS_BASE_URL}`);
    carts = await fetchAllCarts();

    const storeData = await fetchDMS("/tigon-stores");
    if (!Array.isArray(storeData)) {
      throw new Error(
        `/tigon-stores did not return an array — got ${JSON.stringify(storeData).slice(0, 200)}`
      );
    }
    stores = storeData;
    console.log(`fetched ${carts.length} carts and ${stores.length} stores`);

    validateSnapshot(carts, stores);
    reportImageCoverage(carts);

    const makeKeys = Array.from(
      new Set(
        carts
          .map((cart) => cart?.cartType?.make)
          .filter((make: unknown): make is string => typeof make === "string" && !!make.trim())
          .map(normalizeMakeKey)
      )
    ).sort();
    console.log(`fetching models and colors for ${makeKeys.length} makes`);
    ({ models, colors } = await fetchMakeFacets(makeKeys));
  }

  const slugMap = buildSlugMap(carts, stores);
  const brands = buildBrands(carts);

  const slugCount = Object.keys(slugMap.slugToId).length;
  if (slugCount !== carts.length) {
    throw new Error(
      `built ${slugCount} slugs for ${carts.length} carts — every cart needs a unique URL`
    );
  }

  await writeJson("carts.json", carts);
  await writeJson("stores.json", stores);
  await writeJson("brands.json", brands);
  await writeJson("slug-map.json", slugMap);
  await writeJson("models.json", models);
  await writeJson("colors.json", colors);
  await writeJson("meta.json", {
    generatedAt: new Date().toISOString(),
    totalCarts: carts.length,
    totalStores: stores.length,
    offline,
  });

  // One file per cart so a detail page doesn't have to download the catalogue.
  for (const cart of carts) {
    if (cart?._id) await writeJson(path.join("carts", `${cart._id}.json`), cart);
  }

  console.log(`wrote inventory snapshot to ${path.relative(rootDir, outDir)}`);
}

main().catch((error) => {
  console.error("failed to build the inventory snapshot:", error);
  console.error(
    "The DMS API must be reachable at build time. Re-run when it is available, " +
      "or pass --offline to produce an empty snapshot."
  );
  process.exit(1);
});
