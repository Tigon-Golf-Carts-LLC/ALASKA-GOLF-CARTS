/**
 * Snapshots the DMS inventory into static JSON under `client/public/data/`.
 *
 * Static hosts (GitHub Pages) have no server to proxy the DMS API and the API
 * sends no CORS headers, so the browser can't call it directly. Instead the
 * whole catalogue is pulled once at build time and shipped as plain files; the
 * client filters, sorts, and pages that snapshot itself. A scheduled rebuild
 * keeps it in step with the nightly DMS refresh.
 *
 * Usage:
 *   tsx scripts/build-data.ts            # fetch from the DMS API
 *   tsx scripts/build-data.ts --offline  # write an empty snapshot (no network)
 */

import { mkdir, rm, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
  buildBrands,
  buildSlugMap,
  normalizeMakeKey,
  type AnyCart,
  type AnyStore,
} from "../shared/cart-data";

const DMS_BASE_URL = process.env.DMS_BASE_URL || "https://api.tigondms.com/wp-website";
const PAGE_SIZE = 500;
const MAX_PAGES = 20;
const MAX_ATTEMPTS = 4;

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(rootDir, "client", "public", "data");

const offline = process.argv.includes("--offline") || process.env.DMS_OFFLINE === "1";

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

async function fetchAllCarts(): Promise<AnyCart[]> {
  const all: AnyCart[] = [];

  for (let pageNumber = 0; pageNumber < MAX_PAGES; pageNumber++) {
    const data = await fetchDMS("/get-carts", { pageNumber, pageSize: PAGE_SIZE });
    const carts: AnyCart[] = data?.carts || [];
    all.push(...carts);
    console.log(`  page ${pageNumber}: ${carts.length} carts (${all.length} total)`);
    if (carts.length < PAGE_SIZE) break;
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
    stores = (await fetchDMS("/tigon-stores")) || [];
    console.log(`fetched ${carts.length} carts and ${stores.length} stores`);

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
