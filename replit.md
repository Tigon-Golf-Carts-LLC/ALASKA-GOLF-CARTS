# Discounted Golf Carts - discountedgolfcart.com

## Overview
A golf cart dealership website for Discounted Golf Carts (discountedgolfcart.com) that pulls inventory from the DMS API. Displays new and used golf carts with images, pricing, specifications, and "Call Now" CTAs. Emphasizes discounted inventory that is updated daily.

## Architecture
- **Frontend**: React + TypeScript + Vite with Tailwind CSS + shadcn/ui
- **Production**: fully static — deploys to GitHub Pages / Cloudflare Pages with no server (see `DEPLOYMENT.md`)
- **Development**: Express.js proxy to the DMS API with in-memory caching (`npm run dev`)
- **No database needed** - all data comes from external DMS API
- **Cache refresh**: Daily at 10:55 PM EST; the static site rebuilds nightly to match

## Key Features
- Home page with hero, featured inventory, brands, and store locations
- "Discounted inventory updated daily" messaging throughout
- Full inventory page with filters (condition, power type, brand, model, color, seating, drivetrain, location)
- Individual cart detail pages with image gallery, specs, battery/engine info
- All CTAs are "Call Now" buttons linking to tel:1-888-840-4490
- Dark/light theme toggle (default: dark)
- Responsive design
- Green primary color scheme for "discount" branding
- SEO optimized for discountedgolfcart.com domain

## External API (DMS)
Base URL: `https://api.tigondms.com/wp-website`
- `POST /get-carts` - paginated inventory with filters
- `POST /get-cart-by-id` - single cart details
- `GET /tigon-stores` - store locations
- `POST /get-cart-models` - models by make
- `POST /get-cart-colors` - colors by make

## Project Structure
- `client/src/pages/` - Home, Inventory, CartDetail, Financing, NotFound
- `client/src/components/` - Header, Footer, CartCard, InventoryFilters, ThemeProvider
- `client/src/lib/constants.ts` - shared constants (SITE_NAME, SITE_DOMAIN), helpers
- `client/src/lib/static-api.ts` - serves `/api/*` from the prebuilt snapshot when hosted statically
- `server/routes.ts` - dev-only API proxy with caching (refreshes at 10:55 PM EST)
- `shared/cart-data.ts` - filtering, sorting, slugs, SEO meta, sitemap (used by dev server, build, and browser alike)
- `shared/seo-inject.ts`, `shared/prerender.ts` - per-route SEO tags and no-JS fallback content
- `shared/schema.ts` - TypeScript types/Zod schemas for DMS data
- `scripts/build-data.ts` - snapshots the DMS inventory into `client/public/data/`
- `scripts/build-static.ts` - prerenders every route, writes sitemap.xml / 404.html / CNAME
- `functions/api/[[path]].ts` - optional Cloudflare Pages Function for live inventory
- `client/public/` - SEO files (robots.txt, sitemap, ai.txt, etc.)

## Hosting
Static build: `npm run build:static` → `dist/public`. GitHub Pages deploys are
automated by `.github/workflows/deploy-pages.yml`. Full details in `DEPLOYMENT.md`.

## S3 Image URLs
Cart images: `https://s3.amazonaws.com/prod.docs.s3/carts/{filename}`

## Theme
Green primary (hue 152), dark mode default, Plus Jakarta Sans font

## Branding
- Site name: "Discounted Golf Carts"
- Domain: discountedgolfcart.com
- Phone: 1-888-840-4490
- Logo: Tag icon with green accent
- Key messaging: "Discounted Golf Carts Updated Daily"
