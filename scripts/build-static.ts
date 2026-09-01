/**
 * Turns the Vite bundle into a fully static site.
 *
 * A static host has no server to inject per-route <title>/<meta>/JSON-LD or to
 * answer /sitemap.xml, so everything the Express server used to do per request
 * is done here once, at build time:
 *
 *   - one HTML file per route (every policy page and every cart detail page),
 *     carrying that route's SEO tags and no-JS fallback content
 *   - 404.html, which still boots the SPA so client-side routing recovers
 *   - sitemap.xml covering every cart slug
 *   - .nojekyll, so GitHub Pages serves Vite's _-prefixed asset paths
 *   - CNAME, when a custom domain is configured
 *
 * Run after `vite build`; expects the snapshot from `scripts/build-data.ts`.
 */

import { mkdir, readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  buildCartSeoMeta,
  buildSitemapXml,
  filterCarts,
  parseCartFilters,
  parsePriceSort,
  sortCarts,
  toCartSummaryForSeo,
  type AnyCart,
  type CartSummaryForSeo,
  type SlugMap,
} from "../shared/cart-data";
import { KNOWN_STATIC_ROUTES } from "../shared/known-routes";
import { buildPageHtml, type SeoDeps } from "../shared/seo-inject";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(rootDir, "dist", "public");
const dataDir = path.join(rootDir, "client", "public", "data");

const basePath = (() => {
  const raw = process.env.BASE_PATH?.trim();
  if (!raw || raw === "/") return "/";
  return `/${raw.replace(/^\/+|\/+$/g, "")}/`;
})();

const customDomain = process.env.CUSTOM_DOMAIN?.trim();

async function readJson<T>(name: string, fallback: T): Promise<T> {
  const file = path.join(dataDir, name);
  if (!existsSync(file)) return fallback;
  return JSON.parse(await readFile(file, "utf-8")) as T;
}

/**
 * Writes a route as both `<route>.html` and `<route>/index.html`. Static hosts
 * resolve extension-less URLs from the first and trailing-slash URLs from the
 * second, so both spellings work without a redirect.
 */
async function writeRoute(route: string, html: string): Promise<void> {
  if (route === "/") {
    await writeFile(path.join(distDir, "index.html"), html);
    return;
  }

  const relative = route.replace(/^\/+/, "");
  const flatFile = path.join(distDir, `${relative}.html`);
  await mkdir(path.dirname(flatFile), { recursive: true });
  await writeFile(flatFile, html);

  const dirFile = path.join(distDir, relative, "index.html");
  await mkdir(path.dirname(dirFile), { recursive: true });
  await writeFile(dirFile, html);
}

async function main(): Promise<void> {
  const template = path.join(distDir, "index.html");
  if (!existsSync(template)) {
    throw new Error(`missing ${path.relative(rootDir, template)} — run "vite build" first`);
  }
  const baseHtml = await readFile(template, "utf-8");

  const carts = await readJson<AnyCart[]>("carts.json", []);
  const slugMap = await readJson<SlugMap>("slug-map.json", { slugToId: {}, idToSlug: {} });

  if (carts.length === 0) {
    console.warn(
      'warning: the inventory snapshot is empty — run "npm run build:data" first, ' +
        "or the deployed site will have no carts."
    );
  }

  const cartById = new Map<string, AnyCart>();
  for (const cart of carts) {
    if (cart?._id) cartById.set(cart._id, cart);
  }

  const withSlug = sortCarts(carts)
    .map((cart) => ({ cart, slug: slugMap.idToSlug[cart._id] }))
    .filter((entry) => !!entry.slug);

  const deps: SeoDeps = {
    getCartMetaForSeo: async (slug) => {
      const cart = cartById.get(slugMap.slugToId[slug]);
      return cart ? buildCartSeoMeta(cart, slug) : null;
    },
    getHomeSnapshotForSeo: async () => {
      const pick = (used: boolean): CartSummaryForSeo[] =>
        withSlug
          .filter((entry) => (entry.cart.isUsed === true) === used)
          .slice(0, 8)
          .map((entry) => toCartSummaryForSeo(entry.cart, entry.slug));
      return { newCarts: pick(false), usedCarts: pick(true), totalCarts: carts.length };
    },
    getInventorySnapshotForSeo: async (url) => {
      const qIndex = url.indexOf("?");
      const params = new URLSearchParams(qIndex >= 0 ? url.slice(qIndex + 1) : "");
      const sorted = sortCarts(filterCarts(carts, parseCartFilters(params)), parsePriceSort(params));
      return {
        carts: sorted
          .map((cart) => ({ cart, slug: slugMap.idToSlug[cart._id] }))
          .filter((entry) => !!entry.slug)
          .slice(0, 24)
          .map((entry) => toCartSummaryForSeo(entry.cart, entry.slug)),
        totalCarts: sorted.length,
      };
    },
    isValidCartSlugForSeo: async (slug) => !!slugMap.slugToId[slug],
  };

  const options = { basePath };
  const routes = Array.from(KNOWN_STATIC_ROUTES);
  const cartRoutes = Object.keys(slugMap.slugToId).map((slug) => `/golfcart/${slug}`);

  for (const route of [...routes, ...cartRoutes]) {
    const { html } = await buildPageHtml(baseHtml, route, deps, options);
    await writeRoute(route, html);
  }
  console.log(`prerendered ${routes.length} pages and ${cartRoutes.length} cart detail pages`);

  // GitHub Pages serves 404.html for anything unmatched. It still loads the SPA,
  // so client-side routing renders the in-app not-found page.
  const notFound = await buildPageHtml(baseHtml, "/__not-found__", deps, options);
  await writeFile(path.join(distDir, "404.html"), notFound.html);

  await writeFile(path.join(distDir, "sitemap.xml"), buildSitemapXml(carts, slugMap));
  console.log(`wrote sitemap.xml with ${Object.keys(slugMap.slugToId).length} cart URLs`);

  // Without this, GitHub Pages runs Jekyll and drops Vite's _-prefixed files.
  await writeFile(path.join(distDir, ".nojekyll"), "");

  if (customDomain) {
    await writeFile(path.join(distDir, "CNAME"), `${customDomain}\n`);
    console.log(`wrote CNAME for ${customDomain}`);
  }

  console.log(`static site ready in ${path.relative(rootDir, distDir)} (base path "${basePath}")`);
}

main().catch((error) => {
  console.error("static build failed:", error);
  process.exit(1);
});
