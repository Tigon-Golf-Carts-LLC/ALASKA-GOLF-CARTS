import { useId, useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  HONEYPOT_FIELD,
  LEAD_FORM_NAME,
  submitLead,
  validateLead,
  type LeadErrors,
} from "@/lib/lead";

/** The cart a lead is about, sent so the lead shows exactly which cart was asked about. */
export interface LeadCart {
  brand: string;
  model: string;
  vin: string;
  sku: string;
  /** Shown to the visitor, e.g. "2024 EVOLUTION Classic 4 Pro Red". */
  title: string;
}

interface LeadFormProps {
  cart?: LeadCart;
  submitLabel?: string;
}

const SUCCESS_TEXT = "Thank you! We received your message and will contact you shortly.";
const PHOTO_ACCEPT = "image/*,.heic,.heif";

/**
 * Label, control and error for one field. Defined at module level so React
 * keeps the same inputs mounted between renders — the form is uncontrolled.
 */
function Field({
  id,
  label,
  error,
  required,
  half,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  half?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${half ? "sm:col-span-1" : "sm:col-span-2"}`}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-xs font-medium text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function LeadForm({ cart, submitLabel = "Send Message" }: LeadFormProps) {
  const idPrefix = useId();
  const [errors, setErrors] = useState<LeadErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const fieldId = (name: string) => `${idPrefix}-${name}`;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const found = validateLead(form);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      setStatus("error");
      setMessage("Please fix the highlighted fields.");
      (form.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus();
      return;
    }

    setStatus("sending");
    setMessage("Sending…");
    try {
      await submitLead(form);
      form.reset();
      setStatus("sent");
      setMessage(SUCCESS_TEXT);
    } catch (error) {
      setStatus("error");
      setMessage((error as Error).message);
    }
  }

  const fieldProps = (name: string) => ({ id: fieldId(name), error: errors[name] });

  const inputProps = (name: string) => ({
    id: fieldId(name),
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${fieldId(name)}-error` : undefined,
  });

  const sending = status === "sending";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      encType="multipart/form-data"
      className="relative space-y-4"
      data-testid="form-lead"
    >
      {cart && (
        <div className="rounded-md border bg-muted/40 px-4 py-3 text-sm" data-testid="text-lead-cart">
          <p className="text-muted-foreground">You're asking about</p>
          <p className="font-semibold">{cart.title}</p>
          {cart.vin && <p className="text-xs text-muted-foreground">VIN {cart.vin}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field {...fieldProps("first_name")} label="First name" required half>
          <Input {...inputProps("first_name")} type="text" autoComplete="given-name" required />
        </Field>
        <Field {...fieldProps("last_name")} label="Last name" required half>
          <Input {...inputProps("last_name")} type="text" autoComplete="family-name" required />
        </Field>
        <Field {...fieldProps("email")} label="Email" required half>
          <Input {...inputProps("email")} type="email" autoComplete="email" required />
        </Field>
        <Field {...fieldProps("phone1")} label="Phone" required half>
          <Input {...inputProps("phone1")} type="tel" autoComplete="tel" required />
        </Field>
        <Field {...fieldProps("phone2")} label="Alternate phone" half>
          <Input {...inputProps("phone2")} type="tel" />
        </Field>
        <Field {...fieldProps("zip_code")} label="ZIP code" half>
          <Input {...inputProps("zip_code")} type="text" inputMode="numeric" autoComplete="postal-code" />
        </Field>
        <Field {...fieldProps("address")} label="Address">
          <Input {...inputProps("address")} type="text" autoComplete="street-address" />
        </Field>

        {cart ? (
          // Pre-filled from the cart on this page so the lead names it exactly.
          <>
            <input type="hidden" name="brand" value={cart.brand} />
            <input type="hidden" name="model" value={cart.model} />
            <input type="hidden" name="vin_number" value={cart.vin} />
            <input type="hidden" name="sku_number" value={cart.sku} />
          </>
        ) : (
          <>
            <Field {...fieldProps("brand")} label="Brand" half>
              <Input {...inputProps("brand")} type="text" placeholder="e.g. EVOLUTION" />
            </Field>
            <Field {...fieldProps("model")} label="Model" half>
              <Input {...inputProps("model")} type="text" placeholder="Model you're interested in" />
            </Field>
            <Field {...fieldProps("vin_number")} label="VIN (optional)" half>
              <Input {...inputProps("vin_number")} type="text" />
            </Field>
            <Field {...fieldProps("sku_number")} label="Stock # / SKU (optional)" half>
              <Input {...inputProps("sku_number")} type="text" />
            </Field>
          </>
        )}

        <Field {...fieldProps("comments")} label="Message">
          <Textarea
            {...inputProps("comments")}
            rows={4}
            placeholder={cart ? "Is this cart still available? Any questions?" : "How can we help?"}
          />
        </Field>

        {(["image_1", "image_2", "image_3"] as const).map((name, i) => (
          <Field key={name} {...fieldProps(name)} label={`Photo ${i + 1} (optional)`}>
            <Input {...inputProps(name)} type="file" accept={PHOTO_ACCEPT} className="cursor-pointer" />
          </Field>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Photos: JPG, PNG, GIF, WEBP or HEIC, up to 10 MB each.</p>

      {/* Spam trap: kept off-screen rather than display:none, so bots still fill it. Do not remove. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>
        <label htmlFor={fieldId(HONEYPOT_FIELD)}>Leave this field empty</label>
        <input type="text" id={fieldId(HONEYPOT_FIELD)} name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      {/* Tracking fields; the real values are read when the form is sent. */}
      <input type="hidden" name="form_name" value={LEAD_FORM_NAME} />
      {["url", "referrer", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "ga_client_id"].map(
        (name) => (
          <input key={name} type="hidden" name={name} defaultValue="" />
        )
      )}

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={sending} data-testid="button-lead-submit">
        {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
        {sending ? "Sending…" : submitLabel}
      </Button>

      <p
        role="status"
        aria-live="polite"
        className={`text-sm font-semibold ${status === "error" ? "text-destructive" : "text-primary"}`}
        data-testid="text-lead-status"
      >
        {status === "sent" && <CheckCircle2 className="inline h-4 w-4 mr-1 -mt-0.5" />}
        {status === "idle" ? "" : message}
      </p>
    </form>
  );
}
