import { SeoHead } from "@/components/seo-head";
import { PHONE_NUMBER, PHONE_TEL } from "@/lib/constants";

export default function DeliveryPolicy() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <SeoHead
        title="Delivery Policy | Discounted Golf Carts"
        description="Golf cart delivery policy for Discounted Golf Carts — nationwide shipping and local delivery options."
        canonical="https://discountedgolfcart.com/delivery-policy"
      />
      <h1 className="text-3xl font-extrabold mb-2">Delivery Policy</h1>
      <p className="text-muted-foreground text-sm mb-8">Last updated: June 2025</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-3">Nationwide Delivery</h2>
          <p className="text-muted-foreground leading-relaxed">Discounted Golf Carts offers delivery to any address in the continental United States. Delivery is coordinated through licensed transport carriers and our own fleet where available. Delivery costs, lead times, and logistics are discussed and agreed upon at the time of purchase. We do not ship to Alaska, Hawaii, or US territories at this time.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Local Pickup</h2>
          <p className="text-muted-foreground leading-relaxed">Customers are welcome to take delivery directly from any of our 14 retail locations. Local pickup is available by appointment during normal business hours. Please call ahead to confirm your unit is ready for pickup before traveling to the store.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Delivery Timeframes</h2>
          <p className="text-muted-foreground leading-relaxed">Estimated delivery timeframes are provided at the time of sale. Local and regional deliveries typically take 3–10 business days. Long-distance or cross-country deliveries may take 7–21 business days depending on carrier availability and route. Timeframes are estimates and are not guaranteed.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Delivery Preparation</h2>
          <p className="text-muted-foreground leading-relaxed">All golf carts are inspected and prepped prior to delivery. New carts receive a pre-delivery inspection (PDI) including battery check, tire inflation, and operational test. For electric carts, batteries will be charged to a safe transport level prior to shipping. Delivery drivers will place the unit in your driveway or designated area; they are not responsible for interior placement.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Receiving Your Delivery</h2>
          <p className="text-muted-foreground leading-relaxed">An adult (18+) must be present to receive and sign for the delivery. Upon receipt, please inspect the cart carefully for any shipping damage before signing the delivery receipt. If damage is noted, document it on the delivery paperwork and contact us immediately at <a href={PHONE_TEL} className="text-primary font-semibold hover:underline">{PHONE_NUMBER}</a>. Signing without noting damage may affect damage claims.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Delivery Costs</h2>
          <p className="text-muted-foreground leading-relaxed">Delivery fees vary by distance and are quoted at the time of sale. In some promotions, free or subsidized delivery may be available. Delivery fees are non-refundable once the unit has been dispatched.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Questions</h2>
          <p className="text-muted-foreground leading-relaxed">For delivery inquiries, call us at <a href={PHONE_TEL} className="text-primary font-semibold hover:underline">{PHONE_NUMBER}</a>.</p>
        </section>
      </div>
    </div>
  );
}
