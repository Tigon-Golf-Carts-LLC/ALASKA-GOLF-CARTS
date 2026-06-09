---
name: SEO Head Injection Architecture
description: How server-side SEO tag injection works — fixes critical canonical/title/meta bug for this pure SPA.
---

## The Problem
Pure client-side SPA — every URL returned the same index.html with canonical hardcoded to homepage. Google was treating all 800+ vehicle detail pages as duplicates of the homepage.

## The Solution
`server/seo-inject.ts` exports `buildPageHtml(html, url)` — called by BOTH:
- `server/vite.ts` (dev) — after `transformIndexHtml`, before `res.end()`
- `server/static.ts` (prod) — reads index.html, injects, sends (no longer uses `res.sendFile`)

## What It Injects (Server-Side, First Pass)
- `<title>` — per-route title, dynamic from slug for `/golfcart/[slug]`
- `<meta name="description">` — per-route description
- `<link rel="canonical">` — per-URL canonical (inventory filter pages include query string)
- `<meta property="og:url|title|description">` — correct OG tags per page
- `<meta name="twitter:title|description">` — correct Twitter tags
- `<script type="application/ld+json">` — Vehicle JSON-LD for cart detail pages (cache-only, no blocking fetch)

## Vehicle JSON-LD Flow
1. `server/routes.ts` exports mutable `getCartMetaForSeo` (initialized to `async () => null`)
2. Inside `registerRoutes()`, `getCartMetaForSeo` is reassigned to a real implementation using `getCached("slugMap")` and `getCached("allCartsComplete")` — cache-only, never triggers a live DMS fetch during page serve
3. `server/seo-inject.ts` imports `getCartMetaForSeo` from routes — works because Node modules are singletons and registerRoutes is called before any HTTP requests

## Client-Side Fallback (Deferred Rendering)
- `cart-detail.tsx`: `SeoHead` with full Vehicle JSON-LD schema + per-cart title/canonical — updates DOM after React hydration
- `inventory.tsx`: `SeoHead` with filter-aware dynamic title/description (useMemo on filter state)
- Other pages (FAQ, About, Financing, Service Area): already had SeoHead

## Canonical Rules
- `/` → `https://discountedgolfcart.com` (no trailing slash)
- `/inventory` → `https://discountedgolfcart.com/inventory`
- `/inventory?make=Club+Car` → `https://discountedgolfcart.com/inventory?make=Club+Car` (query preserved for filter pages)
- `/golfcart/[slug]` → `https://discountedgolfcart.com/golfcart/[slug]`
- All inner pages → `https://discountedgolfcart.com/[path]`

**Why:** Filter pages self-canonicalize (keeps them indexable independently). Phase 2 will control which filter combos get indexed vs. canonicalized to parent.

## Image Loading
- `cart-card.tsx`: already had `loading="lazy"` — no change needed
- `cart-detail.tsx` main image: `loading="eager"` (LCP candidate)
- `cart-detail.tsx` gallery thumbnails: `loading="lazy"`
