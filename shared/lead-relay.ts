/**
 * Server-side relay for website leads to the TIGON IOT webhook ("Webhook
 * Flows").
 *
 * The webhook URL carries a key that works like a password, and the signing
 * secret must never reach a browser. When the site runs with a server (the
 * Express dev server or the Cloudflare Pages Function), the form posts to
 * `/api/lead` instead and this forwards the exact bytes it received, signed with
 * `X-Tigon-Signature: sha256=<hex HMAC-SHA256 of the raw body>`.
 *
 * Uses only Web Crypto and fetch, so the same code runs in Node 20 and on
 * Cloudflare's edge.
 */

export interface LeadRelayConfig {
  /** Full webhook URL, e.g. https://tigoniot.com/hooks/<key>. From server env only. */
  endpoint?: string;
  /** This webhook's own signing secret. From server env only. */
  secret?: string;
}

export interface LeadRelayRequest {
  body: ArrayBuffer | Uint8Array;
  contentType: string;
  clientIp?: string;
  userAgent?: string;
}

export interface LeadRelayResult {
  status: number;
  /** JSON text to hand back to the browser. */
  body: string;
}

/** Photos are capped at 10 MB each, three of them, plus the text fields. */
export const MAX_LEAD_BODY_BYTES = 32 * 1024 * 1024;

const ALLOWED_CONTENT_TYPES = [
  "multipart/form-data",
  "application/x-www-form-urlencoded",
  "application/json",
];

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function signLeadBody(body: Uint8Array, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return `sha256=${toHex(await crypto.subtle.sign("HMAC", key, body))}`;
}

function result(status: number, value: unknown): LeadRelayResult {
  return { status, body: JSON.stringify(value) };
}

export async function relayLead(
  config: LeadRelayConfig,
  request: LeadRelayRequest
): Promise<LeadRelayResult> {
  if (!config.endpoint) {
    console.error("lead relay: TIGON_WEBHOOK_URL is not set");
    return result(503, { ok: false, error: "Our contact form is temporarily unavailable. Please call us." });
  }

  const contentType = request.contentType || "";
  if (!ALLOWED_CONTENT_TYPES.some((type) => contentType.toLowerCase().startsWith(type))) {
    return result(415, { ok: false, error: "Unsupported form encoding." });
  }

  const body = request.body instanceof Uint8Array ? request.body : new Uint8Array(request.body);
  if (body.byteLength > MAX_LEAD_BODY_BYTES) {
    return result(413, { ok: false, error: "Your photos are too large. Each photo must be smaller than 10 MB." });
  }

  // The signature covers the exact bytes sent, so forward them untouched —
  // including the multipart boundary in the Content-Type.
  const headers: Record<string, string> = { "Content-Type": contentType };
  if (config.secret) headers["X-Tigon-Signature"] = await signLeadBody(body, config.secret);
  if (request.clientIp) headers["X-Forwarded-For"] = request.clientIp;
  if (request.userAgent) headers["User-Agent"] = request.userAgent;

  let response: Response;
  try {
    response = await fetch(config.endpoint, { method: "POST", headers, body });
  } catch (error) {
    console.error("lead relay: webhook unreachable:", error);
    return result(502, { ok: false, error: "We couldn't send your message. Please try again or call us." });
  }

  const text = await response.text();
  try {
    JSON.parse(text);
    return { status: response.status, body: text };
  } catch {
    console.error(`lead relay: webhook answered ${response.status} with a non-JSON body`);
    return response.ok
      ? result(200, { ok: true })
      : result(502, { ok: false, error: "We couldn't send your message. Please try again or call us." });
  }
}
