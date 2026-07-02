import { getCartMetaForSeo } from "./routes";

const BASE_URL = "https://alaskagolfcarts.com";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function slugToReadable(slug: string): string {
  return slug
    .split("-")
    .filter((p) => p && p !== "usa")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

interface PageMeta {
  title: string;
  description: string;
}

interface InventoryFilters {
  condition: "new" | "used" | null;
  make: string | null;
}

function getSupportedInventoryFilters(search: string): InventoryFilters {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const condRaw =
    params.get("condition") ||
    (params.get("isNew") === "true" ? "new" : params.get("isUsed") === "true" ? "used" : null);
  const condLower = condRaw ? condRaw.toLowerCase() : null;
  const condition: "new" | "used" | null =
    condLower === "new" ? "new" : condLower === "used" ? "used" : null;
  const make = params.get("make");
  return { condition, make };
}

function buildInventoryCanonicalPath(search: string): string {
  const { condition, make } = getSupportedInventoryFilters(search);
  const qp = new URLSearchParams();
  if (condition) qp.set("condition", condition);
  if (make) qp.set("make", make);
  const qs = qp.toString();
  return `/inventory${qs ? `?${qs}` : ""}`;
}

function getRouteMetaFromUrl(url: string, cartMeta?: PageMeta): PageMeta {
  if (cartMeta) return cartMeta;

  const pathname = url.split("?")[0].toLowerCase().replace(/\/$/, "") || "/";
  const search = url.includes("?") ? url.slice(url.indexOf("?")) : "";

  if (pathname === "/" || pathname === "") {
    return {
      title: "Golf Carts for Sale — New & Used Inventory Updated Daily | Alaska Golf Carts",
      description:
        "Golf carts for sale at wholesale prices — inventory updated daily. New and used carts from Club Car, EZGO, Yamaha, Denago & more. 0% APR financing. Serving all of Florida. Call 1-888-840-4490.",
    };
  }

  if (pathname === "/inventory") {
    if (search) {
      const { condition, make } = getSupportedInventoryFilters(search);
      const parts: string[] = [];
      if (condition === "new") parts.push("New");
      if (condition === "used") parts.push("Used");
      if (make) parts.push(make);
      const filterStr = parts.join(" ");
      const subject = filterStr ? `${filterStr} Golf Carts` : "Golf Carts";
      if (filterStr) {
        return {
          title: `${subject} for Sale | Alaska Golf Carts`,
          description: `Browse ${subject.toLowerCase()} for sale — updated daily. 0% APR financing. Serving all of Florida. Call 1-888-840-4490.`,
        };
      }
    }
    return {
      title: "Golf Cart Inventory — New & Used Golf Carts for Sale | Alaska Golf Carts",
      description:
        "Browse 800+ new and used golf carts updated daily. Electric and gas golf carts from Club Car, EZGO, Yamaha, Denago, Evolution and more. 0% APR financing. Serving all of Florida.",
    };
  }

  if (pathname.startsWith("/golfcart/")) {
    const slug = pathname.replace("/golfcart/", "");
    const readable = slugToReadable(slug);
    return {
      title: `${readable} — Golf Cart for Sale | Alaska Golf Carts`,
      description: `${readable} golf cart for sale at Alaska Golf Carts. Updated daily. 0% APR financing available. Call 1-888-840-4490.`,
    };
  }

  if (pathname === "/financing") {
    return {
      title: "Golf Cart Financing — 0% APR for 48 Months | Alaska Golf Carts",
      description:
        "0% APR golf cart financing up to 48 months through 6 lending partners. Apply from anywhere in Florida. Call 1-888-840-4490.",
    };
  }

  if (pathname === "/faq") {
    return {
      title: "Golf Cart FAQ — Common Questions Answered | Alaska Golf Carts",
      description:
        "Answers to common golf cart buying questions — pricing, brands, street legal requirements, financing, battery care, and more.",
    };
  }

  if (pathname === "/about") {
    return {
      title: "About Alaska Golf Carts — Serving All of Florida",
      description:
        "Alaska Golf Carts is a golf cart dealership serving all 67 counties across Florida. New and used carts from 13 brands. Inventory updated daily. Statewide delivery.",
    };
  }

  if (pathname === "/service-area") {
    return {
      title: "Florida Golf Cart Service Area — All 67 Counties | Alaska Golf Carts",
      description:
        "Alaska Golf Carts serves the entire state of Florida — all 67 counties, from Miami-Dade and Broward to Duval, Hillsborough, Orange, and beyond. Statewide delivery available.",
    };
  }

  return {
    title: "Alaska Golf Carts — Golf Carts for Sale",
    description: "Alaska Golf Carts - Don't Miss These Golf Cart Deals! Golf cart prices update nightly — Lock in today's wholesale MSRP before inventory changes.",
  };
}

function injectSeoTags(
  html: string,
  url: string,
  opts?: {
    cartMeta?: PageMeta;
    vehicleSchema?: Record<string, unknown>;
    ogImage?: string;
  }
): string {
  const pathname = url.split("?")[0];
  const search = url.includes("?") ? url.slice(url.indexOf("?")) : "";
  const canonical =
    pathname === "/inventory" && search
      ? `${BASE_URL}${buildInventoryCanonicalPath(search)}`
      : `${BASE_URL}${pathname === "/" ? "" : pathname}`;

  const meta = getRouteMetaFromUrl(url, opts?.cartMeta);
  const t = esc(meta.title);
  const d = esc(meta.description);
  const c = esc(canonical);

  let result = html;
  result = result.replace(/<title>[^<]*<\/title>/, `<title>${t}</title>`);
  result = result.replace(/(<meta\s+name="description"\s+content=")[^"]*(")/i, `$1${d}$2`);
  result = result.replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/i, `$1${c}$2`);
  result = result.replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/i, `$1${c}$2`);
  result = result.replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/i, `$1${t}$2`);
  result = result.replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/i, `$1${d}$2`);
  result = result.replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/i, `$1${t}$2`);
  result = result.replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/i, `$1${d}$2`);

  if (opts?.ogImage) {
    result = result.replace(
      /(<meta\s+property="og:image"\s+content=")[^"]*(")/i,
      `$1${esc(opts.ogImage)}$2`
    );
  }

  if (opts?.vehicleSchema) {
    const schemaJson = JSON.stringify(opts.vehicleSchema);
    result = result.replace(
      "</head>",
      `  <script type="application/ld+json">${schemaJson}</script>\n</head>`
    );
  }

  return result;
}

export async function buildPageHtml(html: string, url: string): Promise<string> {
  const cartSlugMatch = url.match(/^\/golfcart\/([^/?#]+)/);

  if (cartSlugMatch) {
    const slug = cartSlugMatch[1];
    try {
      const cartMeta = await getCartMetaForSeo(slug);
      if (cartMeta) {
        return injectSeoTags(html, url, {
          cartMeta: { title: cartMeta.title, description: cartMeta.description },
          vehicleSchema: cartMeta.schema,
          ogImage: cartMeta.imageUrl ?? undefined,
        });
      }
    } catch {
      // fall through to basic injection
    }
  }

  return injectSeoTags(html, url);
}
