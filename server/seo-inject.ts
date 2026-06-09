import { getCartMetaForSeo } from "./routes";

const BASE_URL = "https://discountedgolfcart.com";

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

function getRouteMetaFromUrl(url: string, cartMeta?: PageMeta): PageMeta {
  if (cartMeta) return cartMeta;

  const pathname = url.split("?")[0].toLowerCase().replace(/\/$/, "") || "/";
  const search = url.includes("?") ? url.slice(url.indexOf("?")) : "";

  if (pathname === "/" || pathname === "") {
    return {
      title: "Golf Carts for Sale — Discounted Inventory Updated Daily | Discounted Golf Carts",
      description:
        "Golf carts for sale at wholesale prices — inventory updated daily. New and used carts from Club Car, EZGO, Yamaha, Denago & more. 0% APR financing. 14 locations. Call 1-888-840-4490.",
    };
  }

  if (pathname === "/inventory") {
    if (search) {
      const params = new URLSearchParams(search.slice(1));
      const parts: string[] = [];
      const make = params.get("make");
      const condRaw =
        params.get("condition") ||
        (params.get("isNew") === "true" ? "New" : params.get("isUsed") === "true" ? "Used" : null);
      const location = params.get("location");
      if (condRaw) parts.push(condRaw);
      if (make) parts.push(make);
      const filterStr = parts.join(" ");
      const locationSuffix = location ? ` Near ${location}` : "";
      const subject = filterStr ? `${filterStr} Golf Carts` : "Golf Carts";
      return {
        title: `${subject} for Sale${locationSuffix} | Discounted Golf Carts`,
        description: `Browse ${subject.toLowerCase()} for sale${locationSuffix.toLowerCase()} — updated daily. 0% APR financing. 14 locations. Call 1-888-840-4490.`,
      };
    }
    return {
      title: "Golf Cart Inventory — New & Used Golf Carts for Sale | Discounted Golf Carts",
      description:
        "Browse 800+ new and used golf carts updated daily. Electric and gas golf carts from Club Car, EZGO, Yamaha, Denago, Evolution and more. 0% APR financing. 14 locations.",
    };
  }

  if (pathname.startsWith("/golfcart/")) {
    const slug = pathname.replace("/golfcart/", "");
    const readable = slugToReadable(slug);
    return {
      title: `${readable} — Golf Cart for Sale | Discounted Golf Carts`,
      description: `${readable} golf cart for sale at Discounted Golf Carts. Updated daily. 0% APR financing available. Call 1-888-840-4490.`,
    };
  }

  if (pathname === "/financing") {
    return {
      title: "Golf Cart Financing — 0% APR for 48 Months | Discounted Golf Carts",
      description:
        "0% APR golf cart financing up to 48 months through 6 lending partners. Apply in-store at any of 14 locations. Call 1-888-840-4490.",
    };
  }

  if (pathname === "/faq") {
    return {
      title: "Golf Cart FAQ — Common Questions Answered | Discounted Golf Carts",
      description:
        "Answers to common golf cart buying questions — pricing, brands, street legal requirements, financing, battery care, and more.",
    };
  }

  if (pathname === "/about") {
    return {
      title: "About Discounted Golf Carts — 14 Locations Across 9 States",
      description:
        "Discounted Golf Carts is one of the largest golf cart dealerships in the eastern US. 14 stores in PA, NJ, DE, NC, IN, VA, FL, SC, and OH. 13 brands. Inventory updated daily.",
    };
  }

  if (pathname === "/service-area") {
    return {
      title: "Golf Cart Dealer Locations — 14 Stores in 9 States | Discounted Golf Carts",
      description:
        "Find a Discounted Golf Carts dealer near you. 14 locations in Pennsylvania, New Jersey, Delaware, North Carolina, Indiana, Virginia, Florida, South Carolina, and Ohio.",
    };
  }

  return {
    title: "Discounted Golf Carts — Golf Carts for Sale",
    description: "Golf carts for sale at wholesale prices. 14 locations, 13 brands, 0% APR financing. Call 1-888-840-4490.",
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
  const isInventoryFilter = pathname === "/inventory" && url.includes("?");
  const canonical = isInventoryFilter
    ? `${BASE_URL}${url}`
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
