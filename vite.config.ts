import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

/**
 * Sub-path the site is served from. A root deploy (custom domain, Cloudflare
 * Pages) uses "/"; a GitHub Pages *project* site is served from "/<repo>/", and
 * the deploy workflow passes that in as BASE_PATH.
 */
function resolveBase(): string {
  const raw = process.env.BASE_PATH?.trim();
  if (!raw || raw === "/") return "/";
  return `/${raw.replace(/^\/+|\/+$/g, "")}/`;
}

/**
 * Replit's dev-only plugins are optional: the repo still builds (and deploys to
 * GitHub Pages / Cloudflare) when they aren't installed.
 */
async function replitDevPlugins(): Promise<PluginOption[]> {
  if (process.env.NODE_ENV === "production" || process.env.REPL_ID === undefined) return [];

  const load = async (specifier: string, pick: (mod: any) => PluginOption): Promise<PluginOption | null> => {
    try {
      return pick(await import(/* @vite-ignore */ specifier));
    } catch {
      return null;
    }
  };

  const plugins = await Promise.all([
    load("@replit/vite-plugin-runtime-error-modal", (m) => m.default()),
    load("@replit/vite-plugin-cartographer", (m) => m.cartographer()),
    load("@replit/vite-plugin-dev-banner", (m) => m.devBanner()),
  ]);

  return plugins.filter((plugin) => plugin !== null) as PluginOption[];
}

export default defineConfig(async () => ({
  base: resolveBase(),
  plugins: [react(), ...(await replitDevPlugins())],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
}));
