import { SeoHead } from "@/components/seo-head";
import { PHONE_NUMBER, PHONE_TEL } from "@/lib/constants";

export default function StoragePolicy() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <SeoHead
        title="Storage Policy | Discounted Golf Carts"
        description="Golf cart storage terms and conditions at Discounted Golf Carts."
        canonical="https://discountedgolfcart.com/storage-policy"
      />
      <h1 className="text-3xl font-extrabold mb-2">Storage Policy</h1>
      <p className="text-muted-foreground text-sm mb-8">Last updated: June 2025</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-3">Storage Services</h2>
          <p className="text-muted-foreground leading-relaxed">Discounted Golf Carts offers seasonal and short-term golf cart storage at select locations. Storage availability, rates, and duration options vary by location. Contact us at <a href={PHONE_TEL} className="text-primary font-semibold hover:underline">{PHONE_NUMBER}</a> to inquire about storage at your nearest location.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Storage Agreement</h2>
          <p className="text-muted-foreground leading-relaxed">All storage arrangements require a signed storage agreement detailing the storage period, monthly rate, and terms of access. Storage fees are billed in advance on a monthly basis. Discounted Golf Carts reserves the right to adjust storage rates with 30 days' written notice.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Cart Condition at Drop-Off</h2>
          <p className="text-muted-foreground leading-relaxed">Customers are responsible for delivering their cart in a reasonably clean condition. For electric carts, batteries must be in acceptable working condition. Carts with significant damage, pest infestations, or hazardous materials may be refused for storage.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">While In Storage</h2>
          <p className="text-muted-foreground leading-relaxed">During storage, Discounted Golf Carts will maintain battery trickle charging for electric units (where applicable) to preserve battery health. We are not responsible for battery degradation due to age or pre-existing condition. Physical access to stored units during the storage period is by appointment only.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Liability</h2>
          <p className="text-muted-foreground leading-relaxed">While we take reasonable precautions to secure stored vehicles, Discounted Golf Carts' liability for loss or damage during storage is limited to the agreed storage fee paid for the current storage period. Customers are strongly encouraged to maintain their own insurance coverage on stored units.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Retrieval & Abandonment</h2>
          <p className="text-muted-foreground leading-relaxed">Storage customers must retrieve their unit by the end of the agreed storage period. Units not retrieved within 14 days of notice of storage period expiration may be subject to additional fees. Units abandoned for 90+ days with no payment and no response to notices may be disposed of in accordance with applicable state law.</p>
        </section>
      </div>
    </div>
  );
}
