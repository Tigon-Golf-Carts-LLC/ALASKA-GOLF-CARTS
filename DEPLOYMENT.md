# Deployment

The site builds to a **fully static** bundle in `dist/public`. There is no
server to run in production — it works on GitHub Pages, Cloudflare Pages, or any
plain static host.

```bash
npm run build:static     # snapshot + bundle + prerender  →  dist/public
npm run preview:static   # serve dist/public locally
```

## How a static build replaces the server

The Express app did three things at request time. The static build does all
three at build time instead:

| Was done per request by Express | Now |
| --- | --- |
| Proxying the DMS API at `/api/*` | `scripts/build-data.ts` snapshots the whole catalogue into `client/public/data/*.json`; the browser filters, sorts, and pages it (`client/src/lib/static-api.ts`) |
| Injecting per-route `<title>`, meta, and JSON-LD | `scripts/build-static.ts` writes one prerendered HTML file per route, including every `/golfcart/<slug>` |
| Serving a generated `/sitemap.xml` | Written to `dist/public/sitemap.xml` at build time, covering every cart |

The DMS API sends no CORS headers, so a browser can't call it directly — that is
why the inventory is baked in rather than fetched at runtime. Filtering, sorting,
and slug generation all run through `shared/cart-data.ts`, so `npm run dev`
(live API) and a deployed build (snapshot) produce identical results.

**The inventory is only as fresh as the last build.** The DMS refreshes nightly
at 10:55 PM ET, and the deploy workflow rebuilds daily to match.

## GitHub Pages

`.github/workflows/deploy-pages.yml` builds and deploys on every push to `main`,
once a day at 04:05 UTC, and on demand via **Actions → Deploy to GitHub Pages →
Run workflow**.

One-time setup:

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
   (The workflow also enables this itself on first run.)
2. Push to `main`, or run the workflow manually.

That's it — the site comes up at `https://<owner>.github.io/<repo>/`. The
workflow reads the sub-path from the Pages API and builds with the matching
`BASE_PATH`, so assets, routes, and links all resolve under it.

### Custom domain (alaskagolfcarts.com)

The canonical URLs, sitemap, and structured data throughout the site already
point at `https://alaskagolfcarts.com`, so a custom domain is the intended
setup:

1. Point DNS at GitHub Pages — either four `A` records for the apex
   (`185.199.108–111.153`) or a `CNAME` for `www` to `<owner>.github.io`.
2. **Settings → Secrets and variables → Actions → Variables → New repository
   variable**: `CUSTOM_DOMAIN` = `alaskagolfcarts.com`.

The workflow then builds at the root path and writes a `CNAME` file into the
output. Leave the variable unset to stay on the `github.io` sub-path.

### Notes

- GitHub disables scheduled workflows in a repository with no commits for 60
  days. If nightly rebuilds stop, re-enable the workflow in the Actions tab.
- If the DMS API is unreachable — or answers with an empty catalogue, an empty
  store list, or a changed response shape — the build **fails on purpose** and
  the previous deployment stays live rather than being replaced by a broken one.
  See "When the DMS API misbehaves" below.
- `.nojekyll` is emitted so Pages serves Vite's asset paths untouched.
- Every route is written as both `<route>.html` and `<route>/index.html`, so
  URLs work with or without a trailing slash and without a redirect hop.

## Cloudflare Pages

The same build output works unchanged.

| Setting | Value |
| --- | --- |
| Build command | `npm run build:static` |
| Build output directory | `dist/public` |
| Node version | 20 |

Leave `BASE_PATH` unset (Cloudflare serves from the root) and set
`CUSTOM_DOMAIN` only if you also want a `CNAME` file in the output — Cloudflare
manages custom domains in its own dashboard, so it usually isn't needed.

### Optional: live inventory instead of a nightly snapshot

`functions/api/[[path]].ts` is a Pages Function that proxies the DMS API at
`/api/*`, the same way the Express server did. To use it, set an environment
variable in the Pages project:

```
VITE_DATA_MODE=proxy
```

The client then calls `/api/*` at runtime and inventory is live. Without it (the
default, and what GitHub Pages uses) the client reads the baked-in snapshot and
the function is simply never called.

## When the DMS API misbehaves

The snapshot *is* the deployed inventory, so a bad response is more dangerous
than a failed one — a 200 carrying an empty list would quietly publish a site
with no carts. `scripts/build-data.ts` therefore refuses to write a snapshot it
cannot vouch for:

| Response | What would happen unchecked | What happens now |
| --- | --- | --- |
| Empty `carts` array | Site deploys with no inventory and an empty sitemap | Build fails (`--allow-empty` to override) |
| Empty store list | Cart slugs are built from store city/state, so **every cart URL changes** and every indexed URL breaks | Build fails |
| `pageNumber` ignored | Same page re-fetched until the page cap, duplicating the catalogue | Detected by ID; paging stops |
| Catalogue over the page cap | Site silently missing inventory | Build fails |
| `carts` / stores not an array | Coerced to empty, as above | Build fails with the received body |

`scripts/test-build-data.ts` covers each of these against a mock DMS server, and
the CI workflow additionally runs a full build against the **live** API on every
pull request, so an upstream problem shows up there rather than mid-deploy.

### Slug stability

A cart's URL is `make-model-color-city-state-country`, with `-01`, `-02` … for
collisions — and a dealer stocks many identical carts, so those suffixes decide
real URLs. Slugs are assigned in `_id` order rather than in the order the DMS
returns carts, so the mapping is a pure function of the cart set: a reordered
API response cannot reshuffle live permalinks on the next nightly rebuild. A
cart keeps its URL for as long as it stays in inventory.

Carts whose `cartLocation` points at a store missing from `/tigon-stores` still
get a unique slug, but without city/state in it. The build warns and names those
store IDs — worth chasing upstream, since it makes those URLs less descriptive.

## Local development

`npm run dev` still runs the Express server against the live DMS API, with the
same per-route SEO injection the static build produces. Nothing about the
static setup changes the development workflow.

To exercise the static path locally:

```bash
npm run build:data           # or: npx tsx scripts/build-data.ts --offline
npm run build:client
npm run build:prerender
npm run preview:static
```

## Configuration reference

| Variable | Used by | Meaning |
| --- | --- | --- |
| `BASE_PATH` | build | Sub-path the site is served from (`/` by default, `/<repo>/` for a project site) |
| `CUSTOM_DOMAIN` | build | Writes a `CNAME` file into the output |
| `VITE_DATA_MODE` | client build | `static` (default) reads the snapshot; `proxy` calls a live `/api/*` backend |
| `DMS_BASE_URL` | `build:data` | Override the DMS API base URL |
| `DMS_OFFLINE=1` | `build:data` | Write an empty snapshot without network access |
| `ALLOW_EMPTY_INVENTORY=1` | `build:data` | Accept a genuinely empty catalogue or store list |
| `DATA_OUT_DIR` | `build:data` | Write the snapshot somewhere other than `client/public/data` |
