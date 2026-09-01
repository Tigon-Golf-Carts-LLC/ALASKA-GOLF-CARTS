import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { DATA_MODE, resolveStaticRequest } from "./static-api";

/**
 * Prefixes an app-relative path with Vite's base so requests still resolve when
 * the site is served from a sub-path (a GitHub Pages project site).
 */
function withBase(url: string): string {
  if (!url.startsWith("/")) return url;
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  return `${base}${url}`;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Runs an API call against whichever backend this build targets: the prebuilt
 * static snapshot, or a live `/api/*` server.
 */
async function requestJson(url: string, method: string = "GET", data?: unknown): Promise<any> {
  if (DATA_MODE === "static" && url.startsWith("/api/")) {
    return resolveStaticRequest(url, method, data);
  }

  const res = await fetch(withBase(url), {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res.json();
}

/**
 * Kept for callers that expect a `Response`-like object with `.json()`. In
 * static mode nothing is fetched over the wire, so the result is wrapped to
 * match the old shape.
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<{ json: () => Promise<any> }> {
  const payload = await requestJson(url, method, data);
  return { json: async () => payload };
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      return await requestJson(queryKey.join("/"));
    } catch (error) {
      if (unauthorizedBehavior === "returnNull" && (error as Error).message?.startsWith("401")) {
        return null;
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
