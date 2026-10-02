/**
 * Tests for `shared/lead-relay.ts`, the server-side relay that signs website
 * leads for the TIGON IOT webhook.
 *
 * Runs a local mock webhook, so it needs no network and no real credentials.
 *
 * Run with `npm test`.
 */

import { createHmac } from "crypto";
import { createServer, type IncomingMessage } from "http";
import type { AddressInfo } from "net";
import { relayLead, signLeadBody } from "../shared/lead-relay";

let failures = 0;
function check(name: string, ok: boolean, detail?: unknown): void {
  if (ok) {
    console.log(`  ok  ${name}`);
  } else {
    failures++;
    console.error(`  FAIL ${name}`, detail ?? "");
  }
}

interface Received {
  headers: IncomingMessage["headers"];
  body: Buffer;
}

async function main(): Promise<void> {
  const received: Received[] = [];
  let reply: { status: number; body: string } = { status: 200, body: '{"ok":true,"id":"lead_1"}' };

  const server = createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      received.push({ headers: req.headers, body: Buffer.concat(chunks) });
      res.writeHead(reply.status, { "Content-Type": "application/json" });
      res.end(reply.body);
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const endpoint = `http://127.0.0.1:${(server.address() as AddressInfo).port}/hooks/test-key`;
  const secret = "test-secret";

  try {
    // A real multipart body, exactly as a browser would send it.
    const form = new FormData();
    form.set("form_name", "Contact form");
    form.set("first_name", "Jane");
    form.set("website", "");
    form.set("image_1", new Blob([new Uint8Array([0xff, 0xd8, 0xff])], { type: "image/jpeg" }), "cart.jpg");
    const encoded = new Response(form);
    const contentType = encoded.headers.get("Content-Type")!;
    const body = new Uint8Array(await encoded.arrayBuffer());

    const signed = await relayLead(
      { endpoint, secret },
      { body, contentType, clientIp: "203.0.113.7", userAgent: "TestAgent/1.0" }
    );
    const hit = received.at(-1)!;
    const expected = "sha256=" + createHmac("sha256", secret).update(Buffer.from(body)).digest("hex");
    check("passes the webhook's JSON answer through", signed.status === 200 && JSON.parse(signed.body).id === "lead_1", signed);
    check("forwards the body byte-for-byte", Buffer.compare(hit.body, Buffer.from(body)) === 0);
    check("keeps the multipart boundary", hit.headers["content-type"] === contentType, hit.headers["content-type"]);
    check("signs the exact raw body with HMAC-SHA256", hit.headers["x-tigon-signature"] === expected, hit.headers["x-tigon-signature"]);
    check("signLeadBody matches node's HMAC", (await signLeadBody(body, secret)) === expected);
    check("forwards the visitor's IP", hit.headers["x-forwarded-for"] === "203.0.113.7");
    check("forwards the visitor's browser", hit.headers["user-agent"] === "TestAgent/1.0");

    const unsigned = await relayLead({ endpoint }, { body, contentType });
    check("sends unsigned when no secret is configured", unsigned.status === 200 && !received.at(-1)!.headers["x-tigon-signature"]);

    reply = { status: 429, body: '{"ok":false,"error":"Too many requests"}' };
    const limited = await relayLead({ endpoint, secret }, { body, contentType });
    check("passes rate limiting through", limited.status === 429 && JSON.parse(limited.body).error === "Too many requests", limited);

    reply = { status: 500, body: "<html>oops</html>" };
    const broken = await relayLead({ endpoint, secret }, { body, contentType });
    check("turns a non-JSON failure into a friendly JSON error", broken.status === 502 && JSON.parse(broken.body).ok === false, broken);

    const before = received.length;
    const missing = await relayLead({}, { body, contentType });
    check("refuses when the webhook URL is not configured", missing.status === 503 && received.length === before, missing);

    const wrongType = await relayLead({ endpoint, secret }, { body, contentType: "text/plain" });
    check("rejects unexpected content types", wrongType.status === 415 && received.length === before, wrongType);

    const huge = await relayLead({ endpoint, secret }, { body: new Uint8Array(33 * 1024 * 1024), contentType });
    check("rejects oversized bodies without forwarding", huge.status === 413 && received.length === before, huge.status);

    const unreachable = await relayLead(
      { endpoint: "http://127.0.0.1:1/hooks/x", secret },
      { body, contentType }
    );
    check("reports an unreachable webhook as 502", unreachable.status === 502, unreachable);
  } finally {
    server.close();
  }

  if (failures > 0) {
    console.error(`\n${failures} lead relay check(s) failed`);
    process.exit(1);
  }
  console.log("\nlead relay: all checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
