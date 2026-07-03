import { SeoHead } from "@/components/seo-head";
import { PHONE_NUMBER, PHONE_TEL } from "@/lib/constants";
import { POLICY_ROUTES, SITE_URL } from "@shared/seo-routes";

const meta = POLICY_ROUTES["/corrections-policy"];

export default function CorrectionsPolicy() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <SeoHead
        title={meta.title}
        description={meta.description}
        canonical={`${SITE_URL}/corrections-policy`}
      />
      <h1 className="text-3xl font-extrabold mb-2">Corrections Policy</h1>
      <p className="text-muted-foreground text-sm mb-8">Last updated: June 2025</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-3">Commitment to Accuracy</h2>
          <p className="text-muted-foreground leading-relaxed">Alaska Golf Carts is committed to providing accurate, current, and complete information on alaskagolfcarts.com. When errors occur — whether in pricing, inventory details, policy language, or other content — we are committed to correcting them promptly and transparently.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Pricing Errors</h2>
          <p className="text-muted-foreground leading-relaxed">In the event of a pricing error on a listed unit or product, Alaska Golf Carts reserves the right to correct the price without prior notice. We are not obligated to honor a clearly erroneous price. If a purchase was made based on an incorrect price, we will contact the buyer directly to discuss the correct pricing or offer a full refund of any deposit paid.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Inventory Errors</h2>
          <p className="text-muted-foreground leading-relaxed">Inventory is updated nightly from our DMS. Occasionally, units may appear as available after being sold, or specifications may reflect pre-production data. If you identify an inventory listing error, please call <a href={PHONE_TEL} className="text-primary font-semibold hover:underline">{PHONE_NUMBER}</a> and we will verify current availability and correct the listing.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Policy & Content Errors</h2>
          <p className="text-muted-foreground leading-relaxed">If you believe any policy, informational page, or other content on this website contains a factual error, please notify us. Confirmed errors will be corrected within 5 business days. Material corrections to policy language will be noted with an updated "Last updated" date.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">How to Report an Error</h2>
          <p className="text-muted-foreground leading-relaxed">To report any error on alaskagolfcarts.com, call us at <a href={PHONE_TEL} className="text-primary font-semibold hover:underline">{PHONE_NUMBER}</a> or speak with a member of our Florida team. We appreciate you helping us maintain a high standard of accuracy.</p>
        </section>
      </div>
    </div>
  );
}
