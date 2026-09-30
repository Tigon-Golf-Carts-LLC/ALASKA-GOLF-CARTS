/**
 * Sends website leads to TIGON IOT ("Webhook Flows").
 *
 * Where a lead goes is decided at build time, and the webhook URL is never
 * committed to this repository:
 *
 *   - `VITE_LEAD_ENDPOINT` set (GitHub Pages: injected from the
 *     `TIGON_WEBHOOK_URL` Actions secret) → the browser posts straight to the
 *     webhook. A static host has no server, so the URL does end up in the
 *     built JavaScript; it is kept out of source control only.
 *   - unset → the browser posts to `/api/lead`, and the server (Express or the
 *     Cloudflare Pages Function) relays it signed with the webhook's secret.
 *     The URL and secret then never reach the browser at all.
 */

export const LEAD_FORM_NAME = "Contact form";

/** Spam trap: an off-screen input real visitors never fill in. */
export const HONEYPOT_FIELD = "website";

export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const PHOTO_FIELDS = ["image_1", "image_2", "image_3"] as const;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/heic", "image/heif"];
const PHOTO_EXTENSIONS = /\.(jpe?g|png|gif|webp|heic|heif)$/i;

const FIRST_TOUCH_FIELDS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
] as const;
const FIRST_TOUCH_KEY = "tigon_first_touch";
const FIRST_TOUCH_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function leadEndpoint(): string {
  const direct = (import.meta.env.VITE_LEAD_ENDPOINT as string | undefined)?.trim();
  if (direct) return direct;
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  return `${base}/api/lead`;
}

/**
 * First-touch attribution: the first utm_* / gclid / fbclid values seen are
 * kept for 30 days and sent with every lead in that window.
 */
function readFirstTouch(): Record<string, string> {
  const current: Record<string, string> = {};
  let found = false;
  const query = new URLSearchParams(window.location.search);
  for (const key of FIRST_TOUCH_FIELDS) {
    const value = query.get(key);
    if (value) {
      current[key] = value;
      found = true;
    }
  }

  let saved: { ts?: number; v?: Record<string, string> } | null = null;
  try {
    saved = JSON.parse(window.localStorage.getItem(FIRST_TOUCH_KEY) || "null");
  } catch {
    saved = null;
  }
  if (saved && (!saved.ts || Date.now() - saved.ts > FIRST_TOUCH_MAX_AGE_MS)) saved = null;
  if (!saved && found) {
    saved = { ts: Date.now(), v: current };
    try {
      window.localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(saved));
    } catch {
      // Private browsing or storage disabled: still send this visit's values.
    }
  }

  const out: Record<string, string> = {};
  for (const key of FIRST_TOUCH_FIELDS) out[key] = saved?.v?.[key] || current[key] || "";
  return out;
}

/** Records UTM tags from the landing page, before the visitor navigates away from it. */
export function captureFirstTouch(): void {
  try {
    readFirstTouch();
  } catch {
    // Attribution is best-effort.
  }
}

/** GA4 client id from the `_ga` cookie: "GA1.1.123456.789012" → "123456.789012". */
function gaClientId(): string {
  const match = document.cookie.match(/(?:^|;\s*)_ga=([^;]+)/);
  if (!match) return "";
  const parts = decodeURIComponent(match[1]).split(".");
  return parts.length >= 4 ? parts.slice(-2).join(".") : "";
}

function trackingFields(): Record<string, string> {
  return {
    ...readFirstTouch(),
    url: window.location.href,
    referrer: document.referrer || "",
    ga_client_id: gaClientId(),
  };
}

export type LeadErrors = Partial<Record<string, string>>;

function isAllowedPhoto(file: File): boolean {
  return PHOTO_TYPES.includes(file.type.toLowerCase()) || PHOTO_EXTENSIONS.test(file.name);
}

/** Friendly, per-field messages; an empty object means the form can be sent. */
export function validateLead(form: HTMLFormElement): LeadErrors {
  const errors: LeadErrors = {};
  const value = (name: string) =>
    ((form.elements.namedItem(name) as HTMLInputElement | null)?.value || "").trim();

  if (!value("first_name")) errors.first_name = "Please enter your first name.";
  if (!value("last_name")) errors.last_name = "Please enter your last name.";

  const email = value("email");
  if (!email) errors.email = "Please enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = "Please enter a valid email address.";

  const phoneDigits = value("phone1").replace(/\D/g, "");
  if (!phoneDigits) errors.phone1 = "Please enter your phone number.";
  else if (phoneDigits.length < 10) errors.phone1 = "Please enter a phone number with at least 10 digits.";

  const phone2Digits = value("phone2").replace(/\D/g, "");
  if (phone2Digits && phone2Digits.length < 10) {
    errors.phone2 = "Please enter an alternate phone number with at least 10 digits, or leave it blank.";
  }

  for (const name of PHOTO_FIELDS) {
    const file = (form.elements.namedItem(name) as HTMLInputElement | null)?.files?.[0];
    if (!file) continue;
    if (!isAllowedPhoto(file)) errors[name] = "Photos must be JPG, PNG, GIF, WEBP or HEIC.";
    else if (file.size > MAX_PHOTO_BYTES) errors[name] = "Each photo must be smaller than 10 MB.";
  }

  return errors;
}

function buildLeadData(form: HTMLFormElement): FormData {
  const data = new FormData(form);
  // Leave out empty file inputs so no blank images are sent.
  for (const name of PHOTO_FIELDS) {
    const file = data.get(name);
    if (!(file instanceof File) || file.size === 0 || !file.name) data.delete(name);
  }
  // Tracking is read at send time so it reflects this exact page view.
  for (const [key, value] of Object.entries(trackingFields())) data.set(key, value);
  data.set("form_name", LEAD_FORM_NAME);
  if (!data.has(HONEYPOT_FIELD)) data.set(HONEYPOT_FIELD, "");
  return data;
}

const GENERIC_ERROR = "Sorry, something went wrong. Please try again or call us.";

export async function submitLead(form: HTMLFormElement): Promise<void> {
  let response: Response;
  try {
    response = await fetch(leadEndpoint(), { method: "POST", body: buildLeadData(form), mode: "cors" });
  } catch {
    throw new Error(GENERIC_ERROR);
  }

  if (response.status === 429) {
    throw new Error("Too many attempts. Please wait a minute and try again.");
  }

  let data: { ok?: boolean; error?: string; message?: string } | null = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  if (!response.ok || data?.ok === false) {
    throw new Error(data?.error || data?.message || GENERIC_ERROR);
  }
}
