---
name: Inventory SEO filter scope
description: Which inventory query params are treated as index-worthy for SEO purposes, and why that boundary was drawn.
---

The inventory page supports many client-side filters (power type, street-legal, lifted, seating, drivetrain, color, model, location, store), but only `condition` (`new`/`used`, lowercase) and a single `make` are treated as index-worthy for SEO.

**Why:** Those are the only two filters that can be resolved consistently on both the server (SSR head injection in `server/seo-inject.ts`) and the client (`client/src/pages/inventory.tsx` reads them from the URL on initial load). Every other filter is UI-only state that never round-trips through the URL/SSR path, so advertising it in canonicals, titles, meta descriptions, or sitemaps produces pages that don't actually render distinct filtered content — a duplicate/misleading-content problem for crawlers.

**How to apply:** If a new inventory filter is ever promoted to a real crawlable/SEO landing page, it must be added in all three places at once: `getSupportedInventoryFilters()`/`buildInventoryCanonicalPath()` in `server/seo-inject.ts`, the `seoIndexableMake`/`seoTitle`/`seoDescription`/`seoCanonical` logic in `client/src/pages/inventory.tsx`, and the sitemap URL generation in `server/routes.ts` + any static `client/public/*.xml` files. Never add a filter to only one of these layers — that's exactly the bug this fix corrected (conflicting canonicals + sitemap URLs the app couldn't resolve).
