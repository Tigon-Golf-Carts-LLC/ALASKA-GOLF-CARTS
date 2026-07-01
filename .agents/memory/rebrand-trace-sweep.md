---
name: Rebrand / brand-trace sweep
description: Where user-visible brand/location traces hide in this repo when rebranding or changing service area
---

# Rebranding / changing service area — where traces hide

When rebranding (name/URL/locations) or changing the service area, `client/src` is only part of the job. The biggest source of stale traces is **`client/public/`**, which holds ~50 SEO/AI/LLM crawler artifacts (`*.txt` like geo.txt, nlp.txt, claude.txt, ai.txt, seo.txt, llms.txt, llms-full.txt, gpt.txt, training.txt, compliance.txt; plus many `*.xml` feeds/sitemaps, `schema.json`, `api/*.json`). These duplicate business facts (full store addresses, state lists, location/state counts, taglines) and drift independently of the app UI.

**How to apply:**
- Always `rg -i` the full fingerprint set across BOTH `client/src` AND `client/public` (and `client/index.html`). Don't trust the app UI being clean.
- A blind `sed`/find-replace across these files **mangles** them (e.g. "operates <newphrase> across Pennsylvania, New Jersey, ..." leaving the old state list). Rewrite location content properly per-file, then grep-verify zero matches. Splitting the files across parallel subagents works well, but each still misses edge cases — do a final main-agent sweep (subagents missed schema.json title, api-feed.xml `<locations>/<states>` counts, llms-full.txt title line).

**Non-obvious traces that are easy to miss:**
- Baked-in text inside image assets — the hero background PNG had the old brand name rendered into the image (not in code). Screenshot the rendered page to catch these; regenerate the asset.
- Old brand *tagline* echoes ("Discounted Inventory Updated Daily" mirrored the old "Discounted Golf Carts Updated Daily") in schema.json / llms-full.txt.
- Location/footprint counts in feeds: `<locations>14</locations>`, `<states>9</states>`.

**Out of our control (expected residual):** cart photos come from the live DMS API and can show the original dealership's physical signage in the background. The DMS backend URLs (api.tigondms.com, `/tigon-stores`) are intentionally kept — backend only, not user-visible.

**Kept-on-purpose, not a trace:** generic lowercase adjective "discounted" (discounted prices/vehicles) and "nationwide delivery" (a real shipping capability that coexists with Florida-statewide service). `STATE_ABBREVIATIONS` in constants.ts is a generic US lookup, not a brand trace.
