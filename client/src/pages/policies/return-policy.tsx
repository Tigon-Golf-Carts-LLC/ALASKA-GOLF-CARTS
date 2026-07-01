import { SeoHead } from "@/components/seo-head";
import { PHONE_NUMBER, PHONE_TEL } from "@/lib/constants";

export default function ReturnPolicy() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <SeoHead
        title="Return Policy | Alaska Golf Carts"
        description="Return and exchange policy for golf cart purchases at Alaska Golf Carts."
        canonical="https://alaskagolfcarts.com/return-policy"
      />
      <h1 className="text-3xl font-extrabold mb-2">Return Policy</h1>
      <p className="text-muted-foreground text-sm mb-8">Last updated: June 2025</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-3">All Sales Are Final</h2>
          <p className="text-muted-foreground leading-relaxed">All golf cart sales at Alaska Golf Carts are considered final upon execution of a signed purchase agreement and receipt of payment or financing approval. Due to the nature of vehicle sales and the significant logistics involved in golf cart delivery and processing, we do not accept returns for buyer's remorse or change of mind.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Defective or Damaged Units</h2>
          <p className="text-muted-foreground leading-relaxed">If your golf cart arrives with a manufacturer defect or shipping damage that was not disclosed at the time of sale, you must notify us within 48 hours of delivery by calling <a href={PHONE_TEL} className="text-primary font-semibold hover:underline">{PHONE_NUMBER}</a>. We will work with you and the manufacturer or shipping carrier to resolve the issue through repair, replacement of the affected component, or, at our discretion, unit replacement.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Accessories & Parts</h2>
          <p className="text-muted-foreground leading-relaxed">Accessories and parts that are unused, in original packaging, and purchased within the last 30 days may be returned for store credit or exchange. Installed accessories, custom-order parts, and electrical components are non-returnable.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Deposits</h2>
          <p className="text-muted-foreground leading-relaxed">Deposits paid to hold a specific unit are non-refundable once the unit has been pulled from active inventory and reserved for the buyer. If we are unable to deliver the specific unit agreed upon, your deposit will be refunded in full.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Warranty Claims</h2>
          <p className="text-muted-foreground leading-relaxed">Warranty issues are handled through the manufacturer's warranty process. Our service team is available to assist you in filing a warranty claim with the appropriate brand. Warranty repairs do not constitute a return or refund of the purchase price.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">To discuss a return, defect claim, or warranty issue, please contact us at <a href={PHONE_TEL} className="text-primary font-semibold hover:underline">{PHONE_NUMBER}</a> and our Florida team will assist you.</p>
        </section>
      </div>
    </div>
  );
}
