import { getCartMetaForSeo, getHomeSnapshotForSeo, getInventorySnapshotForSeo, isValidCartSlugForSeo } from "./routes";
import { KNOWN_STATIC_ROUTES, normalizePathname, getCartSlugFromPathname } from "./known-routes";
import { renderRouteContent, renderNotFoundContent } from "./prerender";
import { POLICY_ROUTES, SITE_URL } from "../shared/seo-routes";

const BASE_URL = SITE_URL;

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

  const policyMeta = POLICY_ROUTES[pathname];
  if (policyMeta) {
    return { title: policyMeta.title, description: policyMeta.description };
  }

  return {
    title: "Alaska Golf Carts — Golf Carts for Sale",
    description: "Alaska Golf Carts - Don't Miss These Golf Cart Deals! Golf cart prices update nightly — Lock in today's wholesale MSRP before inventory changes.",
  };
}

function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": item.name,
      "item": item.path === "/" ? BASE_URL : `${BASE_URL}${item.path}`,
    })),
  };
}

function getPageSchema(pathname: string): Record<string, unknown> | null {
  if (pathname === "/" || pathname === "") {
    const meta = getRouteMetaFromUrl("/");
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${BASE_URL}/#webpage`,
      "url": BASE_URL,
      "name": meta.title,
      "isPartOf": { "@id": `${BASE_URL}/#website` },
      "about": { "@id": `${BASE_URL}#organization` },
      "description": meta.description,
      "inLanguage": "en-US",
      "breadcrumb": breadcrumbSchema([{ name: "Home", path: "/" }]),
    };
  }

  if (pathname === "/faq") {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${BASE_URL}/faq#faq`,
      "url": `${BASE_URL}/faq`,
      "breadcrumb": breadcrumbSchema([{ name: "Home", path: "/" }, { name: "FAQ", path: "/faq" }]),
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How much does a golf cart cost?",
          "acceptedAnswer": { "@type": "Answer", "text": "New golf carts at Alaska Golf Carts start at approximately $9,995. Used golf carts typically range from $4,500 to $12,000 depending on brand, age, and condition. Call 1-888-840-4490 for current pricing." },
        },
        {
          "@type": "Question",
          "name": "What brands of golf carts does Alaska Golf Carts carry?",
          "acceptedAnswer": { "@type": "Answer", "text": "Alaska Golf Carts is an authorized dealer for 13 brands: American Custom Golf Carts, Bintelli, Club Car, COLEMAN, COLUMBIA, CRICKET, Denago, Evolution, EZGO (E-Z-GO), Icon, Star EV, Tara, and Yamaha." },
        },
        {
          "@type": "Question",
          "name": "Does Alaska Golf Carts offer financing?",
          "acceptedAnswer": { "@type": "Answer", "text": "Yes. Financing is available through six lending partners including Sheffield Financial (0% APR), BLI Heartland (rent-to-own), DLL Financial Solutions, Roadrunner/Octane, Univest Capital, and Dealer Direct. Terms up to 48 months." },
        },
        {
          "@type": "Question",
          "name": "What is a street-legal golf cart (LSV)?",
          "acceptedAnswer": { "@type": "Answer", "text": "A Low Speed Vehicle (LSV) meets FMVSS 500 federal standards for use on roads with posted limits of 35 mph or less. Required equipment includes headlights, taillights, turn signals, mirrors, seat belts, horn, windshield, and a VIN." },
        },
        {
          "@type": "Question",
          "name": "Does Alaska Golf Carts deliver across Florida?",
          "acceptedAnswer": { "@type": "Answer", "text": "Yes. Statewide delivery is available to all 67 Florida counties. Call 1-888-840-4490 for a delivery quote." },
        },
        {
          "@type": "Question",
          "name": "How often is the inventory updated?",
          "acceptedAnswer": { "@type": "Answer", "text": "The inventory feed is refreshed daily at 10:55 PM Eastern Time. All prices and availability reflect the most recent nightly update." },
        },
      ],
    };
  }

  if (pathname === "/about") {
    return {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "@id": `${BASE_URL}/about`,
      "url": `${BASE_URL}/about`,
      "name": "About Alaska Golf Carts — Florida Golf Cart Dealer",
      "description": "Alaska Golf Carts is a golf cart dealership serving all 67 counties across the state of Florida. 13 authorized brands, inventory updated daily, statewide delivery.",
      "isPartOf": { "@id": `${BASE_URL}/#website` },
      "about": { "@id": `${BASE_URL}#organization` },
      "breadcrumb": breadcrumbSchema([{ name: "Home", path: "/" }, { name: "About", path: "/about" }]),
    };
  }

  if (pathname === "/financing") {
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "url": `${BASE_URL}/financing`,
      "name": "Golf Cart Financing — 0% APR Up to 48 Months | Alaska Golf Carts",
      "description": "Apply for golf cart financing through six lending partners. 0% APR options available. Quick approvals. New and used carts, LSVs, and NEVs. Call 1-888-840-4490.",
      "breadcrumb": breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Financing", path: "/financing" }]),
      "mainEntity": {
        "@type": "Service",
        "name": "Golf Cart Financing",
        "provider": { "@id": `${BASE_URL}#organization` },
        "description": "Golf cart financing through six lending partners. 0% APR available, terms up to 48 months, quick approval for new and used golf carts.",
        "offers": {
          "@type": "Offer",
          "description": "0% APR financing on golf carts, terms up to 48 months",
          "seller": { "@id": `${BASE_URL}#organization` },
        },
      },
    };
  }

  if (pathname === "/service-area") {
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "url": `${BASE_URL}/service-area`,
      "name": "Florida Golf Cart Service Area — All 67 Counties | Alaska Golf Carts",
      "description": "Alaska Golf Carts serves the entire state of Florida — all 67 counties. New and used golf carts with statewide delivery.",
      "about": { "@type": "State", "name": "Florida" },
      "breadcrumb": breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Service Area", path: "/service-area" }]),
    };
  }

  if (pathname === "/inventory") {
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "url": `${BASE_URL}/inventory`,
      "name": "Golf Cart Inventory — New & Used Golf Carts for Sale | Alaska Golf Carts",
      "isPartOf": { "@id": `${BASE_URL}/#website` },
      "breadcrumb": breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Inventory", path: "/inventory" }]),
    };
  }

  const policyMeta = POLICY_ROUTES[pathname];
  if (policyMeta) {
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "url": `${BASE_URL}${pathname}`,
      "name": policyMeta.title,
      "description": policyMeta.description,
      "isPartOf": { "@id": `${BASE_URL}/#website` },
      "breadcrumb": breadcrumbSchema([{ name: "Home", path: "/" }, { name: policyMeta.breadcrumbLabel, path: pathname }]),
    };
  }

  return null;
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

  const pageSchema = opts?.vehicleSchema ?? getPageSchema(pathname.toLowerCase().replace(/\/$/, "") || "/");

  if (pageSchema) {
    const schemaJson = JSON.stringify(pageSchema);
    result = result.replace(
      "</head>",
      `  <script type="application/ld+json" id="page-schema">${schemaJson}</script>\n</head>`
    );
  }

  return result;
}

function injectRootContent(html: string, content: string): string {
  return html.replace(
    /<div id="root"><\/div>/,
    `<div id="root">${content}</div>`
  );
}

export async function resolveRouteStatus(url: string): Promise<number> {
  const pathname = normalizePathname(url);

  if (KNOWN_STATIC_ROUTES.has(pathname)) return 200;

  const slug = getCartSlugFromPathname(pathname);
  if (slug) {
    try {
      const valid = await isValidCartSlugForSeo(slug);
      return valid ? 200 : 404;
    } catch {
      return 404;
    }
  }

  return 404;
}

export async function buildPageHtml(html: string, url: string): Promise<{ html: string; status: number }> {
  const pathname = normalizePathname(url);
  const cartSlugMatch = url.match(/^\/golfcart\/([^/?#]+)/);
  const status = await resolveRouteStatus(url);

  if (cartSlugMatch) {
    const slug = cartSlugMatch[1];
    try {
      const cartMeta = await getCartMetaForSeo(slug);
      if (cartMeta) {
        let result = injectSeoTags(html, url, {
          cartMeta: { title: cartMeta.title, description: cartMeta.description },
          vehicleSchema: cartMeta.schema,
          ogImage: cartMeta.imageUrl ?? undefined,
        });
        const content = await renderRouteContent(pathname, url, {
          getHomeSnapshotForSeo,
          getInventorySnapshotForSeo,
          getCartMetaForSeo,
        });
        if (content) result = injectRootContent(result, content);
        return { html: result, status };
      }
    } catch {
      // fall through to basic injection
    }
  }

  let result = injectSeoTags(html, url);

  try {
    if (status === 404) {
      result = injectRootContent(result, renderNotFoundContent());
    } else {
      const content = await renderRouteContent(pathname, url, {
        getHomeSnapshotForSeo,
        getInventorySnapshotForSeo,
        getCartMetaForSeo,
      });
      if (content) result = injectRootContent(result, content);
    }
  } catch {
    // fall through without body content injection
  }

  return { html: result, status };
}
