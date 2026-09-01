/**
 * Checks that the photos the site links to actually exist in the S3 bucket.
 *
 * Carts carry photos in two fields and it matters which one is publicly
 * hosted: `imageUrls` (what the DMS WordPress bridge publishes) and
 * `internalCartImageUrls` (photos taken in-house). A filename present in the
 * feed is not proof the object exists at the public URL, and a broken URL looks
 * identical to a missing photo on the site — both render the placeholder — so
 * the only way to tell them apart is to ask the bucket.
 *
 * Reads the snapshot written by `scripts/build-data.ts`. Diagnostic only: it
 * reports and never fails a build.
 *
 * Run with `npm run check:images`.
 */

import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { S3_CARTS_BASE, type AnyCart } from "../shared/cart-data";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = process.env.DATA_OUT_DIR
  ? path.resolve(process.env.DATA_OUT_DIR)
  : path.join(rootDir, "client", "public", "data");

/** Carts sampled per field. Enough to be conclusive without hammering S3. */
const SAMPLE_SIZE = Number(process.env.IMAGE_SAMPLE_SIZE || 12);
const CONCURRENCY = 6;

type Field = "imageUrls" | "internalCartImageUrls";

interface Probe {
  cartId: string;
  url: string;
  status: number | string;
}

function toUrl(file: string): string {
  return file.startsWith("http") ? file : `${S3_CARTS_BASE}${file}`;
}

async function head(url: string): Promise<number | string> {
  try {
    const response = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(20_000) });
    return response.status;
  } catch (error) {
    return (error as Error).name === "TimeoutError" ? "timeout" : "unreachable";
  }
}

async function probeField(carts: AnyCart[], field: Field): Promise<Probe[]> {
  const candidates = carts
    .filter((cart) => Array.isArray(cart?.[field]) && cart[field].length > 0)
    .slice(0, SAMPLE_SIZE)
    .map((cart) => ({ cartId: String(cart._id), url: toUrl(cart[field][0]) }));

  const results: Probe[] = [];
  for (let i = 0; i < candidates.length; i += CONCURRENCY) {
    const batch = candidates.slice(i, i + CONCURRENCY);
    const statuses = await Promise.all(batch.map((c) => head(c.url)));
    batch.forEach((c, n) => results.push({ ...c, status: statuses[n] }));
  }
  return results;
}

function summarize(field: Field, probes: Probe[]): boolean {
  if (probes.length === 0) {
    console.log(`\n${field}: no carts carry this field`);
    return true;
  }

  const ok = probes.filter((p) => p.status === 200);
  console.log(`\n${field}: ${ok.length}/${probes.length} sampled photos exist in the bucket`);

  const byStatus = new Map<number | string, number>();
  for (const probe of probes) byStatus.set(probe.status, (byStatus.get(probe.status) ?? 0) + 1);
  for (const [status, count] of Array.from(byStatus.entries())) {
    console.log(`  HTTP ${status}: ${count}`);
  }

  for (const probe of probes.slice(0, 3)) {
    console.log(`  e.g. ${probe.status}  ${probe.url}`);
  }
  const broken = probes.find((p) => p.status !== 200);
  if (broken && !probes.slice(0, 3).includes(broken)) {
    console.log(`  e.g. ${broken.status}  ${broken.url}`);
  }

  return ok.length === probes.length;
}

async function main(): Promise<void> {
  const file = path.join(dataDir, "carts.json");
  if (!existsSync(file)) {
    throw new Error(`no snapshot at ${path.relative(rootDir, file)} — run "npm run build:data" first`);
  }
  const carts: AnyCart[] = JSON.parse(await readFile(file, "utf-8"));
  console.log(`probing image URLs for ${carts.length} carts (sample of ${SAMPLE_SIZE} per field)`);

  const manufacturer = summarize("imageUrls", await probeField(carts, "imageUrls"));
  const dealer = summarize(
    "internalCartImageUrls",
    await probeField(carts, "internalCartImageUrls")
  );

  console.log("");
  if (manufacturer && dealer) {
    console.log("Both fields resolve in the bucket — either is safe to display.");
  } else if (manufacturer && !dealer) {
    console.log(
      "Only imageUrls resolves. internalCartImageUrls is NOT publicly hosted at this path, " +
        "so displaying it would show broken images. Prefer imageUrls."
    );
  } else if (!manufacturer && dealer) {
    console.log("Only internalCartImageUrls resolves. Prefer it over imageUrls.");
  } else {
    console.log("Neither field resolves — check the bucket URL itself, not the field choice.");
  }
}

main().catch((error) => {
  console.error("image check failed:", error);
  process.exit(1);
});
