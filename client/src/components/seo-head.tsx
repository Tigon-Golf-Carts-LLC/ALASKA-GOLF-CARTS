import { useEffect } from "react";

interface SeoHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  schema?: object | object[];
}

export function SeoHead({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage = "https://discountedgolfcart.com/og-image.png",
  schema,
}: SeoHeadProps) {
  useEffect(() => {
    document.title = title;

    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        const [a, v] = attr.split("=");
        el.setAttribute(a, v ?? attr);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };

    setMeta('meta[name="description"]', 'name=description', description);
    setMeta('meta[property="og:title"]', 'property=og:title', ogTitle ?? title);
    setMeta('meta[property="og:description"]', 'property=og:description', ogDescription ?? description);
    setMeta('meta[property="og:image"]', 'property=og:image', ogImage);
    setMeta('meta[name="twitter:title"]', 'name=twitter:title', ogTitle ?? title);
    setMeta('meta[name="twitter:description"]', 'name=twitter:description', ogDescription ?? description);

    if (canonical) {
      let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", canonical);
    }

    const existing = document.getElementById("page-schema");
    if (existing) existing.remove();

    if (schema) {
      const scriptEl = document.createElement("script");
      scriptEl.type = "application/ld+json";
      scriptEl.id = "page-schema";
      scriptEl.textContent = JSON.stringify(schema);
      document.head.appendChild(scriptEl);
      return () => { scriptEl.remove(); };
    }
  }, [title, description, canonical, ogTitle, ogDescription, ogImage, schema]);

  return null;
}
