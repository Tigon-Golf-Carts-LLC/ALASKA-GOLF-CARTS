---
name: SEO Optimization Scope
description: What was built for the site-wide SEO/GEO/agentic optimization pass and which files are permanently protected.
---

## Protected Files (DMS inventory — never touch)
- `client/src/pages/inventory.tsx` — live SRP feed
- `client/src/pages/cart-detail.tsx` — live VDP feed
- `client/src/components/cart-card.tsx` — inventory render component
- `client/src/components/inventory-filters.tsx` — DMS filter component

## Primary Keyword
"golf carts for sale" — transactional, multi-location

## New Pages Added (2026-06-09)
- `/faq` → `client/src/pages/faq.tsx`
- `/about` → `client/src/pages/about.tsx`
- `/service-area` → `client/src/pages/service-area.tsx`

## SeoHead Component
`client/src/components/seo-head.tsx` — useEffect-based per-page title/meta/schema injection. Used by financing, faq, about, service-area pages.

## Location Count
14 locations across 9 states (PA, NJ, DE, NC, IN, VA, FL, SC, OH).
Schema/llms.txt/site-info.json all updated to 14 (added Orangeburg SC, Swanton OH, Rio Grande NJ).

**Why:** The DMS API returned 14 stores but legacy static files only had 11 — required sync.

## Agentic/AI Files
- `/api/site-info.json` — structured business JSON for AI agents
- `/.well-known/ai-plugin.json` — OpenAI plugin stub
- `/.well-known/agent.json` — agent capability manifest
- `/llms-full.txt` — deep plain-text page snapshots
- `/sitemap.xml` — 6 static URLs

## SEO Docs
- `seo/keyword-map.md` — primary/secondary/LSI keywords, intent map, topic cluster
- `seo/CHANGELOG.md` — full list of touched files + skipped files with reasons
