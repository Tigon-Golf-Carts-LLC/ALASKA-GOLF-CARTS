/**
 * Exercises `scripts/build-data.ts` against a mock DMS API on localhost.
 *
 * The snapshot this script produces *is* the deployed inventory, so the ways it
 * can go wrong are the ways the live site can go wrong. These cases cover the
 * responses that would otherwise publish a broken site quietly: an empty
 * catalogue, a missing store list (which silently rewrites every cart URL),
 * paging that never advances, and changed response shapes.
 *
 * Run with `npm test`.
 */

import { spawn } from "child_process";
import { createServer, type Server } from "http";
import { mkdtemp, readFile, rm } from "fs/promises";
import { existsSync } from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

interface MockOptions {
  /** Pages of carts returned by /get-carts, in order. */
  pages?: unknown[][];
  stores?: unknown;
  /** Ignore pageNumber and always answer with the first page. */
  stuckPaging?: boolean;
  /** Replace the /get-carts body entirely, to test shape handling. */
  cartsBody?: unknown;
}

function startMockDMS(options: MockOptions): Promise<{ server: Server; baseUrl: string }> {
  const server = createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const send = (value: unknown) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(value));
      };

      if (req.url?.endsWith("/tigon-stores")) return send(options.stores ?? []);
      if (req.url?.endsWith("/get-cart-models")) return send([]);
      if (req.url?.endsWith("/get-cart-colors")) return send([]);

      if (req.url?.endsWith("/get-carts")) {
        if (options.cartsBody !== undefined) return send(options.cartsBody);
        const pages = options.pages ?? [[]];
        const requested = JSON.parse(body || "{}").pageNumber ?? 0;
        const index = options.stuckPaging ? 0 : requested;
        const carts = pages[index] ?? [];
        const total = pages.reduce((sum, page) => sum + page.length, 0);
        return send({ carts, totalCarts: total });
      }

      res.writeHead(404);
      res.end("{}");
    });
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const port = (server.address() as { port: number }).port;
      resolve({ server, baseUrl: `http://127.0.0.1:${port}/wp-website` });
    });
  });
}

function runBuildData(baseUrl: string, outDir: string, args: string[] = []) {
  return new Promise<{ code: number; output: string }>((resolve) => {
    const child = spawn("npx", ["tsx", "scripts/build-data.ts", ...args], {
      cwd: rootDir,
      env: { ...process.env, DMS_BASE_URL: baseUrl, DATA_OUT_DIR: outDir },
    });
    let output = "";
    child.stdout.on("data", (d) => (output += d));
    child.stderr.on("data", (d) => (output += d));
    child.on("close", (code) => resolve({ code: code ?? 1, output }));
  });
}

const store = {
  _id: "s1",
  storeId: "store1",
  name: "Alaska Golf Carts - Anchorage",
  address: { city: "Anchorage", state: "Alaska", country: "USA" },
};

function makeCart(i: number) {
  return {
    _id: `cart${i}`,
    cartType: { make: "Club Car", model: `Model ${i}`, year: "2025" },
    retailPrice: 9000 + i,
    isUsed: false,
    isElectric: true,
    cartAttributes: { cartColor: "Black", passengers: "4" },
    cartLocation: { locationId: "store1", latestStoreId: "store1" },
    imageUrls: [`cart${i}.jpg`],
  };
}

let failures = 0;

async function scenario(
  label: string,
  options: MockOptions,
  args: string[],
  assertion: (result: { code: number; output: string }, outDir: string) => Promise<string | null>
): Promise<void> {
  const { server, baseUrl } = await startMockDMS(options);
  const outDir = await mkdtemp(path.join(os.tmpdir(), "dms-snapshot-"));
  try {
    const result = await runBuildData(baseUrl, outDir, args);
    const problem = await assertion(result, outDir);
    if (problem) {
      failures++;
      console.log(`FAIL  ${label} — ${problem}`);
    } else {
      console.log(`PASS  ${label}`);
    }
  } finally {
    server.close();
    await rm(outDir, { recursive: true, force: true });
  }
}

async function main(): Promise<void> {
  await scenario(
    "a healthy catalogue is snapshotted across pages",
    { pages: [Array.from({ length: 500 }, (_, i) => makeCart(i)), [makeCart(500)]], stores: [store] },
    [],
    async (result, outDir) => {
      if (result.code !== 0) return `exited ${result.code}:\n${result.output}`;
      const carts = JSON.parse(await readFile(path.join(outDir, "carts.json"), "utf-8"));
      if (carts.length !== 501) return `expected 501 carts, got ${carts.length}`;
      const slugMap = JSON.parse(await readFile(path.join(outDir, "slug-map.json"), "utf-8"));
      if (Object.keys(slugMap.slugToId).length !== 501) return "slug map does not cover every cart";
      if (!slugMap.idToSlug.cart0.includes("anchorage-alaska")) {
        return `slug is missing store location: ${slugMap.idToSlug.cart0}`;
      }
      if (!existsSync(path.join(outDir, "carts", "cart0.json"))) return "no per-cart detail file";
      return null;
    }
  );

  await scenario(
    "an empty catalogue fails instead of publishing an empty site",
    { pages: [[]], stores: [store] },
    [],
    async (result) => {
      if (result.code === 0) return "the build succeeded on an empty catalogue";
      return /empty catalogue/.test(result.output) ? null : `unexpected error:\n${result.output}`;
    }
  );

  await scenario(
    "a missing store list fails instead of rewriting every cart URL",
    { pages: [[makeCart(1)]], stores: [] },
    [],
    async (result) => {
      if (result.code === 0) return "the build succeeded with no stores";
      return /no stores/.test(result.output) ? null : `unexpected error:\n${result.output}`;
    }
  );

  await scenario(
    "--allow-empty overrides the empty-catalogue guard",
    { pages: [[]], stores: [] },
    ["--allow-empty"],
    async (result, outDir) => {
      if (result.code !== 0) return `exited ${result.code}:\n${result.output}`;
      const carts = JSON.parse(await readFile(path.join(outDir, "carts.json"), "utf-8"));
      return carts.length === 0 ? null : `expected an empty snapshot, got ${carts.length} carts`;
    }
  );

  await scenario(
    "paging that never advances stops instead of duplicating the catalogue",
    { pages: [Array.from({ length: 500 }, (_, i) => makeCart(i))], stores: [store], stuckPaging: true },
    [],
    async (result, outDir) => {
      if (result.code !== 0) return `exited ${result.code}:\n${result.output}`;
      const carts = JSON.parse(await readFile(path.join(outDir, "carts.json"), "utf-8"));
      if (carts.length !== 500) return `expected 500 carts, got ${carts.length}`;
      const ids = new Set(carts.map((c: { _id: string }) => c._id));
      return ids.size === carts.length ? null : "the snapshot contains duplicate carts";
    }
  );

  await scenario(
    "a response with no carts array fails",
    { cartsBody: { results: [] }, stores: [store] },
    [],
    async (result) => {
      if (result.code === 0) return "the build accepted a malformed response";
      return /no "carts" array/.test(result.output) ? null : `unexpected error:\n${result.output}`;
    }
  );

  await scenario(
    "a non-array store response fails",
    { pages: [[makeCart(1)]], stores: { error: "nope" } },
    [],
    async (result) => {
      if (result.code === 0) return "the build accepted a malformed store response";
      return /did not return an array/.test(result.output) ? null : `unexpected error:\n${result.output}`;
    }
  );

  console.log(failures === 0 ? "\nAll build-data checks passed." : `\n${failures} check(s) failed.`);
  process.exit(failures === 0 ? 0 : 1);
}

main();
