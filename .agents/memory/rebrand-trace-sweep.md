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

**Kept-on-purpose, not a trace:** "nationwide delivery" (a real shipping capability that coexists with Florida-statewide service). `STATE_ABBREVIATIONS` in constants.ts is a generic US lookup, not a brand trace. NOTE: the words "discounted"/"wholesale" were later fully removed at user request (brand is Alaska Golf Carts only, generic pricing words = "great"/"MSRP").

**Cross-agent hazard:** background SEO/audit task agents can be generated from a scan of the PRE-rebrand brand, so a task that "fixes brand/domain signals" may treat the rebrand as the error and revert the whole thing on merge. After any large rebrand, re-grep the entire repo after each batch of task merges — a task's own instructions can be stale and silently undo your work. Treat `client/src/lib/constants.ts` (SITE_NAME/SITE_DOMAIN) as the single source of truth.

**Sweep must include `shared/`** — not just `client/src`, `client/public`, `server`, `client/index.html`. `shared/seo-routes.ts` holds SITE_URL/SITE_NAME + per-policy titles/descriptions consumed by server SSR; missing it leaks the old brand/domain on policy routes.

**Synthetic region data is scrambled, not just brand-swapped (changing service area):** the `client/public/` AI/LLM corpus files (nlp.txt, training.txt, geo.txt, seo.txt, claude.txt, gpt.txt, ai.txt, llms-full.txt, compliance.txt) carry large, self-contradictory region taxonomies mechanically derived from the OLD geography — duplicate region names, cities filed under the wrong region, invented boroughs (e.g. "Homer Borough"/"Kenai Borough" — those are cities), >5 region blocks, and Florida ZIP codes bolted onto new cities (e.g. "anchorage alaska 33101"). A grep that only checks for the old *place names* passes while the data stays incoherent. Fix = pick ONE canonical region model (source of truth here = `client/src/pages/service-area.tsx` regions array) and normalize every file to it: correct city→region and region→borough mappings, collapse to exactly the canonical count, use real local ZIPs. Then grep for scrambled fingerprints (old region labels, "<Region> (<wrong-city>", fake "<City> Borough", out-of-state ZIP patterns like `alaska 3[0-4][0-9]{3}`), not just the place names. The architect (code_review) repeatedly fails a service-area rebrand on *geographic coherence* even after place-name grep is clean.

**Token-swap gotchas:** brand lockups in `header.tsx`/`footer.tsx` split the name across two `<span>`s (word1 + "Golf Carts"), so a contiguous `sed 's/Old Golf Carts/.../'` misses them. Plus-encoded `utm_source=Old+Golf+Carts` in `financing.tsx` and lowercase keyword lists in `client/public/seo.txt` also need their own passes. When doing bulk `s/discountedgolfcarts/.../`, run the plural-with-trailing-s form BEFORE the singular, or you double the `s` (…cartss). Always grep case-insensitively after any sed sweep.
