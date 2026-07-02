export const KNOWN_STATIC_ROUTES = new Set<string>([
  "/",
  "/inventory",
  "/financing",
  "/faq",
  "/about",
  "/service-area",
  "/terms-conditions",
  "/return-policy",
  "/privacy-policy",
  "/delivery-policy",
  "/rental-policy",
  "/storage-policy",
  "/publishing-policy",
  "/feedback-policy",
  "/corrections-policy",
  "/diversity-policy",
  "/ethics-policy",
  "/staffing-report",
]);

export function normalizePathname(url: string): string {
  let pathname = url.split("?")[0].split("#")[0];
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }
  return pathname || "/";
}

export function getCartSlugFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/golfcart\/([^/]+)$/);
  return match ? match[1] : null;
}
